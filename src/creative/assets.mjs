import {createHash} from 'node:crypto';
import {lstatSync, readFileSync, realpathSync} from 'node:fs';
import {join, relative, sep} from 'node:path';

// M3-A: local PNG-only asset preflight. This does not render or write files.
const allowedLicenses = new Set(['CC0-1.0', 'CC-BY-4.0', 'MIT', 'OFL-1.1']);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const exactKeys = (value, keys) => value && typeof value === 'object' &&
  !Array.isArray(value) && Object.keys(value).sort().join(',') === keys.slice().sort().join(',');
const validLabel = value => typeof value === 'string' &&
  value.length >= 3 && value.length <= 120 &&
  !/[\p{C}]/u.test(value);

export function validateAssetManifest(manifest) {
  if (!exactKeys(manifest, ['version', 'assets']) || manifest.version !== 1 ||
      !Array.isArray(manifest.assets) || manifest.assets.length < 1 || manifest.assets.length > 16) {
    throw new Error('Asset manifest requires version 1 and 1–16 entries');
  }
  const ids = new Set();
  const paths = new Set();
  for (const item of manifest.assets) {
    if (!exactKeys(item, ['id', 'path', 'type', 'sha256', 'width', 'height', 'license', 'source'])) {
      throw new Error('Asset entry has missing or unexpected fields');
    }
    if (typeof item.id !== 'string' || !/^[a-z][a-z0-9-]{0,47}$/.test(item.id) ||
        ids.has(item.id)) throw new Error('Invalid or duplicate asset id');
    ids.add(item.id);
    // Filenames and directories must be unambiguous relative paths. In particular
    // reject '.'/'..', backslashes, percent encoding, URL schemes and drive letters.
    if (typeof item.path !== 'string' ||
        !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.png$/.test(item.path) ||
        paths.has(item.path)) throw new Error('Invalid or duplicate local asset path');
    paths.add(item.path);
    if (item.type !== 'image/png' ||
        typeof item.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(item.sha256) ||
        !Number.isInteger(item.width) || !Number.isInteger(item.height) ||
        item.width < 1 || item.height < 1 || item.width > 2048 ||
        item.height > 2048 || item.width * item.height > 4194304) {
      throw new Error('Invalid PNG asset metadata');
    }
    if (!allowedLicenses.has(item.license) || !validLabel(item.source)) {
      throw new Error('Asset must declare an accepted licence and source');
    }
  }
}

export function verifyLocalAssets(manifest, trustedRoot) {
  validateAssetManifest(manifest);
  if (typeof trustedRoot !== 'string' || !trustedRoot.trim()) throw new Error('Missing trusted asset root');
  const root = realpathSync(trustedRoot);
  const loaded = new Map();
  for (const item of manifest.assets) {
    const path = join(root, ...item.path.split('/'));
    const actualPath = realpathSync(path);
    const rel = relative(root, actualPath);
    if (rel === '' || rel === '..' || rel.startsWith('..' + sep) || rel.startsWith(sep)) {
      throw new Error('Asset resolves outside trusted root');
    }
    // No symbolic links, including intermediate directory components.
    const segments = item.path.split('/');
    let cursor = root;
    for (const segment of segments) {
      cursor = join(cursor, segment);
      const st = lstatSync(cursor);
      if (st.isSymbolicLink()) throw new Error('Symlinks are not permitted in asset paths');
      if (segment !== segments.at(-1) && !st.isDirectory()) throw new Error('Invalid asset directory');
    }
    const stat = lstatSync(actualPath);
    if (!stat.isFile() || stat.size < 24 || stat.size > 5 * 1024 * 1024) {
      throw new Error('Missing, empty or oversized PNG asset');
    }
    const bytes = readFileSync(actualPath);
    if (!bytes.subarray(0, 8).equals(pngSignature) ||
        bytes.toString('ascii', 12, 16) !== 'IHDR' ||
        bytes.readUInt32BE(16) !== item.width || bytes.readUInt32BE(20) !== item.height) {
      throw new Error('PNG signature or dimensions mismatch');
    }
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== item.sha256) throw new Error('Asset SHA-256 mismatch');
    loaded.set(item.id, {id: item.id, bytes, width: item.width, height: item.height,
      sha256: digest, license: item.license, source: item.source});
  }
  return loaded;
}
