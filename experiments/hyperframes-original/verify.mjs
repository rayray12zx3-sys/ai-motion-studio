/** Synthetic-only HyperFrames CLI output verification.
 * Keeps render dependencies outside main's package.json/lock.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,statSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import ffprobe from 'ffprobe-static';
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
const payload=readFileSync(path);
assert.ok(payload.length>6000,'MP4 is unexpectedly tiny');
const result={
 status:'ISOLATED_HYPERFRAMES_ORIGINAL_MP4_PASS',
 source:'ORIGINAL_HTML_CSS_ONLY',
 engine:'hyperframes',engine_npm_version:'0.8.143',
 width:360,height:640,fps:30,frames:30,
 codec:'h264',output_sha256:createHash('sha256').update(payload).digest('hex'),
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
