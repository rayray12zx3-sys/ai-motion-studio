/** Synthetic-only HyperFrames CLI output verification.
 * Keeps render dependencies outside main's package.json/lock.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,statSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import ffprobe from 'ffprobe-static';
import ffmpeg from 'ffmpeg-static';
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
assert.match(html,/data-composition-id="original-synthetic-motion"/);
assert.match(html,/data-duration="1"/);
assert.match(html,/data-width="360" data-height="640"/);
assert.ok(!/<(?:video|audio|iframe)|<script|src\s*=|url\s*\(/i.test(html),
 'No remote or private media, scripts, urls or embeds in synthetic composition');
const path=resolve('out/hyperframes-original.mp4');
const d=JSON.parse(execFileSync(ffprobe.path,[
 '-v','error','-select_streams','v:0',
 '-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames',
 '-of','json',path
],{maxBuffer:1024*1024}).toString());
const stream=d.streams?.[0];
assert.equal(stream?.codec_name,'h264');
assert.equal(stream?.width,360);
assert.equal(stream?.height,640);
assert.equal(stream?.r_frame_rate,'30/1');
assert.equal(Number(stream?.nb_frames),30);
// Independently decode frames to prove this is *moving* rendered artwork,
// rather than a static background placed in a 30-frame container.
const decodedRGB=(movie,index)=>{
  const rgb=execFileSync(ffmpeg,[
    '-nostdin','-v','error','-i',movie,
    '-vf','select=eq(n\\,'+index+')','-frames:v','1',
    '-f','rawvideo','-pix_fmt','rgb24','pipe:1'
  ],{maxBuffer:360*640*3+65536});
  assert.equal(rgb.length,360*640*3,'Bad decoded RGB frame '+index);
  return createHash('sha256').update(rgb).digest('hex');
};
const sourceFrames=[0,15,29].map(n=>decodedRGB(path,n));
const repeatFile=resolve('out/hyperframes-original-repeat.mp4');
const repeatFrames=[0,15,29].map(n=>decodedRGB(repeatFile,n));
assert.deepEqual(repeatFrames,sourceFrames,
 'Same original authored animation must decode identical RGB frames across independent render processes');

assert.notEqual(sourceFrames[0],sourceFrames[1],
 'Head-to-middle contains no visual motion');
assert.notEqual(sourceFrames[1],sourceFrames[2],
 'Middle-to-tail contains no visual motion');
const payload=readFileSync(path);
assert.ok(payload.length>6000,'MP4 is unexpectedly tiny');
const result={
 status:'ISOLATED_HYPERFRAMES_ORIGINAL_MP4_PASS',
 source:'ORIGINAL_HTML_CSS_ONLY',
 engine:'hyperframes',engine_npm_version:'0.8.143',
 width:360,height:640,fps:30,frames:30,
 codec:'h264',decoded_rgb_keyframe_sha256:sourceFrames,
 moving_pixels_verified:true, independent_second_render_matching_rgb_frames:true,output_sha256:createHash('sha256').update(payload).digest('hex'),
 output_bytes:statSync(path).size,
 private_asset_used:false,
 installed_to_production:false,
 licensed_example_media_used:false,
 art_approval:'HUMAN_REQUIRED'
};
mkdirSync(dirname(path),{recursive:true});
writeFileSync(resolve('out/hyperframes-original-report.json'),
 JSON.stringify(result,null,2)+'\n');
console.log('HYPERFRAMES_ORIGINAL_MP4_BENCHMARK_PASS',JSON.stringify(result));
