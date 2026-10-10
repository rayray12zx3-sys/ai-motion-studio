// S4 synthetic in-memory Canvas preview only. NOT a production renderer/FFmpeg adapter.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily,validateSpec} from '../../src/free/scene.mjs';
import {validateEditableScene,evaluateEditableFrame} from '../editor-contract/scene.mjs';

const allowedProfiles=new Set(['360x640','1080x1920','640x360','1920x1080']);
export function paintEditablePreview(scene,frame,profile=scene?.canvas){
 validateEditableScene(scene);
 if(!profile||!Number.isInteger(profile.width)||!Number.isInteger(profile.height)||
  !allowedProfiles.has(profile.width+'x'+profile.height)||
  profile.width*scene.canvas.height!==scene.canvas.width*profile.height)
  throw Error('Isolated preview profile must match original aspect ratio');
 const layers=evaluateEditableFrame(scene,frame).layers;
 const canvas=createCanvas(profile.width,profile.height);
 const ctx=canvas.getContext('2d'),w=profile.width,h=profile.height;
 ctx.fillStyle='#10283b';ctx.fillRect(0,0,w,h);
 for(const l of layers){
  ctx.save();
  ctx.translate(l.x*w,l.y*h);
  ctx.rotate(l.rotation);
  ctx.scale(l.scale,l.scale);
  ctx.globalAlpha=l.opacity;
  ctx.fillStyle=l.color;
  if(l.type==='rect'){
   ctx.fillRect(-w*.13,-h*.023,w*.26,h*.046);
  }else if(l.type==='text'){
   // Both text fields are checked by existing production font-coverage validator;
   // this S4 adapter never relies on host fonts or external media.
   validateSpec({title:l.text,subtitle:l.text});
   ctx.font=Math.max(10,Math.round(Math.min(w,h)*.052))+'px '+fontFamily;
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(l.text,0,0,w*.78);
  }else throw Error('Unsupported preview element');
  ctx.restore();
 }
 return canvas;
}
