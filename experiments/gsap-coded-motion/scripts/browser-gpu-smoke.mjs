/** Real browser WebGL/GLSL proof. No paid API or remote assets. */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const root=resolve(process.cwd());
const allowed={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server=createServer(async (req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    // Browser-owned icon request is not part of authored scene assets.
    if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const requested=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!(requested===root||requested.startsWith(root+sep))) {res.writeHead(403);res.end();return;}
    if(!allowed[extname(requested)]) {res.writeHead(403);res.end();return;}
    const bytes=await readFile(requested);
    res.writeHead(200,{'Content-Type':allowed[extname(requested)],'Cache-Control':'no-store'});res.end(bytes);
  }catch(error){res.writeHead(404);res.end('not found');}
});
await new Promise((accept)=>server.listen(0,'127.0.0.1',accept));
let browser;
try {
  const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
  const {access}=await import('node:fs/promises');
  let exe;
  for (const p of candidates)try{await access(p);exe=p;break;}catch{}
  if(!exe)throw new Error('No installed Chromium/Chrome on this runner; GPU proof NOT PASS');
  browser=await chromium.launch({executablePath:exe,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
  page.setDefaultTimeout(70000);
  const errors=[];const outside=[];const logs=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());else if(m.type()==='warning')logs.push(m.text())});
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))outside.push(r.url())});
  await page.goto(`http://127.0.0.1:${server.address().port}/examples/depth-field.html`,{waitUntil:'load'});
  await page.waitForFunction(()=>typeof window.seekFrame==='function',null,{timeout:70000});
  const audit=await page.evaluate(()=>window.threeAudit);
  if(!audit?.actualWebGL||!audit.shader||audit.frameCount!==300||audit.shots?.length!==2||audit.transitions?.length!==1)throw Error('Real WebGL/shader timeline not initialized');
  const samples=[];
  for (const frame of [0,133,143,151,299,143]) {
    const sample=await page.evaluate((n)=>{
      const s=window.seekFrame(n);
      if(s.shot.active.length<1||s.shot.active.length>2)throw Error('Invalid film coverage at '+n);
      if(n===143 && (!(s.shot.progress>0 && s.shot.progress<1) || s.shot.rigs.join(',')!=='mint,lavender'))throw Error('Shader handoff does not match shot contract');
      const layout=window.auditProtectedRegions();
      if(!layout.first.passed || !layout.second.passed)throw Error('Projected hero overlaps protected title/footer: '+JSON.stringify({n,layout}));
      const webgl=document.querySelector('canvas#view');
      const gl=webgl.getContext('webgl2');
      if(!gl)throw new Error('WebGL2 context missing');
      const er=gl.getError(); if(er!==gl.NO_ERROR)throw Error('WebGL error '+er+' at frame '+n);
      const reduced=document.createElement('canvas');reduced.width=90;reduced.height=160;
      const ctx=reduced.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(webgl,0,0,90,160);
      const bytes=Array.from(ctx.getImageData(0,0,90,160).data);
      let unique=new Set();for(let i=0;i<bytes.length;i+=4)unique.add(`${bytes[i]},${bytes[i+1]},${bytes[i+2]}`);
      return {frame:n,shaderProgress:s.shaderProgress,colors:unique.size,bytes,glVersion:gl.getParameter(gl.VERSION),glRenderer:gl.getParameter(gl.RENDERER)};
    },frame);
    const bytes=Uint8Array.from(sample.bytes);
    samples.push({frame,sha256:createHash('sha256').update(bytes).digest('hex'),distinctColors:sample.colors,glVersion:sample.glVersion,glRenderer:sample.glRenderer,shaderProgress:sample.shaderProgress});
    if(sample.colors<16)throw Error(`Frame ${frame} is flat (${sample.colors} distinct colors), rendering likely broken`);
  }
  if(samples[0].sha256===samples[2].sha256||samples[2].sha256===samples[4].sha256)throw Error('3D frames are not animated/differentiated');
  if(samples[2].sha256!==samples[5].sha256)throw Error('Full GPU pixel buffer not identical after out-of-order seeking');
  if(errors.length||outside.length)throw Error(`JS/console errors or external requests: ${JSON.stringify({errors,outside})}`);
  const screenshot=await page.screenshot({type:'png'});
  // A second original authored THREE-shot sequence exercises TWO separate real
  // WebGL shader handoffs and random-order replay with the same stage adapter.
  await page.goto('http://127.0.0.1:'+server.address().port+'/examples/depth-field.html?variation=three',{waitUntil:'load'});
  await page.waitForFunction(()=>typeof window.seekFrame==='function'&&window.threeAudit?.shots?.length===3,null,{timeout:70000});
  const threeAudit=await page.evaluate(()=>window.threeAudit);
  if(threeAudit.variation!=='three'||threeAudit.transitions.length!==2||threeAudit.rigCount!==3)throw Error('3-shot program not connected to GPU');
  const threeSamples=[];
  for(const n of [0,102,105,115,125,199,207,219,270,299,105,207]){
    const shot=await page.evaluate(frame=>{
      const s=window.seekFrame(frame),audit=window.auditProtectedRegions();
      if(!audit.rigChecks?.every(r=>r.passed))throw Error('3D hero overlaps protected film text at '+frame);
      const canvas=document.querySelector('canvas#view'),gl=canvas.getContext('webgl2');
      if(!gl||gl.getError()!==gl.NO_ERROR)throw Error('Invalid WebGL scene at '+frame);
      const reduced=document.createElement('canvas');reduced.width=70;reduced.height=125;
      const c=reduced.getContext('2d',{willReadFrequently:true});c.drawImage(canvas,0,0,70,125);
      const pixels=Array.from(c.getImageData(0,0,70,125).data),colors=new Set();
      for(let j=0;j<pixels.length;j+=4)colors.add(pixels[j]+':'+pixels[j+1]+':'+pixels[j+2]);
      return {active:s.shot.active,progress:s.shot.progress,colors:colors.size,pixels};
    },n);
    const sha256=createHash('sha256').update(Uint8Array.from(shot.pixels)).digest('hex');
    if(shot.colors<16)throw Error('Flat 3-shot GPU scene at frame '+n);
    threeSamples.push({frame:n,active:shot.active,progress:shot.progress,colors:shot.colors,sha256});
  }
  if(threeSamples[2].sha256!==threeSamples[10].sha256||threeSamples[6].sha256!==threeSamples[11].sha256)throw Error('3-shot pixel replay is not deterministic');
  if(threeSamples[1].active.length!==2||threeSamples[6].active.length!==2||threeSamples[9].active.length!==1)throw Error('3-shot timetable does not select GPU handoffs correctly');
  const threeFrame=await page.evaluate(()=>window.seekFrame(207));
  await mkdir('out',{recursive:true});
  await writeFile('out/three-3shot-frame207.png',await page.screenshot({type:'png'}));
  await writeFile('out/three-3shot-audit.json',JSON.stringify({realWebGL:true,shotCount:3,shaderHandoffs:2,audit:threeAudit,samples:threeSamples,frame207:threeFrame,source:'original 3-shot research, not visual approval'},null,2));
  await mkdir('out',{recursive:true});await writeFile('out/three-frame-143.png',screenshot);
  const report={realWebGL:true,shaderTransitionTested:true,renderProfile:{width:1080,height:1920,fps:30,frames:300},chrome:exe,audit,frames:samples,consoleWarnings:logs,externalRequests:outside,jsErrors:errors,source:'original R&D, not a creative acceptance'};
  await writeFile('out/three-gpu-audit.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({GPU_BROWSER_PASS:true,THREE_SHOT_BROWSER_PASS:true,frames:samples.map(({frame,sha256,distinctColors})=>({frame,sha256:sha256.slice(0,14),distinctColors})),warnings:logs}));
} finally {await browser?.close();await new Promise(r=>server.close(r));}
