// Original procedural art kit. Local Canvas paths, no imported images, online icons,
// system fonts, unseeded noise or background services.
import {fontFamily} from '../free/scene.mjs';
import {preciseEase} from './motion.mjs';

const ink='#171B26', ivory='#F3F1EB', dark='#202635', muted='#657078', blue='#3467D7', coral='#E55243',
  aqua='#45B7AC', pale='#DDE5E7', butter='#F0CE81';
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=(frame,start,end)=>preciseEase(clamp((frame-start)/(end-start)));
const sizeFont=(n)=>Math.max(7,Math.round(n));
function text(ctx,s,x,y,px,color=ink,{stroke=false,heavy=false,spacing=0}={}) {
  ctx.save();ctx.font=sizeFont(px)+'px '+fontFamily;ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.lineJoin='round';ctx.lineWidth=Math.max(1,px*.063);
  if(spacing){
    for(const ch of [...s]) {
      const width=ctx.measureText(ch).width;
      if(stroke){ctx.strokeStyle=color;ctx.strokeText(ch,x,y);}
      else {if(heavy){ctx.strokeStyle=color;ctx.strokeText(ch,x,y);}
        ctx.fillStyle=color;ctx.fillText(ch,x,y);}
      x+=width+spacing;
    }
  } else if(stroke){ctx.strokeStyle=color;ctx.strokeText(s,x,y);}
  else {if(heavy){ctx.strokeStyle=color;ctx.strokeText(s,x,y);}
    ctx.fillStyle=color;ctx.fillText(s,x,y);}
  ctx.restore();
}
function fit(ctx,s,max,requested,min=10,tracking=0){
  let v=requested;ctx.font=sizeFont(v)+'px '+fontFamily;
  const measured=ctx.measureText(s).width+Math.max(0,[...s].length-1)*tracking;
  if(measured>max) v*=max/measured;
  if(v<min) throw new Error('Graphic typography outside readable bounds');
  return v;
}
function rect(ctx,x,y,w,h,fill){
  ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);
}
function ring(ctx,x,y,r,col,width=2,start=0,end=2*Math.PI) {
  ctx.beginPath();ctx.arc(x,y,r,start,end);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();
}
function round(ctx,x,y,w,h,r,color){
  r=Math.min(Math.max(0,r),w*.5,h*.5);
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
}
function line(ctx,x1,y1,x2,y2,c,w=1){
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.stroke();
}
function pattern(ctx,x,y,w,h,step=24,c='#BAC1BE'){
  const r=Math.max(.65,step*.045);
  ctx.fillStyle=c;
  for(let px=x+step*.5;px<x+w;px+=step){
    for(let py=y+step*.5;py<y+h;py+=step){
      ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
    }
  }
}
function topRule(ctx,a,index,tag){
  const x=a.x,y=a.y,w=a.w,h=a.h,u=Math.min(w,h);
  text(ctx,tag,x+w*.055,y+h*.10,u*.035,ink,{spacing:u*.002});
  text(ctx,'0'+(index+1)+' / 04',x+w*.83,y+h*.10,u*.033,ink);
  line(ctx,x+w*.05,y+h*.155,x+w*.95,y+h*.155,'#AAB8B8',Math.max(1,u*.0015));
}
function stageBase(ctx,a,col=ivory){
  ctx.save();ctx.beginPath();ctx.rect(a.x,a.y,a.w,a.h);ctx.clip();
  rect(ctx,a.x,a.y,a.w,a.h,col);
  ctx.strokeStyle='#B7C0BE';ctx.lineWidth=Math.max(1,Math.min(a.w,a.h)*.002);
  ctx.strokeRect(a.x+1,a.y+1,a.w-2,a.h-2);
  return ()=>ctx.restore();
}
function drawOpening(ctx,a,frame,art){
  const restore=stageBase(ctx,a,'#E9E9E0'),{x,y,w,h}=a;
  const u=Math.min(w,h),isPortrait=h>w*.82,t=ease(frame,0,37);
  pattern(ctx,x+w*.50,y+h*.19,w*.45,h*.7,Math.max(9,u*.033),'#BEC6C1');
  topRule(ctx,a,0,'/ SYSTEM OF MOTION');
  const titleSize=fit(ctx,'DESIGN',w*(isPortrait?.83:.46),u*(isPortrait?.17:.20),u*.095);
  text(ctx,'DESIGN',x+w*.055,y+h*(isPortrait?.28:.41),titleSize,ink,{heavy:true});
  const outlined=fit(ctx,'IN MOTION',w*(isPortrait?.84:.52),u*(isPortrait?.108:.122),u*.055);
  text(ctx,'IN MOTION',x+w*.06,y+h*(isPortrait?.39:.63),outlined,coral,{stroke:true});
  rect(ctx,x+w*.06,y+h*(isPortrait?.44:.70),w*.28*t,Math.max(2,u*.014),coral);
  text(ctx,'01 — THE SHAPE',x+w*.06,y+h*(isPortrait?.49:.80),u*.031,ink,{spacing:u*.006});
  // A purpose-built diagrammatic image collage, rather than one large icon.
  const cx=x+w*(isPortrait?.53:.79),cy=y+h*(isPortrait?.72:.53),r=u*(isPortrait?.18:.28);
  for(let i=0;i<18;i++){
    const theta=i*Math.PI/9+Math.PI*.1;
    line(ctx,cx+Math.cos(theta)*r*.86,cy+Math.sin(theta)*r*.86,
      cx+Math.cos(theta)*r*1.10,cy+Math.sin(theta)*r*1.10,
      i%3===0?coral:'#8B9A99',Math.max(1,u*.003));
  }
  for(let i=0;i<3;i++)ring(ctx,cx,cy,r*(.35+i*.29),i===1?coral:ink,Math.max(1,u*.003),
    -Math.PI*.53+i*.2,-Math.PI*.53+i*.2+Math.PI*(1.1+t*.6));
  ctx.save();ctx.translate(cx,cy);ctx.rotate((1-t)*-.28);
  const badge=r*.64;ctx.drawImage(art.image,-badge/2,-badge/2,badge,badge);ctx.restore();
  // Registration marks make the asset feel like a designed collection.
  line(ctx,cx-r*1.12,cy,cx-r*.94,cy,ink,1.5);
  line(ctx,cx+r*.94,cy,cx+r*1.12,cy,ink,1.5);
  restore();
}
function drawInterface(ctx,a,frame){
  const restore=stageBase(ctx,a,'#E0E6E2'),{x,y,w,h}=a,u=Math.min(w,h);
  const portrait=h>w*.82,local=frame-90;
  const enter=ease(local,-12,33),toggle=ease(local,19,54);
  topRule(ctx,a,1,'/ REACTIVE OBJECT');
  const px=x+w*.075,py=y+h*.205,pw=w*.85,ph=h*.69;
  round(ctx,px,py,pw,ph,u*.024,'#202635');
  // Inner app window and chrome.
  const inset=pw*.027, ix=px+inset,iy=py+ph*.10,iw=pw-2*inset,ih=ph*.82;
  round(ctx,ix,iy,iw,ih,u*.016,'#F8F8F0');
  for(let i=0;i<3;i++){
    rect(ctx,px+pw*(.043+i*.034),py+ph*.043,Math.max(3,u*.012),Math.max(3,u*.012),
      [coral,butter,aqua][i]);
  }
  const left=ix+iw*.06,innerY=iy+ih*.11;
  text(ctx,'ACTIONS  /  02',left,innerY,u*.037,ink,{spacing:u*.0015});
  text(ctx,toggle>.6?'CONNECTED':'READY',left,innerY+ih*.18,
    fit(ctx,'CONNECTED',iw*.59,u*.107,u*.063),ink,{heavy:true});
  const barW=iw*(portrait?.62:.42),barY=innerY+ih*.31;
  round(ctx,left,barY,barW,Math.max(4,ih*.045),ih*.025,'#D3DCDF');
  round(ctx,left,barY,Math.max(2,barW*(.12+.84*enter)),Math.max(4,ih*.045),ih*.025,blue);
  for(let i=0;i<5;i++){
    rect(ctx,left+i*iw*.075,innerY+ih*.47,
      iw*.05,ih*(.06+.08*Math.sin(i*.8+enter*2)**2),[coral,blue,aqua,ink,butter][i]);
  }
  const knobX=ix+iw*(portrait?.53:.72),knobY=iy+ih*.68;
  const trackW=iw*.18,trackH=Math.max(13,ih*.12);
  round(ctx,knobX,knobY,trackW,trackH,trackH*.5,toggle>.5?aqua:'#B6BFC5');
  ctx.fillStyle='#FDFDFB';ctx.beginPath();
  ctx.arc(knobX+trackH*.5+toggle*(trackW-trackH),knobY+trackH*.5,trackH*.34,0,Math.PI*2);
  ctx.fill();
  // Cursor arrival, click pressure and outgoing ripple.
  const cursorX=knobX-trackW*(1-toggle)*.32,cursorY=knobY+trackH*.75;
  ctx.save();ctx.translate(cursorX,cursorY);
  ctx.fillStyle=ink;ctx.beginPath();ctx.moveTo(0,0);
  ctx.lineTo(u*.046,u*.09);ctx.lineTo(u*.050,u*.055);
  ctx.lineTo(u*.080,u*.049);ctx.closePath();ctx.fill();
  ctx.restore();
  if(local>22&&local<64){
    ring(ctx,knobX+trackW*.65,knobY+trackH*.5,trackH*(.5+toggle),coral,
      Math.max(1,u*.004));
  }
  text(ctx,'DRAG   •   MORPH   •   CHANGE',left,iy+ih*.91,u*.028,'#67747C',
    {spacing:u*.0018});
  restore();
}
function drawInsights(ctx,a,frame){
  const restore=stageBase(ctx,a,'#EBEEE8'),{x,y,w,h}=a,u=Math.min(w,h);
  const isPortrait=h>w*.82,local=frame-180,progress=ease(local,-12,52);
  topRule(ctx,a,2,'/ MOTION INTELLIGENCE');
  const left=x+w*.065;
  text(ctx,'84.6',left,y+h*.40,
    fit(ctx,'84.6',w*.50,u*(isPortrait?.205:.245),u*.12),ink,{heavy:true});
  round(ctx,left+w*.33,y+h*.29,w*.23,Math.max(12,u*.069),u*.03,'#CBE5DF');
  text(ctx,'+24.8%',left+w*.35,y+h*.29+Math.max(6,u*.034),u*.045,'#136D66',{heavy:true});
  text(ctx,'LIVE PERFORMANCE',left,y+h*.50,u*.030,muted,{spacing:u*.004});
  const chart={x:x+w*.065,y:y+h*(isPortrait?.61:.55),w:w*.65,h:h*(isPortrait?.27:.31)};
  for(let i=0;i<4;i++){
    line(ctx,chart.x,chart.y+i*chart.h/3,chart.x+chart.w,chart.y+i*chart.h/3,
      '#C6CECA',Math.max(1,u*.001));
  }
  const levels=[.28,.52,.39,.73,.61,.92,.76];
  for(let i=0;i<levels.length;i++){
    const v=ease(local,i*5-10,i*5+35),bw=chart.w*.082;
    const bx=chart.x+chart.w*.05+chart.w*i*.13,bh=chart.h*levels[i]*v;
    rect(ctx,bx,chart.y+chart.h-bh,bw,bh,i===5?coral:blue);
    rect(ctx,bx,chart.y+chart.h-bh,bw,Math.max(2,u*.008),ink);
  }
  // Micro-chart line, masked along the shared progression.
  ctx.save();ctx.beginPath();ctx.rect(chart.x,chart.y,chart.w*progress,chart.h);ctx.clip();
  ctx.strokeStyle=coral;ctx.lineWidth=Math.max(2,u*.009);ctx.beginPath();
  const nodes=[.53,.48,.62,.47,.39,.28,.18];
  nodes.forEach((n,i)=>{
    const px=chart.x+chart.w*(.09+i*.13),py=chart.y+chart.h*n;
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  });ctx.stroke();ctx.restore();
  // A distinct secondary radial instrument becomes the art asset for this shot.
  const rcx=x+w*(isPortrait?.77:.84),rcy=y+h*(isPortrait?.39:.60),rr=u*(isPortrait?.115:.17);
  ring(ctx,rcx,rcy,rr,'#D7DDDA',Math.max(4,u*.035));
  ring(ctx,rcx,rcy,rr,coral,Math.max(4,u*.035),-Math.PI*.5,
    -Math.PI*.5+Math.PI*1.65*progress);
  text(ctx,'SYNC',rcx-rr*.55,rcy,u*.042,ink,{heavy:true});
  text(ctx,'30 FPS',rcx-rr*.58,rcy+rr*.5,u*.029,muted);
  restore();
}
function drawFinale(ctx,a,frame,art){
  const restore=stageBase(ctx,a,dark),{x,y,w,h}=a,u=Math.min(w,h);
  const local=Math.min(frame-270,59),p=ease(local,-12,41),portrait=h>w*.82;
  for(let i=0;i<11;i++){
    const yy=y+h*(.18+i*.061);
    line(ctx,x+w*.05,yy,x+w*.95,yy,'#3B4552',Math.max(1,u*.001));
  }
  text(ctx,'/ ART DIRECTED MOTION',x+w*.065,y+h*.10,u*.035,'#A3C4CE',
    {spacing:u*.003});
  // Deliberately oversized but bounded, outlined typography is itself artwork.
  const big=fit(ctx,'MOVE',w*.70,u*(portrait?.19:.22),u*.10);
  ctx.save();
  ctx.beginPath();ctx.rect(x+w*.055,y+h*.235,w*.68,h*.53);ctx.clip();
  text(ctx,'MOVE',x+w*.07,y+h*(portrait?.40:.47),big,ivory,{heavy:true});
  const sub=fit(ctx,'WHAT MATTERS',w*.64,u*(portrait?.078:.093),u*.035);
  text(ctx,'WHAT MATTERS',x+w*.07,y+h*(portrait?.51:.63),sub,butter,{stroke:true});
  ctx.restore();
  // Stacked stamps/identity detail and large kinetic rosette with inky shadows.
  const cx=x+w*(portrait?.59:.81),cy=y+h*(portrait?.72:.52),r=u*(portrait?.155:.19);
  ring(ctx,cx,cy,r,'#8FA7B6',Math.max(1,u*.004),-Math.PI*.5,
    -Math.PI*.5+Math.PI*1.9*p);
  for(let i=0;i<10;i++){
    const th=(i/10)*Math.PI*2;
    const d=r*(1.06+.07*Math.sin(i*1.3));
    line(ctx,cx+Math.cos(th)*d*.83,cy+Math.sin(th)*d*.83,
      cx+Math.cos(th)*d,cy+Math.sin(th)*d,butter,Math.max(1,u*.006));
  }
  ctx.save();ctx.globalAlpha=p;
  ctx.drawImage(art.image,cx-r*.53,cy-r*.53,r*1.06,r*1.06);ctx.restore();
  rect(ctx,x+w*.065,y+h*.87,w*.37,Math.max(2,u*.012),coral);
  text(ctx,'DESIGN / MOTION / SYSTEM',x+w*.065,y+h*.93,u*.028,'#B2CBD2',{spacing:u*.002});
  restore();
}
export function drawDesignedStage(ctx,area,index,frame,art){
  if(index===0)drawOpening(ctx,area,frame,art);
  else if(index===1)drawInterface(ctx,area,frame);
  else if(index===2)drawInsights(ctx,area,frame);
  else if(index===3)drawFinale(ctx,area,frame,art);
  else throw new Error('Unknown designed stage');
}

// The top editorial headline is an explicit typographic system: filled display
// with controlled ink stroke, legible secondary type, and a section-coded signal.
export function drawDesignedTitle(ctx,beat,index,layout,width,height,dx=0){
  const x=layout.margin+dx,top=height*.198;
  const accent=[coral,blue,aqua,butter][index];
  const big=fit(ctx,beat.headline,width*.74,layout.titleSize*1.04,
    Math.max(12,layout.titleSize*.58));
  rect(ctx,x,top-big*.56,Math.max(3,width*.006),big*.92,accent);
  text(ctx,beat.headline,x+width*.018,top,big,ink,{heavy:true,spacing:big*.009});
  const sub=fit(ctx,beat.subtitle,width*.75,layout.subtitleSize,
    Math.max(9,layout.subtitleSize*.64));
  text(ctx,beat.subtitle,x+width*.018,layout.subtitleY,sub,'#3B4552',{spacing:sub*.009});
}
