// M12: original synthetic review, no private/recorded APP assets or third-party music.
// Three temporal samples render genuine motion-blurred compositing; a procedurally
// synthesized quiet click track supplies 120 BPM markers, NOT advertising music.
import ffmpeg from 'ffmpeg-static';
import {createCanvas} from '@napi-rs/canvas';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fontFamily} from '../src/free/scene.mjs';
import {drawSafeReviewGuide} from '../src/creative/social-safe-area.mjs';
import {drawOneShapeFrame,FRAMES,FPS,BPM,BEATS} from '../src/creative/one-shape-motion.mjs';

if(process.argv.length!==2)throw Error('No private or external media inputs');
if(Number(process.versions.node.split('.')[0])!==24)throw Error('Node 24 required');
const p={width:540,height:960,fps:FPS,frames:FRAMES},dir=resolve('out/one-shape-reference-review');
if(existsSync(dir))throw Error('Review destination exists; no overwrites');
mkdirSync(dir,{recursive:true});mkdirSync(join(dir,'alpha-frames'),{recursive:true});
const digest=x=>createHash('sha256').update(x).digest('hex');
function reviewPanel(overlay,guide=false){
 const c=createCanvas(p.width,p.height),ctx=c.getContext('2d');
 ctx.fillStyle='#F2F0ED';ctx.fillRect(0,0,p.width,p.height);
 ctx.drawImage(overlay,0,0);
 if(guide)drawSafeReviewGuide(ctx,p);
 ctx.textAlign='left';ctx.font='14px '+fontFamily;ctx.fillStyle='#47504C';
 ctx.fillText('ORIGINAL UI STUDY  /  NOT AN APP RECORDING',12,30,516);
 return c;
}
function temporalSample(frame){
 // Weighted, premultiplied per-pixel RGBA average avoids dark alpha halos.
 const center=drawOneShapeFrame(p,frame);
 const images=[frame-.30,frame,frame+.30].map(t=>
   drawOneShapeFrame(p,Math.min(FRAMES-1,Math.max(0,t)))
    .getContext('2d').getImageData(0,0,p.width,p.height).data);
 const ctx=center.getContext('2d'),out=ctx.createImageData(p.width,p.height);
 for(let i=0;i<out.data.length;i+=4){
  let weight=0,alphaTotal=0,red=0,green=0,blue=0;
  for(const img of images){
   const a=img[i+3];
   weight+=a;alphaTotal+=a;
   red+=img[i]*a;green+=img[i+1]*a;blue+=img[i+2]*a;
  }
  out.data[i]=weight?red/weight:0;
  out.data[i+1]=weight?green/weight:0;
  out.data[i+2]=weight?blue/weight:0;
  out.data[i+3]=Math.round(alphaTotal/3);
 }
 ctx.clearRect(0,0,p.width,p.height);ctx.putImageData(out,0,0);
 return center;
}
function makeAudio(){
 const rate=48000,count=rate*4,pcm=Buffer.alloc(count*2);
 const events=Array.from({length:8},(_,i)=>({s:i*.5,hz:i===0?690:540,gain:2100}));
 events.push({s:33/30,hz:1150,gain:2300},{s:77/30,hz:980,gain:1750},
  {s:90/30,hz:1320,gain:2600});
 for(let i=0;i<count;i++){
  const t=i/rate;
  let sound=0;
  for(const e of events){
   const dt=t-e.s;
   if(dt>=0&&dt<.13)sound+=e.gain*Math.sin(2*Math.PI*e.hz*dt)*Math.exp(-45*dt);
  }
  pcm.writeInt16LE(Math.round(Math.max(-20000,Math.min(20000,sound))),i*2);
 }
 const wav=Buffer.alloc(44);
 wav.write('RIFF',0);wav.writeUInt32LE(36+pcm.length,4);wav.write('WAVEfmt ',8);
 wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
 wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);
 wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
 wav.write('data',36);wav.writeUInt32LE(pcm.length,40);
 return {file:Buffer.concat([wav,pcm]),events};
}
const {file:wav,events}=makeAudio();
const audio=join(dir,'original-review-beat-clicks.wav');
writeFileSync(audio,wav);
const mp4=join(dir,'one-shape-4s-reference-reset.mp4');
const args=['-hide_banner','-loglevel','error','-f','rawvideo',
 '-pixel_format','rgba','-video_size','540x960','-framerate','30','-i','pipe:0',
 '-i',audio,'-map','0:v:0','-map','1:a:0',
 '-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',
 '-c:a','aac','-b:a','96k','-t','4','-movflags','+faststart',mp4];
const child=spawn(ffmpeg,args,{stdio:['pipe','ignore','pipe']});
let log='';
child.stderr.on('data',x=>{log+=String(x).slice(0,1200);});
const done=new Promise((ok,bad)=>{
 child.on('error',bad);
 child.on('close',code=>code===0?ok():bad(new Error('FFmpeg failed '+code+' '+log.slice(-1700))));
});
const contactFrames=[0,7,15,25,33,44,52,62,70,83,97,111,119],panels=[],hashes=[];
for(let i=0;i<FRAMES;i++){
 const alpha=drawOneShapeFrame(p,i);
 const png=alpha.toBuffer('image/png');
 writeFileSync(join(dir,'alpha-frames','frame-'+String(i).padStart(3,'0')+'.png'),png);
 if(contactFrames.includes(i)){
  panels.push(reviewPanel(alpha,true));
  hashes.push({frame:i,sha256:digest(png)});
 }
 const blurred=temporalSample(i),review=reviewPanel(blurred);
 const pixels=Buffer.from(review.getContext('2d').getImageData(0,0,p.width,p.height).data);
 if(!child.stdin.write(pixels))await once(child.stdin,'drain');
}
child.stdin.end();await done;
const cols=4,cellW=270,cellH=480;
const sheet=createCanvas(cellW*cols,cellH*4),ctx=sheet.getContext('2d');
panels.forEach((im,i)=>{
 ctx.drawImage(im,(i%cols)*cellW,Math.floor(i/cols)*cellH,cellW,cellH);
});
writeFileSync(join(dir,'contact-sheet.png'),sheet.toBuffer('image/png'));
writeFileSync(join(dir,'review.json'),JSON.stringify({
  kind:'ORIGINAL_ONE_SHAPE_REFERENCE_LED_NOT_NATIVE_APP',
  visual_status:'PENDING_USER_REVIEW',prior_M11_creative_status:'REJECTED',
  fps:FPS,frames:FRAMES,seconds:4,bpm:BPM,beat_frames:15,beats:BEATS,
  private_media_present:false,output_credit_requirement:'ORIGINAL_GENERATIVE_ART',
  audio_source:'ORIGINAL_SYNTHETIC_CLICK_TRACK_NOT_COMMERCIAL_SONG',
  audio_events:events,subframe_samples_per_frame:3,
  mask_status:'GENERIC_PRECHECK_PRIVATE_IGFB_RGBA_VERIFICATION_REQUIRED',
  sha256_mp4:digest(readFileSync(mp4)),frame_hashes:hashes
},null,2)+'\n');
console.log(JSON.stringify({frames:FRAMES,bpm:BPM,review:'PENDING_USER_REVIEW',
 video_sha256:digest(readFileSync(mp4))}));
