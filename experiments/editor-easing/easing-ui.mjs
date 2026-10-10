// S3 standalone native keyframe easing modes only, NOT a Bezier curve GUI.
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '/scene.mjs';
import {makeTimelineHistory,commitTimelineEdit,undoTimelineEdit,redoTimelineEdit} from '/timeline.mjs';
const frameInput=document.getElementById('frame');
const frameLabel=document.getElementById('frame-value');
const keySelect=document.getElementById('key');
const easeSelect=document.getElementById('ease');
const status=document.getElementById('status');
const canvas=document.getElementById('preview');
const ctx=canvas.getContext('2d');
const probe={ready:false,saveCount:0,applyCount:0,undoCount:0,redoCount:0,rejectedCount:0,errors:[]};
window.__easeProbe=probe;
let history;
const headline=()=>history.present.layers.find(l=>l.id==='headline');
function render(){
 const h=headline(),frame=Number(frameInput.value);
 frameLabel.value=String(frame);frameLabel.textContent=String(frame);
 const chosen=keySelect.value;
 keySelect.replaceChildren(...h.keys.map(k=>{
  const option=document.createElement('option');
  option.value=String(k.frame);option.textContent=String(k.frame);
  return option;
 }));
 keySelect.value=h.keys.some(k=>String(k.frame)===chosen)?chosen:String(h.keys.at(-1).frame);
 const key=h.keys.find(k=>String(k.frame)===keySelect.value);
 easeSelect.value=key.ease;
 const current=evaluateEditableFrame(history.present,frame).layers.find(l=>l.id==='headline');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#10283b';ctx.fillRect(0,0,canvas.width,canvas.height);
 if(current){
  ctx.save();ctx.globalAlpha=current.opacity;
  ctx.fillStyle='#a2ead5';
  // Abstract sample block only, deliberately not official locked-font output.
  ctx.fillRect(current.x*360-25,current.y*460-17,50,34);
  ctx.restore();
 }
 probe.frame=frame;
 probe.sample=current?{x:current.x,y:current.y,opacity:current.opacity}:null;
 probe.target={frame:key.frame,ease:key.ease};
 probe.clip={start:h.start_frame,end:h.end_frame,keys:h.keys.map(k=>k.frame)};
 probe.history={undo:history.past.length,redo:history.future.length};
 status.textContent='Frame '+frame+' | easing='+key.ease+
  ' | undo='+history.past.length+' redo='+history.future.length;
}
function reject(e){
 probe.errors.push(String(e));probe.rejectedCount++;render();
 status.textContent='Rejected unsafe edit: '+String(e);
}
async function save(candidate,kind){
 // Publication only after validation and filesystem persistence succeed.
 const response=await fetch('/save',{method:'POST',
  headers:{'Content-Type':'application/json'},body:serializeEditableScene(candidate.present)});
 if(!response.ok)throw Error('Local save refused: '+response.status);
 const receipt=await response.json();
 if(receipt.persisted!==true)throw Error('No persisted scene confirmation');
 history=candidate;
 probe.receipt=receipt;probe.saveCount++;
 if(kind==='apply')probe.applyCount++;
 if(kind==='undo')probe.undoCount++;
 if(kind==='redo')probe.redoCount++;
 render();
}
document.getElementById('apply').addEventListener('click',async()=>{
 try{
  const operation={type:'set-key',layerId:'headline',frame:Number(keySelect.value),
   property:'ease',value:easeSelect.value};
  await save(commitTimelineEdit(history,operation),'apply');
 }catch(e){reject(e);}
});
document.getElementById('insert').addEventListener('click',async()=>{
 try{
  await save(commitTimelineEdit(history,{type:'insert-key',layerId:'headline',frame:12}),'insert');
 }catch(e){reject(e);}
});
document.getElementById('undo').addEventListener('click',async()=>{
 try{
  const next=undoTimelineEdit(history);
  if(next.past.length===history.past.length)return;
  await save(next,'undo');
 }catch(e){reject(e);}
});
document.getElementById('redo').addEventListener('click',async()=>{
 try{
  const next=redoTimelineEdit(history);
  if(next.future.length===history.future.length)return;
  await save(next,'redo');
 }catch(e){reject(e);}
});
frameInput.addEventListener('input',()=>render());
keySelect.addEventListener('change',()=>render());
try{
 const reply=await fetch('/scene.json',{cache:'no-store'});
 if(!reply.ok)throw Error('Synthetic scene not served');
 history=makeTimelineHistory(parseEditableScene(await reply.text()));
 render();probe.ready=true;
}catch(e){probe.errors.push(String(e));status.textContent='Failed: '+String(e);throw e;}
