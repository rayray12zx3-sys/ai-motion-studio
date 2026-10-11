import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {auditEditableMotion} from '../experiments/editor-contract/motion-audit.mjs';

const original=parseEditableScene(readFileSync(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(original);

test('original regression scene retains two intentional but visually abrupt exits as review warnings',()=>{
 const before=serializeEditableScene(original);
 const report=auditEditableMotion(original);
 assert.equal(report.overall,'REVIEW_ONLY_NOT_A_RELEASE_GATE');
 assert.equal(report.warning_count,2);
 assert.deepEqual(report.warnings.map(x=>[x.code,x.layer_id,x.boundary_frame,x.adjacent_frame,x.opacity]),[
  ['VISIBLE_CLIP_EXIT','headline',26,25,1],
  ['VISIBLE_CLIP_EXIT','accent',20,19,1]
 ]);
 assert.equal(report.creative_approval,false);
 assert.equal(report.full_frame_qc,false);
 assert.equal(serializeEditableScene(original),before);
});

test('layers that actually fade to zero at clip boundaries have no abrupt-exit warnings',()=>{
 const scene=clone();
 for(const l of scene.layers){
  l.keys[0].opacity=0;
  l.keys.at(-1).opacity=0;
 }
 const report=auditEditableMotion(scene);
 assert.equal(report.warning_count,0);
 assert.deepEqual(report.warnings,[]);
});

test('a visible layer starting midway warns without changing clip semantics',()=>{
 const scene=clone();
 scene.layers[1].keys[0].opacity=.8;
 scene.layers[1].keys.at(-1).opacity=0;
 scene.layers[2].keys.at(-1).opacity=0;
 const report=auditEditableMotion(scene);
 assert.deepEqual(report.warnings.map(x=>[x.code,x.layer_id,x.boundary_frame,x.adjacent_frame]),[
  ['VISIBLE_CLIP_ENTRANCE','headline',4,3]
 ]);
});

test('video-endpoint holds are not wrongly called an exit cut; threshold is advisory',()=>{
 const scene=clone();
 assert.equal(scene.layers[0].end_frame,scene.duration_frames);
 const report=auditEditableMotion(scene,{opacityThreshold:.99});
 assert.equal(report.warning_count,2);
 assert.ok(report.warnings.every(w=>w.layer_id!=='card-title'));
 const low=auditEditableMotion(scene,{opacityThreshold:.0001});
 assert.equal(low.warning_count,2);
 assert.deepEqual(auditEditableMotion(scene),auditEditableMotion(scene));
});

test('bad thresholds and invalid scenes fail without compromising existing validation',()=>{
 for(const threshold of [0,1,-1,Infinity,NaN,'0.1',null])
  assert.throws(()=>auditEditableMotion(original,{opacityThreshold:threshold}),/opacityThreshold/);
 const invalid=clone();invalid.assets=[{url:'foreign'}];
 assert.throws(()=>auditEditableMotion(invalid),/Media imports not allowed/);
});
