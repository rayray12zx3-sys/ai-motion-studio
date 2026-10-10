import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
 SECOND_PROFILE,SECOND_SAFE_RECT,SECOND_SCENARIOS,
 renderSecondOriginalFrame,secondOriginalFrames,analyzeSecondOriginalComposition
} from '../render-second-benchmark.mjs';

const hash=frame=>createHash('sha256').update(frame).digest('hex');

test('second independent original composition has reproducible motion, cut and held poses',()=>{
  assert.equal(SECOND_PROFILE.width*16,SECOND_PROFILE.height*9);
  assert.equal(SECOND_PROFILE.frames,90);
  assert.deepEqual(SECOND_SAFE_RECT,{x:18,y:24,width:144,height:272});
  assert.equal(hash(renderSecondOriginalFrame(8)),hash(renderSecondOriginalFrame(8)));
  assert.notEqual(hash(renderSecondOriginalFrame(8)),hash(renderSecondOriginalFrame(9)));
  assert.equal(hash(renderSecondOriginalFrame(14)),hash(renderSecondOriginalFrame(23)),
    'intentional mid-sequence hold must retain identical pixel values');
  assert.notEqual(hash(renderSecondOriginalFrame(44)),hash(renderSecondOriginalFrame(45)),
    'original storyboard must contain a hard scene cut');
  assert.equal(hash(renderSecondOriginalFrame(79)),hash(renderSecondOriginalFrame(89)),
    'intentional ending hold must remain identical');
});

test('explicitly declared cut and mid-clip hold pass without hiding transparency failures',()=>{
  const result=analyzeSecondOriginalComposition('approved-edit');
  assert.equal(result.report.status,'PASS',JSON.stringify(result.report.findings));
  assert.deepEqual(result.report.findings,[]);
  assert.equal(result.report.creative_approval,'HUMAN_REVIEW_REQUIRED');
  assert.deepEqual(result.report.declared_editor_intent,{
    cut_frames:[45],hold_ranges:[{from:14,to:23}]
  });
  assert.equal(result.report.metrics[45].unsafe_alpha_pixels,0);
  assert.equal(result.report.metrics[45].visible_pixels>20,true);
  assert.deepEqual(analyzeSecondOriginalComposition('approved-edit'),result);
});

test('undeclared genuine scene cut remains reviewable and is not silently auto-whitelisted',()=>{
  const out=analyzeSecondOriginalComposition('undeclared-cut');
  assert.equal(out.report.status,'REVIEW');
  assert.ok(out.report.findings.some(f=>f.code==='CENTROID_JUMP'&&f.frame===45),
    JSON.stringify(out.report.findings));
  assert.equal(out.report.declared_editor_intent.cut_frames.length,0);
});
test('undeclared mid-sequence pause remains a reviewable frozen-pose warning',()=>{
  const out=analyzeSecondOriginalComposition('undeclared-hold');
  assert.equal(out.report.status,'REVIEW');
  assert.ok(out.report.findings.some(f=>f.code==='UNEXPECTED_FREEZE'&&
    f.from_frame===14&&f.to_frame===23),
    JSON.stringify(out.report.findings));
  assert.deepEqual(out.report.declared_editor_intent.hold_ranges,[]);
});
test('intentional cut never bypasses a missing-alpha foreground',()=>{
  const out=analyzeSecondOriginalComposition('blank-at-cut');
  assert.equal(out.report.status,'BLOCKED');
  assert.ok(out.report.findings.some(f=>f.code==='UNEXPECTED_EMPTY_FRAME'&&f.frame===45));
  assert.deepEqual(out.report.declared_editor_intent.cut_frames,[45]);
});
test('intentional cut never bypasses Alpha leakage outside declared safe rectangle',()=>{
  const out=analyzeSecondOriginalComposition('alpha-leak-at-cut');
  assert.equal(out.report.status,'BLOCKED');
  assert.ok(out.report.findings.some(f=>
    f.code==='ALPHA_OUTSIDE_DECLARED_SAFE_RECT'&&f.frame===45&&f.pixels>0));
});
test('unexpected freeze after a declared cut/hold still receives review flag',()=>{
  const out=analyzeSecondOriginalComposition('midscene-freeze');
  assert.equal(out.report.status,'REVIEW');
  assert.ok(out.report.findings.some(f=>f.code==='UNEXPECTED_FREEZE'&&
    f.from_frame<=59&&f.to_frame>=68),JSON.stringify(out.report.findings));
});
test('scenario IDs are fixed and external URLs cannot become sample inputs',()=>{
  assert.deepEqual(SECOND_SCENARIOS,[
    'approved-edit','undeclared-cut','undeclared-hold',
    'blank-at-cut','alpha-leak-at-cut','midscene-freeze'
  ]);
  assert.throws(()=>secondOriginalFrames('../secret-company-files'),/Unknown second/);
  assert.throws(()=>renderSecondOriginalFrame(90),/Invalid original/);
  assert.throws(()=>renderSecondOriginalFrame(0,{scenario:'https://example.test'}),/Invalid original/);
});
