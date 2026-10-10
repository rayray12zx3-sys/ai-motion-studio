// S4 synthetic Alpha ProRes 4444 research only. Not approved production or Premiere validation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import probe from 'ffprobe-static';
import {createCanvas} from '@napi-rs/canvas';
import {drawFrame,profiles} from '../../src/free/scene.mjs';

const W=1080,H=1920,FPS=30,FRAMES=8,FRAME_BYTES=W*H*4;
const here=dirname(fileURLToPath(import.meta.url));
const encoder=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
 process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const pins={'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99',
 'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00'};
const digest=b=>createHash('sha256').update(b).digest('hex');
function run(name,args,opts={}){
 return execFileSync(name,args,{encoding:null,timeout:180000,maxBuffer:100*1024*1024,...opts});
}
function pixel(buf,frame,x,y){
 const i=frame*FRAME_BYTES+(y*W+x)*4;
 return {r:buf[i],g:buf[i+1],b:buf[i+2],a:buf[i+3]};
}
function drawOriginalSynthetic(frame){
 const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,W,H);
 // Transparent remainder and two original synthetic geometries; no fonts or media.
 ctx.globalAlpha=1;
 ctx.fillStyle='#2bd8de';
 ctx.fillRect(200+frame*20,700,440,380);
 ctx.globalAlpha=.5;
 ctx.fillStyle='#f5bf60';
 ctx.fillRect(100,1300,500,150);
 ctx.globalAlpha=1;
 return Buffer.from(ctx.getImageData(0,0,W,H).data);
}
async function main(){
 const tag=process.platform+'-'+process.arch;
 if(!Object.hasOwn(pins,tag)||digest(readFileSync(encoder))!==pins[tag])
  throw Error('Pinned FFmpeg binary SHA-256 mismatch');
 const temp=mkdtempSync(join(tmpdir(),'motion-alpha-prores-s4-'));
 const out=join(here,'../../out');mkdirSync(out,{recursive:true});
 try{
  const legacyBefore=drawFrame(profiles.smoke,12).toBuffer('image/png');
  const frames=Array.from({length:FRAMES},(_,n)=>drawOriginalSynthetic(n));
  const raw=Buffer.concat(frames);
  assert.equal(raw.length,FRAMES*FRAME_BYTES);
  for(const i of [0,7]){
   assert.equal(pixel(raw,i,20,20).a,0);
   assert.equal(pixel(raw,i,400,800).a,255);
   assert.ok(Math.abs(pixel(raw,i,150,1350).a-128)<=1);
  }
  assert.notDeepEqual(pixel(raw,0,250,750),pixel(raw,7,250,750));
  const filename=join(temp,'original-synthetic-alpha-1080x1920.mov');
  run(encoder,['-hide_banner','-loglevel','error','-nostdin','-y',
   '-f','rawvideo','-pixel_format','rgba','-video_size',W+'x'+H,
   '-framerate',String(FPS),'-i','pipe:0','-an',
   '-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le',
   '-alpha_bits','16','-threads','1','-frames:v',String(FRAMES),
   '-map_metadata','-1',filename],{input:raw});
  const data=JSON.parse(run(probe.path,['-v','error','-count_frames',
   '-show_streams','-of','json',filename]).toString());
  const v=data.streams.find(s=>s.codec_type==='video');
  if(!v)throw Error('No video in synthetic ProRes result');
  assert.equal(v.codec_name,'prores');
  assert.equal(v.width,W);assert.equal(v.height,H);
  assert.equal(v.r_frame_rate,'30/1');assert.equal(Number(v.nb_read_frames),FRAMES);
  assert.ok(v.pix_fmt?.startsWith('yuva'),'No alpha-bearing ProRes pixel format');
  const decoded=run(encoder,['-hide_banner','-loglevel','error','-nostdin','-i',filename,
   '-map','0:v:0','-f','rawvideo','-pix_fmt','rgba','pipe:1']);
  assert.equal(decoded.length,raw.length);
  const samples=[];
  for(const i of [0,4,7]){
   const corners=pixel(decoded,i,20,20),opaque=pixel(decoded,i,400,800),semi=pixel(decoded,i,150,1350);
   assert.ok(corners.a<=10,'Transparent pixel lost alpha on decode');
   assert.ok(opaque.a>=245,'Opaque region did not retain alpha on decode');
   assert.ok(Math.abs(semi.a-128)<=15,'Half-alpha region drifted outside bounded decode range');
   samples.push({frame:i,transparent_alpha:corners.a,opaque_alpha:opaque.a,half_alpha:semi.a});
  }
  assert.deepEqual(drawFrame(profiles.smoke,12).toBuffer('image/png'),legacyBefore);
  copyFileSync(filename,join(out,'s4-original-synthetic-alpha-1080x1920.mov'));
  const report={
   status:'PASS_ISOLATED_SYNTHETIC_1080X1920_PRORES4444_ALPHA_ENCODE_DECODE_ONLY',
   synthetic_shapes:true,profile:{width:W,height:H,fps:FPS,frames:FRAMES},
   ffmpeg_sha256:digest(readFileSync(encoder)),
   stream:{codec:v.codec_name,profile:v.profile,pixel_format:v.pix_fmt,frames:Number(v.nb_read_frames)},
   alpha_samples:samples,mov_sha256:digest(readFileSync(filename)),
   official_renderer_smoke_unchanged:true,new_production_dependencies:false,
   not_proven:['Premiere Windows actual import','Full 30-frame production Alpha MOV QA',
    'Canvas S1 vs official production pixel parity','Real company asset rights','Creative approval']
  };
  writeFileSync(join(out,'s4-alpha-prores-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('S4_SYNTHETIC_ALPHA_PRORES_PROOF',JSON.stringify(report));
 }finally{rmSync(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error('S4_ALPHA_PRORES_PROOF_FAILED',e.stack||String(e));process.exitCode=1});
