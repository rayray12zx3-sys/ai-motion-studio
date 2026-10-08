import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawMultiObjectFrame, evaluateMultiObjectFrame, validateMultiObjectSpec} from '../src/creative/composition.mjs';
const original = JSON.parse(readFileSync(new URL('../examples/advanced-objects.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(original);

test('stable signal object persists across four named shots', () => {
  assert.doesNotThrow(() => validateMultiObjectSpec(original));
  const frames = [0,89,90,179,180,269,270,359];
  const states = frames.map(f => evaluateMultiObjectFrame(original,f));
  assert.deepEqual(states.map(s => s.segment_id), ['opener','opener','control','control','data','data','resolve','resolve']);
  assert.ok(states.every(s => s.objects.find(o => o.id === 'signal')));
  assert.ok(states.some(s => s.camera.zoom !== 1));
  assert.ok(Math.abs(states[1].objects[1].x-states[2].objects[1].x) < .03);
  assert.ok(Math.abs(states[1].objects[1].width-states[2].objects[1].width) < .03);
  assert.deepEqual(states[4].objects.map(o => o.id),['track','signal']);
});

test('JSON-only theme/motion changes produce distinct frames without changing code', () => {
  const other = clone(); other.objects[0].color = '#2459C6';
  other.objects[0].keyframes[2].x = .44;
  assert.doesNotThrow(() => validateMultiObjectSpec(other));
  assert.notDeepEqual(evaluateMultiObjectFrame(original,180),evaluateMultiObjectFrame(other,180));
  for (const fn of [
    s=>{s.objects[0].extra='unexpected';},
    s=>{s.objects[0].keyframes[1].ease='eval';},
    s=>{s.objects[0].keyframes[1].frame=0;},
    s=>{s.objects[0].keyframes[1].opacity=2;},
    s=>{s.objects[0].keyframes[1].width=-1;},
    s=>{s.objects[0].keyframes[1].x=NaN;},
    s=>{s.objects[0].keyframes[1].reveal=0;},
    s=>{s.objects[0].id='not allowed';},
    s=>{s.segments[2].start+=1;},
    s=>{s.camera[1].zoom=99;},
    s=>{s.fps=24;},
    s=>{s.duration_frames=999;},
    s=>{s.objects.push(s.objects[0]);},
  ]) {const s=clone();fn(s);assert.throws(()=>validateMultiObjectSpec(s));}
  assert.throws(()=>evaluateMultiObjectFrame(original,-1));
  assert.throws(()=>evaluateMultiObjectFrame(original,360));
});

test('portrait and landscape direct-access frame rendering is order-independent', () => {
  for (const profile of [{width:360,height:640,fps:30,frames:360},{width:640,height:360,fps:30,frames:360}]) {
    const frames=[0,60,180,359];
    const first=frames.map(f=>drawMultiObjectFrame(profile,f,original).toBuffer('image/png'));
    for (const f of [...frames].reverse()) drawMultiObjectFrame(profile,f,original);
    frames.forEach((f,i)=>assert.deepEqual(drawMultiObjectFrame(profile,f,original).toBuffer('image/png'),first[i]));
    assert.notDeepEqual(first[1],first[2]);
  }
  assert.throws(()=>drawMultiObjectFrame({width:360,height:640,fps:30,frames:180},12,original));
});
