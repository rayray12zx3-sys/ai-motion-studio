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
// Fully decode *both* independent render outputs and compare every frame,
// not just sampled head/middle/tail. Byte-level MP4 files need not match;
// decoded visual output must match exactly for each seekable time index.
const WIDTH=360,HEIGHT=640,CHANNELS=3,EXPECTED_FRAMES=30;
const PIXELS_PER_FRAME=WIDTH*HEIGHT*CHANNELS;
function decodedFrameHashes(movie){
  const rgb=execFileSync(ffmpeg,[
    '-nostdin','-v','error','-i',movie,
    '-map','0:v:0','-an','-vsync','0',
    '-f','rawvideo','-pix_fmt','rgb24','pipe:1'
  ],{maxBuffer:PIXELS_PER_FRAME*(EXPECTED_FRAMES+1)});
  assert.equal(rgb.length,PIXELS_PER_FRAME*EXPECTED_FRAMES,
    'Decoded full-frame stream has wrong length: '+movie);
  return Array.from({length:EXPECTED_FRAMES},(_,frame)=>{
    const offset=frame*PIXELS_PER_FRAME;
    return createHash('sha256').update(
      rgb.subarray(offset,offset+PIXELS_PER_FRAME)).digest('hex');
  });
}
const firstHashes=decodedFrameHashes(path);
const secondHashes=decodedFrameHashes(resolve('out/hyperframes-original-repeat.mp4'));
assert.deepEqual(secondHashes,firstHashes,
 'All thirty independently rendered decoded RGB frames must match, frame by frame');
const uniqueFrameCount=new Set(firstHashes).size;
assert.ok(uniqueFrameCount>=10,
 'Motion is unexpectedly static: '+uniqueFrameCount+'/30 distinct decoded frames');
const sourceFrames=[0,15,29].map(i=>firstHashes[i]);
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
 moving_pixels_verified:true, independent_second_render_matching_rgb_frames:true,
 all_decoded_frames_matched_across_two_renders:true,
 decoded_frames_compared:30,unique_decoded_frame_hashes:uniqueFrameCount,
 decoded_full_sequence_hash_sha256:createHash('sha256').update(firstHashes.join('\\n')).digest('hex'),
 output_sha256:createHash('sha256').update(payload).digest('hex'),
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
