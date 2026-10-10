// Synthetic only: real Chrome unified Konva canvas + native timeline pointer proof.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,readFileSync,writeFileSync,mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '../editor-contract/scene.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const pin='sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==';
const exec=(name,args,cwd)=>execFileSync(name,args,{cwd,timeout:120000,maxBuffer:25*1024*1024,encoding:'utf8'});
async function main(){
 const temp=mkdtempSync(join(tmpdir(),'motion-unified-editor-'));
 const scenePath=join(temp,'original-synthetic.json');
 copyFileSync(join(here,'../editor-contract/original-synthetic.json'),scenePath);
 const output=join(here,'../../out');mkdirSync(output,{recursive:true});
 let server,browser;
 try{
  const filename=exec('npm',['pack','konva@10.7.1','--ignore-scripts','--silent'],temp).trim().split(/\r?\n/).pop();
  assert.equal(filename,'konva-10.7.1.tgz');
  const bytes=readFileSync(join(temp,filename));
  assert.equal('sha512-'+createHash('sha512').update(bytes).digest('base64'),pin);
  const source=exec('tar',['-xOzf',filename,'package/konva.min.js'],temp);
  assert.ok(source.length>10000);
  exec('npm',['install','--prefix',temp,'--no-save','--no-package-lock','--ignore-scripts','--no-audit','--no-fund','playwright-core@1.55.0'],temp);
  const meta=JSON.parse(readFileSync(join(temp,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(meta.version,'1.55.0');assert.equal(meta.license,'Apache-2.0');
  const pw=await import(pathToFileURL(join(temp,'node_modules/playwright-core/index.mjs')).href);
  const chromium=pw.chromium??pw.default?.chromium;assert.equal(typeof chromium?.launch,'function');
  const html=readFileSync(join(here,'index.html'),'utf8'),js=readFileSync(join(here,'unified-editor.mjs'),'utf8');
  const contract=readFileSync(join(here,'../editor-contract/scene.mjs'),'utf8');
  const timeline=readFileSync(join(here,'../editor-contract/timeline.mjs'),'utf8');
  server=createServer(async(req,res)=>{
   try{
    const routes={'/':['text/html',html],'/unified-editor.mjs':['text/javascript',js],
     '/scene.mjs':['text/javascript',contract],'/timeline.mjs':['text/javascript',timeline],
     '/konva.min.js':['text/javascript',source]};
    if(req.method==='GET'&&routes[req.url]){
     res.writeHead(200,{'Content-Type':routes[req.url][0]});res.end(routes[req.url][1]);return;
    }
    if(req.method==='GET'&&req.url==='/scene.json'){
     res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
     res.end(readFileSync(scenePath));return;
    }
    if(req.method==='POST'&&req.url==='/save'){
     let input='';
     for await(const chunk of req){input+=chunk;if(input.length>65536)throw Error('Oversized scene');}
     const output=serializeEditableScene(parseEditableScene(input)); // forbid imported media/unknown keys
     writeFileSync(scenePath,output,'utf8');
     res.writeHead(200,{'Content-Type':'application/json'});
     res.end(JSON.stringify({persisted:true,sha256:createHash('sha256').update(output).digest('hex')}));
     return;
    }
    res.writeHead(404);res.end('Unknown localhost route');
   }catch(e){res.writeHead(400);res.end('Synthetic input rejected');}
  });
  const port=await new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
  const origin='http://127.0.0.1:'+port;
  browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',
   args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:470,height:900},deviceScaleFactor:1});
  page.setDefaultTimeout(25000);await page.goto(origin,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__unifiedProbe?.ready===true);
  const before=await page.evaluate(()=>window.__unifiedProbe);
  assert.deepEqual(before.clip,{start:4,end:26,keys:[4,25]});
  assert.deepEqual(before.entry,{x:.25,y:.7});
  async function drag(selector,dx,dy,predicate){
   const box=await page.locator(selector).boundingBox();
   assert.ok(box,'Missing user-interaction target: '+selector);
   const x=box.x+box.width/2,y=box.y+box.height/2;
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+dx,y+dy,{steps:18});await page.mouse.up();
   await page.waitForFunction(predicate);
  }
  await drag('#clip',20,0,()=>window.__unifiedProbe?.timelineGestures===1);
  let state=await page.evaluate(()=>window.__unifiedProbe);
  assert.deepEqual(state.clip,{start:6,end:28,keys:[6,27]});
  await drag('#end-handle',-20,0,()=>window.__unifiedProbe?.timelineGestures===2);
  state=await page.evaluate(()=>window.__unifiedProbe);
  assert.deepEqual(state.clip,{start:6,end:26,keys:[6,25]});
  // Konva drag: select original synthetic proxy rectangle; no browser fonts or assets.
  const stage=await page.locator('#stage').boundingBox();
  assert.ok(stage);
  const x=stage.x+state.entry.x*360+36,y=stage.y+state.entry.y*640+24;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+36,y+16,{steps:20});await page.mouse.up();
  await page.waitForFunction(()=>window.__unifiedProbe?.canvasDrags===1);
  state=await page.evaluate(()=>window.__unifiedProbe);
  assert.equal(state.saveCount,3);
  assert.ok(Math.abs(state.entry.x-.35)<.003);
  assert.ok(Math.abs(state.entry.y-.725)<.003);
  await page.locator('#undo').click();await page.waitForFunction(()=>window.__unifiedProbe?.undoCount===1);
  let undone=await page.evaluate(()=>window.__unifiedProbe);
  assert.deepEqual(undone.clip,{start:6,end:26,keys:[6,25]});
  assert.ok(Math.abs(undone.entry.x-.25)<1e-9);
  await page.locator('#redo').click();await page.waitForFunction(()=>window.__unifiedProbe?.redoCount===1);
  state=await page.evaluate(()=>window.__unifiedProbe);
  assert.equal(state.saveCount,5);assert.deepEqual(state.errors,[]);
  assert.ok(Math.abs(state.entry.x-.35)<.003);
  assert.ok(Math.abs(state.entry.y-.725)<.003);
  const persisted=parseEditableScene(readFileSync(scenePath,'utf8'));
  const headline=persisted.layers.find(l=>l.id==='headline');
  assert.deepEqual([headline.start_frame,headline.end_frame],[6,26]);
  assert.deepEqual(headline.keys.map(k=>k.frame),[6,25]);
  assert.equal(persisted.assets.length,0);
  const hash=createHash('sha256').update(serializeEditableScene(persisted)).digest('hex');
  assert.equal(state.receipt.sha256,hash);
  assert.equal(evaluateEditableFrame(persisted,5).layers.some(l=>l.id==='headline'),false);
  assert.equal(evaluateEditableFrame(persisted,6).layers.some(l=>l.id==='headline'),true);
  const baseline=evaluateEditableFrame(persisted,12);
  for(const f of [29,0,15,6,12])evaluateEditableFrame(persisted,f);
  assert.deepEqual(evaluateEditableFrame(persisted,12),baseline);
  const forbidden=structuredClone(persisted);forbidden.assets=[{url:'https://example.invalid/company'}];
  const refusal=await fetch(origin+'/save',{method:'POST',body:JSON.stringify(forbidden),
   headers:{'Content-Type':'application/json'}});
  assert.equal(refusal.status,400);
  assert.equal(hash,createHash('sha256').update(readFileSync(scenePath)).digest('hex'));
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.__unifiedProbe?.ready===true);
  const reopened=await page.evaluate(()=>window.__unifiedProbe);
  assert.deepEqual(reopened.clip,{start:6,end:26,keys:[6,25]});
  assert.ok(Math.abs(reopened.entry.x-state.entry.x)<1e-12);
  assert.ok(Math.abs(reopened.entry.y-state.entry.y)<1e-12);
  // Hand off only the independently validated, synthetic browser-saved scene to S4 encoder CI.
  const forEncode=parseEditableScene(readFileSync(scenePath,'utf8'));
  assert.deepEqual(forEncode,persisted);
  writeFileSync(join(output,'unified-editor-scene.json'),serializeEditableScene(forEncode)+'\n');
  await page.screenshot({path:join(output,'unified-original-synthetic.png')});
  const report={status:'PASS_ISOLATED_SYNTHETIC_SHARED_SCENE_KONVA_TIMELINE_ONLY',
   source:'original synthetic editor-contract v1',
   timeline_pointer_gestures:state.timelineGestures,konva_pointer_drags:state.canvasDrags,
   undo_count:state.undoCount,redo_count:state.redoCount,persisted_writes:state.saveCount,
   clip:reopened.clip,before_position:before.entry,after_position:reopened.entry,
   sha256:hash,saved_reopened_identically:true,media_import_refused:true,
   new_production_dependencies:false,official_renderer:'UNCHANGED',
   not_proven:['Konva+timeline professional UX','native keyframe/Bezier editor',
    'Canvas vs FFmpeg frame parity','Windows Premiere','real asset rights']};
  writeFileSync(join(output,'unified-editor-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('S4_SYNTHETIC_UNIFIED_EDITOR_PROOF',JSON.stringify(report));
 }finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('UNIFIED_EDITOR_PROOF_FAILED',e.stack||String(e));process.exitCode=1});
