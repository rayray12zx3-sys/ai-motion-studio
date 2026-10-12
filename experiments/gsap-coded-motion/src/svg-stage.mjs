/**
 * Flat SVG compositor backed by spatial-graph: group transforms are resolved
 * in mathematical world space, then *only leaf paint objects* are drawn.
 * This avoids accidental double transforms/opacity from nested <g> elements.
 * Layers are physically sorted: z order isn't just metadata.
 * Uses clipped bounds conservatively for rotated surfaces; custom path masks
 * are separate artistic objects and must be verified at full speed.
 */
import {transformPoint} from './spatial-graph.mjs';
const SVGNS='http://www.w3.org/2000/svg';
const matrixText=(m)=>`matrix(${m.map(v=>Number(v.toFixed(6))).join(' ')})`;
const pointBox=(m,b)=>{
  const p=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>transformPoint(m,x,y));
  return {x:Math.min(...p.map(t=>t.x)),y:Math.min(...p.map(t=>t.y)),width:Math.max(...p.map(t=>t.x))-Math.min(...p.map(t=>t.x)),height:Math.max(...p.map(t=>t.y))-Math.min(...p.map(t=>t.y))};
};
export function createSvgStage({graph,svg,paintLayer}){
  if(!svg?.querySelectorAll||!svg.ownerDocument||!paintLayer?.appendChild)throw Error('Real SVG DOM and paint layer required');
  const byId=new Map();
  for(const el of svg.querySelectorAll('[data-motion-id]')){
    const id=el.getAttribute('data-motion-id');
    if(!graph.ids.includes(id)||byId.has(id))throw Error(`Unexpected/duplicate SVG node: ${id}`);
    byId.set(id,el);
  }
  for(const id of graph.ids){
    // Non-rendering parent groups have no SVG leaf; all painted leaf nodes must exist.
    const state=graph.sample(0).states.get(id);
    if(state.role!=='group'&&!byId.has(id))throw Error(`Missing SVG drawable: ${id}`);
  }
  const defs=svg.querySelector('defs')||svg.insertBefore(svg.ownerDocument.createElementNS(SVGNS,'defs'),svg.firstChild);
  const clips=new Map();
  const wrappers=new Map();
  for(const [id,el] of byId){
    // SVG IDs are stable and path-safe; all clips belong to this document only.
    const clip=svg.ownerDocument.createElementNS(SVGNS,'clipPath');clip.id=`motion-clip-${id}`;clip.setAttribute('clipPathUnits','userSpaceOnUse');
    const path=svg.ownerDocument.createElementNS(SVGNS,'path');clip.appendChild(path);defs.appendChild(clip);clips.set(id,path);
    const wrapper=svg.ownerDocument.createElementNS(SVGNS,'g');
    wrapper.setAttribute('data-motion-wrapper',id);wrapper.setAttribute('clip-path',`url(#${clip.id})`);
    wrapper.appendChild(el);wrappers.set(id,wrapper);paintLayer.appendChild(wrapper); // keep hidden targets connected for GSAP selector resolution
  }
  const renderFrame=(frame)=>{
    const data=graph.sample(frame);
    for(const s of data.display){
      const el=byId.get(s.id);
      // Each leaf is a direct paint-layer child: parent transforms are already in viewport matrix.
      el.setAttribute('transform',matrixText(s.viewport));
      el.setAttribute('opacity',String(Number(s.opacity.toFixed(5))));
      el.style.display='';
      if(s.clipping){
        const viewMatrix=[data.viewport.zoom,0,0,data.viewport.zoom,-data.viewport.cx*(1+s.depth*.001),-data.viewport.cy*(1+s.depth*.001)];
        const vertices=s.clipPolygon.map(p=>transformPoint(viewMatrix,p.x,p.y));
        clips.get(s.id).setAttribute('d',vertices.length?vertices.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(5)} ${p.y.toFixed(5)}`).join(' ')+' Z':'M0 0 Z');
      } else {
        clips.get(s.id).setAttribute('d','M-100000 -100000 H100000 V100000 H-100000 Z');
      }
      paintLayer.appendChild(wrappers.get(s.id)); // stable painter order; the clip stays in viewport coordinates
    }
    for(const [id,el] of byId)if(!data.display.some(s=>s.id===id))el.style.display='none';
    return {frame,time:data.time,issues:data.issues,paintIds:data.display.map(s=>s.id)};
  };
  return Object.freeze({renderFrame,graph});
}
