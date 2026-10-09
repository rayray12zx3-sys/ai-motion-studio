// Offline only: one original 120f Product-UI motion study, never native App UI.
import ffmpeg from 'ffmpeg-static';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily} from '../src/free/scene.mjs';
import {drawSafeReviewGuide} from '../src/creative/social-safe-area.mjs';
import {drawProductUIChoreographyFrame,CHOREOGRAPHY_FRAMES}
 from '../src/creative/product-ui-choreography.mjs';
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';

if(process.argv.length!==2)throw new Error('No external/private inputs permitted');
if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Node 24 required');
const p={width:540,height:960,fps:30,frames:CHOREOGRAPHY_FRAMES};
const folder=resolve('out/product-ui-choreography-review');
if(existsSync(folder))throw new Error('Do not overwrite an existing visual review');
mkdirSync(folder,{recursive:true});
const dig=x=>createHash('sha256').update(x).digest('hex');
function composite(alpha,{guide=false}={}){
 const canvas=createCanvas(p.width,p.height),ctx=canvas.getContext('2d');
 ctx.fillStyle='#E8EDEA';ctx.fillRect(0,0,p.width,p.height);
 ctx.drawImage(alpha,0,0);
 if(guide)drawSafeReviewGuide(ctx,p);
 ctx.font='16px '+fontFamily;ctx.fillStyle='#153136';
 ctx.fillText('MOTION CHOREOGRAPHY / SYNTHETIC UI',17,36,503);
 ctx.font='12px '+fontFamily;
 ctx.fillText('NOT NATIVE APP FOOTAGE',17,65,503);
 return canvas;
}
const outfile=join(folder,'choreography-4s.mp4');
const ff=spawn(ffmpeg,['-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','rgba',
 '-video_size','540x960','-framerate','30','-i','pipe:0','-an',
 '-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',
 '-movflags','+faststart',outfile],{stdio:['pipe','ignore','pipe']});
let err='';
ff.stderr.on('data',b=>{err+=String(b).slice(0,1500);});
const promise=new Promise((resolveDone,reject)=>{
 ff.on('error',reject);ff.on('close',code=>code===0?resolveDone():reject(new Error('Encoder failure '+code+' '+err.slice(-1600))));
});
const frames=[0,12,24,33,45,55,63,74,86,98,108,119];
const tiles=[],hashes=[];
for(let f=0;f<CHOREOGRAPHY_FRAMES;f++){
 const rendered=drawProductUIChoreographyFrame(p,f);
 if(frames.includes(f)){
   const png=rendered.toBuffer('image/png');
   writeFileSync(join(folder,'frame-'+String(f).padStart(3,'0')+'.png'),png);
   hashes.push({frame:f,sha256:dig(png)});
   tiles.push(composite(rendered,{guide:true}));
 }
 const canvas=composite(rendered);
 const bytes=Buffer.from(canvas.getContext('2d').getImageData(0,0,p.width,p.height).data);
 if(!ff.stdin.write(bytes))await once(ff.stdin,'drain');
}
ff.stdin.end();await promise;
const tileW=270,tileH=480,cols=4,rows=3;
const sheet=createCanvas(cols*tileW,rows*tileH),ctx=sheet.getContext('2d');
tiles.forEach((image,i)=>ctx.drawImage(image,(i%cols)*tileW,
 Math.floor(i/cols)*tileH,tileW,tileH));
writeFileSync(join(folder,'choreography-contact-sheet.png'),sheet.toBuffer('image/png'));
writeFileSync(join(folder,'review-report.json'),JSON.stringify({
 kind:'ORIGINAL_PRODUCT_UI_CHOREOGRAPHY_NO_NATIVE_APP',
 duration_frames:CHOREOGRAPHY_FRAMES,seconds:4,video_profile:p,
 app_source_used:false,script_brand_copy_used:false,private_assets_used:false,
 platform_mask:'GENERIC_SAFE_RECT_ONLY_PRIVATE_RGBA_AUDIT_PENDING',
 creative_qc:'PENDING_HUMAN_REVIEW',commercial_release:'NOT_APPROVED',
 mp4_sha256:dig(readFileSync(outfile)),frame_hashes:hashes
},null,2)+'\n');
console.log(JSON.stringify({status:'SYNTHETIC_PRODUCT_UI_PREVIEW',frames:CHOREOGRAPHY_FRAMES,
 duration_seconds:4,mp4_sha256:dig(readFileSync(outfile))}));
