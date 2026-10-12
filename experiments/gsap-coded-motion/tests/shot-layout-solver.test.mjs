import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fitPerShotHeroLayout} from '../src/shot-layout-solver.mjs';
import {createThreeDepthRig} from '../src/three-depth.mjs';
import {createDataSculptureRig} from '../src/data-sculpture-rig.mjs';
import {projectHeroBounds,assertNoProtectedOcclusion} from '../src/three-layout-audit.mjs';

test('genuinely different 3D shots get individually fixed composition fits across moving camera',()=>{
 const first=createThreeDepthRig({THREE,frames:60});
 const second=createDataSculptureRig({THREE,frames:60});
 const protectedRegions=[{name:'title',bounds:{left:50,top:180,right:1030,bottom:440}},{name:'footer',bounds:{left:50,top:1770,right:1030,bottom:1850}}];
 const fit=fitPerShotHeroLayout({THREE,entries:[{id:'orbit',rig:first,start:0,end:32},{id:'ribbon',rig:second,start:26,end:60}],protectedRegions,width:1080,height:1920,offsets:[-1.2,-.6,0,.6,1.2],lower:.16,upper:.9,iterations:7});
 assert.equal(fit.rigCount,2);
 assert.equal(fit.stableForEntireShot,true);
 for(const [rig,shot] of [[first,fit.perShot[0]],[second,fit.perShot[1]]]){
   for(let f=shot.start;f<shot.end;f++){
     rig.seekFrame(f);
     const b=projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width:1080,height:1920});
     assert.equal(assertNoProtectedOcclusion({hero:b,protectedRegions}).passed,true);
     assert.ok(b.left>=0&&b.right<=1080&&b.top>=0&&b.bottom<=1920);
     assert.equal(rig.hero.scale.x,shot.scale);
   }
   assert.ok(shot.projectedHeight>0);
 }
});
test('malformed rig, viewport or invalid offsets fail closed',()=>{
 assert.throws(()=>fitPerShotHeroLayout({}),/3D/);
 const a=createThreeDepthRig({THREE,frames:60}),b=createDataSculptureRig({THREE,frames:60});
 const opts={THREE,entries:[{id:'a',rig:a,start:0,end:40},{id:'b',rig:b,start:30,end:60}],protectedRegions:[{name:'title',bounds:{left:0,top:0,right:100,bottom:100}}],width:1080,height:1920};
 assert.throws(()=>fitPerShotHeroLayout({...opts,offsets:[NaN]}),/Unsafe/);
 assert.throws(()=>fitPerShotHeroLayout({...opts,lower:0}),/Invalid/);
 assert.throws(()=>fitPerShotHeroLayout({...opts,entries:[{id:'no',rig:a,start:0,end:100},opts.entries[1]]}),/Invalid/);
});
