import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import probe from 'ffprobe-static';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {fontManifest} from '../src/free/scene.mjs';
import {displayFontManifest} from '../src/creative/display-font.mjs';
import {loadAdvancedArt,drawAdvancedFrame,validateAdvancedSpec} from '../src/creative/advanced.mjs';
import {compileMotionBrief} from '../src/creative/brief.mjs';
import {compileRegisteredTemplate} from '../src/creative/template-registry.mjs';
import {verifyNoAttributionCreativeAssets} from '../src/creative/output-rights.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if (process.argv.length>6) throw new Error('Unexpected advanced render arguments');
const profileName=process.argv[2]??'landscape';
const profileSizes={landscape:[1920,1080],vertical:[1080,1920]};
if (!Object.hasOwn(profileSizes,profileName)) throw new Error('Unknown advanced render profile');
const specPath=resolve(process.argv[3]??'examples/advanced-film.json');
const supplied=JSON.parse(readFileSync(specPath,'utf8'));
const isBrief=supplied?.kind==='motion-brief-v1';
if(isBrief&&!/^brief-[a-z0-9-]+\.json$/.test(specPath.split(/[\\/]/).at(-1)))
  throw new Error('Invalid brief file');
const templatePath=resolve('examples/advanced-film.json');
const selected=process.argv[5];
if(selected&&!isBrief)throw new Error('Template ID requires motion brief input');
const base=JSON.parse(readFileSync(templatePath,'utf8'));
const spec=selected?compileRegisteredTemplate(supplied,base,
  JSON.parse(readFileSync('templates/registry.json','utf8')),selected):
  isBrief?compileMotionBrief(supplied,base):supplied;
validateAdvancedSpec(spec);
const usage=verifyNoAttributionCreativeAssets(spec);
const [width,height]=profileSizes[profileName];
const profile={width,height,fps:30,frames:spec.motion.duration_frames};
const outputKey=process.argv[4]??'advanced-'+profileName;
if (!/^advanced-[a-z0-9][a-z0-9-]{0,39}$/.test(outputKey)) throw new Error('Invalid advanced output label');

// Preflight: no media, output folder or encoder child is created until every
// creative scene's layout and every local asset is known to be valid.
const art=await loadAdvancedArt(spec,isBrief?dirname(templatePath):dirname(specPath));
for (const segment of spec.motion.segments) {
  for (const f of [segment.start,Math.min(segment.start+25,segment.end-1),segment.end-1]) {
    drawAdvancedFrame(profile,f,spec,art);
  }
}
if (Number(process.versions.node.split('.')[0])!==24) throw new Error('Node 24 required');
const gitRoot=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8',windowsHide:true}).trim();
if (resolve(process.cwd())!==root || resolve(gitRoot)!==root) throw new Error('Run from repository root');
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const dirty=Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8',windowsHide:true}).trim());

const ffmpeg=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
  process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const encoderHashes={'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00',
  'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99'};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
if (sha256(readFileSync(ffmpeg))!==encoderHashes[process.platform+'-'+process.arch]) {
  throw new Error('Encoder binary not approved');
}
const directory=join('out',outputKey);
if (existsSync(directory)) throw new Error('Review output exists; do not overwrite');
const samples=[0,30,76,89,90,115,166,179,180,210,255,269,270,300,345,profile.frames-1]
  .filter((f,i,values)=>f<profile.frames&&values.indexOf(f)===i);
const started=process.hrtime.bigint();
mkdirSync(directory,{recursive:true});
try {
  const output=join(directory,'motion.mp4');
  const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-n','-f','rawvideo',
    '-pixel_format','rgba','-video_size',width+'x'+height,'-framerate','30',
    '-i','pipe:0','-an','-c:v','libx264','-threads','1','-preset','medium','-crf','18',
    '-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',output],
    {stdio:['pipe','ignore','pipe'],windowsHide:true});
  let stderr='';
  child.stderr.on('data',bytes=>{stderr+=bytes.toString()});
  child.stdin.on('error',()=>{});
  const completion=new Promise((ok,fail)=>{
    child.on('error',fail);
    child.on('close',code=>code===0?ok():fail(new Error('FFmpeg exit '+code+': '+stderr)));
  });
  completion.catch(()=>{});
  const hashes=[];
  try {
    for(let frame=0;frame<profile.frames;frame++){
      const canvas=drawAdvancedFrame(profile,frame,spec,art);
      const rgba=Buffer.from(canvas.getContext('2d').getImageData(0,0,width,height).data);
      hashes.push(sha256(rgba));
      if(samples.includes(frame)) writeFileSync(join(directory,'frame-'+frame+'.png'),canvas.toBuffer('image/png'));
      if(!child.stdin.write(rgba)) await Promise.race([
        once(child.stdin,'drain'),
        completion.then(()=>{throw new Error('FFmpeg closed before all frames')})
      ]);
    }
    child.stdin.end();await completion;
  }catch(error){child.kill();await completion.catch(()=>{});throw error;}
  const metadata=JSON.parse(execFileSync(probe.path,
    ['-v','error','-count_frames','-show_streams','-show_format','-of','json',output],
    {windowsHide:true}));
  const video=metadata.streams.find(s=>s.codec_type==='video');
  if(video?.codec_name!=='h264'||video.width!==width||video.height!==height||
      video.r_frame_rate!=='30/1'||Number(video.nb_read_frames)!==profile.frames) {
    throw new Error('Advanced ffprobe technical mismatch');
  }
  const sheet=createCanvas(1440,960),ctx=sheet.getContext('2d');
  ctx.fillStyle='#20242A';ctx.fillRect(0,0,1440,960);
  for(let i=0;i<samples.length;i++){
    const img=await loadImage(readFileSync(join(directory,'frame-'+samples[i]+'.png')));
    const scale=Math.min(340/img.width,216/img.height);
    const dw=img.width*scale,dh=img.height*scale;
    ctx.drawImage(img,(i%4)*360+(360-dw)/2,Math.floor(i/4)*240+(240-dh)/2,dw,dh);
  }
  writeFileSync(join(directory,'contact-sheet.png'),sheet.toBuffer('image/png'));
  const elapsedMs=Number((process.hrtime.bigint()-started)/1000000n);
  writeFileSync(join(directory,'render-report.json'),JSON.stringify({
    renderer:'offline-canvas-advanced-v1',profile,source_commit:source,source_dirty:dirty,
    node:process.version,lockfile_sha256:sha256(readFileSync('package-lock.json')),
    ffmpeg:execFileSync(ffmpeg,['-version'],{encoding:'utf8',windowsHide:true}).split('\n')[0],
    ffmpeg_binary_sha256:sha256(readFileSync(ffmpeg)),ffprobe_binary_sha256:sha256(readFileSync(probe.path)),
    font_files:[...fontManifest,...displayFontManifest],asset_provenance:[art.record],
    scene_spec_sha256:sha256(Buffer.from(JSON.stringify(spec))),frame_hashes:hashes,
    output_sha256:sha256(readFileSync(output)),review_frames:samples,
    duration_ms:elapsedMs,technical_qc:'PASS',asset_rights:usage,template_id:selected??null,
    creative_qc:'PENDING_HUMAN_REVIEW',
    approval:'UNAPPROVED',external_calls:0,paid_calls:0
  },null,2)+'\n');
  console.log(JSON.stringify({profile:profileName,frames:profile.frames,duration_ms:elapsedMs,
    technical_qc:'PASS',creative_qc:'PENDING_HUMAN_REVIEW'}));
}catch(err){
  rmSync(directory,{recursive:true,force:true});
  throw err;
}
