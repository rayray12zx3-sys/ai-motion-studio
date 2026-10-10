// S4 EXPERIMENT ONLY — synthetic editable-scene Canvas frames encoded by existing pinned FFmpeg.
// Not the production renderer, not an editor release, not alpha-video clearance.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import probe from 'ffprobe-static';
import {profiles,drawFrame} from '../../src/free/scene.mjs';
import {parseEditableScene,serializeEditableScene} from '../editor-contract/scene.mjs';
import {editTimeline} from '../editor-contract/timeline.mjs';
import {paintEditablePreview} from '../editor-canvas-preview/paint.mjs';

const w=360,h=640,fps=30,frames=30,bytesPerFrame=w*h*3;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const exec=(name,args,opts={})=>execFileSync(name,args,{timeout:120000,maxBuffer:64*1024*1024,encoding:null,...opts});
const root=dirname(fileURLToPath(import.meta.url));
const encoder=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const pins={'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99','win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00'};
function ensureEncoder(){
 const platform=process.platform+'-'+process.arch;
 if(!Object.hasOwn(pins,platform)||sha(readFileSync(encoder))!==pins[platform])
  throw Error('FFmpeg executable differs from existing official SHA-256 pin');
 if(!probe.path)throw Error('Pinned ffprobe path missing');
}
function rgb(frame){
 const {data}=frame.getContext('2d').getImageData(0,0,w,h);
 const result=Buffer.allocUnsafe(bytesPerFrame);
 for(let i=0,j=0;i<data.length;i+=4){
  assert.equal(data[i+3],255,'Synthetic opaque preview must not silently lose alpha');
  result[j++]=data[i];result[j++]=data[i+1];result[j++]=data[i+2];
 }
 return result;
}
function sceneFrames(scene){
 const data=Buffer.allocUnsafe(frames*bytesPerFrame);
 for(let i=0;i<frames;i++)rgb(paintEditablePreview(scene,i)).copy(data,i*bytesPerFrame);
 return data;
}
function editFixture(s){
 let t=editTimeline(s,{type:'move',layerId:'headline',deltaFrames:3});
 t=editTimeline(t,{type:'trim-end',layerId:'headline',frame:27});
 t=editTimeline(t,{type:'trim-start',layerId:'headline',frame:8});
 return editTimeline(t,{type:'insert-key',layerId:'headline',frame:12});
}
function encode(raw,target,kind){
 const args=['-hide_banner','-loglevel','error','-nostdin','-y','-f','rawvideo','-pixel_format','rgb24',
  '-video_size',w+'x'+h,'-framerate',String(fps),'-i','pipe:0','-an','-threads','1'];
 if(kind==='lossless')args.push('-c:v','libx264rgb','-crf','0','-preset','fast','-pix_fmt','rgb24');
 else if(kind==='mp4')args.push('-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart');
 else throw Error('Unknown synthetic encoder');
 args.push('-frames:v',String(frames),'-map_metadata','-1',target);
 exec(encoder,args,{input:raw});
}
function inspect(target){
 const info=JSON.parse(exec(probe.path,['-v','error','-count_frames','-show_streams','-of','json',target]).toString());
 const stream=info.streams.find(x=>x.codec_type==='video');
 assert.ok(stream,'Encoded video has no video stream');
 assert.equal(stream.codec_name,'h264');assert.equal(stream.width,w);assert.equal(stream.height,h);
 assert.equal(stream.r_frame_rate,'30/1');assert.equal(Number(stream.nb_read_frames),frames);
 return {codec:stream.codec_name,pixel_format:stream.pix_fmt,fps:stream.r_frame_rate,frames:Number(stream.nb_read_frames)};
}
function decode(target){
 return exec(encoder,['-hide_banner','-loglevel','error','-nostdin','-i',target,
  '-map','0:v:0','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);
}
function compare(a,b){
 assert.equal(a.length,b.length);
 let sum=0,max=0,changed=0;
 for(let i=0;i<a.length;i++){
  const d=Math.abs(a[i]-b[i]);
  sum+=d;if(d>max)max=d;if(d>0)changed++;
 }
 return {mean_absolute_channel_error:sum/a.length,max_channel_error:max,changed_channels:changed};
}
async function main(){
 ensureEncoder();
 const temporary=mkdtempSync(join(tmpdir(),'motion-s4-encoded-'));
 const out=join(root,'../../out');mkdirSync(out,{recursive:true});
 try{
  const original=parseEditableScene(readFileSync(join(root,'../editor-contract/original-synthetic.json'),'utf8'));
  const edited=parseEditableScene(serializeEditableScene(editFixture(original)));
  assert.deepEqual(edited.layers[1].keys.map(k=>k.frame),[8,12,26]);
  const approvedBefore=drawFrame(profiles.smoke,12).toBuffer('image/png');
  const first=sceneFrames(original),next=sceneFrames(edited);
  assert.equal(first.length,frames*bytesPerFrame);assert.equal(next.length,frames*bytesPerFrame);
  assert.notDeepEqual(first.subarray(15*bytesPerFrame,16*bytesPerFrame),
   next.subarray(15*bytesPerFrame,16*bytesPerFrame));
  assert.deepEqual(first.subarray(29*bytesPerFrame,30*bytesPerFrame),
   next.subarray(29*bytesPerFrame,30*bytesPerFrame));
  const originalLossless=join(temporary,'original-lossless.mkv');
  const editedLossless=join(temporary,'edited-lossless.mkv');
  const originalMP4=join(temporary,'original.mp4'),editedMP4=join(temporary,'edited.mp4');
  encode(first,originalLossless,'lossless');encode(next,editedLossless,'lossless');
  encode(first,originalMP4,'mp4');encode(next,editedMP4,'mp4');
  const metadata={
   original_lossless:inspect(originalLossless),edited_lossless:inspect(editedLossless),
   original_h264:inspect(originalMP4),edited_h264:inspect(editedMP4)
  };
  // Lossless x264rgb must exactly preserve the same original RGB byte sequence.
  const l1=decode(originalLossless),l2=decode(editedLossless);
  assert.deepEqual(l1,first,'Original lossless decoded RGB not identical');
  assert.deepEqual(l2,next,'Edited lossless decoded RGB not identical');
  const h1=decode(originalMP4),h2=decode(editedMP4);
  assert.equal(h1.length,first.length);assert.equal(h2.length,next.length);
  const errors={original:compare(first,h1),edited:compare(next,h2)};
  if(errors.original.mean_absolute_channel_error>=12||
     errors.edited.mean_absolute_channel_error>=12)
   throw Error('Lossy synthetic H264 average per-channel distortion too high');
  assert.deepEqual(drawFrame(profiles.smoke,12).toBuffer('image/png'),approvedBefore,
   'Official Canvas renderer mutated by experimental encode');
  copyFileSync(originalMP4,join(out,'s4-original-synthetic.mp4'));
  copyFileSync(editedMP4,join(out,'s4-edited-synthetic.mp4'));
  const report={
   status:'PASS_SYNTHETIC_PREVIEW_FFMPEG_ENCODING_ONLY',
   renderer:'EXPERIMENTAL_NEUTRAL_PREVIEW_NOT_PRODUCTION',
   encoder_sha256:sha(readFileSync(encoder)),scene_kind:original.kind,
   resolution:[w,h],fps,frames,metadata,
   lossless_rgb_exact:true,original_rgb_sha256:sha(first),edited_rgb_sha256:sha(next),
   mp4_distortion:errors,original_h264_sha256:sha(readFileSync(originalMP4)),
   edited_h264_sha256:sha(readFileSync(editedMP4)),
   official_canvas_smoke_frame_unchanged:true,media:'ORIGINAL_SYNTHETIC_ONLY',
   new_production_dependencies:false,
   unverified:['Actual official Canvas renderer SceneSpec pixel parity','1080p opaque encode and alpha ProRes',
    'Windows Premiere','licensed company assets','creative approval']
  };
  writeFileSync(join(out,'s4-ffmpeg-synthetic-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('S4_SYNTHETIC_FFMPEG_PROOF',JSON.stringify(report));
 }finally{rmSync(temporary,{recursive:true,force:true});}
}
main().catch(e=>{console.error('S4_SYNTHETIC_FFMPEG_FAILED',e.stack||String(e));process.exitCode=1});
