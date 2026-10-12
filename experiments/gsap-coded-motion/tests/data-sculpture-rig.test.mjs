import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createDataSculptureRig} from '../src/data-sculpture-rig.mjs';
import {createThreeDepthRig} from '../src/three-depth.mjs';
test('data sculpture is real new 3D authored geometry rather than orbit recolor',()=>{
 const orbit=createThreeDepthRig({THREE,frames:300,palette:'mint'});
 const rig=createDataSculptureRig({THREE,frames:300});
 assert.equal(rig.scene.isScene,true);
 assert.equal(rig.camera.isPerspectiveCamera,true);
 assert.equal(rig.strips.length,4);
 assert.equal(rig.instanced.count,28);
 assert.equal(rig.rods.length,6);
 assert.equal(rig.instanced.isInstancedMesh,true);
 assert.equal(rig.strips[0].geometry.getAttribute('position').count,226);
 assert.ok(rig.hero.children.every(obj=>obj!==orbit.hero.children[0]));
 assert.notEqual(rig.rigType,'orbit');
});
test('full 3D ribbon/instance state is frame exact after arbitrary seek order',()=>{
 const rig=createDataSculptureRig({THREE,frames:300});
 const a=rig.seekFrame(143);
 const positions=Array.from(rig.strips[1].geometry.attributes.position.array);
 const instance=Array.from(rig.instanced.instanceMatrix.array);
 rig.seekFrame(0);rig.seekFrame(299);const b=rig.seekFrame(143);
 assert.deepEqual(b,a);
 assert.deepEqual(Array.from(rig.strips[1].geometry.attributes.position.array),positions);
 assert.deepEqual(Array.from(rig.instanced.instanceMatrix.array),instance);
 assert.notEqual(rig.seekFrame(78).ribbonVertex0,a.ribbonVertex0);
 assert.throws(()=>rig.seekFrame(300),/outside/);
});
test('reject invalid camera profile and malformed Three.js runtime',()=>{
 assert.throws(()=>createDataSculptureRig({THREE,width:0}),/profile/);
 assert.throws(()=>createDataSculptureRig({THREE,cameraPath:{frames:200,at(){}}}),/camera/);
 assert.throws(()=>createDataSculptureRig({THREE:{}}),/Real Three/);
});
