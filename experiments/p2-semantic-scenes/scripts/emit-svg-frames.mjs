#!/usr/bin/env node
/**
 * Existing semantic renderer, now with explicitly user/ChatGPT-authored LOCAL
 * JSON brief input. No model API, raw JS eval, fetched media or executable
 * user-supplied extensions. Produces deterministic SVG, NOT art approval.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSvgFrame,inspectFrame} from '../src/semantic-scenes.mjs';
import {loadDirectorBrief} from './load-director-brief.mjs';

const args=process.argv.slice(2);
const all=args.at(-1)==='--all';
const core=all?args.slice(0,-1):args;
if(!((core.length===1&&['board','caption'].includes(core[0]))||
    (core.length===2&&core[0]==='--spec'))){
  console.error('Usage: node emit-svg-frames.mjs board|caption [--all] OR --spec /local/original.json [--all]');
  process.exit(2);
}
const plan=loadDirectorBrief(core[0],core[1]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'artifacts',plan.id,all?'all':'samples');
fs.mkdirSync(out,{recursive:true});
// Derive samples from this authored film, not brittle Atlas/Index frame numbers.
const candidates=new Set([0,plan.profile.frames-1]);
for(const s of plan.shots){
  candidates.add(s.start);candidates.add(s.end-1);
  candidates.add(Math.floor((s.start+s.end-1)/2));
}
for(const o of plan.operations){
  for(const f of [o.gesture.start-1,o.gesture.start,o.frame-1,o.frame,o.frame+1])
    candidates.add(f);
}
const picks=all?
  Array.from({length:plan.profile.frames},(_,i)=>i):
  [...candidates].filter(f=>f>=0&&f<plan.profile.frames)
    .sort((a,b)=>a-b);
for(const frame of picks){
  fs.writeFileSync(path.join(out,String(frame).padStart(4,'0')+'.svg'),
    renderSvgFrame(plan,frame),'utf8');
}
const summary={film:plan.id,profile:plan.profile,renderedSvgFrames:picks.length,
  frameList:picks,heroId:plan.shots[0].focusId,
  layouts:plan.shots.map(s=>s.layout),
  operations:plan.operations,
  before:inspectFrame(plan,plan.operations[0].frame-1).state,
  after:inspectFrame(plan,plan.operations[0].frame).state,
  artStatus:plan.artStatus,rightsStatus:plan.rightsStatus,
  audioAuditioned:false,
  notes:'Original authored SVG scenes only. Codec, licensed music, art and all rights remain independent.'
};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({film:plan.id,frames:picks.length,output:out}));
