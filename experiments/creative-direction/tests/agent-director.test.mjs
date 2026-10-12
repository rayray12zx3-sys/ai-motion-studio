import test from 'node:test';
import assert from 'node:assert/strict';
import {runCreativeDirector,validateDirectorBrief} from '../src/agent-director.mjs';
import {kinetic,spatial} from '../examples/two-original-briefs.mjs';
const brief=(profile,objective='product-explainer')=>({
 id:'sample-product-story',objective,goal:'Describe a totally original product experience with visible interaction and purposeful transitions.',
 audience:'A viewer unfamiliar with an imaginary product',message:'A single interaction visibly resolves a genuine user need',
 profile,assetPolicy:'original-only',constraints:['Create original visuals only','Never invent evidence for advertised performance'],
 rhythmPreference:'unspecified',claims:[{text:'Results are illustrative only',status:'illustrative'}]
});
const pack=(b,t,kind='a')=>({briefId:b.id,interpretation:'An original visual statement showing cause and effect',designReason:'Objects move only when they communicate a purpose',productProof:[{shotId:'signal-intro',resultShotId:'form-change',trigger:'click',before:'An unorganized fictional idea remains a single glyph',after:'The idea transforms into a selectable visual node',why:'The click demonstrates one cause and one visible product state change'}],treatment:{...structuredClone(t),id:'original-'+kind}});
function varied(original) {
 const x=structuredClone(original);
 x.id='original-variant';
 x.concept='A distinct authored form language with a different sequence and audience-oriented framing';
 x.shots[0].camera.move='track';
 x.shots[1].camera.move='locked';
 x.shots[2].camera.move='arc';
 x.shots[2].actions[0].why='Use original form and purposeful camera perspective';
 return x;
}
test('an injected model interface produces TWO structurally distinct original proposals from a bounded natural brief',async()=>{
 const b=brief(kinetic.profile);
 const candidates=[pack(b,kinetic),pack(b,varied(kinetic),'b')];
 let calls=0;
 const out=await runCreativeDirector({brief:b,complete:async req=>{assert.ok(req.prompt.includes('ORIGINAL'));assert.equal(req.phase,'propose');return JSON.stringify(candidates[calls++])}});
 assert.equal(out.status,'CREATIVE_CANDIDATES_READY');
 assert.equal(out.candidates.length,2);
 assert.equal(out.renderStatus,'NOT_RENDERED');
 assert.equal(out.art,'PENDING_HUMAN');
 assert.equal(out.attempts.length,2);
 assert.notDeepEqual(out.candidates[0].preflight.shots.map(s=>s.camera),out.candidates[1].preflight.shots.map(s=>s.camera));
});
test('supports a second spatial/cinematic original brief without imposing fast beat-led rules',async()=>{
 const b=brief(spatial.profile,'spatial-story');b.id='physical-space-brief';
 const first=pack(b,spatial),other=pack(b,varied(spatial),'b');
 let calls=0;
 const result=await runCreativeDirector({brief:b,complete:async()=>[first,other][calls++]});
 assert.equal(result.status,'CREATIVE_CANDIDATES_READY');
 assert.equal(result.candidates[0].preflight.mode,'cinematic');
 assert.equal(result.candidates[1].preflight.fps,30);
});
test('reject malformed draft, requests precise repair, and preserves original rights gate',async()=>{
 const b=brief(kinetic.profile);b.claims=[{text:'Boosts output by 5x',status:'needs-evidence'}];
 const a=pack(b,kinetic),var2=pack(b,varied(kinetic),'b');
 let n=0;const phases=[];
 const result=await runCreativeDirector({brief:b,complete:async req=>{
  phases.push(req.phase);
  if(n++===0)return '{"briefId":';
  return phases.length===2?a:var2;
 }});
 assert.equal(result.status,'CREATIVE_CANDIDATES_READY');
 assert.deepEqual(phases,['propose','revise','propose']);
 assert.equal(result.rights,'FACT_CLAIMS_PENDING');
 assert.equal(result.candidates[0].rights,'FACT_CLAIMS_PENDING');
 assert.ok(result.attempts.some(x=>x.result==='REJECTED'));
});
test('a superficial recolor with unchanged shots is not acceptable as a second distinct idea',async()=>{
 const b=brief(kinetic.profile);
 let n=0;const second=structuredClone(kinetic);second.id='different-name';second.concept='Different adjectives, identical motion design and no structural rethinking';
 const run=await runCreativeDirector({brief:b,maxRevisions:0,complete:async()=>{
  return n++===0?pack(b,kinetic):pack(b,second,'b');
 }});
 assert.equal(run.status,'BLOCKED');
 assert.match(run.reason,/cosmetic/);
});
test('a product film without causal input→result UI proof fails even when its geometric animation passes',async()=>{
 const b=brief(kinetic.profile);
 const candidate=pack(b,kinetic);delete candidate.productProof;
 const result=await runCreativeDirector({brief:b,maxRevisions:0,complete:async()=>candidate});
 assert.equal(result.status,'BLOCKED');assert.match(result.reason,/causal UI/);
 const wrong=pack(b,kinetic);wrong.productProof[0].after=wrong.productProof[0].before;
 const x=await runCreativeDirector({brief:b,maxRevisions:0,complete:async()=>wrong});
 assert.equal(x.status,'BLOCKED');assert.match(x.reason,/observable UI state/);
});
test('does not allow remote URL/JS payloads, wrong profiles, or invented commercial rights',async()=>{
 const b=brief(kinetic.profile);
 const bad=pack(b,kinetic);bad.designReason='I will load https://unsafe.example/secret';
 const blocked=await runCreativeDirector({brief:b,maxRevisions:0,complete:async()=>bad});
 assert.equal(blocked.status,'BLOCKED');
 assert.match(blocked.reason,/Executable or remote source/);
 const wrong=pack(b,kinetic);wrong.treatment.profile.fps=30;
 const failed=await runCreativeDirector({brief:b,maxRevisions:0,complete:async()=>wrong});
 assert.equal(failed.status,'BLOCKED');
 assert.match(failed.reason,/Wrong output profile/);
 const invalid={...b,assetPolicy:'scrape-anything'};
 assert.throws(()=>validateDirectorBrief(invalid),/original-only/);
});
test('any missing model adapter, unsupported claims, or invalid budget fails without pretending to generate art',async()=>{
 const b=brief(kinetic.profile);
 await assert.rejects(runCreativeDirector({brief:b}),/adapter/);
 await assert.rejects(runCreativeDirector({brief:b,complete:async()=>{},maxRevisions:9}),/Unsafe/);
 b.claims=[{text:'Guaranteed revenue x100',status:'confirmed'}];
 assert.throws(()=>validateDirectorBrief(b),/evidence/);
});
