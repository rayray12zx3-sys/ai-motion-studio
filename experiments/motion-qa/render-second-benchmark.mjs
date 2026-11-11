/**
 * Second independent ORIGINAL 9:16 synthetic composition:
 * a kinetic abstract diagram makes a hard cut to a stepped timeline/bars.
 * All graphics are geometric; no imported media, licensed UI, music or fonts.
 */
import {createCanvas} from '@napi-rs/canvas';
import {analyzeMotionFrames} from './frame-metrics.mjs';

export const SECOND_PROFILE=Object.freeze({width:180,height:320,fps:30,frames:90});
export const SECOND_SAFE_RECT=Object.freeze({x:18,y:24,width:144,height:272});
export const SECOND_SCENARIOS=Object.freeze([
  'approved-edit','undeclared-cut','undeclared-hold',
  'blank-at-cut','alpha-leak-at-cut','midscene-freeze'
]);
const CUT_FRAME=45;
const HOLD={from:14,to:23};

export function renderSecondOriginalFrame(frame,{scenario='approved-edit'}={}){
  if(!Number.isInteger(frame)||frame<0||frame>=SECOND_PROFILE.frames||
    !SECOND_SCENARIOS.includes(scenario))
    throw new TypeError('Invalid original second-composition frame');
  const {width,height}=SECOND_PROFILE;
  const ctx=createCanvas(width,height).getContext('2d');
  if(!(scenario==='blank-at-cut'&&frame===CUT_FRAME)){
    if(frame<CUT_FRAME){
      // Frames 15..23 hold the exact frame-14 pose intentionally.
      const phase=frame<=14?frame:frame<=23?14:frame-9;
      const x=48+phase;
      ctx.fillStyle='#153a42';
      ctx.beginPath();ctx.arc(x+13,76,13,0,2*Math.PI);ctx.fill();
      ctx.fillStyle='#efc989';
      ctx.fillRect(x-9,94,48,5);
      ctx.fillStyle='#d9f1ed';
      ctx.fillRect(x+7,101,22,4);
    }else{
      // A different visual language and anchor; hard CUT at frame 45.
      const step=Math.min(frame,79)-CUT_FRAME;
      ctx.fillStyle='#294e54';
      ctx.fillRect(34,194,105,9);
      ctx.fillRect(43,218,82,9);
      ctx.fillRect(56,242,68,9);
      ctx.fillStyle='#e6bd78';
      ctx.fillRect(43+step*2,266,12,6);
      ctx.fillStyle='#66d0be';
      ctx.fillRect(34+Math.floor(step/2),184,12,4);
    }
  }
  if(scenario==='alpha-leak-at-cut'&&frame===CUT_FRAME){
    ctx.fillStyle='#ffbb22';
    ctx.fillRect(168,154,7,7); // intentionally outside right safe bound (x<=161)
  }
  return new Uint8ClampedArray(ctx.getImageData(0,0,width,height).data);
}

export function secondOriginalFrames(scenario){
  if(!SECOND_SCENARIOS.includes(scenario))
    throw new TypeError('Unknown second original composition scenario');
  const frames=Array.from({length:SECOND_PROFILE.frames},(_,frame)=>
    renderSecondOriginalFrame(frame,{scenario}));
  if(scenario==='midscene-freeze'){
    const hold=new Uint8ClampedArray(frames[59]);
    for(let frame=60;frame<=68;frame++)frames[frame]=new Uint8ClampedArray(hold);
  }
  return frames;
}

export function analyzeSecondOriginalComposition(scenario){
  const intent={
    allowedCutFrameIndices:scenario==='undeclared-cut'?[]:[CUT_FRAME],
    allowedHoldFrameRanges:scenario==='undeclared-hold'?[]:[HOLD]
  };
  const report=analyzeMotionFrames({
    frames:secondOriginalFrames(scenario),
    width:SECOND_PROFILE.width,height:SECOND_PROFILE.height,
    safeRect:SECOND_SAFE_RECT,
    minVisiblePixels:20,maxCentroidJumpFraction:0.17,
    maxInternalRepeatedTransitions:2,
    allowedEndingRepeatedTransitions:10,
    ...intent
  });
  return {scenario,source:'SECOND_ORIGINAL_GEOMETRIC_CANVAS_COMPOSITION',
    profile:SECOND_PROFILE,report};
}
