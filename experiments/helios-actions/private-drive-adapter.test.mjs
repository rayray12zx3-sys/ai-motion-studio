import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateDriveTransport} from './private-drive-adapter.mjs';

const uuid='e03912dc-53e3-4b28-8e41-f8de0e0fc32f';
const staging='1ABCDEFGHIJKLMNOPQRSTUV12345',out='1ZYXWVUTSRQPONMLKJIHGFEDC12345';
const token='this-is-a-test-ephemeral-not-a-real-token';
const fileId='1QwertyuiopASDFghjklZXCVBn12345';
const job={schema:1,job_id:uuid,effect_id:'K09',text:'合成測試文字',
  resolution:'1280x720',fps:24,duration_seconds:2.5};
const response=(data,location=null)=>({
  ok:true,json:async()=>data,
  text:async()=>typeof data==='string'?data:JSON.stringify(data),
  headers:{get:k=>k==='location'?location:null}
});
const hash=(name,data)=>createHash(name).update(data).digest('hex');
const error=/details withheld/;
const transport=fetchImpl=>privateDriveTransport({
  token,stagingFolderId:staging,outputFolderId:out,fetchImpl
});

test('trusted transport fetches only UUID-named JSON from scoped folder',async()=>{
  const requests=[];
  const mock=async(url,opts)=>{
    requests.push({url,opts});
    if(url.includes('alt=media'))return response(job);
    return response({files:[{id:fileId,name:uuid+'.json',
      mimeType:'application/json',parents:[staging]}]});
  };
  const task=await transport(mock).getJob({job_id:uuid});
  assert.equal(task.text,job.text);
  assert.equal(requests.length,2);
  assert.ok(requests[0].url.includes(encodeURIComponent(staging)));
  assert.equal(requests.some(x=>x.url.includes(encodeURIComponent(job.text))),false);
  assert.equal(requests.every(x=>x.opts.redirect==='error'),true);
});

test('unscoped staging, duplicate match and extra dispatch fields fail closed',async()=>{
  for(const files of [[],[
    {id:fileId,name:uuid+'.json',mimeType:'application/json',parents:['wrongFolder']}
  ],[
    {id:fileId,name:uuid+'.json',mimeType:'application/json',parents:[staging]},
    {id:fileId,name:uuid+'.json',mimeType:'application/json',parents:[staging]}
  ]]){
    await assert.rejects(transport(async()=>response({files})).getJob({job_id:uuid}),error);
  }
  await assert.rejects(transport(async()=>response({files:[]})).getJob({
    job_id:uuid,text:'do not disclose'
  }),/Invalid job contract/);
});

function uploadMock({data,filename='K09-alpha.mov',mime='video/quicktime',
  existing=false,wrongVerification=false,location='https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=synthetic'}={}){
  const calls=[],md5=hash('md5',data),sha256=hash('sha256',data);
  const metadata={
    id:fileId,name:filename,mimeType:mime,size:String(data.byteLength),
    md5Checksum:wrongVerification?'wrong':md5,
    appProperties:{job_id:uuid,sha256},parents:[out]
  };
  let created=null;
  const mock=async(url,opts)=>{
    calls.push({url,opts});
    if(opts.method==='POST'){
      created=JSON.parse(opts.body);
      return response(null,location);
    }
    if(opts.method==='PUT')return response({id:fileId});
    if(url.startsWith('https://www.googleapis.com/drive/v3/files/'+fileId+'?'))
      return response(metadata);
    if(url.startsWith('https://www.googleapis.com/drive/v3/files?'))
      return response({files:existing?[metadata]:[]});
    throw Error('unexpected mock request');
  };
  return {driver:transport(mock),calls,getCreated:()=>created,metadata,sha256};
}

test('all four deliverables verify final Drive bytes, folder and private job id',async()=>{
  const kinds=[
    ['K09-alpha.mov','video/quicktime'],
    ['K09-preview.mp4','video/mp4'],
    ['K09-check.png','image/png'],
    ['acceptance.json','application/json']
  ];
  for(const [filename,mime] of kinds){
    const data=new Uint8Array(1024).fill(42);
    const {driver,calls,getCreated,sha256}=uploadMock({data,filename,mime});
    const result=await driver.putPrivateOutput(job,filename,data,mime);
    assert.deepEqual(result,{id:fileId,sha256,already_existed:false});
    assert.equal(calls.length,4);
    assert.deepEqual(calls.map(x=>x.opts.method??'GET'),['GET','POST','PUT','GET']);
    assert.equal(calls.every(x=>x.opts.redirect==='error'),true);
    assert.equal(getCreated().parents[0],out);
    assert.equal(getCreated().appProperties.job_id,uuid);
    assert.equal(getCreated().appProperties.sha256,sha256);
    assert.equal(calls[2].opts.body,data);
    assert.equal(calls.some(x=>x.url.includes(job.text)),false);
  }
});

test('identical repeated delivery is idempotent without another upload',async()=>{
  const data=new Uint8Array(200).fill(25);
  const {driver,calls,sha256}=uploadMock({data,existing:true});
  const done=await driver.putPrivateOutput(job,'K09-alpha.mov',data);
  assert.deepEqual(done,{id:fileId,sha256,already_existed:true});
  assert.equal(calls.length,1);
});

test('conflicting duplicate, incorrect checksum and untrusted filename fail closed',async()=>{
  const data=new Uint8Array(200).fill(25);
  const a=uploadMock({data,existing:true,wrongVerification:true});
  await assert.rejects(a.driver.putPrivateOutput(job,'K09-alpha.mov',data),error);
  assert.equal(a.calls.length,1);
  const b=uploadMock({data,wrongVerification:true});
  await assert.rejects(b.driver.putPrivateOutput(job,'K09-alpha.mov',data),error);
  assert.equal(b.calls.length,4);
  const c=uploadMock({data});
  for(const filename of ['../secret.mov','K01-alpha.mov','K09-alpha.mov/../../x',
    'secrets.json','K09-preview.exe']){
    await assert.rejects(c.driver.putPrivateOutput(job,filename,data),error);
  }
  assert.equal(c.calls.length,0);
});

test('reject attacker resumable location and never follow redirects',async()=>{
  const data=new Uint8Array(200).fill(42);
  const x=uploadMock({data,location:'https://attacker.example/receive'});
  await assert.rejects(x.driver.putPrivateOutput(job,'K09-alpha.mov',data),error);
  assert.equal(x.calls.length,2);
  assert.equal(x.calls.every(x=>x.opts.redirect==='error'),true);
  const y=uploadMock({data});
  await assert.rejects(y.driver.putPrivateOutput(job,'K09-preview.mp4',data,'video/quicktime'),error);
});
