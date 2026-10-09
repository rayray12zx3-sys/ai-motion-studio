import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {drawProductUIChoreographyFrame,evaluateProductUIChoreography,
 CHOREOGRAPHY_FRAMES} from '../src/creative/product-ui-choreography.mjs';
import {socialSafeRect} from '../src/creative/social-safe-area.mjs';

const digest=x=>createHash('sha256').update(x).digest('hex');
const profile={width:360,height:640,fps:30,frames:120};

test('real 4-second 30fps storyboard has two clicks, card merge, result and 12-frame held end',()=>{
 assert.equal(CHOREOGRAPHY_FRAMES,120);
 const start=evaluateProductUIChoreography(0);
 const click1=evaluateProductUIChoreography(33);
 const click2=evaluateProductUIChoreography(63);
 const merged=evaluateProductUIChoreography(92);
 const final=evaluateProductUIChoreography(119);
 assert.equal(start.merge,0);
 assert.ok(click1.clickA>.9&&click2.clickB>.9);
 assert.ok(merged.merge>.99);
 assert.equal(final.score,2);
 assert.equal(final.cursor.visible,0);
 assert.ok(final.resultAlpha>.99);
 assert.equal(final.hold,true);
 assert.throws(()=>evaluateProductUIChoreography(-1));
 assert.throws(()=>evaluateProductUIChoreography(120));
 assert.throws(()=>evaluateProductUIChoreography(1.5));
});
test('the same card morphs over time, while the second card converges and fades',()=>{
 const first=evaluateProductUIChoreography(68),middle=evaluateProductUIChoreography(78),
   last=evaluateProductUIChoreography(91);
 assert.ok(first.cardA.x<middle.cardA.x&&middle.cardA.x<last.cardA.x);
 assert.ok(first.cardB.x>middle.cardB.x&&middle.cardB.x>last.cardB.x);
 assert.equal(last.cardA.x,last.cardB.x);
 assert.equal(last.cardA.w,last.cardB.w);
 assert.ok(last.cardA.r>first.cardA.r);
 assert.equal(last.cardBAlpha,0);
 assert.ok(evaluateProductUIChoreography(91).resultAlpha>.05);
});
test('stage properties do not teleport at named choreography boundaries',()=>{
 for(const boundary of [18,32,44,48,60,68,71,75,82,88,90,91,94,101,105,108]){
   const a=evaluateProductUIChoreography(boundary-1),b=evaluateProductUIChoreography(boundary);
   for(const field of ['cardA','cardB','hero']){
     for(const prop of ['x','y','w','h','r'])
       assert.ok(Math.abs(a[field][prop]-b[field][prop])<25,
         field+'.'+prop+' jumped at '+boundary);
   }
 }
});
test('deterministic order-independent PNGs, actual 9:16 transparency, final hold',()=>{
 const safe=socialSafeRect(profile);
 const frames=[0,12,24,33,47,63,74,86,98,108,119];
 const images=frames.map(f=>drawProductUIChoreographyFrame(profile,f).toBuffer('image/png'));
 assert.ok(new Set(images.map(digest)).size>=8,'No rich motion sequence');
 for(const frame of frames.slice().reverse())drawProductUIChoreographyFrame(profile,frame);
 frames.forEach((f,i)=>assert.equal(digest(drawProductUIChoreographyFrame(profile,f).toBuffer('image/png')),digest(images[i])));
 assert.equal(digest(images[9]),digest(images[10]),'Last 12 frames must be stationary');
 for(const frame of [0,33,63,90,119]){
   const data=drawProductUIChoreographyFrame(profile,frame)
     .getContext('2d').getImageData(0,0,profile.width,profile.height).data;
   let inside=0,outside=0;
   for(let y=0;y<profile.height;y++)for(let x=0;x<profile.width;x++){
     if(data[(y*profile.width+x)*4+3]===0)continue;
     if(x<safe.x||x>=safe.x+safe.w||y<safe.y||y>=safe.y+safe.h)outside++;
     else inside++;
   }
   assert.equal(outside,0,'Choreography leaks opaque pixels at '+frame);
   assert.ok(inside>250,'Frame is invisible');
 }
});
