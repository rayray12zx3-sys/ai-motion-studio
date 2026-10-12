import test from 'node:test';
import assert from 'node:assert/strict';
import {compileCameraChoreography,auditCameraMotion} from '../src/camera-choreography.mjs';
const keys=[
 {frame:0,x:-.65,y:.1,z:12.2,lookX:0,lookY:0,lookZ:0},
 {frame:100,x:.2,y:.4,z:11.7,lookX:.2,lookY:.1,lookZ:0},
 {frame:205,x:-.2,y:-.2,z:12.1,lookX:0,lookY:0,lookZ:0},
 {frame:299,x:.5,y:0,z:12.6,lookX:0,lookY:0,lookZ:0}
];
test('keyed real 3D camera has deterministic absolute frame poses',()=>{
 const path=compileCameraChoreography({frames:300,keys});
 for(let i=0;i<300;i++){const p=path.at(i);assert.equal(p.frame,i);assert.ok(p.z>=4);}
 const before=path.at(100);path.at(277);path.at(4);assert.deepEqual(path.at(100),before);
 assert.equal(path.at(0).x,keys[0].x);assert.equal(path.at(299).z,keys.at(-1).z);
 assert.equal(auditCameraMotion(path).passed,true);
});
test('camera velocity is nearly C1 at internal shot waypoints',()=>{
 const c=compileCameraChoreography({frames:300,keys});
 for(const f of [100,205]){
  const p=c.at(f-1),mid=c.at(f),q=c.at(f+1);
  assert.ok(Math.abs((mid.x-p.x)-(q.x-mid.x))<.004);
  assert.ok(Math.abs((mid.y-p.y)-(q.y-mid.y))<.004);
 }
});
test('reject missing coordinates, unsafe depth and duplicate camera frames',()=>{
 assert.throws(()=>compileCameraChoreography({frames:300,keys:[keys[0],{...keys[1],frame:299,z:0}]}),/depth/);
 assert.throws(()=>compileCameraChoreography({frames:300,keys:[keys[0],{...keys[1],frame:299,x:NaN}]}),/finite/);
 assert.throws(()=>compileCameraChoreography({frames:300,keys:[keys[0],{...keys[1],frame:0}]}),/increase/);
});
