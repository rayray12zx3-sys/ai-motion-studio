// ISOLATED geometry-v2 Canvas research; never called by existing v1 exporter,
// official render CLI or localhost editor. Existing @napi-rs/canvas and locked
// Noto Sans font only; no added runtime packages.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily,validateSpec} from '../../src/free/scene.mjs';
import {validateGeometryV2Scene} from './scene.mjs';
import {projectGeometryV2Frame} from './geometry.mjs';

export function drawGeometryV2Frame(scene,frame,{output='opaque'}={}){
 validateGeometryV2Scene(scene);
 if(!['opaque','transparent'].includes(output))throw Error('Unsupported v2 output');
 for(const l of scene.layers){
  if(l.type==='text')validateSpec({title:l.text,subtitle:l.text});
 }
 const {width,height}=scene.canvas;
 const canvas=createCanvas(width,height);
 const ctx=canvas.getContext('2d');
 if(output==='opaque'){
  ctx.fillStyle='#10283b';
  ctx.fillRect(0,0,width,height);
 }
 for(const l of projectGeometryV2Frame(scene,frame).layers){
  ctx.save();
  ctx.translate(l.x,l.y);
  ctx.rotate(l.rotation);
  ctx.scale(l.scale,l.scale);
  ctx.globalAlpha=l.opacity;
  ctx.fillStyle=l.color;
  if(l.type==='rect'){
   ctx.fillRect(-l.width/2,-l.height/2,l.width,l.height);
  }else{
   // One-line bounded text is deliberate research scope. Konva/browser fonts
   // may differ; never claim literal pixel parity for text without browser QA.
   ctx.font=l.fontSize+'px '+fontFamily;
   ctx.textAlign=l.align;
   ctx.textBaseline='middle';
   const x=l.align==='left'?-l.width/2:l.align==='right'?l.width/2:0;
   ctx.fillText(l.text,x,0,l.width);
  }
  ctx.restore();
 }
 return canvas;
}
