// Public-synthetic only: no company APP content or remote connections.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {mkdtempSync, readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {SPEC,validate,pose,html,build} from './three-step-quiz-synthetic-95f.mjs';

test('public-synthetic and 95-frame-only gates fail closed',()=>{
 assert.equal(validate(),SPEC);
 for(const [field,value] of [['engine','arbitrary'],['contentClass','company-private'],['fps',60],['frames',96]]){
  const v=structuredClone(SPEC);v[field]=value;assert.throws(()=>validate(v));
 }
 const v=structuredClone(SPEC);v.rounds[2].correct=0;assert.throws(()=>validate(v));
});
test('three questions, four choices each, one unique parent per question',()=>{
 const code=html();
 assert.equal((code.match(/class="quiz-card"/g)||[]).length,3);
 assert.equal((code.match(/class="choice"/g)||[]).length,12);
 for(let i=0;i<3;i++)assert.ok(code.includes('id="quiz-'+i+'"'));
 assert.doesNotMatch(code, /VocabKnow|APP_native|resilient|journey|accomplish|單字馬拉松|<script\s+src=|https?:\/\//i);
 assert.match(code,/data-no-timeline/);
});
test('icon fully identifiable for 15 frames, then runner moves right',()=>{
 for(let f=7;f<=21;f++)assert.equal(pose(f).icon.alpha,1);
 assert.equal(pose(0).icon.alpha,0);assert.equal(pose(24).icon.alpha,0);
 assert.ok(pose(70).runner.x>pose(38).runner.x);
});
test('Q1 next state remains pressed through group exit without reverting',()=>{
 assert.equal(pose(44).cards[0].selected,true);
 assert.equal(pose(44).cards[0].success,false);
 assert.equal(pose(45).cards[0].success,true);
 for(let f=47;f<=52;f++){
  assert.equal(pose(f).cards[0].selected,true);
  assert.equal(pose(f).cards[0].success,true);
  assert.equal(pose(f).cards[0].pressed,true);
 }
 assert.equal(pose(52).cards[0].alpha,0);
 assert.ok(pose(53).cards[1].alpha>.99);
});
test('Q2 feedback persists until exit; Q3 never gets an invented success',()=>{
 assert.equal(pose(65).cards[1].selected,true);
 assert.equal(pose(66).cards[1].success,true);
 for(let f=68;f<=73;f++)assert.equal(pose(f).cards[1].pressed,true);
 assert.equal(pose(73).cards[1].alpha,0);
 assert.ok(pose(74).cards[2].alpha>.99);
 for(let f=0;f<95;f++)assert.equal(pose(f).cards[2].success,false);
 assert.equal(pose(94).visibleRound,2);
});
test('script hf-seek draws deterministic forward and reverse animation',()=>{
 const code=html();
 const m=code.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(m);
 const ids=['launch-icon','runner','heading',...Array.from({length:3},(_,i)=>['quiz-'+i,'success-'+i,'next-'+i,'choice-'+i+'-0']).flat()];
 const nodes=new Map(ids.map(id=>[id,{style:{}}]));
 const events={};const win={addEventListener(n,f){events[n]=f;}};
 runInNewContext(m[1],{window:win,document:{getElementById(id){assert.ok(nodes.has(id));return nodes.get(id)}}});
 const draw=(f)=>{events['hf-seek']({detail:{time:f/30}});return JSON.stringify([...nodes].map(([id,o])=>[id,o.style]));};
 let f70=draw(70);let f42=draw(42);assert.notEqual(f70,f42);
 assert.equal(draw(70),f70);assert.equal(draw(42),f42);
 let before=draw(45);let after=draw(52);assert.notEqual(before,after);
 assert.equal(nodes.get('success-0').style.visibility,'visible');
 assert.equal(draw(94),draw(94));
});
test('fresh-only build returns locked manifest',()=>{
 const root=mkdtempSync(join(tmpdir(),'fictional-quiz-'));
 try {const p=join(root,'new');build(p);const q=JSON.parse(readFileSync(join(p,'review-gates.json')));
  assert.equal(q.realS08Test,'NOT_PROVEN');assert.equal(q.privateAssets,'ZERO');
  assert.throws(()=>build(p),/new output required/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
