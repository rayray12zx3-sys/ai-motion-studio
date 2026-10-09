/**
 * Standalone QA bridge invoked by CI against exact pinned Motion QA Draft PR.
 * No copies of experimental QA code go into the root production dependency graph.
 * The fixture only renders synthetic demo frames; no company sources or paths.
 */
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {drawForegroundFrame,profiles} from '../../src/free/scene.mjs';

const qaPath=resolve('qa-reference/experiments/motion-qa/frame-metrics.mjs');
if(!existsSync(qaPath))throw new Error('Pinned isolated Motion QA checkout missing');
const {analyzeMotionFrames}=await import(pathToFileURL(qaPath).href);
const {smoke}=profiles;
const frames=Array.from({length:smoke.frames},(_,i)=>{
  const canvas=drawForegroundFrame(smoke,i);
  const data=canvas.getContext('2d').getImageData(0,0,smoke.width,smoke.height).data;
  return new Uint8ClampedArray(data);
});
const options={
  width:smoke.width,height:smoke.height,
  safeRect:{x:12,y:150,width:336,height:360},
  alphaThreshold:8,minVisiblePixels:20,
  allowedBlankFrameIndices:[0,29],
  maxCentroidJumpFraction:0.4,maxInternalRepeatedTransitions:3
};
const first=analyzeMotionFrames({...options,frames});
assert.equal(first.status,'PASS','Unexpected synthetic foreground diagnostic: '+JSON.stringify(first.findings));
assert.equal(first.creative_approval,'HUMAN_REVIEW_REQUIRED');
assert.deepEqual(first.findings,[]);
assert.ok(first.metrics[12].visible_pixels>150);
assert.ok(first.metrics[12].unsafe_alpha_pixels===0);
const skipped=new Uint8ClampedArray(smoke.width*smoke.height*4);
const broken=[...frames];broken[12]=skipped;
const blank=analyzeMotionFrames({...options,frames:broken});
assert.equal(blank.status,'BLOCKED');
assert.ok(blank.findings.some(f=>f.code==='UNEXPECTED_EMPTY_FRAME'&&f.frame===12));
const alpha=[...frames];alpha[12]=new Uint8ClampedArray(frames[12]);
alpha[12].set([255,0,0,255],0); // alpha leak outside safe rectangle
const leaked=analyzeMotionFrames({...options,frames:alpha});
assert.equal(leaked.status,'BLOCKED');
assert.ok(leaked.findings.some(f=>f.code==='ALPHA_OUTSIDE_DECLARED_SAFE_RECT'&&f.frame===12));
const repeat=analyzeMotionFrames({...options,frames});
assert.deepEqual(first,repeat,'Motion QA must be deterministic');
console.log('MOTION_QA_REAL_CANVAS_FOREGROUND_PASS',JSON.stringify({
  profile:'smoke',fps:smoke.fps,frames:smoke.frames,
  original:'PASS',injected_blank:'BLOCKED',injected_alpha_leak:'BLOCKED',
  no_private_sources:true,art_approval:'HUMAN_REVIEW_REQUIRED'
}));
