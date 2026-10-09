import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizeCommercialNoCredit as check,validateLicensedAssetCatalog as validate}
  from '../src/creative/asset-authorization.mjs';
const sha='a'.repeat(64);
const sample=(overrides={})=>({
  id:'training-card',kind:'image',sha256:sha,rights_basis:'purchased-license',
  license_evidence_id:'example-contract',commercial_advertising:true,
  modification_allowed:true,credit_required:false,expires_on:null,...overrides
});
const catalog=(scope,a)=>({version:1,scope,assets:[a]});
test('private company-owned, client-provided and purchased license accepted only as metadata',()=>{
 for(const basis of ['purchased-license','company-owned','client-provided']){
  const a=check(catalog('private',sample({rights_basis:basis})),['training-card'],{on:'2026-10-09'});
  assert.equal(a.scope,'private');
  assert.equal(a.status,'RIGHTS_METADATA_PRECHECK_PASSED');
  assert.equal(a.requires_human_source_review,true);
 }
});
test('CC0 can be public, bought stock cannot be public',()=>{
 assert.doesNotThrow(()=>validate(catalog('public',sample({rights_basis:'cc0'}))));
 assert.throws(()=>validate(catalog('public',sample())));
});
test('no credit, commercial advertising, edits and valid grants are mandatory',()=>{
 for(const update of [
  {credit_required:true},{commercial_advertising:false},{modification_allowed:false},
  {expires_on:'2026-10-08'},{license_evidence_id:''},{sha256:'bad'},{expires_on:'2026-02-30'}
 ]){
  assert.throws(()=>check(catalog('private',sample(update)),['training-card'],{on:'2026-10-09'}));
 }
 assert.throws(()=>check(catalog('private',sample()),['other-id'],{on:'2026-10-09'}));
});
test('public catalog schema refuses local media paths or raw receipts',()=>{
 assert.throws(()=>validate(catalog('private',sample({filename:'secret-client-logo.png'}))));
 const c=catalog('private',sample());c.token='sensitive';assert.throws(()=>validate(c));
});
