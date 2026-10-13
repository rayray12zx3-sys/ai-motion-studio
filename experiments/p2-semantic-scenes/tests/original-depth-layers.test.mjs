import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,renderSvgFrame,inspectFrame} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
import {loadDirectorBrief} from '../scripts/load-director-brief.mjs';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

const copy=x=>structuredClone(x);
test('two truly different authored products have persistent spatially layered output',()=>{
  const a=compileSemanticScenes(boardBrief),b=compileSemanticScenes(captionBrief);
  assert.notEqual(a.shots[0].layers[0].kind,b.shots[0].layers[0].kind);
  for(const p of [a,b]){
    const first=p.shots[0].layers[0];
    assert.ok(p.shots.every(s=>s.layers.some(l=>l.id===first.id)));
    assert.ok(p.shots.some(s=>s.layers.length>1));
    const start=renderSvgFrame(p,30),gesture=renderSvgFrame(p,p.operations[0].frame);
    assert.match(start,/id="authored-rear-depth"/);
    assert.match(gesture,/id="authored-front-depth"/);
    assert.match(gesture,/class="semantic-depth-layer"/);
    assert.notEqual(gesture,renderSvgFrame(p,p.operations[0].frame+1));
    assert.equal(gesture,renderSvgFrame(p,p.operations[0].frame));
    assert.equal(inspectFrame(p,p.operations[0].frame).state[p.operations[0].entityId],p.operations[0].to);
  }
  assert.match(renderSvgFrame(a,180),/data-kind="spatial-grid"/);
  assert.match(renderSvgFrame(b,180),/data-kind="signal-ribbon"/);
});
test('new shot motion grammar is declared in JSON and not special-cased in renderer',()=>{
  const dir=mkdtempSync(join(tmpdir(),'p2-depth-'));
  try {
    const variant=copy(captionBrief);
    variant.id='third-original-depth-story';
    variant.shots[1].title='CHOOSE A SPECIFIC PHRASE';
    variant.shots[1].layers[1].bounds.x=545;
    const file=join(dir,'third.json');
    writeFileSync(file,JSON.stringify(variant));
    const p=loadDirectorBrief('--spec',file);
    assert.equal(p.id,variant.id);
    assert.match(renderSvgFrame(p,190),/id="layer-selection-focus"/);
    assert.equal(p.shots[1].layers[1].bounds.x,545);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('fail closed for remote text, unsafe positions, invalid layers and lineage drift',()=>{
  for(const mutate of [
    x=>x.shots[0].layers[0].bounds.x=900,
    x=>x.shots[0].layers[0].drift.x=60,
    x=>x.shots[0].layers[0].opacity=75,
    x=>x.shots[0].layers[0].kind='video',
    x=>x.shots[0].layers[0].purpose='https://untrusted.example/material',
    x=>x.shots[1].layers[0].kind='signal-ribbon',
    x=>x.shots[1].layers[1].id=x.shots[1].layers[0].id,
    x=>x.shots[0].layers=Array.from({length:5},(_,i)=>({...x.shots[0].layers[0],id:'layer-'+i})),
  ]){
    const bad=copy(boardBrief);mutate(bad);
    assert.throws(()=>compileSemanticScenes(bad));
  }
});
test('legacy no-layer scenes retain deterministic exact same output contract',()=>{
  const plain=copy(boardBrief);
  for(const s of plain.shots)delete s.layers;
  const p=compileSemanticScenes(plain);
  assert.ok(p.shots.every(s=>s.layers.length===0));
  for(const f of [0,60,119,120,165,240,359]){
    const svg=renderSvgFrame(p,f);
    assert.doesNotMatch(svg,/authored-(rear|front)-depth/);
    assert.match(svg,/id="persistent-hero"/);
    assert.equal(svg,renderSvgFrame(p,f));
  }
});
