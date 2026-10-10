import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEditableSpec, evaluateEditableFrame, serializeEditableSpec, parseEditableSpec}
  from '../experiments/editor-spec/editable-scene.mjs';

const key = (frame, x, ease = 'linear') => ({frame, ease, x, y: 0.5, scale: 1, rotation: 0, opacity: 1});
const scene = () => ({kind: 'editable-scene-spec', version: 1, id: 'synthetic-card',
  profile: 'smoke', fps: 30, durationFrames: 30, layers: [
    {id: 'card', type: 'rect', z: 1, color: '#123abc', width: 0.4, height: 0.2,
      clip: {start: 0, end: 30}, keyframes: [key(0, 0), key(29, 1, 'ease-out-cubic')],
      source: {kind: 'synthetic'}},
    {id: 'title', type: 'text', z: 2, color: '#ffffff', width: 0.5, height: 0.1,
      clip: {start: 10, end: 30}, keyframes: [key(10, 0.2), key(29, 0.8, 'hold')],
      source: {kind: 'synthetic'}, text: 'Synthetic Title', fontId: 'noto-sans-tc-400'}
  ]});
const change = (mutate) => {const s = scene(); mutate(s); return s;};

test('S1 frame 0, 15 and 29 deterministic; overlap, ordering, easing and hold', () => {
  const s = scene(); assert.equal(validateEditableSpec(s), true);
  assert.deepEqual(evaluateEditableFrame(s, 0).layers.map(x => x.id), ['card']);
  const mid = evaluateEditableFrame(s, 15);
  assert.deepEqual(mid.layers.map(x => x.id), ['card', 'title']);
  assert.ok(Math.abs(mid.layers[0].x - (1 - (1 - 15 / 29) ** 3)) < 1e-12);
  assert.equal(mid.layers[1].x, 0.2);
  assert.equal(evaluateEditableFrame(s, 29).layers[0].x, 1);
  assert.equal(evaluateEditableFrame(s, 29).layers[1].x, 0.8);
  const original = evaluateEditableFrame(s, 15);
  evaluateEditableFrame(s, 29); evaluateEditableFrame(s, 0);
  assert.deepEqual(evaluateEditableFrame(s, 15), original);
  assert.deepEqual(s, scene(), 'evaluation never mutates source');
});

test('save/reopen roundtrip canonicalizes insertion order and preserves edits', () => {
  const s = scene(), reversed = change(x => x.layers.reverse());
  assert.equal(serializeEditableSpec(s), serializeEditableSpec(reversed));
  const saved = serializeEditableSpec(s);
  const reopened = parseEditableSpec(saved);
  assert.equal(serializeEditableSpec(reopened), saved);
  assert.deepEqual(evaluateEditableFrame(reopened, 15), evaluateEditableFrame(s, 15));
  reopened.layers[0].keyframes[1].x = 0.4;
  assert.notDeepEqual(evaluateEditableFrame(reopened, 15), evaluateEditableFrame(s, 15));
  assert.equal(evaluateEditableFrame(parseEditableSpec(serializeEditableSpec(reopened)), 15).layers[0].x,
    evaluateEditableFrame(reopened, 15).layers[0].x);
});

test('rejects malformed, unsupported and unbounded documents', () => {
  const invalid = [
    x => {x.version = 2;}, x => {x.fps = 29.97;}, x => {x.profile = 'custom';},
    x => {x.layers[1].id = 'card';}, x => {x.layers[0].id = '__proto__';},
    x => {x.layers[0].z = -1;}, x => {x.layers[0].width = Infinity;},
    x => {x.layers[0].height = NaN;}, x => {x.layers[0].color = 'red';},
    x => {x.layers[0].source = {kind: 'remote', url: 'https://example.invalid'};},
    x => {x.layers[0].clip.end = 31;}, x => {x.layers[0].clip.start = 29;},
    x => {x.layers[0].keyframes[0].frame = 1;},
    x => {x.layers[0].keyframes[1].frame = 0;},
    x => {x.layers[0].keyframes[1].ease = 'eval';},
    x => {x.layers[0].keyframes[1].opacity = 2;},
    x => {x.layers[0].keyframes[1].x = -1;},
    x => {x.layers[1].fontId = 'system';}, x => {x.layers[1].text = '\u0000';},
    x => {x.layers[1].text = '字'.repeat(81);},
    x => {x.layers[0].unexpected = 'remote';},
    x => {x.layers.push(...Array.from({length: 11}, (_, i) => ({...x.layers[0], id: 'extra-' + i})));},
  ];
  for (const mutate of invalid) assert.throws(() => validateEditableSpec(change(mutate)), /EditableSceneSpec/);
  assert.throws(() => evaluateEditableFrame(scene(), -1), /outside document/);
  assert.throws(() => evaluateEditableFrame(scene(), 30), /outside document/);
  assert.throws(() => evaluateEditableFrame(scene(), 0.5), /outside document/);
  assert.throws(() => parseEditableSpec('{bad json'), /malformed JSON/);
  assert.throws(() => parseEditableSpec(' '.repeat(65537)), /length/);
  assert.throws(() => parseEditableSpec('{"__proto__":{}}'), /header/);
});

test('S1 is isolated and does not change the current Canvas scene contract', async () => {
  const {drawFrame, profiles, demo, validateSpec} = await import('../src/free/scene.mjs');
  validateSpec(demo);
  const a = drawFrame(profiles.smoke, 15, demo).toBuffer('image/png');
  const s = scene(); evaluateEditableFrame(s, 15); serializeEditableSpec(s);
  const b = drawFrame(profiles.smoke, 15, demo).toBuffer('image/png');
  assert.deepEqual(a, b);
});
