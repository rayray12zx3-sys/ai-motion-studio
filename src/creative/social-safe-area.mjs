// Conservative DESIGN ASSUMPTION for 9:16 social-video overlays.
// Not a universal/official TikTok, Reels or Shorts mask. Platform and
// placement-specific real UI screenshot review is required before release.
export const SOCIAL_9_16_SAFE_V1=Object.freeze({
  aspect:'9:16',
  left:.09,right:.20,top:.145,bottom:.205,
  status:'CONSERVATIVE_PRESET_REQUIRES_PLATFORM_REVIEW'
});
export function socialSafeRect({width,height},preset=SOCIAL_9_16_SAFE_V1){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<180||height<320||
    Math.abs(width/height-9/16)>.002)throw new Error('9:16 integer dimensions required');
  if(preset!==SOCIAL_9_16_SAFE_V1)throw new Error('Unapproved social safe-zone preset');
  return {
    x:Math.ceil(width*preset.left),y:Math.ceil(height*preset.top),
    w:Math.floor(width*(1-preset.left-preset.right)),
    h:Math.floor(height*(1-preset.top-preset.bottom))
  };
}
export function drawSafeReviewGuide(ctx,profile){
  const {x,y,w,h}=socialSafeRect(profile);
  ctx.save();
  ctx.fillStyle='rgba(194,67,51,0.18)';
  ctx.fillRect(0,0,profile.width,y);
  ctx.fillRect(0,y,x,profile.height-y);
  ctx.fillRect(x+w,y,profile.width-x-w,profile.height-y);
  ctx.fillRect(x,y+h,w,profile.height-y-h);
  ctx.lineWidth=Math.max(1,profile.width*.003);ctx.strokeStyle='#D45043';
  ctx.setLineDash([10,8]);ctx.strokeRect(x,y,w,h);ctx.restore();
}
