import test from 'node:test';
import assert from 'node:assert/strict';
import {auditOverlayMask,requireNoMaskOverlap} from '../src/creative/mask-collision.mjs';
const img=(w,h,data)=>({width:w,height:h,data:Uint8ClampedArray.from(data)});
test('transparent pink is video-open and opaque gray masks visible overlay pixels',()=>{
 const overlay=img(3,2,[0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,255,0,0,0,0]);
 const mask=img(3,2,[242,184,200,0,164,165,160,255,242,184,200,0,164,165,160,255,242,184,200,0,164,165,160,255]);
 const result=auditOverlayMask(overlay,mask);
 assert.equal(result.overlay_pixels,4);
 assert.equal(result.collision_pixels,2);
 assert.deepEqual(result.first_collision,{x:1,y:0});
 assert.equal(result.status,'OPAQUE_MASK_COLLISION');
 assert.throws(()=>requireNoMaskOverlap(overlay,mask));
 const clear=img(3,2,[0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,0]);
 assert.equal(requireNoMaskOverlap(clear,mask).collision_pixels,0);
});
test('mask mismatch, empty content and invalid alpha thresholds reject',()=>{
 const blank=img(1,1,[0,0,0,0]),pink=img(1,1,[242,184,200,0]);
 assert.throws(()=>requireNoMaskOverlap(blank,pink));
 assert.throws(()=>auditOverlayMask(blank,img(2,1,[0,0,0,0,0,0,0,0])));
 assert.throws(()=>auditOverlayMask(blank,pink,{maskAlphaThreshold:-1}));
 assert.throws(()=>auditOverlayMask(blank,{width:1,height:1,data:[]}));
});
