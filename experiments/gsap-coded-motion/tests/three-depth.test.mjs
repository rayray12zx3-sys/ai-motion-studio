import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createThreeDepthRig} from '../src/three-depth.mjs';
import {createShaderTransition,VERTEX,FRAGMENT} from '../src/shader-transition.mjs';
test('real MIT Three.js scene uses 3D hierarchy, PBR light, camera perspective and procedural shader',()=>{
 const rig=createThreeDepthRig({THREE,width:1080,height:1920,frames:300});
 assert.equal(rig.scene.isScene,true);assert.equal(rig.camera.isPerspectiveCamera,true);
 assert.equal(rig.hero.children.length,5);
 const core=rig.hero.getObjectByName('central-hero');assert.equal(core.material.isMeshPhysicalMaterial,true);
 assert.equal(rig.scene.getObjectByName('procedural-energy-field').material.isShaderMaterial,true);
 assert.equal(rig.rings.length,3);assert.equal(rig.markers.children.length,8);
 assert.equal(rig.hero.parent,rig.stage);
 const world=core.getWorldPosition(new THREE.Vector3());assert.ok(world.distanceTo(rig.camera.position)>1);
});
test('frame-absolute 3D orientation and camera matrices are reproducible in arbitrary order',()=>{
 const rig=createThreeDepthRig({THREE,frames:300});
 const a=rig.seekFrame(155);const matrixA=rig.hero.matrixWorld.toArray();
 rig.seekFrame(299);rig.seekFrame(13);const b=rig.seekFrame(155);
 assert.deepEqual(a,b);assert.deepEqual(matrixA,rig.hero.matrixWorld.toArray());
 assert.notDeepEqual(rig.seekFrame(0),rig.seekFrame(160));
 assert.throws(()=>rig.seekFrame(300),/outside/);assert.throws(()=>rig.seekFrame(-1),/outside/);
});
test('real world-space depth and perspective projection are unlike flat 2D parallax',()=>{
 const rig=createThreeDepthRig({THREE});rig.seekFrame(90);
 const a=rig.hero.getObjectByName('central-hero'),point=a.getWorldPosition(new THREE.Vector3());
 const near=point.clone().add(new THREE.Vector3(0,0,2)).project(rig.camera);
 const far=point.clone().add(new THREE.Vector3(0,0,-2)).project(rig.camera);
 assert.notEqual(near.z,far.z);
 const projection0=rig.camera.projectionMatrix.toArray();assert.notEqual(projection0[0],projection0[5]);
});
test('GPU scene-to-scene effect owns two render targets and explicit zero/one boundaries',()=>{
 const calls=[],renderer={setRenderTarget(target){calls.push(['target',target===null?'screen':'offscreen'])},render(scene,camera){calls.push(['render',scene.type,camera.type])}};
 const transition=createShaderTransition({THREE,renderer,width:1080,height:1920});
 const sceneA=createThreeDepthRig({THREE,palette:'mint'}),sceneB=createThreeDepthRig({THREE,palette:'lavender'});
 sceneA.seekFrame(40);sceneB.seekFrame(40);
 transition.render(sceneA,sceneB,0);
 assert.equal(transition.uniforms.uProgress.value,0);assert.deepEqual(calls.filter(v=>v[0]==='target').map(v=>v[1]),['offscreen','offscreen','screen']);
 transition.render(sceneA,sceneB,1);assert.equal(transition.uniforms.uProgress.value,1);
 assert.ok(FRAGMENT.includes('uProgress')&&FRAGMENT.includes('texture2D')&&VERTEX.includes('gl_Position'));
 assert.throws(()=>transition.render(sceneA,sceneB,1.1),/0..1/);
 transition.dispose();
});
