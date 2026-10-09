/**
 * Explicit opt-in synthetic-only transparent foreground MOV renderer.
 * Existing scripts/render.mjs (opaque default MP4) is untouched.
 * Does not accept private file paths, URLs, company inputs or output targets.
 */
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {drawForegroundFrame,profiles} from '../src/free/scene.mjs';
import probe from 'ffprobe-static';

const selection=process.argv[2];
if(!['smoke','vertical','vertical-smoke'].includes(selection)||process.argv.length!==3)
  throw new Error('Only synthetic smoke, vertical-smoke or vertical foreground profiles are permitted');
if(Number(process.versions.node.split('.')[0])!==24)
  throw new Error('Node 24 required');
const ffmpeg=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
  process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const approved={
  'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02',
  'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99'
};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.ok(existsSync(ffmpeg)&&existsSync(probe.path),'Encoder/FFprobe missing');
assert.equal(sha(readFileSync(ffmpeg)),approved[process.platform+'-'+process.arch],
  'FFmpeg is not the approved pinned encoder');
const profile=selection==='vertical-smoke'?{...profiles.vertical,frames:30}:profiles[selection];
const dest=resolve('out/foreground-'+selection);
assert.ok(!existsSync(dest),'Refusing to overwrite existing synthetic foreground');
mkdirSync(dest,{recursive:true});
const mov=join(dest,'synthetic-foreground-alpha.mov');
const encoder=spawn(ffmpeg,[
  '-nostdin','-hide_banner','-loglevel','error',
  '-f','rawvideo','-pixel_format','rgba',
  '-video_size',profile.width+'x'+profile.height,
  '-framerate',String(profile.fps),'-i','pipe:0',
  '-an','-c:v','prores_ks','-profile:v','4',
  '-pix_fmt','yuva444p10le','-alpha_bits','16','-y',mov
],{stdio:['pipe','ignore','pipe']});
let errors='';
encoder.stderr.on('data',b=>{errors=(errors+b.toString()).slice(-4000);});
encoder.stdin.on('error',()=>{});
for(let i=0;i<profile.frames;i++){
  const canvas=drawForegroundFrame(profile,i);
  const rgba=canvas.getContext('2d').getImageData(0,0,profile.width,profile.height).data;
  if(!encoder.stdin.write(Buffer.from(rgba.buffer,rgba.byteOffset,rgba.byteLength)))
    await once(encoder.stdin,'drain');
}
encoder.stdin.end();
const [exit]=await once(encoder,'close');
assert.equal(exit,0,'Synthetic foreground ProRes encoding failed: '+errors);
const info=JSON.parse(execFileSync(probe.path,[
  '-v','error','-select_streams','v:0',
  '-show_entries','stream=codec_name,profile,codec_tag_string,width,height,pix_fmt,r_frame_rate,nb_frames',
  '-of','json',mov
],{maxBuffer:1024*1024}).toString()).streams[0];
assert.equal(info.codec_name,'prores');
assert.ok(info.codec_tag_string==='ap4h'||info.profile==='4444',
  'ProRes 4444 FourCC/profile not present');
assert.equal(info.width,profile.width);
assert.equal(info.height,profile.height);
assert.equal(info.r_frame_rate,profile.fps+'/1');
assert.ok(info.pix_fmt?.startsWith('yuva444p'),
  'Foreground decoder does not expose an Alpha plane');
const sampleIndex=selection==='vertical'?42:12;
const pixelData=execFileSync(ffmpeg,[
  '-nostdin','-hide_banner','-loglevel','error','-i',mov,
  '-vf','select=eq(n\\,'+sampleIndex+')','-frames:v','1',
  '-f','rawvideo','-pix_fmt','rgba','pipe:1'
],{maxBuffer:profile.width*profile.height*4+1024*1024});
assert.equal(pixelData.length,profile.width*profile.height*4);
let top=0,visible=0;
const topRows=Math.floor(profile.height*.20);
for(let y=0;y<profile.height;y++)for(let x=0;x<profile.width;x++){
  const a=pixelData[(y*profile.width+x)*4+3];
  if(a>8)visible++;
  if(y<topRows&&a!==0)top++;
}
assert.equal(top,0,'Actual decoded MOV foreground upper area is not transparent');
assert.ok(visible>150,'Actual decoded MOV contains no visible foreground');
const report={
  status:'SYNTHETIC_CANVAS_FOREGROUND_PRORES4444_ALPHA_PASS',
  codec:info.codec_name,fourcc:info.codec_tag_string||null,
  decoder_pixel_format:info.pix_fmt,
  frame_count:profile.frames,
  sample_frame:sampleIndex,
  width:profile.width,height:profile.height,fps:profile.fps,
  decoded_top_nonzero_alpha_pixels:top,
  decoded_visible_foreground_pixels:visible,
  mov_sha256:sha(readFileSync(mov)),mov_bytes:statSync(mov).size,
  source:'ORIGINAL_SYNTHETIC_DEMO_ONLY',
  existing_opaque_render_mode:'UNCHANGED',
  creative_approval:'HUMAN_REVIEW_REQUIRED',
  premiere_windows:'NOT_TESTED',
  private_media_used:false
};
writeFileSync(join(dest,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('CANVAS_FOREGROUND_ALPHA_MOV_PASS',JSON.stringify(report));
