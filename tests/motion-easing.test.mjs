import test from 'node:test';
import assert from 'node:assert/strict';
import {easeValue,easeBetween,bouncePulse,MOTION_PROFILES}
 from '../src/creative/motion-easing.mjs';
import {evaluateOneShape} from '../src/creative/one-shape-motion.mjs';

test('profiles are genuinely distinct acceleration curves rather than aliases',()=>{
 const types=new Set(Object.values(MOTION_PROFILES).filter(x=>x!=='damped-bounce'&&x!=='anticipation-squash'));
 assert.ok(types.size>=4);
 for(const curve of types){
  assert.equal(easeValue(curve,-1),0);assert.equal(easeValue(curve,0),0);
  assert.equal(easeValue(curve,1),1);assert.equal(easeValue(curve,2),1);
 }
 assert.ok(easeValue('ease-out-cubic',.25)>.5);
 assert.ok(easeValue('ease-in-out-cubic',.25)<.1);
 assert.ok(easeValue('ease-in-out-sine',.25)>.1);
 assert.ok(easeValue('ease-out-back',.75)>1.02,'The button must settle from a visible, restrained overshoot');
 assert.ok(easeValue('ease-out-back',.75)<1.04,'Do not exaggerate the bounce');
 assert.throws(()=>easeValue('unknown',.4));
 assert.throws(()=>easeBetween(1,3,2,'linear'));
 assert.throws(()=>bouncePulse(1,0,0));
});
test('button punches out and settles; press anticipates before collapsing',()=>{
 const widths=Array.from({length:30},(_,f)=>evaluateOneShape(f).shape.w);
 assert.equal(widths[15],280);assert.equal(widths[27],470);
 assert.ok(widths[24]>470,'Back easing must overshoot target geometry before settling');
 assert.ok(Math.abs(widths[29]-470)<.001);
 assert.ok(evaluateOneShape(32).shape.w<evaluateOneShape(30).shape.w,'Visible anticipation');
 assert.equal(evaluateOneShape(34).shape.w,470);
 const speed=(f)=>Math.abs(evaluateOneShape(f+1).shape.w-evaluateOneShape(f).shape.w);
 assert.ok(speed(16)>speed(25)*3,'Button launch should move rapidly then settle');
 assert.ok(speed(39)>speed(34)*2,'Condense should accelerate into a snappy middle');
});
test('check and success pop bounce but do not shake through the entire composition',()=>{
 assert.ok(evaluateOneShape(60).timing.checkBounce>.04,'Checkmark scale response visible');
 assert.equal(evaluateOneShape(72).timing.checkBounce,0);
 assert.ok(evaluateOneShape(96).timing.rewardBounce>.035,'Reward has selective bounce');
 assert.equal(evaluateOneShape(112).timing.rewardBounce,0);
 for(let f=0;f<120;f++){
   const s=evaluateOneShape(f);
   assert.ok(Math.abs(s.timing.checkBounce)<=.15);
   assert.ok(Math.abs(s.timing.rewardBounce)<=.12);
   assert.ok(s.shape.w>0&&s.shape.w<555);
 }
});
test('drag and exit have independent, measurable velocity characteristics',()=>{
 const x=f=>evaluateOneShape(f).pointer.x;
 const velocity=f=>Math.abs(x(f+1)-x(f));
 assert.ok(velocity(81)>velocity(76)*2,'Drag must accelerate and then decelerate');
 assert.ok(velocity(88)<velocity(83),'Cursor must gently land');
 const w=f=>evaluateOneShape(f).shape.w;
 const exitSpeed=f=>Math.abs(w(f+1)-w(f));
 assert.ok(exitSpeed(112)>exitSpeed(107)*3,'Exit must have a distinct fast center');
 assert.ok(exitSpeed(118)<exitSpeed(112),'Exit must decelerate at edge');
});
test('eight beat boundaries preserve geometry and bounded velocity',()=>{
 for(let f=1;f<120;f++){
  const a=evaluateOneShape(f-1).shape,b=evaluateOneShape(f).shape;
  assert.ok(Math.abs(a.w-b.w)<82,'Width teleports at '+f);
  assert.ok(Math.abs(a.h-b.h)<50,'Height teleports at '+f);
 }
 for(let beat=0;beat<8;beat++){
  const s=evaluateOneShape(15*beat);
  assert.equal(s.beat,beat);
 }
});
