import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateAdvancedSpec,loadAdvancedArt,drawAdvancedFrame,advancedTransition} from '../src/creative/advanced.mjs';
const location=fileURLToPath(new URL('../examples/advanced-film.json',import.meta.url));
const original=JSON.parse(readFileSync(location,'utf8'));
const clone=()=>structuredClone(original);
test('advanced four-beat copy and local image validate',async()=>{
  assert.doesNotThrow(()=>validateAdvancedSpec(original));
  const art=await loadAdvancedArt(original,dirname(location));
  assert.equal(art.image.width,128);assert.equal(art.image.height,128);
  assert.equal(art.record.id,'signal-art');
  assert.equal(art.record.license,'CC0-1.0');
  assert.equal(art.record.sha256,original.asset_manifest.assets[0].sha256);
});
test('advanced raster validation refuses tampering and remote/unlicensed assets',async()=>{
  for(const fn of [
    s=>{s.copy[1].segment_id='wrong';},
    s=>{s.copy[0].headline='😀';},
    s=>{s.copy[0].subtitle='字'.repeat(50);},
    s=>{s.copy[0].unknown='x';},
    s=>{s.asset_manifest.assets[0].id='unknown';},
    s=>{s.extra='unknown';},
  ]){const spec=clone();fn(spec);assert.throws(()=>validateAdvancedSpec(spec));}
  for(const fn of [
    s=>{s.asset_manifest.assets[0].path='https://example.invalid/a.png';},
    s=>{s.asset_manifest.assets[0].path='../secret.png';},
    s=>{s.asset_manifest.assets[0].sha256='0'.repeat(64);},
    s=>{s.asset_manifest.assets[0].license='NONE';}
  ]){const spec=clone();fn(spec);await assert.rejects(()=>loadAdvancedArt(spec,dirname(location)));}
});
test('direct-access drawing with verified raster is frame-order deterministic in both ratios',async()=>{
  const art=await loadAdvancedArt(original,dirname(location));
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:360};
    const sampled=[0,65,95,185,275,359];
    const before=sampled.map(frame=>drawAdvancedFrame(profile,frame,original,art).toBuffer('image/png'));
    for(const frame of [...sampled].reverse())drawAdvancedFrame(profile,frame,original,art);
    sampled.forEach((frame,i)=>assert.deepEqual(
      drawAdvancedFrame(profile,frame,original,art).toBuffer('image/png'),before[i]));
    assert.notDeepEqual(before[2],before[4]);
  }
});


test('incoming and outgoing titles share an overlapping, nonempty timeline at every scene boundary',()=>{
  for(const boundary of [90,180,270]){
    const enter=advancedTransition(original,boundary-12);
    const middle=advancedTransition(original,boundary);
    const leave=advancedTransition(original,boundary+12);
    assert.equal(enter.incoming,middle.incoming);
    assert.equal(middle.incoming,leave.incoming);
    assert.ok(enter.progress>0 && enter.progress<.5);
    assert.ok(Math.abs(middle.progress-.5)<.001);
    assert.ok(leave.progress>.5 && leave.progress<1);
    assert.ok(enter.progress < middle.progress && middle.progress < leave.progress);
  }
  assert.equal(advancedTransition(original,0).incoming,null);
  assert.equal(advancedTransition(original,359).incoming,null);
  assert.throws(()=>advancedTransition(original,360));
});
test('scene transitions never become blank frames and closing frame is deliberately held',async()=>{
  const art=await loadAdvancedArt(original,dirname(location));
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:360};
    const holds=[332,345,359].map(f=>drawAdvancedFrame(profile,f,original,art).toBuffer('image/png'));
    assert.deepEqual(holds[0],holds[1], 'closing composition must stop changing');
    assert.deepEqual(holds[1],holds[2], 'final frame must not cut an ongoing animation');
    for(const frame of [89,90,91,179,180,181,269,270,271]){
      const image=drawAdvancedFrame(profile,frame,original,art);
      const data=image.getContext('2d').getImageData(0,0,width,height).data;
      let contrast=0;
      for(let i=0;i<data.length;i+=128){
        if(data[i]<100&&data[i+1]<110&&data[i+2]<130) contrast++;
      }
      assert.ok(contrast>20, 'transition frame must preserve substantive on-screen imagery: '+frame);
    }
  }
});
