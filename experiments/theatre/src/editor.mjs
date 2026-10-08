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
document.getElementById('export').addEventListener('click',()=>{
  const snapshot=studio.createContentOfSaveFile('Motion Studio M10 Editor');
  const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;a.download='m10-state.json';a.click();URL.revokeObjectURL(url);
});
project.ready.then(()=>{sheet.sequence.position=0;clock.textContent='0.00 sec';});
