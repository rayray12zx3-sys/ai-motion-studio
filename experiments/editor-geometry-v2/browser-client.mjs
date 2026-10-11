// Isolated synthetic v2 browser proof. Not a production editor or saved-scene API.
// Konva text layout PROP geometry is checked but font glyph pixels are not.
const stage=new window.Konva.Stage({container:'stage',width:360,height:640});
const rectLayer=new window.Konva.Layer();
const textLayer=new window.Konva.Layer();
stage.add(rectLayer);stage.add(textLayer);
async function renderVariant(variant){
 if(!['full','narrow'].includes(variant))throw Error('Unapproved synthetic variant');
 const response=await fetch('/projection?variant='+variant,{cache:'no-store'});
 if(!response.ok)throw Error('Synthetic geometry projection failed');
 const json=await response.json();
 if(json.width!==360||json.height!==640||json.layers.length!==4)
  throw Error('Unexpected synthetic profile');
 rectLayer.destroyChildren();textLayer.destroyChildren();
 for(const item of json.layers){
  if(item.type==='rect')
   rectLayer.add(new window.Konva.Rect({...item.props,name:item.id,listening:false}));
  else if(item.type==='text')
   textLayer.add(new window.Konva.Text({...item.props,name:item.id,listening:false}));
  else throw Error('Unsupported research node type');
 }
 rectLayer.draw();textLayer.draw();
 window.__v2Research={
  ready:true,variant,
  snapshot:()=>({
   width:stage.width(),height:stage.height(),variant,
   nodes:rectLayer.find('Rect').map(node=>({
    id:node.name(),x:node.x(),y:node.y(),width:node.width(),height:node.height(),
    offsetX:node.offsetX(),offsetY:node.offsetY(),
    rotation:node.rotation(),scaleX:node.scaleX(),scaleY:node.scaleY(),opacity:node.opacity()
   })),
   textNodes:textLayer.find('Text').map(node=>({
    id:node.name(),text:node.text(),fontSize:node.fontSize(),align:node.align(),
    x:node.x(),y:node.y(),width:node.width(),height:node.height(),
    offsetX:node.offsetX(),offsetY:node.offsetY(),opacity:node.opacity()
   }))
  }),
  rectPng:()=>{
   // Only the rectangle layer is compared to the independent native Canvas
   // renderer. Text glyph parity is explicitly out of scope.
   textLayer.hide();
   const data=stage.toDataURL({pixelRatio:1});
   textLayer.show();
   return data;
  }
 };
 document.getElementById('status').textContent='Synthetic geometry '+variant+' ready';
}
document.getElementById('shrink').addEventListener('click',()=>renderVariant('narrow'));
document.getElementById('restore').addEventListener('click',()=>renderVariant('full'));
renderVariant('full').catch(error=>{
 document.getElementById('status').textContent='FAIL '+error.message;
});
