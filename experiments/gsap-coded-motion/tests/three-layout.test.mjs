import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createThreeDepthRig} from '../src/three-depth.mjs';
import {projectHeroBounds,overlapArea,assertNoProtectedOcclusion,htmlRectToCanvasDesign} from '../src/three-layout-audit.mjs';
test('projection consumes real camera matrices and nested Three.js hero not a 2D proxy',()=>{
 const rig=createThreeDepthRig({THREE});
 const a=projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width:1080,height:1920});
 rig.seekFrame(220);
 const b=projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width:1080,height:1920});
 for(const v of [a,b]){assert.ok(v.right>v.left&&v.bottom>v.top);assert.ok(Number.isFinite(v.left));}
 assert.notDeepEqual(a,b);
});
test('3D layout check catches protected title collisions and allows clear separation',()=>{
 const bounds={left:100,top:300,right:780,bottom:1380};
 assert.deepEqual(assertNoProtectedOcclusion({hero:bounds,protectedRegions:[{name:'title',bounds:{left:100,top:200,right:500,bottom:340}}]}).passed,false);
 assert.deepEqual(assertNoProtectedOcclusion({hero:bounds,protectedRegions:[{name:'title',bounds:{left:100,top:80,right:500,bottom:250}}]}).passed,true);
 assert.equal(overlapArea(bounds,{left:800,top:300,right:900,bottom:400}),0);
});
test('DOM title regions are converted to design pixel coordinates regardless of screen size',()=>{
 assert.deepEqual(htmlRectToCanvasDesign({left:20,top:40,right:100,bottom:120},{left:0,top:0,width:540,height:960},1080,1920),{left:40,top:80,right:200,bottom:240});
});
