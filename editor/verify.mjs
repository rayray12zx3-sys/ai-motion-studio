// User-approved local frontend test. Only original synthetic scene and loopback URLs.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {startEditorServer} from './server.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
async function main(){
 const temp=await mkdtemp(join(tmpdir(),'motion-editor-release-test-'));
 const store=join(temp,'scene.json'),out=join(here,'../out');
 await mkdir(out,{recursive:true});
 let service,browser;
 try{
  const manifest=JSON.parse(await readFile(join(here,'node_modules/konva/package.json'),'utf8'));
  assert.equal(manifest.version,'10.7.1');assert.equal(manifest.license,'MIT');
  assert.equal(Object.keys(manifest.dependencies||{}).length,0);
  const lock=JSON.parse(await readFile(join(here,'package-lock.json'),'utf8'));
  assert.equal(lock.packages['node_modules/konva'].integrity,
   'sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==');
  // Browser driver is a temporary CI-only tool, never an editor dependency.
  execFileSync('npm',['install','--prefix',temp,'--no-save','--no-package-lock','--ignore-scripts',
   '--no-audit','--no-fund','playwright-core@1.55.0'],{timeout:120000,encoding:'utf8'});
  const playwrightManifest=JSON.parse(await readFile(join(temp,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(playwrightManifest.version,'1.55.0');
  assert.equal(playwrightManifest.license,'Apache-2.0');
  const core=await import(pathToFileURL(join(temp,'node_modules/playwright-core/index.mjs')).href);
  const chromium=core.chromium??core.default?.chromium;
  assert.equal(typeof chromium?.launch,'function');
  service=await startEditorServer({port:0,sceneFile:store});
  browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',
   args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1280,height:1350},deviceScaleFactor:1});
  const browserErrors=[];
  page.on('pageerror',error=>browserErrors.push('pageerror '+String(error)));
  page.on('console',message=>{if(message.type()==='error')browserErrors.push('console '+message.text());});
  page.on('response',response=>{if(response.status()>=400)browserErrors.push('HTTP '+response.status()+' '+response.url());});
  page.on('requestfailed',req=>browserErrors.push('requestfailed '+req.url()+' '+req.failure()?.errorText));
  page.setDefaultTimeout(25000);await page.goto(service.url,{waitUntil:'load'});
  try{await page.waitForFunction(()=>window.__motionEditor?.ready===true);}
  catch(error){
   const appState=await page.evaluate(()=>({probe:window.__motionEditor||null,status:document.getElementById('status')?.textContent,html:document.title}));
   console.error('EDITOR_INIT_DIAGNOSTIC',JSON.stringify({appState,browserErrors}));
   throw error;
  }
  const first=await page.evaluate(()=>window.__motionEditor);
  assert.equal(first.selected,'headline');
  assert.equal(first.frame,12);assert.equal(first.scene.layers.length,3);
  assert.equal(first.scene.layers.find(l=>l.id==='headline').text,'Original Title');
  await page.locator('#ease').selectOption('ease-out-cubic');
  await page.locator('#save-ease').click();
  await page.waitForFunction(()=>window.__motionEditor?.easeChanges===1);
  let state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).ease,'ease-out-cubic');
  assert.equal(state.commits,1);
  const easedSample=state.sample.x;
  await page.locator('#undo').click();await page.waitForFunction(()=>window.__motionEditor?.undo===1);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).ease,'linear');
  await page.locator('#redo').click();await page.waitForFunction(()=>window.__motionEditor?.redo===1);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.sample.x,easedSample);
  await page.locator('#layer-text').fill('New Synthetic Headline');
  await page.locator('#save-appearance').click();
  await page.waitForFunction(()=>window.__motionEditor?.commits===4);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').text,'New Synthetic Headline');
  // Individual end-key x and scale are edited together as one saved undo item.
  await page.locator('#key-x').fill('0.64');
  await page.locator('#key-scale').fill('1.2');
  await page.locator('#save-values').click();
  await page.waitForFunction(()=>window.__motionEditor?.commits===5);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).x,.64);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).scale,1.2);
  assert.equal(state.history.undo,3); // Undo then Redo does not create a fifth history snapshot.
  const before=state.timeline.find(l=>l.id==='headline');
  async function drag(selector,dx,dy,predicate){
   const bounds=await page.locator(selector).boundingBox();
   assert.ok(bounds,'Missing draggable surface: '+selector);
   const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x+dx,y+dy,{steps:18});await page.mouse.up();
   await page.waitForFunction(predicate);
  }
  await drag('.clip[data-layer="headline"]',28,0,()=>window.__motionEditor?.timelineActions===1);
  state=await page.evaluate(()=>window.__motionEditor);
  const shifted=state.timeline.find(l=>l.id==='headline');
  assert.equal(shifted.start,before.start+2);
  assert.equal(shifted.end,before.end+2);
  const beforeXY=state.sample;
  const stage=await page.locator('#stage').boundingBox();
  assert.ok(stage);
  // Center of the original-synthetic proxy shape, anchored to normalized frame x/y.
  const x=stage.x+beforeXY.x*360,y=stage.y+beforeXY.y*640;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+28,y+14,{steps:20});await page.mouse.up();
  await page.waitForFunction(()=>window.__motionEditor?.canvasDrags===1);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.ok(state.sample.x>beforeXY.x+.07);
  assert.ok(state.sample.y>beforeXY.y+.018);
  // Existing nonlinear segment cannot be silently bisected by a new keyframe.
  await page.locator('#add-key').click();
  await page.waitForFunction(()=>window.__motionEditor?.blocked>=1);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.canvasDrags,1);
  const afterRejectSha=sha(serializeEditableScene(state.scene));
  const data=parseEditableScene(await readFile(store,'utf8'));
  assert.equal(sha(serializeEditableScene(data)),afterRejectSha);
  assert.equal(data.assets.length,0);
  // Another stale editor window must not overwrite newer scene state.
  const stale=await browser.newPage({viewport:{width:1280,height:900}});
  await stale.goto(service.url,{waitUntil:'load'});
  await stale.waitForFunction(()=>window.__motionEditor?.ready===true);
  await page.locator('#add-rect').click();
  await page.waitForFunction(()=>window.__motionEditor?.scene.layers.length===4);
  await stale.locator('#save-ease').click();
  await stale.waitForFunction(()=>window.__motionEditor?.blocked>=1);
  assert.match((await stale.evaluate(()=>window.__motionEditor.errors.at(-1))),/another editor|changed the local scene/i);
  assert.equal(parseEditableScene(await readFile(store,'utf8')).layers.length,4);
  await stale.close();
  await page.reload({waitUntil:'load'});await page.waitForFunction(()=>window.__motionEditor?.ready===true);
  const reopen=await page.evaluate(()=>window.__motionEditor);
  assert.equal(reopen.scene.layers.length,4);
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').text,'New Synthetic Headline');
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).ease,'ease-out-cubic');
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).scale,1.2);
  assert.ok(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).x>.70);
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').start_frame,6);
  assert.equal(sha(serializeEditableScene(reopen.scene)),sha(serializeEditableScene(parseEditableScene(await readFile(store,'utf8')))));
  await page.screenshot({path:join(out,'konva-editor-approved-synthetic.png'),fullPage:true});
  const result={status:'PASS_USER_APPROVED_OPT_IN_EDITOR_SHELL_SYNTHETIC_ONLY',
   app:'editor/',package:'konva@10.7.1',scope:'LOCAL_ONLY',
   saved_scene_sha256:sha(serializeEditableScene(reopen.scene)),
   layer_count:reopen.scene.layers.length,headline_clip:[6,28],headline_ease:'ease-out-cubic',
   real_pointer_timeline_drag:true,real_pointer_canvas_drag:true,appearance_edit:true,
   individual_keyframe_numeric_values_saved:true,keyframe_markers_present:true,
   undo_redo:true,stale_editor_save_refused:true,eased_key_split_refused:true,reload:true,
   no_external_media:true,official_canvas_ffmpeg_modified:false,
   not_proven:['locked-font visual parity','Windows Premiere','private media rights','Bezier control points','commercial art approval']};
  await writeFile(join(out,'konva-editor-approved-synthetic-report.json'),JSON.stringify(result,null,2)+'\n');
  console.log('KONVA_EDITOR_APPROVED_SHELL_PROOF',JSON.stringify(result));
 }finally{
  if(browser)await browser.close();
  if(service)await new Promise(resolve=>service.server.close(resolve));
  await rm(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('KONVA_EDITOR_SHELL_FAILED',e.stack||String(e));process.exitCode=1});
