import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMotionFrames} from '../frame-metrics.mjs';

const W=20,H=30;
const frameAt=(x,y,{rgba=[21,191,162,255],size=2}={})=>{
  const data=new Uint8ClampedArray(W*H*4);
  for(let yy=y;yy<y+size;yy++)for(let xx=x;xx<x+size;xx++){
    const idx=(yy*W+xx)*4;data.set(rgba,idx);
  }
  return data;
};
const motion=frames=>analyzeMotionFrames({
  frames,width:W,height:H,safeRect:{x:2,y:3,width:16,height:24},
  maxInternalRepeatedTransitions:1,allowedEndingRepeatedTransitions:1
});

test('original synthetic 9:16-ish QA sample is deterministic, bounded and not art-approved',()=>{
  const frames=[frameAt(5,12),frameAt(6,12),frameAt(7,12),frameAt(7,12)];
  const a=motion(frames),b=motion(frames);
  assert.deepEqual(a,b);
  assert.equal(a.status,'PASS');
  assert.equal(a.creative_approval,'HUMAN_REVIEW_REQUIRED');
  assert.equal(a.source_media_retained,false);
  assert.deepEqual(a.metrics[0].bbox,{left:5,top:12,right:6,bottom:13});
  assert.equal(a.metrics[1].changed_pixels_from_previous,4);
  assert.equal(a.metrics[3].changed_pixels_from_previous,0);
  assert.ok(a.metrics.every(m=>m.unsafe_alpha_pixels===0));
  assert.equal(JSON.stringify(a).includes('rgba'),false);
});

test('internal duplicate animation poses trigger review while intentional ending hold is exempt',()=>{
  const idle=frameAt(5,12),moving=frameAt(9,12);
  const out=motion([idle,idle,idle,idle,moving,moving]);
  assert.equal(out.status,'REVIEW');
  assert.ok(out.findings.some(f=>f.code==='UNEXPECTED_FREEZE'&&
    f.from_frame===0&&f.to_frame===3&&f.repeated_transitions===3));
  assert.equal(out.findings.filter(f=>f.code==='UNEXPECTED_FREEZE').length,1);
});

test('large visible centroid teleport is flagged for review, not labeled objective artistic failure',()=>{
  const out=motion([frameAt(2,8),frameAt(15,23)]);
  assert.equal(out.status,'REVIEW');
  assert.ok(out.findings.some(f=>f.code==='CENTROID_JUMP'&&f.normalized_jump>0.3));
  assert.ok(out.findings.every(f=>f.severity==='review'));
});

test('outside declared Alpha-safe rectangle and unexpected blank are hard blockers',()=>{
  const out=motion([frameAt(0,0),new Uint8ClampedArray(W*H*4)]);
  assert.equal(out.status,'BLOCKED');
  assert.ok(out.findings.some(f=>f.code==='ALPHA_OUTSIDE_DECLARED_SAFE_RECT'&&f.pixels===4));
  assert.ok(out.findings.some(f=>f.code==='UNEXPECTED_EMPTY_FRAME'&&f.frame===1));
  assert.equal(out.metrics[1].bbox,null);
});

test('hidden RGB matte changes are ignored when Alpha is zero',()=>{
  const red=new Uint8ClampedArray(W*H*4),blue=new Uint8ClampedArray(W*H*4);
  for(let i=0;i<W*H;i++){red[i*4]=255;blue[i*4+2]=255;}
  const out=analyzeMotionFrames({width:W,height:H,frames:[red,blue],
    allowedBlankFrameIndices:[0,1],allowedEndingRepeatedTransitions:1});
  assert.equal(out.status,'PASS');
  assert.equal(out.metrics[1].changed_pixels_from_previous,0);
});

test('malformed frame buffers, unsafe crop rectangles and overly broad samples are rejected',()=>{
  assert.throws(()=>motion([frameAt(5,12),new Uint8Array(3)]),/RGBA pixel count/);
  assert.throws(()=>motion([frameAt(5,12),[1,2,3]]),/RGBA frame/);
  assert.throws(()=>analyzeMotionFrames({frames:[frameAt(5,12),frameAt(6,12)],
    width:W,height:H,safeRect:{x:19,y:3,width:2,height:2}}),/safe rectangle/);
  assert.throws(()=>analyzeMotionFrames({frames:[frameAt(5,12)],width:W,height:H}),/sample/);
  assert.throws(()=>analyzeMotionFrames({frames:[frameAt(5,12),frameAt(6,12)],
    width:W,height:H,allowedBlankFrameIndices:[999]}),/thresholds/);
});
