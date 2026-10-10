// Approved opt-in v1 neutral-scene painter using the existing locked Canvas runtime.
// Canvas+FFmpeg stays authoritative. Legacy drawFrame/render.mjs remain unchanged.
// This is NOT visual parity with Konva's selection-proxy rectangles.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily,validateSpec} from './scene.mjs';
import {validateEditableScene,evaluateEditableFrame} from '../../experiments/editor-contract/scene.mjs';

const allowedOutput=Object.freeze(['opaque','transparent']);
export function validateEditableRenderScene(scene){
 validateEditableScene(scene);
 // The locked official font coverage is authoritative for video text.
 // S1's editor accepts more Unicode than the renderer can safely typeset.
 for(const l of scene.layers)if(l.type==='text'){
  validateSpec({title:l.text,subtitle:l.text});
 }
 return true;
}
export function drawEditableSceneFrame(scene,frame,{output='opaque'}={}){
 validateEditableRenderScene(scene);
 if(!allowedOutput.includes(output))throw Error('Unsupported editable Canvas output mode');
 const active=evaluateEditableFrame(scene,frame).layers;
 const {width,height}=scene.canvas;
 const canvas=createCanvas(width,height);
 const ctx=canvas.getContext('2d');
 if(output==='opaque'){
  ctx.fillStyle='#10283b';
  ctx.fillRect(0,0,width,height);
 }
 for(const l of active){
  ctx.save();
  // Exact neutral scene v1 transform order. No CSS, animation clock or system fonts.
  ctx.translate(l.x*width,l.y*height);
  ctx.rotate(l.rotation);
  ctx.scale(l.scale,l.scale);
  ctx.globalAlpha=l.opacity;
  ctx.fillStyle=l.color;
  if(l.type==='rect'){
   // v1 authored geometry: center-anchored rectangle (no S1 width/height properties).
   // Do not silently infer editable Konva preview proxy pixel dimensions.
   ctx.fillRect(-width*.13,-height*.023,width*.26,height*.046);
  }else if(l.type==='text'){
   ctx.font=Math.max(10,Math.round(Math.min(width,height)*.052))+'px '+fontFamily;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(l.text,0,0,width*.78);
  }else throw Error('Unsupported editable scene layer');
  ctx.restore();
 }
 return canvas;
}
