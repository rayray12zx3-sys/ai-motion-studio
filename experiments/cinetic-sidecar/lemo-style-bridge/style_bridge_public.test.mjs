import test from 'node:test';import assert from 'node:assert/strict';
import {makeContract,frameState,frameSvg,PROVENANCE} from './style_bridge_public.mjs';
const c=makeContract({contentClass:'public-synthetic',title:'猜字遊戲',rounds:[
 {word:'EMBER',options:['熱','冷','快','慢']},{word:'NOVA',options:['星','海','天','風']},{word:'QUEST',options:['尋找','跑步','收集','閱讀']}
]});
test('source pin and no hidden consumer rights approval',()=>{
 assert.equal(PROVENANCE.upstreamCommit.length,40);
 assert.equal(PROVENANCE.realHyperframesApplied,false);
 assert.equal(PROVENANCE.artApproved,false)
});
test('private content is rejected',()=>assert.throws(()=>makeContract({...c,contentClass:'owner-authored-local'}),/no company/));
test('all 95 frames independently render valid SVG text',()=>{
 for(let f=0;f<95;f++){const svg=frameSvg(c,f);assert.match(svg,/^<svg /);assert.ok(svg.endsWith('</svg>'));}
});
test('card exits monotone as whole object, next behind',()=>{
 for(const [a,b] of [[48,59],[70,81]]){let old=0;for(let f=a;f<=b;f++){const s=frameState(c,f);assert.ok(s.transition);assert.ok(s.transition.shift<=old);old=s.transition.shift;assert.equal(s.active,s.transition.next);}}
});
test('frame 94 Q3 never claims a win',()=>{const x=frameState(c,94);assert.equal(x.active,2);assert.equal(x.correct,false);assert.equal(x.misleadingQ3Success,false)});
test('sprite fixed-size and bounce on 16-frame cycle',()=>{for(let f=36;f<95;f++)assert.deepEqual(frameState(c,f).mascot.size,[62,58]);for(let f of [35,51,67,83])assert.equal(frameState(c,f).mascot.y,289)});
test('HTML/XML unsafe copy gets escaped or rejected',()=>assert.throws(()=>makeContract({contentClass:'public-synthetic',rounds:[{word:'<img>',options:['a','b','c','d']}] }),/3 fictional rounds/));