// Optional hosted real-Chrome ORIGINAL SYNTHETIC Konva rectangle pixel proof.
// CI-only pinned temporary playwright-core; no root/editor package/lock changes.
// Never opens a user's existing local scene, company assets or external URLs.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {parseGeometryV2Scene,resizeGeometryV2Rect} from './scene.mjs';
import {projectGeometryV2Frame,v2KonvaNodeProps} from './geometry.mjs';
import {drawGeometryV2Frame} from './paint.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const fixture=parseGeometryV2Scene(readFileSync(join(here,'original-synthetic.json'),'utf8'));
const syntheticRects=source=>({...source,layers:source.layers.filter(l=>l.type==='rect')});
const variants={
 full:syntheticRects(fixture),
 narrow:syntheticRects(resizeGeometryV2Rect(fixture,'panel',{width:.32,height:.12}))
};
const manifest=JSON.parse(readFileSync(join(root,'editor/node_modules/konva/package.json'),'utf8'));
assert.equal(manifest.version,'10.7.1');
assert.equal(manifest.license,'MIT');
const sha=buf=>createHash('sha256').update(buf).digest('hex');
const expectedHead=process.env.EXPECTED_V2_HEAD;
if(expectedHead)assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),expectedHead);
const out=join(root,'out','geometry-v2-browser-proof');
if(existsSync(out))throw Error('Will not overwrite an existing browser QA run');
mkdirSync(out,{recursive:true});
const browserSource={
 '/':{data:readFileSync(join(here,'browser.html')),type:'text/html; charset=utf-8'},
 '/browser-client.mjs':{data:readFileSync(join(here,'browser-client.mjs')),type:'text/javascript; charset=utf-8'},
 '/konva.min.js':{data:readFileSync(join(root,'editor/node_modules/konva/konva.min.js')),type:'text/javascript; charset=utf-8'}
};
const server=createServer((req,res)=>{
 const host='127.0.0.1:'+server.address().port;
 if(req.headers.host!==host||req.method!=='GET'||(req.headers.origin&&req.headers.origin!=='http://'+host)){
  res.writeHead(403);res.end('Denied');return;
 }
 let url;
 try{url=new URL(req.url,'http://'+host);}catch{res.writeHead(400);res.end('Invalid');return;}
 const headers={
  'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self'; object-src 'none'; base-uri 'none'"
 };
 if(url.pathname==='/projection'&&url.hash===''&&[...url.searchParams.keys()].join(',')==='variant'){
  const variant=url.searchParams.get('variant');
  if(!Object.hasOwn(variants,variant)){res.writeHead(400);res.end('Invalid variant');return;}
  const projected=projectGeometryV2Frame(variants[variant],30);
  const data=JSON.stringify({width:projected.viewport.width,height:projected.viewport.height,
   layers:projected.layers.map(l=>({id:l.id,props:v2KonvaNodeProps(l)}))});
  res.writeHead(200,{...headers,'Content-Type':'application/json; charset=utf-8'});
  res.end(data);return;
 }
 if(url.search){res.writeHead(404);res.end('Not found');return;}
 const route=browserSource[url.pathname];
 if(!route){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{...headers,'Content-Type':route.type});
 res.end(route.data);
});
async function extractedPNG(dataUri){
 assert.match(dataUri,/^data:image\/png;base64,/);
 const data=Buffer.from(dataUri.split(',')[1],'base64');
 const img=await loadImage(data);
 assert.deepEqual([img.width,img.height],[360,640]);
 const canvas=createCanvas(360,640);
 canvas.getContext('2d').drawImage(img,0,0);
 return {data,pixels:Buffer.from(canvas.getContext('2d').getImageData(0,0,360,640).data)};
}
const sampledPoints=[[0,0],[65,275],[180,275],[180,370],[340,275]];
function sampleRGBA(pixels,x,y){
 const n=(y*360+x)*4;
 return [...pixels.subarray(n,n+4)];
}
function verifyPixels(actual,expected,name){
 const pixels=Buffer.from(expected.getContext('2d').getImageData(0,0,360,640).data);
 for(const [x,y] of sampledPoints){
  const a=sampleRGBA(actual,x,y),b=sampleRGBA(pixels,x,y);
  for(let channel=0;channel<4;channel++)
   assert.ok(Math.abs(a[channel]-b[channel])<=4,
    name+' pixel '+x+','+y+' channel '+channel+': Konva '+a[channel]+' vs Canvas '+b[channel]);
 }
}
const temporary=await mkdtemp(join(tmpdir(),'motion-v2-browser-'));
let browser,page;
try{
 // Mirrors existing editor verifier's CI-only browser driver; it is NOT a
 // committed package/dependency and only installs during this isolated test.
 execFileSync('npm',['install','--prefix',temporary,'--no-save','--no-package-lock',
  '--ignore-scripts','--no-audit','--no-fund','playwright-core@1.55.0'],
 {timeout:120000,windowsHide:true});
 const core=await import(pathToFileURL(join(temporary,'node_modules/playwright-core/index.mjs')).href);
 const chromium=core.chromium??core.default?.chromium;
 assert.equal(typeof chromium?.launch,'function');
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({channel:'chrome',headless:true,
  args:process.platform==='linux'?['--no-sandbox','--disable-dev-shm-usage']:[]});
 page=await browser.newPage({viewport:{width:800,height:950},deviceScaleFactor:1});
 const external=[],errors=[];
 page.on('request',request=>{
  const u=new URL(request.url());
  if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.port!==String(server.address().port))
   external.push(request.url());
 });
 page.on('pageerror',e=>errors.push(String(e)));
 const url='http://127.0.0.1:'+server.address().port+'/';
 await page.goto(url,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__v2Research?.ready===true);
 const evidence=[];
 for(const variant of ['full','narrow']){
  if(variant==='narrow'){
   await page.getByRole('button',{name:'Shrink panel'}).click();
   await page.waitForFunction(()=>window.__v2Research?.variant==='narrow');
  }
  const snapshot=await page.evaluate(()=>window.__v2Research.snapshot());
  assert.equal(snapshot.variant,variant);
  assert.deepEqual([snapshot.width,snapshot.height],[360,640]);
  assert.equal(snapshot.nodes.length,2);
  const projected=projectGeometryV2Frame(variants[variant],30);
  for(const [index,node] of snapshot.nodes.entries()){
   const expected=projected.layers[index];
   assert.equal(node.id,expected.id);
   for(const key of ['x','y','width','height','offsetX','offsetY','scaleX','scaleY','opacity']){
    const exp=key==='scaleX'||key==='scaleY'?expected.scale:expected[key];
    assert.ok(Math.abs(node[key]-exp)<1e-8,variant+' '+node.id+' '+key);
   }
  }
  const pixels=await extractedPNG(await page.evaluate(()=>window.__v2Research.png()));
  const reference=drawGeometryV2Frame(variants[variant],30,{output:'transparent'});
  verifyPixels(pixels.pixels,reference,variant);
  const name='konva-'+variant+'.png';
  writeFileSync(join(out,name),pixels.data);
  writeFileSync(join(out,'canvas-'+variant+'.png'),reference.toBuffer('image/png'));
  evidence.push({variant,png_sha256:sha(pixels.data),rectangles:snapshot.nodes,
   compared_interior_rgba_pixels:sampledPoints.length});
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 await page.screenshot({path:join(out,'browser-synthetic-stage.png')});
 const report={
  kind:'ISOLATED_GEOMETRY_V2_ACTUAL_KONVA_BROWSER_RECT_ONLY',
  exact_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  konva:'10.7.1',chromium:'installed chrome channel',scene:'original synthetic rectangles only',
  evidence,external_requests:external.length,browser_errors:errors.length,
  actual_browser_rect_geometry:true,interior_sampled_rgba_parity:true,
  every_pixel_rect_parity:false,text_browser_parity:false,
  full_editor_integration:false,source_v1_unmodified:true,
  premiere_and_human_approval:false
 };
 writeFileSync(join(out,'browser-proof.json'),JSON.stringify(report,null,2)+'\n');
 console.log('GEOMETRY_V2_REAL_BROWSER_PROOF',JSON.stringify({
  variants:evidence.map(x=>x.variant),sampled_rgba_points:sampledPoints.length,
  no_external_requests:true,review_only:true
 }));
}finally{
 if(browser)await browser.close().catch(()=>{});
 await new Promise(resolve=>server.close(resolve));
 await rm(temporary,{recursive:true,force:true});
}
