// Editor-only immutable helpers. They may NOT modify the official two-field Canvas renderer.
import {validateEditableScene} from '../experiments/editor-contract/scene.mjs';
import {editTimeline} from '../experiments/editor-contract/timeline.mjs';

export function changeLayerAppearance(scene,id,field,value){
 validateEditableScene(scene);
 if(!['text','color'].includes(field))throw Error('Only text and color are editable here');
 const next=structuredClone(scene),target=next.layers.find(l=>l.id===id);
 if(!target)throw Error('Unknown layer');
 if(field==='text'&&target.type!=='text')throw Error('Only text layers have text');
 target[field]=value;
 validateEditableScene(next);return next;
}
export function addEditorRectangle(scene,id){
 validateEditableScene(scene);
 const next=structuredClone(scene),end=next.duration_frames-1;
 const maxZ=Math.max(...next.layers.map(l=>l.z));
 next.layers.push({id,type:'rect',z:maxZ+1,start_frame:0,end_frame:next.duration_frames,
  color:'#74d8c3',text:null,
  keys:[{frame:0,x:.5,y:.5,scale:1,rotation:0,opacity:1,ease:'linear'},
   {frame:end,x:.5,y:.5,scale:1,rotation:0,opacity:1,ease:'linear'}]});
 validateEditableScene(next);return next;
}
export function removeEditorLayer(scene,id){
 validateEditableScene(scene);
 const next=structuredClone(scene);
 const before=next.layers.length;
 next.layers=next.layers.filter(l=>l.id!==id);
 if(next.layers.length===before)throw Error('Unknown layer');
 validateEditableScene(next);return next;
}
export function translateEditorLayer(scene,id,deltaX,deltaY){
 validateEditableScene(scene);
 if(!Number.isFinite(deltaX)||!Number.isFinite(deltaY)||Math.abs(deltaX)>2||Math.abs(deltaY)>2)
  throw Error('Invalid normalized drag');
 const layer=scene.layers.find(l=>l.id===id);
 if(!layer)throw Error('Unknown layer');
 let result=scene;
 for(const key of layer.keys){
  result=editTimeline(result,{type:'set-key',layerId:id,frame:key.frame,property:'x',value:key.x+deltaX});
  result=editTimeline(result,{type:'set-key',layerId:id,frame:key.frame,property:'y',value:key.y+deltaY});
 }
 return result;
}
export function uniqueLayerId(scene,prefix='shape'){
 validateEditableScene(scene);
 for(let i=1;i<=99;i++){const id=prefix+'-'+i;if(!scene.layers.some(l=>l.id===id))return id;}
 throw Error('Layer ID capacity reached');
}
