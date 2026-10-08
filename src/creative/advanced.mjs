import {loadImage} from '@napi-rs/canvas';
import {drawMultiObjectFrame, validateMultiObjectSpec} from './composition.mjs';
import {verifyLocalAssets} from './assets.mjs';
import {fontFamily, validateSpec} from '../free/scene.mjs';

const exact=(obj,keys)=>obj!==null && typeof obj==='object' && !Array.isArray(obj) &&
  Object.keys(obj).sort().join(',')===keys.slice().sort().join(',');
const validText = text => typeof text === 'string' && [...text].length <= 34;

export function validateAdvancedSpec(spec) {
  if (!exact(spec,['motion','copy','asset_manifest'])) throw new Error('Unexpected advanced scene fields');
  validateMultiObjectSpec(spec.motion);
  if (!Array.isArray(spec.copy) || spec.copy.length !== spec.motion.segments.length) {
    throw new Error('Advanced film copy must match each segment');
  }
  spec.copy.forEach((beat,i) => {
    if (!exact(beat,['segment_id','headline','subtitle']) ||
        beat.segment_id !== spec.motion.segments[i].id ||
        !validText(beat.headline) || !validText(beat.subtitle) ||
        [...beat.headline].length > 24) throw new Error('Invalid advanced beat text');
    validateSpec({title:beat.headline,subtitle:beat.subtitle});
  });
  // The first POC deliberately supports only one fixed, local, verified artwork.
  if (!exact(spec.asset_manifest,['version','assets']) ||
      !Array.isArray(spec.asset_manifest.assets) || spec.asset_manifest.assets.length !== 1 ||
      spec.asset_manifest.assets[0]?.id !== 'signal-art') {
    throw new Error('Pilot requires one approved local raster art');
  }
}

export async function loadAdvancedArt(spec,assetRoot) {
  validateAdvancedSpec(spec);
  const verified=verifyLocalAssets(spec.asset_manifest,assetRoot);
  const art=verified.get('signal-art');
  // Decode fully before any output directory is created.
  const image=await loadImage(art.bytes);
  if (image.width !== art.width || image.height !== art.height) throw new Error('Decoded art does not match manifest');
  return {image,record:{id:art.id,sha256:art.sha256,license:art.license,source:art.source}};
}

function fitFont(ctx,text,desired,maxWidth,min) {
  let size=desired;ctx.font=size+'px '+fontFamily;
  let width=ctx.measureText(text).width;
  if (!Number.isFinite(width) || width <= 0) throw new Error('Unreadable text metrics');
  if (width>maxWidth) size=Math.floor(size*maxWidth/width);
  if (size<min) throw new Error('Advanced text exceeds safe area');
  ctx.font=size+'px '+fontFamily;
  if (ctx.measureText(text).width>maxWidth) throw new Error('Advanced text exceeds safe area');
  return size;
}
export function drawAdvancedFrame(profile,frame,spec,art) {
  if (!profile || profile.fps!==30 || profile.frames!==spec?.motion?.duration_frames ||
      !art?.image) throw new Error('Invalid advanced render context');
  // The persistent signal and all other motion layers are rendered first.
  const canvas=drawMultiObjectFrame(profile,frame,spec.motion);
  const ctx=canvas.getContext('2d');
  const {width:w,height:h}=profile;
  const portrait=h>w;
  const margin=Math.round(w*(portrait?.09:.075));
  const left=margin;
  const artSize=Math.round(Math.min(w,h)*(portrait?.125:.16));
  const artX=w-margin-artSize,artY=Math.round(h*.105);
  ctx.drawImage(art.image,artX,artY,artSize,artSize);

  const state=spec.motion.segments.findIndex(s=>frame>=s.start && frame<s.end);
  const beat=spec.copy[state], segment=spec.motion.segments[state];
  const local=frame-segment.start, remaining=segment.end-frame;
  const fade=Math.min(1,local/13,remaining/12);
  ctx.save();
  ctx.globalAlpha=Math.max(0,fade);
  const titleSize=fitFont(ctx,beat.headline,Math.round(Math.min(w*.053,h*.087)),w*(portrait?.70:.74),Math.max(12,Math.round(Math.min(w*.053,h*.087)*.65)));
  const subtitleSize=fitFont(ctx,beat.subtitle,Math.round(Math.min(w*.028,h*.042)),w*(portrait?.77:.79),Math.max(9,Math.round(Math.min(w*.028,h*.042)*.68)));
  const titleY=Math.round(h*(portrait?.225:.205));
  const subtitleY=Math.round(h*(portrait?.282:.284));
  const titleReveal=Math.min(1,Math.max(0,(local-4)/20));
  ctx.font=titleSize+'px '+fontFamily;
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#17191C';
  ctx.save();
  ctx.beginPath();ctx.rect(left,titleY-titleSize*1.35+titleSize*1.35*(1-titleReveal),
    w*.79,titleSize*1.5*titleReveal);ctx.clip();
  ctx.fillText(beat.headline,left,titleY+titleSize*.42*(1-titleReveal));
  ctx.restore();
  ctx.font=subtitleSize+'px '+fontFamily;
  ctx.fillStyle='#48515A';
  ctx.fillText(beat.subtitle,left,subtitleY);
  // A quiet separator and beat number communicate editorial hierarchy.
  ctx.fillStyle='#B4ACA3';
  ctx.fillRect(left,Math.round(h*.32),Math.round(w*.18),Math.max(2,Math.round(w*.001)));
  ctx.font=Math.round(subtitleSize*.72)+'px '+fontFamily;
  ctx.fillText('0'+(state+1)+' / 04',left,Math.round(h*.355));
  ctx.restore();

  // The data segment makes an actual multi-object graphic from computed values.
  if (beat.segment_id==='data') {
    const progress=Math.max(0,Math.min(1,(local-15)/50));
    ctx.fillStyle='#2459C6';
    const baseline=Math.round(h*.87), maxHeight=Math.round(h*.15);
    const xs=portrait?[.14,.32,.50,.68]:[.18,.29,.40,.51];
    [0.38,.68,.52,.91].forEach((level,i)=>{
      const barHeight=Math.round(maxHeight*level*progress);
      ctx.fillRect(Math.round(w*xs[i]),baseline-barHeight,
        Math.round(w*(portrait?.09:.055)),barHeight);
    });
  }
  return canvas;
}
