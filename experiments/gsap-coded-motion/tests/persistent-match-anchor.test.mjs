import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createThreeDepthRig} from '../src/three-depth.mjs';
import {createDataSculptureRig} from '../src/data-sculpture-rig.mjs';
import {attachPersistentMatchAnchor} from '../src/persistent-match-anchor.mjs';
test('a semantic foreground object holds its exact screen anchor across unlike perspective rigs',()=>{
 const first=createThreeDepthRig({THREE,frames:60});
 const second=createDataSculptureRig({THREE,frames:60});
 const link=attachPersistentMatchAnchor({THREE,first,second,width:1080,height:1920,start:20,end:41,fadeFrames:6,x:.42,y:.66,radiusPixels:120});
 assert.equal(link.meshes.length,2);
 assert.notEqual(link.meshes[0].parent,link.meshes[1].parent);
 for(const f of [0,15,20,21,35,40,41,46,59]){
  first.seekFrame(f);second.seekFrame(f);
  const q=link.seekFrame(f);
  assert.ok(q.matchErrorPixels<1e-6);
  assert.ok(q.centers.every(v=>Math.abs(v.x-453.6)<.001&&Math.abs(v.y-1267.2)<.001));
  assert.equal(q.centers[0].opacity,q.centers[1].opacity);
 }
 assert.equal(link.seekFrame(0).visible,false);
 first.seekFrame(35);second.seekFrame(35);const a=link.seekFrame(35);
 first.seekFrame(3);second.seekFrame(3);first.seekFrame(35);second.seekFrame(35);
 assert.deepEqual(link.seekFrame(35),a);
});
test('invalid geometry, unsafe contract and out-of-range frames fail',()=>{
 const first=createThreeDepthRig({THREE,frames:60}),second=createDataSculptureRig({THREE,frames:60});
 assert.throws(()=>attachPersistentMatchAnchor({THREE:{},first,second}),/two real/);
 assert.throws(()=>attachPersistentMatchAnchor({THREE,first,second,width:1080,height:1920,start:6,end:25,fadeFrames:7}),/Invalid/);
 const q=attachPersistentMatchAnchor({THREE,first,second,width:1080,height:1920,start:20,end:41,fadeFrames:6});
 assert.throws(()=>q.seekFrame(60),/outside/);
});
