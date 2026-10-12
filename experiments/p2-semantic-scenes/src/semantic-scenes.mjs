/**
 * Isolated P2 R&D: bounded, authored semantic scene -> seekable SVG frames.
 * NO model calls, runtime remote assets, vendor motion dependencies, or root
 * production renderer imports. Director is the active ChatGPT conversation.
 */
const fail = message => { throw new Error(message); };
const key = v => typeof v === 'string' && /^[a-z][a-z0-9-]{2,48}$/.test(v);
const color = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
const str = (v, name, min=2, max=110) =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max &&
  !/https?:\/\/|<script|data:/i.test(v) ? v.trim() : fail('Unsafe or invalid ' + name);
const integer = (v, a, b, name) =>
  Number.isInteger(v) && v >= a && v <= b ? v : fail('Invalid ' + name);
const object = (v,name) =>
  v && typeof v === 'object' && !Array.isArray(v) ? v : fail('Invalid ' + name);
const esc = v => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const clip = x => Math.max(0,Math.min(1,x));
const mix = (a,b,p) => a+(b-a)*p;
const smooth = p => { const q=clip(p);return q*q*(3-2*q); };
const layouts = new Set(['board','track','reading']);
const gestures = new Set(['click','drag','select','type','scroll']);
const bridges = new Set(['establish','carry','transform']);
const kinds = new Set(['task','clip','note','caption']);
const fields = new Set(['status']);
// Minimum contrast for text roles, including the dark-background variant.
const luminance = hex => {
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 return rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
   .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
};
const contrast = (a,b) => {const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
function pose(v,name) {
  object(v,name);
  const x=integer(v.x,0,1000,name+'.x'),y=integer(v.y,0,1000,name+'.y');
  const w=integer(v.w,120,1000,name+'.w'),h=integer(v.h,65,700,name+'.h');
  if(x+w>1000||y+h>1000)fail('Off-canvas persistent hero: '+name);
  return {x,y,w,h};
}
function checkPlain(value) {
  let raw;
  try { raw=JSON.stringify(value); } catch { fail('JSON-only specification required'); }
  if(!raw||raw.length>24000)fail('Scene specification is not bounded');
  const plain=JSON.parse(raw);
  if(raw.includes('__proto__')||raw.includes('javascript:')||raw.includes('data:'))fail('Unsafe scene data');
  return plain;
}
export function compileSemanticScenes(spec) {
  const x=checkPlain(spec); object(x,'scene spec');
  if(x.version!=='p2-semantic-scenes-v1')fail('Unsupported experimental scene version');
  if(!key(x.id))fail('Invalid film id');
  if(x.assetPolicy!=='original-only')fail('External/private assets require a separate rights gate');
  const p=object(x.profile,'profile');
  const width=integer(p.width,720,2160,'width'),height=integer(p.height,720,3840,'height');
  const fps=integer(p.fps,24,60,'fps'),frames=integer(p.frames,120,3600,'frames');
  if(frames%fps!==0)fail('Duration must be whole seconds in this pilot');
  const theme=object(x.theme,'theme');
  for(const k of ['background','surface','ink','accent','muted','onBackground','surfaceMuted','accentText'])
    if(!color(theme[k]))fail('Invalid palette '+k);
  for(const [foreground,background] of [['onBackground','background'],['muted','background'],
    ['ink','surface'],['surfaceMuted','surface'],['accentText','surface']]) {
    if(contrast(theme[foreground],theme[background])<4.5)
      fail('Unreadable text contrast: '+foreground+' over '+background);
  }
  const music=object(x.music,'music');
  if(music.mode!=='licensed-local'||music.licenseGate!=='PENDING_PUBLICATION_CREDIT')
    fail('Music requires an explicit local-license and credit gate');
  const bpm=integer(music.bpm,60,200,'bpm');
  const offsetFrame=integer(music.offsetFrame,0,fps-1,'offsetFrame');
  if(music.auditioned!==false)fail('Beat grid does not prove musical alignment or audition');
  if(!Array.isArray(x.entities)||x.entities.length<1||x.entities.length>8)fail('Bounded semantic entities required');
  const entities=new Map();
  for(const e of x.entities) {
    object(e,'entity');
    if(!key(e.id)||entities.has(e.id)||!kinds.has(e.kind))fail('Invalid/duplicate semantic identity');
    entities.set(e.id,{id:e.id,kind:e.kind,label:str(e.label,'entity label',3,50),status:str(e.status,'initial entity status',3,35)});
  }
  if(!Array.isArray(x.shots)||x.shots.length<3||x.shots.length>8)fail('Three to eight shots required');
  const shots=[], shotIds=new Set();
  let previous=null;
  for(const raw of x.shots) {
    object(raw,'shot');
    if(!key(raw.id)||shotIds.has(raw.id))fail('Duplicate/invalid shot id');
    shotIds.add(raw.id);
    const start=integer(raw.start,0,frames-1,'shot.start');
    const end=integer(raw.end,start+Math.ceil(.8*fps),frames,'shot.end');
    if(start!==(previous?previous.end:0))fail('Non-contiguous authored shot schedule');
    if(!entities.has(raw.focusId)||!layouts.has(raw.layout)||!bridges.has(raw.bridge))fail('Unsupported scene focus/layout/bridge');
    if(!previous&&raw.bridge!=='establish')fail('First scene must establish');
    if(previous&&(raw.bridge==='establish'||((raw.bridge==='carry'||raw.bridge==='transform')&&raw.focusId!==previous.focusId)))
      fail('Semantic lineage lost between neighboring shots');
    if(!Array.isArray(raw.context)||raw.context.length>4)fail('Bounded context rows required');
    const context=raw.context.map((t,i)=>str(t,'context '+i,2,60));
    const shot={
      id:raw.id,start,end,focusId:raw.focusId,layout:raw.layout,bridge:raw.bridge,
      reason:str(raw.reason,'shot intention',8,220),
      title:str(raw.title,'headline',3,65),subtitle:str(raw.subtitle,'subtitle',4,120),
      hero:pose(raw.hero,raw.id+'.hero'),context
    };
    shots.push(shot);previous=shot;
  }
  if(previous.end!==frames)fail('Film has an incomplete ending');
  if(!Array.isArray(x.operations)||x.operations.length<1||x.operations.length>5)fail('Visible UI operation required');
  const operations=[], seenOp=new Set();
  for(const o of x.operations) {
    object(o,'operation');
    if(!key(o.id)||seenOp.has(o.id)||!gestures.has(o.trigger)||!entities.has(o.entityId)||!fields.has(o.field))
      fail('Invalid UI action identity/type');
    seenOp.add(o.id);
    const shot=shots.find(s=>s.id===o.shotId),result=shots.find(s=>s.id===o.resultShotId);
    const frame=integer(o.frame,0,frames-1,'action frame');
    if(!shot||!result||frame<shot.start||frame>=shot.end||result.start<shot.start||
      shot.focusId!==o.entityId||result.focusId!==o.entityId)
      fail('Action/result is not observable on the same persistent product entity');
    if(o.from!==entities.get(o.entityId).status||str(o.to,'result status',3,35)===o.from)
      fail('Action must change a known before-state');
    if(o.accent===true) {
      const period=fps*60/bpm;
      const n=Math.round((frame-offsetFrame)/period);
      if(Math.abs(frame-(offsetFrame+n*period))>2)fail('Accented UI operation off declared beat grid');
    }
    operations.push({id:o.id,shotId:o.shotId,resultShotId:o.resultShotId,entityId:o.entityId,
      trigger:o.trigger,field:o.field,frame,from:o.from,to:o.to,accent:o.accent===true,
      reason:str(o.reason,'action cause/effect',8,220)});
  }
  operations.sort((a,b)=>a.frame-b.frame);
  // Explicit initial state and source order. v1 permits one state transition per
  // entity to avoid ambiguous rollback semantics when seeking out of order.
  const operated=new Set();
  for(const o of operations){
    if(operated.has(o.entityId))fail('One semantic state transition per entity in v1');
    operated.add(o.entityId);
  }
  return Object.freeze({id:x.id,profile:{width,height,fps,frames},theme,music:{bpm,offsetFrame,
    licenseGate:music.licenseGate,auditioned:false},entities:[...entities.values()],
    shots,operations,artStatus:'PENDING_HUMAN',rightsStatus:'PENDING_OTHER_MEDIA_REVIEW',
    limitation:'SVG frame contract, not a watched MP4 or independently audited sound mix'});
}
export function inspectFrame(plan,frame) {
  integer(frame,0,plan.profile.frames-1,'seek frame');
  const shot=plan.shots.find(s=>s.start<=frame&&frame<s.end);
  const state=Object.fromEntries(plan.entities.map(e=>[e.id,e.status]));
  for(const o of plan.operations)if(frame>=o.frame)state[o.entityId]=o.to;
  const previous=plan.shots[plan.shots.indexOf(shot)-1];
  const blend=previous&&shot.bridge!=='establish'?smooth((frame-shot.start)/Math.max(1,Math.round(plan.profile.fps*.38))):1;
  const hero={};
  for(const k of ['x','y','w','h'])hero[k]=mix(previous?.hero[k]??shot.hero[k],shot.hero[k],blend);
  return {frame,shotId:shot.id,shot,state,hero,blend,operations:plan.operations.filter(o=>o.frame<=frame)};
}
const box=(x,y,w,h,fill,rx=20,stroke='none')=>
  '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'"/>';
const label=(v,x,y,size,fill,weight=500)=>
  '<text x="'+x+'" y="'+y+'" font-family="sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'">'+esc(v)+'</text>';
export function renderSvgFrame(plan,frame) {
  const f=inspectFrame(plan,frame),s=f.shot,p=plan.profile,t=plan.theme;
  const w=p.width,h=p.height;
  const coords=a=>a/1000;
  const hx=f.hero.x*w/1000,hy=f.hero.y*h/1000,hw=f.hero.w*w/1000,hh=f.hero.h*h/1000;
  const unit=w/1080, tx=62*unit, top=115*unit;
  const fade=smooth((frame-s.start)/(p.fps*.26));
  const e=plan.entities.find(q=>q.id===s.focusId);
  const action=plan.operations.find(o=>o.entityId===e.id&&frame>=o.frame);
  const rendered=[
    '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">',
    box(0,0,w,h,t.background,0),
    label('AI MOTION STUDIO  /  ORIGINAL SEMANTIC STUDY',tx,top,18*unit,t.muted,650),
    box(tx,top+24*unit,w-2*tx,2*unit,t.muted,0),
    '<g opacity="'+fade.toFixed(4)+'">',
    label(s.title,tx,top+157*unit,66*unit,t.onBackground,800),
    label(s.subtitle,tx,top+215*unit,28*unit,t.muted,450),
    '</g>'
  ];
  if(s.layout==='board'){
    rendered.push(box(tx,h*.57,w-2*tx,h*.23,t.surface,26*unit));
    s.context.forEach((v,i)=>rendered.push(label(v,tx+33*unit,h*.625+i*49*unit,29*unit,t.ink,570)));
  }else if(s.layout==='track'){
    rendered.push(box(tx,h*.61,w-2*tx,h*.17,t.surface,26*unit));
    const wave=[];
    for(let i=0;i<49;i++){const amp=(.25+.75*Math.abs(Math.sin(i*.41)*Math.cos(i*.19)))*h*.08;
      wave.push(box(tx+24*unit+i*((w-2*tx-48*unit)/49),h*.69-amp*.5,
        Math.max(3,5*unit),amp,t.accent,3*unit));}
    rendered.push(...wave);
    s.context.forEach((v,i)=>rendered.push(label(v,tx+12*unit,h*.84+i*47*unit,24*unit,t.onBackground,570)));
  }else{
    rendered.push(box(tx,h*.59,w-2*tx,h*.25,t.surface,27*unit));
    s.context.forEach((v,i)=>rendered.push(label(v,tx+30*unit,h*.655+i*55*unit,30*unit,t.ink,580)));
  }
  rendered.push('<g id="persistent-hero" data-entity="'+esc(e.id)+'">',
    box(hx,hy,hw,hh,t.surface,24*unit,t.accent),
    box(hx+12*unit,hy+11*unit,8*unit,Math.max(8,hh-22*unit),t.accent,4*unit),
    label(e.label,hx+36*unit,hy+Math.min(hh*.4,65*unit),Math.min(37*unit,hh*.26),t.ink,750),
    label(f.state[e.id],hx+36*unit,hy+Math.min(hh*.74,112*unit),Math.min(25*unit,hh*.18),
      action?t.accentText:t.surfaceMuted,600),'</g>');
  if(action&&frame-action.frame<p.fps*.85){
    const pulse=smooth((frame-action.frame)/(p.fps*.5));
    rendered.push('<circle cx="'+(hx+hw-20*unit)+'" cy="'+(hy+20*unit)+
      '" r="'+mix(7,47,pulse)*unit+'" stroke="'+t.accent+
      '" stroke-width="'+(5*unit)+'" fill="none" opacity="'+(1-pulse).toFixed(4)+'"/>');
  }
  rendered.push(label((plan.shots.indexOf(s)+1)+' / '+plan.shots.length+
    '    •    '+s.layout.toUpperCase(),tx,h-88*unit,19*unit,t.muted,600),
    '</svg>');
  return rendered.join('');
}
