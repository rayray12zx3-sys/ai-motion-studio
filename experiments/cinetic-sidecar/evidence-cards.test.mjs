import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { compile } from "./adapter.mjs";
import { addEvidenceCards } from "./evidence-cards.mjs";

const original = JSON.parse(readFileSync(new URL("./story-eight.plan.json", import.meta.url), "utf8"));
function create() { return addEvidenceCards(compile(original).html, original); }

test("explicit evidence motif uses three persistent original cards plus one result", () => {
  const html = create();
  assert.match(html, /id="evidence-device"/);
  assert.equal((html.match(/<g id="evidence-card-/g) || []).length, 3);
  assert.equal((html.match(/<path id="evidence-link-/g) || []).length, 3);
  assert.match(html, /id="evidence-result"/);
  assert.doesNotMatch(html, /@keyframes|<script\s+src|url\(\s*https?:\/\//i);
  assert.throws(() => addEvidenceCards(html, original), /unexpected/);
  assert.throws(() => addEvidenceCards(compile(original).html, { ...original, direction: { visualMotif: "semantic-graph" } }), /mismatch/);
});
test("render is pure frame seek: scattered cards move into connections then a result", () => {
  const html = create();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ids = [...Array(3)].flatMap((_,i)=>["evidence-card-"+i,"evidence-link-"+i]).concat("evidence-result");
  const map = new Map(ids.map(id=>[id,{attrs:{},setAttribute(k,v){this.attrs[k]=v;}}]));
  const listeners = {};
  const window = { addEventListener(name,handler){listeners[name]=handler;} };
  const document = { getElementById(id){return map.get(id);} };
  runInNewContext(script,{window,document});
  assert.equal(typeof listeners["hf-seek"],"function");
  function frame(n){
    listeners["hf-seek"]({detail:{time:n/original.render.fps}});
    return JSON.stringify([...map].map(([id,el])=>[id,el.attrs]));
  }
  frame(0);
  assert.equal(map.get("evidence-card-0").attrs.opacity,"1", "frame zero should contain the story device");
  const start = frame(24);
  assert.equal(map.get("evidence-link-0").attrs.opacity,"0");
  assert.equal(map.get("evidence-result").attrs.opacity,"0");
  const middle = frame(122);
  assert.notEqual(start,middle);
  assert.ok(Number(map.get("evidence-link-0").attrs.opacity)>0);
  const finish = frame(228);
  assert.notEqual(middle,finish);
  assert.equal(map.get("evidence-result").attrs.opacity,"1");
  assert.equal(frame(24),start);
  assert.equal(frame(122),middle);
  assert.equal(frame(228),finish);
});
