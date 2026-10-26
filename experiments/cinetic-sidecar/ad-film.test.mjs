// Source-level creative checks. CI workflow separately proves actual video/alpha/png frame decoding.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeDirectorPlan,compile} from './adapter.mjs';
import {AD_DEVICES,addAdFilm} from './ad-film.mjs';
import {pngHeader} from './ad-ready-png.mjs';
const from=name=>JSON.parse(readFileSync(new URL('./'+name+'.plan.json',import.meta.url),'utf8'));
test('two ad briefs have genuinely different custom shapes and independent aspect ratios',()=>{
 const focus=compile(from('ad-focus-landscape'));
 const habit=compile(from('ad-habit-vertical'));
 const focusHtml=addAdFilm(focus.html,focus.plan);
 const habitHtml=addAdFilm(habit.html,habit.plan);
 assert.equal(focus.plan.direction.adDevice,'focus-clock');
 assert.equal(habit.plan.direction.adDevice,'habit-path');
 assert.equal(focus.plan.render.width,1280);assert.equal(habit.plan.render.width,720);
 assert.match(focusHtml,/id="ad-clock"/);
 assert.match(habitHtml,/id="ad-path"/);
 assert.match(focusHtml,/stroke-dashoffset/);
 assert.match(habitHtml,/ad-route/);
 assert.match(focus.html,/注意力，正在流失/);
 assert.match(habit.html,/小習慣，慢慢長大/);
 assert.notEqual(focusHtml,habitHtml);
 // Text does not cross the illustrative focal region in the two reference
 // creative formats: horizontal clock begins at x=609, copy right edge <577;
 // vertical habit path ends at y≈844, captions start at 76% of 1280=973.
 assert.match(focusHtml,/#composition \.clip\{[^}]*width:38%/);
 assert.match(habitHtml,/#composition \.connect\{top:76%/);
 assert.match(habitHtml,/#composition \.resolve\{top:76%/);
 assert.match(focusHtml,/__adFilmFrame/);
 assert.match(focusHtml,/<span class="ad-line">注意力，<\/span><span class="ad-line">正在流失<\/span>/);
 const revised=compile(from('ad-focus-revision'));
 assert.match(addAdFilm(revised.html,revised.plan),/<span class="ad-line">把今天<\/span><span class="ad-line">留給自己<\/span>/);
 assert.deepEqual(AD_DEVICES,['focus-clock','habit-path']);
});
test('a revised real brief changes frame artwork and copy, without changing other work',()=>{
 const a=compile(from('ad-focus-landscape')),b=compile(from('ad-focus-revision'));
 const artA=addAdFilm(a.html,a.plan),artB=addAdFilm(b.html,b.plan);
 assert.notEqual(artA,artB);
 assert.match(artA,/#E8B66C/);
 assert.match(artB,/#DDB6F2/);
 assert.match(artB,/把今天留給自己/);
 assert.equal(b.plan.render.frames,a.plan.render.frames);
});
test('outside media, font tags, HTML and unsupported art directions are rejected before render',()=>{
 const p=from('ad-habit-vertical');
 p.direction.adDevice='untrusted-engine';
 assert.throws(()=>normalizeDirectorPlan(p),/approved device/);
 p.direction.adDevice='habit-path';p.direction.adAccent='url(https://attacker.example)';
 assert.throws(()=>normalizeDirectorPlan(p),/accent/);
 p.direction.adAccent='#8ED7AF';p.beats[1].onScreenText='<x>';
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
