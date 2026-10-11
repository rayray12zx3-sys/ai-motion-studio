// In-memory, original-synthetic isolated v2 study. No existing editor state,
// no filesystem writes or v1 migration. Real Konva nodes, v2 immutable edits.
import {parseGeometryV2Scene,serializeGeometryV2Scene,resizeGeometryV2Rect,
 editGeometryV2TextLayout} from '/v2/scene.mjs';
import {projectGeometryV2Frame,v2KonvaNodeProps} from '/v2/geometry.mjs';

const $=id=>document.getElementById(id);
const stage=new window.Konva.Stage({container:'stage',width:360,height:640});
const rectLayer=new window.Konva.Layer(),textLayer=new window.Konva.Layer();
stage.add(rectLayer);stage.add(textLayer);
let present=null,past=[],future=[];
const layerById=id=>present.layers.find(layer=>layer.id===id);
const activeVariant=()=>{
 const g=layerById('panel').geometry;
 return g.width===.78&&g.height===.255?'full':
  g.width===.32&&g.height===.12?'narrow':'custom';
};
function refresh(){
 const projection=projectGeometryV2Frame(present,30);
 if(projection.viewport.width!==360||projection.viewport.height!==640||
    projection.layers.length!==4)throw Error('Unexpected original synthetic v2 scene');
 rectLayer.destroyChildren();textLayer.destroyChildren();
 for(const item of projection.layers){
  const props={...v2KonvaNodeProps(item),name:item.id,listening:false};
  if(item.type==='rect')rectLayer.add(new window.Konva.Rect(props));
  else textLayer.add(new window.Konva.Text(props));
 }
 rectLayer.draw();textLayer.draw();
 const g=layerById('panel').geometry,t=layerById('headline').geometry;
 $('rect-width').value=String(g.width);$('rect-height').value=String(g.height);
 $('font-size').value=String(t.font_size);$('max-width').value=String(t.max_width);
 $('text-align').value=t.align;
 $('undo').disabled=past.length===0;$('redo').disabled=future.length===0;
 window.__v2Research={
  ready:true,variant:activeVariant(),
  snapshot:()=>({
   width:stage.width(),height:stage.height(),variant:activeVariant(),
   historyPast:past.length,historyFuture:future.length,
   controls:{width:layerById('panel').geometry.width,
    height:layerById('panel').geometry.height,
    fontSize:layerById('headline').geometry.font_size,
    maxWidth:layerById('headline').geometry.max_width,
    align:layerById('headline').geometry.align},
   nodes:rectLayer.find('Rect').map(node=>({
    id:node.name(),x:node.x(),y:node.y(),width:node.width(),height:node.height(),
    offsetX:node.offsetX(),offsetY:node.offsetY(),rotation:node.rotation(),
    scaleX:node.scaleX(),scaleY:node.scaleY(),opacity:node.opacity()
   })),
   textNodes:textLayer.find('Text').map(node=>({
    id:node.name(),text:node.text(),fontSize:node.fontSize(),align:node.align(),
    x:node.x(),y:node.y(),width:node.width(),height:node.height(),
    offsetX:node.offsetX(),offsetY:node.offsetY(),opacity:node.opacity()
   }))
  }),
  rectPng:()=>{
   textLayer.hide();textLayer.draw();
   const data=stage.toDataURL({pixelRatio:1});
   textLayer.show();textLayer.draw();
   return data;
  }
 };
 $('status').textContent='Geometry-v2 synthetic '+activeVariant()+' · local history '+past.length;
}
function commit(update){
 try{
  const next=update(present);
  if(serializeGeometryV2Scene(next)===serializeGeometryV2Scene(present))return;
  past.push(present);if(past.length>20)past.shift();
  present=next;future=[];
  refresh();
 }catch(error){$('status').textContent='Rejected, scene unchanged: '+error.message;}
}
$('apply-rect').addEventListener('click',()=>commit(s=>resizeGeometryV2Rect(s,'panel',{
 width:Number($('rect-width').value),height:Number($('rect-height').value)
})));
$('apply-text').addEventListener('click',()=>commit(s=>editGeometryV2TextLayout(s,'headline',{
 font_size:Number($('font-size').value),
 max_width:Number($('max-width').value),align:$('text-align').value
})));
$('shrink').addEventListener('click',()=>commit(s=>resizeGeometryV2Rect(s,'panel',{
 width:.32,height:.12
})));
$('restore').addEventListener('click',()=>commit(s=>resizeGeometryV2Rect(s,'panel',{
 width:.78,height:.255
})));
$('undo').addEventListener('click',()=>{
 if(!past.length)return;
 future.push(present);present=past.pop();refresh();
});
$('redo').addEventListener('click',()=>{
 if(!future.length)return;
 past.push(present);present=future.pop();refresh();
});
try{
 const res=await fetch('/fixture.json',{cache:'no-store'});
 if(!res.ok)throw Error('Unable to read isolated original synthetic fixture');
 present=parseGeometryV2Scene(await res.text());
 refresh();
}catch(error){$('status').textContent='FAIL '+error.message;}
