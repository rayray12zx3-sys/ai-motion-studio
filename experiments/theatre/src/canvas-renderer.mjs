// This prototype is NOT the M9 production renderer.
// A verified Theatre Core state drives a real @napi-rs/canvas drawing at
// a caller-selected frame number. No browser/Studio/current time needed.
import theatre from '@theatre/core';
import {createCanvas} from '@napi-rs/canvas';
import {readFileSync} from 'node:fs';

const {getProject,types}=theatre;
const state=JSON.parse(readFileSync(new URL('../fixtures/project-state.json',import.meta.url)));
export async function createKeyframedCanvasRenderer(){
  const project=getProject('M10 Sampled Canvas Renderer',{state});
  const sheet=project.sheet('Canvas');
  const card=sheet.object('Practice Card',{
    x:types.number(0,{range:[-200,200]}),
    opacity:types.number(1,{range:[0,1]}),
    rotation:types.number(0,{range:[-180,180]}),
    scale:types.number(1,{range:[0.5,2]})
  });
  await project.ready;
  return ({width,height,fps,frames},frame)=>{
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<100||height<100||
      fps!==30||!Number.isInteger(frames)||frames<90||
      !Number.isInteger(frame)||frame<0||frame>=frames)throw new Error('Invalid frame');
    sheet.sequence.position=frame/fps;
    const {x,opacity,rotation,scale}=card.value;
    const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
    ctx.fillStyle='#e4f1ea';ctx.fillRect(0,0,width,height);
    ctx.save();ctx.translate(width/2+x*width/800,height/2);ctx.rotate(rotation*Math.PI/180);
    ctx.scale(scale,scale);ctx.globalAlpha=opacity;
    ctx.fillStyle='#15796c';
    const w=Math.min(width*.6,260),h=Math.min(height*.25,110);
    ctx.fillRect(-w/2,-h/2,w,h);
    ctx.restore();
    return canvas;
  };
}
