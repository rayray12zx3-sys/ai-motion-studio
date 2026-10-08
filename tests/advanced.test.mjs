import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateAdvancedSpec,loadAdvancedArt,drawAdvancedFrame} from '../src/creative/advanced.mjs';
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
