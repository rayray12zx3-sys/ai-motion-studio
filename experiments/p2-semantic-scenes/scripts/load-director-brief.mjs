/** Local-only ChatGPT-authored scene input: no JS-per-brief editing, no network. */
import fs from 'node:fs';
import path from 'node:path';
import {compileSemanticScenes} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
const MAX_BYTES=24000;
export function loadDirectorBrief(kind,value){
  if((kind==='board'||kind==='caption')&&value===undefined){
    return compileSemanticScenes(kind==='board'?boardBrief:captionBrief);
  }
  if(kind!=='--spec'||typeof value!=='string'||!value.endsWith('.json')||
     !value.trim()||/^https?:\/\//i.test(value)){
    throw new Error('Expected board, caption or --spec <local original-only JSON file>');
  }
  const target=path.resolve(value);
  if(!fs.statSync(target).isFile()||fs.statSync(target).size>MAX_BYTES){
    throw new Error('Local authored JSON file must be regular and <=24000 bytes');
  }
  let raw;
  try {raw=JSON.parse(fs.readFileSync(target,'utf8'));}
  catch {throw new Error('Invalid local JSON specification');}
  const plan=compileSemanticScenes(raw);
  // Current isolated VIDEO output has been decoded only on this profile. The
  // underlying compiler accepts broader values, but that isn't film approval.
  if(plan.profile.width!==1080||plan.profile.height!==1920||
     plan.profile.fps!==30||plan.profile.frames!==360){
    throw new Error('Unverified render profile: current P2 JSON film gate is 1080x1920 30fps 360f');
  }
  return plan;
}
