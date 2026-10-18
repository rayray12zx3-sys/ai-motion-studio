import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ENGINE = "cinetic-hyperframes";
export const UPSTREAM_CINETIC_SHA = "ecfa6605de1adb9345ce937724810dc32267d068";
export const STATUS = Object.freeze({
  technical: "NOT_RUN",
  visual: "PENDING_INDEPENDENT_REVIEW",
  art: "PENDING_USER_APPROVAL",
  license: "BLOCKED_PENDING_RUNTIME_AUDIT",
  premiere: "NOT_TESTED",
});

function assert(condition, message) {
  if (!condition) throw new TypeError(message);
}
function record(value, keys, name) {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), name + " must be an object");
  const unknown = Object.keys(value).filter((key) => !keys.includes(key));
  assert(unknown.length === 0, name + " has unsupported fields: " + unknown.join(", "));
}
function text(value, name, max = 100) {
  assert(typeof value === "string" && value.trim().length > 0 && Array.from(value).length <= max, name + " must be short nonempty text");
  assert(!/[<>\x60{}\u0000-\u001f]/u.test(value) && !/(?:https?:\/\/|www\.|drive\.google|github\.com|[/\\])/iu.test(value), name + " contains forbidden path, markup or URL");
  return value.normalize("NFC");
}
function integer(value, name, min, max) {
  assert(Number.isInteger(value) && value >= min && value <= max, name + " out of range");
  return value;
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function seconds(frames, fps) {
  return Number((frames / fps).toFixed(6));
}
export function normalizeDirectorPlan(input) {
  record(input, ["schemaVersion", "engine", "contentClass", "brief", "render", "direction", "beats"], "plan");
  assert(input.schemaVersion === 1, "unsupported schemaVersion");
  assert(input.engine === ENGINE, "Cinetic sidecar requires explicit opt-in engine");
  assert(input.contentClass === "public-synthetic", "only original public synthetic examples are permitted");
  const brief = input.brief;
  record(brief, ["title", "intent", "trigger", "physicalResponse", "audienceUnderstanding"], "brief");
  const normalizedBrief = {
    title: text(brief.title, "brief.title", 48),
    intent: text(brief.intent, "brief.intent", 100),
    trigger: text(brief.trigger, "brief.trigger", 100),
    physicalResponse: text(brief.physicalResponse, "brief.physicalResponse", 100),
    audienceUnderstanding: text(brief.audienceUnderstanding, "brief.audienceUnderstanding", 100),
  };
  const render = input.render;
  record(render, ["width", "height", "fps", "frames"], "render");
  const width = integer(render.width, "render.width", 720, 1280);
  const height = integer(render.height, "render.height", 720, 1280);
  assert((width === 1280 && height === 720) || (width === 720 && height === 1280), "only independent 16:9 or 9:16 layouts allowed");
  const fps = integer(render.fps, "render.fps", 24, 30);
  assert([24, 30].includes(fps), "unsupported fps");
  const frames = integer(render.frames, "render.frames", 48, 300);
  const direction = input.direction;
  record(direction, ["seed", "techniqueIds", "visualLanguage"], "direction");
  assert(Array.isArray(direction.techniqueIds) && direction.techniqueIds.length >= 1 && direction.techniqueIds.length <= 4, "direction.techniqueIds must contain 1-4 items");
  const techniqueIds = direction.techniqueIds.map((id, i) => {
    assert(typeof id === "string" && /^[a-z][a-z0-9-]{2,64}$/.test(id), "invalid technique ID " + i);
    return id;
  });
  assert(new Set(techniqueIds).size === techniqueIds.length, "duplicate techniqueIds");
  assert(Array.isArray(input.beats) && input.beats.length >= 2 && input.beats.length <= 4, "2-4 semantic beats required");
  let cursor = 0;
  const beats = input.beats.map((beat, i) => {
    record(beat, ["id", "kind", "startFrame", "endFrame", "meaning", "onScreenText"], "beat " + i);
    assert(typeof beat.id === "string" && /^[a-z][a-z0-9-]{1,32}$/.test(beat.id), "invalid beat.id");
    assert(["scatter", "connect", "resolve"].includes(beat.kind), "unsupported beat.kind");
    const startFrame = integer(beat.startFrame, "beat.startFrame", 0, frames);
    const endFrame = integer(beat.endFrame, "beat.endFrame", 1, frames);
    assert(startFrame === cursor && endFrame > startFrame, "beats must be contiguous positive frame ranges");
    cursor = endFrame;
    return {
      id: beat.id,
      kind: beat.kind,
      startFrame,
      endFrame,
      meaning: text(beat.meaning, "beat.meaning", 100),
      onScreenText: text(beat.onScreenText, "beat.onScreenText", 28),
    };
  });
  assert(cursor === frames, "beats must cover all requested frames");
  assert(new Set(beats.map((b) => b.id)).size === beats.length, "duplicate beat IDs");
  assert(!beats.some((b) => ["composition", "root", "main"].includes(b.id)), "reserved beat ID");
  assert(beats[0].kind === "scatter" && beats[beats.length - 1].kind === "resolve", "narrative must begin scattered and end resolved");
  return {
    schemaVersion: 1, engine: ENGINE, contentClass: "public-synthetic", brief: normalizedBrief,
    render: { width, height, fps, frames },
    direction: {
      seed: integer(direction.seed, "direction.seed", 0, 2147483647),
      techniqueIds,
      visualLanguage: text(direction.visualLanguage, "direction.visualLanguage", 48),
    },
    beats,
  };
}
export function buildHtml(plan) {
  const { width, height, fps, frames } = plan.render;
  const vertical = height > width;
  const fontSize = vertical ? 68 : 80;
  const tracks = plan.beats.map((beat, index) => {
    const duration = seconds(beat.endFrame - beat.startFrame, fps);
    return '  <div class="clip ' + beat.kind + '" id="' + beat.id +
      '" data-start="' + seconds(beat.startFrame, fps) + '" data-duration="' + duration +
      '" data-track-index="' + (index + 1) + '">' + escapeHtml(beat.onScreenText) + "</div>";
  }).join("\n");
  const css = [
    "*{box-sizing:border-box}",
    "html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#0c1220}",
    "#composition{position:relative;overflow:hidden;width:" + width + "px;height:" + height + "px;background:#121d2b;color:#f8f4e8;font-family:sans-serif}",
    ".clip{position:absolute;left:8%;width:84%;font-size:" + fontSize + "px;line-height:1.26;font-weight:700;text-align:center;opacity:0}",
    ".scatter{top:24%;letter-spacing:.16em}",
    ".connect{top:42%;letter-spacing:.04em;border-bottom:4px solid #88dbc5;padding-bottom:22px}",
    ".resolve{top:57%;letter-spacing:0}",
  ].join("\n");
  // Upstream Cinetic explicitly forbids CSS keyframes. Every pose below is derived
  // only from an integer frame supplied by HyperFrames' hf-seek event.
  const seekData = JSON.stringify(plan.beats.map((b) => ({
    id: b.id, kind: b.kind, startFrame: b.startFrame, endFrame: b.endFrame,
  })));
  const seekScript = [
    "(function(){",
    "  'use strict';",
    "  const FPS = " + fps + ";",
    "  const beats = " + seekData + ";",
    "  const elements = beats.map(b => document.getElementById(b.id));",
    "  const clamp = x => Math.max(0, Math.min(1, x));",
    "  const ease = x => 1 - Math.pow(1 - clamp(x), 3);",
    "  function setFrame(frame) {",
    "    if (!Number.isFinite(frame)) return;",
    "    const f = Math.max(0, Math.floor(frame));",
    "    beats.forEach((b, i) => {",
    "      const el = elements[i];",
    "      const visible = f >= b.startFrame && f < b.endFrame;",
    "      const p = clamp((f - b.startFrame) / Math.max(1, b.endFrame - b.startFrame - 1));",
    "      const q = ease(p);",
    "      let x = 0, s = 1, a = 0;",
    "      if (b.kind === 'scatter') {",
    "        x = -120 * (1 - q); s = 0.90 + 0.10 * q;",
    "        a = p < .16 ? p / .16 : (p > .84 ? (1 - p) / .16 : 1);",
    "      } else if (b.kind === 'connect') {",
    "        x = 72 * (1 - q); s = .88 + .12 * q;",
    "        a = p < .18 ? p / .18 : (p > .82 ? (1 - p) / .18 : 1);",
    "      } else if (b.kind === 'resolve') {",
    "        x = 0; s = .85 + .15 * q; a = Math.min(1, p / .24);",
    "      }",
    "      el.style.opacity = String(visible ? clamp(a) : 0);",
    "      el.style.transform = 'translate(' + x.toFixed(3) + 'px,0px) scale(' + s.toFixed(4) + ')';",
    "    });",
    "  }",
    "  window.addEventListener('hf-seek', (event) => {",
    "    const time = Number(event && event.detail && event.detail.time);",
    "    if (Number.isFinite(time)) setFrame(Math.round(time * FPS));",
    "  });",
    "  window.__cineticSetFrame = setFrame; // synthetic browser test hook only",
    "  setFrame(0);",
    "})();",
  ].join("\n");
  return [
    "<!doctype html>", '<html lang="zh-Hant"><head><meta charset="utf-8"/>',
    '<meta name="viewport" content="width=' + width + ', initial-scale=1"/>',
    "<title>Original synthetic causal motion — isolated R&D</title>",
    "<style>", css, "</style></head><body>",
    '<div id="composition" data-composition-id="cinetic-synthetic" data-no-timeline data-start="0" data-duration="' + seconds(frames, fps) +
      '" data-width="' + width + '" data-height="' + height + '" data-fps="' + fps + '">',
    tracks,
    "</div><script>", seekScript, "</script></body></html>",
  ].join("\n") + "\n";
}
export function compile(input) {
  const plan = normalizeDirectorPlan(input);
  const timeline = {
    engine: plan.engine, render: plan.render, beats: plan.beats,
    causalChain: { intent: plan.brief.intent, trigger: plan.brief.trigger, kineticResponse: plan.brief.physicalResponse, audienceConsequence: plan.brief.audienceUnderstanding },
    provenance: { skill: "cinetic-director-inspired-adapter", upstreamCineticCommit: UPSTREAM_CINETIC_SHA, techniques: plan.direction.techniqueIds },
  };
  const review = {
    engine: ENGINE, contentClass: plan.contentClass,
    technical: { status: STATUS.technical, alpha: "NOT_TESTED", frameCount: "NOT_TESTED", deterministicSeek: "NOT_TESTED" },
    visual: { status: STATUS.visual, reviewer: "visual-design-review", requiresDecodedFullSpeedEvidence: true },
    artisticApproval: { status: STATUS.art, approver: "user" },
    commercialRights: { status: STATUS.license, includesGsapAndHyperframesAudit: true },
    windowsPremiere: STATUS.premiere,
    upstreamSelfCritiqueCanApprove: false, existingApprovedKVariantsUntouched: true,
  };
  return { plan, timeline, html: buildHtml(plan), review };
}
export function writeArtifacts(input, outputDirectory) {
  const { plan, timeline, html, review } = compile(input);
  const dir = resolve(outputDirectory);
  assert(!existsSync(dir), "output directory already exists: refusing overwrite of prior review artifacts");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "validated-plan.json"), JSON.stringify(plan, null, 2) + "\n", { flag: "wx" });
  writeFileSync(resolve(dir, "timeline.json"), JSON.stringify(timeline, null, 2) + "\n", { flag: "wx" });
  writeFileSync(resolve(dir, "index.html"), html, { flag: "wx" });
  writeFileSync(resolve(dir, "review-gates.json"), JSON.stringify(review, null, 2) + "\n", { flag: "wx" });
  return { dir, review };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert(process.argv.length === 4, "Usage: node adapter.mjs <local-synthetic-plan.json> <output-directory>");
    const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
    const { dir } = writeArtifacts(input, process.argv[3]);
    process.stdout.write("Isolated Cinetic director contract compiled to " + dir + "; render/visual/license approval NOT performed.\n");
  } catch (error) {
    process.stderr.write("Rejected: " + error.message + "\n");
    process.exitCode = 1;
  }
}
