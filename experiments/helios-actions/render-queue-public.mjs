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
const out=path.join(root,'out/helios-e2e-queue');await mkdir(out,{recursive:true});
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
  // Public synthetic job only. Never accept private text in a public repo or Actions inputs.
  const queueName=process.env.PUBLIC_SYNTHETIC_JOB_FILE;
  if(typeof queueName!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.json$/.test(queueName))
    throw Error('Invalid public synthetic queue filename');
  const job=JSON.parse(await readFile(path.join(here,'e2e-public-jobs/queue',queueName)));
  if(job.job_id+'.json'!==queueName)throw Error('Job identity does not match immutable filename');
  const allowed=['schema_version','job_id','synthetic_public','effect_id','text','resolution','fps','duration_seconds','expected_output','art_approval','premiere_import'];
  if(Object.keys(job).length!==allowed.length || !allowed.every(k=>Object.hasOwn(job,k)))throw Error('invalid synthetic job schema');
  if(job.schema_version!==1 || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(job.job_id))throw Error('invalid job ID');
  if(job.synthetic_public!==true || job.effect_id!=='K09' || job.text!=='真的嗎？你確定？')throw Error('public test restricted to agreed synthetic text');
  if(job.resolution!=='1920x1080'||job.fps!==24||job.duration_seconds!==2.5)throw Error('wrong render specification');
  if(JSON.stringify(job.expected_output)!==JSON.stringify(['K09-alpha.mov','K09-preview.mp4']))throw Error('wrong output whitelist');
  if(job.art_approval!=='PENDING_HUMAN'||job.premiere_import!=='NOT_TESTED')throw Error('art/PR cannot be automatically approved');
  const specs=[{recipe:job.effect_id,width:1920,height:1080,fps:job.fps,duration:job.duration_seconds,suffix:''}];
  const previews=[];
 for(const spec of specs){
   const {recipe,width,height,fps,duration,suffix}=spec;
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   const url=origin+'/gallery?recipe='+recipe;
   await page.goto(url,{waitUntil:'networkidle'});
   const loaded=await page.evaluate(async()=>{
     const completeSample='不可能想清楚原來如此這才是重點太快等等想得美做得更美真的嗎你確定請看這裡還沒結束先注意現在開始？！／·';
     const ready=await document.fonts.load("700 90px 'Noto Sans TC'",completeSample);
     await document.fonts.ready;
     return ready.length>0;
   });
   if(!loaded)throw Error('Pinned Noto Sans TC not loaded');
   const times=[.18,.61,1.24,1.86,2.23];
   const hashes=async ts=>{
      const a=[];for(const t of ts){
        await page.evaluate(async t=>{
          window.renderAt(t);
          await document.fonts.ready;
          void document.body.offsetHeight;
          await new Promise(resolve=>requestAnimationFrame(resolve));
          await new Promise(resolve=>requestAnimationFrame(resolve));
        },t);
        a.push([t,crypto.createHash('sha256').update(await page.screenshot({omitBackground:true})).digest('hex')]);
      }return a;
   };
   const forward=await hashes(times),reverse=await hashes([...times].reverse());
   if(JSON.stringify(forward)!==JSON.stringify([...reverse].reverse())){
      console.error('SEEK_DIAGNOSTIC '+recipe,JSON.stringify({forward,reverse}));
      throw Error('Non-deterministic seek '+recipe);
    }
   const visibleText=await page.evaluate(()=>{
      return [...document.querySelectorAll('#stage > div')].map(x=>x.textContent).join('').replace(/·/g,'');
   });
   if(visibleText!==job.text)throw Error('rendered text does not match synthetic order');
   await page.evaluate(()=>window.renderAt(1.22));
   await page.screenshot({path:path.join(out,'K09-check.png'),omitBackground:true});
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
   result.job_id=job.job_id;
   result.synthetic_public=true;
   result.requested_text_verified=true;
   result.method='GitHub Actions push of one immutable synthetic job on isolated research branch';
   result.technical='PASS';result.art='PENDING_HUMAN';result.premiere='NOT_TESTED';
   results.push(result);console.log('EFFECT_PASS '+recipe+' '+JSON.stringify(result));
   execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',final,
     '-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',preview],{stdio:'pipe'});
   previews.push(preview);
 }
  await writeFile(path.join(out,'acceptance.json'),JSON.stringify({
    job_id:job.job_id,job_spec:{effect_id:job.effect_id,text:job.text,resolution:job.resolution,fps:job.fps,duration_seconds:job.duration_seconds},
    engine:'@helios-project/renderer@1.79.0',technical:'PASS',art:'PENDING_HUMAN',
    premiere:'NOT_TESTED',public_synthetic_only:true,results
  },null,2)+'\n');
  console.log('E2E_SYNTHETIC_TECH_PASS '+job.job_id);
}finally{await browser.close();await new Promise(r=>server.close(r))}
