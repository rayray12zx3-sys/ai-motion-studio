import test from 'node:test';
import assert from 'node:assert/strict';
import {SPEC,cameraAt,pointAt,projectTile,makeDeviceTexture,paintFrame}
  from './canvas-phone-camera.mjs';

test('original snapcn-inspired path remains deterministic and ends frontally',()=>{
 assert.equal(SPEC.frames,240);
 assert.equal(SPEC.fps,30);
 const zero=cameraAt(0),end=cameraAt(239);
 assert.equal(zero.rotateX,52);
 assert.equal(zero.rotateY,28);
 assert.equal(end.rotateX,0);
 assert.equal(end.rotateY,0);
 assert.equal(end.rotateZ,0);
 assert.equal(end.zoom,1);
 for(const f of [0,1,12,27,60,95,120,175,239]){
  assert.deepEqual(cameraAt(f),cameraAt(f));
  for(const p of projectTile(0,0,320,656,f))
    assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
  const center=pointAt(160,328,f);
  assert.ok(Number.isFinite(center.x)&&Number.isFinite(center.y));
  assert.ok(Math.abs(center.x)<4000&&Math.abs(center.y)<4500);
 }
 assert.throws(()=>cameraAt(-1),/invalid frame/);
 assert.throws(()=>cameraAt(240),/invalid frame/);
});
test('local original synthetic plate produces nonempty and repeatable native Canvas pixels',async()=>{
 const t=await makeDeviceTexture();
 assert.equal(t.width,640);assert.equal(t.height,1312);
 const a=paintFrame(95,t),b=paintFrame(95,t);
 assert.equal(a.width,SPEC.width);assert.equal(a.height,SPEC.height);
 // Compare RGB samples, not PNG metadata: actual raster motion must be deterministic.
 const p=a.getContext('2d').getImageData(280,330,550,1250).data;
 const q=b.getContext('2d').getImageData(280,330,550,1250).data;
 assert.deepEqual(Buffer.from(p),Buffer.from(q));
 assert.ok(new Set(Array.from(p).filter((_,i)=>i%4===0)).size>20,
  'source must be visible; cannot be a gradient-only dummy render');
 const other=paintFrame(239,t).getContext('2d').getImageData(280,330,550,1250).data;
 assert.notDeepEqual(Buffer.from(p),Buffer.from(other));
});
