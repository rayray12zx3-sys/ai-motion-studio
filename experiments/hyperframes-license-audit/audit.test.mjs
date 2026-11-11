import test from 'node:test';
import assert from 'node:assert/strict';
import { runAudit } from './audit.mjs';

test('HyperFrames 0.8.143 License Audit execution', async () => {
  const result = await runAudit();

  assert.equal(result.package, 'hyperframes');
  assert.equal(result.version, '0.8.143');
  assert.ok(result.integrity.startsWith('sha512-'));
  assert.equal(result.shasum, '8761025aa327993c605a307ec2d9f01fe6bde047');
  assert.ok(result.transitiveTotalCount > 0);

  // Confirm direct runtime dependencies are identified
  const directDeps = result.inventory.filter((i) => i.isDirect);
  assert.ok(directDeps.length >= 10);

  // Confirm sharp / libvips LGPL licenses are recorded properly
  const lgplDeps = result.inventory.filter((i) => i.license.includes('LGPL'));
  assert.ok(lgplDeps.length > 0);
});
