// Source-level creative checks. CI workflow separately proves actual video/alpha/png frame decoding.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeDirectorPlan,compile} from './adapter.mjs';
import {AD_DEVICES} from './ad-film.mjs';
import {pngHeader} from './ad-ready-png.mjs';
const from=name=>JSON.parse(readFileSync(new URL('./'+name+'.plan.json',import.meta.url),'utf8'));
test('two ad briefs have genuinely different custom shapes and independent aspect ratios',()=>{
 const focus=compile(from('ad-focus-landscape'));
 const habit=compile(from('ad-habit-vertical'));
 assert.equal(focus.plan.direction.adDevice,'focus-clock');
 assert.equal(habit.plan.direction.adDevice,'habit-path');
 assert.equal(focus.plan.render.width,1280);assert.equal(habit.plan.render.width,720);
 assert.match(focus.html,/id="ad-clock"/);
 assert.match(habit.html,/id="ad-path"/);
 assert.match(focus.html,/stroke-dashoffset/);
 assert.match(habit.html,/ad-route/);
 assert.match(focus.html,/注意力，正在流失/);
 assert.match(habit.html,/小習慣，慢慢長大/);
 assert.notEqual(focus.html,habit.html);
 assert.match(focus.html,/__adFilmFrame/);
 assert.deepEqual(AD_DEVICES,['focus-clock','habit-path']);
});
test('a revised real brief changes frame artwork and copy, without changing other work',()=>{
 const a=compile(from('ad-focus-landscape')),b=compile(from('ad-focus-revision'));
 assert.notEqual(a.html,b.html);
 assert.match(a.html,/#E8B66C/);
 assert.match(b.html,/#DDB6F2/);
 assert.match(b.html,/把今天留給自己/);
 assert.equal(b.plan.render.frames,a.plan.render.frames);
});
test('outside media, font tags, HTML and unsupported art directions are rejected before render',()=>{
 const p=from('ad-habit-vertical');
 p.direction.adDevice='untrusted-engine';
 assert.throws(()=>normalizeDirectorPlan(p),/approved device/);
 p.direction.adDevice='habit-path';p.direction.adAccent='url(https://attacker.example)';
 assert.throws(()=>normalizeDirectorPlan(p),/accent/);
 p.direction.adAccent='#8ED7AF';p.beats[1].onScreenText='<img src=x>';
 assert.throws(()=>normalizeDirectorPlan(p),/forbidden/);
 const q=from('ad-focus-landscape');q.direction.visualMotif='storyboard-film';
 assert.throws(()=>normalizeDirectorPlan(q),/ad-specific art options forbidden/);
});
test('lossless PNG output enforces RGBA bytes and rejects RGB or malformed headers',()=>{
 const b=Buffer.alloc(26);Buffer.from([137,80,78,71,13,10,26,10]).copy(b,0);
 b.write('IHDR',12,'ascii');b.writeUInt32BE(1280,16);b.writeUInt32BE(720,20);
 b[24]=8;b[25]=6;
 assert.deepEqual(pngHeader(b),{width:1280,height:720,depth:8,colorType:6});
 b[25]=2;assert.equal(pngHeader(b).colorType,2);
 assert.throws(()=>pngHeader(Buffer.from('not png')),/PNG/);
});
