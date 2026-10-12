import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,inspectFrame,renderSvgFrame} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief,sampleBriefs} from '../examples/two-original-briefs.mjs';
const copy=v=>JSON.parse(JSON.stringify(v));
const b=compileSemanticScenes(boardBrief),c=compileSemanticScenes(captionBrief);
test('two genuinely different briefs share one compiler and renderer, no film-specific source branches',()=>{
 assert.equal(sampleBriefs.length,2);
 assert.equal(b.shots.length,3);assert.equal(c.shots.length,3);
 assert.notEqual(b.shots[1].layout,c.shots[1].layout);
 assert.notEqual(b.entities[0].kind,c.entities[0].kind);
 assert.notEqual(b.operations[0].trigger,c.operations[0].trigger);
 for(const p of [b,c]){
  assert.equal(p.profile.frames,360);
  assert.equal(p.shots.map(s=>s.end-s.start).reduce((a,v)=>a+v),360);
  assert.equal(p.artStatus,'PENDING_HUMAN');
  assert.equal(p.music.auditioned,false);
  assert.equal(p.shots[0].focusId,p.shots[1].focusId);
  assert.equal(p.shots[1].focusId,p.shots[2].focusId);
 }
});
test('causal UI operation is visible exactly at its frame and persists in result scene',()=>{
 for(const p of [b,c]){
  const op=p.operations[0];
  assert.equal(inspectFrame(p,op.frame-1).state[op.entityId],op.from);
  assert.equal(inspectFrame(p,op.frame).state[op.entityId],op.to);
  assert.equal(inspectFrame(p,p.profile.frames-1).state[op.entityId],op.to);
  assert.ok(renderSvgFrame(p,op.frame).includes(op.to));
 }
});
test('shared semantic hero position is continuous at shot boundaries',()=>{
 for(const p of [b,c]){
  const second=p.shots[1],prior=p.shots[0];
  assert.equal(inspectFrame(p,second.start).hero.x,prior.hero.x);
  assert.equal(inspectFrame(p,second.start).hero.y,prior.hero.y);
  assert.ok(Math.abs(inspectFrame(p,second.start+13).hero.x-second.hero.x)<1);
  const lastSecond=inspectFrame(p,second.end-1).hero;
  const firstThird=inspectFrame(p,p.shots[2].start).hero;
  assert.equal(firstThird.x,lastSecond.x);
  assert.equal(firstThird.y,lastSecond.y);
  if(p.operations[0].trigger==='drag'){
    assert.notEqual(lastSecond.y,second.hero.y);
    assert.ok(renderSvgFrame(p,p.operations[0].frame).includes('id="visible-product-response"'));
  }

 }
});
test('out-of-order frame evaluation and SVG export are byte-for-byte deterministic',()=>{
 for(const p of [b,c]){
  const first=[0,130,359,165,240,24,130,0,359].map(f=>renderSvgFrame(p,f));
  const next=[359,0,165,24,240,130,359,130,0].map(f=>renderSvgFrame(p,f));
  assert.equal(first[0],next[1]);
  assert.equal(first[1],next[5]);
  assert.equal(first[2],next[0]);
  assert.equal(first[3],next[2]);
  assert.match(first[0],/^<svg /);
  assert.match(first[0],/id="persistent-hero"/);
 }
});
test('illegal external source or malicious surface text is never accepted',()=>{
 for(const patch of [
  x=>x.assetPolicy='remote-or-user',
  x=>x.entities[0].label='http://injected.example',
  x=>x.shots[0].title='<script>alert(1)</script>',
  x=>x.shots[0].hero.x=999,
  x=>x.shots[1].start=119,
  x=>x.shots[1].focusId='not-an-entity',
  x=>x.operations[0].resultShotId='make-believe',
  x=>x.operations[0].frame=169,
  x=>x.operations[0].to=x.operations[0].from,
  x=>x.music.auditioned=true,
  x=>x.theme.onBackground='#FFFFFF',
  x=>x.theme.surfaceMuted='#F4F4F4'
 ]){
  const example=copy(boardBrief);patch(example);
  assert.throws(()=>compileSemanticScenes(example));
 }
});
test('a genuine product gesture is visibly drawn before the event and yields separate UI result',()=>{
 for(const p of [b,c]) {
  const op=p.operations[0];
  const before=renderSvgFrame(p,op.gesture.start+3);
  const after=renderSvgFrame(p,op.frame);
  const later=renderSvgFrame(p,p.shots[2].start+25);
  assert.match(before,/id="causal-action"/);
  assert.ok(before.includes('data-gesture="'+op.trigger+'"'));
  assert.doesNotMatch(before,/id="visible-product-response"/);
  assert.match(after,/id="visible-product-response"/);
  assert.ok(after.includes(op.resultLabel));
  assert.ok(later.includes(op.resultLabel));
  assert.ok(renderSvgFrame(p,op.frame).includes('id="causal-action"'));
 }
});
test('unmotivated tiny or reversed gesture trajectory is rejected',()=>{
 for(const mutate of [
   op=>{op.gesture.from.x=op.gesture.to.x;op.gesture.from.y=op.gesture.to.y;},
   op=>{op.gesture.start=op.frame;},
   op=>{op.gesture.start=op.frame-80;},
   op=>{op.gesture.to.x=1001;},
   op=>{delete op.resultLabel;}
 ]){
   const ex=copy(boardBrief);mutate(ex.operations[0]);
   assert.throws(()=>compileSemanticScenes(ex));
 }
});
test('a harmless ampersand must be escaped in frame output',()=>{
 const ex=copy(boardBrief);ex.entities[0].label='Plan & schedule';
 const p=compileSemanticScenes(ex);
 assert.match(renderSvgFrame(p,0),/Plan &amp; schedule/);
 assert.doesNotMatch(renderSvgFrame(p,0),/Plan & schedule/);
});
test('no external media, paid provider, random clock, or runtime network API is needed',async()=>{
 const fs=await import('node:fs');
 const code=fs.readFileSync(new URL('../src/semantic-scenes.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(code,/Math\.random\s*\(|new Date\s*\(|\bfetch\s*\(|XMLHttpRequest\s*\(/);
 assert.doesNotMatch(code,/import\s+['"](?:three|gsap|remotion)/);
});
