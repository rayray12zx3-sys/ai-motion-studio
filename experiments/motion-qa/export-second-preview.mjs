/**
 * Opaque, source-free human review clip for the SECOND original Canvas design.
 * Synthetic 180x320 RGBA is composited on a dark solid plate, then upscaled.
 * The export is deliberately NOT an Alpha deliverable or an art approval.
 */
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import {SECOND_PROFILE,renderSecondOriginalFrame} from './render-second-benchmark.mjs';

if(process.argv.length!==2)throw new Error('No external media accepted');
assert.ok(ffmpegPath&&existsSync(ffmpegPath),'Verified FFmpeg setup missing');
assert.ok(ffprobe?.path&&existsSync(ffprobe.path),'FFprobe not available');
const out=resolve('out/motion-qa-synthetic-benchmark');
mkdirSync(out,{recursive:true});
const path=join(out,'second-original-preview-540x960.mp4');
const {width,height,fps,frames}=SECOND_PROFILE;
const command=[
  '-nostdin','-hide_banner','-loglevel','error',
  '-f','rawvideo','-pixel_format','rgba','-video_size',width+'x'+height,
  '-framerate',String(fps),'-i','pipe:0','-an',
  '-vf','scale=540:960:flags=lanczos',
  '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
  '-movflags','+faststart','-y',path
];
const encoder=spawn(ffmpegPath,command,{stdio:['pipe','ignore','pipe']});
let errors='';
encoder.stderr.on('data',x=>{errors=(errors+x.toString()).slice(-3200);});
encoder.stdin.on('error',()=>{});
const plate=[14,24,32],channels=4;
for(let frame=0;frame<frames;frame++){
  const fg=renderSecondOriginalFrame(frame,{scenario:'approved-edit'});
  const rgba=Buffer.allocUnsafe(fg.length);
  for(let p=0;p<fg.length;p+=channels){
    const opacity=fg[p+3]/255;
    for(let c=0;c<3;c++)
      rgba[p+c]=Math.round(fg[p+c]*opacity+plate[c]*(1-opacity));
    rgba[p+3]=255;
  }
  if(!encoder.stdin.write(rgba))await once(encoder.stdin,'drain');
}
encoder.stdin.end();
const [exit]=await once(encoder,'close');
assert.equal(exit,0,'Synthetic preview encoding failed: '+errors);
const info=JSON.parse(execFileSync(ffprobe.path,[
  '-v','error','-select_streams','v:0',
  '-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames',
  '-of','json',path
],{maxBuffer:1024*1024}).toString()).streams[0];
assert.equal(info.codec_name,'h264');
assert.equal(info.width,540);
assert.equal(info.height,960);
assert.equal(info.r_frame_rate,'30/1');
assert.equal(Number(info.nb_frames),90);
const report={
  status:'SECOND_ORIGINAL_SYNTHETIC_PREVIEW_PASS',
  codec:'h264',source_design:'SECOND_ORIGINAL_CANVAS_GEOMETRIC',
  frames,fps,width:540,height:960,
  seconds:3,background:'SOLID_OPAQUE',
  studio_reference_or_company_source:false,
  creative_approval:'HUMAN_REVIEW_REQUIRED',
  sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),
  bytes:statSync(path).size
};
writeFileSync(join(out,'second-original-preview-info.json'),
  JSON.stringify(report,null,2)+'\n');
console.log('MOTION_QA_ORIGINAL_MP4_PREVIEW_PASS',JSON.stringify(report));
