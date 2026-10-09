// Original reusable timing functions: analytic, deterministic and bounded.
// The user's approved video may choose other profiles; these only apply to
// public, synthetic M12 art-direction experiments.
export const MOTION_PROFILES=Object.freeze({
  intro:'ease-out-cubic',
  affordance:'ease-out-back',
  tap:'anticipation-squash',
  condense:'ease-in-out-quad',
  verify:'damped-bounce',
  expand:'ease-out-back',
  directManipulation:'ease-in-out-sine',
  reward:'ease-out-back',
  exit:'ease-in-out-cubic'
});
const clamp=t=>Math.max(0,Math.min(1,t));
export function easeValue(name,t){
 if(!Number.isFinite(t))throw new Error('Easing input must be finite');
 const x=clamp(t);
 if(x===0||x===1)return x;
 switch(name){
 case 'linear':return x;
 case 'ease-out-cubic':return 1-(1-x)**3;
 case 'ease-in-out-cubic':return x<.5?4*x**3:1-(-2*x+2)**3/2;
 case 'ease-in-out-quad':return x<.5?2*x*x:1-(-2*x+2)**2/2;
 case 'ease-in-out-sine':return -(Math.cos(Math.PI*x)-1)/2;
 case 'ease-out-back':{
   // Restrained 3% geometric overshoot; settles exactly on its keyframe.
   const c1=.9,c3=c1+1;
   return 1+c3*(x-1)**3+c1*(x-1)**2;
 }
 default:throw new Error('Unknown easing profile');
 }
}
export function easeBetween(frame,start,end,curve){
 if(![frame,start,end].every(Number.isFinite)||end<=start)
  throw new Error('Invalid easing interval');
 return easeValue(curve,(frame-start)/(end-start));
}
export function bouncePulse(frame,start,duration,strength=.13){
 if(![frame,start,duration,strength].every(Number.isFinite)||
    duration<=0||strength<0||strength>.25)throw new Error('Invalid bounce impulse');
 const x=(frame-start)/duration;
 if(x<=0||x>=1)return 0;
 return strength*Math.sin(2.4*Math.PI*x)*Math.exp(-1.4*x)*Math.sin(Math.PI*x);
}
