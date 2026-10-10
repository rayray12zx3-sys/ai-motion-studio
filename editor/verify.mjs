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
 let service,browser,context,page;
 const channel=process.env.MOTION_EDITOR_BROWSER_CHANNEL||'chrome';
 assert.ok(['chrome','msedge'].includes(channel),'Supported installed browser channel required');
 const headless=process.env.MOTION_EDITOR_HEADED!=='1';
 const testedCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:here,encoding:'utf8'}).trim();
 if(process.env.MOTION_EDITOR_PR_HEAD)assert.equal(testedCommit,process.env.MOTION_EDITOR_PR_HEAD,
  'Browser verifier must check out the exact PR head');
 const artifacts=[];
 try{
  const manifest=JSON.parse(await readFile(join(here,'node_modules/konva/package.json'),'utf8'));
  assert.equal(manifest.version,'10.7.1');assert.equal(manifest.license,'MIT');
  assert.equal(Object.keys(manifest.dependencies||{}).length,0);
  const lock=JSON.parse(await readFile(join(here,'package-lock.json'),'utf8'));
  assert.equal(lock.packages['node_modules/konva'].integrity,
   'sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==');
  // Browser driver is a temporary CI-only tool, never an editor dependency.
  const installArgs=['install','--no-save','--no-package-lock','--ignore-scripts',
   '--no-audit','--no-fund','playwright-core@1.55.0'];
  // .cmd files require cmd.exe on Windows; do not shell-interpolate paths or user input.
  if(process.platform==='win32')
   execFileSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd '+installArgs.join(' ')],
    {cwd:temp,timeout:120000,encoding:'utf8'});
  else execFileSync('npm',installArgs,{cwd:temp,timeout:120000,encoding:'utf8'});
  const playwrightManifest=JSON.parse(await readFile(join(temp,'node_modules/playwright-core/package.json'),'utf8'));
  assert.equal(playwrightManifest.version,'1.55.0');
  assert.equal(playwrightManifest.license,'Apache-2.0');
  const core=await import(pathToFileURL(join(temp,'node_modules/playwright-core/index.mjs')).href);
  const chromium=core.chromium??core.default?.chromium;
  assert.equal(typeof chromium?.launch,'function');
  service=await startEditorServer({port:0,sceneFile:store});
  browser=await chromium.launch({headless,
   ...(process.env.MOTION_EDITOR_BROWSER_PATH?{executablePath:process.env.MOTION_EDITOR_BROWSER_PATH}:{channel}),
   args:process.platform==='linux'?['--no-sandbox','--disable-dev-shm-usage']:[]});
  context=await browser.newContext({viewport:{width:1280,height:1350},deviceScaleFactor:1});
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  const outboundRequests=[];
  context.on('request',request=>{
   const url=new URL(request.url());
   const localHttp=url.protocol==='http:'&&url.hostname==='127.0.0.1'&&url.origin===service.url;
   const localMemoryBlob=url.protocol==='blob:'&&url.origin===service.url;
   if(!localHttp&&!localMemoryBlob)outboundRequests.push(request.url());
  });
  const browserErrors=[];
  context.on('page',tab=>{
   tab.setDefaultTimeout(25000);
   tab.on('pageerror',error=>browserErrors.push('pageerror '+String(error)));
  });
  page=await context.newPage();
  async function screenshot(name,target=page){
   const path=join(out,'konva-editor-'+name+'.png');
   await target.screenshot({path,fullPage:true});artifacts.push(path);
  }
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
  await screenshot('initial-synthetic');
  if(process.env.MOTION_TEST_CANVAS_STILL==='1'){
   const originalScene=await page.evaluate(()=>JSON.stringify(window.__motionEditor.scene));
   await page.locator('.render-reference summary').click();
   await page.locator('#render-still').click();
   await page.waitForFunction(()=>window.__motionEditor?.still?.status==='READY');
   const picture=await page.locator('#rendered-still').evaluate(async image=>{
    await image.decode();
    const canvas=document.createElement('canvas');
    canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    return {width:canvas.width,height:canvas.height,
      pixels:[...ctx.getImageData(0,0,1,1).data],
      currentSrc:image.currentSrc,visible:!image.hidden};
   });
   assert.deepEqual([picture.width,picture.height],[360,640]);
   assert.equal(picture.visible,true);
   assert.equal(picture.pixels[3],255,'Opaque authoritative frame background');
   assert.ok(picture.currentSrc.startsWith('blob:'),'Only local in-memory preview URL');
   const sceneVersion=await page.evaluate(()=>window.__motionEditor.etag);
   const direct=await fetch(service.url+'/canvas-preview.png?frame=12&mode=opaque',{
    headers:{'X-AI-Motion-Preview':'1','If-Match':sceneVersion}});
   assert.equal(direct.status,200);
   const directHash=sha(Buffer.from(await direct.arrayBuffer()));
   await page.locator('#render-mode').selectOption('transparent');
   await page.waitForFunction(()=>window.__motionEditor?.still?.status==='STALE');
   assert.equal(await page.locator('#rendered-still').isHidden(),true);
   await page.locator('#render-still').click();
   await page.waitForFunction(()=>window.__motionEditor?.still?.status==='READY');
   const alphaPixel=await page.locator('#rendered-still').evaluate(async image=>{
    await image.decode();
    const canvas=document.createElement('canvas');
    canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    return [...ctx.getImageData(0,0,1,1).data];
   });
   assert.equal(alphaPixel[3],0,'Transparent Canvas PNG has alpha outside content');
   await page.locator('#seek').fill('14');
   await page.waitForFunction(()=>window.__motionEditor?.still?.status==='STALE');
   assert.equal(await page.locator('#rendered-still').isHidden(),true);
   await page.locator('#seek').fill('12');
   assert.equal(await page.evaluate(()=>JSON.stringify(window.__motionEditor.scene)),originalScene,
    'Read-only Canvas frame queries must never edit scene history');
   await screenshot('authoritative-canvas-still-synthetic');
   console.log('AUTHORITATIVE_CANVAS_STILL_BROWSER_PROOF',JSON.stringify({
    browser:channel,opaque_preview:[picture.width,picture.height],
    opaque_png_sha256:directHash,transparent_outside_pixel_alpha:alphaPixel[3],
    same_saved_scene:true,seek_invalidated_stale_still:true,
    non_wysiwyg_konva_proxy:true
   }));
  }else{
   // Clean editor-only installation deliberately lacks the root Canvas runtime.
   // The optional still tool must fail helpfully without preventing Konva edits.
   await page.locator('.render-reference summary').click();
   await page.locator('#render-still').click();
   await page.waitForFunction(()=>window.__motionEditor?.still?.status==='ERROR');
   const advisory=await page.evaluate(()=>window.__motionEditor.still.message);
   assert.match(advisory,/503/);
   assert.match(advisory,/root Canvas runtime is not installed/);
   assert.equal(await page.locator('#rendered-still').isHidden(),true);
   assert.equal((await page.evaluate(()=>window.__motionEditor)).commits,0);
  }
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
  assert.ok(easedSample>first.sample.x,'Easing must change actual interpolated frame x');
  await page.locator('#layer-text').fill('New Synthetic Headline');
  await page.locator('#save-appearance').click();
  await page.waitForFunction(()=>window.__motionEditor?.commits===4);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').text,'New Synthetic Headline');
  // Five end-key numeric properties are edited together as one saved undo item.
  await page.locator('#key-x').fill('0.64');
  await page.locator('#key-y').fill('0.72');
  await page.locator('#key-scale').fill('1.2');
  await page.locator('#key-rotation').fill('0.1');
  await page.locator('#key-opacity').fill('0.9');
  await page.locator('#save-values').click();
  await page.waitForFunction(()=>window.__motionEditor?.commits===5);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).x,.64);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).scale,1.2);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).y,.72);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).rotation,.1);
  assert.equal(state.scene.layers.find(l=>l.id==='headline').keys.at(-1).opacity,.9);
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
  const dataBeforeCanvas=state.scene;
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
  await screenshot('edited-synthetic');
  const movedScene=serializeEditableScene(state.scene);
  await page.locator('#undo').click();
  await page.waitForFunction(()=>window.__motionEditor?.undo===2);
  assert.equal(serializeEditableScene((await page.evaluate(()=>window.__motionEditor)).scene),
   serializeEditableScene(dataBeforeCanvas));
  await page.locator('#redo').click();
  await page.waitForFunction(()=>window.__motionEditor?.redo===2);
  assert.equal(serializeEditableScene((await page.evaluate(()=>window.__motionEditor)).scene),movedScene);
  // Trim both real pointer handles on the linear accent track.
  await drag('.clip[data-layer="accent"] .handle[data-edge="start"]',14,0,
   ()=>window.__motionEditor?.timelineActions===2);
  await drag('.clip[data-layer="accent"] .handle[data-edge="end"]',-14,0,
   ()=>window.__motionEditor?.timelineActions===3);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.deepEqual(state.timeline.find(l=>l.id==='accent'),{id:'accent',start:11,end:19,keys:[11,18]});
  const trimmedScene=serializeEditableScene(state.scene);
  await page.locator('#undo').click();
  await page.waitForFunction(()=>window.__motionEditor?.undo===3);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.timeline.find(l=>l.id==='accent').end,20);
  await page.locator('#redo').click();
  await page.waitForFunction(()=>window.__motionEditor?.redo===3);
  assert.equal(serializeEditableScene((await page.evaluate(()=>window.__motionEditor)).scene),trimmedScene);
  await screenshot('trimmed-synthetic');
  await page.locator('.layer-button[data-layer="headline"]').click();
  // Existing nonlinear segment cannot be silently bisected by a new keyframe.
  await page.locator('#add-key').click();
  await page.waitForFunction(()=>window.__motionEditor?.blocked>=1);
  state=await page.evaluate(()=>window.__motionEditor);
  assert.equal(state.canvasDrags,1);
  const afterRejectSha=sha(serializeEditableScene(state.scene));
  const data=parseEditableScene(await readFile(store,'utf8'));
  assert.equal(sha(serializeEditableScene(data)),afterRejectSha);
  assert.equal(data.assets.length,0);
  // Browser-origin forged external material never leaves loopback or mutates disk.
  const rejectedMedia=await page.evaluate(async()=>{
   const scene=structuredClone(window.__motionEditor.scene);
   scene.assets=[{url:'https://example.invalid/synthetic-denied.png'}];
   const response=await fetch('/scene.json',{method:'POST',headers:{
    'Content-Type':'application/json','If-Match':window.__motionEditor.etag},body:JSON.stringify(scene)});
   return {status:response.status,body:await response.json()};
  });
  assert.equal(rejectedMedia.status,400);
  assert.equal(sha(await readFile(store)),afterRejectSha);
  // Another stale editor window must not overwrite newer scene state.
  const stale=await context.newPage();
  await stale.goto(service.url,{waitUntil:'load'});
  await stale.waitForFunction(()=>window.__motionEditor?.ready===true);
  const staleBefore=await stale.evaluate(()=>window.__motionEditor);
  await page.locator('#add-rect').click();
  await page.waitForFunction(()=>window.__motionEditor?.scene.layers.length===4);
  const winnerRaw=await readFile(store,'utf8');
  const winner=await page.evaluate(()=>window.__motionEditor);
  const conflictResponse=stale.waitForResponse(r=>r.url().endsWith('/scene.json')&&r.request().method()==='POST');
  await stale.locator('#layer-text').fill('Stale Synthetic Overwrite');
  await stale.locator('#save-appearance').click();
  await stale.waitForFunction(()=>window.__motionEditor?.blocked>=1);
  assert.equal((await conflictResponse).status(),409);
  const staleAfter=await stale.evaluate(()=>window.__motionEditor);
  assert.equal(staleAfter.commits,0);
  assert.deepEqual(staleAfter.scene,staleBefore.scene);
  assert.deepEqual(staleAfter.history,staleBefore.history);
  assert.equal(await readFile(store,'utf8'),winnerRaw);
  await screenshot('conflict-synthetic',stale);
  assert.match((await stale.evaluate(()=>window.__motionEditor.errors.at(-1))),/another editor|changed the local scene/i);
  assert.equal(parseEditableScene(await readFile(store,'utf8')).layers.length,4);
  // Close the tabs and recreate the service, proving reload from disk rather than UI history.
  await stale.close();
  await page.close();
  await new Promise(resolve=>service.server.close(resolve));
  service=await startEditorServer({port:0,sceneFile:store});
  page=await context.newPage();
  await page.goto(service.url,{waitUntil:'load'});await page.waitForFunction(()=>window.__motionEditor?.ready===true);
  const reopen=await page.evaluate(()=>window.__motionEditor);
  assert.equal(reopen.scene.layers.length,4);
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').text,'New Synthetic Headline');
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).ease,'ease-out-cubic');
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).scale,1.2);
  assert.ok(reopen.scene.layers.find(l=>l.id==='headline').keys.at(-1).x>.70);
  assert.equal(reopen.scene.layers.find(l=>l.id==='headline').start_frame,6);
  assert.deepEqual(reopen.scene,winner.scene);
  assert.equal(reopen.etag,winner.etag);
  assert.deepEqual(reopen.history,{undo:0,redo:0});
  assert.equal(reopen.scene.layers.find(l=>l.id==='accent').start_frame,11);
  assert.equal(reopen.scene.layers.find(l=>l.id==='accent').end_frame,19);
  assert.equal(browserErrors.filter(x=>x.startsWith('pageerror')).length,0,JSON.stringify(browserErrors));
  assert.equal(sha(serializeEditableScene(reopen.scene)),sha(serializeEditableScene(parseEditableScene(await readFile(store,'utf8')))));
  assert.deepEqual(outboundRequests,[],'Browser must never request external material');
  assert.equal(await page.locator('.clip[data-layer="headline"] .key-marker').count(),2);
  await screenshot('approved-synthetic');
  // Follow the original passing S1 flow with independent landscape/full-HD fixture proofs.
  // Each has a separate loopback server and new browser tab, never real media.
  const profileBrowserChecks=[];
  for(const [sourceWidth,sourceHeight] of [[640,360],[1080,1920],[1920,1080]]){
   const variant=structuredClone(first.scene);
   variant.canvas={width:sourceWidth,height:sourceHeight};
   const profileFile=join(temp,'profile-'+sourceWidth+'x'+sourceHeight+'.json');
   await writeFile(profileFile,serializeEditableScene(variant),'utf8');
   const profileServer=await startEditorServer({port:0,sceneFile:profileFile});
   let tab;
   try{
    tab=await context.newPage();
    await tab.goto(profileServer.url,{waitUntil:'load'});
    await tab.waitForFunction(()=>window.__motionEditor?.ready===true);
    const beforeProfile=await tab.evaluate(()=>window.__motionEditor);
    if(sourceWidth===640){
     // An empty S3 history must not send redundant saves, even via keyboard.
     assert.equal(await tab.locator('#undo').isDisabled(),true);
     assert.equal(await tab.locator('#redo').isDisabled(),true);
     await tab.locator('#status').click();
     await tab.keyboard.press('Control+z');
     await tab.keyboard.press('Control+y');
     assert.equal((await tab.evaluate(()=>window.__motionEditor)).commits,0);
     const input=tab.locator('#layer-text');
     await input.focus();await tab.keyboard.type(' typed');
     await tab.keyboard.press('Control+z');
     const afterNativeUndo=await tab.evaluate(()=>window.__motionEditor);
     assert.equal(afterNativeUndo.commits,0,'Input Ctrl+Z must not edit scene history');
     assert.deepEqual(afterNativeUndo.scene,beforeProfile.scene);
     await input.fill('Keyboard Synthetic Title');
     await tab.locator('#save-appearance').click();
     await tab.waitForFunction(()=>window.__motionEditor?.commits===1);
     assert.equal((await tab.evaluate(()=>window.__motionEditor)).scene.layers.find(x=>x.id==='headline').text,'Keyboard Synthetic Title');
     await tab.locator('#status').click();
     await tab.keyboard.press('Control+z');
     await tab.waitForFunction(()=>window.__motionEditor?.undo===1);
     assert.equal((await tab.evaluate(()=>window.__motionEditor)).scene.layers.find(x=>x.id==='headline').text,'Original Title');
     await tab.keyboard.press('Control+Shift+z');
     await tab.waitForFunction(()=>window.__motionEditor?.redo===1);
     assert.equal((await tab.evaluate(()=>window.__motionEditor)).scene.layers.find(x=>x.id==='headline').text,'Keyboard Synthetic Title');
     await tab.keyboard.press('Control+y');
     assert.equal((await tab.evaluate(()=>window.__motionEditor)).redo,1,'Empty redo must not save');
    }
    const view=beforeProfile.preview;
    assert.equal(view.profile,sourceWidth+'x'+sourceHeight);
    assert.equal(view.kind,'NEUTRAL_POSITION_PROXY_NOT_OFFICIAL_PIXELS');
    assert.equal(view.sourceWidth,sourceWidth);assert.equal(view.sourceHeight,sourceHeight);
    assert.equal(view.width/view.height,sourceWidth/sourceHeight);
    assert.equal(view.width,360);
    const aspect=sourceWidth/sourceHeight;
    assert.ok(Math.abs(view.height-(360/aspect))<1e-9);
    const domProfile=await tab.locator('#stage').evaluate(el=>({
     width:parseFloat(el.style.width),height:parseFloat(el.style.height)
    }));
    assert.equal(domProfile.width,view.width);assert.equal(domProfile.height,view.height);
    const label=await tab.locator('#profile-label').textContent();
    assert.ok(label.includes(sourceWidth+'x'+sourceHeight));
    const bbox=await tab.locator('#stage').boundingBox();
    assert.ok(bbox);
    const start=beforeProfile.sample;
    assert.equal(beforeProfile.selected,'headline');assert.ok(start);
    const centerX=bbox.x+1+start.x*view.width;
    const centerY=bbox.y+1+start.y*view.height;
    await tab.mouse.move(centerX,centerY);await tab.mouse.down();
    await tab.mouse.move(centerX+18,centerY+9,{steps:20});await tab.mouse.up();
    await tab.waitForFunction(()=>window.__motionEditor?.canvasDrags===1);
    const moved=await tab.evaluate(()=>window.__motionEditor);
    assert.ok(Math.abs(moved.sample.x-start.x-18/view.width)<0.015);
    assert.ok(Math.abs(moved.sample.y-start.y-9/view.height)<0.015);
    const stored=parseEditableScene(await readFile(profileFile,'utf8'));
    assert.deepEqual(stored,moved.scene);
    assert.deepEqual(stored.canvas,variant.canvas);
    assert.deepEqual(stored.assets,[]);
    const savedHash=sha(serializeEditableScene(stored));
    await tab.reload({waitUntil:'load'});
    await tab.waitForFunction(()=>window.__motionEditor?.ready===true);
    const reopened=await tab.evaluate(()=>window.__motionEditor);
    assert.deepEqual(reopened.scene,stored);
    assert.equal(reopened.preview.profile,view.profile);
    if(sourceWidth===1920||sourceWidth===1080)await screenshot('profile-'+sourceWidth+'x'+sourceHeight+'-synthetic',tab);
    profileBrowserChecks.push({profile:view.profile,display:[view.width,view.height],
     canvas_mouse_drag:true,normalized_scene_saved_and_reopened:true,sha256:savedHash});
   }finally{
    if(tab&&!tab.isClosed())await tab.close();
    await new Promise(resolve=>profileServer.server.close(resolve));
   }
  }
  assert.equal(profileBrowserChecks.length,3);
  assert.equal(browserErrors.filter(x=>x.startsWith('pageerror')).length,0,JSON.stringify(browserErrors));
  assert.deepEqual(outboundRequests,[],'Profile tests must remain local');
  const result={status:'PASS_USER_APPROVED_OPT_IN_EDITOR_SHELL_SYNTHETIC_ONLY',
   runtime:{platform:process.platform,node:process.version,browser_channel:channel,browser_version:browser.version(),headless,
    commit:testedCommit,event_commit:process.env.GITHUB_SHA||null,pr_head:process.env.MOTION_EDITOR_PR_HEAD||null},
   screenshots:artifacts.map(path=>path.split(/[\\/]/).at(-1)),
   app:'editor/',package:'konva@10.7.1',scope:'LOCAL_ONLY',
   saved_scene_sha256:sha(serializeEditableScene(reopen.scene)),
   layer_count:reopen.scene.layers.length,headline_clip:[6,28],headline_ease:'ease-out-cubic',
   timeline_pointer_actions:3,accent_clip:[11,19],real_pointer_trim_start:true,real_pointer_trim_end:true,
   external_media_response:rejectedMedia.status,stale_window_response:409,server_restart_reload:true,
   real_pointer_timeline_drag:true,real_pointer_canvas_drag:true,appearance_edit:true,
   individual_keyframe_numeric_values_saved:true,keyframe_markers_present:true,
   undo_redo:true,stale_editor_save_refused:true,eased_key_split_refused:true,reload:true,
   no_external_media:true,browser_external_requests:outboundRequests.length,official_canvas_ffmpeg_modified:false,
   s1_viewport_profile_checks:profileBrowserChecks,
   native_field_undo_preserved:true,ctrl_shift_z_redo_and_noop_history_verified:true,
   not_proven:['locked-font visual parity','Windows Premiere','private media rights','Bezier control points','commercial art approval']};
  await writeFile(join(out,'konva-editor-approved-synthetic-report.json'),JSON.stringify(result,null,2)+'\n');
  console.log('KONVA_EDITOR_APPROVED_SHELL_PROOF',JSON.stringify(result));
 }catch(error){
  if(page&&!page.isClosed())await page.screenshot({path:join(out,'konva-editor-failure-synthetic.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{
  if(context)await context.tracing.stop({path:join(out,'konva-editor-synthetic-trace.zip')}).catch(()=>{});
  if(browser)await browser.close();
  if(service)await new Promise(resolve=>service.server.close(resolve));
  await rm(temp,{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('KONVA_EDITOR_SHELL_FAILED',e.stack||String(e));process.exitCode=1});
