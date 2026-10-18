import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {compile,normalizeDirectorPlan} from "./adapter.mjs";
import {addStoryboardFilm} from "./storyboard-film.mjs";
const plan=JSON.parse(readFileSync(new URL("./storyboard-film.plan.json",import.meta.url),"utf8"));
const generated=()=>addStoryboardFilm(compile(plan).html,normalizeDirectorPlan(plan));

test("new 8s 60fps layout is explicit and does not expand other motifs to 60fps",()=>{
 const validated=normalizeDirectorPlan(plan);
 assert.equal(validated.render.fps,60);
 assert.equal(validated.render.frames,480);
 assert.equal(validated.direction.visualMotif,"storyboard-film");
 const old=structuredClone(plan);old.direction.visualMotif="signal-ledger";
 assert.throws(()=>normalizeDirectorPlan(old),/unsupported fps/);
 const long=structuredClone(plan);long.render.frames=601;
 assert.throws(()=>normalizeDirectorPlan(long),/out of range/);
});

test("hand-drawn raindrop sequence, three persistent physical film cells, and alpha-safe borders",()=>{
 const output=generated();
 assert.match(output,/id="storyboard-film"/);
 assert.equal((output.match(/<g id="story-cell-/g)||[]).length,3);
 assert.match(output,/id="story-raindrop"/);
 assert.match(output,/id="story-ripple-0"/);
 assert.match(output,/id="story-filmrail"/);
 assert.match(output,/data-fps="60"/);
 assert.doesNotMatch(output,/@keyframes|<script\s+src=|url\(\s*https?:\/\//i);
 assert.throws(()=>addStoryboardFilm(output,normalizeDirectorPlan(plan)),/unexpected/);
});
test("a moving visible first frame, edit re-order, hero raindrop and out-of-order seek all remain deterministic",()=>{
 const html=generated();
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const names=[
 ...[0,1,2].flatMap(i=>["story-cell-"+i,"story-step-"+i]),
 "story-filmrail","story-cue","story-hero","story-raindrop",
 "story-ripple-0","story-ripple-1","story-splash","story-playhead"
 ];
 const nodes=new Map(names.map(id=>[id,{attrs:{},setAttribute(k,v){this.attrs[k]=v}}]));
 const listeners={};
 const window={addEventListener(key,fn){listeners[key]=fn}};
 const document={getElementById(id){return nodes.get(id)}};
 runInNewContext(script,{window,document});
 assert.equal(typeof listeners["hf-seek"],"function");
 function pose(n){listeners["hf-seek"]({detail:{time:n/60}});return JSON.stringify([...nodes].map(([k,v])=>[k,v.attrs]));}
 const f0=pose(0);
 assert.equal(nodes.get("story-cell-0").attrs.opacity,"1");
 assert.equal(nodes.get("story-hero").attrs.opacity,"0");
 const montage=pose(241);
 assert.notEqual(f0,montage);
 assert.equal(nodes.get("story-filmrail").attrs.opacity,"1");
 const film=pose(470);
 assert.notEqual(montage,film);
 assert.equal(nodes.get("story-hero").attrs.opacity,"1");
 assert.ok(Number(nodes.get("story-ripple-0").attrs.rx)>1);
 assert.equal(pose(0),f0);
 assert.equal(pose(241),montage);
 assert.equal(pose(470),film);
});
