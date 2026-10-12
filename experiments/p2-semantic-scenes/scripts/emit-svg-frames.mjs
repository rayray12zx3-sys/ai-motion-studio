#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileSemanticScenes,renderSvgFrame,inspectFrame} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
const args=process.argv.slice(2);
if(args.length<1||args.length>2||!['board','caption'].includes(args[0])||
   (args[1]!==undefined&&args[1]!=='--all')) {
 console.error('Usage: node scripts/emit-svg-frames.mjs board|caption [--all]');
 process.exit(2);
}
const plan=compileSemanticScenes(args[0]==='board'?boardBrief:captionBrief);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'artifacts',plan.id,args[1]==='--all'?'all':'samples');
fs.mkdirSync(out,{recursive:true});
const picks=args[1]==='--all'?
 Array.from({length:plan.profile.frames},(_,i)=>i):
 [...new Set([0,29,60,119,120,145,164,165,166,180,211,239,240,265,305,359,
  plan.operations[0].frame-1,plan.operations[0].frame,plan.operations[0].frame+1])].sort((a,b)=>a-b);
for(const frame of picks)fs.writeFileSync(path.join(out,String(frame).padStart(4,'0')+'.svg'),
 renderSvgFrame(plan,frame),'utf8');
const summary={film:plan.id,profile:plan.profile,renderedSvgFrames:picks.length,
 frameList:picks,heroId:plan.shots[0].focusId,layouts:plan.shots.map(s=>s.layout),
 operation:plan.operations[0],before:inspectFrame(plan,plan.operations[0].frame-1).state,
 after:inspectFrame(plan,plan.operations[0].frame).state,
 artStatus:plan.artStatus,rightsStatus:plan.rightsStatus,audioAuditioned:false,
 notes:'Generated original SVG frames only; NOT actual full-speed/audio/art verification.'};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({film:plan.id,frames:picks.length,output:out}));
