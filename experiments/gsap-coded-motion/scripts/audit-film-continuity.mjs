/** Real MP4 decoded-frame jump audit for the isolated original-GPU CI clip. */
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {detectIsolatedPops} from '../src/frame-continuity.mjs';
const width=96,height=170,frames=300,pixels=width*height;
const file=resolve('out/three-film-10s-540x960.mp4');
const proc=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-vf','scale=96:170,format=gray','-f','rawvideo','pipe:1'],{encoding:null,maxBuffer:16*1024*1024});
if(proc.status!==0)throw Error('FFmpeg grayscale decode failed: '+String(proc.stderr));
const bytes=proc.stdout;if(bytes.length!==frames*pixels)throw Error('Expected 300 fully decoded frame buffers, got '+bytes.length);
const diffs=[];
for(let f=1;f<frames;f++){
 let sum=0;const prev=(f-1)*pixels,cur=f*pixels;
 for(let i=0;i<pixels;i++)sum+=Math.abs(bytes[cur+i]-bytes[prev+i]);
 diffs.push(sum/pixels);
}
const spikes=detectIsolatedPops(diffs);
const report={
 profile:{width,height,frames,source:'full 300-frame H264 research film'},
 pops:spikes,
 medianDifference:[...diffs].sort((a,b)=>a-b)[Math.floor(diffs.length/2)],
 transitionBoundaryDifference:{frame127:diffs[126],frame153:diffs[152]},
 classification:'Temporal jump warning only; proper artistic motion QA still requires full-speed visual review'
};
await writeFile('out/three-film-continuity.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({FULL_MOVIE_CONTINUITY_PASS:spikes.length===0,spikes,boundaries:report.transitionBoundaryDifference}));
if(spikes.length)throw Error('Unexplained one-frame color/pixel pop at frames: '+spikes.map(x=>x.frame).join(','));
