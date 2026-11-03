import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicDispatch,parsePrivateJob,publicSafeJobStatus,APPROVED_EFFECTS} from './private-job-contract.mjs';
const id='e03912dc-53e3-4b28-8e41-f8de0e0fc32f', publicData={job_id:id};
const privateData={schema:1,job_id:id,effect_id:'K09',text:'真的嗎？你確定？',resolution:'1920x1080',fps:30,duration_seconds:2.5};
test('public workflow receives only randomized UUIDv4',()=>{
 assert.deepEqual(parsePublicDispatch(publicData),publicData);
 for(const p of [
  {job_id:id,text:'Private ad script'},
  {job_id:'https://drive.google.com/file/d/private'},
  {job_id:'../../secret'},
  {job_id:'a'.repeat(36)},
  {job_id:id,access_token:'sensitive'},
  {job_id:id,drive_file_id:'privateID'}
 ])assert.throws(()=>parsePublicDispatch(p),/Invalid job contract/);
});
test('trusted post-auth job envelope requires exact allowed fields',()=>{
 assert.deepEqual(parsePrivateJob(privateData,publicData),privateData);
 for(const p of [
  {...privateData,job_id:'wrong'}, {...privateData,effect_id:'INJECT'},
  {...privateData,text:'x'.repeat(73)}, {...privateData,text:'a\nb'},
  {...privateData,download_url:'https://example.com/leak'},
  {...privateData,source_file:'hidden.mov'},
  {...privateData,fps:60}, {...privateData,duration_seconds:30},
  {...privateData,resolution:'4096x4096'}
 ])assert.throws(()=>parsePrivateJob(p,publicData),/Invalid job contract/);
});
test('accepted concepts must be distinct and fixed',()=>{
 assert.equal(APPROVED_EFFECTS.length,10);
 assert.equal(new Set(APPROVED_EFFECTS).size,10);
});
test('public status never includes private job text or Drive URLs',()=>{
 const job=parsePrivateJob(privateData,publicData);
 const sha='a'.repeat(64);
 const output=publicSafeJobStatus(job,'TECH_QA_PASS_ART_PENDING',[sha]);
 assert.deepEqual(Object.keys(output).sort(),['job_id','phase','sha256']);
 assert.equal(JSON.stringify(output).includes('真的嗎'),false);
 assert.equal(JSON.stringify(output).includes('drive.google.com'),false);
 assert.throws(()=>publicSafeJobStatus(job,'ART_APPROVED',[privateData.text]));
});
