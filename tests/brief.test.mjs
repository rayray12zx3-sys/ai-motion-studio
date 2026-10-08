import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {compileMotionBrief,validateMotionBrief} from '../src/creative/brief.mjs';
import {drawAdvancedFrame,loadAdvancedArt,validateAdvancedSpec} from '../src/creative/advanced.mjs';
const base=JSON.parse(readFileSync(new URL('../examples/advanced-film.json',import.meta.url)));
const read=id=>JSON.parse(readFileSync(new URL('../examples/brief-'+id+'.json',import.meta.url)));
test('two briefs compile with unchanged template, motion tracks and approved art',()=>{
  const a=read('studio'),b=read('learning'),before=JSON.stringify(base);
  const x=compileMotionBrief(a,base),y=compileMotionBrief(b,base);
  assert.equal(JSON.stringify(base),before);
  assert.notDeepEqual(x.copy,y.copy);
  assert.deepEqual(x.motion.segments,y.motion.segments);
  assert.deepEqual(x.motion.camera,y.motion.camera);
  assert.deepEqual(x.asset_manifest,y.asset_manifest);
  assert.notEqual(x.motion.objects[0].color,y.motion.objects[0].color);
  assert.doesNotThrow(()=>validateAdvancedSpec(y));
});
test('unexpected fields, unsafe text and unrecognized styles fail',()=>{
  for(const change of [
    b=>{b.remote_url='https://example.invalid';},
    b=>{b.style_id='remote-font';},
    b=>{b.beats[0].segment_id='wrong';},
    b=>{b.beats[0].headline='😀';},
    b=>{b.beats[0].footer='';},
    b=>{b.beats[0].asset_url='https://example.invalid';},
    b=>{b.beats.pop();}
  ]){
    const b=read('learning');change(b);assert.throws(()=>validateMotionBrief(b));
  }
  const x=compileMotionBrief(read('learning'),base);
  x.art_direction.panels[1].remote='bad';assert.throws(()=>validateAdvancedSpec(x));
});
test('both briefs draw deterministic portrait and landscape frames',async()=>{
  for(const brief of [read('studio'),read('learning')]){
    const spec=compileMotionBrief(brief,base);
    const art=await loadAdvancedArt(spec,dirname(fileURLToPath(new URL('../examples/advanced-film.json',import.meta.url))));
    for(const [width,height] of [[640,360],[360,640]]){
      const profile={width,height,fps:30,frames:360};
      const frames=[0,89,90,115,180,270,345,359];
      const baseline=frames.map(f=>drawAdvancedFrame(profile,f,spec,art).toBuffer('image/png'));
      frames.slice().reverse().forEach(f=>drawAdvancedFrame(profile,f,spec,art));
      frames.forEach((f,i)=>assert.deepEqual(drawAdvancedFrame(profile,f,spec,art).toBuffer('image/png'),baseline[i]));
      assert.deepEqual(baseline.at(-2),baseline.at(-1));
    }
  }
});
