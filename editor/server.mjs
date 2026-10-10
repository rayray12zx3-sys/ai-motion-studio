// Local-only opt-in Konva editor. Official src/free and FFmpeg are intentionally never imported.
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,rename,copyFile,lstat,unlink} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const root=dirname(fileURLToPath(import.meta.url));
const repoRoot=resolve(root,'..');
const defaultScene=join(root,'../experiments/editor-contract/original-synthetic.json');
const staticRoutes=new Map([
 ['/',[join(root,'index.html'),'text/html; charset=utf-8']],
 ['/styles.css',[join(root,'styles.css'),'text/css; charset=utf-8']],
 ['/app.mjs',[join(root,'app.mjs'),'text/javascript; charset=utf-8']],
 ['/operations.mjs',[join(root,'operations.mjs'),'text/javascript; charset=utf-8']],
 ['/preview-geometry.mjs',[join(root,'preview-geometry.mjs'),'text/javascript; charset=utf-8']],
 // Browser URL aliases for the same shared ESM imports used by Node unit tests.
 ['/experiments/editor-contract/scene.mjs',[join(root,'../experiments/editor-contract/scene.mjs'),'text/javascript; charset=utf-8']],
 ['/experiments/editor-contract/timeline.mjs',[join(root,'../experiments/editor-contract/timeline.mjs'),'text/javascript; charset=utf-8']],
 ['/scene.mjs',[join(root,'../experiments/editor-contract/scene.mjs'),'text/javascript; charset=utf-8']],
 ['/timeline.mjs',[join(root,'../experiments/editor-contract/timeline.mjs'),'text/javascript; charset=utf-8']],
 ['/vendor/konva.min.js',[join(root,'node_modules/konva/konva.min.js'),'text/javascript; charset=utf-8']]
]);
const sha=value=>createHash('sha256').update(value).digest('hex');
const canonical=value=>serializeEditableScene(parseEditableScene(value));
const denied={error:'Rejected local editor request'};
function respond(res,status,body,type='application/json; charset=utf-8',etag=null){
 const headers={'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer','X-Frame-Options':'DENY',
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
 if(etag)headers.ETag='"'+etag+'"';
 res.writeHead(status,headers);res.end(body);
}
async function readScene(sceneFile){
 try{
  const info=await lstat(sceneFile);
  if(!info.isFile()||info.isSymbolicLink())throw Error('Local scene must be a regular file');
  return canonical(await readFile(sceneFile,'utf8'));
 }catch(error){
  if(error.code!=='ENOENT')throw error;
  return canonical(await readFile(defaultScene,'utf8'));
 }
}
async function storeScene(sceneFile,content){
 await mkdir(dirname(sceneFile),{recursive:true,mode:0o700});
 const old=await lstat(sceneFile).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
 if(old&&(!old.isFile()||old.isSymbolicLink()))throw Error('Unsafe local save target');
 const temp=join(dirname(sceneFile),'.pending-'+randomUUID()+'.json');
 try{
  await writeFile(temp,content,{encoding:'utf8',flag:'wx',mode:0o600});
  if(old)await copyFile(sceneFile,sceneFile+'.previous');
  await rename(temp,sceneFile);
 }finally{await unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}
}
export async function startEditorServer({port=0,sceneFile=join(root,'.local','scene.json')}={}){
 if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid localhost port');
 if(typeof sceneFile!=='string'||!sceneFile)throw Error('Local scene path required');
 const scenePath=resolve(sceneFile);
 let serial=Promise.resolve(),rendering=false;
 const server=createServer(async(req,res)=>{
  try{
   const host='127.0.0.1:'+server.address().port;
   if(req.headers.host!==host)throw Error('Only localhost Host accepted');
   if(req.headers.origin&&req.headers.origin!=='http://'+host)throw Error('Cross-origin request refused');
   const url=new URL(req.url,'http://'+host);
   // Opt-in still reference is generated from the *saved* scene via the same Canvas
   // painter used by the approved S1 MP4/Alpha exporter, never from Konva proxies.
   if(req.method==='GET'&&url.pathname==='/canvas-preview.png'){
    if(req.headers['x-ai-motion-preview']!=='1'||
      (req.headers['sec-fetch-site']&& !['same-origin','none'].includes(req.headers['sec-fetch-site']))){
     respond(res,403,JSON.stringify(denied));return;
    }
    if(url.hash||[...url.searchParams.keys()].sort().join(',')!=='frame,mode'||
       !/^(?:0|[1-9][0-9]{0,3})$/.test(url.searchParams.get('frame')??'')||
       !['opaque','transparent'].includes(url.searchParams.get('mode'))){
     respond(res,400,JSON.stringify(denied));return;
    }
    const current=await readScene(scenePath),currentTag='"'+sha(current)+'"';
    if(req.headers['if-match']!==currentTag){
     respond(res,409,JSON.stringify({error:'Local scene changed; refresh before requesting a still'}));return;
    }
    const frame=Number(url.searchParams.get('frame')),mode=url.searchParams.get('mode');
    const scene=parseEditableScene(current);
    if(frame>=scene.duration_frames){
     respond(res,400,JSON.stringify(denied));return;
    }
    try{
     // Dependency is optional for launching the editor; no automatic installs.
     const {drawEditableSceneFrame}=await import('../src/free/editable-scene.mjs');
     const png=drawEditableSceneFrame(scene,frame,{output:mode}).toBuffer('image/png');
     respond(res,200,png,'image/png',sha(png));return;
    }catch(error){
     if(error.code==='ERR_MODULE_NOT_FOUND'){
      respond(res,503,JSON.stringify({error:'Optional root Canvas runtime is not installed; run npm.cmd ci from the repository root, then restart the editor'}));return;
     }
     // Includes unsupported production font glyphs: fail closed, no proxy fallback.
     respond(res,422,JSON.stringify({error:'Saved S1 frame cannot be rendered with the locked Canvas contract'}));return;
    }
   }
   // Explicit opt-in GUI export. Runs the already-approved fixed S1 CLI on a
   // byte-identical private snapshot, not a user-supplied command or path.
   if(req.method==='POST'&&url.pathname==='/render-video'){
    if(req.headers['x-ai-motion-export']!=='1'||
       (req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site']))){
     respond(res,403,JSON.stringify(denied));return;
    }
    if(url.hash||[...url.searchParams.keys()].join(',')!=='mode'||
       !['mp4','alpha'].includes(url.searchParams.get('mode'))||
       (req.headers['content-length']&&req.headers['content-length']!=='0')||
       req.headers['transfer-encoding']){
     respond(res,400,JSON.stringify(denied));return;
    }
    const current=await readScene(scenePath),currentTag='"'+sha(current)+'"';
    if(req.headers['if-match']!==currentTag){
     respond(res,409,JSON.stringify({error:'Saved scene version changed; reload before export'}));return;
    }
    let scene;
    try{
     const {validateEditableRenderScene}=await import('../src/free/editable-scene.mjs');
     scene=parseEditableScene(current);
     validateEditableRenderScene(scene);
    }catch(error){
     if(error.code==='ERR_MODULE_NOT_FOUND'){
      respond(res,503,JSON.stringify({error:'Optional root Canvas runtime missing; npm.cmd ci from repository root, then restart the editor'}));return;
     }
     respond(res,422,JSON.stringify({error:'The saved scene has unsupported locked-font or S1 render data'}));return;
    }
    if(rendering){respond(res,423,JSON.stringify({error:'Another local export is already running'}));return;}
    rendering=true;
    const runId='ui-'+randomUUID().replaceAll('-','').slice(0,16);
    const mode=url.searchParams.get('mode'),snapshotDirectory=join(repoRoot,'out','.editor-render-snapshots');
    const snapshot=join(snapshotDirectory,runId+'.json');
    try{
     await mkdir(snapshotDirectory,{recursive:true,mode:0o700});
     const folder=await lstat(snapshotDirectory);
     if(!folder.isDirectory()||folder.isSymbolicLink())throw Error('Unsafe snapshot folder');
     await writeFile(snapshot,current,{flag:'wx',mode:0o600});
     const videoFile=mode==='mp4'?'motion.mp4':'motion-alpha.mov';
     const args=[join(repoRoot,'scripts','render-editable.mjs'),snapshot,runId,mode];
     const detail=await new Promise((resolveRun,rejectRun)=>{
      const child=spawn(process.execPath,args,{cwd:repoRoot,windowsHide:true,
       stdio:['ignore','pipe','pipe']});
      let stdout='',stderr='',timedOut=false;
      const timeout=setTimeout(()=>{timedOut=true;child.kill();},15*60*1000);
      child.stdout.on('data',chunk=>{stdout=(stdout+chunk.toString()).slice(-10000);});
      child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-10000);});
      child.on('error',error=>{clearTimeout(timeout);rejectRun(error);});
      child.on('close',code=>{
       clearTimeout(timeout);
       if(timedOut)return rejectRun(Error('Export time limit reached'));
       if(code!==0)return rejectRun(Error(stderr.includes('Unverified FFmpeg binary')?
        'Pinned FFmpeg unavailable':'Native Canvas FFmpeg export failed'));
       try{
        const line=stdout.split(/\r?\n/).find(x=>x.startsWith('EDITABLE_SCENE_CANVAS_FFMPEG_RESULT '));
        const data=JSON.parse(line.slice('EDITABLE_SCENE_CANVAS_FFMPEG_RESULT '.length));
        if(data.technical_qc!=='PASS'||data.scene_sha256!==sha(Buffer.from(current)))
         throw Error('Encoded scene evidence mismatch');
        resolveRun(data);
       }catch(error){rejectRun(error);}
      });
     });
     respond(res,200,JSON.stringify({status:'DONE',run_id:runId,mode,
      frames:scene.duration_frames,canvas:scene.canvas,
      output:'out/editable-'+runId+'/'+videoFile,
      report:'out/editable-'+runId+'/render-report.json',
      scene_sha256:detail.scene_sha256,output_sha256:detail.output_sha256,
      creative_qc:'PENDING_HUMAN_REVIEW',
      premiere_windows:'NOT_TESTED'}));return;
    }catch(error){
     const unavailable=error.message==='Pinned FFmpeg unavailable'||error.code==='ENOENT';
     respond(res,unavailable?503:500,JSON.stringify({error:unavailable?
      'Install the existing hash-verified encoder with node scripts/setup-encoder.mjs and retry':
      'Local render did not complete. Inspect ignored out/editable-'+runId+' for incomplete output'}));return;
    }finally{
     rendering=false;
     await unlink(snapshot).catch(err=>{if(err.code!=='ENOENT')console.error('Private snapshot cleanup failed');});
    }
   }
   if(url.search||url.hash||url.pathname!==req.url)throw Error('Unexpected request path');
   if(req.method==='GET'&&staticRoutes.has(url.pathname)){
    const [path,type]=staticRoutes.get(url.pathname);
    respond(res,200,await readFile(path),type);return;
   }
   if(url.pathname==='/scene.json'&&req.method==='GET'){
    const text=await readScene(scenePath);
    respond(res,200,text,'application/json; charset=utf-8',sha(text));return;
   }
   if(url.pathname==='/scene.json'&&req.method==='POST'){
    if(!req.headers['content-type']?.startsWith('application/json')||
       typeof req.headers['if-match']!=='string')
      throw Error('JSON Content-Type and scene ETag are required');
    let data='';
    for await(const chunk of req){
     data+=chunk;
     if(Buffer.byteLength(data,'utf8')>65536)throw Error('Scene exceeds bounded JSON limit');
    }
    const validated=canonical(data);
    const answer=await new Promise((done,reject)=>{
     serial=serial.catch(()=>{}).then(async()=>{
      const current=await readScene(scenePath);
      const currentTag='"'+sha(current)+'"';
      if(currentTag!==req.headers['if-match'])return {status:409,body:{error:'Scene changed in another editor; reload first'}};
      await storeScene(scenePath,validated);
      return {status:200,body:{saved:true,sha256:sha(validated)},etag:sha(validated)};
     });
     serial.then(done,reject);
    });
    respond(res,answer.status,JSON.stringify(answer.body),'application/json; charset=utf-8',answer.etag);return;
   }
   respond(res,404,JSON.stringify(denied));return;
  }catch(error){
   const status=/Cross-origin|Host accepted/.test(String(error))?403:400;
   respond(res,status,JSON.stringify(denied));
  }
 });
 await new Promise((resolveReady,reject)=>{
  server.once('error',reject);
  server.listen(port,'127.0.0.1',()=>{server.off('error',reject);resolveReady();});
 });
 return {server,url:'http://127.0.0.1:'+server.address().port,sceneFile:scenePath};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=process.env.MOTION_EDITOR_PORT?Number(process.env.MOTION_EDITOR_PORT):0;
 startEditorServer({port}).then(({url})=>{
  process.stdout.write('Local Konva editor: '+url+'\n');
  process.stdout.write('Preview only; Canvas+FFmpeg official renderer is unchanged.\n');
 }).catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1;});
}
