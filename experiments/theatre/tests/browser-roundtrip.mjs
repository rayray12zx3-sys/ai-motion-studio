// Public synthetic-only M10 acceptance: real Chromium DOM edit/export -> Theatre Core -> Canvas.
// Uses Node 24's built-in WebSocket and the verified Ubuntu hosted-runner Chrome.
// No Playwright download, secret, company asset, external HTTP source or paid runtime.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import theatre from '@theatre/core';
import {createKeyframedCanvasRenderer} from '../src/canvas-renderer.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const privateDir=mkdtempSync(join(tmpdir(),'m10-chromium-'));
const downloadDir=join(privateDir,'downloads');
mkdirSync(downloadDir);
const outputDir=join(root,'out','browser-qa');
mkdirSync(outputDir,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(fn,label,timeout=18000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){
    try{const value=await fn();if(value)return value;}catch{}
    await sleep(150);
  }
  throw new Error('Timed out: '+label);
}
let chrome,server,ws;
const browserFaults=[];
const pending=new Map();
let nextId=0;
async function send(method,params={}){
  const id=++nextId;
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timed out: '+method));},15000);
    pending.set(id,{resolve,reject,timeout});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evaluate(expression){
  const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw new Error('Browser JS error: '+JSON.stringify(result.exceptionDetails));
  return result.result?.value;
}
async function click(selector){
  const coords=await evaluate("(()=>{const e=document.querySelector("+JSON.stringify(selector)+");if(!e)throw Error('Missing control');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  assert.ok(Number.isFinite(coords.x)&&Number.isFinite(coords.y));
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:coords.x,y:coords.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:coords.x,y:coords.y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:coords.x,y:coords.y,button:'left',clickCount:1});
}
async function setKeyframe(frame,value){
  await evaluate("(()=>{const seek=document.querySelector('#seek');seek.value="+JSON.stringify(String(frame))+";seek.dispatchEvent(new Event('input',{bubbles:true}));const x=document.querySelector('#keyframe-x');x.value="+JSON.stringify(String(value))+";x.dispatchEvent(new Event('input',{bubbles:true}));})()");
  await click('#set-keyframe');
  const status=await evaluate("document.querySelector('#edit-status').textContent");
  assert.ok(status.includes('Keyframe x='+value+' @ frame '+frame),status);
}
try{
  const chromeBinary=process.env.CHROME_BIN||'/usr/bin/google-chrome';
  server=spawn(process.execPath,[join(root,'scripts','serve.mjs')],{cwd:root,stdio:'pipe'});
  await waitFor(async()=>{
    const response=await fetch('http://127.0.0.1:4178/');
    return response.ok;
  },'local editor HTTP server');
  chrome=spawn(chromeBinary,[
    '--headless=new','--no-sandbox','--disable-dev-shm-usage',
    '--remote-allow-origins=*','--remote-debugging-port=0',
    '--user-data-dir='+privateDir,'about:blank'
  ],{stdio:'pipe'});
  const activePort=join(privateDir,'DevToolsActivePort');
  await waitFor(()=>existsSync(activePort),'Chrome DevTools port');
  const port=Number(readFileSync(activePort,'utf8').split('\n')[0]);
  assert.ok(port>0&&port<65536);
  const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  const page=targets.find(item=>item.type==='page');
  assert.ok(page?.webSocketDebuggerUrl,'Browser page CDP endpoint missing');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener('open',resolve,{once:true});
    ws.addEventListener('error',reject,{once:true});
  });
  ws.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown')
      browserFaults.push(JSON.stringify(message.params?.exceptionDetails||{}).slice(0,1800));
    if(message.method==='Runtime.consoleAPICalled'&&message.params?.type==='error')
      browserFaults.push(JSON.stringify(message.params?.args||[]).slice(0,1800));
    if(!message.id)return;
    const task=pending.get(message.id);if(!task)return;
    pending.delete(message.id);clearTimeout(task.timeout);
    if(message.error)task.reject(new Error('CDP '+message.error.message));
    else task.resolve(message.result||{});
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir,eventsEnabled:true});
  await send('Page.navigate',{url:'http://127.0.0.1:4178/'});
  try{
    await waitFor(async()=>await evaluate("document.body?.dataset?.theatreReady==='true'"),'Theatre Studio page readiness');
  }catch(error){
    const details=await evaluate("({url:location.href,readyState:document.readyState,bodyLoaded:!!document.body,hasButton:!!document.querySelector('#set-keyframe'),theatreReady:document.body?.dataset?.theatreReady,card:document.querySelector('#card')?.outerHTML})").catch(e=>({evaluationError:String(e)}));
    console.error('M10_BROWSER_STARTUP_DIAGNOSTICS',JSON.stringify({details,browserFaults}));
    try{
      const failedShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      writeFileSync(join(outputDir,'startup-failure.png'),Buffer.from(failedShot.data,'base64'));
    }catch{}
    throw error;
  }
  // Inspect the actual Theatre Studio UI through Chromium's real DOM.
  // This is a native-interface *probe*, not a claim that native dragging is proven.
  // Do not silently count our own #set-keyframe button as a Studio UI control.
  const nativeProbe=await evaluate(`(()=>{
    const found=[];
    const walk=(root,depth)=>{
      if(depth>5)return;
      for(const el of root.querySelectorAll('*')){
        if(el.shadowRoot)walk(el.shadowRoot,depth+1);
        if(el.textContent?.trim()!=='Practice Card')continue;
        const rect=el.getBoundingClientRect();
        if(rect.width<3||rect.height<3||rect.width>400||rect.height>100)continue;
        const cs=getComputedStyle(el);
        if(cs.visibility==='hidden'||cs.display==='none')continue;
        found.push({
          tag:el.tagName,
          className:typeof el.className==='string'?el.className.slice(0,100):'',
          id:el.id?.slice(0,80),
          left:Math.round(rect.left),top:Math.round(rect.top),
          width:Math.round(rect.width),height:Math.round(rect.height),
          outer:el.outerHTML.slice(0,380)
        });
      }
    };
    walk(document,0);
    return found.slice(0,30);
  })()`);
  console.log('M10_NATIVE_STUDIO_OUTLINE_PROBE',JSON.stringify(nativeProbe));
  await setKeyframe(15,60);
  await setKeyframe(45,-60);
  const image=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  writeFileSync(join(outputDir,'theatre-browser.png'),Buffer.from(image.data,'base64'));
  await click('#export');
  const exportPath=join(downloadDir,'m10-state.json');
  await waitFor(()=>existsSync(exportPath)&&readFileSync(exportPath).length>100,'Studio Export JSON download');
  const state=JSON.parse(readFileSync(exportPath,'utf8'));
  const track=state?.sheetsById?.Canvas?.sequence?.tracksByObject?.['Practice Card'];
  assert.ok(track?.trackIdByPropPath?.['["x"]'],'Studio export lacks x track');
  const xTrack=track.trackData[track.trackIdByPropPath['["x"]']];
  for(const [position,value] of [[0.5,60],[1.5,-60]]){
    assert.ok(xTrack.keyframes.some(k=>Math.abs(k.position-position)<1e-6&&k.value===value),
      'Missing genuine exported keyframe at '+position+'s');
  }
  const project=theatre.getProject('M10 Browser Export Core Probe',{state});
  const sheet=project.sheet('Canvas');
  const card=sheet.object('Practice Card',{
    x:theatre.types.number(0,{range:[-200,200]}),
    opacity:theatre.types.number(1,{range:[0,1]}),
    rotation:theatre.types.number(0,{range:[-180,180]}),
    scale:theatre.types.number(1,{range:[0.5,2]})
  });
  await project.ready;
  for(const [frame,value] of [[15,60],[45,-60]]){
    sheet.sequence.position=frame/30;
    assert.equal(card.value.x,value,'Core did not read Studio exported keyframe '+frame);
  }
  const render=await createKeyframedCanvasRenderer({
    state,projectId:'M10 Exported Browser Canvas',
    background:'transparent',placement:'lower-third'
  });
  const profile={width:360,height:640,fps:30,frames:91};
  const f15=render(profile,15).toBuffer('image/png');
  const f45=render(profile,45).toBuffer('image/png');
  assert.notDeepEqual(f15,f45,'Edited frames must differ');
  render(profile,75);
  assert.deepEqual(render(profile,15).toBuffer('image/png'),f15,'Random access must be deterministic');
  const canvas=render(profile,15);
  const pixels=canvas.getContext('2d').getImageData(0,0,360,640).data;
  let upper=0,lower=0;
  for(let y=0;y<640;y++)for(let x=0;x<360;x++){
    const alpha=pixels[(y*360+x)*4+3];
    if(y<270&&alpha>0)upper++;
    if(y>320&&alpha>0)lower++;
  }
  assert.equal(upper,0,'Non-overlay top area must stay transparent');
  assert.ok(lower>500,'Lower-third alpha was blank');
  // Select an actual Theatre Studio Outline row through Chromium pointer events,
  // not through the synthetic #set-keyframe control or direct Studio API.
  const nativeRow=await evaluate(`(()=>{
    const roots=[document];
    for(let i=0;i<roots.length;i++)for(const el of roots[i].querySelectorAll('*'))
      if(el.shadowRoot)roots.push(el.shadowRoot);
    const rows=roots.flatMap(root=>[...root.querySelectorAll('[data-header="true"]')]);
    const row=rows.find(el=>el.textContent?.trim()==='Practice Card');
    if(!row)return null;
    const rect=row.getBoundingClientRect();
    return {x:rect.x+rect.width/2,y:rect.y+rect.height/2,
      width:rect.width,height:rect.height};
  })()`);
  assert.ok(nativeRow?.width>5&&nativeRow?.height>5,
    'The native Theatre Studio Outline object row is absent');
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',
    x:nativeRow.x,y:nativeRow.y});
  await send('Input.dispatchMouseEvent',{type:'mousePressed',
    x:nativeRow.x,y:nativeRow.y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',
    x:nativeRow.x,y:nativeRow.y,button:'left',clickCount:1});
  const nativeSelected=await waitFor(async()=>await evaluate(`(()=>{
    const roots=[document];
    for(let i=0;i<roots.length;i++)for(const el of roots[i].querySelectorAll('*'))
      if(el.shadowRoot)roots.push(el.shadowRoot);
    const row=roots.flatMap(root=>[...root.querySelectorAll('[data-header="true"]')])
      .find(el=>el.textContent?.trim()==='Practice Card');
    return !!row&&!row.classList.contains('not-selected');
  })()`),'Theatre native Outline selection');
  assert.equal(nativeSelected,true);
  const selectedImage=await send('Page.captureScreenshot',{format:'png',
    captureBeyondViewport:false});
  writeFileSync(join(outputDir,'native-studio-outline-selected.png'),
    Buffer.from(selectedImage.data,'base64'));
  // Locate the native time-sequence elements before attempting real drag.
  // Diagnostics are synthetic-only and deliberately avoid recording browser storage.
  const nativeTimelineGeometry=await evaluate(`(()=>{
    const roots=[document];const inspected=[];
    for(let i=0;i<roots.length;i++){
      for(const el of roots[i].querySelectorAll('*'))
        if(el.shadowRoot)roots.push(el.shadowRoot);
    }
    const selectors=[
      '[class*="keyframe" i]','[data-testid*="keyframe" i]',
      '[aria-label*="keyframe" i]','[title*="keyframe" i]',
      '[data-testid*="timeline" i]','[class*="timeline" i]',
      '[data-testid*="sequence" i]','[class*="sequence" i]'
    ];
    for(const root of roots)for(const el of root.querySelectorAll(selectors.join(','))){
      const rect=el.getBoundingClientRect();
      if(rect.width<2||rect.height<2||rect.bottom<0||rect.top>innerHeight)continue;
      inspected.push({
        tag:el.tagName,
        className:typeof el.className==='string'?el.className.slice(0,110):'',
        role:el.getAttribute('role'),
        aria:el.getAttribute('aria-label'),
        title:el.getAttribute('title'),
        testid:el.getAttribute('data-testid'),
        rect:[Math.round(rect.x),Math.round(rect.y),Math.round(rect.width),Math.round(rect.height)],
        outer:el.outerHTML.slice(0,330)
      });
    }
    return inspected.slice(0,90);
  })()`);
  console.log('M10_NATIVE_TIMELINE_GEOMETRY',JSON.stringify(nativeTimelineGeometry));
  const nativeTimelineHit=await evaluate(`(()=>{
    const hits=[];
    for(const [x,y] of [[344,350],[344,322],[312,350],[376,350],[248,350]]){
      const chain=[];let root=document;let node;
      for(let level=0;level<8;level++){
        node=root.elementFromPoint?.(x,y);
        if(!node)break;
        const bbox=node.getBoundingClientRect();
        chain.push({tag:node.tagName,cls:typeof node.className==='string'?node.className:node.className?.baseVal,
          text:node.textContent?.trim().slice(0,55),
          box:[Math.round(bbox.x),Math.round(bbox.y),Math.round(bbox.width),Math.round(bbox.height)],
          html:node.outerHTML.slice(0,400)});
        if(!node.shadowRoot)break;root=node.shadowRoot;
      }
      const ancestors=[];
      for(let p=node,n=0;p&&n<4;p=p.parentElement,n++)ancestors.push({tag:p.tagName,
         cls:typeof p.className==='string'?p.className:p.className?.baseVal,html:p.outerHTML.slice(0,200)});
      hits.push({x,y,chain,ancestors});
    }
    return {viewport:[innerWidth,innerHeight],hits};
  })()`);
  console.log('M10_NATIVE_TIMELINE_HIT_TEST',JSON.stringify(nativeTimelineHit));
  const report={
    result:'PASS',test:'Actual headless Chromium edit+export -> Core -> Canvas',
    edited_keyframes:[{frame:15,x:60},{frame:45,x:-60}],
    imported_export:true,native_studio_outline_selected:true,alpha_upper_nonzero:upper,alpha_lower_nonzero:lower,
    deterministic_random_access:true,
    export_sha256:createHash('sha256').update(readFileSync(exportPath)).digest('hex')
  };
  writeFileSync(join(outputDir,'browser-qa.json'),JSON.stringify(report,null,2)+'\n');
  console.log('M10_REAL_BROWSER_ROUNDTRIP_PASS '+JSON.stringify(report));
}finally{
  if(ws){try{ws.close();}catch{}}
  for(const child of [chrome,server]){if(child&&child.exitCode===null)child.kill('SIGTERM');}
  try{
    rmSync(privateDir,{recursive:true,force:true,maxRetries:8,retryDelay:200});
  }catch(cleanupError){
    // Do not hide the original browser failure with an asynchronous Chromium
    // profile cleanup race on a GitHub-hosted runner.
    console.warn('Chrome temporary profile cleanup deferred:',String(cleanupError));
  }
}
