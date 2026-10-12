/**
 * Deterministic authoring-time spatial graph for *coded* motion graphics.
 * Independent of canvas, GSAP, Three.js and the editor. All geometry in design pixels.
 * No eval, arbitrary JS supplied by briefs, network data, or wall-clock time.
 */
const ROLES = new Set(['group','art','text','surface','orbit','annotation']);
const FIELDS = new Set(['x','y','scaleX','scaleY','rotation','opacity']);
const EASES = {
  linear: t=>t,
  smooth: t=>t*t*(3-2*t),
  'cubic-in': t=>t*t*t,
  'cubic-out': t=>1-(1-t)**3,
  'cubic-in-out': t=>t<.5?4*t*t*t:1-4*(1-t)**3,
};
const EPS = 1e-8;
const finite=(x,name)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error(`${name} must be finite`);return x;};
const nonNeg=(v,n)=>{finite(v,n);if(v<0)throw Error(`${n} must be nonnegative`);return v;};
const pos=(v,n)=>{finite(v,n);if(v<=0)throw Error(`${n} must be positive`);return v;};
export function identity(){return [1,0,0,1,0,0]}
/** Affine: [a,b,c,d,e,f], SVG convention. */
export function multiply(p,q){return [p[0]*q[0]+p[2]*q[1],p[1]*q[0]+p[3]*q[1],p[0]*q[2]+p[2]*q[3],p[1]*q[2]+p[3]*q[3],p[0]*q[4]+p[2]*q[5]+p[4],p[1]*q[4]+p[3]*q[5]+p[5]]}
export function localMatrix({x=0,y=0,scaleX=1,scaleY=1,rotation=0}){
  const theta=rotation*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
  return [c*scaleX,s*scaleX,-s*scaleY,c*scaleY,x,y];
}
export function transformPoint(m,x,y){return {x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]}}
export function boundsOf(m,width,height){
  const pts=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>transformPoint(m,x,y));
  const xx=pts.map(x=>x.x),yy=pts.map(x=>x.y);
  return {x:Math.min(...xx),y:Math.min(...yy),width:Math.max(...xx)-Math.min(...xx),height:Math.max(...yy)-Math.min(...yy)};
}
export function intersect(a,b){
  if(!a)return b;if(!b)return a;
  const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),right=Math.min(a.x+a.width,b.x+b.width),bottom=Math.min(a.y+a.height,b.y+b.height);
  return {x,y,width:Math.max(0,right-x),height:Math.max(0,bottom-y)};
}
export function overlap(a,b){const i=intersect(a,b);return i.width*i.height;}

/** True convex polygon clipping; unlike AABB clipping this preserves rotated panel masks. */
export function quadFromBox(m,x,y,width,height){return [[x,y],[x+width,y],[x+width,y+height],[x,y+height]].map(([u,v])=>transformPoint(m,u,v));}
export function polygonBounds(poly){if(!poly?.length)return {x:0,y:0,width:0,height:0};const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}
function polygonArea(poly){let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a.x*b.y-b.x*a.y;}return area/2;}
function inside(p,a,b,sign){return sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))>=-0.00001;}
function lineIntersect(s,e,a,b){const dx=e.x-s.x,dy=e.y-s.y,ax=b.x-a.x,ay=b.y-a.y;const den=dx*ay-dy*ax;if(Math.abs(den)<1e-10)return e;const t=((a.x-s.x)*ay-(a.y-s.y)*ax)/den;return {x:s.x+t*dx,y:s.y+t*dy};}
export function intersectConvex(subject,clip){
 if(!subject||!clip)return subject||clip;
 if(!subject.length||!clip.length)return [];
 const sign=polygonArea(clip)>=0?1:-1;let poly=subject;
 for(let i=0;i<clip.length;i++){
  const a=clip[i],b=clip[(i+1)%clip.length],input=poly;poly=[];
  if(!input.length)break;
  for(let k=0;k<input.length;k++){
   const p=input[k],q=input[(k+1)%input.length],pi=inside(p,a,b,sign),qi=inside(q,a,b,sign);
   if(pi&&qi)poly.push(q);
   else if(pi&&!qi)poly.push(lineIntersect(p,q,a,b));
   else if(!pi&&qi)poly.push(lineIntersect(p,q,a,b),q);
  }
 }
 return poly;
}
export function pointInConvex(p,poly){if(!poly||!poly.length)return false;const sign=polygonArea(poly)>=0?1:-1;for(let i=0;i<poly.length;i++)if(!inside(p,poly[i],poly[(i+1)%poly.length],sign))return false;return true;}

function propertyAt(keyframes,frame){
  if(frame<=keyframes[0].frame)return keyframes[0].value;
  const last=keyframes[keyframes.length-1];if(frame>=last.frame)return last.value;
  let i=0;while(keyframes[i+1].frame<frame)i++;
  const a=keyframes[i],b=keyframes[i+1],s=(frame-a.frame)/(b.frame-a.frame);
  return a.value+(b.value-a.value)*EASES[b.ease||'smooth'](s);
}
const DEFAULT={x:0,y:0,scaleX:1,scaleY:1,rotation:0,opacity:1};
function normalizedNode(raw,index){
  if(!raw||typeof raw!=='object'||typeof raw.id!=='string'||!/^[-_a-zA-Z][-_a-zA-Z0-9]*$/.test(raw.id))throw Error(`Node ${index}: invalid id`);
  if(!ROLES.has(raw.role))throw Error(`${raw.id}: invalid role`);
  const n={...DEFAULT,...raw};
  if(n.parent!==undefined&&typeof n.parent!=='string')throw Error(`${n.id}: invalid parent`);
  for(const k of FIELDS)finite(n[k],`${n.id}.${k}`);
  if(n.opacity<0||n.opacity>1)throw Error(`${n.id}: opacity outside 0..1`);
  if(n.scaleX===0||n.scaleY===0)throw Error(`${n.id}: zero scale`);
  n.plane=finite(n.plane??0,`${n.id}.plane`);
  n.depth=finite(n.depth??0,`${n.id}.depth`);
  n.width=nonNeg(n.width??0,`${n.id}.width`);n.height=nonNeg(n.height??0,`${n.id}.height`);
  n.boundsX=finite(n.boundsX??0,`${n.id}.boundsX`);n.boundsY=finite(n.boundsY??0,`${n.id}.boundsY`);
  if(n.clip){if(!Number.isFinite(n.clip.x??0)||!Number.isFinite(n.clip.y??0))throw Error(`${n.id}: invalid clip offset`);pos(n.clip.width,`${n.id}.clip.width`);pos(n.clip.height,`${n.id}.clip.height`);}
  if(n.role==='text'&&!(n.width>0&&n.height>0))throw Error(`${n.id}: text needs measured bounds`);
  if(n.role==='group'&&(n.opaque||n.protect))throw Error(`${n.id}: groups are not visible surfaces`);
  if(n.role!=='group'&&n.width*n.height===0)throw Error(`${n.id}: drawable needs bounds`);
  return n;
}
export function compileSpatialGraph(spec){
  const width=pos(spec.width,'width'),height=pos(spec.height,'height');
  const fps=pos(spec.fps??30,'fps'),frames=pos(spec.frames,'frames');
  if(!Number.isInteger(frames)||!Number.isInteger(fps))throw Error('fps and frames must be integers');
  const list=(spec.nodes??[]).map(normalizedNode);
  if(!list.length)throw Error('Graph needs visible nodes');
  const map=new Map();list.forEach(n=>{if(map.has(n.id))throw Error(`Duplicate node id: ${n.id}`);map.set(n.id,n)});
  for(const n of list){if(n.parent&&!map.has(n.parent))throw Error(`Missing parent: ${n.parent}`);if(n.parent&&map.get(n.parent).role!=='group')throw Error(`${n.id}: parent must be group`);}
  const visiting=new Set(),visited=new Set(),order=[];
  function walk(n){if(visited.has(n.id))return;if(visiting.has(n.id))throw Error(`Parent cycle near ${n.id}`);visiting.add(n.id);if(n.parent)walk(map.get(n.parent));visiting.delete(n.id);visited.add(n.id);order.push(n)}
  list.forEach(walk);
  const tracks=new Map();
  for(const tr of spec.tracks??[]){
    if(!map.has(tr.id)||!FIELDS.has(tr.field))throw Error('Unknown node/track field');
    const key=`${tr.id}:${tr.field}`;
    if(tracks.has(key))throw Error(`Duplicate track: ${key}`);
    const kf=tr.keyframes;if(!Array.isArray(kf)||kf.length<2)throw Error(`Track needs 2+ keyframes: ${key}`);
    for(let i=0;i<kf.length;i++){
      const k=kf[i];if(!Number.isInteger(k.frame)||k.frame<0||k.frame>=frames)throw Error(`Bad frame: ${key}`);
      finite(k.value,`${key}.value`);if(i&&k.frame<=kf[i-1].frame)throw Error(`Keyframes not increasing: ${key}`);
      if(k.ease&&!EASES[k.ease])throw Error(`Unknown ease: ${k.ease}`);
      if(tr.field==='opacity'&&(k.value<0||k.value>1))throw Error('Opacity out of range');
      if((tr.field==='scaleX'||tr.field==='scaleY')&&k.value===0)throw Error('Zero scale keyframe');
    }
    tracks.set(key,kf);
  }
  const camera=spec.camera||{};
  const cameraTracks={};for(const k of ['x','y','zoom']){
    const keys=camera[k];if(keys){if(!Array.isArray(keys)||keys.length<2)throw Error(`Bad camera track ${k}`);for(let i=0;i<keys.length;i++){const z=keys[i];finite(z.value,`camera.${k}`);if(!Number.isInteger(z.frame)||z.frame<0||z.frame>=frames||(i&&z.frame<=keys[i-1].frame))throw Error(`Bad camera timing ${k}`);if(z.ease&&!EASES[z.ease])throw Error('Unknown camera ease');if(k==='zoom'&&z.value<=0)throw Error('Camera zoom must be positive');}cameraTracks[k]=keys;}
  }
  const sample=(frame)=>{
    if(!Number.isInteger(frame)||frame<0||frame>=frames)throw Error(`Frame outside [0, ${frames-1}]`);
    const cx=cameraTracks.x?propertyAt(cameraTracks.x,frame):0,cy=cameraTracks.y?propertyAt(cameraTracks.y,frame):0,zoom=cameraTracks.zoom?propertyAt(cameraTracks.zoom,frame):1;
    const states=new Map();
    for(const n of order){
      const local={};for(const k of FIELDS){local[k]=tracks.has(`${n.id}:${k}`)?propertyAt(tracks.get(`${n.id}:${k}`),frame):n[k]}
      const own=localMatrix(local),parent=n.parent?states.get(n.parent):null,world=multiply(parent?.world||identity(),own);
      const opacity=(parent?.opacity??1)*local.opacity;
      // A child's clip inherits every ancestor's clip, including animated parent transforms.
      let clipPolygon=parent?.clipPolygon||null;
      if(n.clip){
        const ownPolygon=quadFromBox(world,n.clip.x??0,n.clip.y??0,n.clip.width,n.clip.height);
        clipPolygon=clipPolygon?intersectConvex(clipPolygon,ownPolygon):ownPolygon;
      }
      const clipping=clipPolygon?polygonBounds(clipPolygon):null;
      const contentPolygon=quadFromBox(world,n.boundsX,n.boundsY,n.width,n.height);
      const full=polygonBounds(contentPolygon);
      const visible=intersect(full,clipping);

      const cameraFactor=1+(n.depth||0)*0.001; // controlled 2.5-D parallax, never scales glyph widths unpredictably
      const viewport=multiply([zoom,0,0,zoom,-cx*cameraFactor,-cy*cameraFactor],world);
      const result={id:n.id,role:n.role,parent:n.parent||null,plane:n.plane,depth:n.depth,order:list.indexOf(n),world,viewport,opacity,clipping,clipPolygon,contentPolygon,full,visible,protect:!!n.protect,occluder:!!n.opaque,intentional:!!n.intentionalOcclusion,clipAllowed:!!n.clipAllowed};
      states.set(n.id,result);
    }
    const display=[...states.values()].filter(v=>v.role!=='group'&&v.opacity>EPS&&v.visible.width>EPS&&v.visible.height>EPS).sort((a,b)=>a.plane-b.plane||a.depth-b.depth||a.order-b.order);
    const issues=[];
    for(let i=0;i<display.length;i++){
      const a=display[i];if(!a.protect)continue;
      const textArea=a.full.width*a.full.height;
      if(!a.clipAllowed&&textArea>EPS&&a.clipPolygon && a.contentPolygon.some(p=>!pointInConvex(p,a.clipPolygon))){issues.push({kind:'unexpected-clip',id:a.id,frame,visibleRatio:Number((overlap(a.full,a.visible)/textArea).toFixed(4))});}
      for(let j=i+1;j<display.length;j++){const b=display[j];if(!b.occluder||b.intentional)continue;const area=overlap(a.visible,b.visible);if(area>1&&b.opacity>0.15){issues.push({kind:'unexpected-occlusion',id:a.id,by:b.id,frame,area:Number(area.toFixed(2))});}
      }
    }
    return {frame,time:frame/fps,viewport:{width,height,cx,cy,zoom},states,display,issues};
  };
  return Object.freeze({width,height,fps,frames,nodeCount:list.length,sample,ids:Object.freeze([...map.keys()])});
}
export function auditFrameRange(graph,{start=0,end=graph.frames-1,step=1}={}){
  if(!Number.isInteger(start)||!Number.isInteger(end)||!Number.isInteger(step)||step<=0||start<0||end>=graph.frames||end<start)throw Error('Bad audit range');
  const issues=[];let sampled=0;for(let i=start;i<=end;i+=step){const result=graph.sample(i);sampled++;issues.push(...result.issues);}
  return {sampled,issues};
}
/** Director-level congestion and reading-time checks; useful BEFORE paying for a render. */
export function auditBeatPlan({fps=30,frames,beats,minimumHoldSeconds=.55,maxConcurrentFocal=2}){
  pos(fps,'fps');pos(frames,'frames');const findings=[];
  const workload=new Array(frames).fill(0);
  for(const b of beats){
    if(!b.id||!Number.isInteger(b.start)||!Number.isInteger(b.end)||b.start<0||b.end<=b.start||b.end>frames)throw Error(`Invalid beat: ${b.id}`);
    if(b.focal)for(let f=b.start;f<b.end;f++)workload[f]++;
    if(b.readable&&b.end-b.start<Math.ceil(fps*minimumHoldSeconds))findings.push({kind:'short-read',id:b.id,frames:b.end-b.start});
  }
  for(let f=0;f<frames;f++)if(workload[f]>maxConcurrentFocal&&(f===0||workload[f-1]<=maxConcurrentFocal))findings.push({kind:'competing-motion',frame:f,count:workload[f]});
  return {pass:findings.length===0,findings,peakFocal:Math.max(0,...workload)};
}
