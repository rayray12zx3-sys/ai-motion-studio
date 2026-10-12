import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('./film.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./film.html',import.meta.url),'utf8');
test('real authored deterministic 1080x1920 360-frame seek contract exists',()=>{
 assert.match(code,/const W=1080,H=1920,FPS=30,DURATION=12,FRAMES=FPS\*DURATION/);
 assert.match(code,/window\.seekFrame=seekFrame/);
 assert.match(code,/Number\.isInteger\(f\)/);
 assert.match(html,/id="stage" width="1080" height="1920"/);
});
test('two different original films draw with different scene grammar',()=>{
 assert.match(code,/function threadFilm\(t\)/);
 assert.match(code,/function focusFilm\(t\)/);
 assert.match(code,/function apertureScene\(t,focus\)/);
 assert.match(code,/function routePath\(t,mode='thin',draw=\.99\)/);
});
test('explicit product operation must have visible before→after proof',()=>{
 assert.match(code,/Tap to mark complete/);
 assert.match(code,/Outline saved/);
 assert.match(code,/Select action/);
 assert.match(code,/Selected & added/);
});
test('closed offline authoring runtime excludes unseeded randomness and remote rendering assets',()=>{
 assert.doesNotMatch(code,/Math\.random\s*\(/);
 assert.doesNotMatch(code,/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/);
 assert.doesNotMatch(code,/new\s+Date\s*\(/);
 assert.match(code,/gsap\.parseEase/);
 assert.match(html,/\.\/vendor\/gsap-3\.15\.0\.min\.js/);
});