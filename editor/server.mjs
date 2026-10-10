// Local-only opt-in Konva editor. Official src/free and FFmpeg are intentionally never imported.
import {createHash,randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,rename,copyFile,lstat,unlink} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const root=dirname(fileURLToPath(import.meta.url));
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
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
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
 let serial=Promise.resolve();
 const server=createServer(async(req,res)=>{
  try{
   const host='127.0.0.1:'+server.address().port;
   if(req.headers.host!==host)throw Error('Only localhost Host accepted');
   if(req.headers.origin&&req.headers.origin!=='http://'+host)throw Error('Cross-origin request refused');
   const url=new URL(req.url,'http://'+host);
   // Authenticated-to-this-local-page, read-only frame of the SAVED S1 scene.
   // This uses the already-authorized locked Canvas painter, never Konva proxies.
   // The extra request header prevents third-party <img> embeds from reading a local frame.
   if(req.method==='GET'&&url.pathname==='/render-preview.png'){
    const validQuery=url.searchParams.size===1&&
      url.searchParams.has('frame')&&/^(0|[1-9][0-9]{0,3})$/.test(url.searchParams.get('frame'))&&
      !url.hash;
    if(!validQuery||req.headers['x-motion-preview']!=='1'||typeof req.headers['if-match']!=='string'||
       (req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'))
      throw Error('Unauthorized or invalid local frame preview request');
    const current=await readScene(scenePath);
    if(req.headers['if-match']!=='"'+sha(current)+'"'){
     respond(res,409,JSON.stringify({error:'Saved scene changed; reload before preview'}));return;
    }
    let painter;
    try{
     ({drawEditableSceneFrame:painter}=await import('../src/free/editable-scene.mjs'));
    }catch(error){
     if(error.code==='ERR_MODULE_NOT_FOUND'||error.code==='MODULE_NOT_FOUND'){
      respond(res,503,JSON.stringify({error:'Install existing root npm dependencies, restart editor server'}));return;
     }
     throw error;
    }
    try{
     const scene=parseEditableScene(current),frame=Number(url.searchParams.get('frame'));
     const canvas=painter(scene,frame,{output:'opaque'});
     const png=canvas.toBuffer('image/png');
     respond(res,200,png,'image/png',sha(png));return;
    }catch(error){
     respond(res,422,JSON.stringify({error:'Saved S1 scene cannot be rendered at this frame with locked Canvas and font'}));return;
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
