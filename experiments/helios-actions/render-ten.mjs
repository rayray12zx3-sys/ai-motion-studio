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
const playwrightModule=await import(pathToFileURL(req.resolve('playwright')).href);
const chromium=playwrightModule.chromium ?? playwrightModule.default?.chromium;
if(!chromium)throw Error('Cannot resolve Playwright chromium export');
const html=await readFile(path.join(here,'gallery.html'));
const definitions=JSON.parse(await readFile(path.join(here,'motion-recipes.json'))).effects;
if(definitions.length!==10||new Set(definitions.map(x=>x.id)).size!==10)throw Error('Need 10 distinct motion recipes');
const fontsDir=path.join(root,'node_modules/@fontsource/noto-sans-tc');
const out=path.join(root,'out/helios-ten');await mkdir(out,{recursive:true});
const fontCSS='chinese-traditional-700.css';
if(!existsSync(path.join(fontsDir,fontCSS)))throw Error('Missing pinned Traditional Chinese font stylesheet');
const server=createServer(async(request,response)=>{
 try {
   const uri=new URL(request.url,'http://localhost');let fp,type;
   if(uri.pathname==='/gallery'){response.writeHead(200,{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store'});response.end(html);return}
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
  // Ten qualitatively distinct, original synthetic animations.
  const specs=definitions.map(x=>({recipe:x.id,width:1280,height:720,fps:24,duration:2.5,suffix:''}));
  const previews=[];
 for(const spec of specs){
   const {recipe,width,height,fps,duration,suffix}=spec;
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const url=origin+'/gallery?recipe='+recipe;
   await page.goto(url,{waitUntil:'networkidle'});
   const loaded=await page.evaluate(async()=>{await document.fonts.ready;return(await document.fonts.load("700 70px 'Noto Sans TC'",'真的假的？！')).length>0});
   if(!loaded)throw Error('Pinned Noto Sans TC not loaded');
   const times=[.18,.61,1.24,1.86,2.23];
   const hashes=async ts=>{
      const a=[];for(const t of ts){await page.evaluate(t=>window.renderAt(t),t);a.push([t,crypto.createHash('sha256').update(await page.screenshot({omitBackground:true})).digest('hex')])}return a;
   };
   const forward=await hashes(times),reverse=await hashes([...times].reverse());
   if(JSON.stringify(forward)!==JSON.stringify([...reverse].reverse()))throw Error('Non-deterministic seek '+recipe);
   await page.close();
   const intermediate=path.join(out,recipe+suffix+'-intermediate.mov'),final=path.join(out,recipe+suffix+'-alpha.mov'),preview=path.join(out,recipe+'-preview.mp4');
   const renderer=new Renderer({width,height,fps,durationInSeconds:duration,
      mode:'dom',videoCodec:'qtrle',pixelFormat:'argb',intermediateImageFormat:'png',
      browserConfig:{headless:true,gpu:false}});
   await renderer.render(url,intermediate);
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',intermediate,
      '-an','-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le',final],{stdio:'pipe'});
   const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames',
      '-show_entries','stream=codec_name,profile,pix_fmt,width,height,nb_read_frames','-of','json',final],{encoding:'utf8'}));
   const st=probe.streams[0];
   const expectedFrames=Math.round(fps*duration);
   if(st.codec_name!=='prores'||st.profile!=='4444'||Number(st.nb_read_frames)!==expectedFrames
      ||st.width!==width||st.height!==height)
     throw Error('ProRes probe '+recipe+suffix+': '+JSON.stringify(st));
   const bytes=execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',final,
      '-vf','alphaextract','-pix_fmt','gray','-f','rawvideo','-'],{maxBuffer:200*1024*1024});
   if(bytes.length!==width*height*expectedFrames)
     throw Error('Decoded Alpha byte count mismatch: '+recipe+suffix);
   let min=255,max=0,opaque=0;
   const framePixels=width*height;
   const midFrame=Math.floor(expectedFrames/2),midOffset=midFrame*framePixels;
   let midVisible=0;
   for(let j=0;j<bytes.length;j++){
     const v=bytes[j];
     if(v<min)min=v;if(v>max)max=v;
     if(v>127){opaque++;if(j>=midOffset&&j<midOffset+framePixels)midVisible++}
   }
   if(midVisible<500)throw Error('Likely invisible title at middle frame '+recipe+suffix+': '+midVisible);
   let maxCorner=0;
   for(let frame=0;frame<expectedFrames;frame++){
     const off=frame*framePixels;
     for(const corner of [0,width-1,(height-1)*width,framePixels-1])
       if(bytes[off+corner]>maxCorner)maxCorner=bytes[off+corner];
   }
   if(maxCorner>10)throw Error('Alpha leaked to frame corners '+recipe+suffix+': '+maxCorner);
   if(min!==0||max!==255)throw Error('Alpha invalid '+recipe+': '+min+'/'+max);
   const result={recipe:recipe+suffix,width,height,fps,fontLoaded:loaded,seek:'PASS',frames:expectedFrames,codec:st.codec_name,profile:st.profile,
      pixelFormat:st.pix_fmt,alphaMin:min,alphaMax:max,visibleMidPixels:midVisible,opaquePixelCount:opaque,cornerAlphaMax:maxCorner,sha256:crypto.createHash('sha256').update(await readFile(final)).digest('hex')};
   result.recipeName=definitions.find(x=>x.id===recipe)?.name;
   result.technical='PASS';result.art='PENDING_HUMAN';result.premiere='NOT_TESTED';
   results.push(result);console.log('EFFECT_PASS '+recipe+' '+JSON.stringify(result));
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',final,
     '-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',preview],{stdio:'pipe'});
   previews.push(preview);
 }
 const playlist=previews.map(p=>'file '+JSON.stringify(p)).join('\n')+'\n';
  await writeFile(path.join(out,'preview-list.txt'),playlist);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(out,'preview-list.txt'),'-c','copy',path.join(out,'00_ten_motion_preview.mp4')],{stdio:'pipe'});
  await writeFile(path.join(out,'acceptance.json'),JSON.stringify({engine:'@helios-project/renderer',count:results.length,
    technical:'PASS',visual:'PENDING_HUMAN',premiere:'NOT_TESTED',all_synthetic:true,results},null,2)+'\n');
  console.log('ALL_TEN_MOTIONS_RENDERED '+results.length);
}finally{await browser.close();await new Promise(r=>server.close(r))}
