import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {startEditorServer} from '../editor/server.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {drawEditableSceneFrame} from '../src/free/editable-scene.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const fixture=new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url);
test('on-demand saved S1 image uses the real locked Canvas bytes without modifying the local scene',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'motion-real-frame-')),saved=join(dir,'scene.json');
 const {server,url}=await startEditorServer({sceneFile:saved});
 try{
  const current=await fetch(url+'/scene.json'),etag=current.headers.get('etag');
  const original=parseEditableScene(await current.text());
  const image=()=>fetch(url+'/render-preview.png?frame=12',{headers:{
   'If-Match':etag,'X-Motion-Preview':'1'
  }});
  const answer=await image();
  assert.equal(answer.status,200);
  assert.equal(answer.headers.get('content-type'),'image/png');
  assert.equal(answer.headers.get('cache-control'),'no-store');
  const png=Buffer.from(await answer.arrayBuffer());
  assert.deepEqual(png,drawEditableSceneFrame(original,12).toBuffer('image/png'));
  assert.equal(answer.headers.get('etag'),'"'+sha(png)+'"');
  assert.equal((await image()).headers.get('etag'),answer.headers.get('etag'));
  const missing=await readFile(saved).then(()=>false,e=>e.code==='ENOENT');
  assert.equal(missing,true,'Read-only preview must not create saved scene files');
  // Same ETag, later frame must be real different Canvas pixels.
  const next=await fetch(url+'/render-preview.png?frame=13',{headers:{
   'If-Match':etag,'X-Motion-Preview':'1'
  }});
  assert.equal(next.status,200);assert.notDeepEqual(Buffer.from(await next.arrayBuffer()),png);
  const modified=structuredClone(original);
  modified.layers.find(l=>l.id==='headline').text='New Synthetic Title';
  const raw=serializeEditableScene(modified);
  const savedResult=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':etag
  },body:raw});
  assert.equal(savedResult.status,200);
  const stale=await image();assert.equal(stale.status,409);
  const newer=await fetch(url+'/render-preview.png?frame=12',{headers:{
   'If-Match':savedResult.headers.get('etag'),'X-Motion-Preview':'1'
  }});
  assert.equal(newer.status,200);
  assert.deepEqual(Buffer.from(await newer.arrayBuffer()),drawEditableSceneFrame(modified,12).toBuffer('image/png'));
  assert.equal(await readFile(saved,'utf8'),raw);
 }finally{await new Promise(done=>server.close(done));await rm(dir,{recursive:true,force:true});}
});

test('real Canvas frame endpoint rejects cross-site embeds, forged scene ETags and ambiguous frame strings',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'motion-preview-guard-')),store=join(dir,'scene.json');
 const {server,url}=await startEditorServer({sceneFile:store});
 try{
  const e=(await fetch(url+'/scene.json')).headers.get('etag');
  const req=(path,headers={})=>fetch(url+path,{headers});
  const valid={'If-Match':e,'X-Motion-Preview':'1'};
  assert.equal((await req('/render-preview.png?frame=12')).status,400,'Cross-site img without opt-in header must fail');
  assert.equal((await req('/render-preview.png?frame=12',{'X-Motion-Preview':'1'})).status,400);
  assert.equal((await req('/render-preview.png?frame=12',{'If-Match':'"0"','X-Motion-Preview':'1'})).status,409);
  for(const path of [
   '/render-preview.png?frame=-1','/render-preview.png?frame=9999',
   '/render-preview.png?frame=12&frame=13',
   '/render-preview.png?frame=12&asset=https://external.invalid/private.png',
   '/render-preview.png?frame=12.0','/render-preview.png?frame=0012',
   '/render-preview.png?file=../secrets'
  ])assert.equal((await req(path,valid)).status,400,path);
  assert.equal((await req('/render-preview.png?frame=12',{...valid,Origin:'https://cross-site.invalid'})).status,403);
  assert.equal((await req('/render-preview.png?frame=12',{...valid,'Sec-Fetch-Site':'cross-site'})).status,400);
  assert.equal((await req('/render-preview.png?frame=1800',valid)).status,422,'S1 out-of-range frame denied');
  assert.equal((await req('/render-preview.png?frame=0',valid)).status,200);
  assert.equal((await readFile(store).then(()=>false,e=>e.code==='ENOENT')),true);
 }finally{await new Promise(done=>server.close(done));await rm(dir,{recursive:true,force:true});}
});

test('unsupported locked-font glyph fails closed without writing scene or leaking input text',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'motion-preview-unicode-')),saved=join(dir,'scene.json');
 const original=parseEditableScene(await readFile(fixture,'utf8'));
 original.layers.find(l=>l.id==='headline').text='🎨';
 await writeFile(saved,serializeEditableScene(original));
 const {server,url}=await startEditorServer({sceneFile:saved});
 try{
  const etag=(await fetch(url+'/scene.json')).headers.get('etag');
  const res=await fetch(url+'/render-preview.png?frame=12',{headers:{
   'If-Match':etag,'X-Motion-Preview':'1'
  }});
  assert.equal(res.status,422);
  assert.doesNotMatch(await res.text(),/🎨|Original Title/);
  assert.equal(parseEditableScene(await readFile(saved,'utf8')).layers[1].text,'🎨');
 }finally{await new Promise(done=>server.close(done));await rm(dir,{recursive:true,force:true});}
});
