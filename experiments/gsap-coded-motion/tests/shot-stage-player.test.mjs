import test from 'node:test';
import assert from 'node:assert/strict';
import {createShotStagePlayer} from '../src/shot-stage-player.mjs';
import {compileShotChoreography} from '../src/shot-choreography.mjs';
const film=compileShotChoreography({fps:30,frames:300,shots:[
 {id:'entry',rig:'mint',start:0,end:116,titleHold:[18,80]},
 {id:'work',rig:'lavender',start:96,end:220,titleHold:[125,175]},
 {id:'exit',rig:'copper',start:199,end:300,titleHold:[233,270]}
]});
const log=[];
const rigs=Object.fromEntries(['mint','lavender','copper'].map(name=>[name,{
 fps:30,frames:300,scene:{name},camera:{name},seekFrame(n){log.push('seek:'+name+':'+n)}
}]));
const renderer={setRenderTarget(t){log.push('target:'+t)},render(s){log.push('paint:'+s.name)}};
const transition={render(a,b,p){assert.ok(p>=0&&p<=1);log.push('shader:'+a.scene.name+':'+b.scene.name+':'+p.toFixed(5))}};
const make=()=>createShotStagePlayer({timeline:film,rigs,renderer,transition});
test('direct paint uses only active rig and supports last frame',()=>{
 const run=make();log.length=0;
 assert.deepEqual(run.seekFrame(0).rigs,['mint']);
 assert.deepEqual(log,['seek:mint:0','target:null','paint:mint']);
 log.length=0;assert.deepEqual(run.seekFrame(299).rigs,['copper']);
 assert.deepEqual(log,['seek:copper:299','target:null','paint:copper']);
});
test('two separate transitions use correct adjacent pair only',()=>{
 const run=make();log.length=0;
 assert.deepEqual(run.seekFrame(105).rigs,['mint','lavender']);
 assert.equal(log.length,3);assert.match(log[2],/^shader:mint:lavender:/);
 log.length=0;assert.deepEqual(run.seekFrame(207).rigs,['lavender','copper']);
 assert.match(log[2],/^shader:lavender:copper:/);
});
test('arbitrary frame seeks do not accumulate state',()=>{
 const run=make(),state=run.seekFrame(207);
 [299,0,50,109,222,199].forEach(n=>run.seekFrame(n));
 assert.deepEqual(run.seekFrame(207),state);
});
test('reject incompatible rigs and repeat-scene transitions',()=>{
 assert.throws(()=>createShotStagePlayer({timeline:film,rigs:{...rigs,mint:{...rigs.mint,frames:50}},renderer,transition}),/Incompatible/);
 assert.throws(()=>createShotStagePlayer({timeline:film,rigs:{mint:rigs.mint,lavender:rigs.lavender},renderer,transition}),/Unrecognized/);
 const repeat=compileShotChoreography({fps:30,frames:300,shots:[
  {id:'a',rig:'mint',start:0,end:150},{id:'b',rig:'mint',start:130,end:300}
 ]});
 assert.throws(()=>createShotStagePlayer({timeline:repeat,rigs,renderer,transition}),/distinct rigs/);
});