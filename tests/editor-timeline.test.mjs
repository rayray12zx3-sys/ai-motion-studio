import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateEditableFrame,parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {snapSecondsToFrame,editTimeline,trimTimelineClip,makeTimelineHistory,
 commitTimelineEdit,undoTimelineEdit,redoTimelineEdit} from '../experiments/editor-contract/timeline.mjs';

const initial=parseEditableScene(readFileSync(new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(initial);
const layer=(s,frame,id)=>evaluateEditableFrame(s,frame).layers.find(l=>l.id===id);
test('S3 snap seconds to exact 30fps integer frame with finite bounded time',()=>{
 assert.equal(snapSecondsToFrame(0),0);
 assert.equal(snapSecondsToFrame(1/30),1);
 assert.equal(snapSecondsToFrame(.049),1);
 assert.equal(snapSecondsToFrame(.05),2);
 assert.equal(snapSecondsToFrame(1),30);
 for(const x of [-1,NaN,Infinity,'1',60.1])
  assert.throws(()=>snapSecondsToFrame(x));
 assert.throws(()=>snapSecondsToFrame(1,29.97));
});
test('S3 move and duplicate preserve stable ids, clip/keyframe times and immutable originals',()=>{
 const moved=editTimeline(initial,{type:'move',layerId:'headline',deltaFrames:2});
 assert.equal(initial.layers[1].start_frame,4);
 assert.equal(moved.layers[1].start_frame,6);
 assert.deepEqual(moved.layers[1].keys.map(k=>k.frame),[6,27]);
 assert.equal(layer(moved,4,'headline'),undefined);
 assert.ok(layer(moved,6,'headline'));
 const created=editTimeline(moved,{type:'duplicate',layerId:'headline',newId:'second-headline',deltaFrames:-2});
 assert.equal(created.layers.length,4);
 assert.deepEqual(created.layers.find(l=>l.id==='second-headline').keys.map(k=>k.frame),[4,25]);
 assert.equal(created.layers.find(l=>l.id==='headline').start_frame,6);
 assert.equal(moved.layers.length,3);
 assert.deepEqual(created,evaluateSceneJsonRoundtrip(created));
});
function evaluateSceneJsonRoundtrip(scene){return parseEditableScene(serializeEditableScene(scene));}
test('S3 trim-start/end create exact interpolated linear boundary, preserve unaffected frames',()=>{
 const originalAt12=layer(initial,12,'headline');
 const first=editTimeline(initial,{type:'trim-start',layerId:'headline',frame:6});
 assert.equal(first.layers.find(l=>l.id==='headline').start_frame,6);
 assert.deepEqual(first.layers.find(l=>l.id==='headline').keys.map(k=>k.frame),[6,25]);
 assert.equal(layer(first,4,'headline'),undefined);
 assert.ok(Math.abs(layer(first,12,'headline').x-originalAt12.x)<1e-12);
 const after=editTimeline(first,{type:'trim-end',layerId:'headline',frame:23});
 const trimmed=after.layers.find(l=>l.id==='headline');
 assert.equal(trimmed.end_frame,23);
 assert.deepEqual(trimmed.keys.map(k=>k.frame),[6,22]);
 assert.equal(layer(after,23,'headline'),undefined);
 assert.ok(Math.abs(layer(after,12,'headline').x-originalAt12.x)<1e-12);
 assert.deepEqual(after,evaluateSceneJsonRoundtrip(after));
 assert.deepEqual(initial,evaluateSceneJsonRoundtrip(initial));
});
test('S3 only linear segments can be split; no silent eased-curve substitution',()=>{
 assert.throws(()=>trimTimelineClip(initial,'card-title','start',7),/curve-preserving/);
 assert.throws(()=>editTimeline(initial,{type:'insert-key',layerId:'card-title',frame:7}),/curve-preserving/);
 const allowed=editTimeline(initial,{type:'insert-key',layerId:'headline',frame:12});
 assert.deepEqual(allowed.layers[1].keys.map(k=>k.frame),[4,12,25]);
 assert.ok(Math.abs(layer(initial,10,'headline').x-layer(allowed,10,'headline').x)<1e-12);
 const changed=editTimeline(allowed,{type:'set-key',layerId:'headline',frame:12,property:'x',value:.75});
 assert.equal(changed.layers[1].keys[1].x,.75);
 assert.notDeepEqual(layer(changed,12,'headline'),layer(allowed,12,'headline'));
 const eased=editTimeline(changed,{type:'set-key',layerId:'headline',frame:25,property:'ease',value:'ease-out-cubic'});
 assert.ok(layer(eased,19,'headline').x!==layer(changed,19,'headline').x);
 const removed=editTimeline(changed,{type:'remove-key',layerId:'headline',frame:12});
 assert.deepEqual(removed,initial);
});
test('S3 serializable bounded undo/redo, redo invalidation, and reverse seek determinism',()=>{
 const originalSnapshot=serializeEditableScene(initial);
 let h=makeTimelineHistory(initial);
 h=commitTimelineEdit(h,{type:'move',layerId:'headline',deltaFrames:2});
 h=commitTimelineEdit(h,{type:'set-key',layerId:'headline',frame:6,property:'x',value:.38});
 assert.equal(h.past.length,2);
 assert.equal(h.future.length,0);
 assert.equal(h.present.layers[1].keys[0].x,.38);
 let previous=undoTimelineEdit(h);
 assert.equal(previous.present.layers[1].keys[0].x,.25);
 previous=undoTimelineEdit(previous);
 assert.equal(serializeEditableScene(previous.present),originalSnapshot);
 assert.equal(previous.future.length,2);
 const redone=redoTimelineEdit(previous);
 assert.equal(redone.present.layers[1].start_frame,6);
 const branched=commitTimelineEdit(redone,{type:'trim-end',layerId:'headline',frame:27});
 assert.equal(branched.future.length,0);
 const baseline=evaluateEditableFrame(branched.present,14);
 for(const frame of [29,0,23,14,8])evaluateEditableFrame(branched.present,frame);
 assert.deepEqual(baseline,evaluateEditableFrame(branched.present,14));
 assert.equal(initial.layers[1].start_frame,4);
 assert.deepEqual(makeTimelineHistory(initial).past,[]);
 const frozen=makeTimelineHistory(initial);
 for(let i=0;i<25;i++)frozen=commitTimelineEdit(frozen,{type:'set-key',layerId:'headline',frame:4,property:'x',value:i%2?.24:.25});
 assert.equal(frozen.past.length,20);
 assert.ok(frozen.future.length===0);
});
test('S3 invalid operations fail closed and cannot mutate caller data/history',()=>{
 const before=serializeEditableScene(initial);
 const operations=[
 {type:'move',layerId:'headline',deltaFrames:1.2},
 {type:'move',layerId:'headline',deltaFrames:27},
 {type:'move',layerId:'missing',deltaFrames:1},
 {type:'move',layerId:'headline',deltaFrames:1,unexpected:'url'},
 {type:'duplicate',layerId:'headline',newId:'card-title',deltaFrames:0},
 {type:'duplicate',layerId:'headline',newId:'bad id',deltaFrames:0},
 {type:'duplicate',layerId:'headline',newId:'copy',deltaFrames:30},
 {type:'trim-start',layerId:'headline',frame:26},
 {type:'trim-end',layerId:'headline',frame:5},
 {type:'trim-start',layerId:'headline',frame:4},
 {type:'trim-end',layerId:'headline',frame:26},
 {type:'insert-key',layerId:'headline',frame:4},
 {type:'insert-key',layerId:'headline',frame:25},
 {type:'remove-key',layerId:'headline',frame:4},
 {type:'remove-key',layerId:'headline',frame:12},
 {type:'set-key',layerId:'headline',frame:9,property:'x',value:.45},
 {type:'set-key',layerId:'headline',frame:4,property:'x',value:NaN},
 {type:'set-key',layerId:'headline',frame:4,property:'opacity',value:2},
 {type:'set-key',layerId:'headline',frame:4,property:'script',value:1},
 {type:'set-key',layerId:'headline',frame:4,property:'ease',value:'eval'},
 {type:'import-asset',layerId:'headline',url:'https://example.invalid'},
 ];
 for(const op of operations)assert.throws(()=>editTimeline(initial,op),undefined,JSON.stringify(op));
 assert.equal(serializeEditableScene(initial),before);
 const hist=makeTimelineHistory(initial);
 assert.throws(()=>commitTimelineEdit(hist,{type:'trim-start',layerId:'headline',frame:26}));
 assert.deepEqual(hist.present,initial);
 assert.deepEqual(hist.past,[]);
 assert.throws(()=>commitTimelineEdit({...hist,past:Array(21).fill(clone())},{type:'move',layerId:'headline',deltaFrames:1}));
});
