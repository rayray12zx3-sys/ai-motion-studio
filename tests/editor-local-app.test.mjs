import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startEditorServer} from '../editor/server.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {addEditorRectangle,changeLayerAppearance,removeEditorLayer,
 translateEditorLayer,uniqueLayerId} from '../editor/operations.mjs';
const digest=x=>createHash('sha256').update(x).digest('hex');

test('local Konva frontend metadata remains opt-in without root dependency or private materials',async()=>{
 const root=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 const child=JSON.parse(await readFile(new URL('../editor/package.json',import.meta.url),'utf8'));
 const lock=JSON.parse(await readFile(new URL('../editor/package-lock.json',import.meta.url),'utf8'));
 assert.equal(root.dependencies.konva,undefined);
 assert.deepEqual(Object.keys(child.dependencies),['konva']);
 assert.equal(child.dependencies.konva,'10.7.1');
 assert.equal(lock.packages['node_modules/konva'].license,'MIT');
 assert.equal(lock.packages['node_modules/konva'].integrity,
 'sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==');
 assert.match(await readFile(new URL('../.gitignore',import.meta.url),'utf8'),/editor\/\.local\//);
});
test('official scene is not edited; independent operations clone and validate bounded appearance and geometry',async()=>{
 const data=parseEditableScene(await readFile(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
 const old=serializeEditableScene(data);
 const appearance=changeLayerAppearance(data,'headline','text','Synthetic Headline');
 assert.equal(appearance.layers.find(x=>x.id==='headline').text,'Synthetic Headline');
 assert.equal(data.layers[1].text,'Original Title');
 assert.throws(()=>changeLayerAppearance(data,'card-title','text','No'),/Only text layers/);
 assert.throws(()=>changeLayerAppearance(data,'headline','text','<script>'),/Invalid layer text/);
 const color=changeLayerAppearance(appearance,'headline','color','#aaffaa');
 assert.equal(color.layers[1].color,'#aaffaa');
 const moved=translateEditorLayer(color,'headline',.1,-.1);
 assert.ok(Math.abs(moved.layers[1].keys[0].x-.35)<1e-12);
 assert.ok(Math.abs(moved.layers[1].keys[1].y-.6)<1e-12);
 const fresh=uniqueLayerId(moved);
 const added=addEditorRectangle(moved,fresh);
 assert.equal(added.layers.length,4);
 const removed=removeEditorLayer(added,fresh);
 assert.equal(removed.layers.length,3);
 assert.throws(()=>removeEditorLayer(data,'missing'),/Unknown layer/);
 assert.throws(()=>translateEditorLayer(data,'headline',10,0),/Invalid normalized drag/);
 assert.equal(serializeEditableScene(data),old);
});
test('127.0.0.1 server validates versions, media, origin and atomic local save',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'motion-editor-app-test-'));
 const sceneFile=join(dir,'saved.json');
 const {server,url}=await startEditorServer({port:0,sceneFile});
 try{
  assert.ok(url.startsWith('http://127.0.0.1:'));
  const get=()=>fetch(url+'/scene.json');
  let res=await get();assert.equal(res.status,200);
  const originalTag=res.headers.get('etag');assert.match(originalTag,/^"[0-9a-f]{64}"$/);
  const original=parseEditableScene(await res.text());
  assert.equal(original.id,'original-synthetic');
  const scene=changeLayerAppearance(original,'headline','text','Editable Original Work');
  const raw=serializeEditableScene(scene);
  res=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':originalTag},body:raw});
  assert.equal(res.status,200);
  assert.equal((await res.json()).sha256,digest(raw));
  const savedTag=res.headers.get('etag');
  assert.notEqual(savedTag,originalTag);
  assert.equal(await readFile(sceneFile,'utf8'),raw);
  let conflict=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':originalTag},body:serializeEditableScene(original)});
  assert.equal(conflict.status,409);
  const evil=structuredClone(scene);evil.assets=[{url:'https://example.invalid/company'}];
  const rejected=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':savedTag},body:JSON.stringify(evil)});
  assert.equal(rejected.status,400);
  const hostile=await fetch(url+'/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':savedTag,'Origin':'https://untrusted.example'},body:raw});
  assert.equal(hostile.status,403);
  assert.equal(await readFile(sceneFile,'utf8'),raw);
  res=await get();assert.equal(res.headers.get('etag'),savedTag);
  assert.equal(parseEditableScene(await res.text()).layers[1].text,'Editable Original Work');
  assert.equal((await fetch(url+'/not-a-file')).status,404);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  await rm(dir,{recursive:true,force:true});
 }
});
test('refuse pre-existing symlink scene target and never follow it',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'motion-editor-symlink-'));
 const privateFile=join(dir,'private.txt'),sceneFile=join(dir,'scene.json');
 await writeFile(privateFile,'original secret must not be replaced');
 await symlink(privateFile,sceneFile);
 const {server,url}=await startEditorServer({sceneFile});
 try{
  const response=await fetch(url+'/scene.json');
  assert.equal(response.status,400);
  assert.equal(await readFile(privateFile,'utf8'),'original secret must not be replaced');
 }finally{
  await new Promise(resolve=>server.close(resolve));
  await rm(dir,{recursive:true,force:true});
 }
});
