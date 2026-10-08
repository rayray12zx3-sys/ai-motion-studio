// Image-only quick review, independent of FFmpeg and GitHub Actions.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdirSync,existsSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {drawAdvancedFrame,loadAdvancedArt,validateAdvancedSpec} from '../src/creative/advanced.mjs';
import {compileMotionBrief} from '../src/creative/brief.mjs';
import {fontFamily} from '../src/free/scene.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const profileName=process.argv[2]??'landscape';
const profiles={landscape:[640,360],vertical:[360,640]};
if(process.argv.length>5 || !Object.hasOwn(profiles,profileName)){
  throw new Error('Usage: node scripts/preview-advanced.mjs landscape|vertical [preview-label] [examples/brief-*.json]');
}
const name=process.argv[3]??'preview-advanced-'+profileName;
if(!/^preview-[a-z0-9][a-z0-9-]{0,45}$/.test(name)){
  throw new Error('Use a new preview-* output label');
}
if(resolve(process.cwd())!==root)throw new Error('Run from repository root');
if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Node 24 required');
const specFile=join(root,'examples','advanced-film.json');
const template=JSON.parse(readFileSync(specFile,'utf8'));
const briefFile=process.argv[4];
if(briefFile&&!/^examples\/brief-[a-z0-9-]+\.json$/.test(briefFile))
  throw new Error('Only committed examples/brief-*.json accepted');
const spec=briefFile?compileMotionBrief(JSON.parse(readFileSync(join(root,briefFile),'utf8')),template):template;
validateAdvancedSpec(spec);
const art=await loadAdvancedArt(spec,dirname(specFile));
const [width,height]=profiles[profileName];
const profile={width,height,fps:30,frames:spec.motion.duration_frames};
const frames=[0,24,75,89,90,91,115,179,180,209,269,270,300,345,359];
const output=join(root,'out',name);
if(existsSync(output))throw new Error('Preview output exists; choose another label');
const sha256=buf=>createHash('sha256').update(buf).digest('hex');
const began=process.hrtime.bigint();
const buffers=frames.map(frame=>drawAdvancedFrame(profile,frame,spec,art).toBuffer('image/png'));
const tileW=350,tileH=275,cols=4;
const sheet=createCanvas(tileW*cols,tileH*Math.ceil(frames.length/cols));
const ctx=sheet.getContext('2d');
ctx.fillStyle='#20242A';ctx.fillRect(0,0,sheet.width,sheet.height);
for(let i=0;i<frames.length;i++){
  const img=await loadImage(buffers[i]);
  const x=(i%cols)*tileW,y=Math.floor(i/cols)*tileH;
  const scale=Math.min(330/img.width,230/img.height);
  const dw=img.width*scale,dh=img.height*scale;
  ctx.drawImage(img,x+(tileW-dw)/2,y+(235-dh)/2,dw,dh);
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#ECF1F2';
  ctx.font='14px '+fontFamily;
  ctx.fillText('FRAME '+String(frames[i]).padStart(3,'0'),x+12,y+259);
}
const report={renderer:'offline-canvas-still-preview-v1',profile,frames,
  source_commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),
  source_dirty:Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8',windowsHide:true}).trim()),
  input_sha256:sha256(Buffer.from(JSON.stringify(spec))),
  brief_id:briefFile??'baseline-advanced',
  asset_provenance:[art.record],
  samples:frames.map((frame,i)=>({frame,sha256:sha256(buffers[i])})),
  duration_ms:Number((process.hrtime.bigint()-began)/1000000n),
  output_kind:'PNG samples; no MP4 encoded',
  technical_qc:'SAMPLED_FRAMES_ONLY',creative_qc:'PENDING_HUMAN_REVIEW',approval:'UNAPPROVED',
  external_calls:0,paid_calls:0};
mkdirSync(output,{recursive:true});
try{
  for(let i=0;i<frames.length;i++){
    writeFileSync(join(output,'frame-'+String(frames[i]).padStart(3,'0')+'.png'),buffers[i]);
  }
  writeFileSync(join(output,'contact-sheet.png'),sheet.toBuffer('image/png'));
  writeFileSync(join(output,'preview-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({path:output,frames:frames.length,elapsed_ms:report.duration_ms}));
}catch(error){rmSync(output,{recursive:true,force:true});throw error;}
