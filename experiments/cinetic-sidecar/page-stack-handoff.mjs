// C3.8 isolated, ORIGINAL PUBLIC-SYNTHETIC page-stack motion.
// This is a custom opt-in HyperFrames rendering experiment inspired by the
// pinned Cinetic director Skill, NOT execution of its complete upstream scripts.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FIXTURE = Object.freeze({
  schemaVersion: 1,
  engine: "cinetic-hyperframes",
  contentClass: "public-synthetic",
  motif: "page-stack-handoff",
  fps: 30, frames: 95, width: 720, height: 1280,
  provenance: { directorSource: "Leonxlnx/cinetic", commit: "ecfa6605de1adb9345ce937724810dc32267d068", runtime: "hyperframes@0.8.143" },
  objects: {
    heading: { id: "mode-heading", title: "ORBIT TRANSIT" },
    icon: { id: "launch-icon" },
    actor: { id: "courier-token", naturalFacing: "left" },
    outgoing: { id: "page-outgoing", question: "STATION A", options: ["NORTH BAY", "EAST PIER", "SOUTH LOOP", "WEST ARC"], correctIndex: 0 },
    incoming: { id: "page-incoming", question: "STATION B", options: ["MOON GATE", "STAR PORT", "SOLAR DOCK", "SKY FIELD"], correctIndex: null },
    success: { id: "success-check", parentId: "page-outgoing" }
  }
});
function ensure(x, msg) { if (!x) throw new Error(msg); }
export function validateFixture(fixture) {
  ensure(fixture.engine === "cinetic-hyperframes" && fixture.contentClass === "public-synthetic" && fixture.motif === "page-stack-handoff", "isolated opt-in route required");
  ensure(fixture.fps === 30 && fixture.frames === 95 && fixture.width === 720 && fixture.height === 1280, "unsupported render profile");
  const o = fixture.objects;
  ensure(o.heading.id === "mode-heading" && o.outgoing.id !== o.incoming.id && o.success.parentId === o.outgoing.id, "invalid heading/group/attached check");
  ensure(o.outgoing.options.length === 4 && o.incoming.options.length === 4 && o.incoming.correctIndex === null, "complete independent pages with no invented later success required");
  ensure(o.actor.naturalFacing === "left", "never mirror the actor against its movement");
  const ids = Object.values(o).map(v => v.id);
  ensure(new Set(ids).size === ids.length, "duplicate semantic object");
  return fixture;
}

// Function is serialized unchanged into the browser: one deterministic state
// for forward, random and reverse frame seeks. No CSS keyframes or timer loop.
export function frameState(frame) {
  const clamp = t => Math.max(0, Math.min(1, t));
  const smooth = (a, b, f) => { const t = clamp((f-a)/(b-a)); return t*t*(3-2*t); };
  const lerp = (a,b,t) => a+(b-a)*t;
  const f = Math.max(0, Math.min(94, Math.floor(frame)));
  const enter = smooth(6,23,f);
  const click = smooth(24,29,f);
  const falling = smooth(28,46,f);
  const headingEnter = smooth(10,27,f);
  const headingRise = smooth(31,50,f);
  const pageReveal = smooth(36,51,f);
  const handoff = smooth(63,80,f);
  const exit = smooth(63,77,f);
  const oldFade = 1-smooth(67,76,f);
  const actorRunning = f >= 46;
  const actorX = actorRunning ? lerp(508,144,clamp((f-46)/48)) : lerp(360,508,falling);
  const actorY = actorRunning ? 1002-3*Math.abs(Math.sin((f-46)*1.05)) : lerp(314,1002,falling);
  return {
    frame:f,
    icon: {x:lerp(830,360,enter),y:310,opacity:f<6?0:(1-smooth(28,38,f)),clicked:click},
    heading: {x:lerp(830,360,headingEnter),y:lerp(421,213,headingRise),opacity:f<10?0:smooth(10,16,f)},
    actor: {x:actorX,y:actorY,opacity:f<28?0:smooth(28,32,f),facing:"left",angle:actorRunning?2*Math.sin((f-46)*1.05):0},
    outgoing: {y:lerp(42,20,pageReveal)-280*exit,alpha:f<36?0:pageReveal*(f<63?1:oldFade),scale:1},
    incoming: {y:lerp(65,48,pageReveal)-28*handoff,alpha:f<36?0:(.66+.34*handoff)*pageReveal,scale:lerp(.96,1,handoff)},
    check: {opacity:f<63?0:oldFade,attachedTo:"page-outgoing"},
    pageClipTop:430,
    artApproval:"PENDING_USER_APPROVAL"
  };
}

function card(o, cssId, mark) {
  const rows = o.options.map((t,i) => '<div class="answer" id="' + cssId + '-row-' + i + '" data-row="' + i + '">' +
    '<span>' + t + '</span>' + (mark && i === 0 ? '<span id="success-check" aria-label="complete">&#10003;</span>' : '') + '</div>').join("");
  return '<section id="' + cssId + '" class="page-parent" data-group="one-question-plus-four-options">' +
    '<header class="question">' + o.question + '</header><div class="answers">' + rows + '</div></section>';
}
export function compileHtml(fixture=FIXTURE) {
  validateFixture(fixture);
  const o=fixture.objects;
  const htmlScript=[
    "(function(){'use strict';",
    "const frameState = " + frameState.toString() + ";",
    "const ids = ['launch-icon','mode-heading','courier-token','page-outgoing','page-incoming','success-check','page-outgoing-row-0'];",
    "const nodes = Object.fromEntries(ids.map(x=>[x,document.getElementById(x)]));",
    "function seek(frame){const p=frameState(frame);",
    "nodes['launch-icon'].style.transform='translate('+p.icon.x+'px,'+p.icon.y+'px) translate(-50%,-50%)';nodes['launch-icon'].style.opacity=p.icon.opacity;",
    "nodes['mode-heading'].style.transform='translate('+p.heading.x+'px,'+p.heading.y+'px) translate(-50%,-50%)';nodes['mode-heading'].style.opacity=p.heading.opacity;",
    "nodes['courier-token'].style.transform='translate('+p.actor.x+'px,'+p.actor.y+'px) translate(-50%,-50%) rotate('+p.actor.angle+'deg)';nodes['courier-token'].style.opacity=p.actor.opacity;",
    "nodes['page-outgoing'].style.transform='translateY('+p.outgoing.y+'px) scale('+p.outgoing.scale+')';nodes['page-outgoing'].style.opacity=p.outgoing.alpha;",
    "nodes['page-incoming'].style.transform='translateY('+p.incoming.y+'px) scale('+p.incoming.scale+')';nodes['page-incoming'].style.opacity=p.incoming.alpha;",
    "nodes['success-check'].style.opacity=p.check.opacity;nodes['page-outgoing-row-0'].style.background=p.frame>=63?'#327964':'#344f80';",
    "window.__pageStackPose=p;return p;}",
    "window.__pageStackSeek=seek;window.addEventListener('hf-seek',e=>{const t=Number(e&&e.detail&&e.detail.time);if(Number.isFinite(t))seek(Math.round(t*30));});seek(0);",
    "})();"
  ].join("\n");
  return [
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Original synthetic orbit page stack</title>",
    "<style>",
    "*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}",
    "#composition{position:relative;overflow:hidden;width:720px;height:1280px;background:linear-gradient(165deg,#101a32,#0b1228);color:#fff;font-family:Arial,sans-serif}",
    "#composition:before{content:'';position:absolute;left:30px;top:1015px;width:660px;border-top:2px solid rgba(136,231,229,.28)}",
    "#launch-icon{position:absolute;left:0;top:0;width:138px;height:138px;border-radius:28px;background:#8063a5;border:3px solid #c6b1ed;box-shadow:0 8px 50px rgba(137,94,199,.27);display:grid;place-items:center;color:#fcf7ff;font-size:74px}",
    "#mode-heading{position:absolute;left:0;top:0;width:520px;text-align:center;color:#f6da93;font-size:49px;font-weight:800;letter-spacing:.035em;text-shadow:0 4px 26px rgba(242,180,89,.20);white-space:nowrap;z-index:8}",
    "#mode-heading:after{content:'';display:block;height:3px;background:#f6da93;width:63%;margin:11px auto 0}",
    "#courier-token{position:absolute;left:0;top:0;width:68px;height:68px;border-radius:50%;border:4px solid #b3e8ff;background:#4bacc1;display:grid;place-items:center;font-size:33px;font-weight:900;color:#072337;box-shadow:0 15px 22px rgba(0,0,0,.5);z-index:7}",
    "#courier-token:after{content:'';position:absolute;top:73px;left:9px;width:48px;height:7px;border-radius:50%;background:rgba(246,211,130,.46)}",
    "#page-stage{position:absolute;left:98px;top:430px;width:524px;height:560px;overflow:hidden;z-index:5;mask-image:linear-gradient(to bottom,transparent,black 8%,black 97%,transparent);}",
    ".page-parent{position:absolute;top:0;left:0;width:524px;height:468px;border:3px solid #a4bde7;border-radius:31px;background:#233b67;box-shadow:0 15px 24px rgba(0,0,0,.24);padding:24px;transform-origin:center top}",
    "#page-incoming{z-index:1}#page-outgoing{z-index:2}",
    ".question{width:100%;height:96px;border-radius:19px;background:#5072a2;display:grid;place-items:center;font-weight:800;font-size:43px;letter-spacing:.04em}",
    ".answers{margin-top:17px;display:grid;gap:9px}.answer{position:relative;height:61px;border:2px solid #819bc0;border-radius:13px;background:#344f80;padding:14px 18px;font-size:25px;font-weight:750}",
    "#page-outgoing .answer:first-child{background:#344f80}#success-check{position:absolute;right:16px;top:10px;border-radius:50%;background:#a2f5c2;color:#174e3f;width:36px;height:36px;text-align:center;line-height:36px;font-size:25px}",
    "#review-stamp{position:absolute;bottom:40px;left:0;width:720px;text-align:center;opacity:.42;font-size:17px;letter-spacing:.13em}",
    "</style></head><body><div id=\"composition\" data-composition-id=\"cinetic-synthetic-stack\" data-no-timeline data-start=\"0\" data-duration=\"3.166667\" data-width=\"720\" data-height=\"1280\" data-fps=\"30\">",
    '<div id="launch-icon" aria-label="synthetic icon">&#9670;</div>',
    '<div id="mode-heading">ORBIT TRANSIT</div>',
    '<div id="page-stage">' + card(o.incoming,"page-incoming",false) + card(o.outgoing,"page-outgoing",true) + '</div>',
    '<div id="courier-token" aria-label="left-directed courier">&#8592;</div>',
    '<div id="review-stamp">FICTIONAL MOTION TEST • NOT A PRODUCT UI</div>',
    "<script>",htmlScript,"</script></div></body></html>"
  ].join("\n")+"\n";
}
export function createArtifacts(destination) {
  const dir=resolve(destination);
  if (existsSync(dir)) throw new Error("refuse to overwrite previous experiment");
  mkdirSync(dir,{recursive:true});
  writeFileSync(resolve(dir,"index.html"),compileHtml(),{flag:"wx"});
  writeFileSync(resolve(dir,"fixture.json"),JSON.stringify(FIXTURE,null,2)+"\n",{flag:"wx"});
  writeFileSync(resolve(dir,"review-gates.json"),JSON.stringify({
    status:"REAL_ENGINE_NOT_RUN_YET",
    engine:"hyperframes@0.8.143",
    upstreamCineticFullSkill:"NOT_INSTALLED_OR_EXECUTED",
    visual:"PENDING_INDEPENDENT_REVIEW",art:"PENDING_USER_APPROVAL",
    companyMedia:"NONE",commercialRights:"PENDING",windowsPremiere:"NOT_TESTED"
  },null,2)+"\n",{flag:"wx"});
  return dir;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { ensure(process.argv.length===3,"Usage: node page-stack-handoff.mjs <new-output-directory>"); console.log(createArtifacts(process.argv[2])); }
  catch(e){ console.error(e.message);process.exitCode=1; }
}
