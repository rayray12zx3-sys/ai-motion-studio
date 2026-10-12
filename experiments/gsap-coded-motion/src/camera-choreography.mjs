/** Reusable C1-continuous real-3D camera motion, deterministically driven by film frames. */
const fields=['x','y','z','lookX','lookY','lookZ'];
const err=message=>{throw Error(message)};
const valid=value=>typeof value==='number'&&Number.isFinite(value);
const hermite=(a,b,ma,mb,u,h)=>{const u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*a+(u3-2*u2+u)*h*ma+(-2*u3+3*u2)*b+(u3-u2)*h*mb;};
export function compileCameraChoreography({frames,keys}){
 if(!Number.isInteger(frames)||frames<30||!Array.isArray(keys)||keys.length<2)err('Camera needs 2+ keys and >=30 frames');
 const k=keys.map((p,i)=>{
  if(!Number.isInteger(p.frame)||p.frame<0||p.frame>=frames||(i&&p.frame<=keys[i-1].frame))err('Camera frames must strictly increase');
  for(const name of fields)if(!valid(p[name]))err('Camera key missing finite '+name);
  if(p.z<4)err('Camera must remain in a sane positive depth range');
  if(Math.hypot(p.x-p.lookX,p.y-p.lookY,p.z-p.lookZ)<.2)err('Camera cannot coincide with its look-at target');
  return Object.freeze(Object.fromEntries(['frame',...fields].map(x=>[x,p[x]])));
 });
 if(k[0].frame!==0||k.at(-1).frame!==frames-1)err('Camera must cover the full film');
 const tangent=(idx,name)=>{
  if(idx===0)return (k[1][name]-k[0][name])/(k[1].frame-k[0].frame);
  if(idx===k.length-1)return (k[idx][name]-k[idx-1][name])/(k[idx].frame-k[idx-1].frame);
  return (k[idx+1][name]-k[idx-1][name])/(k[idx+1].frame-k[idx-1].frame);
 };
 const at=frame=>{
  if(!Number.isInteger(frame)||frame<0||frame>=frames)err('Camera seek outside film');
  let index=k.length-2;for(let i=0;i<k.length-1;i++)if(frame<=k[i+1].frame){index=i;break;}
  const a=k[index],b=k[index+1],h=b.frame-a.frame,u=(frame-a.frame)/h,pose={frame};
  for(const name of fields)pose[name]=hermite(a[name],b[name],tangent(index,name),tangent(index+1,name),u,h);
  if(pose.z<2||Math.hypot(pose.x-pose.lookX,pose.y-pose.lookY,pose.z-pose.lookZ)<.2)err('Interpolated unsafe camera pose');
  return Object.freeze(pose);
 };
 return Object.freeze({frames,keyframes:Object.freeze(k),at});
}
export function auditCameraMotion(path,{maxSpeedPerFrame=.25,maxAccelerationPerFrame=.08}={}){
 if(!(maxSpeedPerFrame>0&&maxAccelerationPerFrame>0))err('Positive camera motion limits required');
 const issues=[];let last=null,prevVelocity=null;
 for(let f=0;f<path.frames;f++){
  const q=path.at(f);
  if(last){
   const vel=Math.hypot(q.x-last.x,q.y-last.y,q.z-last.z);
   if(vel>maxSpeedPerFrame)issues.push({frame:f,kind:'camera-speed',value:vel});
   if(prevVelocity!==null&&Math.abs(vel-prevVelocity)>maxAccelerationPerFrame)issues.push({frame:f,kind:'camera-acceleration',value:Math.abs(vel-prevVelocity)});
   prevVelocity=vel;
  }
  last=q;
 }
 return {passed:issues.length===0,issues,frames:path.frames};
}
