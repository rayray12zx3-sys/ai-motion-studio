// Synthetic-only ProRes 4444 alpha technical smoke. Never processes company files.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {once} from 'node:events';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import {createKeyframedCanvasRenderer} from '../src/canvas-renderer.mjs';

const repoRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const ffmpeg=ffmpegStatic;
const ffprobe=ffprobeStatic?.path;
assert.ok(ffmpeg&&ffprobe&&existsSync(ffmpeg)&&existsSync(ffprobe),
  'Pinned FFmpeg/FFprobe binaries not provisioned; run approved encoder setup first');
const out=join(repoRoot,'experiments/theatre/out/alpha-smoke');
mkdirSync(out,{recursive:true});
const mov=join(out,'m10-synthetic-prores4444-alpha-1080x1920.mov');
const mp4=join(out,'m10-synthetic-alpha-composite-preview.mp4');
const profile={width:1080,height:1920,fps:30,frames:91};
const requiredFrames=30;
const render=await createKeyframedCanvasRenderer({
  background:'transparent',placement:'lower-third',
  projectId:'M10 ProRes Alpha Smoke'
});
const args=[
  '-nostdin','-hide_banner','-loglevel','error',
  '-f','rawvideo','-pixel_format','rgba','-video_size','1080x1920',
  '-framerate','30','-i','pipe:0','-an',
  '-c:v','prores_ks','-profile:v','4',
  '-pix_fmt','yuva444p10le','-alpha_bits','16','-y',mov
];
const process=spawn(ffmpeg,args,{stdio:['pipe','ignore','pipe']});
let stderr='';
process.stderr.on('data',v=>{stderr=(stderr+v.toString()).slice(-6000);});
process.stdin.on('error',()=>{}); // EPIPE is reported with the failed encoder exit.
for(let frame=0;frame<requiredFrames;frame++){
  const canvas=render(profile,frame);
  const pixels=canvas.getContext('2d').getImageData(0,0,profile.width,profile.height).data;
  const buffer=Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength);
  if(!process.stdin.write(buffer))await once(process.stdin,'drain');
}
process.stdin.end();
const [exit]=await once(process,'close');
assert.equal(exit,0,'ProRes encoder failed: '+stderr.slice(-1800));
const show=file=>JSON.parse(execFileSync(ffprobe,[
  '-v','error','-select_streams','v:0',
  '-show_entries','stream=codec_name,profile,codec_tag_string,width,height,pix_fmt,r_frame_rate,nb_frames',
  '-of','json',file
],{maxBuffer:1024*1024}).toString()).streams[0];
const info=show(mov);
assert.equal(info.codec_name,'prores');
assert.ok(info.profile==='4444'||info.codec_tag_string==='ap4h',
  'ProRes 4444 profile/fourcc not verified');
assert.equal(info.width,1080);
assert.equal(info.height,1920);
assert.equal(info.r_frame_rate,'30/1');
assert.ok(info.pix_fmt?.startsWith('yuva444p'),'MOV must have alpha-capable pixel format');
// Decode actual ProRes pixels, not just trust container metadata.
const decoded=execFileSync(ffmpeg,[
  '-nostdin','-hide_banner','-loglevel','error','-i',mov,
  '-vf','select=eq(n\\,15)','-frames:v','1',
  '-f','rawvideo','-pix_fmt','rgba','pipe:1'
],{maxBuffer:16*1024*1024});
assert.equal(decoded.length,1080*1920*4,'Decoded frame dimensions mismatch');
let topNonzero=0,lowerNonzero=0;
for(let y=0;y<1920;y++)for(let x=0;x<1080;x++){
  const a=decoded[(y*1080+x)*4+3];
  if(y<700&&a!==0)topNonzero++;
  if(y>1000&&a>0)lowerNonzero++;
}
assert.equal(topNonzero,0,'Top-of-frame transparency lost in actual ProRes decode');
assert.ok(lowerNonzero>1500,'No visible alpha content after actual MOV decode');
// MP4 preview is a separate opaque composite, never an alpha deliverable.
execFileSync(ffmpeg,[
  '-nostdin','-hide_banner','-loglevel','error',
  '-f','lavfi','-i','color=c=0x14262b:s=1080x1920:r=30:d=1',
  '-i',mov,
  '-filter_complex','[0:v][1:v]overlay=shortest=1:format=auto,format=yuv420p[v]',
  '-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','22',
  '-r','30','-movflags','+faststart','-y',mp4
],{maxBuffer:2*1024*1024});
const preview=show(mp4);
assert.equal(preview.codec_name,'h264');
assert.equal(preview.width,1080);
assert.equal(preview.height,1920);
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const report={
  status:'SYNTHETIC_ALPHA_TECHNICAL_PASS',
  fps:30,width:1080,height:1920,encoded_frames:requiredFrames,
  mov:{codec:info.codec_name,profile:info.profile||'fourcc-ap4h',fourcc:info.codec_tag_string||null,pix_fmt:info.pix_fmt,
    bytes:statSync(mov).size,sha256:sha(mov)},
  decoded_alpha:{top_nonzero:topNonzero,lower_nonzero:lowerNonzero},
  preview:{codec:preview.codec_name,bytes:statSync(mp4).size,sha256:sha(mp4)},
  premiere_human_acceptance:'NOT_TESTED',
  private_company_assets:'NOT_USED',
  creative_art_approval:'NOT_APPLICABLE'
};
writeFileSync(join(out,'technical-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('M10_SYNTHETIC_ALPHA_MOV_PASS '+JSON.stringify(report));
