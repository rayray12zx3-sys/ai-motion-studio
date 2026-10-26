/**
 * Original, self-contained source-safe game-show-flat adapter for fictional data.
 * Genre reference only: Lemo-Opuscar Game Show Flat, pinned main commit 413a6bd6d78ebd3bdd5abaec9538a26867f890df.
 * No upstream demo footage, characters, voices, fonts or source code are copied.
 * Does NOT claim to be the official Lemo or pinned HyperFrames renderer.
 */
export const PROVENANCE=Object.freeze({
  upstream:'lemomo-ai/lemo-opuscar',
  upstreamCommit:'413a6bd6d78ebd3bdd5abaec9538a26867f890df',
  styleSlug:'game-show',styleGitBlob:'7a4a01447c26870379b6fd914894889444b642f6',
  upstreamLicense:'MIT',demoFootageLicense:'CC-BY-4.0-WITH_VOICE_EXCEPTIONS',
  reuseMode:'ORIGINAL_GENRE_GRAMMAR_ONLY',
  realHyperframesApplied:false,artApproved:false
});
export const LOOK=Object.freeze({
  ink:'#17233B',night:'#18283F',secondary:'#243D62',teal:'#6DDFCA',
  yellow:'#FFCD47',orange:'#FF8968',paper:'#FFF9E8',
  twFont:'Noto Sans CJK TC',outlinePx:4,shadow:'hard-offset',
  background:'full-bleed',safetyPolicy:'essential-content-only',
  engine:'pure SVG based on frame number',
});
function assert(ok,msg){if(!ok)throw Error(msg)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const clip=(a)=>Math.max(0,Math.min(1,a));
const ease=t=>{t=clip(t);return t*t*(3-2*t)};
/** Contract intentionally accepts only PUBLIC SYNTHETIC data. */
export function makeContract(input){
  assert(input&&input.contentClass==='public-synthetic','no company or private data in public adapter');
  assert(Array.isArray(input.rounds)&&input.rounds.length===3,'requires exactly 3 fictional rounds');
  for(const q of input.rounds){
    assert(typeof q.word==='string'&&q.word.length>0&&q.word.length<=24&&!/[<>]/.test(q.word),'bad word');
    assert(Array.isArray(q.options)&&q.options.length===4,'four fictional options');
    for(const opt of q.options)assert(typeof opt==='string'&&opt.length>0&&opt.length<=12&&!/[<>]/.test(opt),'bad option');
  }
  const fps=input.fps??30,frames=input.frames??95;
  assert(fps===30&&frames===95,'isolated preview supports 95f@30 only');
  const title=input.title??'猜字遊戲';
  assert(typeof title==='string'&&title.length<=8&&title.length>0&&!/[<>]/.test(title),'bad title');
  return Object.freeze({contentClass:'public-synthetic',title,rounds:input.rounds.map(q=>({word:q.word,options:[...q.options]})),fps,frames,
    eventMap:{iconPress:17,mascotLands:35,select:[44,65],success:[45,66],exit:[48,70],thirdUnanswered:94},provenance:PROVENANCE});
}
export function frameState(p,f){
  assert(Number.isInteger(f)&&f>=0&&f<p.frames,'frame out of bounds');
  const easing=(start)=>ease((f-start)/12);
  const old=(f<48?0:f<70?1:2);
  const transition=f>=48&&f<60?{old:0,next:1,shift:-527*easing(48)}:
    f>=70&&f<82?{old:1,next:2,shift:-527*easing(70)}:null;
  const active=transition?transition.next:old;
  const selected=active<2&&f>=[44,65][active];
  const correct=active<2&&f>=[45,66][active];
  const lift=f>=35?12*Math.sin(Math.PI*((f-35)%16)/16)**2:0;
  return Object.freeze({frame:f,active,selected,correct,transition,
    iconPressed:f>=17&&f<=23,mascot: {size:[62,58],x:399,y:f<=35?184+(289-184)*(1-Math.pow(1-clip((f-21)/14),3)):289-lift},
    misleadingQ3Success:false,style:'game-show-flat-tw'});
}
function rect(x,y,w,h,fill,r=12,stroke=LOOK.ink,sw=4){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`}
function txt(t,x,y,size,fill,more=''){return `<text x="${x}" y="${y}" font-size="${size}" font-family="${LOOK.twFont}, sans-serif" font-weight="900" fill="${fill}" ${more}>${esc(t)}</text>`}
function card(q,i,state,x=54,y=350){
  const selected=i<2&&state.frame>=[44,65][i];
  const correct=i<2&&state.frame>=[45,66][i];
  let svg=`<g transform="translate(${x},${y})">${rect(10,12,421,252,LOOK.ink,20,'none',0)}${rect(0,0,420,253,LOOK.paper,20)}`;
  svg+=`${rect(20,17,118,30,LOOK.yellow,15,LOOK.ink,2)}${txt('ROUND '+String(i+1).padStart(2,'0'),26,39,15,LOOK.ink)}`;
  svg+=txt(q.word,22,106,q.word.length>10?31:42,LOOK.ink);
  svg+=txt('CHOOSE THE MEANING',23,127,11,LOOK.secondary);
  q.options.forEach((option,j)=>{const xx=20+(j%2)*202,yy=137+Math.floor(j/2)*54;
    svg+=rect(xx+2,yy+4,190,44,LOOK.ink,9,'none',0);
    svg+=rect(xx,yy,188,42,j===0&&selected?LOOK.yellow:'#FFFFFF',9,LOOK.ink,2);
    svg+=txt(option,xx+94,yy+29,21,LOOK.ink,'text-anchor="middle"');});
  if(correct)svg+=rect(263,14,72,32,LOOK.teal,16,LOOK.ink,2)+txt('答對！',268,37,19,LOOK.ink);
  svg+='</g>';return svg;
}
/** Public synthetic SVG renderer proves a style affects pixels, not just metadata. */
export function frameSvg(p,f){
  const s=frameState(p,f);
  let z=`<svg xmlns="http://www.w3.org/2000/svg" width="540" height="960" viewBox="0 0 540 960">${rect(0,0,540,960,LOOK.night,0,'none',0)}`;
  for(let a=0;a<360;a+=30){let r=(a-15)*Math.PI/180,rr=a*Math.PI/180;z+=`<path d="M 279 380 L ${279+1100*Math.cos(r)} ${380+1100*Math.sin(r)} L ${279+1100*Math.cos(rr)} ${380+1100*Math.sin(rr)} Z" fill="#203551"/>`}
  z+=`<path d="M0 665L540 725L540 960L0 960Z" fill="#345578"/>`;
  z+=`<path d="M0 690L540 748L540 784L0 726Z" fill="${LOOK.yellow}"/>`;
  z+=txt(p.title,62,213,65,LOOK.yellow,`stroke="${LOOK.ink}" stroke-width="3" paint-order="stroke"`);
  z+=txt('WORD GAME',65,295,15,LOOK.teal);
  z+=rect(390,165,84,84,LOOK.teal,19,LOOK.ink,4);
  if(f>=21)z+=`<g transform="translate(${s.mascot.x},${s.mascot.y})">${rect(10,18,43,32,LOOK.orange,15,LOOK.ink,3)}<circle cx="31" cy="12" r="15" fill="${LOOK.yellow}" stroke="${LOOK.ink}" stroke-width="3"/></g>`;
  else z+=`<circle cx="431" cy="207" r="19" fill="${LOOK.yellow}" stroke="${LOOK.ink}" stroke-width="3"/>`;
  if(f>=29){
    const back=s.transition?s.transition.next:s.active;
    z+=card(p.rounds[back],back,s);
    if(s.transition)z+=card(p.rounds[s.transition.old],s.transition.old,s,54+s.transition.shift,350);
  }
  z+='</svg>';return z;
}