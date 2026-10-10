import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditableScene,evaluateEditableFrame,moveEditableLayer,parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const original=parseEditableScene(readFileSync(new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(original);
const layer=(s,frame,id)=>evaluateEditableFrame(s,frame).layers.find(x=>x.id===id);

test('S1 scene validates and samples exact 30 fps frames with half-open layer intervals',()=>{
 assert.equal(validateEditableScene(original),true);
 assert.deepEqual(original.assets,[]);
 assert.deepEqual([0,15,29].map(f=>evaluateEditableFrame(original,f).frame),[0,15,29]);
 assert.deepEqual(evaluateEditableFrame(original,0).layers.map(x=>x.id),['card-title']);
 assert.deepEqual(evaluateEditableFrame(original,15).layers.map(x=>x.id),['accent','card-title','headline']);
 assert.deepEqual(evaluateEditableFrame(original,29).layers.map(x=>x.id),['card-title']);
});
test('S1 deterministic direct frame access, reverse seeks, and different declared easings',()=>{
 const a=evaluateEditableFrame(original,12);
 evaluateEditableFrame(original,29);evaluateEditableFrame(original,15);evaluateEditableFrame(original,0);
 assert.deepEqual(a,evaluateEditableFrame(original,12));
 assert.equal(layer(original,15,'card-title').x,.4);
 assert.equal(layer(original,0,'card-title').opacity,0);
 assert.equal(layer(original,29,'card-title').opacity,1);
 const linear=clone();linear.layers[0].keys[1].ease='linear';
 assert.ok(layer(original,7,'card-title').x>layer(linear,7,'card-title').x);
});
test('S1 immutable clip move keeps exact named timing through JSON save/reopen',()=>{
 const before=serializeEditableScene(original);
 const moved=moveEditableLayer(original,'headline',2);
 assert.notEqual(serializeEditableScene(moved),before);
 assert.deepEqual(original,parseEditableScene(before));
 assert.deepEqual(moved,parseEditableScene(serializeEditableScene(moved)));
 assert.deepEqual(moved.layers[1].keys.map(x=>x.frame),[6,27]);
 assert.equal(moved.layers[1].start_frame,6);assert.equal(moved.layers[1].end_frame,28);
 assert.ok(layer(original,4,'headline'));assert.equal(layer(moved,4,'headline'),undefined);
 assert.ok(layer(moved,6,'headline'));
 assert.deepEqual(evaluateEditableFrame(moved,15),evaluateEditableFrame(parseEditableScene(serializeEditableScene(moved)),15));
});
test('S1 overlapping clips have deterministic same-z ID ordering',()=>{
 const shifted=clone();shifted.layers[2].start_frame=4;shifted.layers[2].end_frame=26;
 shifted.layers[2].keys[0].frame=4;shifted.layers[2].keys[1].frame=25;
 assert.deepEqual(evaluateEditableFrame(shifted,15).layers.map(x=>x.id),['accent','card-title','headline']);
 const reversed=clone();reversed.layers.reverse();
 assert.deepEqual(evaluateEditableFrame(reversed,15),evaluateEditableFrame(original,15));
});
test('S1 rejects corrupt keys, nonfinite values, invalid fps, unknown media and foreign source',()=>{
 const invalid=[
 s=>{s.version=2;},s=>{s.kind='foreign';},s=>{s.fps=24;},
 s=>{s.duration_frames=1900;},s=>{s.canvas.width=999;},
 s=>{s.assets.push({source:'remote'});},s=>{s.remote='bad';},
 s=>{s.layers[0].extra='unlicensed';},s=>{s.layers[0].id='headline';},
 s=>{s.layers[0].type='image';},s=>{s.layers[0].color='red';},
 s=>{s.layers[0].start_frame=-1;},s=>{s.layers[0].end_frame=31;},
 s=>{s.layers[0].end_frame=1;},s=>{s.layers[0].keys[1].frame=0;},
 s=>{s.layers[0].keys[0].frame=1;},
 s=>{s.layers[0].keys[1].x=NaN;},s=>{s.layers[0].keys[1].x=Infinity;},
 s=>{s.layers[0].keys[1].opacity=1.1;},s=>{s.layers[0].keys[1].scale=0;},
 s=>{s.layers[0].keys[1].ease='eval';},s=>{s.layers[0].keys[1].svg='unsafe';},
 s=>{s.layers[1].text='';},s=>{s.layers[1].text='<tag>';},
 s=>{s.layers[0].text='Unexpected text';}
 ];
 for(const change of invalid){const s=clone();change(s);assert.throws(()=>validateEditableScene(s));}
 for(const frame of [-1,30,2.5])assert.throws(()=>evaluateEditableFrame(original,frame));
 for(const delta of [27,.5,-10])assert.throws(()=>moveEditableLayer(original,'headline',delta));
 assert.throws(()=>moveEditableLayer(original,'missing',1));
 assert.throws(()=>parseEditableScene('{'));
 assert.throws(()=>parseEditableScene('null'));
 assert.throws(()=>parseEditableScene(' '.repeat(65537)));
 assert.throws(()=>parseEditableScene('{"unexpected":true}'));
});
test('S1 no original scene mutation and no renderer/CLI required',()=>{
 const orig=clone();const moved=moveEditableLayer(orig,'headline',-2);
 assert.equal(orig.layers[1].start_frame,4);assert.equal(moved.layers[1].start_frame,2);
 assert.deepEqual(evaluateEditableFrame(original,0),evaluateEditableFrame(orig,0));
});
