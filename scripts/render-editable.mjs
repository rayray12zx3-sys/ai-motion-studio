// Explicit operator-approved, local-only S1-v1 scene → Canvas+FFmpeg export.
// Legacy scripts/render.mjs and its {title,subtitle} SceneSpec are UNCHANGED.
// No imported assets, remote URLs, private/public upload, browser capture or new engines.
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,lstatSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import probe from 'ffprobe-static';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawEditableSceneFrame,validateEditableRenderScene} from '../src/free/editable-scene.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';

const sha=b=>createHash('sha256').update(b).digest('hex');
const approvedEncoders={
 'win32-x64':'04e1307997530f9cf2fe35cba2ca7e8875ca91da02',
 'linux-x64':'e7e7fb30477f717e6f55f9180a70386c62677ef8a4d4d1a5d948f4098aa3eb99'
};
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length!==3)throw Error('Usage: node scripts/render-editable.mjs <local-scene-json> <safe-run-id> <mp4|alpha>');
const [sourceFile,runId,mode]=args;
if(!/^[a-z][a-z0-9-]{0,39}$/.test(runId)||!['mp4','alpha'].includes(mode))
 throw Error('Invalid run ID or export mode');
if(Number(process.versions.node.split('.')[0])!==24)throw Error('Node.js 24 required');
if(resolve(process.cwd())!==root)throw Error('Start the scene renderer from the repository root');
const path=resolve(sourceFile);
const info=lstatSync(path); // no symlink or directory uploads masquerading as local scene inputs
if(!info.isFile()||info.isSymbolicLink()||info.size>65536||info.size===0)
 throw Error('Expected a bounded regular local scene JSON file');
const scene=parseEditableScene(readFileSync(path,'utf8'));
validateEditableRenderScene(scene); // includes strict S1 assets:[] and locked production glyph preflight
const sceneBytes=serializeEditableScene(scene);
const {width,height}=scene.canvas,frames=scene.duration_frames,fps=scene.fps;
const destination=join(root,'out','editable-'+runId);
if(existsSync(destination))throw Error('Refusing to overwrite existing output directory');
const encoder=join(dirname(fileURLToPath(import.meta.resolve('ffmpeg-static/package.json'))),
 process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const expected=approvedEncoders[process.platform+'-'+process.arch];
if(!expected||sha(readFileSync(encoder))!==expected)throw Error('Unverified FFmpeg binary');
if(!probe.path||!existsSync(probe.path))throw Error('Pinned FFprobe missing');
// Validate the first/last rendered pixels before creating output.
const canvasMode=mode==='alpha'?'transparent':'opaque';
drawEditableSceneFrame(scene,0,{output:canvasMode});
drawEditableSceneFrame(scene,frames-1,{output:canvasMode});
mkdirSync(destination,{recursive:true});
const file=join(destination,mode==='alpha'?'motion-alpha.mov':'motion.mp4');
const common=['-hide_banner','-loglevel','error','-nostdin','-n','-f','rawvideo',
 '-pixel_format','rgba','-video_size',width+'x'+height,'-framerate',String(fps),
 '-i','pipe:0','-an','-threads','1'];
const videoArgs=mode==='mp4'
 ? ['-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart']
 : ['-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-alpha_bits','16'];
const proc=spawn(encoder,[...common,...videoArgs,'-frames:v',String(frames),
 '-map_metadata','-1',file],{stdio:['pipe','ignore','pipe'],windowsHide:true});
let stderr='';
proc.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-6000);});
proc.stdin.on('error',()=>{});
const finished=new Promise((resolveDone,reject)=>{
 proc.on('error',reject);
 proc.on('close',code=>code===0?resolveDone():reject(Error('FFmpeg rejected scene: '+stderr)));
});
finished.catch(()=>{});
const sampleFrames=[0,Math.floor((frames-1)*.5),frames-1];
const hashes=[],samples=[];
try{
 for(let i=0;i<frames;i++){
  const image=drawEditableSceneFrame(scene,i,{output:canvasMode});
  const {data}=image.getContext('2d').getImageData(0,0,width,height);
  const raw=Buffer.from(data.buffer,data.byteOffset,data.byteLength);
  hashes.push(sha(raw));
  if(sampleFrames.includes(i)){
   const name='frame-'+i+'.png';
   writeFileSync(join(destination,name),image.toBuffer('image/png'));
   samples.push({frame:i,name,rgba_sha256:sha(raw)});
  }
  if(!proc.stdin.write(raw))
   await Promise.race([once(proc.stdin,'drain'),finished.then(()=>{throw Error('Encoder closed midstream');})]);
 }
 proc.stdin.end();await finished;
}catch(e){proc.kill();await finished.catch(()=>{});throw e;}
const report=JSON.parse(execFileSync(probe.path,['-v','error','-count_frames',
 '-select_streams','v:0','-show_entries',
 'stream=codec_name,profile,codec_tag_string,width,height,pix_fmt,r_frame_rate,nb_read_frames,nb_frames',
 '-of','json',file],{windowsHide:true,timeout:120000,maxBuffer:4*1024*1024}).toString());
const video=report.streams?.[0];
if(video?.codec_name!==(mode==='mp4'?'h264':'prores')||
 video.width!==width||video.height!==height||
 video.r_frame_rate!==fps+'/1'||
 Number(video.nb_read_frames??video.nb_frames)!==frames)
 throw Error('Encoded codec/dimensions/framerate/frame count mismatch');
if(mode==='alpha'&&!video.pix_fmt?.startsWith('yuva444p'))
 throw Error('QuickTime ProRes output is not alpha-capable');
if(mode==='mp4'&&video.pix_fmt!=='yuv420p')
 throw Error('Delivery MP4 pixel format mismatch');
// Deliberately label creative acceptance as separate and NEVER upload local S1 scene content.
const fileHash=sha(readFileSync(file));
const summary={
 kind:'APPROVED_OPT_IN_EDITABLE_SCENE_V1_CANVAS_FFMPEG',
 renderer:'locked-local-canvas+hash-verified-ffmpeg',mode,
 canvas:scene.canvas,frames,fps,scene_sha256:sha(Buffer.from(sceneBytes)),
 encoder_sha256:sha(readFileSync(encoder)),codec:video.codec_name,
 pix_fmt:video.pix_fmt,frame_hashes:hashes,review_frames:samples,
 output_sha256:fileHash,
 source_commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,windowsHide:true,encoding:'utf8'}).trim(),
 root_lockfile_sha256:sha(readFileSync(join(root,'package-lock.json'))),
 media_assets:0,network_requests:0,
 legacy_default_unchanged:true,
 pixel_parity_to_konva_preview:'NOT_PROVEN_PROXY_ONLY',
 creative_qc:'PENDING_HUMAN_REVIEW',commercial_rights:'NOT_CHECKED',
 windows_premiere:'NOT_TESTED',approval:'UNAPPROVED'
};
writeFileSync(join(destination,'render-report.json'),JSON.stringify(summary,null,2)+'\n');
const sheet=createCanvas(720,480),ctx=sheet.getContext('2d');
ctx.fillStyle='#101827';ctx.fillRect(0,0,720,480);
for(let i=0;i<samples.length;i++){
 const image=await loadImage(readFileSync(join(destination,samples[i].name)));
 const cellW=240,cellH=480,scale=Math.min(220/image.width,420/image.height);
 ctx.drawImage(image,i*cellW+(cellW-image.width*scale)/2,
   (cellH-image.height*scale)/2,image.width*scale,image.height*scale);
}
writeFileSync(join(destination,'contact-sheet.png'),sheet.toBuffer('image/png'));
console.log('EDITABLE_SCENE_CANVAS_FFMPEG_RESULT',JSON.stringify({
 mode,frames,fps,canvas:scene.canvas,codec:video.codec_name,technical_qc:'PASS',
 creative_qc:'PENDING_HUMAN_REVIEW',scene_sha256:summary.scene_sha256,
 output_sha256:fileHash,output_directory:'out/editable-'+runId
}));
