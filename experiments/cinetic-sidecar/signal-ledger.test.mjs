import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { compile, normalizeDirectorPlan } from "./adapter.mjs";
import { addSignalLedger } from "./signal-ledger.mjs";

const original = JSON.parse(readFileSync(new URL("./story-eight-editorial.plan.json", import.meta.url), "utf8"));
const generate = () => addSignalLedger(compile(original).html, normalizeDirectorPlan(original));

test("opt-in editorial composition uses asymmetric hierarchy and one persistent instrument", () => {
  const html=generate();
  assert.match(html, /id="signal-ledger"/);
  assert.match(html, /width="1280" height="720"/);
  assert.match(html, /#composition \.clip\{left:116px;top:268px;width:385px/);
  assert.match(html, /x="78" y="88" width="445" height="544"/);
  assert.equal((html.match(/id="signal-trace-/g)||[]).length,3);
  assert.equal((html.match(/id="signal-marker-/g)||[]).length,3);
  assert.equal((html.match(/class="clip /g)||[]).length,3);
  assert.match(html, /分散訊號/);
  assert.match(html, /找到關聯/);
  assert.match(html, /形成判讀/);
  assert.doesNotMatch(html, /@keyframes|requestAnimationFrame|setInterval|<script\s+src|url\(\s*https?:\/\//);
  assert.throws(()=>addSignalLedger(html,original),/unexpected/);
});
test("storyboard rejects accidental use outside bounded new visual lane",()=>{
  const p=structuredClone(original);
  p.direction.visualMotif="evidence-cards";
  assert.throws(()=>addSignalLedger(compile(p).html,p),/requires explicit/);
  p.direction.visualMotif="signal-ledger";
  p.render.width=720;p.render.height=1280;
  assert.throws(()=>addSignalLedger(compile(p).html,p),/requires explicit/);
});
test("frame-based waveforms and single conclusion are deterministic under nonsequential seeking",()=>{
  const html=generate();
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const names=[
    ...[0,1,2].flatMap(i=>["signal-trace-"+i,"signal-marker-"+i,"signal-phase-"+i]),
    "signal-lockline","signal-ring","signal-core","signal-closure","signal-progress"
  ];
  const nodes=new Map(names.map(id=>[id,{attrs:{},setAttribute(k,v){this.attrs[k]=v;}}]));
  const listener={};
  runInNewContext(script,{
    document:{getElementById(id){const n=nodes.get(id);assert.ok(n,"unhandled "+id);return n;}},
    window:{addEventListener(name,cb){listener[name]=cb;}}
  });
  assert.equal(typeof listener["hf-seek"],"function");
  function seek(frame){
    listener["hf-seek"]({detail:{time:frame/original.render.fps}});
    return JSON.stringify([...nodes].map(([id,n])=>[id,n.attrs]));
  }
  const initial=seek(0),part1=seek(52),part2=seek(110),part3=seek(213);
  assert.notEqual(initial,part1);
  assert.notEqual(part1,part2);
  assert.notEqual(part2,part3);
  assert.equal(seek(0),initial);
  assert.equal(seek(110),part2);
  assert.equal(seek(213),part3);
  seek(0);
  assert.equal(nodes.get("signal-lockline").attrs.opacity,"0");
  assert.equal(nodes.get("signal-ring").attrs.opacity,"0");
  seek(110);
  assert.ok(Number(nodes.get("signal-lockline").attrs.opacity)>0.5);
  seek(213);
  assert.ok(Number(nodes.get("signal-ring").attrs.r)>45);
  assert.equal(nodes.get("signal-closure").attrs.opacity,"1");
  for(const i of [0,1,2])assert.ok(nodes.get("signal-trace-"+i).attrs.d.startsWith("M625.00"));
});
