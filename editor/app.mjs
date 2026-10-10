// Opt-in Konva editor. Advisory object proxies only; no official Canvas output is modified.
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '/scene.mjs';
import {editTimeline,makeTimelineHistory,undoTimelineEdit,redoTimelineEdit} from '/timeline.mjs';
import {changeLayerAppearance,addEditorRectangle,removeEditorLayer,translateEditorLayer,uniqueLayerId} from '/operations.mjs';
import {fitNeutralPreview,neutralPreviewPoint,normalizedPointerDelta} from '/preview-geometry.mjs';

const $=id=>document.getElementById(id);
const unit=14;
const probe={ready:false,commits:0,canvasDrags:0,timelineActions:0,easeChanges:0,undo:0,redo:0,blocked:0,errors:[]};
window.__motionEditor=probe;
let history,etag,selected='headline',selectedKey=null,frame=12,busy=false,gesture=null;
let stage,layer,viewport;
let canvasPreviewKey=null,canvasPreviewRequest=0;
probe.trueCanvas={status:'not_requested',frame:null,etag:null,sha256:null};
const item=()=>history.present.layers.find(l=>l.id===selected);
const updateStatus=msg=>{$('status').textContent=msg;};
function clipValues(scene=history.present){return scene.layers.find(l=>l.id===selected);}
function historyWith(scene){
 return {past:[...structuredClone(history.past),structuredClone(history.present)].slice(-20),present:scene,future:[]};
}
function paint(){
 const s=history.present;
 viewport=fitNeutralPreview(s.canvas);
 stage.size({width:viewport.width,height:viewport.height});
 $('stage').style.width=viewport.width+'px';
 $('stage').style.height=viewport.height+'px';
 $('profile-label').textContent='場景 '+viewport.profile+' · 縮放預覽 '+viewport.width+'×'+viewport.height;
 if(!item())selected=s.layers[0].id;
 const target=item();
 if(selectedKey===null||!target.keys.some(k=>k.frame===selectedKey))selectedKey=target.keys.at(-1).frame;
 $('undo').disabled=history.past.length===0;
 $('redo').disabled=history.future.length===0;
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
 const chosen=target.keys.find(k=>k.frame===selectedKey);
 $('ease').value=chosen.ease;
 for(const field of ['x','y','scale','rotation','opacity'])
  $('key-'+field).value=String(chosen[field]);
 const controls=$('layer-list');controls.replaceChildren(...[...s.layers].sort((a,b)=>a.z-b.z).map(l=>{
  const button=document.createElement('button');button.className='layer-button';
  button.dataset.layer=l.id;button.setAttribute('aria-pressed',String(l.id===selected));
  button.textContent=l.id+' · '+(l.type==='text'?'文字':'矩形');return button;
 }));
 layer.destroyChildren();
 const active=evaluateEditableFrame(s,frame).layers;
 for(const entry of active){
  // Rectangles deliberately represent editable positions, not locked-font or output pixels.
  const point=neutralPreviewPoint(viewport,entry.x,entry.y);
  const shape=new window.Konva.Rect({
   id:entry.id,x:point.x,y:point.y,
   offsetX:45,offsetY:27,width:90,height:54,scaleX:entry.scale,scaleY:entry.scale,
   rotation:entry.rotation*180/Math.PI,opacity:entry.opacity,
   fill:entry.type==='text'?'#8abfcb':entry.color,
   stroke:entry.id===selected?'#ffffff':'#c9f0e0',strokeWidth:entry.id===selected?3:1,
   cornerRadius:entry.type==='text'?8:2,draggable:true
  });
  shape.on('click',()=>{selected=entry.id;selectedKey=null;paint();});
  shape.on('dragend',async()=>{
   if(busy)return paint();
   const delta=normalizedPointerDelta(viewport,shape.x()-point.x,shape.y()-point.y);
   if(Math.abs(delta.x)+Math.abs(delta.y)<.0001)return paint();
   selected=entry.id;selectedKey=null;
   try{await commit(historyWith(translateEditorLayer(history.present,entry.id,delta.x,delta.y)),'canvas');}
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
  for(const key of l.keys){
   const mark=document.createElement('span');mark.className='key-marker';
   mark.style.left=((key.frame-l.start_frame)*unit+11)+'px';
   mark.title='Keyframe '+key.frame+' ('+key.ease+')';
   clip.appendChild(mark);
  }
  track.appendChild(clip);row.append(name,track);rows.push(row);
 }
 timeline.replaceChildren(...rows);
 const playhead=document.createElement('div');playhead.className='playhead';
 playhead.style.left=(120+frame*unit)+'px';timeline.appendChild(playhead);
 probe.selected=selected;probe.keyframe=selectedKey;probe.frame=frame;
 probe.preview={...viewport,kind:'NEUTRAL_POSITION_PROXY_NOT_OFFICIAL_PIXELS'};
 const currentPreviewKey=etag+':'+frame;
 if(canvasPreviewKey!==currentPreviewKey){
  $('rendered-image').hidden=true;
  $('rendered-status').textContent='第 '+frame+' 格尚未建立正式 Canvas 預覽；請按按鈕產生已儲存影格。';
  probe.trueCanvas={status:'not_current',frame,etag,sha256:null};
 }

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
$('save-values').addEventListener('click',()=>apply(()=>{
 const old=item().keys.find(k=>k.frame===selectedKey);
 let scene=history.present,changed=0;
 for(const field of ['x','y','scale','rotation','opacity']){
  const input=$('key-'+field),value=Number(input.value);
  if(input.value.trim()===''||!Number.isFinite(value))throw Error('Invalid '+field);
  if(value!==old[field]){
   scene=editTimeline(scene,{type:'set-key',layerId:selected,frame:selectedKey,
    property:field,value});
   changed++;
  }
 }
 if(!changed)throw Error('Keyframe values did not change');
 return historyWith(scene);
},'key-values'));
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
// Explicit on-demand read-only final-S1-Canvas pixel preview. No video export/network.
$('render-frame').addEventListener('click',async()=>{
 if(busy)return;
 const askedFrame=frame,askedTag=etag,key=askedTag+':'+askedFrame;
 const requestId=++canvasPreviewRequest;
 $('render-frame').disabled=true;
 $('rendered-status').textContent='正在從本機正式 Canvas 讀取第 '+askedFrame+' 格…';
 probe.trueCanvas={status:'loading',frame:askedFrame,etag:askedTag,sha256:null};
 try{
  const response=await fetch('/render-preview.png?frame='+askedFrame,{
   method:'GET',cache:'no-store',
   headers:{'X-Motion-Preview':'1','If-Match':askedTag}
  });
  if(!response.ok){
   if(response.status===503)throw Error('尚未安裝正式 Canvas 依賴。請在專案根目錄執行 npm.cmd ci，然後重啟編輯器。');
   if(response.status===409)throw Error('場景已被其他視窗修改；重新載入後再預覽。');
   if(response.status===422)throw Error('此場景含正式鎖定字型無法渲染的內容；檢查文字及場景數值。');
   throw Error('本機 Canvas 預覽被拒絕（HTTP '+response.status+'）。');
  }
  if(response.headers.get('Content-Type')!=='image/png')throw Error('預覽服務未回傳 PNG');
  const png=await response.blob();
  const url=await new Promise((resolveUrl,rejectUrl)=>{
   const reader=new FileReader();
   reader.onload=()=>resolveUrl(reader.result);
   reader.onerror=()=>rejectUrl(Error('無法載入本機 PNG'));
   reader.readAsDataURL(png);
  });
  if(requestId!==canvasPreviewRequest||key!==etag+':'+frame)return;
  $('rendered-image').src=url;
  $('rendered-image').hidden=false;
  $('rendered-status').textContent='已顯示第 '+askedFrame+' 格的正式 Canvas 影格（已儲存場景，非 Konva 代理）。';
  canvasPreviewKey=key;
  probe.trueCanvas={status:'ready',frame:askedFrame,etag:askedTag,
   sha256:response.headers.get('ETag'),bytes:png.size};
 }catch(error){
  if(requestId!==canvasPreviewRequest||key!==etag+':'+frame)return;
  $('rendered-image').hidden=true;
  $('rendered-status').textContent='正式 Canvas 預覽不可用：'+String(error.message||error);
  probe.trueCanvas={status:'unavailable',frame:askedFrame,etag:askedTag,sha256:null};
 }finally{$('render-frame').disabled=false;}
});
$('undo').addEventListener('click',()=>{
 if(busy||history.past.length===0)return;
 apply(()=>undoTimelineEdit(history),'undo');
});
$('redo').addEventListener('click',()=>{
 if(busy||history.future.length===0)return;
 apply(()=>redoTimelineEdit(history),'redo');
});
document.addEventListener('keydown',event=>{
 if(!(event.ctrlKey||event.metaKey)||event.altKey)return;
 const key=event.key.toLowerCase();
 if(key!=='z'&&key!=='y')return;
 // Native text/number/select editing keeps its own browser Undo stack.
 if(event.target?.closest?.('input,textarea,select,[contenteditable]'))return;
 const direction=key==='y'||(key==='z'&&event.shiftKey)?'redo':'undo';
 if(busy||(direction==='undo'?!history.past.length:!history.future.length))return;
 event.preventDefault();
 $(direction).click();
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
 const initialView=fitNeutralPreview(history.present.canvas);
 stage=new window.Konva.Stage({container:'stage',width:initialView.width,height:initialView.height});
 layer=new window.Konva.Layer();stage.add(layer);
 paint();probe.ready=true;
 updateStatus('本機場景已載入，可編輯 · 尚未建立正式影片輸出連結');
}catch(error){probe.errors.push(String(error));updateStatus('無法啟動編輯器：'+String(error));throw error;}
