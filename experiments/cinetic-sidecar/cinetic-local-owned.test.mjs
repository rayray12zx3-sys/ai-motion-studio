// All examples are public fictional data; this test NEVER renders private material or
// runs the local owner's production entry from a hosted CI runner.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync,mkdirSync,symlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {preflightOwnerLocal,parseLocalOptions} from './cinetic-local-owned.mjs';
import {normalizeDirectorPlan} from './adapter.mjs';
import {assertSynthetic} from './cinetic-flow.mjs';
const SHA=bytes=>createHash('sha256').update(bytes).digest('hex');
const original=JSON.parse(readFileSync(new URL('./ad-focus-landscape.plan.json',import.meta.url),'utf8'));
const repoRoot=fileURLToPath(new URL('../../',import.meta.url));
function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'cinetic-owner-local-synthetic-only-'));
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const plan={...original,contentClass:'owner-authored-local'};
 const source=join(dir,'private-original.json'),rights=join(dir,'private-attestation.json');
 const bin=join(dir,'fictitious-script-do-not-run.mjs');
 writeFileSync(bin,'// test-only source fingerprint, never executed\n');
 const bytes=Buffer.from(JSON.stringify(plan,null,2)+'\n');
 writeFileSync(source,bytes);
 const assertion={
  schema:'cinetic-owner-original-commercial-v1',planSha256:SHA(bytes),
  rights:{
   copy:'owner-original-commercial-authorized',
   artwork:'repo-generated-original-vectors',
   font:'pinned-noto-ofl',
   audio:'none',
   voice:'none',
   photos:'none',
   externalImages:'none',
   footage:'none',
   trademarks:'none',
   paymentRequired:false,
   attributionRequiredInFinishedAd:false,
   operatorAuthorizedCommercialAds:true
  }
 };
 writeFileSync(rights,JSON.stringify(assertion,null,2)+'\n');
 const out=join(dir,'job-output');
 const argv=[source,rights,out,'--hf',bin,'--hf-sha',SHA(readFileSync(bin))];
 return {dir,source,rights,out,argv,plan,assertion};
}
test('default public API rejects local owner class without explicit isolated context',t=>{
 const f=fixture(t);
 assert.throws(()=>normalizeDirectorPlan(f.plan),/public synthetic/);
 assert.throws(()=>assertSynthetic(f.plan),/public-synthetic/);
 const accepted=normalizeDirectorPlan(f.plan,{allowOwnerAuthoredLocal:true});
 assert.equal(accepted.contentClass,'owner-authored-local');
 assert.equal(accepted.direction.visualMotif,'ad-film');
});
test('local owner preflight binds exact plan/rights, no files generated before actual render',t=>{
 const f=fixture(t);
 const parsed=parseLocalOptions(f.argv);
 assert.equal(parsed.plan,f.source);
 const checked=preflightOwnerLocal(f.argv,{});
 assert.equal(checked.sourceSha256,f.assertion.planSha256);
 assert.equal(checked.plan.direction.adDevice,'focus-clock');
 assert.equal(existsSync(f.out),false);
});
test('fail-closed on public or automated CI, never produce a user job on Actions',t=>{
 const f=fixture(t);
 assert.throws(()=>preflightOwnerLocal(f.argv,{GITHUB_ACTIONS:'true'}),/CI/);
 assert.throws(()=>preflightOwnerLocal(f.argv,{CI:'true'}),/CI/);
 assert.throws(()=>preflightOwnerLocal(f.argv,{GITLAB_CI:'true'}),/CI/);
 assert.equal(existsSync(f.out),false);
});
test('reject plan mutation after signature, invalid rights, required fees, and attribution',t=>{
 const f=fixture(t);
 writeFileSync(f.source,JSON.stringify({...f.plan,brief:{...f.plan.brief,title:'某自創企劃改版'}}));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/SHA256/);
 writeFileSync(f.source,JSON.stringify(f.plan,null,2)+'\n');
 f.assertion.rights.paymentRequired=true;
 writeFileSync(f.rights,JSON.stringify(f.assertion));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/paymentRequired/);
 f.assertion.rights.paymentRequired=false;f.assertion.rights.attributionRequiredInFinishedAd=true;
 writeFileSync(f.rights,JSON.stringify(f.assertion));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/attributionRequiredInFinishedAd/);
 f.assertion.rights.attributionRequiredInFinishedAd=false;f.assertion.rights.externalImages='CC-BY-stock';
 writeFileSync(f.rights,JSON.stringify(f.assertion));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/externalImages/);
});
test('reject in-repo private sources or delivery, malformed paths and untrusted tool fingerprint',t=>{
 const f=fixture(t);
 const inRepo=resolve(repoRoot,'out/private-user-ad');
 assert.throws(()=>preflightOwnerLocal([...f.argv.slice(0,2),inRepo,...f.argv.slice(3)],{}),/outside the public repository/);
 assert.throws(()=>preflightOwnerLocal(['relative.json',...f.argv.slice(1)],{}),/absolute local path/);
 assert.throws(()=>preflightOwnerLocal([...f.argv.slice(0,5),'0'.repeat(64)],{}),/SHA mismatch/);
 const bridge=join(f.dir,'outside-link-to-public-checkout');
 symlinkSync(repoRoot,bridge,'dir');
 assert.throws(()=>preflightOwnerLocal([...f.argv.slice(0,2),join(bridge,'private-ad-output'),...f.argv.slice(3)],{}),/resolves through a link/);
 assert.throws(()=>parseLocalOptions([...f.argv,'--extra']),/unknown flags|mandatory/);
 mkdirSync(f.out);
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/overwrite/);
});
test('owner-local input cannot smuggle paths, arbitrary HTML, or third-party media fields',t=>{
 const f=fixture(t);
 const suspicious=structuredClone(f.plan);
 suspicious.brief.title='https://example.invalid/photo.png';
 writeFileSync(f.source,JSON.stringify(suspicious));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/forbidden/);
 const forbidden=structuredClone(f.plan);
 forbidden.privateAssets=['company-logo.png'];
 writeFileSync(f.source,JSON.stringify(forbidden));
 assert.throws(()=>preflightOwnerLocal(f.argv,{}),/unsupported fields/);
});
