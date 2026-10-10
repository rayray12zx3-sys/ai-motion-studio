import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startEditorServer} from '../editor/server.mjs';
import {drawEditableSceneFrame} from '../src/free/editable-scene.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
test('read-only Canvas still is binary pixel-equal to the opt-in locked export painter and never writes scene',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'s1-canvas-preview-test-')),file=join(dir,'scene.json');
 const fixture=parseEditableScene(await readFile(
  new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
 const before=serializeEditableScene(fixture);
 const {server,url}=await startEditorServer({port:0,sceneFile:file});
 try{
  let res=await fetch(url+'/scene.json');
  const etag=res.headers.get('etag');
  assert.match(etag,/^"[0-9a-f]{64}"$/);
  assert.equal(await res.text(),before);
  const request=(frame,mode,match=etag,extra={})=>fetch(
   url+'/canvas-preview.png?frame='+frame+'&mode='+mode,{
   headers:{'X-AI-Motion-Preview':'1','If-Match':match,...extra}
  });
  assert.equal((await fetch(url+'/canvas-preview.png?frame=12&mode=opaque')).status,403);
  assert.equal((await request(12,'opaque','"0000000000000000000000000000000000000000000000000000000000000000"')).status,409);
  for(const path of ['/canvas-preview.png?frame=-1&mode=opaque',
    '/canvas-preview.png?frame=9999&mode=opaque',
    '/canvas-preview.png?frame=12&mode=opaque&evil=1',
    '/canvas-preview.png?frame=12&mode=opaque&frame=1',
    '/canvas-preview.png?frame=12&mode=wrong',
    '/canvas-preview.png?frame=12&mode=transparent%26fake'] ){
   const denied=await fetch(url+path,{headers:{'X-AI-Motion-Preview':'1','If-Match':etag}});
   assert.equal(denied.status,400,path);
  }
  assert.equal((await request(30,'opaque')).status,400);
  assert.equal((await request(12,'opaque',etag,{'Origin':'https://attacker.invalid'})).status,403);
  assert.equal((await request(12,'opaque',etag,{'Sec-Fetch-Site':'cross-site'})).status,403);
  for(const [frame,mode] of [[0,'transparent'],[12,'opaque'],[12,'transparent'],[29,'opaque']]){
   res=await request(frame,mode);
   assert.equal(res.status,200,'Canvas reference should render '+frame+':'+mode);
   assert.equal(res.headers.get('content-type'),'image/png');
   assert.equal(res.headers.get('cache-control'),'no-store');
   assert.match(res.headers.get('content-security-policy'),/img-src[^;]*blob:/);
   const data=Buffer.from(await res.arrayBuffer());
   assert.deepEqual(data.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
   const expected=drawEditableSceneFrame(fixture,frame,{output:mode}).toBuffer('image/png');
   assert.deepEqual(data,expected,'PNG must match locked Canvas writer byte-for-byte');
   assert.equal(res.headers.get('etag'),'"'+sha(data)+'"');
  }
  // Requesting any number of stills never initializes or edits editor/.local scene.
  const {lstat}=await import('node:fs/promises');
  await assert.rejects(lstat(file),{code:'ENOENT'});
  const modified=structuredClone(fixture);
  modified.layers[1].text='New Synthetic Title';
  res=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':etag},
   body:serializeEditableScene(modified)});
  assert.equal(res.status,200);
  const newEtag=res.headers.get('etag');
  assert.equal((await request(12,'opaque')).status,409);
  res=await request(12,'opaque',newEtag);
  assert.equal(res.status,200);
  assert.deepEqual(Buffer.from(await res.arrayBuffer()),
   drawEditableSceneFrame(modified,12).toBuffer('image/png'));
  assert.equal((await readFile(file,'utf8')),serializeEditableScene(modified));
  const unsupported=structuredClone(modified);
  unsupported.layers[1].text='🎨';
  const saved=serializeEditableScene(unsupported);
  res=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':newEtag},body:saved});
  assert.equal(res.status,200,'S1 editor accepts text that locked font must then refuse');
  const blocked=await request(12,'opaque',res.headers.get('etag'));
  assert.equal(blocked.status,422);
  assert.equal((await blocked.json()).error,'Saved S1 frame cannot be rendered with the locked Canvas contract');
  assert.equal(await readFile(file,'utf8'),saved);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  await rm(dir,{recursive:true,force:true});
 }
});
