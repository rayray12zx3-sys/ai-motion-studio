import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,inspectFrame} from '../src/semantic-scenes.mjs';
import {renderNativeLandscapeFrame,inspectNativeTypography} from '../src/native-landscape-composition.mjs';
import {planNativeQualityRevision} from '../src/native-quality-revision.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';

const stress=()=>{
  const b=structuredClone(boardBrief);
  b.id='third-original-longcopy-repair';
  b.shots[1].title='COMPLEX TASKS ACROSS MULTIPLE TYPES REQUIRE DETAILED PLANNING';
  b.shots[1].subtitle='A deliberately verbose sequence makes the constraints of responsive storytelling visible across a wide range of different layouts.';
  return b;
};

test('existing two independent authored films preserve their semantics and outputs',()=>{
 for(const brief of [boardBrief,captionBrief]){
  const plan=compileSemanticScenes(brief),snapshot=JSON.stringify(plan);
  const fix=planNativeQualityRevision(plan);
  assert.equal(fix.sourceContract,'UNCHANGED');
  assert.equal(fix.decodedMediaQA,'NOT_DONE_BY_THIS_PLANNER');
  for(const shot of plan.shots){
   const record=fix.decisions.find(x=>x.shotId===shot.id);
   assert.equal(record.final,'HEURISTIC_PASS');
   for(const frame of [shot.start,Math.floor((shot.start+shot.end)/2),shot.end-1]){
    const oldSvg=renderNativeLandscapeFrame(plan,frame);
    const revised=renderNativeLandscapeFrame(plan,frame,{shotModes:fix.shotModes});
    if(record.chosenMode==='standard')assert.equal(revised,oldSvg);
    else assert.match(revised,/id="native-persistent-hero"/);
   }
  }
  assert.equal(JSON.stringify(plan),snapshot,'The authored plan must remain immutable');
 }
});

test('long but valid ORIGINAL brief fails ordinary layout and is repaired BEFORE render',()=>{
 const authored=stress(),beforeInput=JSON.stringify(authored);
 const plan=compileSemanticScenes(authored);
 const longShot=plan.shots[1];
 const report=inspectNativeTypography(plan,longShot);
 assert.equal(report.status,'NEEDS_REVISION');
 assert.equal(report.issue,'COPY_EXCEEDS_BOUNDED_ROWS');
 assert.throws(()=>renderNativeLandscapeFrame(plan,170),/Native typography/);
 const review=planNativeQualityRevision(plan);
 assert.ok(review.revisedCount>=1);
 assert.equal(review.shotModes[longShot.id],'compact');
 assert.equal(review.decisions.find(x=>x.shotId===longShot.id).final,'HEURISTIC_PASS');
 assert.equal(review.fullSpeedArtReview,'PENDING_HUMAN');
 assert.equal(JSON.stringify(authored),beforeInput,'No silent editing of user copy');
 assert.equal(JSON.stringify(plan),JSON.stringify(compileSemanticScenes(authored)));
 for(const frame of [0,120,135,165,170,240,300,359]){
  const output=renderNativeLandscapeFrame(plan,frame,{shotModes:review.shotModes});
  const actual=inspectFrame(plan,frame);
  assert.match(output,/^<svg xmlns=/);
  assert.ok(output.includes('data-shot="'+actual.shotId+'"'));
  assert.equal(output,renderNativeLandscapeFrame(plan,frame,{shotModes:review.shotModes}));
  assert.match(output,/id="native-persistent-hero"/);
 }
 const repaired=renderNativeLandscapeFrame(plan,170,{shotModes:review.shotModes});
 assert.ok(repaired.includes('COMPLEX TASKS') && repaired.includes('DETAILED PLANNING'),
    'Never truncate or replace important source language');
});

test('unsafe mode or forged shot review cannot be promoted to an art pass',()=>{
 const p=compileSemanticScenes(boardBrief);
 assert.throws(()=>inspectNativeTypography(p,p.shots[0],'infinite'),/Unsupported/);
 assert.throws(()=>inspectNativeTypography(p,{...p.shots[0]},'compact'),/compiled shot/);
 assert.throws(()=>renderNativeLandscapeFrame(p,165,{shotModes:{[p.shots[1].id]:'unbounded'}}),/Unsupported/);
 const r=planNativeQualityRevision(p);
 assert.notEqual(r.status,'ART_PASS');
 assert.equal(r.pixelTypography,'NOT_MEASURED');
});

test('review selection is order-independent for the same original semantics',()=>{
 const plan=compileSemanticScenes(stress());
 const before=JSON.stringify(planNativeQualityRevision(plan));
 for(const frame of [359,170,0,359,120,240,170]){
  const opts={shotModes:planNativeQualityRevision(plan).shotModes};
  renderNativeLandscapeFrame(plan,frame,opts);
 }
 assert.equal(JSON.stringify(planNativeQualityRevision(plan)),before);
});
