// S3 experimental localhost-only real-browser timeline drag + trim + undo/redo test.
// No production renderer, no external input assets, no third-party timeline runtime.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '../editor-contract/scene.mjs';

const dir=dirname(fileURLToPath(import.meta.url));
async function main(){
 const temp=mkdtempSync(join(tmpdir(),'motion-timeline-s3-'));
 const saved=join(temp,'original-synthetic.json');
 copyFileSync(join(dir,'../editor-contract/original-synthetic.json'),saved);
 const output=join(dir,'../../out');
 mkdirSync(output,{recursive:true});
 let browser,server;
 try{
  execFileSync('npm',['install','--prefix',temp,'--no-save','--no-package-lock','--ignore-scripts',
   '--no-audit','--no-fund','playwright-core@1.55.0'],{encoding:'utf8',timeout:120000});
  const meta=JSON.parse(readFileSync(join(temp,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(meta.version,'1.55.0');assert.equal(meta.license,'Apache-2.0');
  const pw=await import(pathToFileURL(join(temp,'node_modules/playwright-core/index.mjs')).href);
  const chromium=pw.chromium??pw.default?.chromium;
  assert.equal(typeof chromium?.launch,'function');
  const html=readFileSync(join(dir,'index.html'),'utf8');
  const ui=readFileSync(join(dir,'timeline-ui.mjs'),'utf8');
  const scene=readFileSync(join(dir,'../editor-contract/scene.mjs'),'utf8');
  const timeline=readFileSync(join(dir,'../editor-contract/timeline.mjs'),'utf8');
  server=createServer(async(req,res)=>{
   try{
    const routes={'/':['text/html',html],
     '/timeline-ui.mjs':['text/javascript',ui],
     '/scene.mjs':['text/javascript',scene],
     '/timeline-contract.mjs':['text/javascript',timeline]};
    if(req.method==='GET'&&routes[req.url]){
     res.writeHead(200,{'Content-Type':routes[req.url][0]});res.end(routes[req.url][1]);return;
    }
    if(req.method==='GET'&&req.url==='/scene.json'){
     res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
     res.end(readFileSync(saved));return;
    }
    if(req.method==='POST'&&req.url==='/save'){
     let body='';
     for await(const chunk of req){body+=chunk;if(body.length>65536)throw Error('Oversized scene');}
     const value=serializeEditableScene(parseEditableScene(body));
     writeFileSync(saved,value,'utf8');
     res.writeHead(200,{'Content-Type':'application/json'});
     res.end(JSON.stringify({persisted:true,sha256:createHash('sha256').update(value).digest('hex')}));
     return;
    }
    res.writeHead(404);res.end('Unknown localhost route');
   }catch(err){res.writeHead(400);res.end('Rejected unsafe synthetic scene');}
  });
  const port=await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
  const origin='http://127.0.0.1:'+port;
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,
   args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:700,height:480},deviceScaleFactor:1});
  page.setDefaultTimeout(20000);
  await page.goto(origin,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__timelineProbe?.ready===true);
  const initial=await page.evaluate(()=>window.__timelineProbe.clip);
  assert.deepEqual(initial,{start:4,end:26,keyframes:[4,25]});
  async function drag(selector,delta,committed){
   const rect=await page.locator(selector).boundingBox();
   assert.ok(rect,'Timeline pointer target missing: '+selector);
   const x=rect.x+rect.width/2,y=rect.y+rect.height/2;
   await page.mouse.move(x,y);
   await page.mouse.down();
   await page.mouse.move(x+delta,y,{steps:12});
   await page.mouse.up();
   await page.waitForFunction(expected=>window.__timelineProbe?.pointerCommits===expected,committed);
  }
  await drag('#clip',30,1); // 4..26 -> 7..29
  let probe=await page.evaluate(()=>window.__timelineProbe);
  assert.equal(probe.clip.start,7);assert.equal(probe.clip.end,29);
  await drag('#end-handle',-20,2); // 7..29 -> 7..27
  probe=await page.evaluate(()=>window.__timelineProbe);
  assert.equal(probe.clip.end,27);
  await drag('#start-handle',10,3); // 7..27 -> 8..27
  probe=await page.evaluate(()=>window.__timelineProbe);
  assert.deepEqual(probe.clip,{start:8,end:27,keyframes:[8,26]});
  await page.locator('#add-key').click();
  await page.waitForFunction(()=>window.__timelineProbe?.saveCount===4);
  probe=await page.evaluate(()=>window.__timelineProbe);
  assert.deepEqual(probe.clip.keyframes,[8,12,26]);
  await page.locator('#undo').click();
  await page.waitForFunction(()=>window.__timelineProbe?.undoCount===1);
  probe=await page.evaluate(()=>window.__timelineProbe);
  assert.deepEqual(probe.clip.keyframes,[8,26]);
  await page.locator('#redo').click();
  await page.waitForFunction(()=>window.__timelineProbe?.redoCount===1);
  probe=await page.evaluate(()=>window.__timelineProbe);
  assert.deepEqual(probe.clip.keyframes,[8,12,26]);
  assert.equal(probe.saveCount,6);assert.deepEqual(probe.errors,[]);
  const after=parseEditableScene(readFileSync(saved,'utf8'));
  const active=after.layers.find(x=>x.id==='headline');
  assert.equal(active.start_frame,8);assert.equal(active.end_frame,27);
  assert.deepEqual(active.keys.map(k=>k.frame),[8,12,26]);
  assert.equal(evaluateEditableFrame(after,7).layers.some(l=>l.id==='headline'),false);
  assert.equal(evaluateEditableFrame(after,8).layers.some(l=>l.id==='headline'),true);
  assert.equal(evaluateEditableFrame(after,27).layers.some(l=>l.id==='headline'),false);
  const state=evaluateEditableFrame(after,14);
  for(const n of [29,0,23,14,8])evaluateEditableFrame(after,n);
  assert.deepEqual(evaluateEditableFrame(after,14),state);
  const hash=createHash('sha256').update(serializeEditableScene(after)).digest('hex');
  assert.equal(hash,probe.receipt?.sha256);
  // Negative POST must neither approve external media nor modify the saved scene.
  const evil=structuredClone(after);evil.assets=[{url:'http://example.invalid/private'}];
  const denied=await fetch(origin+'/save',{method:'POST',
   headers:{'Content-Type':'application/json'},body:JSON.stringify(evil)});
  assert.equal(denied.status,400);
  assert.equal(createHash('sha256').update(readFileSync(saved)).digest('hex'),hash);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.__timelineProbe?.ready===true);
  const reopen=await page.evaluate(()=>window.__timelineProbe.clip);
  assert.deepEqual(reopen,{start:8,end:27,keyframes:[8,12,26]});
  const screenshot=join(output,'timeline-s3-original-synthetic.png');
  await page.screenshot({path:screenshot});
  const report={status:'PASS_SYNTHETIC_BROWSER_TRACK_POINTER_AND_UNDO_REDO_ONLY',
   native_drag_commits:probe.pointerCommits,local_saves:probe.saveCount,
   before:initial,after:reopen,sha256:hash,reopen_identical:true,denied_unsafe_media:true,
   packages:{timeline:'vanilla-dom-only',playwright_helper:'1.55.0'},
   default_renderer:'UNCHANGED',assets:'ORIGINAL_SYNTHETIC_ONLY',production_adoption:false,
   not_verified:['Bezier GUI curve editing','Canvas+FFmpeg pixel parity','Windows Premiere','real asset rights']};
  writeFileSync(join(output,'timeline-s3-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('S3_BROWSER_TIMELINE_PROOF',JSON.stringify(report));
 }finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('S3_BROWSER_TIMELINE_FAILED',e.stack||String(e));process.exitCode=1});
