import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validatePackageMetadata,inspectKonvaArchive} from './audit.mjs';

function localFixture(){
 const bytes=Buffer.from('Original test bytes only: not Konva runtime');
 const dist={shasum:createHash('sha1').update(bytes).digest('hex'),
  integrity:'sha512-'+createHash('sha512').update(bytes).digest('base64')};
 const metadata={name:'konva',version:'10.7.1',license:'MIT',dist};
 const packageJson={name:'konva',version:'10.7.1',license:'MIT',
  peerDependencies:{canvas:'^3.0.0'},peerDependenciesMeta:{canvas:{optional:true}}};
 const entries=['package/package.json','package/LICENSE','package/lib/index.js'];
 return {bytes,metadata,packageJson,entries};
}
test('S2 synthetic audit metadata checks exact archive bytes and optional peer boundary',()=>{
 const f=localFixture();
 const result=validatePackageMetadata(f.metadata,f.packageJson,f.bytes,f.entries);

 assert.equal(result.version,'10.7.1');
 assert.equal(result.license,'MIT');
 assert.equal(result.runtime_dependency_count,0);
 assert.equal(result.license_files.length,1);
});
test('S2 synthetic tamper, missing notices, mandatory runtime peers fail closed',()=>{
 const f=localFixture();
 assert.throws(()=>validatePackageMetadata(f.metadata,f.packageJson,Buffer.from('tampered'),f.entries),/archive/);
 assert.throws(()=>validatePackageMetadata(f.metadata,f.packageJson,f.bytes,['package/package.json']),/LICENSE/);
 assert.throws(()=>validatePackageMetadata(f.metadata,{...f.packageJson,dependencies:{'unknown':'*'}},f.bytes,f.entries),/runtime/);
 assert.throws(()=>validatePackageMetadata(f.metadata,{...f.packageJson,peerDependencies:{canvas:'^3'},peerDependenciesMeta:{}},f.bytes,f.entries),/mandatory peer/);
 assert.throws(()=>validatePackageMetadata({...f.metadata,license:'UNLICENSED'},f.packageJson,f.bytes,f.entries),/license/);
});
test('S2 published npm artifact must match registry sha1+sha512 and include MIT notice',async()=>{
 const result=await inspectKonvaArchive();
 console.log('KONVA_REAL_NPM_ARCHIVE_PIN '+JSON.stringify({sha1:result.archive_sha1,integrity:result.archive_integrity,license_files:result.license_files,optional_peers:result.optional_peers}));
 assert.equal(result.archive_sha1,'0671f25fde54ea897194c23b994e12c3f4fb9c27');
 assert.equal(result.archive_integrity,'sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==');
 assert.equal(result.name,'konva');
 assert.equal(result.version,'10.7.1');
 assert.equal(result.license,'MIT');
 assert.ok(result.archive_integrity.startsWith('sha512-'));
 assert.ok(result.tarball_file_count>=10);
 assert.ok(result.license_files.length>0);
 assert.equal(result.runtime_dependency_count,0);
});
