// Generic pixel-level forbidden-color mask verifier for RGBA overlays.
// This code never embeds an operator image, social handle or company asset.
export function auditOverlayMask(overlay,mask,options={}){
 const {alphaThreshold=8,blockedMinR=190,blockedRGGap=25,blockedRBGap=18}=options;
 if(!overlay||!mask||!Number.isInteger(overlay.width)||!Number.isInteger(overlay.height)||
   overlay.width<=0||overlay.height<=0||
   overlay.width!==mask.width||overlay.height!==mask.height||
   !overlay.data||!mask.data||
   overlay.data.length!==overlay.width*overlay.height*4||
   mask.data.length!==mask.width*mask.height*4)
   throw new Error('Overlay and mask must be equally sized RGBA pixels');
 if(![alphaThreshold,blockedMinR,blockedRGGap,blockedRBGap].every(
   n=>Number.isInteger(n)&&n>=0&&n<=255))
   throw new Error('Invalid mask color threshold');
 let total=0,blocked=0,first=null;
 for(let i=0;i<overlay.width*overlay.height;i++){
   const p=i*4;
   if(overlay.data[p+3]<=alphaThreshold)continue;
   total++;
   const r=mask.data[p],g=mask.data[p+1],b=mask.data[p+2];
   if(mask.data[p+3]>0&&r>=blockedMinR&&r-g>=blockedRGGap&&r-b>=blockedRBGap){
     blocked++;
     if(!first)first={x:i%overlay.width,y:Math.floor(i/overlay.width)};
   }
 }
 return {status:blocked===0?'NO_COLOR_INTERSECTION':'FORBIDDEN_COLOR_INTERSECTION',
   overlay_pixels:total,collision_pixels:blocked,
   collision_ratio:total?blocked/total:0,first_collision:first,
   role_confirmation_required:true,platform_visual_review_required:true};
}
export function requireNoMaskOverlap(overlay,mask,options){
 const report=auditOverlayMask(overlay,mask,options);
 if(report.collision_pixels||!report.overlay_pixels)
   throw new Error('Mask preflight blocks publishing: '+report.status);
 return report;
}
