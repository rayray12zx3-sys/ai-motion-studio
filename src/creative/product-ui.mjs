// Fully original, synthetic Product-UI motion kit. Never recreates or claims
// to capture a real app UI; future private source screenshot crops must go
// through a separate licensed, verified private-media resolver.
import {createCanvas} from '@napi-rs/canvas';
import {fontFamily,validateSpec} from '../free/scene.mjs';
import {socialSafeRect} from './social-safe-area.mjs';
const allowed=new Set(['match','practice','challenge']);
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>1-Math.pow(1-clamp(n),3);
const ink='#122C30',muted='#65817F',accent='#1BA88F',paper='#F9FCFA',gold='#F3B85B';
function rounded(c,x,y,w,h,r,fill,stroke){
  c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
}
function type(c,txt,x,y,size,color=ink,bold=false,limit=Infinity){
  c.save();c.font=(bold?'bold ':'')+size+'px '+fontFamily;
  c.textBaseline='middle';c.textAlign='left';c.fillStyle=color;
  const m=c.measureText(txt).width;
  c.fillText(txt,x,y,Math.min(limit,Math.max(1,m)));
  c.restore();
}
const E=Object.freeze({
  match:{mode:'match',frames:30,hero:'MATCH',sub:'INTERACTION STUDY'},
  practice:{mode:'practice',frames:95,hero:'PRACTICE',sub:'PROGRESS STUDY'},
  challenge:{mode:'challenge',frames:107,hero:'CHALLENGE',sub:'SCORE STUDY'}
});
export const SYNTHETIC_UI_MODES=E;
export function validateProductUIScene(scene){
  if(!scene||typeof scene!=='object'||Array.isArray(scene)||
    Object.keys(scene).sort().join(',')!=='frames,hero,mode,sub'||
    !allowed.has(scene.mode)||!Number.isInteger(scene.frames)||scene.frames<20||scene.frames>180||
    typeof scene.hero!=='string'||typeof scene.sub!=='string'||scene.hero.length>23||scene.sub.length>32)
    throw new Error('Invalid synthetic Product-UI scene contract');
  validateSpec({title:scene.hero,subtitle:scene.sub});
}
function shared(c,scene){
  rounded(c,12,12,696,124,27,paper);
  rounded(c,38,41,12,62,7,accent);
  type(c,scene.hero,72,60,55,ink,true,580);
  type(c,scene.sub,72,102,24,muted,false,490);
  type(c,'CONCEPT / EDITORIAL VFX',42,1204,24,muted,true,630);
}
function match(c,frame,frames){
  const t=frame/frames;
  rounded(c,34,169,652,178,34,'#E3F6EF');
  type(c,'SESSION',70,220,29,muted);
  const remain=30-Math.round(14*ease(t));
  type(c,String(remain).padStart(2,'0')+' SEC',70,284,72,ink,true,470);
  c.beginPath();c.arc(583,259,54,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-t));
  c.strokeStyle=accent;c.lineWidth=12;c.stroke();
  const cards=['ONE','TWO','THREE','FOUR'];
  for(let i=0;i<4;i++){
    const x=34+(i%2)*334,y=389+Math.floor(i/2)*232;
    const active=(i===1||i===2)&&t>.4;
    rounded(c,x,y,318,215,29,active?'#C6F0E2':paper,active?accent:'#D9E8E5');
    type(c,cards[i],x+35,y+99,47,ink,true,248);
    if(active){
      rounded(c,x+241,y+24,52,50,25,accent);
      type(c,'OK',x+247,y+51,23,paper,true,45);
    }
  }
  rounded(c,38,908,644,139,29,t>.56?accent:ink);
  type(c,t>.56?'MATCHED':'TAP / PAIR',76,975,49,paper,true,570);
  c.strokeStyle=gold;c.lineWidth=8;c.beginPath();c.arc(532,736,35+8*Math.sin(t*Math.PI*2),0,Math.PI*2);c.stroke();
}
function practice(c,frame,frames){
  const p=ease(frame/(frames*.83));
  rounded(c,31,171,658,125,30,paper);
  type(c,'WEEKLY LOOP',68,217,30,muted,true);
  rounded(c,65,257,588,13,8,'#E6EDEC');
  rounded(c,65,257,588*p,13,8,accent);
  rounded(c,28,331,664,325,32,'#E3F6EF');
  type(c,'VOCABULARY',66,393,31,muted,true);
  type(c,'RECALL',66,492,94,ink,true,585);
  const step=Math.min(2,Math.floor(frame/(frames/3)));
  const names=['SEE','CHECK','REPEAT'];
  for(let i=0;i<3;i++){
    const y=703+i*116,done=i<step,selected=i===step;
    rounded(c,34,y,652,100,24,selected?ink:paper);
    rounded(c,56,y+30,43,43,22,done?accent:selected?gold:'#D1E5DD');
    type(c,'0'+(i+1),122,y+51,37,selected?paper:ink,true);
    type(c,names[i],205,y+52,39,selected?paper:ink,true,445);
  }
  type(c,'STATE CHANGES ARE ILLUSTRATIVE',42,1112,23,muted);
}
function challenge(c,frame,frames){
  const t=ease(frame/(frames*.82));
  rounded(c,30,179,660,253,32,ink);
  type(c,'ILLUSTRATIVE SCORE',62,239,30,'#C9DFD8');
  const score=Math.floor(180+320*t);
  type(c,String(score),60,339,122,paper,true,550);
  rounded(c,28,477,664,571,35,paper);
  type(c,'EDITORIAL PROGRESSION',60,526,29,muted,true,620);
  const colors=['#C7EADD','#D7F3E9','#F5D9A6'];
  for(let i=0;i<3;i++){
    const y=590+i*139;
    rounded(c,58,y,600,121,25,t>(2-i)*.32?colors[i]:'#E7F0EC');
    type(c,'0'+(i+1),89,y+58,53,ink,true);
    rounded(c,165,y+51,330*(i===2?t:.58),14,7,i===2?gold:accent);
    type(c,i===2?'ACTIVE':i===1?'PROGRESS':'LEVEL',514,y+58,23,muted,true,130);
  }
  type(c,'NOT VERIFIED NATIVE LEADERBOARD',42,1109,23,muted,true);
}
export function drawProductUIFrame(profile,frame,scene){
  validateProductUIScene(scene);
  const rect=socialSafeRect(profile);
  if(!Number.isInteger(frame)||frame<0||frame>=scene.frames)throw new Error('Frame out of range');
  const canvas=createCanvas(profile.width,profile.height),ctx=canvas.getContext('2d');
  ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.w,rect.h);ctx.clip();
  ctx.translate(rect.x,rect.y);ctx.scale(rect.w/720,rect.h/1270);
  shared(ctx,scene);
  if(scene.mode==='match')match(ctx,frame,scene.frames);
  else if(scene.mode==='practice')practice(ctx,frame,scene.frames);
  else challenge(ctx,frame,scene.frames);
  ctx.restore();
  return canvas;
}
