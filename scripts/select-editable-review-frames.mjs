// Deterministic review-only frame selection. No video frames or S1 schema are altered.
// Prioritize documented clip boundaries and keyframes, then evenly subsample if needed.
import {validateEditableScene} from '../experiments/editor-contract/scene.mjs';

export function selectEditableReviewFrames(scene,{limit=12}={}){
 validateEditableScene(scene);
 if(!Number.isInteger(limit)||limit<2||limit>24)
  throw Error('Review frame limit must be an integer between 2 and 24');
 const last=scene.duration_frames-1;
 const candidate=new Set([0,last,Math.floor(last/2)]);
 const add=frame=>{
  if(Number.isInteger(frame)&&frame>=0&&frame<=last)candidate.add(frame);
 };
 for(const layer of scene.layers){
  add(layer.start_frame-1);add(layer.start_frame);
  add(layer.end_frame-1);add(layer.end_frame);
  for(const key of layer.keys)add(key.frame);
 }
 const frames=[...candidate].sort((a,b)=>a-b);
 if(frames.length<=limit)return frames;
 // Evenly spread the limited slots across sorted critical S1 events.
 // Endpoints are always included. Sampling is not full-frame creative QC.
 const selected=[];
 for(let i=0;i<limit;i++){
  const pos=Math.round(i*(frames.length-1)/(limit-1));
  selected.push(frames[pos]);
 }
 return selected;
}
