import {parseEditableScene,serializeEditableScene} from '/scene.mjs';
import {makeTimelineHistory,commitTimelineEdit,undoTimelineEdit,redoTimelineEdit} from '/timeline-contract.mjs';
const stage=document.getElementById('track');
const clip=document.getElementById('clip');
const status=document.getElementById('status');
const framePixels=10;
let history,gesture=null;
const probe={ready:false,pointerCommits:0,saveCount:0,undoCount:0,redoCount:0,errors:[]};
window.__timelineProbe=probe;
function sceneClip(){return history.present.layers.find(l=>l.id==='headline');}
function render(){
 const layer=sceneClip();
 clip.style.left=(layer.start_frame*framePixels)+'px';
 clip.style.width=((layer.end_frame-layer.start_frame)*framePixels)+'px';
 clip.style.transform='';
 status.textContent='headline '+layer.start_frame+'..'+layer.end_frame+
  ' keyframes='+layer.keys.map(k=>k.frame).join(',')+
  ' | undo='+history.past.length+' redo='+history.future.length;
 probe.scene=history.present;
 probe.clip={start:layer.start_frame,end:layer.end_frame,keyframes:layer.keys.map(k=>k.frame)};
}
async function commit(next,isPointer=false){
 const before=history;
 try{
  // Persist to isolated temporary server first; only publish accepted state on success.
  const payload=serializeEditableScene(next.present);
  const res=await fetch('/save',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
  if(!res.ok)throw Error('Temporary scene persistence rejected: '+res.status);
  const receipt=await res.json();
  if(!receipt.persisted)throw Error('No disk save receipt');
  history=next;
  probe.saveCount+=1;
  if(isPointer)probe.pointerCommits+=1;
  probe.receipt=receipt;
  render();
 }catch(err){
  history=before;
  probe.errors.push(String(err));
  render();
 }
}
clip.addEventListener('pointerdown',event=>{
 if(gesture||event.button!==0)return;
 const edge=event.target.closest('[data-edge]')?.dataset.edge;
 const mode=edge==='start'?'trim-start':edge==='end'?'trim-end':'move';
 gesture={pointerId:event.pointerId,mode,x:event.clientX,
  start:sceneClip().start_frame,end:sceneClip().end_frame,
  width:clip.getBoundingClientRect().width};
 clip.setPointerCapture(event.pointerId);
 event.preventDefault();
});
clip.addEventListener('pointermove',event=>{
 if(!gesture||event.pointerId!==gesture.pointerId)return;
 const dx=event.clientX-gesture.x;
 if(gesture.mode==='move'){clip.style.transform='translateX('+dx+'px)';}
 else if(gesture.mode==='trim-start'){
  clip.style.transform='translateX('+dx+'px)';
  clip.style.width=Math.max(20,gesture.width-dx)+'px';
 }else clip.style.width=Math.max(20,gesture.width+dx)+'px';
});
clip.addEventListener('pointerup',async event=>{
 if(!gesture||event.pointerId!==gesture.pointerId)return;
 const g=gesture;gesture=null;
 if(clip.hasPointerCapture(event.pointerId))clip.releasePointerCapture(event.pointerId);
 const delta=Math.round((event.clientX-g.x)/framePixels);
 // No preview-only movement may be mistaken for a committed edit.
 if(delta===0){render();return;}
 let op;
 if(g.mode==='move')op={type:'move',layerId:'headline',deltaFrames:delta};
 else if(g.mode==='trim-start')op={type:'trim-start',layerId:'headline',frame:g.start+delta};
 else op={type:'trim-end',layerId:'headline',frame:g.end+delta};
 try{await commit(commitTimelineEdit(history,op),true);}
 catch(err){probe.errors.push(String(err));render();}
});
clip.addEventListener('pointercancel',()=>{gesture=null;render();});
document.getElementById('add-key').addEventListener('click',async()=>{
 try{await commit(commitTimelineEdit(history,{type:'insert-key',layerId:'headline',frame:12}));}
 catch(err){probe.errors.push(String(err));render();}
});
document.getElementById('undo').addEventListener('click',async()=>{
 const next=undoTimelineEdit(history);
 if(next.past.length!==history.past.length){await commit(next);probe.undoCount+=1;}
});
document.getElementById('redo').addEventListener('click',async()=>{
 const next=redoTimelineEdit(history);
 if(next.future.length!==history.future.length){await commit(next);probe.redoCount+=1;}
});
try{
 const response=await fetch('/scene.json',{cache:'no-store'});
 if(!response.ok)throw Error('Local JSON not available');
 history=makeTimelineHistory(parseEditableScene(await response.text()));
 render();probe.ready=true;
}catch(err){probe.errors.push(String(err));status.textContent='Scene refused: '+String(err);throw err;}
