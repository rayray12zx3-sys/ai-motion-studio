/**
 * Experimental layered follow-up: preserve original approved snapcn camera
 * design via the existing pinned FREE FFmpeg perspective filter.
 * Source reference MIT: shadcn-labs/snapcn afce9f0aa8c9d464409efd1e4d4f227ca4809c04
 * Copyright (c) 2026 Sri Nath (snap-cn).
 * No Remotion, Chromium, additional npm package or company media.
 */
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import probe from 'ffprobe-static';
import {SPEC,makeDeviceTexture,pointAt} from './canvas-phone-camera.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=join(ROOT,'out','snapcn-layered-ffmpeg-perspective');
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
function roundedRect(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);
  c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);
  c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
}
// Split the EXACT original Canvas texture on its already-authored screen edge.
// No duplicate artwork, new packages, or upstream React/Remotion code copied.
const screenDevice=createCanvas(640,1312),sc=screenDevice.getContext('2d');
sc.drawImage(original,0,0);
sc.globalCompositeOperation='destination-in';
sc.fillStyle='#fff';roundedRect(sc,29,29,582,1254,76);sc.fill();
sc.globalCompositeOperation='source-over';
const shellDevice=createCanvas(640,1312),sh=shellDevice.getContext('2d');
sh.drawImage(original,0,0);
sh.globalCompositeOperation='destination-out';
sh.fillStyle='#fff';roundedRect(sh,29,29,582,1254,76);sh.fill();
sh.globalCompositeOperation='source-over';
if(sc.getImageData(320,600,1,1).data[3]<250 ||
   sh.getImageData(320,600,1,1).data[3]>0 ||
   sh.getImageData(20,600,1,1).data[3]<200)
  throw Error('Layer masks failed: screen/shell not independently compositable');
function intoPlane(device,stem){
  const c=createCanvas(SPEC.width,SPEC.height);
  c.getContext('2d').drawImage(device,(SPEC.width-528)/2,
   (SPEC.height-1082)/2,528,1082);
  const path=join(out,stem+'.png');writeFileSync(path,c.toBuffer('image/png'));
  return path;
}
const screenClean=intoPlane(screenDevice,'original-screen-clean');
const shell=intoPlane(shellDevice,'original-shell-crisp');
const screenBlur=join(out,'original-screen-blurred.png');
// Blur is created once from synthetic Canvas pixels by the EXISTING pinned
// encoder. Unlike the prior single-plate path, only screen content gets blur.
execFileSync(bin,['-hide_banner','-loglevel','error','-nostdin','-y',
 '-i',screenClean,'-vf','gblur=sigma=7:steps=2,format=rgba',
 '-frames:v','1',screenBlur]);
if(sha(readFileSync(screenBlur))===sha(readFileSync(screenClean)))
 throw Error('Screen-only blur not applied');
const bg=createCanvas(SPEC.width,SPEC.height),bctx=bg.getContext('2d');
const grad=bctx.createLinearGradient(0,0,SPEC.width,SPEC.height);
grad.addColorStop(0,'#151B2A');grad.addColorStop(.58,'#242F43');
grad.addColorStop(1,'#121723');
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

const warp=`perspective=${coords}:sense=destination:interpolation=cubic:eval=frame`;
// Deliberately separate layers: early defocused media crossfades to sharp
// media over source frames 4..22, while bezel/side buttons remain crisp.
const filter=[
 '[0:v]format=rgba,fade=t=out:st=0.133333:d=0.6:alpha=1[blur]',
 '[1:v]format=rgba,fade=t=in:st=0.133333:d=0.6:alpha=1[sharp]',
 '[blur][sharp]overlay=x=0:y=0:format=auto:shortest=1:alpha=straight[screen]',
 '[2:v]format=rgba[shell]',
 '[screen][shell]overlay=x=0:y=0:format=auto:shortest=1:alpha=straight[assembled]',
 `[assembled]${warp},fade=t=in:st=0:d=0.4:alpha=1[device]`,
 '[3:v][device]overlay=x=0:y=0:format=auto:shortest=1:alpha=straight,format=yuv420p[out]'
].join(';');
// The source screen and body are processed independently, then rasterized ONCE.
// Only one 1080p perspective pass is needed; no triple-warp regression.
const video=join(out,'AMSAtlasLayeredFfmpegPerspective.mp4');
const args=['-hide_banner','-loglevel','error','-nostdin','-y',
 '-loop','1','-framerate','30','-i',screenBlur,
 '-loop','1','-framerate','30','-i',screenClean,
 '-loop','1','-framerate','30','-i',shell,
 '-loop','1','-framerate','30','-i',background,
 '-filter_complex',filter,'-map','[out]','-frames:v',String(SPEC.frames),
 '-an','-c:v','libx264','-filter_complex_threads','1','-threads','1',
 '-preset','medium','-crf','18','-movflags','+faststart',
 '-map_metadata','-1',video];
console.log('Isolated original layered Canvas + pinned FFmpeg perspective, no Remotion');
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
const review=[0,6,12,18,24,30,80,120,175,239];
for(const n of review){
 execFileSync(bin,['-hide_banner','-loglevel','error','-y','-i',video,
  '-vf',`select=eq(n\\,${n})`,'-vsync','vfr','-frames:v','1',
  join(out,`review-${String(n).padStart(3,'0')}.png`)]);
}
// Independent actual-decoded pixel-content advisory in addition to metadata.
 // A complete MP4 consisting only of the gradient would be an engineering
 // regression even though ffprobe reports 240 decoded H.264 frames.
 const seen=[];
 for(const f of [30,120,239]){
   const name=join(out,`review-${String(f).padStart(3,'0')}.png`);
   const img=await loadImage(readFileSync(name));
   const sample=createCanvas(90,160),c=sample.getContext('2d');
   c.drawImage(img,0,0,90,160);
   const data=c.getImageData(0,0,90,160).data;
   let bright=0;
   for(let i=0;i<data.length;i+=4){
     if(data[i]>157&&data[i+1]>157&&data[i+2]>157)bright++;
   }
   if(bright<180)throw Error(`Decoded mobile UI absent/underexposed at frame ${f}`);
   seen.push({frame:f,bright_original_ui_pixels_in_scaled_90x160:bright});
 }
 if(seen[0].bright_original_ui_pixels_in_scaled_90x160===
    seen[2].bright_original_ui_pixels_in_scaled_90x160)
   throw Error('No sampled evidence of phone-camera reframing');
 const result={
 source_upstream:'shadcn-labs/snapcn@afce9f0aa8c9d464409efd1e4d4f227ca4809c04',
 prototype:'layered-ffmpeg-perspective-synthetic-native-motion-cues',
 version:1,source_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),
 width:SPEC.width,height:SPEC.height,frames:SPEC.frames,fps:SPEC.fps,
 h264_sha256:sha(readFileSync(video)),source_screen_clean_sha256:sha(readFileSync(screenClean)),
 source_screen_blurred_sha256:sha(readFileSync(screenBlur)),
 source_shell_sha256:sha(readFileSync(shell)),
 independent_screen_shell_layers:true,source_screen_only_blur:true,one_perspective_pass:true,
 encoder_sha256:sha(readFileSync(bin)),actual_decoded_frames:Number(track.nb_read_frames),
 technical_decode:'PASS',sampled_original_ui_visible:seen,repeated_byte_for_byte:'PASS',artistic_acceptance:'PENDING',native_snapcn_pixel_parity:'UNVERIFIED',source_native_3d_parity:'NOT_CLAIMED',
 rights:'MIT original motion cues; commercial media rights still separate',
 all_media:'FICTIONAL_ORIGINAL_ONLY',paid_providers:0,remotion_runtime:false,
 native_user_device_playback:'UNVERIFIED'
};
writeFileSync(join(out,'layered-technical-evidence.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({frames:result.frames,sha256:result.h264_sha256,technical:'PASS'}));
