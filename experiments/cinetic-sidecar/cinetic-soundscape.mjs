// Original, deterministic, synthesized sound for ONE fictional public storyboard film.
// No stock recordings, external sample/media downloads, paid music or third-party audio.
// Film's independent sound/art approval remains pending even after machine QC.
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const RATE=48000,SECONDS=8,FRAMES=RATE*SECONDS;
const sha256=b=>createHash('sha256').update(b).digest('hex');
function call(exe,args,timeout=60000) {
  const p=spawnSync(exe,args,{shell:false,encoding:'utf8',timeout,maxBuffer:2<<20,stdio:['ignore','pipe','pipe']});
  if(p.error||p.status!==0) throw Error('local media command failed '+exe+': '+String(p.error||p.stderr).slice(0,350));
  return p.stdout;
}
export function soundscapeWav() {
  const b=Buffer.alloc(44+FRAMES*4);
  b.write('RIFF',0,'ascii');b.writeUInt32LE(b.length-8,4);
  b.write('WAVE',8,'ascii');b.write('fmt ',12,'ascii');b.writeUInt32LE(16,16);
  b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(RATE,24);
  b.writeUInt32LE(RATE*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);
  b.write('data',36,'ascii');b.writeUInt32LE(FRAMES*4,40);
  let rng=20261026,smoothed=0,delayed=0;
  const events=[[0.18,580,0.018],[2.4,690,0.027],[5.4,445,0.034]];
  const clamp=x=>Math.max(-.8,Math.min(.8,x));
  for(let i=0;i<FRAMES;i++) {
    const t=i/RATE;
    rng=(Math.imul(rng,1664525)+1013904223)>>>0;
    smoothed=smoothed*.91+((rng/4294967296)*2-1)*.09;
    const fade=Math.min(1,t/.65,(SECONDS-t)/.75);
    let s=.011*(Math.sin(2*Math.PI*146.832*t)*.55+Math.sin(2*Math.PI*220*t)*.28+
      Math.sin(2*Math.PI*293.665*t)*.17)*(.62+.38*Math.sin(2*Math.PI*.11*t+.4)**2)*Math.max(0,fade);
    for(const [at,f,vol] of events) {
      const dt=t-at;
      if(dt>=0&&dt<.23) s+=vol*Math.sin(2*Math.PI*f*(dt-.7*dt*dt))*Math.exp(-27*dt);
    }
    for(const [at,vol,len] of [[2.38,.012,.26],[5.38,.023,.38]]) {
      const dt=t-at;
      if(dt>=-.16&&dt<len) s+=vol*smoothed*(dt<0?(dt+.16)/.16:Math.exp(-11*dt));
    }
    const splash=t-6.58;
    if(splash>=0&&splash<1.3) {
      const phase=2*Math.PI*(240*(1-Math.exp(-2.2*splash))/2.2+70*splash);
      s+=.025*Math.sin(phase)*Math.exp(-8*splash)+.022*smoothed*Math.exp(-6*splash);
    }
    const left=clamp(s),right=clamp(.94*s+.06*delayed);
    b.writeInt16LE(Math.round(left*32767),44+i*4);
    b.writeInt16LE(Math.round(right*32767),46+i*4);
    delayed=s;
  }
  return b;
}
export function finishStoryboardWithOriginalSound(renderDir) {
  const video=join(renderDir,'preview.mp4'),wav=join(renderDir,'original-synthetic-sound.wav');
  const withSound=join(renderDir,'preview-with-original-sound.mp4');
  const reportPath=join(renderDir,'sound-qa.json');
  if(!existsSync(video)||!statSync(video).isFile())throw Error('real synthetic video required before sound finishing');
  if([wav,withSound,reportPath].some(existsSync))throw Error('sound finishing refuses overwrite');
  const audio=soundscapeWav();writeFileSync(wav,audio,{flag:'wx'});
  call('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-n',
    '-i',video,'-i',wav,'-map','0:v:0','-map','1:a:0','-c:v','copy',
    '-c:a','aac','-b:a','192k','-ar','48000',
    '-af','loudnorm=I=-19:TP=-4:LRA=9','-t','8','-movflags','+faststart',withSound],120000);
  const probes=JSON.parse(call('ffprobe',['-v','error','-show_entries',
    'stream=codec_name,codec_type,sample_rate,channels,nb_frames,avg_frame_rate,duration',
    '-of','json',withSound],30000));
  const streams=probes.streams||[],videoStream=streams.find(s=>s.codec_type==='video'),
    audioStream=streams.find(s=>s.codec_type==='audio');
  if(!videoStream||videoStream.codec_name!=='h264'||videoStream.avg_frame_rate!=='60/1'||
    Number(videoStream.nb_frames)!==480||!audioStream||audioStream.codec_name!=='aac'||
    Number(audioStream.sample_rate)!==RATE||Number(audioStream.channels)!==2||
    Math.abs(Number(audioStream.duration)-SECONDS)>.10)
    throw Error('muxed video/audio technical contract failed');
  const report={status:'ORIGINAL_SYNTHETIC_8S_PICTURE_SOUND_QA_PASS_NOT_ART_APPROVAL',
    soundSource:'SELF_GENERATED_DETERMINISTIC_NO_EXTERNAL_MEDIA',sampleRate:RATE,
    videoFrames:480,frameRate:60,audioChannels:2,
    originalWavSha256:sha256(audio),muxedMp4Sha256:sha256(readFileSync(withSound)),
    loudnessTarget:'-19 LUFS / <= -4 dBTP (FFmpeg loudnorm target, not independently remeasured)',
    visual:'PENDING_HUMAN_1X_REVIEW',soundArt:'PENDING_USER_APPROVAL',
    license:'CONDITIONAL_END_TO_END',release:'BLOCKED'};
  writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  return report;
}
