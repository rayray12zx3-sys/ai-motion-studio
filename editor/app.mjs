// Opt-in Konva editor. Advisory object proxies only; no official Canvas output is modified.
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '/scene.mjs';
import {editTimeline,makeTimelineHistory,undoTimelineEdit,redoTimelineEdit} from '/timeline.mjs';
import {changeLayerAppearance,addEditorRectangle,removeEditorLayer,translateEditorLayer,uniqueLayerId} from '/operations.mjs';

const $=id=>document.getElementById(id);
const fps=30,unit=14,stageWidth=360,stageHeight=640;
const probe={ready:false,commits:0,canvasDrags:0,timelineActions:0,easeChanges:0,undo:0,redo:0,blocked:0,errors:[]};
window.__motionEditor=probe;
let history,etag,selected='headline',selectedKey=null,frame=12,busy=false,gesture=null;
let stage,layer;
const item=()=>history.present.layers.find(l=>l.id===selected);
const updateStatus=msg=>{$('status').textContent=msg;};
function clipValues(scene=history.present){return scene.layers.find(l=>l.id===selected);}
function historyWith(scene){
 return {past:[...structuredClone(history.past),structuredClone(history.present)].slice(-20),present:scene,future:[]};
}
function paint(){
 const s=history.present;
 if(!item())selected=s.layers[0].id;
 const target=item();
 if(selectedKey===null||!target.keys.some(k=>k.frame===selectedKey))selectedKey=target.keys.at(-1).frame;
 $('seek').max=String(s.duration_frames-1);
 $('seek').value=String(frame);
 $('seek-value').textContent=String(frame);
 $('frame-label').textContent='第 '+frame+' 格 / '+s.fps+'fps';
 $('selected-label').textContent='目前圖層：'+selected+'（'+target.type+'）';
 $('layer-text').disabled=target.type!=='text';
 $('layer-text').value=target.type==='text'?target.text:'';
 $('layer-color').value=target.color;
 $('keyframe').replaceChildren(...target.keys.map(k=>{
  const o=document.createElement('option');o.value=String(k.frame);o.textContent='Frame '+k.frame;return o;
 }));
 $('keyframe').value=String(selectedKey);
 $('ease').value=target.keys.find(k=>k.frame===selectedKey).ease;
 const controls=$('layer-list');controls.replaceChildren(...[...s.layers].sort((a,b)=>a.z-b.z).map(l=>{
  const button=document.createElement('button');button.className='layer-button';
  button.dataset.layer=l.id;button.setAttribute('aria-pressed',String(l.id===selected));
  button.textContent=l.id+' · '+(l.type==='text'?'文字':'矩形');return button;
 }));
 layer.destroyChildren();
 const active=evaluateEditableFrame(s,frame).layers;
 for(const entry of active){
  // Rectangles deliberately represent editable positions, not locked-font or output pixels.
  const shape=new window.Konva.Rect({
   id:entry.id,x:entry.x*stageWidth,y:entry.y*stageHeight,
   offsetX:45,offsetY:27,width:90,height:54,scaleX:entry.scale,scaleY:entry.scale,
   rotation:entry.rotation*180/Math.PI,opacity:entry.opacity,
   fill:entry.type==='text'?'#8abfcb':entry.color,
   stroke:entry.id===selected?'#ffffff':'#c9f0e0',strokeWidth:entry.id===selected?3:1,
   cornerRadius:entry.type==='text'?8:2,draggable:true
  });
  shape.on('click',()=>{selected=entry.id;selectedKey=null;paint();});
  shape.on('dragend',async()=>{
   if(busy)return paint();
   const dx=shape.x()/stageWidth-entry.x,dy=shape.y()/stageHeight-entry.y;
   if(Math.abs(dx)+Math.abs(dy)<.0001)return paint();
   selected=entry.id;selectedKey=null;
   try{await commit(historyWith(translateEditorLayer(history.present,entry.id,dx,dy)),'canvas');}
   catch(error){reject(error);}
  });
  layer.add(shape);
 }
 layer.draw();
 const timeline=$('timeline');
 const totalWidth=Math.max(480,s.duration_frames*unit);
 timeline.style.width=(120+totalWidth)+'px';
 const ruler=document.createElement('div');ruler.className='ruler';
 ruler.textContent='0     5     10     15     20     25     … '+(s.duration_frames-1);
 const rows=[ruler];
 for(const l of [...s.layers].sort((a,b)=>a.z-b.z)){
  const row=document.createElement('div');row.className='timeline-row';
  const name=document.createElement('span');name.className='track-name';name.textContent=l.id;
  const track=document.createElement('div');track.className='track-field';
  track.style.minWidth=totalWidth+'px';
  const clip=document.createElement('div');clip.className='clip';
  clip.dataset.layer=l.id;clip.setAttribute('aria-selected',String(l.id===selected));
  clip.style.left=(l.start_frame*unit)+'px';
  clip.style.width=((l.end_frame-l.start_frame)*unit)+'px';
  for(const side of ['start','end']){
   const handle=document.createElement('span');handle.className='handle';
   handle.dataset.edge=side;clip.appendChild(handle);
  }
  track.appendChild(clip);row.append(name,track);rows.push(row);
 }
 timeline.replaceChildren(...rows);
 const playhead=document.createElement('div');playhead.className='playhead';
 playhead.style.left=(120+frame*unit)+'px';timeline.appendChild(playhead);
 probe.selected=selected;probe.keyframe=selectedKey;probe.frame=frame;
 probe.scene=structuredClone(s);probe.etag=etag;
 probe.sample=active.find(x=>x.id===selected)||null;
 probe.history={undo:history.past.length,redo:history.future.length};
 probe.timeline=s.layers.map(l=>({id:l.id,start:l.start_frame,end:l.end_frame,keys:l.keys.map(k=>k.frame)}));
}
async function commit(candidate,kind='property'){
 if(busy)throw Error('Editor is saving; another gesture must finish');
 busy=true;
 try{
  const text=serializeEditableScene(candidate.present);
  const res=await fetch('/scene.json',{method:'POST',headers:{
   'Content-Type':'application/json','If-Match':etag
  },body:text});
  const payload=await res.json();
  if(res.status===409)throw Error('Another editor changed the local scene. Reload to avoid data loss');
  if(!res.ok||payload.saved!==true||!res.headers.get('ETag'))throw Error('Local scene save failed');
  history=candidate;etag=res.headers.get('ETag');
  probe.commits++;
  if(kind==='canvas')probe.canvasDrags++;
  if(kind==='timeline')probe.timelineActions++;
  if(kind==='easing')probe.easeChanges++;
  if(kind==='undo')probe.undo++;
  if(kind==='redo')probe.redo++;
  paint();
  updateStatus('已儲存至本機場景 · '+kind+' · '+history.present.layers.length+' 層');
 }finally{busy=false;}
}
function reject(error){
 probe.blocked++;probe.errors.push(String(error));
 paint();updateStatus('操作已拒絕：'+String(error.message||error));
}
async function apply(task,kind){
 try{await commit(task(),kind);}
 catch(error){reject(error);}
}
$('layer-list').addEventListener('click',event=>{
 const id=event.target.closest('button[data-layer]')?.dataset.layer;
 if(id){selected=id;selectedKey=null;paint();}
});
$('seek').addEventListener('input',event=>{frame=Number(event.target.value);paint();});
$('keyframe').addEventListener('change',event=>{selectedKey=Number(event.target.value);paint();});
$('save-appearance').addEventListener('click',()=>apply(()=>{
 let scene=history.present;
 if(item().type==='text')scene=changeLayerAppearance(scene,selected,'text',$('layer-text').value);
 scene=changeLayerAppearance(scene,selected,'color',$('layer-color').value);
 return historyWith(scene);
},'appearance'));
$('save-ease').addEventListener('click',()=>apply(()=>historyWith(editTimeline(history.present,
 {type:'set-key',layerId:selected,frame:selectedKey,property:'ease',value:$('ease').value})),'easing'));
$('add-key').addEventListener('click',()=>apply(()=>historyWith(editTimeline(history.present,
 {type:'insert-key',layerId:selected,frame})),'keyframe'));
$('remove-key').addEventListener('click',()=>apply(()=>historyWith(editTimeline(history.present,
 {type:'remove-key',layerId:selected,frame:selectedKey})),'keyframe'));
$('add-rect').addEventListener('click',()=>apply(()=>{
 const id=uniqueLayerId(history.present,'shape'),scene=addEditorRectangle(history.present,id);
 selected=id;selectedKey=null;return historyWith(scene);
},'layer'));
$('duplicate').addEventListener('click',()=>apply(()=>{
 const id=uniqueLayerId(history.present,selected+'-copy');
 const scene=editTimeline(history.present,{type:'duplicate',layerId:selected,newId:id,deltaFrames:0});
 selected=id;selectedKey=null;return historyWith(scene);
},'layer'));
$('delete').addEventListener('click',()=>apply(()=>{
 const scene=removeEditorLayer(history.present,selected);
 selected=scene.layers[0].id;selectedKey=null;return historyWith(scene);
},'layer'));
$('undo').addEventListener('click',()=>apply(()=>undoTimelineEdit(history),'undo'));
$('redo').addEventListener('click',()=>apply(()=>redoTimelineEdit(history),'redo'));
document.addEventListener('keydown',event=>{
 if((event.ctrlKey||event.metaKey)&&!event.altKey&&['z','y'].includes(event.key.toLowerCase())){
  event.preventDefault();
  if(event.key.toLowerCase()==='z')$('undo').click();else $('redo').click();
 }
});
// Native track gestures run through the same existing S3 neutral contract and local save gate.
$('timeline').addEventListener('pointerdown',event=>{
 const clip=event.target.closest('.clip[data-layer]');
 if(!clip||event.button!==0||busy||gesture)return;
 selected=clip.dataset.layer;selectedKey=null;
 const l=history.present.layers.find(x=>x.id===selected);
 gesture={id:event.pointerId,clip,startX:event.clientX,start:l.start_frame,end:l.end_frame,
  type:event.target.dataset.edge==='start'?'trim-start':
       event.target.dataset.edge==='end'?'trim-end':'move'};
 clip.setPointerCapture(event.pointerId);event.preventDefault();
});
$('timeline').addEventListener('pointermove',event=>{
 if(!gesture||event.pointerId!==gesture.id)return;
 const dx=event.clientX-gesture.startX;
 if(gesture.type==='move')gesture.clip.style.transform='translateX('+dx+'px)';
 else if(gesture.type==='trim-start'){
  gesture.clip.style.transform='translateX('+dx+'px)';
  gesture.clip.style.width=Math.max(unit*2,(gesture.end-gesture.start)*unit-dx)+'px';
 }else gesture.clip.style.width=Math.max(unit*2,(gesture.end-gesture.start)*unit+dx)+'px';
});
$('timeline').addEventListener('pointerup',async event=>{
 if(!gesture||gesture.id!==event.pointerId)return;
 const g=gesture;gesture=null;
 if(g.clip.hasPointerCapture(event.pointerId))g.clip.releasePointerCapture(event.pointerId);
 const delta=Math.round((event.clientX-g.startX)/unit);
 if(delta===0){paint();return;}
 const operation=g.type==='move'?{type:'move',layerId:selected,deltaFrames:delta}:
  {type:g.type,layerId:selected,frame:(g.type==='trim-start'?g.start:g.end)+delta};
 await apply(()=>historyWith(editTimeline(history.present,operation)),'timeline');
});
$('timeline').addEventListener('pointercancel',()=>{gesture=null;paint();});
try{
 if(!window.Konva?.Stage)throw Error('Konva 10.7.1 local package not installed');
 const response=await fetch('/scene.json',{cache:'no-store'});
 if(!response.ok)throw Error('Local scene unavailable');
 etag=response.headers.get('ETag');
 if(!etag)throw Error('Versioned local scene ETag required');
 history=makeTimelineHistory(parseEditableScene(await response.text()));
 if(!item())selected=history.present.layers[0].id;
 frame=Math.min(frame,history.present.duration_frames-1);
 stage=new window.Konva.Stage({container:'stage',width:stageWidth,height:stageHeight});
 layer=new window.Konva.Layer();stage.add(layer);
 paint();probe.ready=true;
 updateStatus('本機場景已載入，可編輯 · 尚未建立正式影片輸出連結');
}catch(error){probe.errors.push(String(error));updateStatus('無法啟動編輯器：'+String(error));throw error;}
