// Reference-led original UI animation, NOT native APP footage or copied artwork.
// Same geometric object is drawn exactly once each frame; contents change on 120 BPM beats.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily} from '../free/scene.mjs';
import {socialSafeRect} from './social-safe-area.mjs';
import {MOTION_PROFILES,easeBetween,bouncePulse} from './motion-easing.mjs';
export const FRAMES=120,FPS=30,BPM=120,BEAT_FRAMES=15;
export const BEATS=Object.freeze(['masked hero','underline to button','tap and condense',
 'loader to check','shape to summary','direct-manipulated slider',
 'success capsule','shape exits']);
const C={dark:'#161D1B',paper:'#F2F0ED',green:'#40B99A',white:'#FFFFFF'};
const clamp=x=>Math.max(0,Math.min(1,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{let v=clamp(t);return v*v*(3-2*v);};
// Distinct, intentional transitions replace the previous single damped curve.
const interp=(f,a,b,curve)=>easeBetween(f,a,b,curve);
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
 // Beats still lock to 120 BPM. However the *motion inside each beat*
 // has independent animation windows: punchy expansion, brief hold/tap,
 // controlled compression, a soft spring settle, and deliberate exit.
 const windows=[
  {a:0,b:15,curve:'linear'},
  {a:15,b:27,curve:MOTION_PROFILES.affordance},
  {a:34,b:45,curve:MOTION_PROFILES.condense},
  {a:45,b:60,curve:'linear'},
  {a:60,b:73,curve:MOTION_PROFILES.expand},
  {a:75,b:90,curve:'linear'},
  {a:90,b:102,curve:MOTION_PROFILES.reward},
  {a:107,b:120,curve:MOTION_PROFILES.exit}
 ];
 const cue=windows[beat],progress=interp(frame,cue.a,cue.b,cue.curve);
 const geom=nodes[beat].map((v,i)=>lerp(v,nodes[beat+1][i],progress));
 // A short anticipation impulse before the second-beat TAP compression.
 if(beat===2&&frame>=30&&frame<34){
  const scale=1-.043*Math.sin(Math.PI*(frame-30)/4);
  geom[2]*=scale;geom[3]*=1+.052*Math.sin(Math.PI*(frame-30)/4);
 }
 const [x,y,w,h,r]=geom;
 const drag=interp(frame,76,89,MOTION_PROFILES.directManipulation);
 const checkBounce=bouncePulse(frame,57,13,.15);
 const rewardBounce=bouncePulse(frame,93,17,.12);
 const pointerAlpha=enter(frame,19,25)*leave(frame,39,45)+
   enter(frame,72,78)*leave(frame,91,98);
 return {
  beat,shape:{x,y,w,h,r},
  timing:{profile:cue.curve,progress,checkBounce,rewardBounce,
   tapAnticipation:beat===2&&frame>=30&&frame<34},
  camera:1+.024*interp(frame,15,58,MOTION_PROFILES.intro)
   -.024*interp(frame,98,119,MOTION_PROFILES.exit),
  fill:color(C.dark,C.green,interp(frame,90,100,MOTION_PROFILES.reward)),
  hook:enter(frame,0,10)*leave(frame,17,23),
  hookReveal:interp(frame,0,11,MOTION_PROFILES.intro),
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
   const z=1+s.timing.checkBounce;
  ctx.translate(g.x,g.y);ctx.scale(z,z);ctx.translate(-g.x,-g.y);
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
 if(s.combo>0){
  ctx.save();ctx.translate(g.x,g.y);const z=1+s.timing.rewardBounce;
  ctx.scale(z,z);ctx.translate(-g.x,-g.y);
  typography(ctx,'COMBO 02',g.x,g.y,82,C.dark,s.combo);ctx.restore();
 }
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
