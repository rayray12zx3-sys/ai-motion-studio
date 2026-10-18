// Original editorial signal-forensics motion device, invented solely for public-synthetic R&D.
// Source-only, deterministic integer-frame poses, no media fetch/GSAP/clock dependencies.
// A single persistent instrument transforms separated traces into an aligned observation.
// Does NOT implement the upstream Cinetic tr-velocity-handoff-cut recipe.
export function addSignalLedger(html, plan) {
  if (!html.includes("</div><script>") || html.includes('id="signal-ledger"'))
    throw new TypeError("unexpected signal-ledger HTML contract");
  if (plan.direction.visualMotif !== "signal-ledger" ||
      plan.render.width !== 1280 || plan.render.height !== 720 ||
      plan.beats.length !== 3 || ![ "scatter", "connect", "resolve" ].every((v,i)=>plan.beats[i].kind===v))
    throw new TypeError("signal-ledger requires explicit 16:9 3-stage synthetic narrative");
  const { fps } = plan.render;
  const ends = plan.beats.map(x => x.endFrame);
  const style = [
    "#composition .clip{left:116px;top:268px;width:385px;font-family:'PinnedNotoTC';",
    "font-size:78px;font-weight:400;line-height:1.2;letter-spacing:-.06em;",
    "text-align:left;color:#10211f;z-index:4;}",
    "#composition .scatter,#composition .connect,#composition .resolve{",
    "left:116px;top:268px;letter-spacing:-.06em;border:0;padding:0;}",
    "#signal-ledger{position:absolute;inset:0;pointer-events:none;z-index:1;}",
  ].join("");
  const stageSVG = [
    '<svg id="signal-ledger" xmlns="http://www.w3.org/2000/svg" ',
      'viewBox="0 0 1280 720" width="1280" height="720" aria-hidden="true">',
    // One major editorial plane; intentionally not three identical floating cards.
    '<rect x="78" y="88" width="445" height="544" fill="#e9eee9"/>',
    '<rect x="78" y="88" width="445" height="7" fill="#b8e3ca"/>',
    '<path d="M116 216 H483 M116 465 H483" stroke="#aebeb7" stroke-width="1.4"/>',
    '<rect x="116" y="246" width="52" height="5" fill="#3b796b"/>',
    '<rect x="116" y="493" width="20" height="4" fill="#aabbb3"/>',
    '<rect x="143" y="493" width="20" height="4" fill="#aabbb3"/>',
    '<rect x="170" y="493" width="20" height="4" fill="#aabbb3"/>',
    '<rect id="signal-progress" x="116" y="493" width="20" height="4" fill="#1d7768"/>',
    '<path d="M556 88 V632" stroke="#4f7770" stroke-width="1" opacity=".55"/>',
    // Right-hand instrument is physically one continuously evolving plot, not 3 floating UI tiles.
    '<rect x="598" y="129" width="604" height="486" fill="#142e2e" stroke="#4a7770" stroke-width="1.6"/>',
    '<rect x="617" y="151" width="566" height="446" fill="none" stroke="#2e4c48" stroke-width="1"/>',
    '<g id="signal-grid" stroke="#2e4b47" opacity=".55" stroke-width="1">',
    ...[0,1,2,3,4,5,6,7].map(i=>'<path d="M'+(635+i*75)+' 167 V579"/>'),
    ...[0,1,2,3,4,5].map(i=>'<path d="M625 '+(188+i*73)+' H1179"/>'),
    "</g>",
    // Three traces move via explicit stage transforms, with their peaks aligning under one cursor.
    ...[0,1,2].map(i=>'<path id="signal-trace-'+i+'" d="" stroke="'+["#9bc6bb","#73b8aa","#c5ded3"][i]+'" '+
      'fill="none" stroke-width="'+[3,4,3][i]+'" stroke-linecap="round" stroke-linejoin="round"/>'),
    ...[0,1,2].map(i=>'<circle id="signal-marker-'+i+'" cx="800" cy="250" r="'+[7,9,7][i]+'" '+
      'stroke="#d9f4e3" stroke-width="2" fill="#18413b" opacity="0"/>'),
    '<path id="signal-lockline" d="M950 168 V563" stroke="#b8e3ca" stroke-width="2" opacity="0" stroke-dasharray="7 8"/>',
    '<circle id="signal-ring" cx="944" cy="388" r="0" stroke="#b8e3ca" stroke-width="5" fill="none" opacity="0"/>',
    '<circle id="signal-core" cx="944" cy="388" r="0" fill="#b8e3ca" opacity="0"/>',
    '<path id="signal-closure" d="M925 388 L941 403 L965 368" fill="none" stroke="#122b26" stroke-width="7" '+
      'stroke-linejoin="round" stroke-linecap="round" opacity="0"/>',
    // The changing three-stripe index is semantic progress, not fake data.
    '<rect id="signal-phase-0" x="1124" y="574" width="16" height="4" fill="#b8e3ca"/>',
    '<rect id="signal-phase-1" x="1144" y="574" width="16" height="4" fill="#56776d"/>',
    '<rect id="signal-phase-2" x="1164" y="574" width="16" height="4" fill="#56776d"/>',
    "</svg>",
  ].join("");
  const seekScript = [
    "(function(){",
    " 'use strict';",
    " const FPS="+fps+",ENDS="+JSON.stringify(ends)+";",
    " const paths=[0,1,2].map(i=>document.getElementById('signal-trace-'+i));",
    " const markers=[0,1,2].map(i=>document.getElementById('signal-marker-'+i));",
    " const phases=[0,1,2].map(i=>document.getElementById('signal-phase-'+i));",
    " const lockline=document.getElementById('signal-lockline');",
    " const ring=document.getElementById('signal-ring');",
    " const core=document.getElementById('signal-core');",
    " const closure=document.getElementById('signal-closure');",
    " const progress=document.getElementById('signal-progress');",
    " const min=0,max=1,clamp=x=>Math.max(min,Math.min(max,x));",
    " const ease=x=>1-Math.pow(1-clamp(x),3);",
    " const blend=(a,b,t)=>a+(b-a)*t;",
    " const initial=[.22,.70,.84],target=.58,plotX=625,plotW=552;",
    " const baseline=[260,370,480],centerY=388;",
    " function render(frame){",
    "  if(!Number.isFinite(frame))return;",
    "  const f=Math.max(0,Math.floor(frame));",
    "  const phase=f>=ENDS[1]?2:f>=ENDS[0]?1:0;",
    "  const first=phase===0?0:ENDS[phase-1];",
    "  const span=Math.max(1,ENDS[phase]-first-1);",
    "  const p=clamp((f-first)/span),q=ease(p);",
    "  phases.forEach((el,i)=>el.setAttribute('fill',i===phase?'#b8e3ca':'#56776d'));",
    "  progress.setAttribute('x',String(116+phase*27));",
    "  paths.forEach((line,i)=>{",
    "    const peak=phase===0?initial[i]:(phase===1?blend(initial[i],target,q):target);",
    "    const yBase=phase===2?blend(baseline[i],centerY,q):baseline[i];",
    "    const amplitude=phase===2?blend(24+i*4,33,q):24+i*4;",
    "    const points=[];",
    "    for(let k=0;k<=96;k++){",
    "      const u=k/96,x=plotX+plotW*u;",
    "      const bell=Math.exp(-Math.pow((u-peak)/.062,2));",
    "      const ripple=Math.sin(u*23+i*1.8+f*.012)*Math.cos(u*11-i)*5;",
    "      const y=yBase-amplitude*(bell*2.15+ripple/26);",
    "      points.push((k?'L':'M')+x.toFixed(2)+' '+y.toFixed(2));",
    "    }",
    "    line.setAttribute('d',points.join(' '));",
    "    line.setAttribute('opacity',String(phase===2?blend([.8,.9,1][i],.23+i*.32,q):1));",
    "    markers[i].setAttribute('cx',(plotX+plotW*peak).toFixed(2));",
    "    markers[i].setAttribute('cy',(yBase-amplitude*2.15).toFixed(2));",
    "    markers[i].setAttribute('opacity',String(phase===0?.45:(phase===1?1:blend(1,0,q))));",
    "  });",
    "  lockline.setAttribute('opacity',String(phase===0?0:phase===1?Math.min(1,p*2):1-clamp(p*2)));",
    "  const shown=phase===2?ease(clamp((p-.14)/.55)):0;",
    "  ring.setAttribute('r',(shown*60).toFixed(2));",
    "  core.setAttribute('r',(shown*36).toFixed(2));",
    "  ring.setAttribute('opacity',String(shown));",
    "  core.setAttribute('opacity',String(shown));",
    "  closure.setAttribute('opacity',String(clamp((shown-.6)/.4)));",
    " }",
    " window.addEventListener('hf-seek',e=>{const t=Number(e?.detail?.time);if(Number.isFinite(t))render(Math.round(t*FPS));});",
    " window.__signalLedgerFrame=render;",
    " render(0);",
    "})();"
  ].join("\n");
  const rootStart='data-fps="'+fps+'">\n';
  if(!html.includes(rootStart)) throw new Error("unable to locate synthetic composition root");
  let result=html.replace("</style>",style+"</style>");
  result=result.replace(rootStart,rootStart+stageSVG+"\n");
  if(!result.includes("</div><script>"))throw new Error("missing closing scene");
  return result.replace("</div><script>", "</div><script>"+seekScript+"</script><script>");
}
