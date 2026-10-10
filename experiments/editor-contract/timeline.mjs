// S3 research: deterministic neutral timeline edits only. No UI, renderer, packages or media.
import {validateEditableScene,evaluateEditableFrame,moveEditableLayer} from './scene.mjs';

const allowedTypes=new Set(['move','duplicate','trim-start','trim-end','insert-key','set-key','remove-key']);
const numericProperties=new Set(['x','y','scale','rotation','opacity']);
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
function exactly(o,keys,label){
 if(!plain(o)||Object.keys(o).length!==keys.length||!keys.every(k=>Object.hasOwn(o,k)))
  throw Error('Invalid '+label+' fields');
}
function validId(x){return typeof x==='string'&&/^[a-z][a-z0-9-]{0,47}$/.test(x);}
function validFrame(x){return Number.isInteger(x)&&x>=0&&x<=1800;}
function getLayer(scene,id){
 if(!validId(id))throw Error('Invalid layer ID');
 const layer=scene.layers.find(x=>x.id===id);
 if(!layer)throw Error('Unknown layer ID');
 return layer;
}
export function snapSecondsToFrame(seconds,fps=30){
 if(fps!==30||typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<0||seconds>60)
  throw Error('Unsupported time or frame rate');
 return Math.round(seconds*fps);
}
function boundaries(scene,layer,frame){
 if(!validFrame(frame)||frame<layer.start_frame||frame>=layer.end_frame)
  throw Error('Keyframe outside clip interval');
 const existing=layer.keys.find(k=>k.frame===frame);
 if(existing)return structuredClone(existing);
 let right=layer.keys.find(k=>k.frame>frame);
 if(!right||right.ease!=='linear')
  throw Error('Splitting eased segments requires a curve-preserving adapter');
 const state=evaluateEditableFrame(scene,frame).layers.find(l=>l.id===layer.id);
 if(!state)throw Error('Clip not active at frame');
 return {frame,x:state.x,y:state.y,scale:state.scale,
  rotation:state.rotation,opacity:state.opacity,ease:'linear'};
}
export function editTimeline(scene,operation){
 validateEditableScene(scene);
 if(!plain(operation)||!allowedTypes.has(operation.type))throw Error('Unsupported timeline operation');
 const t=operation.type;
 const keys=t==='move'?['type','layerId','deltaFrames']:
  t==='duplicate'?['type','layerId','newId','deltaFrames']:
  t==='set-key'?['type','layerId','frame','property','value']:
  ['type','layerId','frame'];
 exactly(operation,keys,'timeline operation');
 const layer=getLayer(scene,operation.layerId);
 if(t==='trim-start'||t==='trim-end')
  return trimTimelineClip(scene,operation.layerId,t==='trim-start'?'start':'end',operation.frame);
 if(t==='move'){
  if(!Number.isInteger(operation.deltaFrames)||Math.abs(operation.deltaFrames)>1800)
   throw Error('Invalid integer frame move');
  return moveEditableLayer(scene,operation.layerId,operation.deltaFrames);
 }
 const next=structuredClone(scene);
 const target=next.layers.find(l=>l.id===layer.id);
 if(t==='duplicate'){
  if(!validId(operation.newId)||next.layers.some(l=>l.id===operation.newId))
   throw Error('Duplicate or invalid new persistent ID');
  if(!Number.isInteger(operation.deltaFrames)||Math.abs(operation.deltaFrames)>1800)
   throw Error('Invalid duplicate delta');
  const cloned=structuredClone(target);
  cloned.id=operation.newId;
  cloned.start_frame+=operation.deltaFrames;cloned.end_frame+=operation.deltaFrames;
  for(const k of cloned.keys)k.frame+=operation.deltaFrames;
  next.layers.push(cloned);
 }else{
  if(!validFrame(operation.frame))throw Error('Invalid keyframe frame');
  const index=target.keys.findIndex(k=>k.frame===operation.frame);
  if(t==='insert-key'){
   if(index!==-1||operation.frame<=target.start_frame||operation.frame>=target.end_frame-1)
    throw Error('New keyframe must be inside clip at an unused frame');
   const key=boundaries(scene,layer,operation.frame);
   target.keys.push(key);target.keys.sort((a,b)=>a.frame-b.frame);
  }else if(t==='remove-key'){
   if(index<=0||index>=target.keys.length-1)throw Error('Only internal keyframes can be removed');
   target.keys.splice(index,1);
  }else if(t==='set-key'){
   if(index===-1)throw Error('Existing keyframe required');
   if(operation.property==='ease'){
    if(!['linear','ease-out-cubic'].includes(operation.value))
     throw Error('Invalid easing');
   }else if(!numericProperties.has(operation.property)||
     typeof operation.value!=='number'||!Number.isFinite(operation.value))
    throw Error('Unsupported keyframe property or value');
   target.keys[index][operation.property]=operation.value;
  }
 }
 validateEditableScene(next);
 return next;
}
export function trimTimelineClip(scene,layerId,edge,frame){
 if(!['start','end'].includes(edge))throw Error('Invalid trim edge');
 validateEditableScene(scene);
 const layer=getLayer(scene,layerId);
 const next=structuredClone(scene);
 editTrimOnCopy(scene,next,layer,frame,edge==='start');
 validateEditableScene(next);
 return next;
}
function editTrimOnCopy(original,next,layer,frame,isStart){
 if(!validFrame(frame))throw Error('Invalid trim frame');
 const start=isStart?frame:layer.start_frame,end=isStart?layer.end_frame:frame;
 if(start<layer.start_frame||end>layer.end_frame||end-start<2)
  throw Error('Trim only supports shortening to at least two frames');
 if(start===layer.start_frame&&end===layer.end_frame)throw Error('No-op trim not accepted');
 const first=boundaries(original,layer,start),last=boundaries(original,layer,end-1);
 const internal=layer.keys.filter(k=>k.frame>start&&k.frame<end-1);
 const dest=getLayer(next,layer.id);
 dest.start_frame=start;dest.end_frame=end;dest.keys=[first,...structuredClone(internal),last];
}
// One serializable bounded history. No hidden browser state or mutable references.
function checkHistory(h){
 exactly(h,['past','present','future'],'timeline history');
 if(!Array.isArray(h.past)||!Array.isArray(h.future)||h.past.length>20||h.future.length>20)
  throw Error('Unbounded timeline edit history');
 validateEditableScene(h.present);
 for(const s of [...h.past,...h.future])validateEditableScene(s);
}
export function makeTimelineHistory(scene){
 validateEditableScene(scene);
 return {past:[],present:structuredClone(scene),future:[]};
}
export function commitTimelineEdit(history,operation){
 checkHistory(history);
 let next;
 if(operation?.type==='trim-start'||operation?.type==='trim-end'){
  exactly(operation,['type','layerId','frame'],'timeline operation');
  next=trimTimelineClip(history.present,operation.layerId,
   operation.type==='trim-start'?'start':'end',operation.frame);
 }else next=editTimeline(history.present,operation);
 return {past:[...structuredClone(history.past),structuredClone(history.present)].slice(-20),
  present:next,future:[]};
}
export function undoTimelineEdit(history){
 checkHistory(history);
 if(!history.past.length)return structuredClone(history);
 const out=structuredClone(history),prior=out.past.pop();
 out.future.unshift(out.present);
 out.present=prior;return out;
}
export function redoTimelineEdit(history){
 checkHistory(history);
 if(!history.future.length)return structuredClone(history);
 const out=structuredClone(history),next=out.future.shift();
 out.past.push(out.present);
 out.present=next;return out;
}
