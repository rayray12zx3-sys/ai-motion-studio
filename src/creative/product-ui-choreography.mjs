// Original four-second Product-UI motion choreography.
// Public synthetic demo only: no imported app assets or native UI claims.
// Distinct from M11's three 1–3-second functional mockup fixtures.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily} from '../free/scene.mjs';
import {socialSafeRect} from './social-safe-area.mjs';

export const CHOREOGRAPHY_FRAMES=120;
const C=Object.freeze({
  charcoal:'#15272B',shadow:'#26393A',mint:'#25BFA2',
  amber:'#F5BC69',off:'#F5F5F0',light:'#DDF5EB',gray:'#8DA5A2',line:'#D7E6E1'
});
const clamp=n=>Math.max(0,Math.min(1,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{const v=clamp(t);return v*v*(3-2*v);};
const between=(f,a,b)=>ease((f-a)/(b-a));
const spring=t=>{
  const v=clamp(t);
  const response=1-Math.exp(-8*v)*(Math.cos(11*v)+(8/11)*Math.sin(11*v));
  const norm=1-Math.exp(-8)*(Math.cos(11)+(8/11)*Math.sin(11));
  // Normalize exact endpoint, allowing at most 2.2% transient overshoot.
  return v===1?1:Math.min(1.022,Math.max(0,response/norm));
};
const range=(f,start,end)=>spring((f-start)/(end-start));
const fade=(f,start,end)=>between(f,start,end);
const vec=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const node=(a,b,t)=>({
  x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),
  w:lerp(a.w,b.w,t),h:lerp(a.h,b.h,t),
  r:lerp(a.r,b.r,t)
});

export function evaluateProductUIChoreography(frame){
  if(!Number.isInteger(frame)||frame<0||frame>=CHOREOGRAPHY_FRAMES)
    throw new Error('Choreography requires integer frame 0..119');
  // All choreography is analytic by frame: independent of playback history.
  const enter=range(frame,0,18),pickA=range(frame,30,45);
  const pickB=range(frame,57,71),merge=between(frame,68,91);
  const reveal=between(frame,90,108);
  const pathA=vec([641,945],[218,620],between(frame,12,32));
  const pathB=vec([218,620],[512,620],between(frame,48,60));
  const cursor=vec(pathA,pathB,between(frame,44,60));
  const clickA=Math.max(0,1-Math.abs(frame-33)/8);
  const clickB=Math.max(0,1-Math.abs(frame-63)/8);
  const a=node({x:41,y:480,w:313,h:262,r:35},
    {x:167,y:500,w:389,h:179,r:83},merge);
  const b=node({x:366,y:480,w:313,h:262,r:35},
    {x:167,y:500,w:389,h:179,r:83},merge);
  const hero=node({x:41,y:221,w:638,h:184,r:34},
    {x:41,y:220,w:638,h:226,r:48},between(frame,79,106));
  return {
    enter,pickA,pickB,merge,reveal,
    cursor:{x:cursor[0],y:cursor[1],visible:1-fade(frame,72,88)},
    clickA,clickB,cardA:a,cardB:b,hero,
    cardBAlpha:1-fade(frame,75,88),
    cardTextAlpha:1-fade(frame,67,83),
    headerOldAlpha:1-fade(frame,79,92),
    headerNewAlpha:fade(frame,94,107),
    matchLabelAlpha:1-fade(frame,70,84),
    resultAlpha:fade(frame,86,103),
    stageScale:1+.015*Math.sin(clamp((frame-65)/20)*Math.PI)*merge,
    progress:lerp(.17,1,between(frame,40,108)),
    score:Math.round(2*reveal),
    hold:frame>=108
  };
}
function round(ctx,x,y,w,h,r,color,stroke){
  ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  if(color){ctx.fillStyle=color;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
function text(ctx,copy,x,y,size,color=C.charcoal,{bold=false,alpha=1,max=620,align='left'}={}){
  if(alpha<=0)return;
  ctx.save();ctx.globalAlpha*=alpha;ctx.textAlign=align;ctx.textBaseline='middle';
  ctx.font=(bold?'700 ':'400 ')+Math.round(size)+'px '+fontFamily;
  ctx.fillStyle=color;ctx.fillText(copy,x,y,max);ctx.restore();
}
function line(ctx,x,y,x2,y2,color,width){
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=color;
  ctx.lineWidth=width;ctx.stroke();
}
function ring(ctx,x,y,r,color,width,progress=1){
  ctx.beginPath();ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+2*Math.PI*progress);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function cursor(ctx,s){
  if(s.cursor.visible<=0)return;
  const {x,y,visible}=s.cursor;
  ctx.save();ctx.globalAlpha=visible;
  // Distinct editor cursor, not spoofed as captured product interaction.
  ctx.beginPath();ctx.moveTo(x-17,y-21);ctx.lineTo(x-12,y+17);
  ctx.lineTo(x-2,y+7);ctx.lineTo(x+9,y+31);ctx.lineTo(x+20,y+25);
  ctx.lineTo(x+8,y+4);ctx.lineTo(x+25,y+3);ctx.closePath();
  ctx.fillStyle=C.off;ctx.fill();ctx.strokeStyle=C.charcoal;ctx.lineWidth=4;ctx.stroke();
  for(const [pulse,t] of [[s.clickA,.8],[s.clickB,1]]){
    if(pulse>0){ctx.globalAlpha=visible*(1-pulse)*.8;
      ring(ctx,x,y,24+42*pulse,C.amber,3);
    }
  }
  ctx.restore();
}
function drawCard(ctx,node,label,{active=0,alpha=1,highlight=0,textAlpha=1}={}){
  if(alpha<=0)return;
  ctx.save();ctx.globalAlpha=alpha;
  round(ctx,node.x,node.y,node.w,node.h,node.r,
    active>.5?C.light:C.off,active>.5?C.mint:C.line);
  // Small mark travels WITH the card during its shape morph.
  round(ctx,node.x+21,node.y+21,39,10,5,C.mint);
  text(ctx,label,node.x+node.w*.5,node.y+node.h*.54,
    lerp(59,47,highlight),C.charcoal,{bold:true,align:'center',max:node.w*.8,alpha:textAlpha});
  ctx.restore();
}
function draw(ctx,s){
  const allAlpha=.25+.75*s.enter;
  ctx.save();ctx.globalAlpha=allAlpha;
  // Continuous editorial stage rather than cards cut between four shots.
  round(ctx,10,135,700,995,49,C.off);
  line(ctx,48,200,674,200,C.line,3);
  text(ctx,'PRODUCT / MOTION STUDY',44,165,28,C.gray,{bold:true});
  text(ctx,'01  /  INTERACTION',655,165,27,C.gray,{align:'right'});
  round(ctx,s.hero.x,s.hero.y,s.hero.w,s.hero.h,s.hero.r,C.charcoal);
  text(ctx,'TAP  TO  MATCH',72,296,68,C.off,
    {bold:true,alpha:s.headerOldAlpha,max:563});
  text(ctx,'CONNECTED',73,296,74,C.off,
    {bold:true,alpha:s.headerNewAlpha,max:555});
  text(ctx,'TWO STEPS / ONE MOTION',75,381,30,C.gray,
    {alpha:s.headerOldAlpha,max:540});
  text(ctx,'MATCH COMPLETE',75,382,31,C.mint,
    {bold:true,alpha:s.headerNewAlpha,max:555});
  line(ctx,58,437,661,437,C.line,3);
  // The connector starts from the selection and grows into the merge.
  const link=s.pickA*s.pickB;
  line(ctx,201,617,lerp(201,524,link),617,C.amber,Math.max(1,7*link));
  // Two identical UI node objects converge to ONE shared shape.
  drawCard(ctx,s.cardA,'A / 01',{active:s.pickA,highlight:s.merge,textAlpha:s.cardTextAlpha});
  drawCard(ctx,s.cardB,'B / 02',{active:s.pickB,alpha:s.cardBAlpha,
    highlight:s.merge,textAlpha:s.cardTextAlpha});
  text(ctx,'PAIR SELECTED',70,827,47,C.charcoal,
    {bold:true,alpha:s.matchLabelAlpha});
  // Retains the geometry of the morphed card to become result badge.
  ctx.save();ctx.globalAlpha=s.resultAlpha;
  round(ctx,s.cardA.x,s.cardA.y,s.cardA.w,s.cardA.h,s.cardA.r,C.mint);
  text(ctx,'COMBO',s.cardA.x+30,s.cardA.y+s.cardA.h*.51,52,C.charcoal,
    {bold:true,max:s.cardA.w*.62});
  text(ctx,'02',s.cardA.x+s.cardA.w-35,s.cardA.y+s.cardA.h*.51,79,C.charcoal,
    {bold:true,align:'right',max:90});
  ctx.restore();
  text(ctx,'COMPLETED / EDITORIAL VFX',57,829,37,C.charcoal,
    {bold:true,alpha:s.resultAlpha,max:610});
  round(ctx,57,912,606,16,8,C.line);
  round(ctx,57,912,606*s.progress,16,8,C.mint);
  text(ctx,'TWO ACTIONS. ONE FLOW.',59,978,35,C.charcoal,{bold:true,max:600});
  text(ctx,'NOT NATIVE APP UI  /  DESIGN CONCEPT',58,1059,26,C.gray,
    {bold:true,max:620});
  ctx.restore();
  cursor(ctx,s);
}
export function drawProductUIChoreographyFrame(profile,frame){
  const s=evaluateProductUIChoreography(frame);
  const area=socialSafeRect(profile);
  const canvas=createCanvas(profile.width,profile.height);
  const ctx=canvas.getContext('2d');
  ctx.save();ctx.beginPath();ctx.rect(area.x,area.y,area.w,area.h);ctx.clip();
  ctx.translate(area.x,area.y);ctx.scale(area.w/720,area.h/1270);
  draw(ctx,s);
  ctx.restore();
  return canvas;
}
