// S2 only: pinned npm archive evidence; no runtime dependency, browser or licensing permission.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const name='konva',version='10.7.1';
const expectedSha1='b77f1663f1b108d37f45034c33bb88f6c8364504';
const expectedIntegrity='sha512-7XV+NQRpgrjquoHD0EcRQCsNovT5ZUlOcEiYdYjLjBUFq6gP8HeRKIUSjPBSa7XBfYMa2SY4+RyNOoEAbfB6gA==';
const run=(exe,args,cwd)=>execFileSync(exe,args,{cwd,encoding:'utf8',timeout:120000,maxBuffer:10*1024*1024});
const digest=(bytes,algorithm)=>createHash(algorithm).update(bytes).digest(algorithm==='sha512'?'base64':'hex');
export function validatePackageMetadata(view,packed,archiveBytes,entries){
 if(view.name!==name||view.version!==version||view.license!=='MIT')
  throw Error('Pinned package metadata or MIT license does not match');
 if(!view.dist?.integrity?.startsWith('sha512-')||!view.dist?.shasum)
  throw Error('Registry integrity/shasum absent');
 const sha1=digest(archiveBytes,'sha1');
 const integrity='sha512-'+digest(archiveBytes,'sha512');
 if(sha1!==view.dist.shasum||integrity!==view.dist.integrity)
  throw Error('Actual downloaded archive differs from pinned version registry integrity');
 if(packed.name!==name||packed.version!==version||packed.license!=='MIT')
  throw Error('Actual tarball package.json does not match registry metadata');
 const runtime=packed.dependencies||{};
 if(Object.keys(runtime).length!==0)throw Error('New non-optional runtime dependencies require separate audit');
 const peers=packed.peerDependencies||{},optional=packed.peerDependenciesMeta||{};
 for(const p of Object.keys(peers)){
  if(!['canvas','skia-canvas'].includes(p)||optional[p]?.optional!==true)
   throw Error('Unexpected or mandatory peer: '+p);
 }
 const licenseFiles=entries.filter(x=>/^package\/(?:license|licence)(?:\.[^/]*)?$/i.test(x));
 if(!licenseFiles.length)throw Error('MIT LICENSE text missing from actual published tarball');
 if(!entries.some(x=>x==='package/package.json'))throw Error('No real package manifest in tarball');
 return {name,version,license:'MIT',archive_sha1:sha1,archive_integrity:integrity,
  tarball_file_count:entries.length,license_files:licenseFiles,
  runtime_dependency_count:0,optional_peers:peers,
  scope:'npm-metadata-and-archive-only__NOT_editor_or_transitive_media_approval'};
}
export async function inspectKonvaArchive(){
 const cwd=mkdtempSync(join(tmpdir(),'motion-konva-audit-'));
 try{
  const view=JSON.parse(run('npm',['view',name+'@'+version,'--json'],cwd));
  if(view.dist?.shasum!==expectedSha1||view.dist?.integrity!==expectedIntegrity)
   throw Error('Registry pin mismatch: sha1='+String(view.dist?.shasum)+' vs '+expectedSha1+'; sha512='+String(view.dist?.integrity)+' vs '+expectedIntegrity);
  const tarball=run('npm',['pack',name+'@'+version,'--ignore-scripts','--silent'],cwd).trim().split(/\r?\n/).pop();
  if(!/^konva-10\.7\.1\.tgz$/.test(tarball))throw Error('Unexpected archive filename');
  const bytes=readFileSync(join(cwd,tarball));
  const entries=run('tar',['-tzf',tarball],cwd).trim().split(/\r?\n/);
  const packed=JSON.parse(run('tar',['-xOzf',tarball,'package/package.json'],cwd));
  return validatePackageMetadata(view,packed,bytes,entries);
 }finally{rmSync(cwd,{recursive:true,force:true});}
}
if(process.argv[1]?.endsWith('audit.mjs')){
 inspectKonvaArchive().then(x=>console.log('S2_KONVA_ARCHIVE_EVIDENCE',JSON.stringify(x,null,2)))
  .catch(e=>{console.error('KONVA_AUDIT_BLOCKED',e.message);process.exitCode=1});
}
