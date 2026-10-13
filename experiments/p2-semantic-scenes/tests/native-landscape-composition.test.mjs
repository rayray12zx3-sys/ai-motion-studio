import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,inspectFrame} from '../src/semantic-scenes.mjs';
import {renderNativeLandscapeFrame,NATIVE_LANDSCAPE_PROFILE} from '../src/native-landscape-composition.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
import {loadDirectorBrief} from '../scripts/load-director-brief.mjs';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

test('two unrelated authored stories generate fully native 16:9 semantic geometry',()=>{
 const atlas=compileSemanticScenes(boardBrief);
 const index=compileSemanticScenes(captionBrief);
 assert.deepEqual(NATIVE_LANDSCAPE_PROFILE,{width:1920,height:1080,fps:30,frames:360});
 const result=[];
 for(const plan of [atlas,index]){
  const action=plan.operations[0];
  for(const frame of [0,1,30,119,120,action.gesture.start,action.frame-1,action.frame,239,240,300,359]){
   const scene=renderNativeLandscapeFrame(plan,frame);
   const state=inspectFrame(plan,frame);
   assert.match(scene,/^<svg[^>]*width="1920" height="1080"/);
   assert.equal(scene.match(/<svg\b/g)?.length,1,'Native scene must not embed a portrait SVG');
   assert.doesNotMatch(scene,/id="original-semantic-film"/);
   assert.match(scene,/id="native-landscape-stage"/);
   assert.match(scene,/id="native-persistent-hero"/);
   assert.match(scene,new RegExp('data-shot="'+state.shotId+'"'));
   assert.match(scene,/landscape-authored-rear/);
   assert.ok(scene.includes('data-entity="'+plan.entities[0].id+'"'));
   assert.equal(scene,renderNativeLandscapeFrame(plan,frame),'Seek order and replay must be deterministic');
   const pos=scene.match(/id="native-persistent-hero"[^>]*data-x="([0-9.]+)" data-y="([0-9.]+)" data-width="([0-9.]+)" data-height="([0-9.]+)"/);
   assert.ok(pos,'Native hero geometry must be present as real landscape pixels');
   const [x,y,w,h]=pos.slice(1).map(Number);
   assert.ok(x>=950&&x+w<=1785&&y>=220&&y+h<=875, 'Native hero must remain within right semantic stage');
   assert.ok(w>40&&h>30);
   const expected=state.state[plan.entities[0].id];
   assert.ok(scene.includes(expected.replace(/&/g,'&amp;')),'Frame must show authoritative state');
   if(frame>=action.frame&&state.shotId!==plan.shots[0].id){
     assert.match(scene,/id="native-action-feedback"/);
   }
  }
  const before=renderNativeLandscapeFrame(plan,action.frame-1);
  const after=renderNativeLandscapeFrame(plan,action.frame);
  assert.notEqual(before,after);
  assert.ok(after.includes(action.to),'Operation must visibly alter same source object state');
  result.push(renderNativeLandscapeFrame(plan,180));
 }
 assert.notEqual(result[0],result[1]);
 assert.match(result[0],/data-layout="board"/);
 assert.match(result[1],/data-layout="track"/);
 assert.match(result[1],/native-source-selection/);
});
test('native random seek preserves drag object at the same action boundary',()=>{
 const plan=compileSemanticScenes(boardBrief),op=plan.operations[0];
 const before=inspectFrame(plan,op.frame-1),after=inspectFrame(plan,op.frame);
 const box=state=>{
   const svg=renderNativeLandscapeFrame(plan,state.frame);
   const m=svg.match(/id="native-persistent-hero"[^>]*data-x="([0-9.]+)" data-y="([0-9.]+)"/);
   return m.slice(1).map(Number);
 };
 const a=box(before),b=box(after);
 assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<18,'Continuous authored gesture cannot teleport');
 assert.equal(renderNativeLandscapeFrame(plan,op.frame),renderNativeLandscapeFrame(plan,op.frame));
});
test('third ChatGPT-authored original JSON brief uses unchanged renderer and escaped text',()=>{
 const root=mkdtempSync(join(tmpdir(),'native-landscape-test-'));
 try{
   const third=structuredClone(captionBrief);
   third.id='third-unrelated-native-brief';
   third.shots[1].title='另一個原創動畫';
   third.entities[0].label='A & B footage selection';
   const file=join(root,'third.json');
   writeFileSync(file,JSON.stringify(third));
   const result=renderNativeLandscapeFrame(loadDirectorBrief('--spec',file),180);
   assert.match(result,/另一個原創動畫/);
   assert.match(result,/A &amp; B footage selection/);
   assert.doesNotMatch(result,/A & B footage selection/);
 } finally{rmSync(root,{recursive:true,force:true});}
});
test('incorrect profile and frame seek fail closed',()=>{
 const plan=compileSemanticScenes(boardBrief);
 assert.throws(()=>renderNativeLandscapeFrame({...plan,profile:{...plan.profile,width:1920}},0),/Opt-in native-landscape/);
 assert.throws(()=>renderNativeLandscapeFrame(plan,-1),/seek frame/);
 assert.throws(()=>renderNativeLandscapeFrame(plan,360),/seek frame/);
});
