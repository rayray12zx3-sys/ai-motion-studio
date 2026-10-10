// Isolated, dependency-free S1 editor data exchange. No production imports.
const top=['version','kind','id','fps','duration_frames','canvas','assets','layers'];
const fields=['id','type','z','start_frame','end_frame','color','text','keys'];
const keyFields=['frame','x','y','scale','rotation','opacity','ease'];
const plain=o=>o!==null && typeof o==='object' && !Array.isArray(o) && Object.getPrototypeOf(o)===Object.prototype;
function exact(o,keys,label){
 if(!plain(o)||Object.keys(o).length!==keys.length||!keys.every(k=>Object.hasOwn(o,k)))
  throw Error('Invalid '+label+' fields');
}
const id=s=>typeof s==='string'&&/^[a-z][a-z0-9-]{0,47}$/.test(s);
const finite=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
const dimensions=new Set(['360x640','640x360','1080x1920','1920x1080']);
export function validateEditableScene(s){
 exact(s,top,'scene');
 if(s.version!==1||s.kind!=='editable-scene-v1'||!id(s.id)||s.fps!==30||
  !Number.isInteger(s.duration_frames)||s.duration_frames<30||s.duration_frames>1800)
   throw Error('Invalid scene identity, fps or duration');
 exact(s.canvas,['width','height'],'canvas');
 if(!Number.isInteger(s.canvas.width)||!Number.isInteger(s.canvas.height)||
  !dimensions.has(s.canvas.width+'x'+s.canvas.height))throw Error('Unsupported profile');
 if(!Array.isArray(s.assets)||s.assets.length!==0)throw Error('Media imports not allowed in S1');
 if(!Array.isArray(s.layers)||s.layers.length<1||s.layers.length>16)throw Error('Invalid layer count');
 const ids=new Set();
 for(const l of s.layers){
  exact(l,fields,'layer');
  if(!id(l.id)||ids.has(l.id))throw Error('Invalid or duplicate layer ID');
  ids.add(l.id);
  if(!['rect','text'].includes(l.type)||!Number.isInteger(l.z)||l.z < -50||l.z>50||
   typeof l.color!=='string'||!/^#[0-9a-f]{6}$/i.test(l.color))throw Error('Invalid layer properties');
  if(l.type==='rect'?l.text!==null:typeof l.text!=='string'||!l.text.trim()||
   [...l.text].length>80||/[\p{C}<>]/u.test(l.text))throw Error('Invalid layer text');
  if(!Number.isInteger(l.start_frame)||!Number.isInteger(l.end_frame)||
   l.start_frame<0||l.end_frame>s.duration_frames||l.end_frame-l.start_frame<2)
    throw Error('Invalid half-open clip interval');
  if(!Array.isArray(l.keys)||l.keys.length<2||l.keys.length>32)throw Error('Invalid keyframe count');
  let previous=-1;
  for(const k of l.keys){
   exact(k,keyFields,'keyframe');
   if(!Number.isInteger(k.frame)||k.frame<=previous||
    k.frame<l.start_frame||k.frame>=l.end_frame||
    !['linear','ease-out-cubic'].includes(k.ease))throw Error('Invalid keyframe timing/easing');
   previous=k.frame;
   for(const [name,lo,hi] of [['x',-.5,1.5],['y',-.5,1.5],['scale',.01,4],
    ['rotation',-Math.PI,Math.PI],['opacity',0,1]])
    if(!finite(k[name],lo,hi))throw Error('Invalid keyframe '+name);
  }
  if(l.keys[0].frame!==l.start_frame||previous!==l.end_frame-1)
   throw Error('Keyframes must cover clip interval');
 }
 return true;
}
function positionAt(keys,frame){
 let i=1;while(i<keys.length-1&&frame>keys[i].frame)i++;
 const a=keys[i-1],b=keys[i],t=(frame-a.frame)/(b.frame-a.frame);
 const f=b.ease==='ease-out-cubic'?1-(1-t)**3:t;
 return Object.fromEntries(['x','y','scale','rotation','opacity'].map(k=>[k,a[k]+(b[k]-a[k])*f]));
}
export function evaluateEditableFrame(s,frame){
 validateEditableScene(s);
 if(!Number.isInteger(frame)||frame<0||frame>=s.duration_frames)throw Error('Out-of-range frame');
 return {frame,layers:s.layers.filter(l=>l.start_frame<=frame&&frame<l.end_frame).map(l=>({
  id:l.id,type:l.type,z:l.z,color:l.color,text:l.text,...positionAt(l.keys,frame)
 })).sort((a,b)=>a.z-b.z||(a.id<b.id?-1:a.id>b.id?1:0))};
}
export function moveEditableLayer(s,layerId,deltaFrames){
 validateEditableScene(s);
 if(!id(layerId)||!Number.isInteger(deltaFrames)||Math.abs(deltaFrames)>1800)throw Error('Invalid clip move');
 const out=structuredClone(s),l=out.layers.find(x=>x.id===layerId);
 if(!l)throw Error('Unknown layer');
 l.start_frame+=deltaFrames;l.end_frame+=deltaFrames;
 for(const k of l.keys)k.frame+=deltaFrames;
 validateEditableScene(out);return out;
}
export function parseEditableScene(value){
 if(typeof value!=='string'||value.length>65536)throw Error('Scene JSON too large or invalid');
 const s=JSON.parse(value);validateEditableScene(s);return s;
}
export function serializeEditableScene(s){
 validateEditableScene(s);
 const value=JSON.stringify(s);
 if(value.length>65536)throw Error('Scene JSON too large');
 return value;
}
