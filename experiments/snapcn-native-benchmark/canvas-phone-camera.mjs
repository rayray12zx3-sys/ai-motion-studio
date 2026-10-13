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
  // Premium original light-metal edge treatment, closer to the user-approved
  // native PhoneFrame source aesthetic. It is an original Canvas drawing,
  // not the upstream React/CSS implementation, and includes no licensed media.
  roundedRect(c,7,7,626,1298,107);
  c.shadowColor='rgba(0,0,0,.72)';c.shadowBlur=20;c.shadowOffsetY=11;
  c.fillStyle='#F2F6FA';c.fill();
  c.shadowColor='transparent';c.shadowBlur=0;
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=5;
  roundedRect(c,10,10,620,1292,104);c.stroke();
  const metallic=c.createLinearGradient(0,0,640,1312);
  metallic.addColorStop(0,'#F9FCFF');
  metallic.addColorStop(.40,'#D9E0E8');
  metallic.addColorStop(.75,'#FFFFFF');
  metallic.addColorStop(1,'#ACBACD');
  roundedRect(c,16,16,608,1280,99);c.fillStyle=metallic;c.fill();
  roundedRect(c,25,25,590,1262,85);c.fillStyle='#0C1017';c.fill();
  c.save();roundedRect(c,29,29,582,1254,76);c.clip();
  c.drawImage(img,29,29,582,1254);
  c.restore();
  roundedRect(c,254,31,132,35,18);c.fillStyle='#080B11';c.fill();
  c.fillStyle='#C9D5E5';c.globalAlpha=.30;c.beginPath();c.arc(359,48,5,0,Math.PI*2);c.fill();c.globalAlpha=1;
  // Thin physical side controls make the side-angle shot read as a device,
  // rather than a floating rounded app screenshot.
  c.fillStyle='#C5CED9';
  roundedRect(c,4,210,5,76,2);c.fill();
  roundedRect(c,4,316,5,48,2);c.fill();
  roundedRect(c,631,294,5,115,2);c.fill();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;
  roundedRect(c,17,17,606,1278,99);c.stroke();
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
  // Source-plane underpaint prevents subpixel cracks between anti-aliased
  // mesh triangle edges. The underpaint is CLIPPED to the phone silhouette
  // and is fully covered except where independent triangle rasterisation
  // left hairline gaps. Without it the synthetic UI develops visible grids.
  const [outerTL,outerTR,outerBR,outerBL]=projectTile(0,0,320,656,frame);
  ctx.save();ctx.beginPath();
  ctx.moveTo(outerTL.x,outerTL.y);ctx.lineTo(outerTR.x,outerTR.y);
  ctx.lineTo(outerBR.x,outerBR.y);ctx.lineTo(outerBL.x,outerBL.y);
  ctx.closePath();ctx.clip();
  ctx.setTransform((outerTR.x-outerTL.x)/texture.width,
    (outerTR.y-outerTL.y)/texture.width,
    (outerBL.x-outerTL.x)/texture.height,
    (outerBL.y-outerTL.y)/texture.height,
    outerTL.x,outerTL.y);
  ctx.drawImage(texture,0,0);ctx.restore();
  // Use one perspective-warped vertical strip per narrow column, avoiding
  // the raster anti-alias hairlines created by a grid of independently clipped
  // triangles. No new binary or rendering library is required.
  const nx=96,sw=texture.width/nx,fullH=texture.height;
  for(let col=0;col<nx;col++){
    const sx=col*sw;
    const [tl,tr,br,bl]=projectTile(sx/2,0,sw/2,656,frame);
    const a=(tr.x-tl.x)/sw,b=(tr.y-tl.y)/sw;
    const c=(bl.x-tl.x)/fullH,d=(bl.y-tl.y)/fullH;
    const e=tl.x-a*sx,f=tl.y-b*sx;
    ctx.save();
    ctx.beginPath();ctx.moveTo(tl.x,tl.y);ctx.lineTo(tr.x,tr.y);
    ctx.lineTo(br.x,br.y);ctx.lineTo(bl.x,bl.y);ctx.closePath();ctx.clip();
    ctx.setTransform(a,b,c,d,e,f);
    ctx.drawImage(texture,sx,0,sw,fullH,sx,0,sw,fullH);
    ctx.restore();
  }
  ctx.globalAlpha=1;
  return screen;
}
