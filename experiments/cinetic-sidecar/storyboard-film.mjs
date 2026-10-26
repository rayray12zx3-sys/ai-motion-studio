// Original art direction: a raindrop story told through three physical film frames.
// Fully synthetic SVG scenes; no remote media, clocks, GSAP or Cinetic code copied.
// A red visual cue and the same cut-outs persist across the storyboard and final shot.
export const SOURCE_IMPLEMENTED_STORYBOARD_TECHNIQUES = Object.freeze(['tr-anchor-overlay-cut']);
export function addStoryboardFilm(html, plan) {
  if (!html.includes("</div><script>") || html.includes('id="storyboard-film"'))
    throw new TypeError("unexpected storyboard-film composition");
  const {width:W,height:H,fps,frames}=plan.render;
  if (plan.direction.visualMotif !== "storyboard-film" ||
      W !== 1280 || H !== 720 || fps !== 60 || frames !== 480 ||
      plan.beats.length !== 3 ||
      !["scatter","connect","resolve"].every((kind,i)=>plan.beats[i].kind===kind))
    throw new TypeError("storyboard-film requires opt-in original 8s 60fps landscape storyboard");
  // Only this exact opt-in Cinetic recipe has a scene-level, frame-seek implementation.
  // Other catalog IDs remain director proposals, not automatically rendered effects.
  const anchoredOverlay=plan.direction.techniqueIds.includes('tr-anchor-overlay-cut');
  const ends=plan.beats.map(x=>x.endFrame);
  const style=(anchoredOverlay?[
    "#composition .clip{width:900px;max-height:160px;text-align:left;color:#e9efec;",
      "font-size:88px;font-weight:400;line-height:1.16;letter-spacing:-.045em;border:0;padding:0;z-index:5}",
    "#composition .scatter{left:84px;top:528px;}",
    "#composition .connect{left:84px;top:92px;}",
    "#composition .resolve{left:84px;top:88px;}",
    "#storyboard-film{position:absolute;inset:0;z-index:2;pointer-events:none}"
  ]:[
    "#composition .clip{left:82px;top:271px;width:415px;max-height:220px;",
      "text-align:left;color:#e9efec;font-size:76px;font-weight:400;",
      "line-height:1.22;letter-spacing:-.055em;border:0;padding:0;z-index:5}",
    "#composition .scatter,#composition .connect,#composition .resolve{left:82px;top:271px;border:0;padding:0;letter-spacing:-.055em;}",
    "#storyboard-film{position:absolute;inset:0;z-index:2;pointer-events:none}"
  ]).join("");
  const cell=(i)=>{
    const color=["#9ecbc8","#f36e63","#77b8bd"][i];
    const art=[
      '<path d="M-62 0 C-78 -17 -54 -35 -32 -29 C-22 -62 26 -58 38 -27 C68 -33 82 -3 61 8 L-62 8Z" fill="#30474a" stroke="#accbca" stroke-width="2.5"/>'
      +'<path d="M-28 24 V54 M5 17 V39 M32 20 V58" stroke="#90bcc1" stroke-width="2" stroke-linecap="round"/>'
      +'<path d="M6 21 Q-7 42 5 53 Q17 42 6 21Z" fill="#f36e63"/>',
      '<path d="M-75 24 Q-37 16 0 24 T75 24 M-75 42 Q-35 33 0 42 T75 42" fill="none" stroke="#8cbfc3" stroke-width="3"/>'
      +'<path d="M0 -51 Q-25 -22 0 -1 Q25 -22 0 -51Z" fill="#f36e63"/>'
      +'<path d="M-23 8 Q0 -10 23 8 M-36 12 Q0 -18 36 12" fill="none" stroke="#e8eeec" stroke-width="2"/>',
      '<path d="M-78 10 H78 M-78 25 H78 M-78 40 H78" stroke="#54757a" stroke-width="2"/>'
      +'<ellipse cx="0" cy="22" rx="54" ry="18" fill="none" stroke="#77b8bd" stroke-width="3"/>'
      +'<ellipse cx="0" cy="22" rx="25" ry="8" fill="none" stroke="#e4ece9" stroke-width="2"/>'
      +'<circle cx="0" cy="22" r="6" fill="#f36e63"/>'
    ][i];
    return ['<g id="story-cell-'+i+'" opacity="1" transform="translate(0 0)">',
       '<rect x="-94" y="-81" width="188" height="162" rx="4" fill="#26393b" stroke="#a4bdb7" stroke-width="1.5"/>',
       '<rect x="-78" y="-65" width="156" height="130" fill="#162b30"/>',
       '<path d="M-75 -53 H-56 M-75 -53 V-36 M57 52 H75 M75 34 V52" fill="none" stroke="'+color+'" stroke-width="2.5"/>',
       '<g id="story-art-'+i+'">'+art+'</g>',
       '<rect x="-94" y="-81" width="188" height="9" fill="#e9efec"/>',
       '<rect x="-94" y="72" width="188" height="9" fill="#e9efec"/>',
       '<path d="M-82 -78 V-74 M-61 -78 V-74 M-40 -78 V-74 M-19 -78 V-74 M2 -78 V-74 M23 -78 V-74 M44 -78 V-74 M65 -78 V-74 M85 -78 V-74'
          +' M-82 75 V79 M-61 75 V79 M-40 75 V79 M-19 75 V79 M2 75 V79 M23 75 V79 M44 75 V79 M65 75 V79 M85 75 V79"'
          +' stroke="#364546" stroke-width="5"/>',
    '</g>'].join("");
  };
  const stage=[
    '<svg id="storyboard-film"'+(anchoredOverlay?' data-applied-upstream-technique="tr-anchor-overlay-cut"':'')+' viewBox="0 0 1280 720" width="1280" height="720" ',
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '<defs><clipPath id="story-hero-clip"><rect x="556" y="140" width="624" height="388" rx="3"/></clipPath></defs>',
    // Historic sidebar-and-box treatment is preserved ONLY for earlier samples.
    // The new opt-in scene removes the repeated PPT-like stage scaffolding and
    // allows the story itself to occupy different parts of the full frame.
    ...(anchoredOverlay?[
      '<rect id="story-step-0" width="1" height="1" opacity="0"/>',
      '<rect id="story-step-1" width="1" height="1" opacity="0"/>',
      '<rect id="story-step-2" width="1" height="1" opacity="0"/>',
    ]:[
    '<path d="M82 106 H474" stroke="#566a69" stroke-width="2"/>',
    '<path d="M82 103 H166" stroke="#f36e63" stroke-width="6"/>',
    '<path d="M82 240 H474" stroke="#526a68" stroke-width="1"/>',
    '<path d="M82 493 H474" stroke="#526a68" stroke-width="1"/>',
    '<path d="M82 572 H474" stroke="#526a68" stroke-width="1"/>',
    '<path d="M82 596 H210" stroke="#92b7b2" stroke-width="5" opacity=".8"/>',
    '<rect id="story-step-0" x="82" y="558" width="78" height="5" fill="#f36e63"/>',
    '<rect id="story-step-1" x="166" y="558" width="78" height="5" fill="#536662"/>',
    '<rect id="story-step-2" x="250" y="558" width="78" height="5" fill="#536662"/>',
    '<circle cx="452" cy="619" r="6" fill="#f36e63"/>',
    // Hero stage: frame itself persists before, during and after montage.
    '<rect x="535" y="120" width="665" height="432" rx="6" fill="#122328" stroke="#536a6d" stroke-width="2"/>',
    '<path d="M556 148 V140 H583 M1153 140 H1180 V166 M556 498 V528 H583 M1153 528 H1180 V501" ',
       'stroke="#bfd2d0" stroke-width="2" fill="none" opacity=".75"/>',
    '<path d="M535 565 H1200" stroke="#52696c" stroke-width="1"/>',
    ]),
    '<g id="story-filmrail" opacity="0">',
    anchoredOverlay
      ? '<path d="M200 453 H1092" stroke="#dbe7e4" stroke-width="12"/><path d="M200 447 H1092 M200 459 H1092" stroke="#192c2c" stroke-width="1.5"/><path d="M200 453 H1092" stroke="#f36e63" stroke-width="3" stroke-dasharray="18 14"/>'
      : '<path d="M581 453 H1169" stroke="#dbe7e4" stroke-width="11" opacity=".95"/><path d="M581 447 H1169 M581 459 H1169" stroke="#192c2c" stroke-width="1.5"/><path d="M581 453 H1169" stroke="#f36e63" stroke-width="3" stroke-dasharray="18 14"/>',
    '</g>',
    '<circle id="story-cue" cx="620" cy="453" r="8" fill="#f36e63" stroke="#fff3e5" stroke-width="2"/>',
    // Large FINAL visual scene: recognizable rain impact, not abstract generic metrics.
    '<g id="story-hero" opacity="0"'+(anchoredOverlay?' transform="translate(-590 -110) scale(1.50)"':'')+' clip-path="url(#story-hero-clip)">',
    '<rect x="556" y="140" width="624" height="388" fill="#1b3036"/>',
    '<path d="M556 409 C669 387 767 419 878 401 S1082 398 1180 415 V528 H556Z" fill="#386770"/>',
    '<path d="M556 417 C670 403 781 437 880 418 S1082 422 1180 430" stroke="#9ad5d3" fill="none" stroke-width="3"/>',
    '<path d="M649 261 C608 231 648 201 696 213 C710 176 789 185 802 223 C853 210 881 262 839 280 H669Z" ',
       'fill="#516d70" stroke="#aac2c1" stroke-width="3"/>',
    '<path d="M663 291 L641 341 M737 294 L710 362 M805 292 L785 351" stroke="#a1c8c9" opacity=".8" stroke-width="3"/>',
    '<path d="M946 188 L918 258 M1044 235 L1013 300 M1129 199 L1111 255" stroke="#658c91" stroke-width="3"/>',
    '<path id="story-raindrop" d="M0 -29 C-11 -12 -21 -1 -21 11 C-21 23 -12 32 0 32 C12 32 21 23 21 11 C21 -1 11 -12 0 -29Z" ',
        'transform="translate(753 265)" fill="#f36e63" stroke="#ffe1d8" stroke-width="2"/>',
    '<ellipse id="story-ripple-0" cx="753" cy="413" rx="0" ry="0" fill="none" stroke="#d4f2ec" stroke-width="4" opacity="0"/>',
    '<ellipse id="story-ripple-1" cx="753" cy="413" rx="0" ry="0" fill="none" stroke="#f36e63" stroke-width="3" opacity="0"/>',
    '<path id="story-splash" d="M706 414 Q728 378 754 402 Q778 370 807 414" ',
       'stroke="#bfe7df" stroke-width="5" fill="none" opacity="0"/>',
    '</g>',
    '<path id="story-playhead" d="M581 575 V670" stroke="#f36e63" stroke-width="4" opacity="0"/>',
    '<g id="story-cell-group">'+cell(0)+cell(1)+cell(2)+'</g>',
    '</svg>'
  ].join("");
  const seek=[
    "(function(){",
    " 'use strict';",
    " const FPS="+fps+",ENDS="+JSON.stringify(ends)+";",
    " const ANCHOR_CUT="+String(anchoredOverlay)+";",
    " const cells=[0,1,2].map(i=>document.getElementById('story-cell-'+i));",
    " const steps=[0,1,2].map(i=>document.getElementById('story-step-'+i));",
    " const rail=document.getElementById('story-filmrail');",
    " const cue=document.getElementById('story-cue');",
    " const hero=document.getElementById('story-hero');",
    " const drop=document.getElementById('story-raindrop');",
    " const ripple0=document.getElementById('story-ripple-0'),ripple1=document.getElementById('story-ripple-1');",
    " const splash=document.getElementById('story-splash'),playhead=document.getElementById('story-playhead');",
    " const clamp=x=>Math.min(1,Math.max(0,x));",
    " const ease=x=>1-Math.pow(1-clamp(x),3);",
    " const mix=(a,b,t)=>a+(b-a)*t;",
    " const A=ANCHOR_CUT?[[380,225,-12],[925,251,9],[640,448,-5]]:[[653,273,-9],[1051,304,8],[873,434,-4]];",
    " const B=ANCHOR_CUT?[[300,355,0],[630,355,0],[960,355,0]]:[[657,327,0],[861,327,0],[1065,327,0]];",
    " const C=ANCHOR_CUT?[[320,630,0],[610,630,0],[900,630,0]]:[[665,617,0],[863,617,0],[1061,617,0]];",
    " function setFrame(frame){",
    "  if(!Number.isFinite(frame))return;",
    "  const f=Math.max(0,Math.floor(frame));",
    "  const stage=f>=ENDS[1]?2:f>=ENDS[0]?1:0;",
    "  const first=stage===0?0:ENDS[stage-1];",
    "  const span=Math.max(1,ENDS[stage]-first-1);",
    "  const p=clamp((f-first)/span),q=ease(p);",
    "  steps.forEach((el,i)=>el.setAttribute('fill',i===stage?'#f36e63':'#536662'));",
    "  const src=stage===0?A:stage===1?A:B;",
    "  const dst=stage===0?A:stage===1?B:C;",
    "  const size=ANCHOR_CUT?(stage===0?1.28:stage===1?mix(1.28,1.15,q):mix(1.15,.52,q)):(stage===0?1:stage===1?mix(1,.90,q):mix(.90,.52,q));",
    "  cells.forEach((el,i)=>{",
    "   const x=mix(src[i][0],dst[i][0],q),y=mix(src[i][1],dst[i][1],q);",
    "   const angle=mix(src[i][2],dst[i][2],q);",
    "   el.setAttribute('transform','translate('+x.toFixed(3)+' '+y.toFixed(3)+') rotate('+angle.toFixed(3)+') scale('+size.toFixed(4)+')');",
    "   el.setAttribute('opacity',String(stage===2?Math.max(.70,1-p*.30):1));",
    "  });",
    "  rail.setAttribute('opacity',String(stage===0?0:stage===1?Math.min(1,p*2):ANCHOR_CUT?0:Math.max(0,1-p*3)));",
    "  // Upstream tr-anchor-overlay-cut: absolute foreground cue survives the exact act boundary.",
    "  // World behind changes at ENDS[1]; overlay begins at the identical 1065,453 pixel anchor.",
    "  // Then the cue glides into the new scene over 40 frames (bounded, deterministic).",
    "  const cueTravel=ANCHOR_CUT && stage===2?ease(clamp((f-first)/40)):q;",
    "  const cueX=stage===0?653:stage===1?mix(657,1065,q):mix(1065,753,cueTravel);",
    "  const cueY=stage===0?273:stage===1?453:mix(453,413,cueTravel);",
    "  cue.setAttribute('cx',cueX.toFixed(2));cue.setAttribute('cy',cueY.toFixed(2));",
    "  cue.setAttribute('opacity',String(stage===2?(ANCHOR_CUT?1-clamp((f-first)/52):1-clamp(p*3)):1));",
    "  const h=stage===2?(ANCHOR_CUT?1:Math.min(1,p*5)):0;",
    "  hero.setAttribute('opacity',String(h));",
    "  const dropP=clamp((p-.08)/.43);",
    "  const dropY=mix(265,395,ease(dropP));",
    "  drop.setAttribute('transform','translate(753 '+dropY.toFixed(3)+') scale('+(1-clamp((dropP-.92)*12)).toFixed(3)+')');",
    "  const rippleP=clamp((p-.44)/.52);",
    "  ripple0.setAttribute('rx',(rippleP*170).toFixed(2));ripple0.setAttribute('ry',(rippleP*35).toFixed(2));",
    "  ripple1.setAttribute('rx',(rippleP*104).toFixed(2));ripple1.setAttribute('ry',(rippleP*22).toFixed(2));",
    "  ripple0.setAttribute('opacity',String(stage===2?Math.sin(Math.PI*rippleP)*.85:0));",
    "  ripple1.setAttribute('opacity',String(stage===2?Math.sin(Math.PI*rippleP)*.90:0));",
    "  splash.setAttribute('opacity',String(stage===2?Math.sin(Math.PI*clamp((p-.43)/.35))*.85:0));",
    "  playhead.setAttribute('opacity',String(stage===2?1:0));",
    "  playhead.setAttribute('transform','translate('+(stage===2?mix(0,587,p):0).toFixed(2)+' 0)');",
    " }",
    " window.addEventListener('hf-seek',e=>{const t=Number(e?.detail?.time);if(Number.isFinite(t))setFrame(Math.round(t*FPS));});",
    " window.__storyboardFilmFrame=setFrame;",
    " setFrame(0);",
    "})();"
  ].join("\n");
  let output=html.replace("</style>",style+"</style>");
  const anchor='data-fps="'+fps+'">\n';
  if(!output.includes(anchor))throw new Error("missing expected composition root");
  output=output.replace(anchor,anchor+stage+"\n");
  return output.replace("</div><script>", "</div><script>"+seek+"</script><script>");
}
