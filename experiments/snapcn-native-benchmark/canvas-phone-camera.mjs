/**
 * EXPERIMENT ONLY — snapcn PhoneFrame free MIT motion-language transfer to
 * existing, already-approved @napi-rs/canvas. This is NOT the upstream component.
 * Source: shadcn-labs/snapcn @ afce9f0aa8c9d464409efd1e4d4f227ca4809c04
 * LICENSE: MIT, Copyright (c) 2026 Sri Nath (snap-cn).
 * Do not add a production dependency or claim pixel parity with Remotion CSS.
 */
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

export const SPEC={width:1080,height:1920,fps:30,frames:240};
const DIR=dirname(fileURLToPath(import.meta.url));
const keys={
  rotateX:[52,36,26,12,1.5,0],rotateY:[28,20,10,6,1,0],
  rotateZ:[30,14,2,0,0,0],zoom:[2.6,1.35,2.75,2.3,1.04,1],
  x:[60,30,0,-10,0,0],y:[-195,-40,430,380,15,0]
};
const cuts=[0,.1,.42,.62,.9,1];
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>x<.5?4*x*x*x:1-(-2*x+2)**3/2;
const interpolate=(a,b,q)=>a+(b-a)*q;
const rad=d=>d*Math.PI/180;
export function cameraAt(frame){
  if(!Number.isInteger(frame)||frame<0||frame>=SPEC.frames)throw Error('invalid frame');
  const t=frame/(SPEC.frames-1);
  let n=cuts.length-2;
  for(let i=0;i<cuts.length-1;i++){if(t<=cuts[i+1]){n=i;break;}}
  const p=ease(clamp((t-cuts[n])/(cuts[n+1]-cuts[n])));
  const vals=Object.fromEntries(Object.entries(keys).map(([k,v])=>[k,interpolate(v[n],v[n+1],p)]));
  const fade=clamp(frame/12);
  const enter=1-(1-clamp(frame/26))**3;
  const float=frame<30?0:-6*Math.sin((frame-30)/(SPEC.fps*4.5)*Math.PI*2);
  return {...vals,fade,enterY:(1-enter)*70,float};
}
export function pointAt(x,y,frame){
  const p=cameraAt(frame);
  // Fixed 320 x 656 plane; CSS rotateZ -> rotateY -> rotateX at 1400px perspective.
  let X=x-160,Y=y-328,Z=0;
  const rz=rad(p.rotateZ),ry=rad(p.rotateY),rx=rad(p.rotateX);
  let nx=X*Math.cos(rz)-Y*Math.sin(rz),ny=X*Math.sin(rz)+Y*Math.cos(rz);
  X=nx;Y=ny;
  nx=X*Math.cos(ry)+Z*Math.sin(ry);
  Z=Z*Math.cos(ry)-X*Math.sin(ry);X=nx;
  ny=Y*Math.cos(rx)-Z*Math.sin(rx);
  Z=Y*Math.sin(rx)+Z*Math.cos(rx);Y=ny;
  const persp=1400/(1400-Z);
  const factor=1.65*p.zoom*persp;
  return {x:SPEC.width/2+p.x+X*factor,
          y:SPEC.height/2+p.y+p.enterY+p.float+Y*factor};
}
/** Returns finite projected corners for tested camera mesh. */
export function projectTile(u,v,w,h,frame){
  return [pointAt(u,v,frame),pointAt(u+w,v,frame),
          pointAt(u+w,v+h,frame),pointAt(u,v+h,frame)];
}
function roundedRect(ctx,x,y,w,h,r){
  const q=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+q,y);ctx.lineTo(x+w-q,y);ctx.quadraticCurveTo(x+w,y,x+w,y+q);
  ctx.lineTo(x+w,y+h-q);ctx.quadraticCurveTo(x+w,y+h,x+w-q,y+h);
  ctx.lineTo(x+q,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-q);
  ctx.lineTo(x,y+q);ctx.quadraticCurveTo(x,y,x+q,y);ctx.closePath();
}
export async function makeDeviceTexture(){
  // The source plate is original synthetic and contains no real company APP UI.
  const img=await loadImage(readFileSync(join(DIR,'atlas-planning.svg')));
  const device=createCanvas(640,1312),c=device.getContext('2d');
  roundedRect(c,7,7,626,1298,107);
  c.shadowColor='rgba(0,0,0,.65)';c.shadowBlur=16;c.shadowOffsetY=11;
  c.fillStyle='#1A2030';c.fill();c.shadowColor='transparent';c.shadowBlur=0;
  roundedRect(c,24,24,592,1264,88);c.fillStyle='#111722';c.fill();
  c.save();roundedRect(c,28,28,584,1256,78);c.clip();
  c.drawImage(img,28,28,584,1256);
  c.restore();
  roundedRect(c,254,31,132,35,18);c.fillStyle='#080B11';c.fill();
  c.fillStyle='#C9D5E5';c.globalAlpha=.30;c.beginPath();c.arc(359,48,5,0,Math.PI*2);c.fill();c.globalAlpha=1;
  c.strokeStyle='rgba(245,250,255,.38)';c.lineWidth=3;roundedRect(c,9,9,622,1294,105);c.stroke();
  return device;
}
export function paintFrame(frame,texture){
  const screen=createCanvas(SPEC.width,SPEC.height);
  const ctx=screen.getContext('2d');
  const bg=ctx.createLinearGradient(0,0,screen.width,screen.height);
  bg.addColorStop(0,'#151B2A');bg.addColorStop(.58,'#242F43');bg.addColorStop(1,'#121723');
  ctx.fillStyle=bg;ctx.fillRect(0,0,screen.width,screen.height);
  // Dedicated source object is *not* replaced by title cards or simple rectangles.
  // Grid mesh warps the original plate and shell, preserving the phone plane.
  ctx.globalAlpha=cameraAt(frame).fade;
  const nx=18,ny=25,sw=texture.width/nx,sh=texture.height/ny;
  for(let yi=0;yi<ny;yi++){
    for(let xi=0;xi<nx;xi++){
      const sx=xi*sw,sy=yi*sh;
      const [tl,tr,br,bl]=projectTile(sx/2,sy/2,sw/2,sh/2,frame);
      // Two affine triangles approximate the source-to-destination perspective
      // projection. No Canvas or Remotion 3D dependence is added.
      for(const tri of [[tl,tr,bl,[sx,sy],[sx+sw,sy],[sx,sy+sh]],
                         [br,bl,tr,[sx+sw,sy+sh],[sx,sy+sh],[sx+sw,sy]]]){
        const [a,b,c,sa,sb,sc]=tri;
        const det=(sb[0]-sa[0])*(sc[1]-sa[1])-(sc[0]-sa[0])*(sb[1]-sa[1]);
        if(Math.abs(det)<1e-5)throw Error('Degenerate source grid');
        const A=((b.x-a.x)*(sc[1]-sa[1])-(c.x-a.x)*(sb[1]-sa[1]))/det;
        const C=((c.x-a.x)*(sb[0]-sa[0])-(b.x-a.x)*(sc[0]-sa[0]))/det;
        const B=((b.y-a.y)*(sc[1]-sa[1])-(c.y-a.y)*(sb[1]-sa[1]))/det;
        const D=((c.y-a.y)*(sb[0]-sa[0])-(b.y-a.y)*(sc[0]-sa[0]))/det;
        const E=a.x-A*sa[0]-C*sa[1],F=a.y-B*sa[0]-D*sa[1];
        ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.lineTo(c.x,c.y);ctx.closePath();ctx.clip();
        ctx.setTransform(A,B,C,D,E,F);
        // Draw ONLY the source tile, rather than redraw entire huge source texture.
        ctx.drawImage(texture,sx,sy,sw,sh,sx,sy,sw,sh);
        ctx.restore();
      }
    }
  }
  ctx.globalAlpha=1;
  return screen;
}
