// Real local browser-server → already approved S1 Canvas+FFmpeg E2E,
// run ONLY on original synthetic CI with existing verified native encoder installed.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm,readdir,lstat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startEditorServer} from '../editor/server.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const temp=await mkdtemp(join(tmpdir(),'motion-editor-gui-export-'));
const local=join(temp,'scene.json'),fixture=parseEditableScene(await readFile(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const expected=serializeEditableScene(fixture);
const {server,url}=await startEditorServer({sceneFile:local,port:0});
const exports=[];
const launch=(mode,tag,extra={})=>fetch(url+'/render-video?mode='+mode,{
 method:'POST',
 headers:{'X-AI-Motion-Export':'1','If-Match':tag,...extra}
});
try{
 let res=await fetch(url+'/scene.json');
 let etag=res.headers.get('etag');
 assert.equal(await res.text(),expected);
 assert.equal((await fetch(url+'/render-video?mode=mp4',{method:'POST'})).status,403);
 assert.equal((await launch('hls',etag)).status,400);
 assert.equal((await launch('mp4','"'+('f'.repeat(64))+'"')).status,409);
 assert.equal((await launch('mp4',etag,{'Origin':'https://evil.example'})).status,403);
 assert.equal((await launch('mp4',etag,{'Sec-Fetch-Site':'cross-site'})).status,403);
 res=await fetch(url+'/render-video?mode=mp4',{method:'POST',
  headers:{'X-AI-Motion-Export':'1','If-Match':etag,'Content-Type':'text/plain'},body:'bad'});
 assert.equal(res.status,400);
 // 127.0.0.1 alone is insufficient; the explicit custom browser header+ETag are required.
 const mp4=await launch('mp4',etag);
 assert.equal(mp4.status,200,'Actual native MP4 render failed: '+await mp4.clone().text());
 const first=await mp4.json();exports.push(first);
 assert.equal(first.status,'DONE');assert.equal(first.mode,'mp4');
 assert.equal(first.frames,30);assert.deepEqual(first.canvas,{width:360,height:640});
 assert.match(first.output,/^out\/editable-ui-[a-f0-9]{16}\/motion\.mp4$/);
 assert.equal(first.premiere_windows,'NOT_TESTED');
 assert.equal(first.creative_qc,'PENDING_HUMAN_REVIEW');
 assert.equal(first.scene_sha256,sha(Buffer.from(expected)));
 const written=await readFile(new URL('../'+first.output,import.meta.url));
 assert.equal(first.output_sha256,sha(written));
 const report=JSON.parse(await readFile(new URL('../'+first.report,import.meta.url),'utf8'));
 assert.equal(report.codec,'h264');assert.equal(report.frames,30);
 assert.equal(report.network_requests,0);assert.equal(report.media_assets,0);
 assert.equal(report.approval,'UNAPPROVED');
 assert.equal((await fetch(url+'/scene.json')).headers.get('etag'),etag);
 await assert.rejects(lstat(local),{code:'ENOENT'});
 const version2=structuredClone(fixture);version2.layers[1].text='Synthetic Video Update';
 res=await fetch(url+'/scene.json',{method:'POST',headers:{
  'Content-Type':'application/json','If-Match':etag},body:serializeEditableScene(version2)});
 assert.equal(res.status,200);
 etag=res.headers.get('etag');
 assert.equal((await launch('alpha','"'+('a'.repeat(64))+'"')).status,409);
 const alpha=await launch('alpha',etag);
 assert.equal(alpha.status,200,'Actual native ProRes Alpha render failed: '+await alpha.clone().text());
 const second=await alpha.json();exports.push(second);
 assert.equal(second.status,'DONE');assert.equal(second.mode,'alpha');assert.equal(second.frames,30);
 assert.match(second.output,/^out\/editable-ui-[a-f0-9]{16}\/motion-alpha\.mov$/);
 assert.notEqual(second.scene_sha256,first.scene_sha256);
 assert.equal(second.scene_sha256,sha(Buffer.from(serializeEditableScene(version2))));
 const report2=JSON.parse(await readFile(new URL('../'+second.report,import.meta.url),'utf8'));
 assert.equal(report2.codec,'prores');assert.match(report2.pix_fmt,/^yuva444p/);
 assert.equal(report2.approval,'UNAPPROVED');
 assert.equal(report2.scene_sha256,second.scene_sha256);
 assert.equal(second.output_sha256,sha(await readFile(new URL('../'+second.output,import.meta.url))));
 assert.equal((await readFile(local,'utf8')),serializeEditableScene(version2));
 const snapshots=await readdir(new URL('../out/.editor-render-snapshots',import.meta.url));
 assert.deepEqual(snapshots,[],'Private render snapshots must be deleted after FFmpeg completes');
 const unsupported=structuredClone(version2);unsupported.layers[1].text='🎨';
 res=await fetch(url+'/scene.json',{method:'POST',headers:{
  'Content-Type':'application/json','If-Match':etag},body:serializeEditableScene(unsupported)});
 assert.equal(res.status,200);
 assert.equal((await launch('mp4',res.headers.get('etag'))).status,422);
 console.log('S1_GUI_LOCAL_EXPORT_PROOF',JSON.stringify({
  scope:'SYNTHETIC_ONLY',host:'127.0.0.1',modes:exports.map(x=>x.mode),
  frames:30,canvas:{width:360,height:640},
  outputs_sha256:exports.map(x=>x.output_sha256),snapshot_cleanup:true,
  output_paths:exports.map(x=>x.output),export_required_user_click:true,
  no_foreign_media:true,old_renderer_modified:false}));
}finally{
 await new Promise(resolveReady=>server.close(resolveReady));
 await rm(temp,{recursive:true,force:true});
}
