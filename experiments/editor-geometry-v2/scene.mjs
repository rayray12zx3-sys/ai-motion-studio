// ISOLATED RESEARCH: strict S1 geometry-v2 document. Not accepted by v1 editor,
// official Canvas renderer, local scene persistence or any existing export route.
import {validateEditableScene,evaluateEditableFrame} from '../editor-contract/scene.mjs';

const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function exact(x,fields,label){
 if(!plain(x)||Object.keys(x).length!==fields.length||
    !fields.every(field=>Object.hasOwn(x,field)))throw Error('Invalid v2 '+label+' fields');
}
const finite=(x,lo,hi)=>typeof x==='number'&&Number.isFinite(x)&&x>=lo&&x<=hi;
const common=['id','type','z','start_frame','end_frame','color','text','keys','geometry'];
const top=['version','kind','id','fps','duration_frames','canvas','assets','layers'];
function baseV1Projection(scene){
 return {
  version:1,kind:'editable-scene-v1',id:scene.id,fps:scene.fps,
  duration_frames:scene.duration_frames,canvas:scene.canvas,assets:scene.assets,
  layers:scene.layers.map(({geometry,...rest})=>rest)
 };
}
export function validateGeometryV2Scene(scene){
 exact(scene,top,'scene');
 if(scene.version!==2||scene.kind!=='editable-scene-geometry-v2')
  throw Error('Not an isolated geometry-v2 scene');
 if(!Array.isArray(scene.layers))throw Error('Invalid v2 layer list');
 for(const layer of scene.layers){
  exact(layer,common,'layer');
  const g=layer.geometry;
  if(layer.type==='rect'){
   exact(g,['width','height'],'rectangle geometry');
   if(!finite(g.width,.01,1.5)||!finite(g.height,.01,1.5))
    throw Error('Invalid normalized rectangle width/height');
  }else if(layer.type==='text'){
   exact(g,['font_size','max_width','align'],'text layout');
   if(!finite(g.font_size,.012,.16)||!finite(g.max_width,.1,1.5)||
      !['left','center','right'].includes(g.align))
    throw Error('Invalid normalized text layout');
  }else throw Error('Unsupported v2 layer type');
 }
 // Inherit all existing strict frame, keyframe, no-media and profile guards.
 // This projection is PRIVATE validation only, not a v1 migration or export.
 validateEditableScene(baseV1Projection(scene));
 return true;
}
export function evaluateGeometryV2Frame(scene,frame){
 validateGeometryV2Scene(scene);
 const v1=evaluateEditableFrame(baseV1Projection(scene),frame);
 const geometry=new Map(scene.layers.map(layer=>[layer.id,layer.geometry]));
 return {frame,layers:v1.layers.map(layer=>({...layer,geometry:structuredClone(geometry.get(layer.id))}))};
}
export function parseGeometryV2Scene(json){
 if(typeof json!=='string'||json.length===0||json.length>65536)
  throw Error('Invalid bounded v2 JSON size');
 const scene=JSON.parse(json);
 validateGeometryV2Scene(scene);
 return scene;
}
export function serializeGeometryV2Scene(scene){
 validateGeometryV2Scene(scene);
 const json=JSON.stringify(scene);
 if(json.length>65536)throw Error('Geometry-v2 scene exceeds storage bound');
 return json;
}
export function resizeGeometryV2Rect(scene,layerId,{width,height}){
 validateGeometryV2Scene(scene);
 const out=structuredClone(scene),target=out.layers.find(layer=>layer.id===layerId);
 if(!target||target.type!=='rect')throw Error('Unknown v2 rectangle');
 target.geometry={width,height};
 validateGeometryV2Scene(out);
 return out;
}
export function editGeometryV2TextLayout(scene,layerId,{font_size,max_width,align}){
 validateGeometryV2Scene(scene);
 const out=structuredClone(scene),target=out.layers.find(layer=>layer.id===layerId);
 if(!target||target.type!=='text')throw Error('Unknown v2 text layer');
 target.geometry={font_size,max_width,align};
 validateGeometryV2Scene(out);
 return out;
}
