import test from 'node:test';
import assert from 'node:assert/strict';
import {drawFrame, demo, profiles, validateSpec} from '../src/free/scene.mjs';

// Freeze the externally visible legacy contract before adding any creative scenes.
// These fixtures deliberately use only synthetic text.
test('legacy profiles retain their public dimensions, fps and durations', () => {
  assert.deepEqual(profiles.landscape, {width: 1920, height: 1080, fps: 30, frames: 180});
  assert.deepEqual(profiles.vertical, {width: 1080, height: 1920, fps: 30, frames: 180});
  assert.deepEqual(profiles.smoke, {width: 360, height: 640, fps: 30, frames: 30});
  assert.deepEqual(Object.keys(profiles).sort(), ['landscape', 'smoke', 'vertical']);
});

test('legacy title/subtitle briefs still validate and reject extra fields', () => {
  const original = {title: 'Motion Studio', subtitle: '確定性動畫'};
  assert.doesNotThrow(() => validateSpec(original));
  assert.doesNotThrow(() => validateSpec(demo));
  assert.throws(() => validateSpec({...original, scene_id: 'unknown'}));
  assert.throws(() => validateSpec({...original, url: 'https://example.invalid/a'}));
  assert.throws(() => validateSpec({...original, title: ''}));
  assert.throws(() => validateSpec({...original, title: 'a'.repeat(81)}));
});

test('legacy sampled pixels are order-independent in both production profiles', () => {
  for (const profile of [profiles.landscape, profiles.vertical]) {
    const frames = [0, 29, 80, profile.frames - 1];
    const original = frames.map(frame => drawFrame(profile, frame, demo).toBuffer('image/png'));
    for (const frame of [...frames].reverse()) drawFrame(profile, frame, demo);
    frames.forEach((frame, index) => {
      const rerendered = drawFrame(profile, frame, demo);
      assert.equal(rerendered.width, profile.width);
      assert.equal(rerendered.height, profile.height);
      assert.deepEqual(rerendered.toBuffer('image/png'), original[index]);
    });
    assert.notDeepEqual(original[0], original[1], 'animation must visibly change over time');
  }
});
