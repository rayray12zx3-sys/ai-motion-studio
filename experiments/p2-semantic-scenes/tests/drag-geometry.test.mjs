import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,inspectFrame,renderSvgFrame} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';

const copy=x=>structuredClone(x);
test('original Atlas drag remains a complete, persistent, on-screen interaction',()=>{
  const p=compileSemanticScenes(boardBrief),op=p.operations[0];
  const h=p.shots.find(s=>s.id===op.shotId).hero;
  assert.equal(op.trigger,'drag');
  assert.ok(op.gesture.from.x>=h.x&&op.gesture.from.x<=h.x+h.w);
  assert.ok(op.gesture.from.y>=h.y&&op.gesture.from.y<=h.y+h.h);
  const end=inspectFrame(p,p.shots[1].end-1).hero;
  assert.ok(end.x>=0&&end.y>=0&&end.x+end.w<=1000&&end.y+end.h<=1000);
  assert.equal(end.x,op.gesture.to.x-end.w/2);
  assert.equal(end.y,op.gesture.to.y-end.h/2);
  assert.match(renderSvgFrame(p,op.frame),/id="causal-action"/);
  assert.equal(inspectFrame(p,p.shots[2].start).hero.x,end.x);
  assert.equal(inspectFrame(p,p.shots[2].start).hero.y,end.y);
});
test('reject source-detached drag cursors and partial off-screen landings',()=>{
  for(const [edit,diagnostic] of [
    [x=>{x.operations[0].gesture.from.x=80},/Drag pointer must begin on the authored source object/],
    [x=>{x.operations[0].gesture.from.y=750},/Drag pointer must begin on the authored source object/],
    [x=>{x.operations[0].gesture.to.x=970},/Drag landing must keep the complete persistent object in frame/],
    [x=>{x.operations[0].gesture.to.x=30},/Drag landing must keep the complete persistent object in frame/],
    [x=>{x.operations[0].gesture.to.y=970},/Drag landing must keep the complete persistent object in frame/]
  ]) {
    const bad=copy(boardBrief);edit(bad);
    assert.throws(()=>compileSemanticScenes(bad),diagnostic);
  }
});
test('non-drag selection workflow is unchanged by drag-specific geometry constraints',()=>{
  const old=compileSemanticScenes(captionBrief);
  assert.equal(old.operations[0].trigger,'select');
  assert.equal(inspectFrame(old,old.operations[0].frame).state['spoken-moment'],'Caption draft ready');
  assert.match(renderSvgFrame(old,old.operations[0].frame),/id="visible-product-response"/);
});
