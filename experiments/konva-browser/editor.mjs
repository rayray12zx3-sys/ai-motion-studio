import {parseEditableScene,serializeEditableScene,validateEditableScene} from '/contract.mjs';
const status=document.getElementById('status');
function show(message){status.textContent=message;}
function assert(value,message){if(!value)throw Error(message);}
try{
 assert(window.Konva && typeof window.Konva.Stage==='function','Packaged Konva did not load');
 const scene=parseEditableScene(await (await fetch('/scene.json',{cache:'no-store'})).text());
 const w=scene.canvas.width,h=scene.canvas.height;
 const layerData=scene.layers.find(x=>x.id==='card-title');
 assert(layerData?.type==='rect','Named synthetic card-title layer unavailable');
 const key=layerData.keys[0];
 const stage=new window.Konva.Stage({container:'stage',width:w,height:h});
 const canvasLayer=new window.Konva.Layer();
 stage.add(canvasLayer);
 const node=new window.Konva.Rect({
  id:'card-title',
  x:key.x*w,y:key.y*h,width:96,height:64,
  fill:layerData.color,cornerRadius:10,stroke:'#eeeeee',strokeWidth:2,draggable:true
 });
 canvasLayer.add(node);canvasLayer.draw();
 const initial={x:key.x,y:key.y};
 window.__konvaProbe={ready:true,dragEvents:0,saved:false,initial,saveError:null,loadedScene:scene};
 show('Ready: drag the synthetic card');
 node.on('dragend',async()=>{
  window.__konvaProbe.dragEvents+=1;
  show('Saving local synthetic editor state');
  try{
   const dx=(node.x()/w)-initial.x,dy=(node.y()/h)-initial.y;
   assert(Math.abs(dx)+Math.abs(dy)>.01,'No visible pointer-driven movement');
   const next=structuredClone(scene);
   const clip=next.layers.find(x=>x.id==='card-title');
   for(const k of clip.keys){k.x+=dx;k.y+=dy;}
   validateEditableScene(next);
   const json=serializeEditableScene(next);
   const saved=await fetch('/save',{method:'POST',headers:{'Content-Type':'application/json'},body:json});
   if(!saved.ok)throw Error('On-disk save rejected: '+saved.status);
   const data=await saved.json();
   assert(data.persisted===true,'Server did not confirm write');
   window.__konvaProbe.saved=true;
   window.__konvaProbe.current=next;
   window.__konvaProbe.receipt=data;
   show('Saved: reload should retain the drag');
  }catch(error){window.__konvaProbe.saveError=String(error);show('Save failed: '+String(error));}
 });
}catch(error){
 window.__konvaProbe={ready:false,saveError:String(error)};
 show('R&D editor failed: '+String(error));
 throw error;
}
