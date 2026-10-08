// A continuous, authored interstitial layer that occludes ONE full scene at
// a time. There is never a split-screen mix of unrelated scenes/text fragments.
// Frame derivation is direct and deterministic; no previous-frame state or IO.
import {fontFamily} from '../free/scene.mjs';

const dark='#243042', light='#F4F2E9', blue='#7DC2D4', accent='#F27960';
const check = n=>Number.isFinite(n) && n>=0 && n<=1;
export function curtainState(progress,current,incoming) {
  if(!check(progress)||!Number.isInteger(current)||!Number.isInteger(incoming)||
     current<0||incoming!==current+1||incoming>3) {
    throw new Error('Invalid authored curtain phase');
  }
  const covering=progress<.5;
  return {
    scene:covering?current:incoming,
    next:incoming,
    phase:covering?'cover-outgoing':'reveal-incoming',
    offset:covering?0:2*progress-1,
    coverage:covering?2*progress:2*(1-progress),
  };
}
function strokeLine(ctx,x1,y1,x2,y2,color,width=1) {
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
  ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function ring(ctx,cx,cy,r,color,width,start,end) {
  ctx.beginPath();ctx.arc(cx,cy,r,start,end);
  ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function type(ctx,value,x,y,size,color,outlined=false) {
  ctx.save();ctx.font=Math.max(9,Math.round(size))+'px '+fontFamily;
  ctx.textBaseline='middle';ctx.textAlign='left';
  ctx.lineJoin='round';ctx.lineWidth=Math.max(1,size*.022);
  if(outlined){ctx.strokeStyle=color;ctx.strokeText(value,x,y);}
  else {ctx.fillStyle=color;ctx.fillText(value,x,y);}
  ctx.restore();
}
export function drawArtDirectedCurtain(ctx,layout,w,h,state,art) {
  if(!state||state.coverage<=0)return;
  const x=layout.margin,y=h*.12,bottom=layout.stage.y+layout.stage.h;
  const ww=w-2*x,hh=bottom-y,unit=Math.min(ww,hh);
  const clipX=x+ww*state.offset,clipW=ww*state.coverage;
  ctx.save();ctx.beginPath();ctx.rect(clipX,y,clipW,hh);ctx.clip();
  ctx.fillStyle=dark;ctx.fillRect(x,y,ww,hh);
  // Visually designed interstitial rather than a blank colour wipe.
  for(let i=0;i<16;i++){
    const sx=x+ww*(.13+i*.057);
    strokeLine(ctx,sx,y+hh*.10,sx-ww*.19,y+hh*.89,
      i%4===0?'#506578':'#36485C',Math.max(1,unit*.002));
  }
  const cx=x+ww*.75,cy=y+hh*.54,r=unit*.19;
  for(let i=0;i<24;i++){
    const theta=2*Math.PI*i/24;
    strokeLine(ctx,cx+Math.cos(theta)*r*.96,cy+Math.sin(theta)*r*.96,
      cx+Math.cos(theta)*r*1.13,cy+Math.sin(theta)*r*1.13,
      i%3===0?accent:'#86A9B6',Math.max(1,unit*.0035));
  }
  ring(ctx,cx,cy,r,blue,Math.max(1.4,unit*.005),-Math.PI*.48,Math.PI*.97);
  ring(ctx,cx,cy,r*.74,'#8EA6B5',Math.max(1,unit*.0025),Math.PI*.36,Math.PI*1.88);
  const icon=Math.max(14,unit*.085);
  if(art?.image)ctx.drawImage(art.image,cx-icon*.5,cy-icon*.5,icon,icon);
  const number=String(state.next+1).padStart(2,'0');
  type(ctx,'/ TRANSITION PROTOCOL',x+ww*.055,y+hh*.12,unit*.039,blue);
  strokeLine(ctx,x+ww*.055,y+hh*.18,x+ww*.95,y+hh*.18,'#7795A9',Math.max(1,unit*.002));
  // A large outlined section numeral and hierarchy replace clipped old/new letters.
  type(ctx,number,x+ww*.07,y+hh*.46,unit*.30,light,true);
  type(ctx,'SHIFT / '+number,x+ww*.07,y+hh*.68,unit*.079,light);
  type(ctx,'DESIGN  →  MOTION',x+ww*.075,y+hh*.78,unit*.035,'#D3DDE0');
  for(let i=0;i<5;i++){
    const bx=x+ww*(.07+i*.045);
    ctx.fillStyle=i===state.next?accent:'#8797A8';
    ctx.fillRect(bx,y+hh*.89,Math.max(3,ww*.031),Math.max(2,unit*.012));
  }
  // The animated curtain edge is deliberately visible and graphic.
  const edge=state.phase==='cover-outgoing'?clipX+clipW:clipX;
  ctx.fillStyle=accent;
  ctx.fillRect(edge-Math.max(1,unit*.003),y,Math.max(2,unit*.008),hh);
  ctx.restore();
}
