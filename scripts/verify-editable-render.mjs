// Post-encode independent byte-level checks for the original synthetic S1 fixture only.
// Separate from the opt-in render CLI; never import user/company media or call network.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {drawEditableSceneFrame} from '../src/free/editable-scene.mjs';
import {parseEditableScene} from '../experiments/editor-contract/scene.mjs';
import {selectEditableReviewFrames} from './select-editable-review-frames.mjs';
import {loadImage} from '@napi-rs/canvas';
const root=dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
const source=parseEditableScene(readFileSync(join(root,'experiments/editor-contract/original-synthetic.json'),'utf8'));
const encoder=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
 process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const sha=b=>createHash('sha256').update(b).digest('hex');
const frame=14,w=360,h=640;
const stats={};
const expectedReview=selectEditableReviewFrames(source);
function decode(file,n,fmt){
 const data=execFileSync(encoder,['-hide_banner','-loglevel','error','-nostdin','-i',file,
 '-vf','select=eq(n\\,'+n+')','-frames:v','1','-f','rawvideo','-pix_fmt',fmt,'pipe:1'],
 {timeout:120000,maxBuffer:w*h*4+1024*1024,windowsHide:true});
 assert.equal(data.length,w*h*(fmt==='rgb24'?3:4));
 return data;
}
for(const [id,mode,ext] of [['ci-s1-mp4','opaque','mp4'],['ci-s1-alpha','transparent','mov']]){
 const dir=join(root,'out','editable-'+id);
 const report=JSON.parse(readFileSync(join(dir,'render-report.json'),'utf8'));
 const file=join(dir,mode==='transparent'?'motion-alpha.mov':'motion.mp4');
 assert.equal(report.kind,'APPROVED_OPT_IN_EDITABLE_SCENE_V1_CANVAS_FFMPEG');
 assert.equal(report.frames,30);assert.equal(report.fps,30);
 assert.deepEqual(report.canvas,{width:360,height:640});
 assert.equal(report.approval,'UNAPPROVED');
 assert.equal(report.media_assets,0);assert.equal(report.network_requests,0);
 assert.equal(report.frame_hashes.length,30);
 assert.equal(report.review_frame_selection,
  'S1_CLIP_BOUNDARIES_KEYS_AND_MIDPOINT_MAX_12__SAMPLED_NOT_FULL_QC');
 assert.deepEqual(report.review_frames.map(x=>x.frame),expectedReview);
 for(const sample of report.review_frames){
  const canvas=drawEditableSceneFrame(source,sample.frame,{output:mode});
  const pixels=Buffer.from(canvas.getContext('2d').getImageData(0,0,w,h).data);
  assert.equal(sample.rgba_sha256,sha(pixels),'S1 review sample frame hash mismatch');
  assert.equal(sample.rgba_sha256,report.frame_hashes[sample.frame]);
  assert.equal(sample.name,'frame-'+sample.frame+'.png');
  const picture=await loadImage(readFileSync(join(dir,sample.name)));
  assert.deepEqual([picture.width,picture.height],[w,h]);
 }
 const sheet=await loadImage(readFileSync(join(dir,'contact-sheet.png')));
 assert.deepEqual([sheet.width,sheet.height],[960,Math.ceil(expectedReview.length/4)*260]);
 assert.equal(report.output_sha256,sha(readFileSync(file)));
 const canvas=drawEditableSceneFrame(source,frame,{output:mode});
 const raw=Buffer.from(canvas.getContext('2d').getImageData(0,0,w,h).data);
 assert.equal(report.frame_hashes[frame],sha(raw));
 if(mode==='transparent'){
  assert.equal(report.codec,'prores');
  assert.ok(report.pix_fmt.startsWith('yuva444p'));
  const empty=decode(file,0,'rgba');
  assert.ok(empty.every((v,i)=>i%4!==3||v===0),'First ProRes frame must remain transparent');
  const mid=decode(file,frame,'rgba');
  const alphas=[];
  for(let i=3;i<mid.length;i+=4)alphas.push(mid[i]);
  assert.ok(alphas.some(v=>v>4),'ProRes 4444 must preserve visible alpha');
  assert.ok(alphas.some(v=>v===0),'ProRes 4444 must preserve transparent pixels');
  stats.alpha={first_frame_alpha_zero:true,middle_frame_visible_alpha:true,decoder:report.pix_fmt};
 }else{
  assert.equal(report.codec,'h264');assert.equal(report.pix_fmt,'yuv420p');
  const rgb=decode(file,frame,'rgb24');
  let errorSum=0,j=0;
  for(let i=0;i<raw.length;i+=4){
   errorSum+=Math.abs(raw[i]-rgb[j++]);
   errorSum+=Math.abs(raw[i+1]-rgb[j++]);
   errorSum+=Math.abs(raw[i+2]-rgb[j++]);
  }
  const mean=errorSum/rgb.length;
  assert.ok(mean<12,'Opaque H264 mean RGB error exceeded guarded threshold: '+mean);
  stats.mp4={codec:'h264',mean_rgb_error:mean};
 }
}
console.log('APPROVED_EDITABLE_S1_EXPORT_ENCODED_QC',JSON.stringify({...stats,review_frame_count:expectedReview.length,review_frames:expectedReview,labeled_contact_sheet:true}));
