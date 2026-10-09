// Validate ACTUAL HyperFrames-produced original transparent ProRes overlay.
// This reads only generated public-synthetic material; do not pass company media.
import assert from 'node:assert/strict';
import {readFileSync,statSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

const W=360,H=640,FPS=30,FRAME_COUNT=30;
const html=readFileSync(new URL('./overlay.html',import.meta.url),'utf8');
assert.match(html,/data-composition-id="original-alpha-overlay"/);
assert.match(html,/background:transparent/);
assert.ok(!/<(?:video|audio|iframe|script)|src\s*=|url\s*\(/i.test(html),
  'Synthetic Alpha composition must not use outside media or scripts');
const mov=resolve('out/hyperframes-original-alpha.mov');
const probe=JSON.parse(execFileSync(ffprobe.path,[
  '-v','error','-select_streams','v:0',
  '-show_entries','stream=codec_name,codec_tag_string,pix_fmt,width,height,r_frame_rate,nb_frames',
  '-of','json',mov
],{maxBuffer:1024*1024}).toString());
const info=probe.streams?.[0];
assert.equal(info?.codec_name,'prores');
assert.equal(info?.codec_tag_string,'ap4h');
assert.equal(info?.width,W);
assert.equal(info?.height,H);
assert.equal(info?.r_frame_rate,FPS+'/1');
assert.equal(Number(info?.nb_frames),FRAME_COUNT);
assert.ok(info?.pix_fmt?.startsWith('yuva444p'),
  'Encoder may have lost real ProRes 4444 Alpha');

function sample(index){
  const pixels=execFileSync(ffmpeg,[
    '-nostdin','-v','error','-i',mov,
    '-vf','select=eq(n\\,'+index+')',
    '-frames:v','1','-f','rawvideo','-pix_fmt','rgba','pipe:1'
  ],{maxBuffer:W*H*4+65536});
  assert.equal(pixels.length,W*H*4);
  let visible=0,upper=0,outer=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const alpha=pixels[(y*W+x)*4+3];
    if(alpha>8)visible++;
    if(y<180&&alpha!==0)upper++;
    if(x<16&&alpha!==0)outer++;
  }
  return {
    index,visible_alpha_pixels:visible,upper_nonzero_alpha_pixels:upper,
    left_margin_nonzero_alpha_pixels:outer,
    rgba_sha256:createHash('sha256').update(pixels).digest('hex')
  };
}
const samples=[sample(0),sample(15),sample(29)];
for(const value of samples){
  assert.equal(value.upper_nonzero_alpha_pixels,0,
    'Upper transparent stage was painted after encoding');
  assert.equal(value.left_margin_nonzero_alpha_pixels,0,
    'Left transparent margin unexpectedly contains Alpha');
}
assert.equal(samples[0].visible_alpha_pixels,0,'First overlay frame must be transparent');
assert.ok(samples[1].visible_alpha_pixels>1000,'Mid-frame lower third did not render');
assert.equal(samples[2].visible_alpha_pixels,0,'Last overlay frame must clear');
assert.notEqual(samples[0].rgba_sha256,samples[1].rgba_sha256);
const output={
  status:'HYPERFRAMES_ORIGINAL_ALPHA_MOV_PASS',
  source:'ORIGINAL_SYNTHETIC_HTML_CSS_ONLY',
  engine_version:'0.8.143',
  codec:info.codec_name,fourcc:info.codec_tag_string,
  decoded_pixel_format:info.pix_fmt,
  width:W,height:H,fps:FPS,frames:FRAME_COUNT,
  decoded_alpha_samples:samples,
  mov_sha256:createHash('sha256').update(readFileSync(mov)).digest('hex'),
  bytes:statSync(mov).size,
  private_media_used:false,
  third_party_gallery_used:false,
  installed_to_production:false,
  premiere_windows:'NOT_TESTED',
  creative_approval:'HUMAN_REQUIRED'
};
writeFileSync(resolve('out/hyperframes-original-alpha-report.json'),
  JSON.stringify(output,null,2)+'\n');
console.log('HYPERFRAMES_ALPHA_MOV_VERIFIED',JSON.stringify(output));
