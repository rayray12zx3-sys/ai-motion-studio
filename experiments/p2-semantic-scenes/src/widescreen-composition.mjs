/**
 * Opt-in landscape review composition for the SAME authored 9:16 source graph.
 * This is a reusable responsive EDITORIAL split layout, not a re-authoring of
 * company footage, a native product UI, or a claim of full multi-aspect parity.
 * No runtime assets, model/API calls, dependency, wall-clock or randomness.
 */
import {inspectFrame,renderSvgFrame} from './semantic-scenes.mjs';

const W=1920,H=1080;
const escapeText=value=>String(value).replace(/&/g,'&amp;')
  .replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  .replace(/'/g,'&apos;');
const smooth=x=>{const u=Math.min(1,Math.max(0,x));return u*u*(3-2*u);};
const rect=(x,y,w,h,fill,r=0,stroke='none')=>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const label=(v,x,y,size,fill,weight=500,extra='')=>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${escapeText(v)}</text>`;

// Never cut a caption because it is not in the pre-authored short-fixture set.
// Word-wrap words, or bounded Unicode code points for unspaced-language text.
function lines(value,max=23){
  const chunks=String(value).split(/\s+/u).flatMap(word=>{
    const points=Array.from(word),out=[];
    while(points.length>max)out.push(points.splice(0,max).join(''));
    if(points.length)out.push(points.join(''));
    return out;
  });
  const output=[];let current='';
  for(const token of chunks){
    if(current&&(Array.from(current).length+1+Array.from(token).length)>max){
      output.push(current);current=token;
    } else current=current?current+' '+token:token;
  }
  if(current)output.push(current);
  if(output.length>4)throw Error('Widescreen headline exceeds bounded 4-line review layout');
  return output;
}
export function renderWidescreenFrame(plan,frame){
  if(!plan||plan.profile?.width!==1080||plan.profile?.height!==1920||
     plan.profile?.fps!==30||plan.profile?.frames!==360){
    throw Error('Isolated 16:9 review requires validated P2 original 1080x1920/30/360 authored graph');
  }
  const f=inspectFrame(plan,frame),s=f.shot,t=plan.theme;
  const index=plan.shots.indexOf(s);
  const entity=plan.entities.find(e=>e.id===s.focusId);
  const action=plan.operations.find(o=>o.entityId===s.focusId);
  const outcome=action&&frame>=action.frame;
  const stage=outcome?'RESULT':action&&s.id===action.shotId?'ACTION':'SOURCE';
  const titleLines=lines(s.title),subSize=Math.min(42,1025/Math.max(8,Array.from(s.subtitle).length*.57));
  const cardY=628;
  const newShotIn=smooth((frame-s.start)/(plan.profile.fps*.55));
  const portrait=renderSvgFrame(plan,frame);
  // The left view is the unchanged existing semantic player (source of truth).
  // The right view is a genuinely different landscape editorial hierarchy.
  const out=[
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    rect(0,0,W,H,t.background),
    rect(43,24,594,1032,t.ink,34),
    rect(52,33,576,1014,t.surface,29),
    `<g id="original-semantic-film" transform="translate(70 58) scale(0.5)">`,
    portrait,'</g>',
    `<g id="responsive-editorial-panel" data-shot="${escapeText(s.id)}" data-stage="${stage}">`,
    label('AI MOTION STUDIO  /  WIDESCREEN RECOMPOSITION',730,83,20,t.muted,700),
    rect(730,111,1095,3,t.accent),
    label('SHOT '+String(index+1).padStart(2,'0')+' / '+String(plan.shots.length).padStart(2,'0')+
      '  ·  '+s.layout.toUpperCase(),730,176,31,t.muted,750),
    `<g opacity="${newShotIn.toFixed(4)}" transform="translate(0 ${((1-newShotIn)*35).toFixed(3)})">`,
    ...titleLines.map((part,i)=>label(part,730,277+i*83,Math.min(78,1040/Math.max(7,Array.from(part).length*.60)),t.onBackground,820)),
    label(s.subtitle,734,589,subSize,t.muted,540),
    '</g>',
    rect(729,cardY,1097,276,t.surface,28,t.accent),
    rect(729,cardY,12,276,t.accent,6),
    label(stage+' / PERSISTENT OBJECT',776,cardY+60,27,t.surfaceMuted,730),
    label(entity.label,776,cardY+139,Math.min(54,945/Math.max(8,Array.from(entity.label).length*.64)),t.ink,760),
    label(f.state[entity.id],776,cardY+221,Math.min(56,945/Math.max(8,Array.from(f.state[entity.id]).length*.64)),
      outcome?t.accentText:t.surfaceMuted,760),
    rect(729,1006,1097,7,t.muted,3),
    rect(729,1006,Math.max(3,1097*(frame+1)/360),7,t.accent,3),
    label('SOURCE → OPERATION → RESULT  /  '+(frame+1)+' OF 360',730,1048,22,t.muted,700),
    '</g>','</svg>'
  ];
  return out.join('');
}
export const WIDESCREEN_PROFILE=Object.freeze({width:W,height:H,fps:30,frames:360});
