import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const rendererRoot=process.env.HELIOS_INSTALL_DIR||path.join(os.tmpdir(),'helios-install');
const req=createRequire(path.join(rendererRoot,'package.json'));
const {Renderer}=await import(pathToFileURL(req.resolve('@helios-project/renderer')).href);
const {chromium}=await import(pathToFileURL(req.resolve('playwright')).href);
const html=await readFile(path.join(here,'composition.html'));
const fontsDir=path.join(root,'node_modules/@fontsource/noto-sans-tc');
const out=path.join(root,'out/helios-ci');await mkdir(out,{recursive:true});
const fontCSS='chinese-traditional-700.css';
if(!existsSync(path.join(fontsDir,fontCSS)))throw Error('Missing pinned Traditional Chinese font stylesheet');
const server=createServer(async(request,response)=>{
 try {
   const uri=new URL(request.url,'http://localhost');let fp,type;
   if(uri.pathname==='/composition'){response.writeHead(200,{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'});response.end(html);return}
   if(uri.pathname==='/fonts/'+fontCSS){fp=path.join(fontsDir,fontCSS);type='text/css'}
   else if(uri.pathname.startsWith('/fonts/files/')){
     const file=path.basename(uri.pathname);
     if(!/^[A-Za-z0-9_.-]+[.]woff2?$/.test(file))throw Error('bad filename');
     fp=path.join(fontsDir,'files',file);type='font/woff2';
   }else{response.writeHead(404);response.end();return}
   response.writeHead(200,{'Content-Type':type});response.end(await readFile(fp));
 }catch(e){response.writeHead(404);response.end('not found')}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--disable-gpu']});
const results=[];
try{
 for(const recipe of ['K01','K09','K19']){
   const page=await browser.newPage({viewport:{width:640,height:360},deviceScaleFactor:1});
   const url=origin+'/composition?recipe='+recipe;
   await page.goto(url,{waitUntil:'networkidle'});
   const loaded=await page.evaluate(async()=>{await document.fonts.ready;return(await document.fonts.load("700 70px 'Noto Sans TC'",'真的假的？！')).length>0});
   if(!loaded)throw Error('Pinned Noto Sans TC not loaded');
   const times=[.18,.61,1.24];
   const hashes=async ts=>{
      const a=[];for(const t of ts){await page.evaluate(t=>window.renderAt(t),t);a.push([t,crypto.createHash('sha256').update(await page.screenshot({omitBackground:true})).digest('hex')])}return a;
   };
   const forward=await hashes(times),reverse=await hashes([...times].reverse());
   if(JSON.stringify(forward)!==JSON.stringify([...reverse].reverse()))throw Error('Non-deterministic seek '+recipe);
   await page.close();
   const intermediate=path.join(out,recipe+'-intermediate.mov'),final=path.join(out,recipe+'-alpha.mov');
   const renderer=new Renderer({width:640,height:360,fps:24,durationInSeconds:1.5,
      mode:'dom',videoCodec:'qtrle',pixelFormat:'argb',intermediateImageFormat:'png',
      browserConfig:{headless:true,gpu:false}});
   await renderer.render(url,intermediate);
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',intermediate,
      '-an','-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le',final],{stdio:'pipe'});
   const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames',
      '-show_entries','stream=codec_name,profile,pix_fmt,width,height,nb_read_frames','-of','json',final],{encoding:'utf8'}));
   const st=probe.streams[0];
   if(st.codec_name!=='prores'||st.profile!=='4444'||Number(st.nb_read_frames)!==36)throw Error('ProRes probe '+recipe+': '+JSON.stringify(st));
   const bytes=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',final,
      '-vf','alphaextract','-pix_fmt','gray','-f','rawvideo','-'],{maxBuffer:30*1024*1024});
   let min=255,max=0;
   for(let j=0;j<bytes.length;j++){if(bytes[j]<min)min=bytes[j];if(bytes[j]>max)max=bytes[j]}
   if(min!==0||max!==255)throw Error('Alpha invalid '+recipe+': '+min+'/'+max);
   const result={recipe,fontLoaded:loaded,seek:'PASS',frames:36,codec:st.codec_name,profile:st.profile,
      pixelFormat:st.pix_fmt,alphaMin:min,alphaMax:max,sha256:crypto.createHash('sha256').update(await readFile(final)).digest('hex')};
   results.push(result);console.log(recipe,'PASS',JSON.stringify(result));
 }
 await writeFile(path.join(out,'acceptance.json'),JSON.stringify({engine:'@helios-project/renderer',
   technical:'PASS',visual:'PENDING_HUMAN',premiere:'NOT_TESTED',results},null,2)+'\n');
}finally{await browser.close();await new Promise(r=>server.close(r))}
