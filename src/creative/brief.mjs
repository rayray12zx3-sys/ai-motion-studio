import {validateAdvancedSpec} from './advanced.mjs';
import {validateSpec} from '../free/scene.mjs';

// Pure, constrained brief -> SceneSpec. No network, I/O, runtime expressions or
// change to the existing timeline/camera/approved-asset contract.
const exact=(x,ks)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
  Object.keys(x).sort().join(',')===ks.slice().sort().join(',');
const ids=['opener','control','data','resolve'];
export function validateMotionBrief(b){
  if(!exact(b,['version','kind','id','style_id','message','beats'])||b.version!==1||
    b.kind!=='motion-brief-v1'||typeof b.id!=='string'||
    !/^[a-z][a-z0-9-]{2,39}$/.test(b.id)||
    !['studio','learning-lab'].includes(b.style_id)||
    typeof b.message!=='string'||b.message.length<4||b.message.length>140||
    /[\p{C}]/u.test(b.message)||!Array.isArray(b.beats)||b.beats.length!==4)
    throw new Error('Unsupported motion brief');
  b.beats.forEach((beat,i)=>{
    if(!exact(beat,['segment_id','headline','subtitle','primary','secondary','footer'])||
      beat.segment_id!==ids[i])throw new Error('Invalid brief beats');
    for(const v of [beat.headline,beat.subtitle,beat.primary,beat.secondary,beat.footer])
      if(typeof v!=='string'||!v.trim()||[...v].length>34)
        throw new Error('Invalid brief lettering');
    validateSpec({title:beat.headline,subtitle:beat.subtitle});
    validateSpec({title:beat.primary,subtitle:beat.secondary});
    validateSpec({title:beat.footer,subtitle:beat.primary});
  });
}
export function compileMotionBrief(brief,template){
  validateMotionBrief(brief);
  validateAdvancedSpec(template);
  const spec=structuredClone(template);
  spec.copy=brief.beats.map(({segment_id,headline,subtitle})=>({segment_id,headline,subtitle}));
  spec.art_direction={style_id:brief.style_id,
    panels:brief.beats.map(({primary,secondary,footer})=>({primary,secondary,footer}))};
  if(brief.style_id==='learning-lab'){
    spec.motion.background='#E9F1EA';
    spec.motion.objects.find(o=>o.id==='signal').color='#0F887D';
    spec.motion.objects.find(o=>o.id==='track').color='#244A4C';
  }
  validateAdvancedSpec(spec);
  return spec;
}
