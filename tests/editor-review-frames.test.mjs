import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectEditableReviewFrames} from '../scripts/select-editable-review-frames.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const fixture=parseEditableScene(readFileSync(new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));

test('review frames cover actual S1 clip starts/exits, keyframes and midpoint without copying media',()=>{
 const raw=serializeEditableScene(fixture);
 const selected=selectEditableReviewFrames(fixture);
 assert.deepEqual(selected,[0,3,4,9,10,14,15,19,20,25,26,29]);
 assert.ok(selected.includes(fixture.layers[1].start_frame-1));
 assert.ok(selected.includes(fixture.layers[1].start_frame));
 assert.ok(selected.includes(fixture.layers[1].end_frame-1));
 assert.ok(selected.includes(fixture.layers[1].end_frame));
 assert.ok(selected.includes(fixture.layers[2].keys[1].frame));
 assert.equal(serializeEditableScene(fixture),raw);
 assert.deepEqual(selectEditableReviewFrames(parseEditableScene(raw)),selected);
});
test('long, heavily keyed S1 scene selects bounded sorted unique events and both endpoints',()=>{
 const s=structuredClone(fixture);
 s.duration_frames=1800;
 const l=s.layers[0];
 l.end_frame=1800;
 l.keys=[
  ...Array.from({length:31},(_,i)=>({...l.keys[0],frame:i*58})),
  {...l.keys.at(-1),frame:1799}
 ];
 // Ensure ascending keyframes and valid bounds at the edge of v1 limits.
 assert.equal(l.keys.length,32);
 const raw=serializeEditableScene(s);
 const all=selectEditableReviewFrames(s,{limit:24});
 const limited=selectEditableReviewFrames(s,{limit:12});
 assert.equal(all.length,24);assert.equal(limited.length,12);
 assert.equal(limited[0],0);assert.equal(limited.at(-1),1799);
 assert.deepEqual([...limited].sort((a,b)=>a-b),limited);
 assert.equal(new Set(limited).size,limited.length);
 assert.ok(limited.every(x=>Number.isInteger(x)&&x>=0&&x<1800));
 assert.deepEqual(selectEditableReviewFrames(s,{limit:12}),limited);
 assert.equal(serializeEditableScene(s),raw);
});
test('review-only planner rejects invalid profiles, outside limits and unknown fields',()=>{
 for(const limit of [0,1,25,2.5,Infinity,-2]){
  assert.throws(()=>selectEditableReviewFrames(fixture,{limit}),/limit/i);
 }
 const scene=structuredClone(fixture);scene.assets=[{url:'https://private.invalid/media'}];
 assert.throws(()=>selectEditableReviewFrames(scene),/Media imports/);
 const unknown=structuredClone(fixture);unknown.visual_style='forbidden';
 assert.throws(()=>selectEditableReviewFrames(unknown),/Invalid scene/);
 assert.equal(selectEditableReviewFrames(fixture,{limit:2}).length,2);
});
