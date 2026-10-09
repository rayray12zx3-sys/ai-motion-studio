// Reference-led original UI animation, NOT native APP footage or copied artwork.
// Same geometric object is drawn exactly once each frame; contents change on 120 BPM beats.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily} from '../free/scene.mjs';
import {socialSafeRect} from './social-safe-area.mjs';
export const FRAMES=120,FPS=30,BPM=120,BEAT_FRAMES=15;
export const BEATS=Object.freeze(['masked hero','underline to button','tap and condense',
 'loader to check','shape to summary','direct-manipulated slider',
 'success capsule','shape exits']);
const C={dark:'#161D1B',paper:'#F2F0ED',green:'#40B99A',white:'#FFFFFF'};
const clamp=x=>Math.max(0,Math.min(1,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{let v=clamp(t);return v*v*(3-2*v);};
function damped(t){
 const v=clamp(t);if(v===0||v===1)return v;
 // Critical damping: zero overshoot and zero start velocity; unlike
 // underdamped springs, rapid button collapse cannot jump between frames.
 const d=5;
 const f=x=>1-(1+d*x)*Math.exp(-d*x);
 return Math.min(1,Math.max(0,f(v)/f(1)));
}
const interp=(f,a,b)=>damped((f-a)/(b-a));
const enter=(f,a,b)=>smooth((f-a)/(b-a));
const leave=(f,a,b)=>1-enter(f,a,b);
const nodes=[
 [350,630,280,8,4],       // beat 1: one underline
 [350,630,280,8,4],       // beat 2: grow into button
 [350,630,470,116,55],    // beat 3: press to loader
 [350,630,108,108,54],    // beat 4: spinner -> check
 [350,630,108,108,54],    // beat 5: grow into summary
 [350,630,512,208,39],    // beat 6: direct slider interaction
 [350,630,512,208,39],    // beat 7: become Combo
 [350,630,535,140,69],    // beat 8: deliberate exit
 [350,639,16,7,3]
];
const color=(a,b,t)=>{
 const components=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
 const x=components(a),y=components(b);
 return '#'+x.map((v,i)=>Math.round(lerp(v,y[i],clamp(t))).toString(16).padStart(2,'0')).join('');
};
export function evaluateOneShape(frame){
 if(!Number.isFinite(frame)||frame<0||frame>=FRAMES)throw Error('Invalid choreography frame');
 const beat=Math.floor(frame/BEAT_FRAMES);
 const s=beat===7?interp(frame,107,120):interp(frame,beat*15,(beat+1)*15);
 const geom=nodes[beat].map((v,i)=>lerp(v,nodes[beat+1][i],s));

 const [x,y,w,h,r]=geom;
 const drag=enter(frame,76,89);
 const pointerAlpha=enter(frame,19,25)*leave(frame,39,45)+
   enter(frame,72,78)*leave(frame,91,98);
 return {
  beat,shape:{x,y,w,h,r},
  camera:1+.024*enter(frame,15,60)-.024*enter(frame,95,119),
  fill:color(C.dark,C.green,enter(frame,90,98)),
  hook:enter(frame,0,10)*leave(frame,17,23),
  hookReveal:enter(frame,0,13),
  button:enter(frame,24,27)*leave(frame,32,39),
  spinner:enter(frame,44,48)*leave(frame,53,57),
  check:enter(frame,57,60)*leave(frame,64,68),
  summary:enter(frame,69,72)*leave(frame,74,79),
  slider:enter(frame,78,81)*leave(frame,88,92),
  combo:enter(frame,93,96)*leave(frame,107,109),
  fade:leave(frame,114,119),
  drag,
  pointer:{x:frame>=75?lerp(190,515,drag):lerp(610,365,enter(frame,17,31)),
   y:frame>=75?y-h*.15:y+h*.12,
   alpha:Math.min(1,pointerAlpha),
   down:frame<45?Math.max(0,1-Math.abs(frame-33)/5):0}
 };
}
function shape(ctx,x,y,w,h,r,fill){
 ctx.fillStyle=fill;ctx.beginPath();
 ctx.roundRect(x-w/2,y-h/2,Math.max(1,w),Math.max(1,h),Math.max(0,Math.min(r,h/2)));
 ctx.fill();
}
function typography(ctx,copy,x,y,size,fill,a=1){
 if(a<=0)return;
 ctx.save();ctx.globalAlpha*=a;ctx.font='700 '+size+'px '+fontFamily;
 ctx.fillStyle=fill;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(copy,x,y,630);ctx.restore();
}
function pointer(ctx,p){
 if(p.alpha<=0)return;
 ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);
 ctx.scale(1-.14*p.down,1-.14*p.down);
 ctx.fillStyle=C.white;ctx.strokeStyle=C.dark;ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-14,-20);ctx.lineTo(-10,19);ctx.lineTo(0,8);
 ctx.lineTo(12,30);ctx.lineTo(23,24);ctx.lineTo(8,1);ctx.lineTo(24,0);
 ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function artwork(ctx,s,f){
 const g=s.shape;
 ctx.save();ctx.translate(350,620);ctx.scale(s.camera,s.camera);ctx.translate(-350,-620);
 if(s.hook>0){
  ctx.save();ctx.globalAlpha=s.hook;
  const visible=175*s.hookReveal;
  ctx.beginPath();ctx.rect(10,420+86-visible,680,visible);ctx.clip();
  typography(ctx,'MATCH',350,420,150,C.dark);
  ctx.restore();
 }
 // The only primary geometric background: NEVER duplicate/rebuild the UI.
 ctx.save();ctx.globalAlpha=s.fade;
 ctx.shadowColor='rgba(0,0,0,.11)';ctx.shadowBlur=19;ctx.shadowOffsetY=8;
 shape(ctx,g.x,g.y,g.w,g.h,g.r,s.fill);ctx.restore();
 ctx.save();ctx.beginPath();ctx.roundRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h,
  Math.min(g.r,g.h/2));ctx.clip();
 typography(ctx,'TAP',g.x,g.y,68,C.white,s.button);
 if(s.spinner>0){
  ctx.save();ctx.globalAlpha=s.spinner;ctx.strokeStyle=C.white;ctx.lineWidth=7;
  ctx.beginPath();ctx.arc(g.x,g.y,27,-Math.PI/2,
    -Math.PI/2+Math.PI*1.6*enter(f,45,55));ctx.stroke();ctx.restore();
 }
 if(s.check>0){
  ctx.save();ctx.globalAlpha=s.check;ctx.strokeStyle=C.white;
  ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  ctx.moveTo(g.x-26,g.y);ctx.lineTo(g.x-5,g.y+20);
  ctx.lineTo(g.x+30,g.y-22);ctx.stroke();ctx.restore();
 }
 typography(ctx,'PAIR 02',g.x,g.y,77,C.white,s.summary);
 if(s.slider>0){
  ctx.save();ctx.globalAlpha=s.slider;
  shape(ctx,g.x,g.y-29,405,13,7,'#334640');
  const amount=347*s.drag;
  shape(ctx,g.x-174+amount/2,g.y-29,Math.max(2,amount),13,7,C.white);
  typography(ctx,'SCRUB',g.x,g.y+40,38,C.white);ctx.restore();
 }
 typography(ctx,'COMBO 02',g.x,g.y,82,C.dark,s.combo);
 ctx.restore();
 pointer(ctx,s.pointer);
 ctx.restore();
}
export function drawOneShapeFrame(profile,frame){
 const s=evaluateOneShape(frame),area=socialSafeRect(profile);
 const c=createCanvas(profile.width,profile.height),ctx=c.getContext('2d');
 ctx.save();ctx.beginPath();ctx.rect(area.x,area.y,area.w,area.h);ctx.clip();
 ctx.translate(area.x,area.y);ctx.scale(area.w/700,area.h/1120);
 artwork(ctx,s,frame);ctx.restore();return c;
}
