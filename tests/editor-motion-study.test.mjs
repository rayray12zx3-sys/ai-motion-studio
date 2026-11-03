import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '../experiments/editor-contract/scene.mjs';
import {selectEditableReviewFrames} from '../scripts/select-editable-review-frames.mjs';

const scene=parseEditableScene(readFileSync(
 new URL('../experiments/editor-contract/motion-study-original.json',import.meta.url),'utf8'));
const at=(frame,id)=>evaluateEditableFrame(scene,frame).layers.find(layer=>layer.id===id);

test('opt-in motion study uses existing bounded S1 v1 schema only',()=>{
 assert.equal(scene.fps,30);
 assert.equal(scene.duration_frames,180);
 assert.deepEqual(scene.canvas,{width:360,height:640});
 assert.deepEqual(scene.assets,[]);
 assert.equal(scene.layers.length,8);
 assert.ok(scene.layers.every(layer=>['text','rect'].includes(layer.type)));
 assert.deepEqual(parseEditableScene(serializeEditableScene(scene)),scene);
});

test('all motion-study layers explicitly fade to zero at clip boundaries, unlike baseline fixture',()=>{
 for(const clip of scene.layers){
  const first=at(clip.start_frame,clip.id);
  const last=at(clip.end_frame-1,clip.id);
  assert.equal(first.opacity,0,clip.id+' should enter invisibly');
  assert.equal(last.opacity,0,clip.id+' should exit invisibly');
  assert.ok(clip.keys.some(key=>key.opacity>=.8),
   clip.id+' must actually become visible between its fades');
  assert.ok(clip.keys.length>=4,clip.id+' must have enter, hold and exit phases');
  if(clip.start_frame>0)assert.equal(at(clip.start_frame-1,clip.id),undefined);
  if(clip.end_frame<scene.duration_frames)assert.equal(at(clip.end_frame,clip.id),undefined);
 }
});

test('two sequential six-second study beats and end credit have intentional opacity and timing',()=>{
 assert.equal(at(26,'intro-title').opacity,1);
 assert.equal(at(61,'intro-title').opacity,1);
 assert.equal(at(85,'intro-title').opacity,0);
 assert.equal(at(110,'second-title').opacity,1);
 assert.equal(at(145,'second-title').opacity,1);
 assert.equal(at(165,'second-title').opacity,0);
 assert.ok(at(171,'outro-credit').opacity>.8);
 assert.equal(at(179,'outro-credit').opacity,0);
 // Distinct beats have no accidental overlapping headline text.
 assert.equal(at(85,'second-title'),undefined);
 assert.equal(at(89,'intro-title'),undefined);
 assert.deepEqual(evaluateEditableFrame(scene,0).layers.map(l=>l.id),['intro-accent']);
});

test('deterministic seeking and bounded event review on the new opt-in fixture',()=>{
 const checkpoints=[0,6,18,26,48,85,87,89,110,120,145,165,171,179];
 const expected=checkpoints.map(frame=>evaluateEditableFrame(scene,frame));
 for(const frame of [179,0,120,48,165,89,6,145])evaluateEditableFrame(scene,frame);
 assert.deepEqual(checkpoints.map(frame=>evaluateEditableFrame(scene,frame)),expected);
 const selected=selectEditableReviewFrames(scene);
 assert.equal(selected.length,12);
 assert.equal(selected[0],0);
 assert.equal(selected.at(-1),179);
 assert.deepEqual([...selected].sort((a,b)=>a-b),selected);
 assert.equal(new Set(selected).size,selected.length);
 assert.ok(selected.every(frame=>Number.isInteger(frame)&&frame>=0&&frame<180));
});
