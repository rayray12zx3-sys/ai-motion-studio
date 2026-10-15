import test from 'node:test';
import assert from 'node:assert/strict';
import {privateDriveTransport} from './private-drive-adapter.mjs';
const uuid='e03912dc-53e3-4b28-8e41-f8de0e0fc32f';
const staging='1ABCDEFGHIJKLMNOPQRSTUV12345',out='1ZYXWVUTSRQPONMLKJIHGFEDC12345';
const token='this-is-a-test-ephemeral-not-a-real-token';
const job={schema:1,job_id:uuid,effect_id:'K09',text:'私人的文字',resolution:'1280x720',fps:24,duration_seconds:2.5};
const response=(data,headers=new Map())=>({ok:true,json:async()=>data,text:async()=>typeof data==='string'?data:JSON.stringify(data),headers:{get:k=>headers.get(k)}});
test('trusted transport fetches only UUID-named job from scoped folder',async()=>{
 const requests=[];
 const mock=async(url,opts)=>{requests.push({url,method:opts.method??'GET'});
  if(url.includes('alt=media'))return response(job);
  return response({files:[{id:'1QwertyuiopASDFghjklZXCVBn12345',name:uuid+'.json',mimeType:'application/json',parents:[staging]}]});
 };
 const driver=privateDriveTransport({token,stagingFolderId:staging,outputFolderId:out,fetchImpl:mock});
 const task=await driver.getJob({job_id:uuid});
 assert.equal(task.text,job.text);
 assert.equal(requests.length,2);
 assert.ok(requests[0].url.includes(encodeURIComponent(staging)));
 assert.equal(requests.some(x=>x.url.includes(encodeURIComponent(job.text))),false);
});
test('reject unscoped file discovery',async()=>{
 for(const files of [[],[{id:'1QwertyuiopASDFghjklZXCVBn12345',name:uuid+'.json',mimeType:'application/json',parents:['wrongFolder']}]]){
  const driver=privateDriveTransport({token,stagingFolderId:staging,outputFolderId:out,fetchImpl:async()=>response({files})});
  await assert.rejects(driver.getJob({job_id:uuid}),/details withheld/);
 }
});
test('resumable write uses fixed Google API origin and destination',async()=>{
 const requests=[];
 const location='https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=dryrun';
 const mock=async(url,options)=>{requests.push({url,options});
  if(options.method==='POST')return response(null,new Map([['location',location]]));
  if(options.method==='PUT')return response({id:'1QwertyuiopASDFghjklZXCVBn12345'});
  throw Error('Unexpected network call');
 };
 const driver=privateDriveTransport({token,stagingFolderId:staging,outputFolderId:out,fetchImpl:mock});
 const uploaded=await driver.putPrivateOutput(job,'K09-alpha.mov',new Uint8Array(500));
 assert.equal(uploaded.id,'1QwertyuiopASDFghjklZXCVBn12345');
 assert.equal(requests.length,2);
 assert.equal(requests[0].url,'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable');
 assert.equal(JSON.parse(requests[0].options.body).parents[0],out);
 await assert.rejects(driver.putPrivateOutput(job,'../secret.mov',new Uint8Array(500)));
});
test('reject attacker-provided resumable URL',async()=>{
 const driver=privateDriveTransport({token,stagingFolderId:staging,outputFolderId:out,fetchImpl:async()=>response(null,new Map([['location','https://attacker.example/receive']]))});
 await assert.rejects(driver.putPrivateOutput(job,'K09-alpha.mov',new Uint8Array(500)),/details withheld/);
});
