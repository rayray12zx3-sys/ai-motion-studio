// Editor-only viewport mapping for existing S1 neutral scene dimensions.
// This corrects canvas aspect and pointer math, NOT final Canvas+FFmpeg pixels.
const allowed = new Set(['360x640','640x360','1080x1920','1920x1080']);
export function fitNeutralPreview(canvas,{maxWidth=360,maxHeight=640}={}){
 if(canvas===null||typeof canvas!=='object'||Array.isArray(canvas)||
    !Number.isInteger(canvas.width)||!Number.isInteger(canvas.height)||
    !allowed.has(canvas.width+'x'+canvas.height))throw Error('Unsupported S1 editor canvas');
 if(!Number.isFinite(maxWidth)||!Number.isFinite(maxHeight)||
    maxWidth<=0||maxHeight<=0||maxWidth>1920||maxHeight>1920)
  throw Error('Invalid editor viewport constraints');
 const scale=Math.min(maxWidth/canvas.width,maxHeight/canvas.height);
 const width=canvas.width*scale,height=canvas.height*scale;
 return Object.freeze({sourceWidth:canvas.width,sourceHeight:canvas.height,
  width,height,scale,profile:canvas.width+'x'+canvas.height});
}
export function neutralPreviewPoint(view,x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid preview point');
 return {x:x*view.width,y:y*view.height};
}
export function normalizedPointerDelta(view,dx,dy){
 if(!view||!Number.isFinite(view.width)||!Number.isFinite(view.height)||
    view.width<=0||view.height<=0||!Number.isFinite(dx)||!Number.isFinite(dy))
  throw Error('Invalid preview drag');
 return {x:dx/view.width,y:dy/view.height};
}
