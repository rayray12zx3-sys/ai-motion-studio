import studio from '@theatre/studio';
import {getProject,types} from '@theatre/core';
import initialState from '../fixtures/project-state.json';

studio.initialize();
const project=getProject('Motion Studio M10 Editor',{state:initialState});
const sheet=project.sheet('Canvas');
const card=sheet.object('Practice Card',{
  x:types.number(0,{range:[-200,200]}),
  opacity:types.number(1,{range:[0,1]}),
  rotation:types.number(0,{range:[-180,180]}),
  scale:types.number(1,{range:[.5,2]})
});
const div=document.getElementById('card');
const range=document.getElementById('seek');
const clock=document.getElementById('clock');
card.onValuesChange(({x,opacity,rotation,scale})=>{
  div.style.transform='translateX('+x+'px) rotate('+rotation+'deg) scale('+scale+')';
  div.style.opacity=String(opacity);
});
range.addEventListener('input',()=>{
  sheet.sequence.position=Number(range.value)/30;
  clock.textContent=sheet.sequence.position.toFixed(2)+' sec';
});
// Browser-operable keyframe input. Edits go through Theatre Studio's official
// transaction API, so sequenced properties become real timeline keyframes.
const xInput=document.getElementById('keyframe-x');
const editStatus=document.getElementById('edit-status');
document.getElementById('set-keyframe').addEventListener('click',()=>{
  const next=xInput.valueAsNumber;
  if(!Number.isFinite(next)||next < -200||next > 200){
    editStatus.textContent='Invalid x: expected -200..200';
    return;
  }
  studio.transaction(({set})=>set(card.props.x,next));
  editStatus.textContent='Keyframe x='+next+' @ frame '+range.value;
});
document.getElementById('export').addEventListener('click',()=>{
  const snapshot=studio.createContentOfSaveFile('Motion Studio M10 Editor');
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;a.download='m10-state.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
project.ready.then(()=>{sheet.sequence.position=0;clock.textContent='0.00 sec';document.body.dataset.theatreReady='true';});
