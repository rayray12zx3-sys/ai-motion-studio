// Combined synthetic S2+S3 research. No production renderer, font/media ingestion or root packages.
import {parseEditableScene,serializeEditableScene} from '/scene.mjs';
import {editTimeline,makeTimelineHistory,undoTimelineEdit,redoTimelineEdit} from '/timeline.mjs';

const width=360,height=640,pxPerFrame=10,layerId='headline';
const track=document.getElementById('clip'),status=document.getElementById('status');
const probe={ready:false,canvasDrags:0,timelineGestures:0,saveCount:0,undoCount:0,redoCount:0,errors:[]};
window.__unifiedProbe=probe;
let history,rect,gesture;
const fail=(e)=>{probe.errors.push(String(e));status.textContent='Rejected: '+String(e);};
const stage=new window.Konva.Stage({container:'stage',width,height});
const konvaLayer=new window.Konva.Layer();stage.add(konvaLayer);
function clip(){return history.present.layers.find(l=>l.id===layerId);}
function draw(){
 const data=clip(),entry=data.keys[0];
 track.style.left=(data.start_frame*pxPerFrame)+'px';
 track.style.width=((data.end_frame-data.start_frame)*pxPerFrame)+'px';
 track.style.transform='';
 // Rect is an intentionally abstract selection proxy, not final text typography.
 if(!rect){
  rect=new window.Konva.Rect({id:layerId,width:78,height:48,fill:'#b6f2de',
   stroke:'#ffffff',strokeWidth:2,draggable:true});
  konvaLayer.add(rect);
 }
 rect.position({x:entry.x*width,y:entry.y*height});
 konvaLayer.draw();
 probe.clip={start:data.start_frame,end:data.end_frame,keys:data.keys.map(k=>k.frame)};
 probe.entry={x:entry.x,y:entry.y};
 probe.history={past:history.past.length,future:history.future.length};
 status.textContent='Clip ['+data.start_frame+','+data.end_frame+') | entry ('+
  entry.x.toFixed(4)+','+entry.y.toFixed(4)+') | Undo '+history.past.length+
  ' Redo '+history.future.length;
}
function historyWith(scene){
 // One visual gesture is one atomic history item, even if it edits several keyframes.
 return {past:[...structuredClone(history.past),structuredClone(history.present)].slice(-20),
  present:scene,future:[]};
}
async function commit(candidate,source){
 const response=await fetch('/save',{method:'POST',
  headers:{'Content-Type':'application/json'},body:serializeEditableScene(candidate.present)});
 if(!response.ok)throw Error('Local synthetic save rejected: '+response.status);
 const receipt=await response.json();
 if(!receipt.persisted)throw Error('Local save receipt missing');
 history=candidate;probe.saveCount++;probe.receipt=receipt;
 if(source==='canvas')probe.canvasDrags++;
 if(source==='timeline')probe.timelineGestures++;
 draw();
}
rect=null;
konvaLayer.on('dragend',async event=>{
 if(!history||event.target!==rect)return;
 const previous=clip().keys[0],deltaX=rect.x()/width-previous.x,deltaY=rect.y()/height-previous.y;
 try{
  if(Math.abs(deltaX)+Math.abs(deltaY)<.01)throw Error('No actual pointer movement');
  let result=history.present;
  const frames=clip().keys.map(k=>k.frame);
  for(const frame of frames){
   const original=clip().keys.find(k=>k.frame===frame);
   result=editTimeline(result,{type:'set-key',layerId,frame,property:'x',value:original.x+deltaX});
   result=editTimeline(result,{type:'set-key',layerId,frame,property:'y',value:original.y+deltaY});
  }
  await commit(historyWith(result),'canvas');
 }catch(e){fail(e);draw();}
});
track.addEventListener('pointerdown',event=>{
 if(!history||gesture||event.button!==0)return;
 const edge=event.target.closest('[data-edge]')?.dataset.edge;
 gesture={id:event.pointerId,x:event.clientX,
  type:edge==='end'?'trim-end':edge==='start'?'trim-start':'move',
  start:clip().start_frame,end:clip().end_frame,
  width:track.getBoundingClientRect().width};
 track.setPointerCapture(event.pointerId);event.preventDefault();
});
track.addEventListener('pointermove',event=>{
 if(!gesture||event.pointerId!==gesture.id)return;
 const dx=event.clientX-gesture.x;
 if(gesture.type==='move')track.style.transform='translateX('+dx+'px)';
 else if(gesture.type==='trim-start'){
  track.style.transform='translateX('+dx+'px)';
  track.style.width=Math.max(20,gesture.width-dx)+'px';
 }else track.style.width=Math.max(20,gesture.width+dx)+'px';
});
track.addEventListener('pointerup',async event=>{
 if(!gesture||event.pointerId!==gesture.id)return;
 const g=gesture;gesture=null;
 if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
 const delta=Math.round((event.clientX-g.x)/pxPerFrame);
 if(!delta){draw();return;}
 const op=g.type==='move'?{type:'move',layerId,deltaFrames:delta}:
  {type:g.type,layerId,frame:g.type==='trim-start'?g.start+delta:g.end+delta};
 try{await commit(historyWith(editTimeline(history.present,op)),'timeline');}
 catch(e){fail(e);draw();}
});
track.addEventListener('pointercancel',()=>{gesture=null;draw();});
for(const [button,transform,counter] of [
 ['undo',undoTimelineEdit,'undoCount'],['redo',redoTimelineEdit,'redoCount']
]){
 document.getElementById(button).addEventListener('click',async()=>{
  try{
   const next=transform(history);
   if(next.past.length===history.past.length&&next.future.length===history.future.length)return;
   await commit(next,'history');probe[counter]++;
  }catch(e){fail(e);draw();}
 });
}
try{
 if(!window.Konva?.Stage)throw Error('Pinned Konva library missing');
 const answer=await fetch('/scene.json',{cache:'no-store'});
 if(!answer.ok)throw Error('Local synthetic scene not available');
 history=makeTimelineHistory(parseEditableScene(await answer.text()));
 draw();probe.ready=true;
}catch(e){fail(e);throw e;}
