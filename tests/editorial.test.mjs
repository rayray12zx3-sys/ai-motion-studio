import test from 'node:test';
import assert from 'node:assert/strict';
import {drawFrame, profiles} from '../src/free/scene.mjs';
import {drawEditorialFrame, editorialExample, getEditorialLayout, validateEditorialSpec} from '../src/creative/editorial.mjs';
import {linearProgress, preciseEase, snapProgress} from '../src/creative/motion.mjs';

const brisk = {scene_id: 'editorial-motion', style_id: 'editorial-motion',
  title: '輕快出發', subtitle: '清晰每刻', layout: 'split', accent: 'cobalt', tempo: 'brisk'};

test('fixed easing is clamped and follows exact deterministic boundary rules', () => {
  assert.equal(linearProgress(0, 10, 20), 0);
  assert.equal(linearProgress(15, 10, 20), 0.5);
  assert.equal(linearProgress(25, 10, 20), 1);
  assert.equal(preciseEase(-1), 0);
  assert.equal(preciseEase(1), 1);
  assert.equal(snapProgress(10, 10, 20), 0);
  assert.equal(snapProgress(20, 10, 20), 1);
  assert.throws(() => linearProgress(0, 5, 5));
});

test('pilot rejects unsafe or unimplemented scene capabilities', () => {
  assert.doesNotThrow(() => validateEditorialSpec(editorialExample));
  assert.doesNotThrow(() => validateEditorialSpec(brisk));
  for (const patch of [
    {style_id: 'unknown'}, {scene_id: 'other'}, {layout: 'freeform'},
    {tempo: 'spring'}, {accent: 'random'}, {url: 'https://example.invalid'},
    {title: '😀'}, {title: '字'.repeat(80)}, {subtitle: ''},
  ]) assert.throws(() => validateEditorialSpec({...editorialExample, ...patch}));
  assert.throws(() => drawEditorialFrame(profiles.landscape, -1, editorialExample));
  assert.throws(() => drawEditorialFrame(profiles.landscape, 180, editorialExample));
});

test('portrait split modules reflow below text instead of shrinking landscape', () => {
  const a = getEditorialLayout(profiles.landscape, brisk);
  const b = getEditorialLayout(profiles.vertical, brisk);
  assert.ok(a.panel.x > a.textX + a.textMaxWidth);
  assert.ok(b.panel.y > b.subtitleY);
  assert.ok(b.panel.w > a.panel.w * 0.35);
});

test('editorial sampled frames remain order-independent on landscape and portrait', () => {
  for (const p of [profiles.landscape, profiles.vertical]) {
    const selected = [0, 40, 100, 179];
    const first = selected.map(f => drawEditorialFrame(p, f, editorialExample).toBuffer('image/png'));
    for (const frame of [...selected].reverse()) drawEditorialFrame(p, frame, editorialExample);
    selected.forEach((f, index) => {
      const canvas = drawEditorialFrame(p, f, editorialExample);
      assert.equal(canvas.width, p.width);
      assert.equal(canvas.height, p.height);
      assert.deepEqual(canvas.toBuffer('image/png'), first[index]);
    });
    assert.notDeepEqual(first[0], first[2]);
    assert.notDeepEqual(drawEditorialFrame(p, 145, editorialExample).toBuffer('image/png'),
      drawEditorialFrame(p, 145, brisk).toBuffer('image/png'));
    assert.doesNotThrow(() => drawFrame(p, 40));
  }
});
