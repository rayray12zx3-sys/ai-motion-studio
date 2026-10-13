/**
 * Opt-in, data-driven NATIVE 16:9 composition of the existing bounded P2 graph.
 * Draws semantic objects, action and environment directly in landscape
 * coordinates. Does NOT embed/upscale the 9:16 SVG film, change the scene
 * schema, fetch media, execute a model or touch the official Canvas renderer.
 */
import {inspectFrame} from './semantic-scenes.mjs';
import {renderOriginalLayers} from './original-depth-layers.mjs';

export const NATIVE_LANDSCAPE_PROFILE=Object.freeze({width:1920,height:1080,fps:30,frames:360});
const {width:W,height:H}=NATIVE_LANDSCAPE_PROFILE;
const round=n=>Number(n.toFixed(3));
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const q=clamp(n);return q*q*(3-2*q);};
const mix=(a,b,t)=>a+(b-a)*t;
const esc=value=>String(value).replace(/&/g,'&amp;')
  .replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  .replace(/'/g,'&apos;');
const rectangle=(x,y,w,h,fill,r=0,stroke='none',width=1)=>
  `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${round(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const text=(value,x,y,size,fill,weight=600)=>
  `<text x="${round(x)}" y="${round(y)}" font-family="sans-serif" font-size="${round(size)}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;

// Entire authored text is shown; reject layouts too dense for this R&D lane.
function wrap(value,maxCharacters,maxRows){
  const words=String(value).trim().split(/\s+/u);
  const tokens=words.flatMap(word=>{
    const chars=Array.from(word),pieces=[];
    while(chars.length>maxCharacters)pieces.push(chars.splice(0,maxCharacters).join(''));
    if(chars.length)pieces.push(chars.join(''));
    return pieces;
  });
  const output=[];let line='';
  for(const token of tokens){
    if(line&&Array.from(line+' '+token).length>maxCharacters){
      output.push(line);line=token;
    } else line=line?line+' '+token:token;
  }
  if(line)output.push(line);
  if(output.length>maxRows)throw Error('Native landscape text needs a new layout, refusing truncation');
  return output;
}
const MAP=Object.freeze({x:972,y:215,w:785,h:625});
const point=p=>({x:round(MAP.x+p.x*MAP.w/1000),y:round(MAP.y+p.y*MAP.h/1000)});
const heroBox=hero=>{
  const p=point(hero);return {...p,w:round(hero.w*MAP.w/1000),h:round(hero.h*MAP.h/1000*1.22)};
};
const labelSize=(s,w,upper=41)=>Math.min(upper,w/Math.max(5,Array.from(s).length*.63));
const stage=(plan,s,frame,state,action,hero)=>{
  const t=plan.theme,p=plan.profile;
  const shotFrame=frame-s.start, entry=ease(shotFrame/(p.fps*.48));
  const context=s.context;
  const pieces=[
    `<g id="native-landscape-stage" data-layout="${s.layout}" data-shot="${esc(s.id)}">`,
    rectangle(900,153,936,789,t.surface,34,t.muted,2),
    rectangle(900,153,936,96,t.ink,34),
    rectangle(901,217,934,35,t.ink),
    text('LIVE STORYBOARD  /  '+s.layout.toUpperCase(),940,214,24,t.surface,700),
    `<clipPath id="landscape-content-clip"><rect x="918" y="258" width="900" height="667" rx="20"/></clipPath>`,
    '<g clip-path="url(#landscape-content-clip)">',
    // Original authored multi-depth layers remain a separate moving visual
    // ingredient; transform the normalized P2 stage into the landscape zone.
    `<g id="landscape-authored-rear" transform="translate(957 257) scale(0.79 0.345)">`,
    renderOriginalLayers(plan,s,frame,'rear'),'</g>',
  ];
  if(s.layout==='board'){
    pieces.push(
      text('MAKE A CHOICE  /  SCHEDULE',974,660,23,t.surfaceMuted,700),
      rectangle(963,684,794,178,t.background,20),
      ...context.slice(0,3).flatMap((line,i)=>{
        const x=982+i*254;
        return [rectangle(x,710,238,120,t.surface,16,i===1?t.accent:t.muted,2),
          text(line,x+17,766,labelSize(line,196,25),t.ink,670)];
      })
    );
  }else if(s.layout==='track'){
    pieces.push(
      text('SELECT A VERIFIED SOURCE RANGE  /  FICTIONAL',974,660,23,t.surfaceMuted,690),
      rectangle(967,684,783,155,t.background,18),
      ...Array.from({length:45},(_,i)=>{
        const amp=16+80*Math.abs(Math.sin(i*.31)*Math.cos(i*.21));
        return rectangle(988+i*16.5,760-amp/2,7,amp,t.accent,3);
      })
    );
    if(action&&frame>=action.gesture.start){
      const q=ease((frame-action.gesture.start)/Math.max(1,action.frame-action.gesture.start));
      pieces.push(`<rect id="native-source-selection" x="1327" y="705" width="${round(220*q)}" height="99" rx="9" fill="${t.accent}" fill-opacity=".17" stroke="${t.accent}" stroke-width="2"/>`);
    }
  }else if(action&&frame>=action.frame){
    pieces.push(
      `<g id="native-result-material" opacity="${entry.toFixed(4)}">`,
      rectangle(972,652,780,204,t.background,21),
      text('RESULT  /  '+(s.layout.toUpperCase()),995,699,24,t.surfaceMuted,700),
      text(state,995,765,labelSize(state,720,57),t.onBackground,790),
      text('SAME OBJECT / '+s.focusId,995,821,23,t.muted,650),
      '</g>'
    );
  }else{
    pieces.push(
      text('SOURCE  /  ORIGINAL PRODUCT CONTEXT',974,660,22,t.surfaceMuted,700),
      ...context.slice(0,3).flatMap((line,i)=>{
        const x=973,y=692+i*56;
        return [rectangle(x,y-27,779,46,t.background,11),
          text(line,x+19,y+3,labelSize(line,736,29),t.ink,610)];
      })
    );
  }
  pieces.push(
    `<g id="landscape-authored-front" transform="translate(957 257) scale(0.79 0.345)">`,
    renderOriginalLayers(plan,s,frame,'front'),'</g>'
  );
  if(action&&s.id===action.shotId&&frame>=action.gesture.start&&frame<=action.frame+11){
    const q=ease((frame-action.gesture.start)/Math.max(1,action.frame-action.gesture.start));
    const source=point(action.gesture.from),dest=point(action.gesture.to);
    const xy={x:mix(source.x,dest.x,q),y:mix(source.y,dest.y,q)};
    pieces.push(
      `<g id="native-operation" data-gesture="${action.trigger}" data-progress="${round(q)}">`,
      `<path d="M ${source.x} ${source.y} L ${dest.x} ${dest.y}" stroke="${t.accent}" stroke-width="3" stroke-dasharray="9 9" fill="none"/>`,
      `<path d="M ${round(xy.x)} ${round(xy.y)} l 0 34 10 -11 13 21 10 -5 -13 -21 14 0 z" fill="${t.ink}" stroke="${t.surface}" stroke-width="4"/>`,
      '</g>'
    );
  }
  const e=plan.entities.find(item=>item.id===s.focusId);
  // Render the same actual state/hero trajectory from inspectFrame(), but
  // geometry is rebuilt in native landscape space rather than copying SVG.
  pieces.push(
    `<g id="native-persistent-hero" data-entity="${esc(e.id)}" data-x="${hero.x}" data-y="${hero.y}" data-width="${hero.w}" data-height="${hero.h}">`,
    rectangle(hero.x,hero.y,hero.w,Math.max(hero.h,63),t.surface,18,t.accent,3),
    rectangle(hero.x+10,hero.y+10,8,Math.max(43,hero.h-20),t.accent,4),
    text(e.label,hero.x+31,hero.y+Math.max(30,hero.h*.44),
      labelSize(e.label,Math.max(1,hero.w-45),38),t.ink,750),
    text(state,hero.x+31,hero.y+Math.max(57,hero.h*.79),
      labelSize(state,Math.max(1,hero.w-45),28),t.surfaceMuted,620),
    '</g>'
  );
  if(action&&frame>=action.frame){
    const alpha=ease((frame-action.frame)/Math.max(1,p.fps*.4));
    pieces.push(`<g id="native-action-feedback" opacity="${alpha.toFixed(4)}">`,
      rectangle(977,884,774,43,t.accent,10),
      text(action.resultLabel,992,915,labelSize(action.resultLabel,734,25),t.surface,700),
      '</g>');
  }
  pieces.push('</g>','</g>');
  return pieces.join('');
};
export function renderNativeLandscapeFrame(plan,frame){
  if(!plan||plan.profile?.width!==1080||plan.profile?.height!==1920||
    plan.profile?.fps!==30||plan.profile?.frames!==360)
    throw Error('Opt-in native-landscape research requires the validated 1080x1920 30fps/360f P2 graph');
  const state=inspectFrame(plan,frame),shot=state.shot,t=plan.theme;
  const focus=plan.entities.find(e=>e.id===shot.focusId);
  const action=plan.operations.find(o=>o.entityId===focus.id);
  const status=state.state[focus.id],position=heroBox(state.hero);
  const shotIndex=plan.shots.indexOf(shot);
  const q=ease((frame-shot.start)/(plan.profile.fps*.60));
  const headline=wrap(shot.title,14,3);
  const subtitle=wrap(shot.subtitle,34,3);
  const parts=[
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    rectangle(0,0,W,H,t.background),
    rectangle(0,0,21,H,t.accent),
    text('AI MOTION STUDIO  /  NATIVE LANDSCAPE R&D',86,94,23,t.muted,710),
    rectangle(86,121,1750,3,t.accent),
    text('STORY  /  '+String(shotIndex+1).padStart(2,'0')+' OF '+String(plan.shots.length).padStart(2,'0'),
      91,203,33,t.muted,720),
    `<g id="native-landscape-editorial" opacity="${q.toFixed(4)}" transform="translate(0 ${round((1-q)*32)})">`,
    ...headline.map((line,i)=>text(line,88,323+i*99,
      Math.min(76,690/Math.max(5,Array.from(line).length*.73)),t.onBackground,810)),
    ...subtitle.map((line,i)=>text(line,93,407+headline.length*99+i*54,
      Math.min(38,739/Math.max(8,Array.from(line).length*.58)),t.muted,530)),
    '</g>',
    stage(plan,shot,frame,status,action,position),
    text('SOURCE → ACTION → RESULT',92,933,25,t.muted,710),
    rectangle(88,987,1749,8,t.muted,4),
    rectangle(88,987,Math.max(3,1749*(frame+1)/360),8,t.accent,4),
    text(String(frame+1).padStart(3,'0')+' / 360    ·    '+shot.layout.toUpperCase(),
      90,1041,23,t.muted,680),
    '</svg>'
  ];
  return parts.join('');
}
