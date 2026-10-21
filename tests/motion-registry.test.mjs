import test from "node:test";
import assert from "node:assert/strict";
import { registry,validate,getEntry,search,review,tokenize } from "../registry/cli.mjs";
test("snapshot covers 144 MIT records plus thirteen link-only references",()=>{
  assert.deepEqual(validate(),[]);
  assert.equal(registry.entries.length,157);
  assert.equal(registry.entries.filter(e=>e.provider==="motion-prompt").length,144);
  assert.equal(registry.entries.filter(e=>e.source_license==="NOT_VERIFIED").length,13);
});
test("IDs resolve without corrupting source IDs",()=>{
  assert.equal(getEntry("5")?.id,"MP-005");
  assert.equal(getEntry("#005")?.id,"MP-005");
  assert.equal(getEntry("MP-144")?.source_id,"144");
  assert.equal(getEntry("KJ-REF-001")?.provider,"kittenjam");
  assert.equal(getEntry("NO-SUCH-ID"),null);
});
test("traditional Chinese lookup has traceable recommendations",()=>{
  assert.ok(tokenize("驗證成功").includes("success"));
  assert.ok(search("文字進場").some(e=>e.id==="MP-005"||e.id==="MP-006"||e.id==="MP-008"));
  assert.ok(search("3D 分鏡").some(e=>e.id==="PM-3D-001"));
  assert.ok(search("懸停按鈕").some(e=>e.id==="KJ-REF-001"));
  assert.deepEqual(search(" "),[]);
});
test("review never grants technical or artistic approval",()=>{
  const r=review("MP-005");
  assert.equal(r.technical_verdict,"NOT_EVALUATED");
  assert.equal(r.visual_verdict,"PENDING_EVIDENCE");
  assert.equal(r.human_art_approval,"PENDING_HUMAN");
  assert.ok(r.criteria.length>=3);
});
test("licensing guard blocks rights escalation",()=>{
  const clone=structuredClone(registry);
  clone.entries.find(e=>e.id==="KJ-REF-001").source_license="MIT";
  assert.ok(validate(clone).some(e=>e.includes("rights breach")));
});
test("invalid limits and roles rejected",()=>{
  assert.throws(()=>search("type",{limit:0}),/limit/);
  assert.throws(()=>search("type",{role:"producer"}),/role/);
});

test("external references use truthful facets and verified source URLs",()=>{
 assert.equal(registry.entries.filter(e=>e.provider==="kittenjam").length,8);
 assert.equal(registry.entries.filter(e=>e.provider==="prompt-motion").length,5);
 assert.equal(getEntry("KJ-FACET-CURSOR").reference_kind,"COLLECTION_FACET");
 assert.equal(getEntry("PM-SHOWREEL-001").source_url,"https://prompt-motion.com/templates/showreel/customize");
 for(const e of registry.entries.filter(e=>e.provider!=="motion-prompt")){
  assert.equal(e.source_license,"NOT_VERIFIED");
  assert.equal(e.source_code_reuse,"DO_NOT_COPY");
  assert.equal(e.prompt_url,null);
 }
});
