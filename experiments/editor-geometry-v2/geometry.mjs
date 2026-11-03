// Shared pure geometry projections for the isolated v2 research painter and
// a potential future Konva adapter. Shape POSITION and rectangle dimensions
// share the same math; actual font glyph pixels/WYSIWYG are not established.
import {evaluateGeometryV2Frame,validateGeometryV2Scene} from './scene.mjs';

export function projectGeometryV2Frame(scene,frame,{width=scene.canvas.width,height=scene.canvas.height}={}){
 validateGeometryV2Scene(scene);
 const {width:sourceWidth,height:sourceHeight}=scene.canvas;
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||
    width>3840||height>3840)
  throw Error('Invalid v2 preview viewport size');
 const scale=width/sourceWidth;
 if(Math.abs(height/sourceHeight-scale)>1e-9)
  throw Error('v2 preview must preserve the exact source aspect ratio');
 const active=evaluateGeometryV2Frame(scene,frame).layers;
 const layers=active.map(l=>{
  const common={
   id:l.id,type:l.type,z:l.z,text:l.text,color:l.color,
   x:l.x*width,y:l.y*height,rotation:l.rotation,scale:l.scale,opacity:l.opacity
  };
  if(l.type==='rect'){
   return {...common,width:l.geometry.width*width,height:l.geometry.height*height,
    offsetX:l.geometry.width*width/2,offsetY:l.geometry.height*height/2};
  }
  const textWidth=l.geometry.max_width*width;
  // Canvas painter rounds the original source font pixel size once, then the
  // browser preview scales it. This avoids double-rounding source profiles.
  const fontSize=Math.max(10,Math.round(
   l.geometry.font_size*Math.min(sourceWidth,sourceHeight)))*scale;
  return {...common,width:textWidth,height:fontSize,
   fontSize,align:l.geometry.align,offsetX:textWidth/2,offsetY:fontSize/2};
 });
 return {frame,viewport:{width,height,scale},layers};
}

// Adapter DATA only, not a live Konva instance and not a commercial WYSIWYG claim.
export function v2KonvaNodeProps(layer){
 if(!layer||!['rect','text'].includes(layer.type))throw Error('Invalid projected v2 layer');
 const common={
  x:layer.x,y:layer.y,offsetX:layer.offsetX,offsetY:layer.offsetY,
  rotation:layer.rotation*180/Math.PI,scaleX:layer.scale,scaleY:layer.scale,
  opacity:layer.opacity
 };
 if(layer.type==='rect')return {...common,width:layer.width,height:layer.height,fill:layer.color};
 return {...common,width:layer.width,height:layer.height,fontSize:layer.fontSize,
  align:layer.align,text:layer.text,fill:layer.color,wrap:'none'};
}

// Source/preview rect corner projections are directly comparable. Unlike text,
// these geometries do not depend on installed font glyphs or browser text layout.
export function projectedRectCorners(layer){
 if(layer?.type!=='rect')throw Error('Rectangle projection required');
 const a=layer.width*layer.scale/2,b=layer.height*layer.scale/2;
 const s=Math.sin(layer.rotation),c=Math.cos(layer.rotation);
 return [[-a,-b],[a,-b],[a,b],[-a,b]].map(([x,y])=>({
  x:layer.x+x*c-y*s,y:layer.y+x*s+y*c
 }));
}
