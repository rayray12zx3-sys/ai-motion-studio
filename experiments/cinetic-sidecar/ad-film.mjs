// Original, per-brief advertisement choreography. No third-party art, logo, media, or remote assets.
// Frame deterministic seek; style vectors and semantic copy are owned by this project.
// This is an opt-in creative lane, NOT approval for real client assets or every upstream Cinetic technique.
const safeColor = value => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
const att = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export const AD_DEVICES = Object.freeze(['focus-clock','habit-path']);

export function addAdFilm(html,plan) {
  const {width:W,height:H,fps}=plan.render;
  const {adDevice,adAccent}=plan.direction;
  if(!AD_DEVICES.includes(adDevice) || !safeColor(adAccent) || plan.beats.length!==3)
    throw Error('ad-film requires three beats, approved device and #RRGGBB accent');
  const vertical=H>W;
  const cx=vertical?360:835,cy=vertical?625:356,r=vertical?205:226;
  const accent=att(adAccent);
  const pts=vertical?[[135,818],[265,577],[452,425],[596,216]]:[[562,575],[664,415],[874,370],[1095,177]];
  const route='M '+pts.map(x=>x.join(' ')).join(' L ');
  const rings = [
    '<g id="ad-clock" opacity="0">',
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+42)+'" fill="none" stroke="#d2e2df" stroke-opacity=".08" stroke-width="1"/>',
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#9bb1ba" stroke-opacity=".17" stroke-width="28"/>',
    '<circle id="ad-progress" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+accent+'" stroke-width="23" transform="rotate(-90 '+cx+' '+cy+')"/>',
    '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r-38)+'" fill="#21343d" fill-opacity=".64" stroke="#d7e7e3" stroke-opacity=".12" stroke-width="2"/>',
    '<g id="ad-tick" transform="translate('+cx+' '+cy+')">',
    '<line x1="0" y1="0" x2="0" y2="'+(-r+57)+'" stroke="#e9f0e9" stroke-width="8" stroke-linecap="round"/>',
    '<circle r="13" fill="'+accent+'" stroke="#f3f1e7" stroke-width="3"/>',
    '</g>',
    '<g id="ad-clock-halo"><circle cx="'+cx+'" cy="'+cy+'" r="'+(r+84)+'" fill="none" stroke="'+accent+'" stroke-opacity=".24" stroke-width="2" stroke-dasharray="2 18"/></g>',
    '</g>'
  ].join('');
  const path = [
    '<g id="ad-path" opacity="0">',
    '<path d="'+route+'" fill="none" stroke="#e4f4e9" stroke-opacity=".12" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/>',
    '<path id="ad-route" d="'+route+'" pathLength="100" fill="none" stroke="'+accent+'" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="100"/>',
    ...pts.map((p,i)=>'<g id="ad-node-'+i+'" transform="translate('+p[0]+' '+p[1]+')" opacity="0"><circle r="'+(24+i*3)+'" fill="#182b30" stroke="'+accent+'" stroke-width="5"/><circle r="6" fill="#f1f3df"/></g>'),
    '<g id="ad-leaf" opacity="0" transform="translate('+pts[3][0]+' '+pts[3][1]+')">',
    '<path d="M0 0 V-110" fill="none" stroke="#e6efc6" stroke-width="9" stroke-linecap="round"/>',
    '<path d="M0 -78 C-58 -125 -74 -79 -21 -50Z" fill="'+accent+'"/>',
    '<path d="M0 -107 C45 -174 94 -145 48 -91Z" fill="#e6efc6"/>',
    '</g>',
    '</g>'
  ].join('');
  const art = [
    '<svg id="ad-film" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '<defs><radialGradient id="ad-aura"><stop offset="0" stop-color="'+accent+'" stop-opacity=".20"/><stop offset="1" stop-color="'+accent+'" stop-opacity="0"/></radialGradient></defs>',
    '<ellipse id="ad-glow" cx="'+cx+'" cy="'+cy+'" rx="'+(vertical?r+115:r+205)+'" ry="'+(r+198)+'" fill="url(#ad-aura)" opacity=".7"/>',
    '<path d="'+(vertical?'M72 102 H648':'M72 74 H1208')+'" stroke="'+accent+'" stroke-width="3" stroke-opacity=".7"/>',
    '<circle cx="'+(vertical?648:1208)+'" cy="'+(vertical?102:74)+'" r="5" fill="'+accent+'"/>',
    rings,path,
    '</svg>'
  ].join('');
  const style = [
    '#ad-film{position:absolute;inset:0;z-index:1;pointer-events:none}',
    '#composition .clip{z-index:3;left:'+(vertical?'10%':'7%')+';width:'+(vertical?'80%':'86%')+';font-size:'+(vertical?'67px':'86px')+';font-weight:400;line-height:1.16;letter-spacing:-.045em;text-align:'+(vertical?'center':'left')+';border:none;padding:0;white-space:normal;text-shadow:0 8px 28px rgba(0,0,0,.32)}',
    '#composition .scatter{top:'+(vertical?'14%':'22%')+'}',
    '#composition .connect{top:'+(vertical?'23%':'28%')+'}',
    '#composition .resolve{top:'+(vertical?'75%':'60%')+';font-size:'+(vertical?'72px':'92px')+';color:'+accent+'}',
  ].join('');
  const beatData=JSON.stringify(plan.beats.map(b=>[b.startFrame,b.endFrame]));
  const length=(2*Math.PI*r).toFixed(3);
  const script=[
    '(function(){',
    '"use strict";',
    'const FPS='+fps+',DEVICE='+JSON.stringify(adDevice)+',CUTS='+beatData+',C='+length+';',
    'const clk=document.getElementById("ad-clock"),path=document.getElementById("ad-path"),prog=document.getElementById("ad-progress");',
    'const tick=document.getElementById("ad-tick"),route=document.getElementById("ad-route"),leaf=document.getElementById("ad-leaf");',
    'const glow=document.getElementById("ad-glow"),nodes=[0,1,2,3].map(i=>document.getElementById("ad-node-"+i));',
    'const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3);',
    'function setFrame(raw){',
    'if(!Number.isFinite(raw))return;const f=Math.max(0,Math.floor(raw));',
    'let idx=CUTS.findIndex(x=>f>=x[0]&&f<x[1]);if(idx<0)idx=2;',
    'const [start,end]=CUTS[idx],q=ease((f-start)/Math.max(1,end-start-1));',
    'const story=(idx===0?.11+q*.16:idx===1?.27+q*.57:.84+q*.16);',
    'const pulse=Math.sin((f/FPS)*Math.PI*2*.55);',
    'glow.setAttribute("opacity",String(.43+.18*pulse));',
    'clk.setAttribute("opacity",DEVICE==="focus-clock"?"1":"0");',
    'path.setAttribute("opacity",DEVICE==="habit-path"?"1":"0");',
    'if(DEVICE==="focus-clock"){',
    'prog.setAttribute("stroke-dasharray",C.toFixed(3));',
    'prog.setAttribute("stroke-dashoffset",(C*(1-story)).toFixed(3));',
    'tick.setAttribute("transform","translate('+cx+' '+cy+') rotate("+(-110+story*320).toFixed(3)+")");',
    '}else{',
    'route.setAttribute("stroke-dashoffset",(100-story*100).toFixed(3));',
    'nodes.forEach((node,i)=>node.setAttribute("opacity",String(clamp((story-(i*.27))/.11))));',
    'leaf.setAttribute("opacity",String(clamp((story-.72)/.20)));',
    '}',
    '}',
    'window.addEventListener("hf-seek",e=>{const t=Number(e&&e.detail&&e.detail.time);if(Number.isFinite(t))setFrame(Math.round(t*FPS));});',
    'window.__adFilmFrame=setFrame;',
    'setFrame(0);',
    '})();'
  ].join('\n');
  const root='data-fps="'+fps+'">\n';
  if(!html.includes(root)||!html.includes('</div><script>'))
    throw Error('expected frame seek composition markers missing');
  return html.replace('</style>',style+'</style>')
    .replace(root,root+art+'\n')
    .replace('</div><script>','</div><script>'+script+'</script><script>');
}
