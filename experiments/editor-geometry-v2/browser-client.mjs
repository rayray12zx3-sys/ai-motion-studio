// Isolated, original-synthetic browser proof. Never writes a v1 editor scene.
const stage=new window.Konva.Stage({container:'stage',width:360,height:640});
const layer=new window.Konva.Layer();
stage.add(layer);
async function renderVariant(variant){
 if(!['full','narrow'].includes(variant))throw Error('Unapproved synthetic variant');
 const response=await fetch('/projection?variant='+variant,{cache:'no-store'});
 if(!response.ok)throw Error('Synthetic geometry projection failed');
 const json=await response.json();
 if(json.width!==360||json.height!==640||json.layers.length!==2)throw Error('Unexpected source profile');
 layer.destroyChildren();
 for(const item of json.layers){
  const rectangle=new window.Konva.Rect({...item.props,name:item.id,listening:false});
  layer.add(rectangle);
 }
 layer.draw();
 window.__v2Research={
  ready:true,variant,
  snapshot:()=>({
   width:stage.width(),height:stage.height(),variant,
   nodes:layer.find('Rect').map(node=>({
    id:node.name(),x:node.x(),y:node.y(),width:node.width(),height:node.height(),
    offsetX:node.offsetX(),offsetY:node.offsetY(),
    rotation:node.rotation(),scaleX:node.scaleX(),scaleY:node.scaleY(),opacity:node.opacity()
   }))
  }),
  png:()=>stage.toDataURL({pixelRatio:1})
 };
 document.getElementById('status').textContent='Synthetic geometry '+variant+' ready';
}
document.getElementById('shrink').addEventListener('click',()=>renderVariant('narrow'));
document.getElementById('restore').addEventListener('click',()=>renderVariant('full'));
renderVariant('full').catch(error=>{
 document.getElementById('status').textContent='FAIL '+error.message;
});
