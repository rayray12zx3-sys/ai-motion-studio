// Public, pure RGBA mask verifier; no real social screenshot is embedded.
// A fully transparent pink pixel is video-open, not blocked.
export function auditOverlayMask(overlay,mask,{alphaThreshold=8,maskAlphaThreshold=128}={}){
 if(!overlay||!mask||!Number.isInteger(overlay.width)||!Number.isInteger(overlay.height)||
   overlay.width<=0||overlay.height<=0||overlay.width!==mask.width||overlay.height!==mask.height||
   !overlay.data||!mask.data||overlay.data.length!==overlay.width*overlay.height*4||
   mask.data.length!==mask.width*mask.height*4)
   throw new Error('Overlay and mask must be matching RGBA pixel arrays');
 if(![alphaThreshold,maskAlphaThreshold].every(v=>Number.isInteger(v)&&v>=0&&v<=255))
   throw new Error('Invalid mask alpha threshold');
 let visible=0,blocked=0,first=null;
 for(let i=0;i<overlay.width*overlay.height;i++){
   const p=i*4;
   if(overlay.data[p+3]<=alphaThreshold)continue;
   visible++;
   if(mask.data[p+3]>=maskAlphaThreshold){
     blocked++;
     if(!first)first={x:i%overlay.width,y:Math.floor(i/overlay.width)};
   }
 }
 return {status:blocked===0?'NO_OPAQUE_MASK_OVERLAP':'OPAQUE_MASK_COLLISION',
   overlay_pixels:visible,collision_pixels:blocked,
   collision_ratio:visible?blocked/visible:0,first_collision:first,
   mask_uses_alpha:true,final_platform_review:'PENDING_HUMAN_REVIEW'};
}
export function requireNoMaskOverlap(overlay,mask,options){
 const report=auditOverlayMask(overlay,mask,options);
 if(report.collision_pixels>0||!report.overlay_pixels)
   throw new Error('Opaque mask collision or empty overlay');
 return report;
}
