import test from 'node:test';
import assert from 'node:assert/strict';
import {drawFrame, profiles, validateSpec} from '../src/free/scene.mjs';
test('frame rendering is order-independent with locked fonts', () => {
  const a = drawFrame(profiles.smoke, 12).toBuffer('image/png');
  drawFrame(profiles.smoke, 27);
  assert.deepEqual(a, drawFrame(profiles.smoke, 12).toBuffer('image/png'));
});
test('unsupported glyphs, network fields and invalid frames fail before render', () => {
  assert.throws(() => validateSpec({title: 'Text', subtitle: 'Text', url: 'https://invalid.example'}));
  assert.throws(() => validateSpec({title: '😀', subtitle: 'Text'}));
  assert.throws(() => validateSpec({title: '\u3400', subtitle: 'Text'}), /locked font coverage/);
  assert.throws(() => drawFrame(profiles.smoke, -1));
  assert.throws(() => drawFrame(profiles.smoke, 30));
});
test('bounded schema text still requires profile layout review', () => {
  const tooLong = {title: '字'.repeat(80), subtitle: '測試'};
  validateSpec(tooLong);
  for (const p of Object.values(profiles)) assert.throws(() => drawFrame(p, 0, tooLong), /scene layout/);
});
test('landscape and vertical output use exact profile dimensions', () => {
  for (const p of [profiles.landscape, profiles.vertical]) {
    const c = drawFrame(p, 42); assert.equal(c.width, p.width); assert.equal(c.height, p.height);
  }
});
