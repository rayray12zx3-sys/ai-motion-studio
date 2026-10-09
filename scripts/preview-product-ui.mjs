// Synthetic-only public Concept UI preview. No private file inputs.
import {createCanvas} from '@napi-rs/canvas';
import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {drawProductUIFrame} from '../src/creative/product-ui.mjs';
import {drawSafeReviewGuide} from '../src/creative/social-safe-area.mjs';
import {fontFamily} from '../src/free/scene.mjs';

if(process.argv.length!==2)throw new Error('No private/source inputs permitted');
if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Node 24 required');
const input=JSON.parse(readFileSync('examples/product-ui-synthetic.json','utf8'));
if(input.origin!=='SYNTHETIC_CONCEPT_NOT_APP_RECORDING'||input.aspect!=='9:16'||input.fps!==30)
  throw new Error('Public synthetic review only');
const width=360,height=640,dir=resolve('out/product-ui-concept-review');
if(existsSync(dir))throw new Error('Output exists: will not overwrite');
mkdirSync(dir,{recursive:true});
const digest=b=>createHash('sha256').update(b).digest('hex');
const tiles=[],shots=[];
function composite(layer,guide=false){
 const image=createCanvas(width,height),ctx=image.getContext('2d');
 ctx.fillStyle='#E5EFEB';ctx.fillRect(0,0,width,height);
 ctx.drawImage(layer,0,0);
 if(guide)drawSafeReviewGuide(ctx,{width,height});
 ctx.font='13px '+fontFamily;ctx.fillStyle='#13292D';
 ctx.fillText('SYNTHETIC / NOT APP FOOTAGE',8,24,342);
 return image;
}
for(const scene of input.scenes){
 const target=join(dir,scene.mode+'.mp4');
 const args=['-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','rgba',
   '-video_size',width+'x'+height,'-framerate','30','-i','pipe:0','-an',
   '-c:v','libx264','-preset','ultrafast','-crf','20','-pix_fmt','yuv420p',
   '-movflags','+faststart',target];
 const child=spawn(ffmpeg,args,{stdio:['pipe','ignore','pipe']});
 let errors='';
 child.stderr.on('data',d=>{errors+=String(d).slice(0,1500);});
 const done=new Promise((yes,no)=>{
   child.on('error',no);child.on('close',code=>code===0?yes():no(new Error('Encoding failed '+code+' '+errors)));
 });
 const sampleFrames=[0,Math.floor(scene.frames*.25),Math.floor(scene.frames*.6),scene.frames-1];
 const samples=[];
 for(let f=0;f<scene.frames;f++){
   const frame=drawProductUIFrame({width,height},f,scene);
   if(sampleFrames.includes(f)){
     const png=frame.toBuffer('image/png');
     writeFileSync(join(dir,scene.mode+'-'+String(f).padStart(3,'0')+'.png'),png);
     samples.push({frame:f,sha256:digest(png)});
     tiles.push(composite(frame,true));
   }
   const image=composite(frame);
   const rgba=Buffer.from(image.getContext('2d').getImageData(0,0,width,height).data);
   if(!child.stdin.write(rgba))await once(child.stdin,'drain');
 }
 child.stdin.end();await done;
 shots.push({mode:scene.mode,frames:scene.frames,video_sha256:digest(readFileSync(target)),samples});
}
const sheet=createCanvas(360*3,640*4),ctx=sheet.getContext('2d');
for(let i=0;i<tiles.length;i++)ctx.drawImage(tiles[i],Math.floor(i/4)*360,(i%4)*640);
writeFileSync(join(dir,'contact-sheet-safe-guide.png'),sheet.toBuffer('image/png'));
writeFileSync(join(dir,'report.json'),JSON.stringify({
  kind:'SYNTHETIC_CONCEPT_NOT_NATIVE_APP',source_recording_used:false,
  video_profile:[width,height,30],platform_mask:'CONSERVATIVE_NOT_OFFICIAL',
  creative_qc:'PENDING_HUMAN_REVIEW',shots
},null,2)+'\n');
console.log(JSON.stringify({status:'SYNTHETIC_PREVIEW',shots:shots.map(s=>s.mode),dir}));
