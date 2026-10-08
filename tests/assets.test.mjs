import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createCanvas} from '@napi-rs/canvas';
import {validateAssetManifest, verifyLocalAssets} from '../src/creative/assets.mjs';

function sample() {
  const root = mkdtempSync(join(tmpdir(), 'motion-asset-'));
  mkdirSync(join(root, 'synthetic'));
  const canvas = createCanvas(64, 32);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1460A7';
  ctx.fillRect(0, 0, 64, 32);
  const bytes = canvas.toBuffer('image/png');
  writeFileSync(join(root, 'synthetic', 'sample.png'), bytes);
  const asset = {id: 'graphic-sample', path: 'synthetic/sample.png', type: 'image/png',
    sha256: createHash('sha256').update(bytes).digest('hex'),
    width: 64, height: 32, license: 'CC0-1.0', source: 'Synthetic generated unit-test artwork'};
  return {root, asset, manifest: {version: 1, assets: [asset]}};
}

test('verified local image returns bytes with independent hashes and provenance', () => {
  const {root, manifest, asset} = sample();
  try {
    assert.doesNotThrow(() => validateAssetManifest(manifest));
    const resolved = verifyLocalAssets(manifest, root);
    assert.deepEqual([...resolved.keys()], ['graphic-sample']);
    assert.deepEqual(resolved.get(asset.id).bytes,
      readFileSync(join(root, 'synthetic', 'sample.png')));
    assert.equal(resolved.get(asset.id).license, asset.license);
    assert.equal(resolved.get(asset.id).sha256, asset.sha256);
  } finally { rmSync(root, {recursive: true, force: true}); }
});

test('manifest rejects unknown fields, duplicate IDs, remote/traversal paths and unlicensed assets', () => {
  const {root, asset, manifest} = sample();
  try {
    for (const patch of [
      {path: '../secrets.png'}, {path: '/tmp/a.png'}, {path: 'C:\\\\a.png'},
      {path: 'remote://test.png'}, {path: 'synthetic/./sample.png'},
      {path: 'synthetic/%2e%2e.png'}, {type: 'image/svg+xml'},
      {license: 'UNKNOWN'}, {source: ''}, {sha256: '0'.repeat(64)},
      {width: 9999}, {height: 0}, {id: 'bad id'}, {extra: 'value'},
    ]) {
      const candidate = {version: 1, assets: [{...asset, ...patch}]};
      if (patch.sha256) {
        assert.doesNotThrow(() => validateAssetManifest(candidate));
        assert.throws(() => verifyLocalAssets(candidate, root), /SHA-256/);
      } else assert.throws(() => validateAssetManifest(candidate));
    }
    assert.throws(() => validateAssetManifest({...manifest, assets: [asset, asset]}));
    assert.throws(() => validateAssetManifest({...manifest, version: 2}));
    assert.throws(() => validateAssetManifest({...manifest, url: 'unexpected'}));
  } finally { rmSync(root, {recursive: true, force: true}); }
});

test('changed PNG bytes or incorrect declared dimensions fail preflight', () => {
  const {root, manifest, asset} = sample();
  try {
    assert.throws(() => verifyLocalAssets({version: 1, assets: [{...asset, height: 42}]}, root), /dimensions mismatch/);
    const path = join(root, 'synthetic', 'sample.png');
    const bytes = readFileSync(path);
    bytes[bytes.length - 1] ^= 1;
    writeFileSync(path, bytes);
    assert.throws(() => verifyLocalAssets(manifest, root), /SHA-256/);
  } finally { rmSync(root, {recursive: true, force: true}); }
});

test('symbolic links cannot escape the asset root', {skip: process.platform === 'win32'}, () => {
  const {root, manifest} = sample();
  const external = mkdtempSync(join(tmpdir(), 'motion-external-'));
  try {
    rmSync(join(root, 'synthetic'), {recursive: true});
    mkdirSync(join(external, 'synthetic'));
    symlinkSync(join(external, 'synthetic'), join(root, 'synthetic'), 'dir');
    assert.throws(() => verifyLocalAssets(manifest, root));
  } finally {
    rmSync(root, {recursive: true, force: true});
    rmSync(external, {recursive: true, force: true});
  }
});
