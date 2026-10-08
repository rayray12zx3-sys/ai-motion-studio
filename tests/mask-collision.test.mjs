import test from 'node:test';
import assert from 'node:assert/strict';
import {auditOverlayMask,requireNoMaskOverlap} from '../src/creative/mask-collision.mjs';
const frame=(w,h,data)=>({width:w,height:h,data:Uint8ClampedArray.from(data)});
test('custom color-mask audit detects pixels outside simple rectangular assumptions',()=>{
 const overlay=frame(3,2,[0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,255,0,0,0,0]);
 const guide=frame(3,2,[242,184,200,255,164,165,160,255,242,184,200,255,
  164,165,160,255,242,184,200,255,164,165,160,255]);
 const result=auditOverlayMask(overlay,guide);
 assert.equal(result.overlay_pixels,4);
 assert.equal(result.collision_pixels,2);
 assert.deepEqual(result.first_collision,{x:0,y:0});
 assert.equal(result.status,'FORBIDDEN_COLOR_INTERSECTION');
 assert.throws(()=>requireNoMaskOverlap(overlay,guide));
 const cleaned=frame(3,2,[0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0]);
 assert.equal(requireNoMaskOverlap(cleaned,guide).collision_pixels,0);
});
test('mask dimension mismatch, bad options and empty outputs are blocked',()=>{
 const blank=frame(1,1,[0,0,0,0]),pink=frame(1,1,[242,184,200,255]);
 assert.throws(()=>requireNoMaskOverlap(blank,pink));
 assert.throws(()=>auditOverlayMask(blank,frame(2,1,[1,2,3,4,1,2,3,4])));
 assert.throws(()=>auditOverlayMask(blank,pink,{alphaThreshold:-1}));
 assert.throws(()=>auditOverlayMask(blank,{width:1,height:1,data:[]}));
});
