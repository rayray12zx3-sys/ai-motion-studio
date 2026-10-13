#!/usr/bin/env node
/** Pure data-driven 16:9 film source from existing authored P2 briefs. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadDirectorBrief} from './load-director-brief.mjs';
import {inspectFrame} from '../src/semantic-scenes.mjs';
import {renderWidescreenFrame,WIDESCREEN_PROFILE} from '../src/widescreen-composition.mjs';

const args=process.argv.slice(2);
const all=args.at(-1)==='--all', core=all?args.slice(0,-1):args;
if(!((core.length===1&&['board','caption'].includes(core[0]))||
   (core.length===2&&core[0]==='--spec'))){
  console.error('Usage: emit-widescreen-frames.mjs board|caption [--all] OR --spec /local/original.json [--all]');
  process.exit(2);
}
const plan=loadDirectorBrief(core[0],core[1]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'artifacts',plan.id,all?'widescreen-all':'widescreen-samples');
fs.mkdirSync(out,{recursive:true});
const samples=new Set([0,plan.profile.frames-1]);
for(const shot of plan.shots){
  for(const n of [shot.start,shot.start+6,Math.floor((shot.start+shot.end)/2),shot.end-1])
    samples.add(n);
}
for(const action of plan.operations)
  for(const n of [action.gesture.start,action.frame-1,action.frame,action.frame+8])
    samples.add(n);
const indices=all?Array.from({length:plan.profile.frames},(_,i)=>i):
  [...samples].filter(n=>n>=0&&n<plan.profile.frames).sort((a,b)=>a-b);
for(const frame of indices){
  fs.writeFileSync(path.join(out,String(frame).padStart(4,'0')+'.svg'),
    renderWidescreenFrame(plan,frame),'utf8');
}
const summary={film:plan.id,profile:WIDESCREEN_PROFILE,
 sourceProfile:plan.profile,composition:'landscape-responsive-editorial-split-rnd',
 renderedSvgFrames:indices.length,frameList:indices,
 shotIds:plan.shots.map(s=>s.id),operationFrames:plan.operations.map(o=>o.frame),
 resultBefore:inspectFrame(plan,plan.operations[0].frame-1).state,
 resultAfter:inspectFrame(plan,plan.operations[0].frame).state,
 sourceContract:'UNCHANGED',publicSyntheticOnly:true,
 artStatus:'PENDING_HUMAN',rightsStatus:'PENDING_OTHER_MEDIA_REVIEW',
 disclaimer:'16:9 editorial re-layout around the original 9:16 storyboard is not native full responsive scene reflow, model inference or commercial art approval.'};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({film:plan.id,frames:indices.length,output:out,profile:summary.profile}));
