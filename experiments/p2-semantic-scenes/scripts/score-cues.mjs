/**
 * Original film-directed cue sheet, extracted from ACTUAL authored semantic shots.
 * Cue reason, action and timing are concrete. They do not establish musical
 * phrase agreement or human audiovisual artistic quality.
 */
import {loadDirectorBrief} from './load-director-brief.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

export function scoreCues(plan) {
  if(!plan||!Array.isArray(plan.shots)||!Array.isArray(plan.operations)) {
    throw new Error('Compile a semantic scene plan first');
  }
  const cues=[];
  for(const shot of plan.shots.slice(1)) {
    cues.push({frame:shot.start,kind:'transition',reason:shot.reason});
  }
  for(const action of plan.operations) {
    cues.push({frame:action.gesture.start,kind:'interaction',
      reason:'Begin '+action.trigger+' of '+action.entityId+' toward a visible product target'});
    cues.push({frame:action.frame,kind:'impact',reason:action.reason});
  }
  const order={transition:0,interaction:1,impact:2};
  cues.sort((a,b)=>a.frame-b.frame||order[a.kind]-order[b.kind]);
  for(const cue of cues) {
    if(!Number.isInteger(cue.frame)||cue.frame<0||cue.frame>=plan.profile.frames||
       typeof cue.reason!=='string'||cue.reason.length<5||cue.reason.length>160) {
      throw new Error('Bounded explicit creative timing/reason required');
    }
  }
  return cues;
}

if(process.argv[1] && import.meta.url === new URL('file://'+process.argv[1]).href) {
  const args=process.argv.slice(2);
  if(!((args.length===1&&['board','caption'].includes(args[0]))||
       (args.length===2&&args[0]==='--spec'))) {
    throw new Error('Choose board, caption or --spec /local/original.json');
  }
  const plan=loadDirectorBrief(args[0],args[1]);
  const dir=join(import.meta.dirname,'..','artifacts',plan.id);
  mkdirSync(dir,{recursive:true});
  const out=join(dir,'score-cues.json');
  writeFileSync(out,JSON.stringify(scoreCues(plan),null,2)+'\n');
  process.stdout.write(out+'\n');
}
