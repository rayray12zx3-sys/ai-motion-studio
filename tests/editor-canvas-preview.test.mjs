import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {drawFrame,profiles} from '../src/free/scene.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {editTimeline} from '../experiments/editor-contract/timeline.mjs';
import {paintEditablePreview} from '../experiments/editor-canvas-preview/paint.mjs';

const original=parseEditableScene(readFileSync(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
function editedScene(){
 let s=editTimeline(original,{type:'move',layerId:'headline',deltaFrames:3});
 s=editTimeline(s,{type:'trim-end',layerId:'headline',frame:27});
 s=editTimeline(s,{type:'trim-start',layerId:'headline',frame:8});
 return editTimeline(s,{type:'insert-key',layerId:'headline',frame:12});
}
const pixels=(s,f,p)=>Buffer.from((()=>{
 const cv=paintEditablePreview(s,f,p);
 return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
})());
const hash=b=>createHash('sha256').update(b).digest('hex');

test('S4 isolated original synthetic Canvas preview renders exact 30 frames deterministically',()=>{
 const baseline=Array.from({length:30},(_,frame)=>pixels(original,frame));
 assert.equal(baseline.length,30);
 for(const f of [29,0,15,7,12,29,15,0]){
  assert.deepEqual(pixels(original,f),baseline[f]);
 }
 const hashes=baseline.map(hash);
 assert.equal(hashes.length,30);
 assert.ok(new Set(hashes).size>10,'Original graphics must visibly change across timeline frames');
 for(const f of [0,15,29]){
  const img=baseline[f];
  assert.equal(img.length,360*640*4);
  // Adapter uses an intentionally opaque synthetic base, not an alpha-output claim.
  for(let i=3;i<img.length;i+=4)assert.equal(img[i],255);
 }
 console.log('S4_ORIGINAL_SYNTHETIC_FRAME_SHA256',JSON.stringify({
  frame0:hashes[0],frame15:hashes[15],frame29:hashes[29],unique_frame_hashes:new Set(hashes).size
 }));
});
test('S4 saved/reopened immutable S3 edit changes expected original Canvas frames',()=>{
 const edited=editedScene();
 const same=parseEditableScene(serializeEditableScene(edited));
 assert.deepEqual(edited,same);
 assert.deepEqual(edited.layers[1].keys.map(k=>k.frame),[8,12,26]);
 const originalAt7=pixels(original,7),editedAt7=pixels(same,7);
 assert.notDeepEqual(originalAt7,editedAt7,'Original text visible before trimmed clip enters');
 const originalAt15=pixels(original,15),editedAt15=pixels(same,15);
 assert.notDeepEqual(originalAt15,editedAt15,'Edited headline timing must change visible pixels');
 assert.deepEqual(pixels(edited,15),pixels(same,15));
 const a=Array.from({length:30},(_,frame)=>hash(pixels(edited,frame)));
 for(const f of [29,0,15,7,12])assert.equal(hash(pixels(edited,f)),a[f]);
 assert.deepEqual(original.layers[1].keys.map(k=>k.frame),[4,25]);
 console.log('S4_EDITED_SYNTHETIC_FRAME_SHA256',JSON.stringify({
  frame7:a[7],frame15:a[15],frame29:a[29]
 }));
});
test('S4 1080x1920 synthetic preview scales normalized coordinates with no frame nondeterminism',()=>{
 const hi={width:1080,height:1920};
 const edited=editedScene();
 for(const f of [0,15,29]){
  const a=pixels(edited,f,hi),b=pixels(edited,f,hi);
  assert.equal(a.length,1080*1920*4);
  assert.deepEqual(a,b);
 }
});
test('S4 opt-in preview does not mutate official Canvas default output',()=>{
 const before=drawFrame(profiles.smoke,12).toBuffer('image/png');
 const inputBefore=serializeEditableScene(original);
 for(const f of [0,7,15,29])pixels(editedScene(),f);
 const after=drawFrame(profiles.smoke,12).toBuffer('image/png');
 assert.deepEqual(after,before,'Official renderer must remain byte-identical');
 assert.equal(serializeEditableScene(original),inputBefore);
});
test('S4 unsafe media, bad profile, invalid frames and unsupported glyph are refused',()=>{
 assert.throws(()=>paintEditablePreview(original,-1));
 assert.throws(()=>paintEditablePreview(original,30));
 assert.throws(()=>paintEditablePreview(original,1.5));
 assert.throws(()=>paintEditablePreview(original,12,{width:640,height:360}),/profile/);
 assert.throws(()=>paintEditablePreview(original,12,{width:1080,height:1080}),/profile/);
 const asset=structuredClone(original);asset.assets=[{source:'https://example.invalid/media'}];
 assert.throws(()=>paintEditablePreview(asset,12),/Media/);
 const invalidText=structuredClone(original);invalidText.layers[1].text='😀';
 assert.throws(()=>paintEditablePreview(invalidText,15),/glyph|Unsupported/);
});
