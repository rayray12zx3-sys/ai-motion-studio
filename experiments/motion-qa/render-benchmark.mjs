/**
 * Original synthetic 9:16 Canvas clip for exercising production-like RGBA QA.
 * Exactly one generated scene, 80 sequential frames at 30fps, no source media.
 * This module deliberately does not read company files or remote references.
 */
import {createCanvas} from '@napi-rs/canvas';
import {analyzeMotionFrames} from './frame-metrics.mjs';

export const BENCHMARK_PROFILE=Object.freeze({width:180,height:320,fps:30,frames:80});
export const BENCHMARK_SAFE_RECT=Object.freeze({x:15,y:32,width:140,height:260});
export const BENCHMARK_SCENARIOS=Object.freeze([
  'baseline','blank','alpha-leak','teleport','freeze'
]);

export function renderOriginalSample(frame,{scenario='baseline'}={}){
  const {width,height,frames}=BENCHMARK_PROFILE;
  if(!Number.isInteger(frame)||frame<0||frame>=frames||
    !BENCHMARK_SCENARIOS.includes(scenario))
    throw new TypeError('Invalid synthetic sample frame or scenario');
  const ctx=createCanvas(width,height).getContext('2d');
  const animationFrame=Math.min(frame,59);
  let cardX=40+animationFrame;
  if(scenario==='teleport'&&frame===20)cardX=106; // large jump, but still inside safe rectangle
  // This little floating title/card/progress unit is an original synthetic
  // design. The initial frames contain no empty/transparent transition.
  if(!(scenario==='blank'&&frame===30)){
    ctx.fillStyle='#163135';
    ctx.beginPath();
    ctx.roundRect(cardX,118,48,80,9);
    ctx.fill();
    ctx.fillStyle='#28b59d';
    ctx.beginPath();
    ctx.roundRect(cardX+7,130,34,6,3);
    ctx.fill();
    ctx.fillStyle='#f1f5ec';
    ctx.beginPath();
    ctx.roundRect(cardX+7,147,25,6,3);
    ctx.fill();
    ctx.fillStyle='#e6bd78';
    ctx.beginPath();
    ctx.roundRect(cardX+7,174,Math.round(5+27*animationFrame/59),5,2);
    ctx.fill();
  }
  if(scenario==='alpha-leak'&&frame===25){
    ctx.fillStyle='#f7a70a';
    ctx.fillRect(160,245,8,8); // fully outside the declared right safe zone
  }
  const pixels=ctx.getImageData(0,0,width,height).data;
  return new Uint8ClampedArray(pixels); // no Canvas/source media retained
}

export function generateBenchmarkFrames(scenario){
  if(!BENCHMARK_SCENARIOS.includes(scenario))
    throw new TypeError('Unsupported synthetic-only QA scenario');
  const frames=Array.from({length:BENCHMARK_PROFILE.frames},(_,i)=>
    renderOriginalSample(i,{scenario}));
  if(scenario==='freeze'){
    const frozen=new Uint8ClampedArray(frames[20]);
    for(let frame=21;frame<=29;frame++)frames[frame]=new Uint8ClampedArray(frozen);
  }
  return frames;
}

export function runOriginalMotionBenchmark(scenario){
  const profile=BENCHMARK_PROFILE;
  const report=analyzeMotionFrames({
    frames:generateBenchmarkFrames(scenario),
    width:profile.width,height:profile.height,
    safeRect:BENCHMARK_SAFE_RECT,
    minVisiblePixels:20,
    maxCentroidJumpFraction:0.10,
    maxInternalRepeatedTransitions:2,
    allowedEndingRepeatedTransitions:20
  });
  return {
    scenario,source:'ORIGINAL_SYNTHETIC_CANVAS_ONLY',
    fps:profile.fps,total_frames:profile.frames,
    report
  };
}
