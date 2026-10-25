// Inspect real local runtime and historical videos; never asserts who rendered a file.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SHA=/^[a-f0-9]{64}$/;
export const shaFile = file => createHash('sha256').update(readFileSync(file)).digest('hex');
function call(cmd,args,timeout=90000) {
  const result=spawnSync(cmd,args,{shell:false,encoding:'utf8',timeout,maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']});
  if(result.error || result.status!==0) throw new Error(`Failed ${cmd}: ${String(result.error||result.stderr).slice(0,400)}`);
  return result.stdout;
}
export function doctor({hf=null,hfSha=null}={}) {
  const version=process.versions.node;
  const major=Number(version.split('.')[0]);
  const components={};
  for(const name of ['@fontsource/noto-sans-tc/package.json','ffmpeg-static','ffprobe-static']) {
    try {components[name]={status:'FOUND',resolved:require.resolve(name)};}
    catch {components[name]={status:'NOT_INSTALLED_IN_PROJECT_RUNTIME'};}
  }
  for(const name of ['ffmpeg','ffprobe']) {
    try {components[name]={status:'FOUND',version:call(name,['-version'],8000).split('\n')[0]};}
    catch(e) {components[name]={status:'NOT_FOUND',error:String(e.message).slice(0,160)};}
  }
  const issues=[];
  if(major!==24)issues.push(`this project requires Node 24; current ${version}`);
  for(const [key,value] of Object.entries(components)) if(value.status!=='FOUND')issues.push(`${key}: ${value.status}`);
  if(Boolean(hf)!==Boolean(hfSha))issues.push('both HF entrypoint and exact SHA required');
  let hfResult={status:'NOT_SUPPLIED'};
  if(hf && hfSha) {
    if(!SHA.test(hfSha))issues.push('HF SHA must be 64 lowercase hex');
    else {
      try {const f=realpathSync(resolve(hf)); const actual=shaFile(f);
        hfResult={status:actual===hfSha?'ENTRYPOINT_SHA_PASS':'ENTRYPOINT_SHA_MISMATCH',entrypoint:f,sha256:actual};
        if(actual!==hfSha)issues.push('HF executable SHA mismatch');
      }catch(e) {hfResult={status:'HF_ENTRYPOINT_UNAVAILABLE'};issues.push(`HF entrypoint unavailable: ${e.message}`)}
    }
  } else issues.push('reviewed local HF 0.8.143 executable and hash not supplied');
  return {schema:'cinetic-doctor-v1',status:issues.length?'BLOCKED':'READY_TO_ATTEMPT_NOT_RENDERED',node:version,components,hyperframes:hfResult,issues,
    never_claims:['upstream 273 techniques implemented','successful new render','art signoff','Windows Premiere test','commercial license']};
}
export function auditExistingVideo(file,{width,height,fps,frames,sha256}={}) {
  const f=resolve(file);
  const errors=[];
  if(!existsSync(f)) return {schema:'cinetic-video-audit-v1',status:'BLOCKED',errors:['video absent']};
  const expected={width,height,fps,frames};
  for(const [key,value] of Object.entries(expected)) if(!Number.isInteger(value) || value<=0)errors.push(`invalid ${key}`);
  if(!SHA.test(sha256||''))errors.push('expected SHA256 must be 64 lowercase hex');
  if(errors.length)return {schema:'cinetic-video-audit-v1',status:'BLOCKED',errors};
  try {
    const hash=shaFile(f);
    if(hash!==sha256)errors.push('SHA256 does not match expected source evidence');
    const probe=JSON.parse(call('ffprobe',['-v','error','-show_entries','format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,nb_frames,pix_fmt','-of','json',f]));
    const videos=probe.streams.filter(x=>x.codec_type==='video');
    if(videos.length!==1)errors.push('exactly one video track required');
    const v=videos[0]||{};
    for(const k of ['width','height'])if(v[k]!==expected[k])errors.push(`${k}: ${v[k]} vs ${expected[k]}`);
    if(v.codec_name!=='h264' && v.codec_name!=='prores')errors.push(`unexpected video codec: ${v.codec_name}`);
    const rate=v.r_frame_rate?.split('/').map(Number)||[];
    if(rate.length!==2||!rate[1]||rate[0]!==expected.fps*rate[1])errors.push(`fps: ${v.r_frame_rate} vs ${fps}`);
    call('ffmpeg',['-nostdin','-hide_banner','-v','error','-i',f,'-map','0:v:0','-f','null','-']);
    const count=JSON.parse(call('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=nb_read_frames','-of','json',f]));
    const actualFrames=Number(count.streams?.[0]?.nb_read_frames);
    if(actualFrames!==frames)errors.push(`decoded frames ${actualFrames} vs ${frames}`);
    return {schema:'cinetic-video-audit-v1',status:errors.length?'BLOCKED':'VIDEO_BYTES_TECH_PASS_ORIGIN_UNVERIFIED',errors,
      file:f,sha256:hash,codec:v.codec_name,resolution:[v.width,v.height],fps:v.r_frame_rate,decoded_frames:actualFrames,
      not_proven:['new Cinetic entrypoint invoked HyperFrames','upstream 273 technique support','alpha output','human art review','Premiere import','rights']};
  }catch(e){errors.push(`actual probe or full decode failed: ${e.message}`);return {schema:'cinetic-video-audit-v1',status:'BLOCKED',errors};}
}