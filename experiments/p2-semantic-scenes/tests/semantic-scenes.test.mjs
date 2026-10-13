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
test('long editorial titles and persistent entity text fit frame/card bounds',()=>{
 const getSize=(svg,phrase,region='full')=>{
  // An independent output panel may repeat the state at a larger visual
  // size. Fit the persistent hero text within the HERO, not the whole frame.
  const scoped=region==='hero'?svg.slice(svg.indexOf('<g id="persistent-hero"')):svg;
  const ending='>'+phrase+'</text>';
  const end=scoped.indexOf(ending);
  assert.ok(end>=0,'Missing rendered text '+phrase);
  const tagStart=scoped.lastIndexOf('<text ',end);
  const attr=scoped.slice(tagStart,end).match(/font-size="([0-9.]+)"/);
  assert.ok(attr,'Missing rendered font size');
  return Number(attr[1]);
 };
 for(const p of [b,c]){
  for(const frame of [35,140,180,280,359]){
   const svg=renderSvgFrame(p,frame),v=inspectFrame(p,frame),s=v.shot;
   const words=s.title.split(' ');
   const options=words.slice(1).map((_,i)=>[
     words.slice(0,i+1).join(' '),words.slice(i+1).join(' ')]);
   const pieces=options.find(x=>x.every(part=>svg.includes('>'+part+'</text>')));
   assert.ok(pieces&&pieces.length===2,'Editorial must use its own two readable title lines');
   for(const part of pieces){
     const titlePx=getSize(svg,part);
     assert.ok(titlePx*part.length*.78<=p.profile.width-124+1,
       'Editorial line overflow: '+part);
     assert.ok(titlePx>=70,'Editorial headline too small: '+part);
   }
   const e=p.entities.find(x=>x.id===s.focusId);
   for(const [label,multiplier] of [[e.label,.72],[v.state[e.id],.67]]){
    const labelPx=getSize(svg,label,'hero');
    assert.ok(labelPx*label.length*multiplier<=v.hero.w*p.profile.width/1000-70+1,'Hero type overflow: '+label);
   }
  }
 }
});
test('final payoff is an enlarged source-linked product result across unrelated original briefs',()=>{
 for(const p of [b,c]){
  const frame=p.shots[2].start+35,view=inspectFrame(p,frame);
  const svg=renderSvgFrame(p,frame);
  assert.match(svg,/id="product-result-stage"/);
  assert.ok(svg.includes('SOURCE OBJECT / STILL THE SAME'));
  const hero=p.entities.find(e=>e.id===view.shot.focusId);
  assert.ok(svg.includes(hero.label));
  assert.ok(svg.includes(view.state[hero.id]));
  const stage=svg.slice(svg.indexOf('id="product-result-stage"'),svg.indexOf('id="persistent-hero"'));
  assert.ok(stage.includes('>'+view.state[hero.id]+'</text>'));
  const statusTag=stage.slice(stage.lastIndexOf('<text ',stage.indexOf('>'+view.state[hero.id]+'</text>')));
  const size=Number(statusTag.match(/font-size="([0-9.]+)"/)?.[1]);
  assert.ok(size>=50,'Main product payoff must stay at a legible editorial size');
 }
 // BEFORE any operation the incoming note is not falsely displayed as done.
 assert.doesNotMatch(renderSvgFrame(b,35),/id="product-result-stage"/);
 assert.doesNotMatch(renderSvgFrame(c,35),/id="product-result-stage"/);
});
test('camera tells a real action-to-result story without a spatial jump at the next shot',()=>{
 for(const p of [b,c]){
  const op=p.operations[0];
  const svgBefore=renderSvgFrame(p,op.gesture.start-1);
  const svgAt=renderSvgFrame(p,op.frame);
  const svgAtCut=renderSvgFrame(p,p.shots[2].start);
  const zoom=(svg)=>Number(svg.match(/id="semantic-camera"[^>]+scale\(([0-9.]+)\)/)?.[1]);
  assert.equal(zoom(svgBefore),1);
  assert.ok(zoom(svgAt)>1.04);
  assert.ok(Math.abs(zoom(renderSvgFrame(p,op.frame+1))-zoom(svgAt))<.001);
  assert.ok(Math.abs(zoom(svgAtCut)-zoom(renderSvgFrame(p,p.shots[1].end-1)))<.0001,
    'The product space must not snap at the scene cut');
  assert.equal(zoom(renderSvgFrame(p,p.shots[2].start+60)),1);
 }
});
test('real source-linked result material differs by product kind, without copied/remote source',()=>{
 for(const p of [b,c]){
  const op=p.operations[0], last=renderSvgFrame(p,300);
  const before=renderSvgFrame(p,op.frame-1);
  assert.doesNotMatch(before,/id="product-result-stage"/);
  assert.match(last,/id="source-to-result-continuity"/);
  assert.match(last,/data-material="fictional-(calendar|caption-preview)/);
  assert.match(last,/SOURCE OBJECT \/ STILL THE SAME/);
  assert.match(last,/id="persistent-hero"/);
  assert.match(last,/data-entity="/);
  if(p.entities[0].kind==='task'){
    assert.match(last,/id="original-calendar-result"/);
    assert.match(last,/WEEK \/ NEW PLACEMENT/);
    assert.doesNotMatch(last,/id="original-caption-result"/);
  }else{
    assert.match(last,/id="original-caption-result"/);
    assert.match(last,/NOT REAL AUDIO/);
    assert.doesNotMatch(last,/id="original-calendar-result"/);
  }
 }
});
test('authored opening reveals the same source before product context in time',()=>{
 for(const p of [b,c]) {
  const first=renderSvgFrame(p,0);
  const mid=renderSvgFrame(p,36);
  const later=renderSvgFrame(p,98);
  assert.match(first,/id="persistent-hero"[^>]+opacity="0.0000"/);
  assert.match(first,/id="workspace-progressive-reveal" opacity="0.0000"/);
  assert.match(mid,/id="persistent-hero"[^>]+opacity="1.0000"/);
  assert.match(later,/id="workspace-progressive-reveal" opacity="1.0000"/);
  assert.doesNotMatch(first,/id="opening-source-bridge"/);
  assert.match(later,/id="opening-source-bridge"/);
  assert.equal(first,renderSvgFrame(p,0));
 }
});
test('track preview scan is illustrative, source selection precedes state update',()=>{
 const p=c,op=p.operations[0];
 assert.match(renderSvgFrame(p,35),/id="illustrative-source-playhead"/);
 assert.doesNotMatch(renderSvgFrame(p,op.gesture.start-1),/id="selected-source-range"/);
 assert.match(renderSvgFrame(p,op.gesture.start),/id="selected-source-range"/);
 assert.match(renderSvgFrame(p,op.frame),/id="selected-source-range"/);
 assert.match(renderSvgFrame(p,op.frame+10),/id="selected-source-range"/);
 assert.doesNotMatch(renderSvgFrame(b,op.frame),/id="illustrative-source-playhead"/);
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
