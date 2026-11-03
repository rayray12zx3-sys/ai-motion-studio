import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function runAudit() {
  const targetPkg = 'hyperframes@0.8.143';

  // 1. Fetch npm view manifest and tarball integrity
  const viewJsonRaw = execSync(`npm view ${targetPkg} --json`, { encoding: 'utf8' });
  const viewManifest = JSON.parse(viewJsonRaw);

  const shasum = viewManifest.dist?.shasum || 'UNKNOWN';
  const integrity = viewManifest.dist?.integrity || 'UNKNOWN';
  const tarballUrl = viewManifest.dist?.tarball || '';

  // 2. Transitive lockfile resolution
  const tmpDir = fs.mkdtempSync('/tmp/hf-audit-exp-');
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
    name: 'hf-license-audit-temp',
    type: 'module',
    dependencies: { 'hyperframes': '0.8.143' }
  }));

  execSync('npm install --package-lock-only --ignore-scripts --no-audit', { cwd: tmpDir, stdio: 'pipe' });
  const lock = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package-lock.json'), 'utf8'));

  const directDepsObj = lock.packages['node_modules/hyperframes']?.dependencies || {};
  const directDepNames = Object.keys(directDepsObj);

  const inventory = [];
  for (const [pkgPath, pkgInfo] of Object.entries(lock.packages)) {
    if (!pkgPath) continue; // Root package
    const name = pkgPath.replace(/^node_modules\//, '');
    const version = pkgInfo.version;
    const isDirect = directDepNames.includes(name);

    let license = pkgInfo.license;
    if (!license) {
      try {
        const viewRes = execSync(`npm view ${name}@${version} license --json`, { encoding: 'utf8' }).trim();
        license = viewRes ? JSON.parse(viewRes) : 'UNKNOWN';
      } catch {
        license = 'UNKNOWN';
      }
    }
    if (Array.isArray(license)) {
      license = license.join(' OR ');
    } else if (typeof license === 'object' && license !== null) {
      license = license.type || JSON.stringify(license);
    }
    if (!license) license = 'UNKNOWN';

    inventory.push({
      name,
      version,
      isDirect,
      license: String(license)
    });
  }

  // Deduplicate and sort
  const uniqueMap = new Map();
  for (const item of inventory) {
    uniqueMap.set(`${item.name}@${item.version}`, item);
  }
  const uniqueInventory = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Clean up tmpDir
  fs.rmSync(tmpDir, { recursive: true, force: true });

  return {
    package: 'hyperframes',
    version: '0.8.143',
    shasum,
    integrity,
    tarballUrl,
    directDepsCount: directDepNames.length,
    transitiveTotalCount: uniqueInventory.length,
    inventory
  };
}

if (process.argv[1] && process.argv[1].endsWith('audit.mjs')) {
  runAudit().then((res) => {
    console.log(JSON.stringify(res, null, 2));
  }).catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
