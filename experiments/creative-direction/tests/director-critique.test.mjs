import test from 'node:test';
import assert from 'node:assert/strict';
import {runCreativeDirector} from '../src/agent-director.mjs';
import {critiqueDirectorCandidates,auditModelCritique} from '../src/director-critique.mjs';
import {kinetic} from '../examples/two-original-briefs.mjs';
const brief={id:'fictional-comms',objective:'product-explainer',goal:'An original concise product idea visually progresses through distinct user actions.',
 audience:'New users who deserve clear communication',message:'Turn an idea into a meaningful visual plan',
 profile:kinetic.profile,rhythmPreference:'unspecified',assetPolicy:'original-only',constraints:['Original art and no reference scenes'],claims:[{text:'Product works five times faster',status:'needs-evidence'}]};
const pack=(t)=>({briefId:brief.id,interpretation:'A distinctive original purposeful visual story',
 designReason:'A clear original action results in another visible state',treatment:t});
const alternate=structuredClone(kinetic);alternate.id='an-actual-alternate';alternate.concept='An original cinematic alternative grounded in editorial reveals and action choices';
alternate.shots[0].camera.move='track';alternate.shots[1].camera.move='locked';alternate.shots[2].camera.move='arc';
async function directed(){
 let n=0;return runCreativeDirector({brief,complete:async()=>pack(n++===0?kinetic:alternate)});
}
const reviewOf=(filmId,issues=[])=>({briefId:brief.id,filmId,storyDiagnosis:'Narrative is coherent but has not yet been watched in a real render',
 originalityRisk:'Unverified visual distinctness from third party reference footage remains to be checked',
 issues,unansweredQuestions:['Can its original visuals be understood at full playback speed?']});
test('independent storyboard critique attaches real shot feedback and requires revision for major failures',async()=>{
 const d=await directed();
 const reports=await critiqueDirectorCandidates({brief,directorResult:d,completeReview:async({filmId})=>reviewOf(filmId,
  [{shotId:'form-change',category:'causality',severity:'major',reason:'The product UI appears without a readable trigger',proposedFix:'Connect the prior action to a visible UI state change'}])});
 assert.equal(reports.status,'CREATIVE_REVISION_REQUIRED');
 assert.equal(reports.filmReports.length,2);
 assert.equal(reports.filmReports[0].issues[0].shotId,'form-change');
 assert.equal(reports.filmReports[0].claimEvidence[0],'Product works five times faster');
 assert.equal(reports.art,'PENDING_HUMAN');
 assert.equal(reports.movie,'NOT_RENDERED');
 assert.equal(reports.rights,'PENDING');
});
test('zero model objections never confer film art/rights approval',async()=>{
 const d=await directed();
 const r=await critiqueDirectorCandidates({brief,directorResult:d,completeReview:async({filmId})=>reviewOf(filmId)});
 assert.equal(r.status,'INTERNAL_STORYBOARD_REVIEWED');
 assert.ok(r.filmReports.every(x=>x.creativeQuality==='UNVERIFIED'&&x.needsRightsReview));
 assert.equal(r.movie,'NOT_RENDERED');
});
test('critique cannot invent an unrelated shot, severity, self-certify rights, or bypass claim evidence',async()=>{
 const d=await directed(),one=d.candidates[0];
 assert.throws(()=>auditModelCritique({brief,acceptedCandidate:one,rawCritique:reviewOf(kinetic.id,
  [{shotId:'imagined-third-party-cut',category:'pacing',severity:'major',reason:'A blank unrelated shot was invented',proposedFix:'Remove the third-party scene'}])}),/shot/);
 const bad=reviewOf(kinetic.id,[{shotId:'form-change',category:'unknown',severity:'high',reason:'Bad external grade',proposedFix:'Use external licensed footage'}]);
 assert.throws(()=>auditModelCritique({brief,acceptedCandidate:one,rawCritique:bad}),/severity/);
 assert.throws(()=>auditModelCritique({brief,acceptedCandidate:one,rawCritique:reviewOf('wrong-film')}),/does not refer/);
});
test('missing independent critic fails closed rather than claiming internal approval',async()=>{
 const d=await directed();
 await assert.rejects(critiqueDirectorCandidates({brief,directorResult:d,completeReview:async()=>{throw Error('rate-limited')}}),/unavailable/);
 await assert.rejects(critiqueDirectorCandidates({brief,directorResult:d}),/review adapter/);
});
