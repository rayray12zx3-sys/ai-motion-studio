/** Optional original, deterministic semantic depth layers.
 * R&D only: no external assets, runtime APIs, engine replacement or art approval.
 */
const TYPES=new Set(['spatial-grid','signal-ribbon','orbit-markers']);
const DEPTHS=new Set(['rear','front']);
const TONES=new Set(['accent','muted','onBackground']);
const ident=v=>typeof v==='string'&&/^[a-z][a-z0-9-]{2,48}$/.test(v);
const val=(v,min,max,name)=>{
  if(!Number.isInteger(v)||v<min||v>max)throw Error('Invalid '+name);
  return v;
};
const ease=n=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
const lerp=(a,b,q)=>a+(b-a)*q;
const f=n=>Number(n.toFixed(3));
const pos=(v,name)=>{
  if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid '+name);
  const box={x:val(v.x,0,960,name+'.x'),y:val(v.y,0,960,name+'.y'),
    w:val(v.w,60,900,name+'.w'),h:val(v.h,60,900,name+'.h')};
  if(box.x+box.w>1000||box.y+box.h>1000)throw Error('Depth layer outside frame');
  return box;
};
/** Bounds validated BEFORE the SVG painter; renderer never touches raw JSON. */
export function compileOriginalLayers(input,shotId) {
  if(input===undefined)return [];
  if(!Array.isArray(input)||input.length>4)throw Error('Maximum four semantic layers per shot');
  const ids=new Set();
  return input.map(v=>{
    if(!v||typeof v!=='object'||Array.isArray(v)||!ident(v.id)||ids.has(v.id))
      throw Error('Invalid or duplicate depth layer identity');
    ids.add(v.id);
    if(!TYPES.has(v.kind)||!DEPTHS.has(v.depth)||!TONES.has(v.tone))
      throw Error('Unsupported depth layer grammar');
    if(typeof v.purpose!=='string'||v.purpose.length<12||v.purpose.length>150||
       /https?:\/\/|<script|data:/i.test(v.purpose))
      throw Error('Depth layer needs a bounded original narrative purpose');
    const bounds=pos(v.bounds,shotId+'.'+v.id);
    const drift=v.drift===undefined?{x:0,y:0}:{
      x:val(v.drift?.x,-48,48,'drift.x'),
      y:val(v.drift?.y,-48,48,'drift.y')
    };
    if(bounds.x+Math.min(0,drift.x)<0||bounds.y+Math.min(0,drift.y)<0||
       bounds.x+bounds.w+Math.max(0,drift.x)>1000||
       bounds.y+bounds.h+Math.max(0,drift.y)>1000)
      throw Error('Moving depth layer exceeds safe frame bounds');
    const alpha=val(v.opacity,5,78,'layer.opacity')/100;
    return {id:v.id,kind:v.kind,depth:v.depth,tone:v.tone,purpose:v.purpose,
      bounds,drift,opacity:alpha};
  });
}
export function auditLayerContinuity(shots) {
  const seen=new Map();
  for(const shot of shots)for(const layer of shot.layers||[]){
    const prior=seen.get(layer.id);
    if(prior&&(prior.kind!==layer.kind||prior.depth!==layer.depth||
       prior.tone!==layer.tone))
      throw Error('Persistent depth layer changes its visual identity');
    seen.set(layer.id,layer);
  }
}
function activePose(shot,layer,frame,profile,priorShot) {
  const elapsed=Math.max(0,frame-shot.start);
  const t=ease(elapsed/Math.max(1,profile.fps*.54));
  const q=ease(elapsed/Math.max(1,shot.end-shot.start-1));
  const b=layer.bounds;
  let x=b.x+layer.drift.x*q,y=b.y+layer.drift.y*q;
  let w=b.w,h=b.h;
  const last=priorShot?.layers?.find(a=>a.id===layer.id);
  if(last) {
    // Begin at prior shot's terminal geometry, then reframe with no cut snap.
    const source=last.bounds,px=source.x+last.drift.x,py=source.y+last.drift.y;
    x=lerp(px,x,t);y=lerp(py,y,t);
    w=lerp(source.w,w,t);h=lerp(source.h,h,t);
  }
  return {x,y,w,h,entry:last?1:ease(elapsed/Math.max(1,profile.fps*.7))};
}
const line=(x1,y1,x2,y2,color,width=2)=>
  '<line x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+
  '" stroke="'+color+'" stroke-width="'+f(width)+'"/>';
function draw(layer,shape,color,frame,profile,scale) {
  const {x,y,w,h}=shape;
  const px=n=>n*profile.width/1000,py=n=>n*profile.height/1000;
  const x0=px(x),y0=py(y),ww=px(w),hh=py(h);
  const sw=Math.max(1.8,3.4*scale);
  const pieces=[];
  if(layer.kind==='spatial-grid') {
    // A receding original spatial coordinate surface, not copied UI footage.
    const focusX=x0+ww*.54,focusY=y0+hh*.16;
    // An authored perspective surface behind the real semantic source.
    pieces.push('<path d="M '+f(focusX)+' '+f(focusY)+
      ' L '+f(x0+ww)+' '+f(y0+hh)+' L '+f(x0)+' '+f(y0+hh)+
      ' Z" fill="'+color+'" fill-opacity=".40"/>');
    for(let i=0;i<=7;i++){
      const b=x0+ww*i/7;
      pieces.push(line(focusX,focusY,b,y0+hh,color,sw));
    }
    for(let i=1;i<=5;i++){
      const z=(i/5)**1.6;
      const yy=focusY+(hh-(focusY-y0))*z;
      pieces.push(line(lerp(focusX,x0,z),yy,
        lerp(focusX,x0+ww,z),yy,color,sw));
    }
  } else if(layer.kind==='signal-ribbon') {
    // Animated source energy as a routed flow, tied to the author's audio idea.
    const points=[];
    for(let i=0;i<=34;i++){
      const q=i/34;
      const amplitude=(.06+.34*Math.sin(q*Math.PI)**2)*hh;
      const period=Math.sin(q*7.4*Math.PI+frame*.075);
      points.push([x0+ww*q,y0+hh*.5+amplitude*period]);
    }
    pieces.push('<path d="M '+points.map(([a,b],i)=>(i?'L ':'')+f(a)+' '+f(b)).join(' ')+
      '" fill="none" stroke="'+color+'" stroke-width="'+f(sw*1.5)+
      '" stroke-linecap="round" stroke-linejoin="round"/>');
    for(let j=0;j<4;j++){
      const q=(frame*.004+j*.25)%1;
      const yy=y0+hh*.5+(.06+.34*Math.sin(q*Math.PI)**2)*hh*
        Math.sin(q*7.4*Math.PI+frame*.075);
      pieces.push('<circle cx="'+f(x0+ww*q)+'" cy="'+f(yy)+'" r="'+f(4.8*scale)+
        '" fill="'+color+'"/>');
    }
  } else if(layer.kind==='orbit-markers') {
    // A spatial consequence marker near the author's actual source/goal.
    const cx=x0+ww*.5,cy=y0+hh*.5;
    for(let k=1;k<=3;k++){
      pieces.push('<ellipse cx="'+f(cx)+'" cy="'+f(cy)+'" rx="'+f(ww*k/8)+
        '" ry="'+f(hh*k/8)+'" fill="none" stroke="'+color+
        '" stroke-width="'+f(sw*(4-k)/3)+'"/>');
    }
    const a=frame*.03,cx2=cx+ww*.37*Math.cos(a),cy2=cy+hh*.37*Math.sin(a);
    pieces.push('<circle cx="'+f(cx2)+'" cy="'+f(cy2)+'" r="'+f(6*scale)+
      '" fill="'+color+'"/>');
  }
  return pieces.join('');
}
export function renderOriginalLayers(plan,shot,frame,depth) {
  if(!shot.layers?.length)return '';
  const prior=plan.shots[plan.shots.indexOf(shot)-1];
  const scale=plan.profile.width/1080;
  const rendered=[];
  for(const layer of shot.layers.filter(l=>l.depth===depth)){
    const p=activePose(shot,layer,frame,plan.profile,prior);
    const alpha=f(layer.opacity*p.entry);
    rendered.push('<g class="semantic-depth-layer" id="layer-'+layer.id+
      '" data-kind="'+layer.kind+'" data-depth="'+depth+
      '" opacity="'+alpha+'">',
      draw(layer,p,plan.theme[layer.tone],frame,plan.profile,scale),'</g>');
  }
  if(!rendered.length)return '';
  return '<g id="authored-'+depth+'-depth" data-shot="'+shot.id+'">'+
    rendered.join('')+'</g>';
}
