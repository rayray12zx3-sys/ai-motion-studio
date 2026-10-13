/** Isolated free Canvas+verified FFmpeg 8s full film, never production default. */
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import ffprobe from 'ffprobe-static';
import {SPEC,makeDeviceTexture,paintFrame,cameraAt} from './canvas-phone-camera.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const checkin=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const out=join(ROOT,'out','snapcn-canvas-camera');
if(existsSync(out))throw Error('Refuse to overwrite candidate output');
const bin=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
  process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const EXPECTED={'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99',
  'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00'};
const hash=b=>createHash('sha256').update(b).digest('hex');
if(hash(readFileSync(bin))!==EXPECTED[`${process.platform}-${process.arch}`])
 throw Error('Verified ffmpeg binary required, do not silently use installed ffmpeg');
mkdirSync(out,{recursive:true});
const target=join(out,'AMSAtlasCanvasMotion.mp4');
const child=spawn(bin,['-hide_banner','-loglevel','error','-nostdin','-y',
'-f','rawvideo','-pixel_format','rgba','-video_size',`${SPEC.width}x${SPEC.height}`,
'-framerate',String(SPEC.fps),'-i','pipe:0','-an','-c:v','libx264',
'-preset','medium','-crf','18','-threads','1','-pix_fmt','yuv420p',
'-movflags','+faststart','-map_metadata','-1',target],{stdio:['pipe','ignore','pipe']});
let stderr='';
child.stderr.on('data',x=>{stderr+=x.toString()});
const closed=new Promise((res,rej)=>{child.on('error',rej);
 child.on('close',code=>code===0?res():rej(Error('encode '+code+': '+stderr.slice(-1500))))});
closed.catch(()=>{});
child.stdin.on('error',()=>{});
const texture=await makeDeviceTexture();
const reviewed=[0,30,80,120,175,239];
const hashes=[];
try{
 for(let frame=0;frame<SPEC.frames;frame++){
  const c=paintFrame(frame,texture);
  const data=Buffer.from(c.getContext('2d').getImageData(0,0,SPEC.width,SPEC.height).data);
  hashes.push(hash(data));
  if(reviewed.includes(frame))writeFileSync(join(out,`review-${String(frame).padStart(3,'0')}.png`),c.toBuffer('image/png'));
  if(!child.stdin.write(data))await Promise.race([once(child.stdin,'drain'),
    closed.then(()=>{throw Error('ffmpeg exited before streaming all frames')})]);
  if(frame%60===0)console.log('encoded frame',frame);
 }
 child.stdin.end();await closed;
}catch(e){child.kill();await closed.catch(()=>{});throw e;}
const raw=JSON.parse(execFileSync(ffprobe.path,['-v','error','-count_frames','-show_streams',
'-show_format','-of','json',target],{encoding:'utf8'}));
const v=raw.streams.find(s=>s.codec_type==='video');
if(!v||v.codec_name!=='h264'||v.width!==SPEC.width||v.height!==SPEC.height||
 Number(v.nb_read_frames)!==SPEC.frames)throw Error('Actual MP4 decoded-frame QC failed');
const p={schema:'snapcn-canvas-camera-transfer-rnd-v1',source_commit:checkin,
 source_upstream:'shadcn-labs/snapcn@afce9f0aa8c9d464409efd1e4d4f227ca4809c04',
 source_license:'MIT; Copyright (c) 2026 Sri Nath (snap-cn)',
 engine:'existing-locked-Canvas-and-verified-FFmpeg',renderer:'experimental-plane-mesh',
 fps:SPEC.fps,frames:SPEC.frames,width:SPEC.width,height:SPEC.height,
 codec:v.codec_name,video_sha256:hash(readFileSync(target)),
 frame_samples_sha256:reviewed.map(f=>({frame:f,sha256:hashes[f],pose:cameraAt(f)})),
 technical_qc:'PASS',artistic_quality:'PENDING_HUMAN',native_parity:'NOT_PROVEN',
 commercial_remotion_use:'NONE',new_root_dependencies:0,
 input:'FICTIONAL_ORIGINAL_UI_ONLY',permission:'ISOLATED_BENCHMARK_ONLY'};
writeFileSync(join(out,'review-evidence.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({frames:p.frames,sha256:p.video_sha256,quality:p.artistic_quality}));
