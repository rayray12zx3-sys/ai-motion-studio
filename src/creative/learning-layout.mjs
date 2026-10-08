// Independent Learning Lab composition; original offline Canvas elements only.
import {displayFontFamily} from './display-font.mjs';
import {fontFamily} from '../free/scene.mjs';
import {preciseEase} from './motion.mjs';

const ink='#143D39',green='#1F8475',light='#E2EFE5',paper='#F9F8EF',gold='#E4B863',muted='#60776C';
const ease=(v,a,b)=>preciseEase(Math.max(0,Math.min(1,(v-a)/(b-a))));
const fill=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c,x,y,X,Y,color,width=1)=>{c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
const card=(c,x,y,w,h,r,color)=>{c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));c.fillStyle=color;c.fill();};
function txt(c,value,x,y,size,color,bold=false,max=Infinity){
  const family=bold?displayFontFamily:fontFamily;
  let px=Math.max(9,Math.round(size));
  c.font=px+'px '+family;
  const width=c.measureText(value).width;
  if(width>max)px=Math.max(8,Math.floor(px*max/width));
  c.save();c.font=px+'px '+family;c.textBaseline='middle';c.textAlign='left';
  c.fillStyle=color;c.fillText(value,x,y,max);c.restore();
}
function stage(c,a,bg,index,tag){
  c.save();c.beginPath();c.rect(a.x,a.y,a.w,a.h);c.clip();
  fill(c,a.x,a.y,a.w,a.h,bg);
  const {x,y,w,h}=a,u=Math.min(w,h);
  txt(c,'LEARNING / LAB',x+w*.06,y+h*.087,u*.033,ink,true,w*.62);
  txt(c,'0'+(index+1),x+w*.89,y+h*.087,u*.048,green,true,w*.07);
  line(c,x+w*.06,y+h*.14,x+w*.94,y+h*.14,'#AEC9BF',Math.max(1,u*.003));
  txt(c,tag,x+w*.06,y+h*.18,u*.029,muted,false,w*.76);
  return ()=>c.restore();
}
function opening(c,a,frame,entry){
  const done=stage(c,a,'#F2F2E5',0,'01 / PERSONAL STUDY'),{x,y,w,h}=a;
  const u=Math.min(w,h),p=ease(frame,4,39),portrait=h>w*.82;
  const bx=x+w*(portrait?.13:.56),by=y+h*(portrait?.55:.32),
    bw=w*(portrait?.74:.35),bh=h*(portrait?.28:.45);
  for(let i=2;i>=0;i--){
    const offset=(2-i)*u*.039;
    card(c,bx+offset,by-offset,bw-offset*.8,bh,p?u*.022:u*.022,
      ['#AACEC0','#D9E8D6',paper][i]);
  }
  txt(c,'RECALL',bx+bw*.12,by+bh*.38,u*.10,ink,true,bw*.65);
  txt(c,'01 / 03',bx+bw*.12,by+bh*.72,u*.04,green,false,bw*.4);
  fill(c,bx+bw*.12,by+bh*.83,bw*.72*p,Math.max(2,u*.012),green);
  txt(c,entry.primary,x+w*.065,y+h*(portrait?.32:.49),u*(portrait?.24:.20),ink,true,w*(portrait?.86:.44));
  txt(c,entry.secondary,x+w*.068,y+h*(portrait?.43:.71),u*.052,green,true,w*(portrait?.8:.45));
  txt(c,entry.footer,x+w*.07,y+h*.935,u*.028,muted,false,w*.82);
  done();
}
function recall(c,a,frame,entry){
  const done=stage(c,a,light,1,'02 / ACTIVE RECALL'),{x,y,w,h}=a,u=Math.min(w,h);
  const portrait=h>w*.82,p=ease(frame-90,-10,48);
  const labels=['OBSERVE','RECALL','REPEAT'];
  for(let i=0;i<3;i++){
    const xx=x+w*(portrait?.11:.055+i*.305);
    const yy=y+h*(portrait?.265+i*.207:.32);
    const ww=w*(portrait?.78:.27),hh=h*(portrait?.16:.53);
    card(c,xx,yy,ww,hh,u*.027,i===1?ink:paper);
    fill(c,xx,yy,ww*ease(p,i*.13,.45+i*.13),Math.max(3,u*.012),i===1?gold:green);
    txt(c,'0'+(i+1),xx+ww*.07,yy+hh*.30,u*.07,i===1?gold:green,true,ww*.22);
    txt(c,labels[i],xx+ww*.07,yy+hh*.70,u*(portrait?.065:.055),i===1?paper:ink,true,ww*.84);
    if(i<2){
      if(portrait)line(c,x+w*.5,yy+hh,x+w*.5,yy+hh+h*.04,green,Math.max(1,u*.008));
      else line(c,xx+ww,yy+hh*.5,xx+ww+w*.026,yy+hh*.5,green,Math.max(1,u*.008));
    }
  }
  txt(c,entry.footer,x+w*.07,y+h*.93,u*.027,muted,false,w*.84);
  done();
}
function data(c,a,frame,entry){
  const done=stage(c,a,'#F4EFDE',2,'03 / PRACTICE PATTERN'),{x,y,w,h}=a,u=Math.min(w,h);
  const portrait=h>w*.82,p=ease(frame-180,-10,55);
  txt(c,entry.primary,x+w*.07,y+h*(portrait?.34:.54),u*.25,ink,true,w*(portrait?.6:.4));
  txt(c,'SAMPLE',x+w*.07,y+h*(portrait?.43:.74),u*.046,muted,true,w*.34);
  const bx=x+w*(portrait?.11:.52),by=y+h*(portrait?.52:.27),
    bw=w*(portrait?.78:.4),bh=h*(portrait?.31:.56);
  card(c,bx,by,bw,bh,u*.03,paper);
  txt(c,'WEEK / 04',bx+bw*.065,by+bh*.14,u*.034,muted,true,bw*.8);
  const side=Math.min(bw*.091,bh*.125),gapX=bw*.035,gapY=bh*.05;
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){
    const xx=bx+bw*.075+col*(side+gapX),yy=by+bh*.29+row*(side+gapY);
    fill(c,xx,yy,side,side,ease(p,(row+col)*.028,.55+(row+col)*.028)>.45?
      ((row*3+col)%5<2?gold:green):'#DFE6D8');
  }
  txt(c,entry.footer,x+w*.07,y+h*.93,u*.026,green,false,w*.8);
  done();
}
function ending(c,a,frame,entry){
  const done=stage(c,a,ink,3,'04 / KEEP BUILDING'),{x,y,w,h}=a,u=Math.min(w,h);
  const portrait=h>w*.82,p=ease(Math.min(frame,329)-270,-10,42);
  for(let i=0;i<8;i++){
    const xx=x+w*(.50+i*.05);
    line(c,xx,y+h*.22,xx,y+h*.85,'#335E59',Math.max(1,u*.003));
  }
  txt(c,entry.primary,x+w*.07,y+h*(portrait?.40:.52),u*(portrait?.29:.30),paper,true,w*.82);
  txt(c,entry.secondary,x+w*.07,y+h*(portrait?.56:.74),u*.073,gold,true,w*.8);
  const cx=x+w*(portrait?.77:.82),cy=y+h*(portrait?.73:.49),r=u*(portrait?.10:.15);
  c.beginPath();c.arc(cx,cy,r,-Math.PI*.5,-Math.PI*.5+Math.PI*2*p);
  c.lineWidth=Math.max(3,u*.018);c.strokeStyle=gold;c.stroke();
  txt(c,'04',cx-r*.48,cy,u*.081,paper,true,r*.96);
  fill(c,x+w*.07,y+h*.86,w*.28*p,Math.max(3,u*.013),gold);
  txt(c,entry.footer,x+w*.07,y+h*.94,u*.028,light,false,w*.79);
  done();
}
export function drawLearningStage(ctx,area,index,frame,art,direction){
  if(direction?.style_id!=='learning-lab'||!direction.panels[index])
    throw new Error('Invalid Learning Lab scene request');
  const entry=direction.panels[index];
  if(index===0)opening(ctx,area,frame,entry);
  else if(index===1)recall(ctx,area,frame,entry);
  else if(index===2)data(ctx,area,frame,entry);
  else if(index===3)ending(ctx,area,frame,entry);
  else throw new Error('Unsupported Learning Lab scene');
}
export function drawLearningTitle(ctx,beat,index,layout,w,h){
  const x=layout.margin,y=h*.20,u=Math.min(w,h),portrait=h>w;
  card(ctx,x,y-u*.018,w*.19,Math.max(3,u*.01),u*.005,gold);
  txt(ctx,beat.headline,x,y+h*.015,layout.titleSize*(portrait?1.15:1.33),ink,true,w-2*x);
  txt(ctx,beat.subtitle,x,y+h*.10,layout.subtitleSize*.99,green,false,w-2*x);
  txt(ctx,'LAB / 0'+(index+1),w-x-w*.18,h*.136,u*.028,muted,true,w*.16);
}
