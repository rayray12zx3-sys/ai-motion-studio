// Original synthetic motion device: three persistent evidence cards form one result.
// Cinetic-inspired story discipline, NOT a copy of a particular upstream technique.
export function addEvidenceCards(html, plan) {
  if (!html.includes("</div><script>") || html.includes("id=\"evidence-device\""))
    throw new Error("unexpected synthetic evidence composition");
  const { width: W, height: H, fps } = plan.render;
  const ends = plan.beats.map(x => x.endFrame);
  if (ends.length !== 3 || plan.direction.visualMotif !== "evidence-cards") throw new Error("evidence-card story contract mismatch");
  const w = Math.round(W * .17), h = Math.round(H * .125), radius = Math.round(H * .018);
  const card = (i) => [
    '<g id="evidence-card-' + i + '" transform="translate(0 0)" opacity="0">',
    '<rect x="' + (-w/2) + '" y="' + (-h/2) + '" width="' + w + '" height="' + h + '" rx="' + radius +
      '" fill="#20342f" stroke="#637c72" stroke-width="2"/>',
    '<rect x="' + (-w*.40) + '" y="' + (-h*.28) + '" width="' + (w*.48) + '" height="' + (h*.11) + '" rx="3" fill="#d3e1db"/>',
    '<rect x="' + (-w*.40) + '" y="' + (-h*.04) + '" width="' + (w*[.65,.44,.53][i]) + '" height="' + (h*.075) + '" rx="3" fill="#8ba79b"/>',
    '<rect x="' + (-w*.40) + '" y="' + (h*.18) + '" width="' + (w*[.35,.59,.47][i]) + '" height="' + (h*.075) + '" rx="3" fill="#62796e"/>',
    '<circle cx="' + (w*.34) + '" cy="' + (-h*.24) + '" r="' + Math.round(h*.09) + '" fill="#57c1a5"/>',
    '</g>',
  ].join("");
  const svg = [
    '<svg id="evidence-device" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none">',
    '<path id="evidence-link-0" fill="none" stroke="#57c1a5" stroke-width="3" opacity="0"/>',
    '<path id="evidence-link-1" fill="none" stroke="#57c1a5" stroke-width="3" opacity="0"/>',
    '<path id="evidence-link-2" fill="none" stroke="#57c1a5" stroke-width="3" opacity="0"/>',
    card(0), card(1), card(2),
    '<g id="evidence-result" opacity="0" transform="translate(' + (W*.5) + ' ' + (H*.81) + ')">',
    '<rect x="' + (-W*.21) + '" y="' + (-H*.073) + '" width="' + (W*.42) + '" height="' + (H*.146) +
      '" rx="' + Math.round(H*.024) + '" fill="#203a32" stroke="#57c1a5" stroke-width="3"/>',
    '<rect x="' + (-W*.155) + '" y="' + (-H*.028) + '" width="' + (W*.26) + '" height="' + (H*.015) + '" rx="4" fill="#dbf3ea"/>',
    '<rect x="' + (-W*.155) + '" y="' + (H*.014) + '" width="' + (W*.17) + '" height="' + (H*.011) + '" rx="4" fill="#6cae98"/>',
    '<circle cx="' + (W*.155) + '" cy="0" r="' + Math.round(H*.027) + '" fill="#57c1a5"/>',
    '<path d="M' + (W*.144) + ' 0 L' + (W*.153) + ' ' + (H*.010) + ' L' + (W*.169) + ' ' + (-H*.013) + '" stroke="#092119" stroke-width="4" fill="none"/>',
    '</g></svg>'
  ].join("");
  const script = [
    "(function(){",
    " 'use strict';",
    " const FPS=" + fps + ",ENDS=" + JSON.stringify(ends) + ";",
    " const W=" + W + ",H=" + H + ";",
    " const cards=[0,1,2].map(i=>document.getElementById('evidence-card-'+i));",
    " const links=[0,1,2].map(i=>document.getElementById('evidence-link-'+i));",
    " const result=document.getElementById('evidence-result');",
    " const start=[[.22,.72],[.78,.72],[.50,.86]];",
    " const connected=[[.33,.75],[.67,.75],[.50,.84]];",
    " const resolved=[[.45,.80],[.55,.80],[.50,.78]];",
    " const clamp=x=>Math.max(0,Math.min(1,x));",
    " const ease=t=>1-Math.pow(1-clamp(t),3);",
    " const mix=(a,b,t)=>a+(b-a)*t;",
    " function render(frame){",
    "  const f=Math.max(0,Math.floor(Number(frame)||0));",
    "  const phase=f>=ENDS[1]?2:f>=ENDS[0]?1:0;",
    "  const low=phase===0?0:ENDS[phase-1];",
    "  const len=Math.max(1,ENDS[phase]-low-1);",
    "  const p=clamp((f-low)/len);",
    "  const q=ease(p);",
    "  const from=phase===0?start:(phase===1?start:connected);",
    "  const to=phase===0?start:(phase===1?connected:resolved);",
    "  const pts=to.map((coord,i)=>[mix(from[i][0],coord[0],q)*W,mix(from[i][1],coord[1],q)*H]);",
    "  const compact=phase===2?mix(1,.23,q):1;",
    "  const visible=phase===2?1-clamp((p-.55)/.32):1;",
    "  cards.forEach((el,i)=>{",
    "   const drift=phase===0?Math.sin(f*.037+i)*4:0;",
    "   el.setAttribute('transform','translate('+(pts[i][0]+drift).toFixed(2)+' '+pts[i][1].toFixed(2)+') scale('+compact.toFixed(4)+')');",
    "   el.setAttribute('opacity',String(phase===0?1:visible));",
    "  });",
    "  links.forEach((el,i)=>{",
    "   const a=pts[i],b=pts[(i+1)%3],my=(a[1]+b[1])/2-H*.055;",
    "   el.setAttribute('d','M'+a[0].toFixed(2)+' '+a[1].toFixed(2)+' Q'+((a[0]+b[0])/2).toFixed(2)+' '+my.toFixed(2)+' '+b[0].toFixed(2)+' '+b[1].toFixed(2));",
    "   el.setAttribute('opacity',String(phase===0?0:(phase===1?Math.min(1,p*2):1-clamp(p*2))));",
    "  });",
    "  result.setAttribute('opacity',String(phase===2?Math.min(1,clamp((p-.24)/.34)):0));",
    " }",
    " window.addEventListener('hf-seek',e=>{const t=Number(e?.detail?.time);if(Number.isFinite(t))render(Math.round(t*FPS));});",
    " window.__evidenceFrame=render;",
    " render(0);",
    "})();"
  ].join("\n");
  return html.replace("</div><script>", svg + "</div><script>" + script + "</script><script>");
}
