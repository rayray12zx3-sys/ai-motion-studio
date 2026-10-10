// Original synthetic keyframe easing inspector in actual Chrome; no render/production adoption.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '../editor-contract/scene.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const hash=s=>createHash('sha256').update(s).digest('hex');
async function main(){
 const work=mkdtempSync(join(tmpdir(),'synthetic-ease-rnd-'));
 const disk=join(work,'scene.json');
 copyFileSync(join(here,'../editor-contract/original-synthetic.json'),disk);
 const out=join(here,'../../out');mkdirSync(out,{recursive:true});
 let browser,server;
 try{
  execFileSync('npm',['install','--prefix',work,'--no-save','--no-package-lock','--ignore-scripts',
   '--no-audit','--no-fund','playwright-core@1.55.0'],{timeout:120000,encoding:'utf8'});
  const manifest=JSON.parse(readFileSync(join(work,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(manifest.version,'1.55.0');assert.equal(manifest.license,'Apache-2.0');
  const pw=await import(pathToFileURL(join(work,'node_modules/playwright-core/index.mjs')).href);
  const chromium=pw.chromium??pw.default?.chromium;assert.equal(typeof chromium?.launch,'function');
  const html=readFileSync(join(here,'index.html'),'utf8');
  const ui=readFileSync(join(here,'easing-ui.mjs'),'utf8');
  const sceneSrc=readFileSync(join(here,'../editor-contract/scene.mjs'),'utf8');
  const timelineSrc=readFileSync(join(here,'../editor-contract/timeline.mjs'),'utf8');
  server=createServer(async(req,res)=>{
   try{
    const staticFiles={'/':['text/html',html],'/easing-ui.mjs':['text/javascript',ui],
     '/scene.mjs':['text/javascript',sceneSrc],'/timeline.mjs':['text/javascript',timelineSrc]};
    if(req.method==='GET'&&staticFiles[req.url]){
     const [type,payload]=staticFiles[req.url];
     res.writeHead(200,{'Content-Type':type});res.end(payload);return;
    }
    if(req.method==='GET'&&req.url==='/scene.json'){
     res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
     res.end(readFileSync(disk));return;
    }
    if(req.method==='POST'&&req.url==='/save'){
     let body='';
     for await(const chunk of req){body+=chunk;if(body.length>65536)throw Error('Oversized original scene');}
     const json=serializeEditableScene(parseEditableScene(body));
     writeFileSync(disk,json,'utf8');
     res.writeHead(200,{'Content-Type':'application/json'});
     res.end(JSON.stringify({persisted:true,sha256:hash(json)}));return;
    }
    res.writeHead(404);res.end('No such route');
   }catch(e){res.writeHead(400);res.end('Blocked unsafe input');}
  });
  const port=await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
  const origin='http://127.0.0.1:'+port;
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,
   args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:480,height:790},deviceScaleFactor:1});
  page.setDefaultTimeout(20000);await page.goto(origin,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__easeProbe?.ready===true);
  const first=await page.evaluate(()=>window.__easeProbe);
  assert.equal(first.frame,12);
  assert.equal(first.target.frame,25);
  assert.equal(first.target.ease,'linear');
  const firstX=first.sample.x,firstOpacity=first.sample.opacity;
  assert.ok(firstX>.25&&firstX<.4);
  await page.locator('#ease').selectOption('ease-out-cubic');
  await page.locator('#apply').click();
  await page.waitForFunction(()=>window.__easeProbe?.applyCount===1);
  let probe=await page.evaluate(()=>window.__easeProbe);
  assert.equal(probe.target.ease,'ease-out-cubic');
  assert.ok(probe.sample.x>firstX+.02);
  assert.ok(probe.sample.opacity>firstOpacity+.1);
  assert.equal(probe.saveCount,1);
  const easedX=probe.sample.x;
  const savedBefore=hash(readFileSync(disk));
  // Eased segment splitting is forbidden: must not silently turn cubic into linear.
  await page.locator('#insert').click();
  await page.waitForFunction(()=>window.__easeProbe?.rejectedCount===1);
  probe=await page.evaluate(()=>window.__easeProbe);
  assert.match(probe.errors[0],/curve-preserving/);
  assert.equal(probe.saveCount,1);
  assert.equal(hash(readFileSync(disk)),savedBefore);
  await page.locator('#undo').click();
  await page.waitForFunction(()=>window.__easeProbe?.undoCount===1);
  probe=await page.evaluate(()=>window.__easeProbe);
  assert.equal(probe.target.ease,'linear');
  assert.ok(Math.abs(probe.sample.x-firstX)<1e-12);
  await page.locator('#redo').click();
  await page.waitForFunction(()=>window.__easeProbe?.redoCount===1);
  probe=await page.evaluate(()=>window.__easeProbe);
  assert.equal(probe.target.ease,'ease-out-cubic');
  assert.ok(Math.abs(probe.sample.x-easedX)<1e-12);
  assert.equal(probe.saveCount,3);
  // Real keyboard seeking: no frame-dependent mutable stage/repaint state.
  const range=page.locator('#frame');
  await range.focus();await range.press('End');
  assert.equal((await page.evaluate(()=>window.__easeProbe)).frame,29);
  assert.equal((await page.evaluate(()=>window.__easeProbe)).sample,null);
  await range.press('Home');
  assert.equal((await page.evaluate(()=>window.__easeProbe)).frame,0);
  assert.equal((await page.evaluate(()=>window.__easeProbe)).sample,null);
  for(let i=0;i<12;i++)await range.press('ArrowRight');
  const back=await page.evaluate(()=>window.__easeProbe);
  assert.equal(back.frame,12);
  assert.ok(Math.abs(back.sample.x-easedX)<1e-12);
  const actual=parseEditableScene(readFileSync(disk,'utf8'));
  assert.equal(actual.layers.find(l=>l.id==='headline').keys.at(-1).ease,'ease-out-cubic');
  const persistedHash=hash(serializeEditableScene(actual));
  assert.equal(persistedHash,probe.receipt.sha256);
  const forged=structuredClone(actual);forged.assets=[{source:'https://example.invalid/private'}];
  const denied=await fetch(origin+'/save',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(forged)});
  assert.equal(denied.status,400);
  assert.equal(hash(readFileSync(disk)),persistedHash);
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>window.__easeProbe?.ready===true);
  const reopen=await page.evaluate(()=>window.__easeProbe);
  assert.equal(reopen.frame,12);assert.equal(reopen.target.ease,'ease-out-cubic');
  assert.ok(Math.abs(reopen.sample.x-easedX)<1e-12);
  assert.ok(Math.abs(reopen.sample.opacity-probe.sample.opacity)<1e-12);
  assert.equal(reopen.clip.start,4);assert.equal(reopen.clip.end,26);
  assert.deepEqual(reopen.clip.keys,[4,25]);
  const sceneAt12=evaluateEditableFrame(actual,12).layers.find(l=>l.id==='headline');
  assert.ok(Math.abs(sceneAt12.x-reopen.sample.x)<1e-12);
  await page.screenshot({path:join(out,'original-synthetic-easing-inspector.png')});
  const report={status:'PASS_NATIVE_TWO_MODE_EASING_INSPECTOR_ONLY',
   original_synthetic:true,frame:12,original_linear_x:firstX,
   persisted_cubic_x:easedX,original_linear_opacity:firstOpacity,
   persisted_cubic_opacity:reopen.sample.opacity,
   actual_browser_apply:probe.applyCount,undo:probe.undoCount,redo:probe.redoCount,
   persistent_writes:probe.saveCount,eased_segment_insert_refused:true,
   reverse_seeks_verified:true,remote_media_refused:true,reopen_identical:true,
   scene_sha256:persistedHash,production_dependencies_added:false,
   not_proven:['Bezier control-point editing','Full curve graph UI','Konva integrated frame seek',
    'Official Canvas renderer parity','Windows Premiere','Licensed company media']};
  writeFileSync(join(out,'original-synthetic-easing-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('S3_SYNTHETIC_NATIVE_EASING_PROOF',JSON.stringify(report));
 }finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(work,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('S3_EASING_PROOF_FAILED',e.stack||String(e));process.exitCode=1});
