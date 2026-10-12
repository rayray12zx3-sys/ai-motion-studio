import test from 'node:test';
import assert from 'node:assert/strict';
import {compileShotChoreography} from '../src/shot-choreography.mjs';
const first={fps:30,frames:300,shots:[
 {id:'arrival',rig:'mint',start:0,end:153,titleHold:[20,90]},
 {id:'reveal',rig:'lavender',start:127,end:300,titleHold:[160,270]}
]};
test('data-driven two-shot full-film timeline never has gaps or triple layers',()=>{
 const x=compileShotChoreography(first);
 assert.equal(x.frames,300);assert.equal(x.transitions.length,1);assert.equal(x.transitions[0].frames,26);
 assert.deepEqual(x.at(0).weights,[1]);assert.deepEqual(x.at(299).rigs,['lavender']);
 assert.deepEqual(x.at(127).weights,[1,0]);assert.deepEqual(x.at(152).weights,[0,1]);
 const sample=x.at(143);assert.equal(sample.active.length,2);assert.ok(sample.progress>0&&sample.progress<1);
 for(let f=0;f<300;f++)assert.ok(Math.abs(x.at(f).weights.reduce((a,b)=>a+b,0)-1)<1e-10);
});
test('three different story beats work with same schema without copying a film',()=>{
 const x=compileShotChoreography({fps:30,frames:360,shots:[
 {id:'question',rig:'alpha',start:0,end:142,titleHold:[20,80]},
 {id:'challenge',rig:'beta',start:122,end:270,titleHold:[145,195]},
 {id:'outcome',rig:'gamma',start:248,end:360,titleHold:[290,350]}
 ]});
 assert.equal(x.transitions.length,2);
 assert.deepEqual(x.at(0).rigs,['alpha']);assert.deepEqual(x.at(130).rigs,['alpha','beta']);
 assert.deepEqual(x.at(250).rigs,['beta','gamma']);assert.deepEqual(x.at(359).rigs,['gamma']);
 for(let f=0;f<360;f++)assert.ok(x.at(f).active.length>=1&&x.at(f).active.length<=2);
});
test('invalid timing, copy-id, missing hold and triple blend are rejected',()=>{
 assert.throws(()=>compileShotChoreography({...first,shots:first.shots.map(s=>({...s,id:'same'}))}),/Unique/);
 assert.throws(()=>compileShotChoreography({...first,shots:[{...first.shots[0],end:126},first.shots[1]]}),/overlap/);
 assert.throws(()=>compileShotChoreography({...first,shots:[{...first.shots[0],titleHold:[120,123]},first.shots[1]]}),/hold/);
 assert.throws(()=>compileShotChoreography({fps:30,frames:300,shots:[
 {id:'a',rig:'a',start:0,end:160},{id:'b',rig:'b',start:110,end:220},{id:'c',rig:'c',start:140,end:300}
 ]}),/overlap|Three-way/);
});
test('random-seek order leaves deterministic exact frame mixing',()=>{
 const x=compileShotChoreography(first),a=x.at(140);
 [290,0,143,77,152,127].forEach(n=>x.at(n));
 assert.deepEqual(x.at(140),a);
});
