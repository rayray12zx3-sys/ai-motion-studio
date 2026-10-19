import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { FIXTURE, frameState, validateFixture, compileHtml, createArtifacts } from "./page-stack-handoff.mjs";

test("fixed public-synthetic route and unique stable parent IDs",()=>{
  validateFixture(FIXTURE);
  assert.equal(FIXTURE.engine,"cinetic-hyperframes");
  const bad=structuredClone(FIXTURE);bad.contentClass="company-private";
  assert.throws(()=>validateFixture(bad),/isolated opt-in/);
  const dup=structuredClone(FIXTURE);dup.objects.incoming.id=dup.objects.outgoing.id;
  assert.throws(()=>validateFixture(dup),/invalid heading/);
  assert.equal(FIXTURE.objects.success.parentId,FIXTURE.objects.outgoing.id);
  assert.equal(FIXTURE.objects.actor.naturalFacing,"left");
});
test("frame-zero no icon leak and actor actually drops then runs left",()=>{
  const a=frameState(0),b=frameState(22),drop=frameState(34),land=frameState(46),run=frameState(77),end=frameState(94);
  assert.equal(a.icon.opacity,0);
  assert.ok(a.icon.x-138/2>720);
  assert.ok(b.icon.x<a.icon.x);
  assert.ok(drop.actor.y>b.icon.y && drop.actor.y<land.actor.y);
  assert.equal(land.actor.facing,"left");
  assert.ok(run.actor.x<land.actor.x && end.actor.x<run.actor.x);
  assert.equal(frameState(0).check.opacity,0);
});
test("exactly one independent heading, two complete pages, one attached check",()=>{
  const html=compileHtml();
  assert.equal((html.match(/id="mode-heading"/g)||[]).length,1);
  assert.equal((html.match(/class="page-parent"/g)||[]).length,2);
  assert.equal((html.match(/class="answer"/g)||[]).length,8);
  assert.equal((html.match(/id="success-check"/g)||[]).length,1);
  assert.match(html,/id="page-outgoing-row-0"/);
  assert.doesNotMatch(html,/@keyframes|<script\s+src=|https?:\/\/|<img|<iframe/i);
  assert.match(html,/data-no-timeline/);
});
test("outgoing moves up with check while pre-existing incoming rises and remains underneath",()=>{
  const before=frameState(62),a=frameState(63),mid=frameState(70),late=frameState(76),after=frameState(94);
  assert.ok(before.incoming.alpha>0 && before.outgoing.alpha>0);
  assert.equal(before.check.opacity,0);
  assert.ok(a.check.opacity>0 && mid.check.opacity>0);
  assert.ok(mid.outgoing.y<a.outgoing.y);
  assert.ok(mid.outgoing.alpha<a.outgoing.alpha);
  assert.ok(mid.incoming.y<a.incoming.y && mid.incoming.alpha>a.incoming.alpha);
  assert.ok(mid.incoming.alpha>0 && mid.outgoing.alpha>0);
  assert.equal(mid.check.attachedTo,FIXTURE.objects.outgoing.id);
  assert.equal(late.outgoing.alpha,0);
  assert.ok(after.incoming.alpha>.99);
  assert.equal(after.check.opacity,0);
  assert.equal(after.artApproval,"PENDING_USER_APPROVAL");
});
test("browser hf-seek is deterministic over random and reverse seeks",()=>{
  const html=compileHtml();
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match);
  const ids=["launch-icon","mode-heading","courier-token","page-outgoing","page-incoming","success-check","page-outgoing-row-0"];
  const nodes=new Map(ids.map(id=>[id,{style:{}}]));
  const listeners={};
  const window={addEventListener(n,fn){listeners[n]=fn;}};
  const document={getElementById(id){return nodes.get(id);}};
  runInNewContext(match[1],{window,document});
  function pose(f) {listeners["hf-seek"]({detail:{time:f/30}});return JSON.stringify([...nodes].map(([id,node])=>[id,node.style]));}
  const a=pose(76),b=pose(63); assert.notEqual(a,b);assert.equal(pose(76),a);assert.equal(pose(63),b);
  assert.equal(nodes.get("page-outgoing-row-0").style.background,"#327964");
  pose(1);assert.equal(nodes.get("page-outgoing-row-0").style.background,"#344f80");
});
test("new output-only artifacts with independent acceptance gates",()=>{
  const root=mkdtempSync(join(tmpdir(),"cinetic-c38-"));
  const out=join(root,"fresh");
  try {
    createArtifacts(out);
    assert.equal(readFileSync(join(out,"fixture.json"),"utf8").includes("public-synthetic"),true);
    const review=JSON.parse(readFileSync(join(out,"review-gates.json"),"utf8"));
    assert.equal(review.art,"PENDING_USER_APPROVAL");
    assert.equal(review.upstreamCineticFullSkill,"NOT_INSTALLED_OR_EXECUTED");
    assert.equal(review.companyMedia,"NONE");
    assert.throws(()=>createArtifacts(out),/refuse to overwrite/);
  } finally{ rmSync(root,{recursive:true,force:true});}
});
