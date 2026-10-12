/*
 * ORIGINAL and authored coded motion, not a copied third-party video.
 * No external assets. Uses a locally staged GSAP 3.15.0 with original source
 * license notice. Tested Chromium, deterministic at absolute frame indices.
 * This source is an isolated creative proof and not the official Canvas engine.
 */
(()=>{
'use strict';
const CANVAS=document.getElementById('stage');const c=CANVAS.getContext('2d',{alpha:false});
const W=1080,H=1920,FPS=30,DURATION=12,FRAMES=FPS*DURATION;
const FILM=new URLSearchParams(location.search).get('film')||'thread';
const E=gsap.parseEase('power3.inOut'),S=gsap.parseEase('sine.inOut'),O=gsap.parseEase('power3.out');
const clamp=v=>Math.min(1,Math.max(0,v)); const between=(t,a,b)=>clamp((t-a)/(b-a));
const rise=(t,a,b)=>E(between(t,a,b));const out=(t,a,b)=>1-rise(t,a,b); const vis=(t,a,b,c,d)=>rise(t,a,b)*out(t,c,d);
const lerp=(a,b,p)=>a+(b-a)*p;
const rgba=(hex,a)=>{const q=hex.replace('#','');return `rgba(${parseInt(q.slice(0,2),16)},${parseInt(q.slice(2,4),16)},${parseInt(q.slice(4,6),16)},${a})`};
const C={cream:'#F5F3EA',warm:'#EFEAD9',ink:'#192128',deep:'#111927',blue:'#394FED',mint:'#B6EAD8',acid:'#DFFF72',coral:'#FF775E',lilac:'#CECCFF',grey:'#8B9596',white:'#FFFFFF',darkPurple:'#242139'};
function text(s,x,y,size=40,color=C.ink,weight=500,align='left',spacing=0){
 c.save();c.fillStyle=color;c.textBaseline='alphabetic';c.textAlign=align;c.font=`${weight} ${size}px Inter, 'Noto Sans', sans-serif`;
 if(spacing)c.letterSpacing=`${spacing}px`;c.fillText(s,x,y);c.restore();}
function wrap(s,x,y,w,lineH,size,color,weight=500){const parts=s.split(' ');let line='';for(const token of parts){const q=(line?line+' ':'')+token;c.font=`${weight} ${size}px Inter`;if(c.measureText(q).width>w&&line){text(line,x,y,size,color,weight);line=token;y+=lineH;}else line=q;}if(line)text(line,x,y,size,color,weight);}
function rect(x,y,w,h,r,fill,stroke=null,sw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.lineWidth=sw;c.strokeStyle=stroke;c.stroke()}}
function circle(x,y,r,fill,stroke=null,sw=1){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=sw;c.stroke()}}
function line(x1,y1,x2,y2,color,sw=2){c.strokeStyle=color;c.lineWidth=sw;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function glow(fn,color='#000000',blur=30,offset=12){c.save();c.shadowColor=color;c.shadowBlur=blur;c.shadowOffsetY=offset;fn();c.restore()}
function fade(fn,a){if(a<=0)return;c.save();c.globalAlpha=clamp(a);fn();c.restore()}
function move(fn,x=0,y=0,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);fn();c.restore()}
function masked(x,y,w,h,r,fn){c.save();c.beginPath();c.roundRect(x,y,w,h,r);c.clip();fn();c.restore()}
function grad(x1,y1,x2,y2,stops){const g=c.createLinearGradient(x1,y1,x2,y2);stops.forEach(([p,h])=>g.addColorStop(p,h));return g;}
function backdrop(fill,grid=false){c.fillStyle=fill;c.fillRect(0,0,W,H);if(grid){c.save();c.strokeStyle=rgba(C.ink,.065);c.lineWidth=1;for(let x=45;x<W;x+=56)line(x,0,x,H,c.strokeStyle,1);for(let y=15;y<H;y+=56)line(0,y,W,y,c.strokeStyle,1);c.restore()}}
function grain(t,light=false){ // Static, deterministic decor noise; no randomness or wall-clock.
 for(let k=0;k<105;k++){const x=(k*109+43)%1080,y=(k*229+17)%1920;c.fillStyle=light?'rgba(255,255,255,.055)':'rgba(6,18,26,.035)';c.fillRect(x,y,1.8,1.8)} }
function header(t,label,dark=false){const col=dark?C.cream:C.ink;fade(()=>{text('A  /  ORIGINAL STUDY',68,90,19,col,670, 'left',3.2);text(label,1012,90,20,col,620,'right',2);line(68,121,1012,121,dark?'#53606D':'#D8DAD0',1)},vis(t,0,.12,11.6,12));}
function footer(t,label,dark=false){const col=dark?'#BFC9C8':'#657275';fade(()=>{line(68,1808,1012,1808,dark?'#53606D':'#D8DAD0',1);text(label,68,1856,19,col,550,'left',2);text('12s   /   ORIGINAL',1012,1856,18,col,550,'right',1.4)},vis(t,0,.2,11.7,12))}
function cubic(p0,p1,p2,p3,u){const z=1-u;return {x:z*z*z*p0.x+3*z*z*u*p1.x+3*z*u*u*p2.x+u*u*u*p3.x,y:z*z*z*p0.y+3*z*z*u*p1.y+3*z*u*u*p2.y+u*u*u*p3.y}}
function bezierStroke(p0,p1,p2,p3,progress,color,width,glowy=false){const n=Math.max(2,Math.round(110*clamp(progress)));c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';if(glowy){c.shadowColor=color;c.shadowBlur=24;}c.beginPath();for(let i=0;i<=n;i++){const p=cubic(p0,p1,p2,p3,i/110);if(i===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y)}c.stroke();c.restore();return cubic(p0,p1,p2,p3,n/110)}
function pill(x,y,w,h,label,fill,txt,outline=null){rect(x,y,w,h,h/2,fill,outline,outline?2:0);text(label,x+w/2,y+h/2+11,25,txt,650,'center')}
function progressDot(x,y,state,col=C.blue){circle(x,y,19,state?col:C.cream,state?null:C.grey,2);if(state){line(x-8,y,x-1,y+8,C.cream,3);line(x-1,y+8,x+13,y-10,C.cream,3)}}
function pointer(x,y,scale=1,col='#121926'){move(()=>{c.beginPath();c.moveTo(0,0);c.lineTo(0,41);c.lineTo(10,32);c.lineTo(20,53);c.lineTo(30,48);c.lineTo(21,26);c.lineTo(36,23);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=C.cream;c.lineWidth=3;c.stroke();},x,y,scale)}
function subhead(s,x,y,dark=false){text(s,x,y,26,dark?C.mint:'#687680',660,'left',3)}
function typoBig(s,x,y,size,col,weight=800,spacing=-6){text(s,x,y,size,col,weight,'left',spacing)}
function routePath(t,mode='thin',draw=.99){const k=clamp(draw);const base=[{x:232,y:476},{x:380,y:600},{x:230,y:790},{x:260,y:1030}];const w=mode==='bold'?24:9;
 const a=bezierStroke(base[0],{x:710,y:465},{x:770,y:712},base[1],clamp(k*1.8),C.acid,w,true);
 if(k>.40)bezierStroke(base[1],{x:40,y:670},{x:95,y:820},base[2],clamp((k-.40)*2.7),C.acid,w,true);
 if(k>.70)bezierStroke(base[2],{x:510,y:846},{x:860,y:980},base[3],clamp((k-.70)*3.2),C.acid,w,true);
 return a;}
function panelCard(y,n,name,desc,active,op=1){fade(()=>{glow(()=>rect(144,y,792,170,30,active?'#FCFFED':'#263544',active?C.acid:'#3E5160',active?4:2),'rgba(0,0,0,.12)',20,10);pill(174,y+38,58,58,String(n),active?C.blue:'#324A59',active?C.white:C.mint);text(name,252,y+77,37,active?C.ink:C.cream,710);text(desc,252,y+121,23,active?'#52636A':'#B7C9CD',510);if(active)circle(880,y+83,17,C.acid,C.blue,3)},op)}
function threadFilm(t){
 // Actual GSAP easing drives the reveal and camera stage envelopes; all frames are seekable.
 const early=out(t,2.65,3.05),route=vis(t,2.5,3.10,9.50,10.05),end=rise(t,9.45,10.2);
 backdrop(C.cream,true);c.save();c.fillStyle=C.mint;circle(925,280,170,C.mint);circle(-65,1260,150,'#E4E8D8');c.restore();
 fade(()=>{subhead('NOTES  →  NEXT STEPS',70,213);typoBig('A THOUGHT',68,360,109,C.ink);typoBig('WITH A PATH.',68,481,94,C.blue);
  text('One small idea, made actionable.',70,565,29,'#617172',500);
  // Original material thread always begins from the mark near heading.
  const ep=bezierStroke({x:810,y:415},{x:945,y:680},{x:110,y:580},{x:215,y:755},rise(t,.2,2.1),C.blue,15,true);
  circle(ep.x,ep.y,18,C.acid,C.blue,5);
  glow(()=>rect(65,746,950,218,37,C.white,'#D7DFD8',2),'rgba(51,75,87,.14)',26,10);
  text('YOUR FIRST IDEA',110,809,20,'#66777A',710,'left',2.6);
  const msg='Make a tiny illustrated zine';const a=clamp(between(t,.55,1.9));const n=Math.min(msg.length,Math.floor(msg.length*a));
  text(msg.slice(0,n),107,892,35,C.ink,590);if(n<msg.length && Math.floor(t*3)%2===0)line(107+c.measureText(msg.slice(0,n)).width,858,107+c.measureText(msg.slice(0,n)).width,900,C.blue,3);
  pill(68,1030,940,112,'SHAPE THIS IDEA   ↗',C.blue,C.white);
  text('TYPE  ·  SELECT  ·  SEE WHAT CHANGES',70,1244,21,'#71807B',650,'left',1.6);
  line(68,1320,1012,1320,'#C9D3CB',2);
  text('01',70,1428,116,C.blue,750);text('DIRECTION',70,1488,20,'#51646A',650,'left',2);
  text('One gesture leads to one clear next step.',70,1580,34,C.ink,550);
 },early);
 // Visible selection cursor and the action-response trigger.
 fade(()=>{const pp=rise(t,1.65,2.3);const xx=lerp(940,697,pp), yy=lerp(1260,1092,pp);pointer(xx,yy,1.15,C.ink);circle(xx+12,yy+18,40*vis(t,2.3,2.38,2.54,2.7),null,C.acid,5)},vis(t,1.5,1.7,2.5,2.9));
 // New scene not a disconnected effect: the line is the same primary object.
 fade(()=>{rect(0,0,W,H,0,C.deep);circle(934,270,360,'#1B3041');circle(20,1555,360,'#172938');
  subhead('AN IDEA, GIVEN DIRECTION',68,230,true);typoBig('THE THREAD',68,367,96,C.cream);typoBig('BECOMES',68,469,96,C.cream);
  const dl=rise(t,3.03,6.15);routePath(t,'bold',dl);panelCard(595,1,'Give it a shape','Outline the idea', t>7.1,.88*rise(t,4.0,4.4));panelCard(890,2,'Make the first page','Sketch a clear opening',false,.92*rise(t,4.60,5.06));panelCard(1185,3,'Share a draft','Put the story in motion',false,.95*rise(t,5.24,5.68));
  text('THE SAME IDEA · THREE VISIBLE NEXT STEPS',68,1635,22,C.mint,600,'left',2);
 },route);
 // Close-up of one action that updates product state, not just geometry.
 fade(()=>{rect(0,0,W,H,0,C.ink);c.save();const g=grad(0,0,1080,1700,[[0,'#173C40'],[1,'#182237']]);c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
  subhead('THE ONE THAT MATTERS NOW',68,240,true);
  typoBig('WRITE THE',68,385,104,C.cream);typoBig('OPENING.',68,493,104,C.acid);
  glow(()=>rect(80,633,920,600,44,C.cream,'#DDE0D8',0),'rgba(0,0,0,.25)',38,18);
  text('PROJECT / LITTLE ZINE',135,719,25,'#758485',620,'left',2);
  line(135,761,934,761,'#CDD7CF',2);
  text('Create an outline',135,855,53,C.ink,690);
  const checked=rise(t,8.25,8.64);circle(170,954,31,C.blue);if(checked>0.5){line(153,953,165,966,C.white,5);line(165,966,188,938,C.white,5)}else circle(170,954,15,C.mint);
  text(checked>.5?'Outline saved':'Tap to mark complete',231,964,36,C.ink,570);
  pill(140,1073,800,99,checked>.5?'NEXT: SKETCH THE COVER    ↗':'COMPLETE THIS FIRST STEP',checked>.5?C.blue:'#DFEAD9',checked>.5?C.white:C.ink);
  if(t>8.1){const pp=rise(t,7.55,8.40),px=lerp(980,181,pp),py=lerp(1170,955,pp);pointer(px,py,1.1,C.ink)}
  text('One deliberate action changes the next visible state.',90,1395,27,C.mint,540);
 },vis(t,6.8,7.25,9.55,10.15));
 fade(()=>{backdrop(C.blue);const k=rise(t,9.9,10.7);c.save();c.translate(540,670);c.rotate(.12*(1-k));c.lineCap='round';c.strokeStyle=C.acid;c.lineWidth=24;c.beginPath();c.moveTo(-245,-85);c.bezierCurveTo(-140,-245,70,-240,165,-70);c.bezierCurveTo(260,140,12,290,-135,185);c.stroke();c.restore();
  text('ONE IDEA.',74,1080,115,C.cream,790,'left',-6);text('ONE CLEAR',74,1195,108,C.cream,790,'left',-6);text('NEXT STEP.',74,1310,105,C.acid,790,'left',-6);
  pill(77,1505,920,105,'ARC   /   THOUGHT INTO ACTION',C.cream,C.blue);
  text('An original motion prototype · fictional product',74,1682,25,C.cream,480);
 },end);
 header(t,'STUDY 01  /  A → B',t>=2.95&&t<10.05);footer(t,'ARC  /  CLEARFLOW',t>=2.95&&t<10.05);grain(t,t>3&&t<10);
}
function stringFragments(t){const words=[['SOMETHING',-40,405,112,.58],['ANOTHER',210,590,136,.40],['LATER',-30,860,214,.63],['URGENT',280,1090,172,.55],['MORE',10,1420,228,.52]];words.forEach(([s,x,y,size,alpha],i)=>{let dx=(i%2?-1:1)*rise(t,0,2.4)*(80+i*20);fade(()=>text(s,x+dx,y,size,i%2?C.lilac:'#97A5AF',800,'left',-8),alpha*out(t,2.05,2.65))});}
function apertureScene(t,focus){ // dynamic nested clip; foreground spotlight is the same semantic object.
 const centerX=lerp(880,525,rise(t,1.7,3.10)),centerY=lerp(1150,790,rise(t,1.7,3.10));const radius=lerp(190,300,rise(t,1.7,3.12));
 c.save();c.beginPath();c.arc(centerX,centerY,radius,0,Math.PI*2);c.clip();c.fillStyle=C.lilac;c.fillRect(0,0,W,H);
 text('ONE THING',centerX,centerY+21,lerp(50,76,rise(t,1.7,3.1)),C.darkPurple,780,'center',-3);
 for(let i=0;i<8;i++)line(centerX-320,centerY+93+i*16,centerX+195-i*8,centerY+93+i*16,'#8F86B0',i===0?7:2);
 c.restore();circle(centerX,centerY,radius,null,C.acid,9);
 const q=rise(t,2.5,3.12);if(q>.01){circle(centerX+radius-5,centerY+20,23,C.acid);}
 return {x:centerX,y:centerY,r:radius};}
function focusFilm(t){
 backdrop(C.darkPurple); // Different, editorial texture and camera logic than film A.
 const first=out(t,3.45,3.95);
 fade(()=>{stringFragments(t);subhead('THE ATTENTION STUDY',78,221,true);text('TOO MUCH',75,324,105,C.cream,770,'left',-6);
  text('TO HOLD?',76,434,105,C.lilac,770,'left',-6);
  apertureScene(t);
  text('A quieter way to choose what moves next.',80,1650,32,C.cream,500);
 },first);
 // The aperture does not merely fade to generic UI; it becomes the same border as a decision window.
 const second=vis(t,3.28,3.75,6.15,6.65);
 fade(()=>{backdrop('#2B273C');subhead('01  /  REMOVE THE NOISE',80,235,true);
  text('SELECT',78,393,141,C.cream,810,'left',-8);text('WHAT',78,523,141,C.lilac,810,'left',-8);text('MATTERS.',78,653,126,C.acid,810,'left',-8);
  const q=rise(t,3.6,4.55);const w=lerp(500,874,q),h=lerp(540,584,q),x=540-w/2;
  glow(()=>rect(x,745,w,h,lerp(280,45,q),C.lilac,'#F1EBFF',4),'rgba(0,0,0,.18)',24,12);
  masked(x,745,w,h,lerp(280,45,q),()=>{text('FOCUS WINDOW',x+52,845,23,C.darkPurple,650,'left',2);
   text('Choose one',x+50,958,66,C.darkPurple,720);
   text('next action',x+50,1037,66,C.darkPurple,720);
   line(x+51,1088,x+w-55,1088,'#897CAA',2);
   pill(x+55,1143,w-110,84,'SELECT →',C.darkPurple,C.cream);
  });
  const pp=rise(t,5.14,5.70);pointer(lerp(945,698,pp),lerp(1375,1173,pp),1.3,C.darkPurple);
 },second);
 const third=rise(t,6.12,6.65)*out(t,9.98,10.25);
 fade(()=>{backdrop(C.cream);c.fillStyle='#F0E9FF';c.fillRect(0,0,88,H);
  subhead('02  /  ACT ON IT',139,242);text('LESS,',136,397,142,C.darkPurple,790,'left',-8);text('BUT REAL.',136,526,133,C.blue,780,'left',-8);
  text('Your decision now has an observable result.',142,610,28,'#647075',500);
  glow(()=>rect(137,738,810,748,48,C.white,'#D8DBDE',3),'rgba(45,60,70,.13)',33,13);
  text('PRIORITY / 01',189,833,23,'#77848D',650,'left',2);
  text('Outline the',186,960,66,C.ink,700);text('first page',186,1040,66,C.ink,700);
  line(189,1101,901,1101,'#E0E5E7',3);
  circle(235,1203,35, rise(t,7.7,8.2)>.4?C.blue:'#F1F0ED','#A1A9A9',3);
  if(t>8.0){line(220,1204,233,1216,C.white,5);line(233,1216,255,1187,C.white,5)}
  text(rise(t,7.7,8.2)>.4?'Selected & added':'Select action',302,1216,39,C.ink,570);
  pill(193,1330,699,91,rise(t,7.7,8.2)>.4?'YOUR NEXT STEP IS READY':'CONFIRM THIS PRIORITY',C.acid,C.darkPurple);
  text('One selection. One visible next action.',145,1606,32,C.darkPurple,540);
 },third);
 // The selected input region opens the final cinematic field; this is
 // a spatially motivated iris wipe instead of a sudden full-frame flash.
 const wipe=rise(t,9.36,10.10);
 if(wipe>0){
  c.save();c.beginPath();c.arc(235,1203,18+2430*wipe,0,Math.PI*2);c.clip();backdrop(C.lilac);
  fade(()=>{c.save();c.translate(530,605);c.rotate(-.08);const r=lerp(360,280,rise(t,9.2,10.1));rect(-r,-r,r*2,r*2,Math.min(r,100),C.darkPurple);circle(0,0,lerp(120,168,rise(t,9.2,10.1)),C.lilac);c.restore();
   text('MAKE',82,1130,175,C.darkPurple,790,'left',-10);
   text('ROOM',82,1284,177,C.darkPurple,790,'left',-10);
   text('FOR ONE.',82,1433,128,C.darkPurple,790,'left',-7);
   text('FOCUS   /   AN ORIGINAL EDITORIAL STUDY',85,1669,25,C.darkPurple,600,'left',1.3);
  },rise(t,9.70,10.28));c.restore();
 }
 header(t,'STUDY 02  /  LESS → MORE',t<6.2);footer(t,'FOCUS  /  SELECT WHAT MATTERS',t<6.2);grain(t,t<6.2);
}
function seekFrame(f){if(!Number.isInteger(f)||f<0||f>=FRAMES)throw Error('Invalid absolute frame '+f);const t=f/FPS;
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 if(FILM==='thread')threadFilm(t);else if(FILM==='focus')focusFilm(t);else throw Error('Unknown film');
 return {film:FILM,frame:f,seconds:t,gsap:gsap.version,size:[W,H],fps:FPS};}
window.seekFrame=seekFrame;window.filmAudit=()=>({film:FILM,frames:FRAMES,fps:FPS,resolution:[W,H],gsapVersion:gsap.version,original:true});
seekFrame(0);
})();