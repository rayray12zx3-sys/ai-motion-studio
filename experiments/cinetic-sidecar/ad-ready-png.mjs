// Optional lossless transparent animation deliverable for original in-house vector ads.
// Output PNG frames are royalty-free still-image interchange, not a guarantee about
// independent footage, client media, editor licences, or all jurisdictional patents.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import ffmpeg from 'ffmpeg-static';
import {normalizeDirectorPlan} from './adapter.mjs';
const SHA=x=>createHash('sha256').update(x).digest('hex');

export function pngHeader(buf) {
 if(buf.length<26||!buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||
    buf.toString('ascii',12,16)!=='IHDR')throw Error('not PNG with IHDR');
 return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),
   depth:buf[24],colorType:buf[25]};
}

export function exportTransparentPngSequence(renderDirectory,newOutputDirectory) {
 const render=resolve(renderDirectory),out=resolve(newOutputDirectory);
 if(existsSync(out))throw Error('refuse to overwrite existing PNG delivery');
 const input=JSON.parse(readFileSync(join(render,'validated-plan.json'),'utf8'));
 const plan=normalizeDirectorPlan(input);
 if(plan.direction.visualMotif!=='ad-film'||plan.contentClass!=='public-synthetic')
   throw Error('PNG commercial-interchange pilot is for original public ad-film only');
 const technical=JSON.parse(readFileSync(join(render,'technical-report.json'),'utf8'));
 if(technical.status!=='SYNTHETIC_RENDER_TECHNICAL_QA_PASS_NOT_ART_APPROVAL')
   throw Error('real full decoder technical report required');
 const {width,height,fps,frames}=plan.render;
 if(technical.render.width!==width||technical.render.height!==height||
    technical.render.fps!==fps||technical.render.frames!==frames)
   throw Error('verified media frame geometry mismatch');
 const source=join(render,'overlay-alpha.mov');
 if(!existsSync(source)||!technical.alpha?.sha256||SHA(readFileSync(source))!==technical.alpha.sha256)
   throw Error('alpha MOV byte hash does not match real media QA');
 mkdirSync(out,{recursive:false});
 const pattern=join(out,'frame-%06d.png');
 // No shell, no third-party font or bitmap, no interpolated/drop-frame conversion.
 execFileSync(ffmpeg,[
   '-nostdin','-hide_banner','-loglevel','error','-i',source,
   '-map','0:v:0','-fps_mode','passthrough','-pix_fmt','rgba',
   '-compression_level','5','-start_number','0',pattern
 ],{encoding:'utf8',timeout:12*60*1000,maxBuffer:1024*1024});
 const names=readdirSync(out).filter(n=>/^frame-\d{6}\.png$/.test(n)).sort();
 if(names.length!==frames)throw Error('missing PNG frames: '+names.length+' vs '+frames);
 const entries=[];
 for(let i=0;i<frames;i++){
   const name='frame-'+String(i).padStart(6,'0')+'.png';
   if(names[i]!==name)throw Error('PNG frame sequence is not contiguous at '+i);
   const bytes=readFileSync(join(out,name)),h=pngHeader(bytes);
   if(h.width!==width||h.height!==height||h.depth!==8||h.colorType!==6)
     throw Error('PNG is not lossless 8-bit RGBA geometry at frame '+i);
   entries.push({frame:i,name,bytes:bytes.length,sha256:SHA(bytes)});
 }
 // Decode the whole image sequence again, not merely PNG magic/header.
 execFileSync(ffmpeg,[
   '-nostdin','-hide_banner','-loglevel','error','-start_number','0',
   '-framerate',String(fps),'-i',pattern,'-frames:v',String(frames),
   '-f','null','-'
 ],{encoding:'utf8',timeout:12*60*1000,maxBuffer:1024*1024});
 const samples=[0,Math.floor(frames/2),frames-1];
 for(const n of samples){
   const filename=join(out,'frame-'+String(n).padStart(6,'0')+'.png');
   const pixels=execFileSync(ffmpeg,['-nostdin','-loglevel','error','-i',filename,
     '-frames:v','1','-pix_fmt','rgba','-f','rawvideo','pipe:1'],
     {maxBuffer:width*height*4+65536,timeout:120000});
   if(pixels.length!==width*height*4)throw Error('decoded RGBA frame wrong length');
   let transparent=false,visible=false;
   for(let i=3;i<pixels.length;i+=4){
     if(pixels[i]===0)transparent=true;
     if(pixels[i]>0)visible=true;
     if(transparent&&visible)break;
   }
   if(!transparent||!visible)throw Error('both real visible and transparent alpha required at '+n);
 }
 const manifest={
  schema:'cinetic-original-vector-rgba-png-sequence-v1',
  origin:'ORIGINAL_PROJECT_AUTHORED_ART_ONLY_NO_EXTERNAL_MEDIA',
  render:{width,height,fps,frames,seconds:frames/fps},
  mediaSha256:technical.alpha.sha256,
  sourcePlanSha256:SHA(readFileSync(join(render,'validated-plan.json'))),
  format:'PNG_RGBA_8_BIT_LOSSLESS',
  deliveredFrames:frames,
  files:entries,
  review:'LOSSLESS_ALPHA_TECHNICAL_PASS_NOT_HUMAN_ART_APPROVAL',
  commercial:'MUST_CHECK_ONLY_ACTUALLY_USED_ASSETS_AND_DISTRIBUTION',
  attribution:'NO_VIDEO_ATTRIBUTION_DEPENDENCY_IN_ORIGINAL_VECTOR_SCENE__SOFTWARE_FONT_NOTICE_IF_REDISTRIBUTED'
 };
 writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 return {status:'ORIGINAL_RGBA_PNG_SEQUENCE_FULL_DECODE_TECH_PASS_NOT_AD_APPROVAL',frames,
    manifestSha256:SHA(readFileSync(join(out,'manifest.json'))),output:out};
}
