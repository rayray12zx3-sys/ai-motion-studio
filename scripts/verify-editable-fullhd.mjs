// Encoded FULL-HD S1 scene evidence, not just 360p or legacy render evidence.
// Only generated original synthetic fixtures; no external network/real assets.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {drawEditableSceneFrame} from '../src/free/editable-scene.mjs';
import {parseEditableScene} from '../experiments/editor-contract/scene.mjs';
import {selectEditableReviewFrames} from './select-editable-review-frames.mjs';
const root=dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
const encoder=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
 process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const sha=data=>createHash('sha256').update(data).digest('hex');
const samples=[];
function decode(file,frame,pix_fmt,expectedBytes){
 const bytes=execFileSync(encoder,['-hide_banner','-loglevel','error','-nostdin','-i',file,
 '-vf','select=eq(n\\,'+frame+')','-frames:v','1','-f','rawvideo',
 '-pix_fmt',pix_fmt,'pipe:1'],{timeout:120000,maxBuffer:expectedBytes+1024*1024,windowsHide:true});
 assert.equal(bytes.length,expectedBytes);
 return bytes;
}
for(const task of [
 {id:'ci-hd-landscape',variant:'landscape',mode:'opaque',width:1920,height:1080,codec:'h264',pix_fmt:'yuv420p',video:'motion.mp4'},
 {id:'ci-hd-vertical',variant:'vertical',mode:'transparent',width:1080,height:1920,codec:'prores',pix_fmt:'yuva444p10le',video:'motion-alpha.mov'}
]){
 const directory=join(root,'out','editable-'+task.id);
 const source=parseEditableScene(readFileSync(join(root,'out','approved-s1-fullhd-fixtures',task.variant+'.json'),'utf8'));
 const video=join(directory,task.video);
 const report=JSON.parse(readFileSync(join(directory,'render-report.json'),'utf8'));
 assert.deepEqual(source.canvas,{width:task.width,height:task.height});
 assert.deepEqual(report.canvas,source.canvas);
 assert.equal(report.frames,30);assert.equal(report.fps,30);
 assert.equal(report.codec,task.codec);assert.equal(report.pix_fmt,task.pix_fmt);
 assert.equal(report.frame_hashes.length,30);
 assert.equal(report.review_frame_selection,
  'S1_CLIP_BOUNDARIES_KEYS_AND_MIDPOINT_MAX_12__SAMPLED_NOT_FULL_QC');
 const reviewed=selectEditableReviewFrames(source);
 assert.ok(reviewed.length>3&&reviewed.length<=12);
 assert.deepEqual(report.review_frames.map(x=>x.frame),reviewed);
 for(const sample of report.review_frames){
  assert.equal(sample.name,'frame-'+sample.frame+'.png');
  const actual=readFileSync(join(directory,sample.name));
  assert.ok(actual.length>100,'Full-HD native review PNG missing '+sample.frame);
  assert.equal(sample.rgba_sha256,report.frame_hashes[sample.frame]);
 }
 assert.ok(readFileSync(join(directory,'contact-sheet.png')).length>100,
  'Full-HD labeled contact sheet missing');
 assert.equal(report.mode,task.mode==='transparent'?'alpha':'mp4');
 assert.equal(report.output_sha256,sha(readFileSync(video)));
 assert.equal(report.media_assets,0);
 assert.equal(report.network_requests,0);
 assert.equal(report.approval,'UNAPPROVED');
 const frame=14;
 const canvas=drawEditableSceneFrame(source,frame,{output:task.mode});
 const rgba=Buffer.from(canvas.getContext('2d').getImageData(0,0,task.width,task.height).data);
 assert.equal(sha(rgba),report.frame_hashes[frame]);
 const wholeFrame=task.width*task.height;
 if(task.mode==='transparent'){
  const first=decode(video,0,'rgba',wholeFrame*4);
  assert.ok(first.every((v,i)=>i%4!==3||v===0),'Full HD first MOV alpha must remain fully zero');
  const mid=decode(video,frame,'rgba',wholeFrame*4);
  let empty=0,visible=0;
  for(let i=3;i<mid.length;i+=4){
   if(mid[i]===0)empty++;
   if(mid[i]>4)visible++;
  }
  assert.ok(empty>wholeFrame/3,'Full HD MOV lost outside transparent area');
  assert.ok(visible>1000,'Full HD MOV lost visible alpha objects');
  samples.push({profile:'vertical',mode:'ProRes4444Alpha',width:task.width,height:task.height,
   decoded_empty_alpha_pixels:empty,decoded_visible_alpha_pixels:visible,frames:30});
 }else{
  const rgb=decode(video,frame,'rgb24',wholeFrame*3);
  let diffs=0,j=0;
  for(let i=0;i<rgba.length;i+=4){
   diffs+=Math.abs(rgb[j++]-rgba[i]);
   diffs+=Math.abs(rgb[j++]-rgba[i+1]);
   diffs+=Math.abs(rgb[j++]-rgba[i+2]);
  }
  const mean=diffs/rgb.length;
  assert.ok(mean<12,'Full HD MP4 average channel distortion too large: '+mean);
  samples.push({profile:'landscape',mode:'H264',width:task.width,height:task.height,
   mean_decoded_channel_error:mean,frames:30});
 }
}
console.log('APPROVED_S1_FULLHD_ENCODED_EVIDENCE',JSON.stringify(samples));
