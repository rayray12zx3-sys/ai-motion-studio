import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { compile } from "./adapter.mjs";
import { addSemanticGraph } from "./semantic-graph.mjs";

const input = JSON.parse(readFileSync(new URL("./probe.plan.json", import.meta.url), "utf8"));
test("three persistent graphic objects survive narrative transitions", () => {
  const { html } = compile(input);
  const output = addSemanticGraph(html, input);
  assert.match(output, /id="semantic-graph"/);
  assert.equal((output.match(/<circle id="causal-node-/g) || []).length, 3);
  assert.equal((output.match(/<line id="causal-link-/g) || []).length, 3);
  assert.doesNotMatch(output, /@keyframes|<script\s+src=|url\(\s*https?:\/\//);
  assert.throws(() => addSemanticGraph(output, input), /unexpected/);
});
test("graph has repeatable reverse-seek positions with no browser clocks", () => {
  const { html } = compile(input);
  const output = addSemanticGraph(html, input);
  const script = output.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = new Map();
  for (let i=0;i<3;i++) {
    elements.set("causal-node-"+i, { attrs:{}, setAttribute(k,v){this.attrs[k]=v;} });
    elements.set("causal-link-"+i, { attrs:{}, setAttribute(k,v){this.attrs[k]=v;} });
  }
  elements.set("causal-result", { attrs:{}, setAttribute(k,v){this.attrs[k]=v;} });
  const listeners={};
  const window={addEventListener(name, fn){listeners[name]=fn;}};
  const document={getElementById(id){return elements.get(id);}};
  runInNewContext(script,{window,document});
  assert.equal(typeof listeners["hf-seek"],"function");
  function position(frame) {
    listeners["hf-seek"]({detail:{time:frame/input.render.fps}});
    return JSON.stringify([...elements].map(([id,obj])=>[id,obj.attrs]));
  }
  const scatter=position(11), linked=position(23), resolved=position(39);
  assert.notEqual(scatter,linked);
  assert.notEqual(linked,resolved);
  assert.equal(position(11),scatter);
  assert.equal(position(23),linked);
  assert.equal(position(39),resolved);
  assert.equal(elements.get("causal-node-0").attrs.opacity,"1");
  assert.equal(elements.get("causal-result").attrs.opacity,"1");
});
