import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyPrivateLocalAsset as verify} from '../src/creative/private-source-resolver.mjs';

// All fixtures are synthetic and created outside the public repository.
// No company paths, contract documents, artwork or brand marks are used.
const bytes=Buffer.from('synthetic-m10-private-asset-only\n');
const digest=createHash('sha256').update(bytes).digest('hex');
const rights=(overrides={})=>({
  version:1,scope:'private',assets:[{
    id:'synthetic-source',kind:'video',sha256:digest,rights_basis:'company-owned',
    license_evidence_id:'synthetic-rights',commercial_advertising:true,
    modification_allowed:true,credit_required:false,expires_on:null,
    ...overrides
  }]
});
const selection=(dir,relativePath='asset.bin',catalog=rights())=>({
  catalog,assetId:'synthetic-source',on:'2026-10-09',
  approvedRoot:dir,relativePath
});
test('reads approved local bytes, checks SHA and returns no private path or content',()=>{
  const area=mkdtempSync(join(tmpdir(),'m10-private-fixture-'));
  try{
    const root=join(area,'approved');
    mkdirSync(root);writeFileSync(join(root,'asset.bin'),bytes);
    const result=verify(selection(root));
    assert.deepEqual(result,{
      status:'PRIVATE_SOURCE_HASH_VERIFIED',id:'synthetic-source',
      sha256:digest,bytes:bytes.length,requires_human_source_review:true
    });
    assert.equal(JSON.stringify(result).includes(root),false);
    assert.equal(Object.isFrozen(result),true);
  }finally{rmSync(area,{recursive:true,force:true});}
});
test('rejects traversal, URL, symlink, incorrect hash and wrong rights, without revealing local paths',()=>{
  const area=mkdtempSync(join(tmpdir(),'m10-private-negative-'));
  try{
    const root=join(area,'approved');mkdirSync(root);
    writeFileSync(join(root,'asset.bin'),bytes);
    writeFileSync(join(area,'outside.bin'),bytes);
    symlinkSync(join(area,'outside.bin'),join(root,'external.bin'));
    mkdirSync(join(root,'directory'));
    const scenarios=[
      selection(root,'../outside.bin'),
      selection(root,'external.bin'),
      selection(root,'/tmp/anything'),
      selection(root,'https://example.invalid/video.mp4'),
      selection(root,'..\\outside.bin'),
      selection(root,'asset.bin',rights({sha256:'f'.repeat(64)})),
      selection(root,'asset.bin',rights({credit_required:true})),
      selection(root,'asset.bin',rights({commercial_advertising:false})),
      selection(root,'asset.bin',rights({modification_allowed:false})),
      selection(root,'asset.bin',rights({expires_on:'2026-10-08'})),
      selection(root,'asset.bin',{...rights(),scope:'public'}),
      selection(root,'missing.bin'),
      selection(root,'directory')
    ];
    for(const args of scenarios){
      assert.throws(()=>verify(args),error=>{
        assert.equal(error.message.includes(root),false);
        assert.equal(error.message.includes(area),false);
        return true;
      });
    }
  }finally{rmSync(area,{recursive:true,force:true});}
});
