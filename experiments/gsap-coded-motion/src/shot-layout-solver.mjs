/**
 * Per-shot art-directed composition fit for real perspective 3D hero objects.
 * Distinct original rigs no longer share the smallest globally forced scale.
 * Static per-shot offsets and scales are chosen across their ENTIRE active
 * camera path, never adjusted per frame to evade the title.
 */
import {projectHeroBounds,assertNoProtectedOcclusion} from './three-layout-audit.mjs';
const finite=v=>typeof v==='number'&&Number.isFinite(v);
export function fitPerShotHeroLayout({THREE,entries,protectedRegions,width,height,
  lower=.16,upper=1.20,offsets=[-1.65,-1.1,-.55,0,.55,1.1,1.65],
  iterations=10,viewportMargin=18,safetyMargin=20}={}){
 if(!THREE?.Box3||!Array.isArray(entries)||entries.length<2||!Array.isArray(protectedRegions)||!protectedRegions.length)throw Error('True 3D rigs and protected text regions required');
 if(![width,height,lower,upper,iterations,viewportMargin,safetyMargin].every(finite)||lower<=0||upper<=lower||iterations<1||viewportMargin<0||safetyMargin<0)throw Error('Invalid composition fit bounds');
 if(!Array.isArray(offsets)||!offsets.length||offsets.length>12||offsets.some(n=>!finite(n)||Math.abs(n)>4))throw Error('Unsafe spatial offset candidate');
 const padded=protectedRegions.map(({name,bounds})=>({name,bounds:{
  left:bounds.left-safetyMargin,right:bounds.right+safetyMargin,
  top:bounds.top-safetyMargin,bottom:bounds.bottom+safetyMargin
 }}));
 const fits=[];
 for(const entry of entries){
  const {rig,start,end,id}=entry;
  if(!rig?.hero?.isObject3D||typeof rig.seekFrame!=='function'||!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>rig.frames||end-start<3||typeof id!=='string'||!id)throw Error('Invalid isolated shot rig/time range');
  const baseY=rig.hero.position.y;
  const feasible=(scale,offset,stride=1)=>{
   rig.hero.position.y=baseY+offset;
   rig.hero.scale.setScalar(scale);
   for(let f=start;f<end;f+=stride){
    rig.seekFrame(f);
    const b=projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width,height});
    if(b.left<viewportMargin||b.right>width-viewportMargin||b.top<viewportMargin||b.bottom>height-viewportMargin)return false;
    if(!assertNoProtectedOcclusion({hero:b,protectedRegions:padded}).passed)return false;
   }
   const final=end-1;
   rig.seekFrame(final);
   const b=projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width,height});
   return b.left>=viewportMargin&&b.right<=width-viewportMargin&&b.top>=viewportMargin&&b.bottom<=height-viewportMargin&&assertNoProtectedOcclusion({hero:b,protectedRegions:padded}).passed;
  };
  let best=null;
  for(const offset of offsets){
   if(!feasible(lower,offset,Math.max(1,Math.round((end-start)/40))))continue;
   let lo=lower,hi=upper;
   for(let i=0;i<iterations;i++){
    const mid=(lo+hi)/2;
    if(feasible(mid,offset,Math.max(1,Math.round((end-start)/65))))lo=mid;else hi=mid;
   }
   // Validate every frame at the proposed scale; never hide a collision
   // behind sparse samples or by allowing per-frame scale pumping.
   if(!feasible(lo,offset,1)){
    let l=lower,h=lo;
    if(!feasible(l,offset,1))continue;
    for(let i=0;i<iterations;i++){
     const m=(l+h)/2;
     if(feasible(m,offset,1))l=m;else h=m;
    }
    lo=l;
   }
   if(!feasible(lo,offset,1))continue;
   if(!best||lo>best.scale)best={id,scale:lo,offset};
  }
  if(!best)throw Error('No whole-shot 3D hero layout clears typography and viewport for '+id);
  rig.hero.position.y=baseY+best.offset;
  rig.hero.scale.setScalar(best.scale);
  rig.seekFrame(start);
  const mid=start+Math.floor((end-start)/2),frameBounds=(()=>{
    rig.seekFrame(mid);
    return projectHeroBounds({THREE,object:rig.hero,camera:rig.camera,width,height});
  })();
  rig.seekFrame(0);
  fits.push(Object.freeze({...best,start,end,projectedHeight:frameBounds.bottom-frameBounds.top,projectedWidth:frameBounds.right-frameBounds.left,checkedFrames:end-start}));
 }
 return Object.freeze({rigCount:fits.length,perShot:Object.freeze(fits),safeZoneMargin:safetyMargin,viewportMargin,stableForEntireShot:true});
}
