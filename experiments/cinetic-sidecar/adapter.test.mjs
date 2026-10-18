import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { compile, normalizeDirectorPlan, writeArtifacts, ENGINE, STATUS, UPSTREAM_CINETIC_SHA } from "./adapter.mjs";

const original = JSON.parse(readFileSync(new URL("./sample.plan.json", import.meta.url), "utf8"));
const clone = () => structuredClone(original);
const rejected = (mutate, pattern) => {
  const x = clone();
  mutate(x);
  assert.throws(() => normalizeDirectorPlan(x), pattern);
};

test("explicit opt-in required; no default engine or alternative lane takeover", () => {
  assert.equal(normalizeDirectorPlan(clone()).engine, ENGINE);
  rejected((x) => { x.engine = "python"; }, /explicit opt-in/);
  rejected((x) => { delete x.engine; }, /explicit opt-in/);
});

test("only bounded synthetic content, strict input fields and no review override", () => {
  rejected((x) => { x.contentClass = "company-private"; }, /synthetic/);
  rejected((x) => { x.artisticApproval = "USER_ART_APPROVED"; }, /unsupported fields/);
  rejected((x) => { x.beats[0].qaPass = true; }, /unsupported fields/);
  rejected((x) => { x.direction.techniqueIds.push("tr-velocity-handoff-cut"); }, /duplicate techniqueIds/);
});

test("reject external URL, traversal, HTML snippets and control text", () => {
  rejected((x) => { x.brief.title = "https://example.invalid/private"; }, /forbidden/);
  rejected((x) => { x.beats[1].onScreenText = "<script>alert(1)</script>"; }, /forbidden/);
  rejected((x) => { x.beats[0].meaning = "../private"; }, /forbidden/);
  rejected((x) => { x.beats[0].onScreenText = "a\nb"; }, /forbidden/);
});

test("frame boundaries are contiguous and fully covered", () => {
  rejected((x) => { x.beats[1].startFrame = 50; }, /contiguous/);
  rejected((x) => { x.beats[2].endFrame = 143; }, /cover/);
  rejected((x) => { x.beats[2].endFrame = 145; }, /contiguous|cover|range/);
});

test("semantic cause is mandatory and unsupported stages are blocked", () => {
  rejected((x) => { x.brief.audienceUnderstanding = ""; }, /nonempty/);
  rejected((x) => { x.beats[0].kind = "resolve"; }, /begin scattered/);
  rejected((x) => { x.beats[1].kind = "gsapEval"; }, /unsupported beat.kind/);
});

test("strict 16:9 and 9:16 profiles; deterministic frame counts", () => {
  rejected((x) => { x.render.width = 1024; }, /out of range|layouts/);
  const vertical = clone();
  vertical.render.width = 720;
  vertical.render.height = 1280;
  vertical.render.fps = 30;
  vertical.render.frames = 180;
  vertical.beats[0].endFrame = 60;
  vertical.beats[1].startFrame = 60;
  vertical.beats[1].endFrame = 120;
  vertical.beats[2].startFrame = 120;
  vertical.beats[2].endFrame = 180;
  const compiled = compile(vertical);
  assert.match(compiled.html, /data-width="720" data-height="1280" data-fps="30"/);
  assert.equal(compiled.timeline.beats[2].endFrame, 180);
});

test("compiled HTML has flat named tracks and no external scripts/media", () => {
  const x = compile(clone());
  assert.equal((x.html.match(/class="clip /g) || []).length, 3);
  assert.match(x.html, /data-no-timeline/);
  assert.match(x.html, /lang="zh-Hant"/);
  assert.match(x.html, /<script>[\s\S]*hf-seek/);
  assert.doesNotMatch(x.html, /@keyframes|animation:|<script\s+src|<iframe|<img|https?:\/\//i);
  assert.equal(x.timeline.causalChain.intent, original.brief.intent);
  assert.equal(x.timeline.provenance.upstreamCineticCommit, UPSTREAM_CINETIC_SHA);
});


test("frame-driven hf-seek poses are deterministic even for reverse seeks", () => {
  const compiled = compile(clone());
  const script = compiled.html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = new Map(original.beats.map((b) => [b.id, { style: {} }]));
  const listeners = {};
  const window = {
    addEventListener(name, fn) { listeners[name] = fn; },
  };
  const document = { getElementById(id) { return elements.get(id); } };
  runInNewContext(script, { window, document });
  assert.equal(typeof listeners["hf-seek"], "function");
  function pose(frame) {
    listeners["hf-seek"]({ detail: { time: frame / original.render.fps } });
    return JSON.stringify([...elements].map(([id, el]) => [id, el.style.opacity, el.style.transform]));
  }
  const final = pose(119);
  const earlier = pose(35);
  assert.notEqual(earlier, final);
  assert.equal(pose(119), final);
  assert.equal(pose(35), earlier);
});

test("independent visual review and user approval remain unconditionally pending", () => {
  const x = compile(clone()).review;
  assert.equal(x.technical.status, STATUS.technical);
  assert.equal(x.visual.status, "PENDING_INDEPENDENT_REVIEW");
  assert.equal(x.visual.reviewer, "visual-design-review");
  assert.equal(x.artisticApproval.status, "PENDING_USER_APPROVAL");
  assert.equal(x.commercialRights.status, "BLOCKED_PENDING_RUNTIME_AUDIT");
  assert.equal(x.windowsPremiere, "NOT_TESTED");
  assert.equal(x.upstreamSelfCritiqueCanApprove, false);
});

test("deterministic artifacts, no mutation of input or production code", () => {
  const x = clone();
  const unchanged = JSON.stringify(x);
  const a = compile(x);
  const b = compile(x);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(x), unchanged);
  const dir = mkdtempSync(join(tmpdir(), "cinetic-contract-test-"));
  try {
    const out = writeArtifacts(x, dir);
    assert.equal(out.dir, dir);
    assert.deepEqual(readdirSync(dir).sort(), ["index.html", "review-gates.json", "timeline.json", "validated-plan.json"]);
    assert.equal(readFileSync(join(dir, "index.html"), "utf8"), a.html);
    assert.deepEqual(JSON.parse(readFileSync(join(dir, "review-gates.json"), "utf8")), a.review);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
