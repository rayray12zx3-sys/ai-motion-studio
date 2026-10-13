/**
 * Experimental second transfer: preserve original approved snapcn camera
 * design via the existing pinned FREE FFmpeg perspective filter.
 * Source reference MIT: shadcn-labs/snapcn afce9f0aa8c9d464409efd1e4d4f227ca4809c04
 * Copyright (c) 2026 Sri Nath (snap-cn).
 * No Remotion, Chromium, additional npm package or company media.
 */
import {createCanvas} from '@napi-rs/canvas';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import probe from 'ffprobe-static';
import {SPEC,makeDeviceTexture,pointAt} from './canvas-phone-camera.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=join(ROOT,'out','snapcn-ffmpeg-perspective');
if(existsSync(out))throw Error('Do not overwrite prior review assets');
const bin=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
  process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const expected={'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99',
  'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00'};
const sha=b=>createHash('sha256').update(b).digest('hex');
if(sha(readFileSync(bin))!==expected[`${process.platform}-${process.arch}`])
  throw Error('Pinned FFmpeg binary hash mismatch');
const ffprobePath=probe.path;
mkdirSync(out,{recursive:true});
const original=await makeDeviceTexture();
const fg=createCanvas(SPEC.width,SPEC.height),ctx=fg.getContext('2d');
ctx.drawImage(original,(SPEC.width-528)/2,(SPEC.height-1082)/2,528,1082);
const plane=join(out,'original-phone-transparent.png');
writeFileSync(plane,fg.toBuffer('image/png'));
const bg=createCanvas(SPEC.width,SPEC.height),bctx=bg.getContext('2d');
const grad=bctx.createLinearGradient(0,0,SPEC.width,SPEC.height);
grad.addColorStop(0,'#151B2A');grad.addColorStop(.58,'#242F43');grad.addColorStop(1,'#121723');
bctx.fillStyle=grad;bctx.fillRect(0,0,SPEC.width,SPEC.height);
const background=join(out,'original-stage.png');
writeFileSync(background,bg.toBuffer('image/png'));
// FFmpeg perspective supports in (input frame number), NOT n nor t.
// Only six recognized original cue boundaries: native snapcn camera rests here.
const boundaries=[0,24,100,148,215,239];
const sourceCorners=[[0,0],[SPEC.width,0],[0,SPEC.height],[SPEC.width,SPEC.height]];
const corner=(xy,f)=>{
  const xcss=160+(xy[0]-SPEC.width/2)/1.65;
  const ycss=328+(xy[1]-SPEC.height/2)/1.65;
  return pointAt(xcss,ycss,f);
};
const points=boundaries.map(f=>sourceCorners.map(x=>corner(x,f)));
const numerical=x=>Number(x.toFixed(5)).toString();
// Cumulative smoothstep (no hidden state): each segment contributes the
// delta once its authoring boundary is crossed. This preserves static camera
// pose exactly at the 6 beat boundaries with smooth interval starts/ends.
function expr(cornerIndex,axis){
  let res=numerical(points[0][cornerIndex][axis]);
  for(let j=0;j<boundaries.length-1;j++){
    const delta=points[j+1][cornerIndex][axis]-points[j][cornerIndex][axis];
    if(Math.abs(delta)<1e-6)continue;
    const a=boundaries[j],d=boundaries[j+1]-a;
    const u=`min(max((in-${a})/${d}\\,0)\\,1)`;
    const cubic=`(${u}*${u}*(3-2*${u}))`;
    res+=`+${numerical(delta)}*${cubic}`;
  }
  return res;
}
const shape=['x0','y0','x1','y1','x2','y2','x3','y3'];
const coords=shape.map((s,i)=>s+'='+expr(Math.floor(i/2),i%2?'y':'x')).join(':');
const filter=`[0:v]format=rgba,perspective=${coords}:sense=destination:interpolation=cubic:eval=frame,fade=t=in:st=0:d=0.4:alpha=1[device];[1:v][device]overlay=x=0:y=0:format=auto:shortest=1:alpha=straight,format=yuv420p[out]`;
const video=join(out,'AMSAtlasFfmpegPerspective.mp4');
const args=['-hide_banner','-loglevel','error','-nostdin','-y',
'-loop','1','-framerate','30','-i',plane,
'-loop','1','-framerate','30','-i',background,
'-filter_complex',filter,'-map','[out]','-frames:v',String(SPEC.frames),
'-an','-c:v','libx264','-filter_complex_threads','1','-threads','1','-preset','medium','-crf','18',
'-movflags','+faststart','-map_metadata','-1',video];
console.log('Perspective on the original PNG using pinned already-approved encoder');
let err='';
const child=spawn(bin,args,{stdio:['ignore','inherit','pipe']});
child.stderr.on('data',x=>{err+=x.toString()});
await new Promise((resolve,reject)=>{
 child.on('error',reject);
 child.on('close',code=>code===0?resolve():reject(Error(`perspective encoder exit ${code}: ${err.slice(-1700)}`)));
});
// Required repeatability: same approved static original plate, exact filter,
 // same source checkout and pinned binary must yield identical MP4 bytes.
 const rerender=join(out,'internal-repeat.mp4');
 const replayArgs=[...args];replayArgs[replayArgs.length-1]=rerender;
 let repeatErr='';
 const replay=spawn(bin,replayArgs,{stdio:['ignore','ignore','pipe']});
 replay.stderr.on('data',x=>{repeatErr+=x.toString()});
 await new Promise((resolve,reject)=>{replay.on('error',reject);
  replay.on('close',code=>code===0?resolve():reject(Error('repeat encode '+code+': '+repeatErr.slice(-1200))))});
 if(sha(readFileSync(video))!==sha(readFileSync(rerender)))
   throw Error('Non-deterministic exact-source native FFmpeg perspective render');
 const media=JSON.parse(execFileSync(ffprobePath,['-v','error','-count_frames','-show_streams',
'-of','json',video],{encoding:'utf8'}));
const track=media.streams.find(x=>x.codec_type==='video');
if(track?.codec_name!=='h264'||track.width!==SPEC.width||
 track.height!==SPEC.height||Number(track.nb_read_frames)!==SPEC.frames)
 throw Error('Independent full decoded video check FAILED');
const review=[0,30,80,120,175,239];
for(const n of review){
 execFileSync(bin,['-hide_banner','-loglevel','error','-y','-i',video,
  '-vf',`select=eq(n\\,${n})`,'-vsync','vfr','-frames:v','1',
  join(out,`review-${String(n).padStart(3,'0')}.png`)]);
}
const result={
 source_upstream:'shadcn-labs/snapcn@afce9f0aa8c9d464409efd1e4d4f227ca4809c04',
 prototype:'ffmpeg-perspective-synthetic-native-motion-cues',
 version:1,source_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),
 width:SPEC.width,height:SPEC.height,frames:SPEC.frames,fps:SPEC.fps,
 h264_sha256:sha(readFileSync(video)),source_png_sha256:sha(readFileSync(plane)),
 encoder_sha256:sha(readFileSync(bin)),actual_decoded_frames:Number(track.nb_read_frames),
 technical_decode:'PASS',repeated_byte_for_byte:'PASS',artistic_acceptance:'PENDING',native_snapcn_pixel_parity:'UNVERIFIED',
 rights:'MIT original motion cues; commercial media rights still separate',
 all_media:'FICTIONAL_ORIGINAL_ONLY',paid_providers:0,remotion_runtime:false,
 native_user_device_playback:'UNVERIFIED'
};
writeFileSync(join(out,'technical-evidence.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({frames:result.frames,sha256:result.h264_sha256,technical:'PASS'}));
