import { execSync, execFileSync } from 'child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
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
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(),'hf-audit-exp-'));
  const tgz = execFileSync('npm',['pack',targetPkg,'--ignore-scripts','--silent'],{cwd:tmpDir,encoding:'utf8',timeout:120000}).trim().split(/\r?\n/).pop();
  const bytes = fs.readFileSync(path.join(tmpDir,tgz));
  const verifiedSha1=createHash('sha1').update(bytes).digest('hex');
  const verifiedSha512='sha512-'+createHash('sha512').update(bytes).digest('base64');
  if(verifiedSha1!==shasum || verifiedSha512!==integrity)throw Error('actual published package archive checksum mismatch');
  const tarballPaths=execFileSync('tar',['-tzf',tgz],{cwd:tmpDir,encoding:'utf8',timeout:120000}).trim().split('\n');
  const noticePaths=tarballPaths.filter(s=>/\/(?:LICENSE(?:\.[^/]*)?|NOTICE(?:\.[^/]*)?)$/i.test(s));
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
    inventory:uniqueInventory,
    actualArchiveVerified:true,
    tarballFileCount:tarballPaths.length,
    noticePaths
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
