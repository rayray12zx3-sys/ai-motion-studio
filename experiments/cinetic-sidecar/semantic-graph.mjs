// Original pure-frame semantic motif for R&D. Not a copied upstream technique.
// Persistent three-point graph makes the story change visible without caption-only cuts.
export function addSemanticGraph(html, plan) {
  if (!html.includes("</div><script>") || html.includes("id=\"semantic-graph\""))
    throw new Error("unexpected C2 HTML contract");
  const { width, height, fps } = plan.render;
  const beatEnds = plan.beats.map((b) => b.endFrame);
  if (beatEnds.length !== 3) throw new Error("semantic graph requires exactly 3 causal beats");
  const r = Math.max(10, Math.round(Math.min(width, height) * 0.019));
  const motif = [
    '<svg id="semantic-graph" viewBox="0 0 ' + width + " " + height +
      '" width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg" ',
    'style="position:absolute;inset:0;pointer-events:none" aria-hidden="true">',
    '<line id="causal-link-0" stroke="#9fdbc5" stroke-width="4" opacity="0"/>',
    '<line id="causal-link-1" stroke="#9fdbc5" stroke-width="4" opacity="0"/>',
    '<line id="causal-link-2" stroke="#9fdbc5" stroke-width="4" opacity="0"/>',
    ...[0, 1, 2].map((i) => '<circle id="causal-node-' + i +
      '" r="' + r + '" cx="0" cy="0" fill="' + ["#e4b863", "#80c7c5", "#ead8b0"][i] + '" opacity="0"/>'),
    '<circle id="causal-result" r="' + (r * 1.8) + '" cx="' + (.5 * width) + '" cy="' + (.79 * height) +
      '" fill="none" stroke="#f4d48c" stroke-width="4" opacity="0"/>',
    "</svg>",
  ].join("");
  const script = [
    "(function(){",
    " 'use strict';",
    " const FPS=" + fps + ", ENDS=" + JSON.stringify(beatEnds) + ";",
    " const W=" + width + ", H=" + height + ";",
    " const nodes=[0,1,2].map(i=>document.getElementById('causal-node-'+i));",
    " const links=[0,1,2].map(i=>document.getElementById('causal-link-'+i));",
    " const result=document.getElementById('causal-result');",
    " const start=[[.25,.70],[.75,.68],[.51,.90]];",
    " const linked=[[.32,.76],[.68,.76],[.5,.87]];",
    " const resolved=[[.455,.80],[.545,.80],[.5,.72]];",
    " const clamp=v=>Math.max(0,Math.min(1,v));",
    " const ease=v=>1-Math.pow(1-clamp(v),3);",
    " const mix=(a,b,t)=>a+(b-a)*t;",
    " function draw(frame){",
    "   const f=Math.max(0,Math.floor(Number(frame)||0));",
    "   let stage=0,t=0;",
    "   if(f>=ENDS[1]) {stage=2;t=ease((f-ENDS[1])/Math.max(1,ENDS[2]-ENDS[1]-1));}",
    "   else if(f>=ENDS[0]) {stage=1;t=ease((f-ENDS[0])/Math.max(1,ENDS[1]-ENDS[0]-1));}",
    "   else {t=ease(f/Math.max(1,ENDS[0]-1));}",
    "   const active=stage===0?start:(stage===1?linked:resolved);",
    "   const source=stage===0?start:(stage===1?start:linked);",
    "   const points=active.map((p,i)=>[mix(source[i][0],p[0],t)*W,mix(source[i][1],p[1],t)*H]);",
    "   nodes.forEach((node,i)=>{",
    "     node.setAttribute('cx',points[i][0].toFixed(3));",
    "     node.setAttribute('cy',points[i][1].toFixed(3));",
    "     node.setAttribute('opacity',String(stage===0?Math.min(1,t*4):1));",
    "   });",
    "   links.forEach((link,i)=>{",
    "     const a=points[i],b=points[(i+1)%3];",
    "     link.setAttribute('x1',a[0].toFixed(3));link.setAttribute('y1',a[1].toFixed(3));",
    "     link.setAttribute('x2',b[0].toFixed(3));link.setAttribute('y2',b[1].toFixed(3));",
    "     link.setAttribute('opacity',String(stage===0?0:(stage===1?Math.min(1,t*1.5):1)));",
    "   });",
    "   result.setAttribute('opacity',String(stage===2?Math.min(1,t*1.6):0));",
    " }",
    " window.addEventListener('hf-seek',e=>{const time=Number(e?.detail?.time);if(Number.isFinite(time))draw(Math.round(time*FPS));});",
    " window.__semanticGraphFrame=draw;",
    " draw(0);",
    "})();"
  ].join("\n");
  return html.replace("</div><script>", "</div>" + motif + "<script>" + script + "</script><script>");
}
