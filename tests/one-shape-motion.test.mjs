import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {drawOneShapeFrame,evaluateOneShape,BEATS,BPM,FPS,FRAMES,BEAT_FRAMES}
  from '../src/creative/one-shape-motion.mjs';
import {socialSafeRect} from '../src/creative/social-safe-area.mjs';

const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
test('original 8-beat 120 BPM script has 4 seconds at 30 fps',()=>{
 assert.equal(FRAMES,120);assert.equal(FPS,30);assert.equal(BPM,120);
 assert.equal(BEAT_FRAMES,15);assert.equal(BEATS.length,8);
 for(let beat=0;beat<8;beat++)assert.equal(evaluateOneShape(15*beat).beat,beat);
 assert.throws(()=>evaluateOneShape(-1));
 assert.throws(()=>evaluateOneShape(120));
 assert.throws(()=>evaluateOneShape(NaN));
});
test('one shape persists with predictable geometry, no teleports or overshoot explosion',()=>{
 let prev=null;
 for(let i=0;i<120;i++){
   const s=evaluateOneShape(i),v=s.shape;
   assert.ok(v.w>0&&v.h>0&&v.r>=0);
   assert.ok(v.w<=555&&v.h<=225);
   if(prev)for(const key of ['x','y','w','h','r'])
     assert.ok(Math.abs(v[key]-prev[key])<82,
      'shape '+key+' teleports at frame '+i);
   prev=v;
 }
 assert.ok(evaluateOneShape(15).shape.w<evaluateOneShape(29).shape.w);
 assert.ok(evaluateOneShape(58).shape.w<evaluateOneShape(70).shape.w);
 assert.ok(evaluateOneShape(112).shape.w>evaluateOneShape(119).shape.w);
});
test('user-visible text states are mutually exclusive, with no old/new overlay collisions',()=>{
 const fields=['hook','button','spinner','check','summary','slider','combo'];
 for(let frame=0;frame<FRAMES;frame++){
  const s=evaluateOneShape(frame);
  assert.ok(s.fade>=0&&s.fade<=1);
  for(let i=0;i<fields.length;i++)for(let j=i+1;j<fields.length;j++)
    assert.ok(s[fields[i]]*s[fields[j]]<.00001,
      fields[i]+' and '+fields[j]+' overlap at '+frame);
 }
});
test('direct cursor interaction and progress are frame-derived, not stateful',()=>{
 assert.ok(evaluateOneShape(33).pointer.down>.95);
 assert.ok(evaluateOneShape(79).pointer.x<evaluateOneShape(87).pointer.x);
 assert.ok(evaluateOneShape(79).drag<evaluateOneShape(87).drag);
 assert.equal(evaluateOneShape(89).drag,1);
 assert.equal(evaluateOneShape(119).pointer.alpha,0);
});
test('all alpha pixels in both 9:16 profiles stay inside the conservative safe rectangle',()=>{
 for(const profile of [{width:360,height:640},{width:540,height:960}]){
  const safe=socialSafeRect(profile);
  for(const frame of [0,11,15,26,33,45,57,68,81,97,106,119]){
   const canvas=drawOneShapeFrame(profile,frame);
   const pix=canvas.getContext('2d').getImageData(0,0,profile.width,profile.height).data;
   let blocked=0,visible=0;
   for(let y=0;y<profile.height;y++)for(let x=0;x<profile.width;x++){
    if(pix[(y*profile.width+x)*4+3]===0)continue;
    visible++;
    if(x<safe.x||x>=safe.x+safe.w||y<safe.y||y>=safe.y+safe.h)blocked++;
   }
   assert.equal(blocked,0,'alpha outside safe at '+frame);
   if(frame<119)assert.ok(visible>5,'all graphic content unexpectedly blank at '+frame);
   else assert.equal(visible,0,'final frame must be clear for the next shot');
  }
 }
});
test('random-access playback and fractional subframes are exact and composable',()=>{
 const p={width:360,height:640};
 const frames=[0,7,15,21.6,31,45,55.3,74,88.5,98,107,119];
 const snapshots=frames.map(f=>digest(drawOneShapeFrame(p,f).toBuffer('image/png')));
 assert.ok(new Set(snapshots).size>=10);
 frames.slice().reverse().forEach(f=>drawOneShapeFrame(p,f));
 assert.deepEqual(frames.map(f=>digest(drawOneShapeFrame(p,f).toBuffer('image/png'))),snapshots);
});

test('pointer touches progress rail and final score clears before geometric exit',()=>{
 for(let frame=78;frame<=89;frame++){
  const s=evaluateOneShape(frame);
  assert.ok(Math.abs(s.pointer.y-(s.shape.y-29))<4,'cursor misses rail at '+frame);
 }
 for(let f=109;f<120;f++){
  const s=evaluateOneShape(f);
  assert.equal(s.combo,0,'result label still visible during capsule exit at '+f);
 }
 for(let f=105;f<=107;f++){
  const s=evaluateOneShape(f);
  assert.equal(s.shape.w,535,'result should hold before exit at '+f);
 }
});
