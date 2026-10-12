/** Higher-level scene orchestration, intentionally not an LLM or auto art critic. */
import {auditBeatPlan} from './spatial-graph.mjs';
const allowedActions=new Set(['morph','draw','orbit','group','hold','camera','text']);
export function validateMotionTreatment(treatment){
  if(!treatment||typeof treatment!=='object')throw Error('Missing treatment');
  if(typeof treatment.message!=='string'||!treatment.message.trim())throw Error('Message required');
  if(!Number.isInteger(treatment.fps)||treatment.fps<1||!Number.isInteger(treatment.frames)||treatment.frames<1)throw Error('Invalid frame profile');
  if(!Array.isArray(treatment.beats)||!treatment.beats.length)throw Error('Beat plan required');
  for(const beat of treatment.beats){
    if(!allowedActions.has(beat.action))throw Error(`Unknown motion action: ${beat.action}`);
    if(beat.action==='text'&&!beat.readable)throw Error(`Text beat ${beat.id} needs reading hold`);
    if(['morph','orbit'].includes(beat.action)&&!beat.objectId)throw Error(`${beat.action} needs persistent objectId`);
  }
  const audited=auditBeatPlan({fps:treatment.fps,frames:treatment.frames,beats:treatment.beats});
  const persistent=new Map();
  for(const b of treatment.beats){if(b.objectId&&['morph','orbit'].includes(b.action))persistent.set(b.objectId,(persistent.get(b.objectId)||0)+1);}
  return {pass:audited.pass,findings:audited.findings,peakFocal:audited.peakFocal,persistentObjects:[...persistent.keys()],readableBeats:treatment.beats.filter(b=>b.readable).length};
}
/**
 * Each beat is a creative instruction, not a GUI keyframe specification.
 * This reports useful production constraints before expensive rendering.
 */
export function compareTreatments(first,second){
  const a=validateMotionTreatment(first),b=validateMotionTreatment(second);
  const roles=new Set(first.beats.map(x=>x.action));
  const additions=[...new Set(second.beats.map(x=>x.action))].filter(x=>!roles.has(x));
  return {a,b,sharedActions:[...roles].filter(x=>second.beats.some(y=>y.action===x)),secondUniqueActions:additions,distinctMessage:first.message!==second.message};
}
