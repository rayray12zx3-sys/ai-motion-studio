// S2 isolated browser-only Konva pointer / save / reload proof; never imports production renderer.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseEditableScene,serializeEditableScene} from '../editor-contract/scene.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const expectedIntegrity='sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==';
const exec=(name,args,cwd)=>execFileSync(name,args,{cwd,encoding:'utf8',maxBuffer:25*1024*1024,timeout:120000});
async function main(){
 const work=mkdtempSync(join(tmpdir(),'konva-browser-s2-'));
 const savedPath=join(work,'scene.json');
 copyFileSync(join(here,'../editor-contract/original-synthetic.json'),savedPath);
 const output=join(here,'../../out');
 mkdirSync(output,{recursive:true});
 let browser,server;
 try{
  const tgz=exec('npm',['pack','konva@10.7.1','--ignore-scripts','--silent'],work).trim().split(/\r?\n/).pop();
  assert.equal(tgz,'konva-10.7.1.tgz');
  const archive=readFileSync(join(work,tgz));
  assert.equal('sha512-'+createHash('sha512').update(archive).digest('base64'),expectedIntegrity,'Pinned Konva binary mismatch');
  const konvaBundle=exec('tar',['-xOzf',tgz,'package/konva.min.js'],work);
  assert.ok(konvaBundle.length>10000,'Missing distributable Konva script');
  exec('npm',['install','--prefix',work,'--no-save','--no-package-lock','--ignore-scripts','--no-audit','--no-fund','playwright-core@1.55.0'],work);
  const installed=JSON.parse(readFileSync(join(work,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(installed.version,'1.55.0');assert.equal(installed.license,'Apache-2.0');
  const playwright=await import(pathToFileURL(join(work,'node_modules/playwright-core/index.mjs')).href);
  const chromium=playwright.chromium??playwright.default?.chromium;
  assert.equal(typeof chromium?.launch,'function','Browser test helper cannot launch Chromium');
  const source=readFileSync(join(here,'index.html'),'utf8'),js=readFileSync(join(here,'editor.mjs'),'utf8');
  const neutral=readFileSync(join(here,'../editor-contract/scene.mjs'),'utf8');
  server=createServer(async(req,res)=>{
   try{
    if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(source);return;}
    if(req.method==='GET'&&req.url==='/vendor/konva.min.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(konvaBundle);return;}
    if(req.method==='GET'&&req.url==='/editor.mjs'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(js);return;}
    if(req.method==='GET'&&req.url==='/contract.mjs'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(neutral);return;}
    if(req.method==='GET'&&req.url==='/scene.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(readFileSync(savedPath));return;}
    if(req.method==='POST'&&req.url==='/save'){
     let body='';
     for await(const chunk of req){body+=chunk;if(body.length>65536)throw Error('Oversized local scene save');}
     const scene=parseEditableScene(body); // fails closed for malformed, non-synthetic or external assets
     const text=serializeEditableScene(scene);
     writeFileSync(savedPath,text,'utf8');
     res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({persisted:true,sha256:createHash('sha256').update(text).digest('hex')}));return;
    }
    res.writeHead(404);res.end('No route');
   }catch(error){res.writeHead(400);res.end('Rejected synthetic input: '+String(error));}
  });
  const port=await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
  const target='http://127.0.0.1:'+port;
  browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:430,height:860},deviceScaleFactor:1});
  page.setDefaultTimeout(25000);
  await page.goto(target,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__konvaProbe?.ready===true);
  const prior=await page.evaluate(()=>window.__konvaProbe.initial);
  assert.equal(prior.x,.2);assert.equal(prior.y,.65);
  const rect=await page.locator('#stage').boundingBox();
  assert.ok(rect,'Synthetic Konva stage did not render');
  const center={x:rect.x+prior.x*360+42,y:rect.y+prior.y*640+28};
  await page.mouse.move(center.x,center.y);
  await page.mouse.down();
  await page.mouse.move(center.x+56,center.y+28,{steps:16});
  await page.mouse.up();
  await page.waitForFunction(()=>window.__konvaProbe?.saved||window.__konvaProbe?.saveError);
  const after=await page.evaluate(()=>window.__konvaProbe);
  assert.equal(after.saveError,null,'Browser preview rejected drag');
  assert.equal(after.saved,true);assert.equal(after.dragEvents,1);
  const persisted=parseEditableScene(readFileSync(savedPath,'utf8'));
  const key=persisted.layers.find(l=>l.id==='card-title').keys[0];
  assert.ok(key.x>prior.x+.10,'Real mouse gesture must move normalized x coordinate');
  assert.ok(key.y>prior.y+.02,'Real mouse gesture must move normalized y coordinate');
  assert.equal(after.current.layers[0].keys[0].x,key.x,'Browser/server serialized values differ');
  const receipt=after.receipt?.sha256;
  assert.equal(receipt,createHash('sha256').update(serializeEditableScene(persisted)).digest('hex'));
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.__konvaProbe?.ready===true);
  const reopened=await page.evaluate(()=>window.__konvaProbe.initial);
  assert.equal(reopened.x,key.x);
  assert.equal(reopened.y,key.y);
  const screenshot=join(output,'konva-s2-original-synthetic.png');
  await page.screenshot({path:screenshot});
  const report={status:'PASS_SYNTHETIC_BROWSER_POINTER_AND_DISK_ROUNDTRIP_ONLY',package:'konva@10.7.1',renderer:'NOT_INTEGRATED',
   original:prior,persisted:reopened,dragEvents:after.dragEvents,localSavedSha256:receipt,
   asset_sources:'ORIGINAL_SYNTHETIC_ONLY',media_imports:0,playwright_helper:'1.55.0',production_adoption:false,
   unsupported:['native curve/keyframe editor','Canvas video pixels','Windows Premiere']};
  writeFileSync(join(output,'konva-s2-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('KONVA_BROWSER_POINTER_TEST',JSON.stringify(report));
 }finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(work,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('KONVA_BROWSER_S2_FAILED',e.stack||String(e));process.exitCode=1});
