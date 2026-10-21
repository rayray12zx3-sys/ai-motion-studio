// Public, fictional 95-frame motion proof. NO company assets, APP captures, copy or secrets.
// A bounded, opt-in Cinetic-directed HyperFrames sidecar; not full upstream Cinetic installation.
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SPEC = Object.freeze({
  engine:'cinetic-hyperframes',contentClass:'public-synthetic',fps:30,frames:95,width:720,height:1280,
  study:'fictional-three-question-causal-motion',
  title:'MEMORY SPRINT',
  rounds:[
    {question:'ASTRA',choices:['a distant star','a mountain path','a warm shelter','a small river'],correct:0},
    {question:'EMBER',choices:['a quiet glow','an icy lake','a tall tower','an open window'],correct:0},
    {question:'GLIDE',choices:['move smoothly','stand motionless','speak loudly','turn backward'],correct:null}
  ],
  privacy:'fictional and synthesized from scratch; zero brand or customer material',
  art:'NOT_USER_APPROVED'
});
const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
export function validate(spec=SPEC){
  assert(spec.engine==='cinetic-hyperframes'&&spec.contentClass==='public-synthetic','synthetic route only');
  assert(spec.fps===30&&spec.frames===95&&spec.width===720&&spec.height===1280,'profile frozen');
  assert(spec.rounds.length===3&&spec.rounds.every(r=>r.choices.length===4),'three complete parents');
  assert(spec.rounds[0].correct===0&&spec.rounds[1].correct===0&&spec.rounds[2].correct===null,'2 answered, third not');
  assert(!JSON.stringify(spec).match(/VocabKnow|resilient|journey|accomplish|APP_native|單字馬拉松|Dog_quiz|private[_-]source/i),'no company content');
  return spec;
}
export function pose(raw){
  const f=Math.min(94,Math.max(0,Math.floor(raw)));
  const s=(a,b)=>{const t=Math.max(0,Math.min(1,(f-a)/(b-a)));return t*t*(3-2*t);};
  const ex1=s(48,52),ex2=s(69,73);
  return {frame:f,
    icon:{alpha:f>=7?(f<=21?1:1-s(21,24)):s(3,7),size:1+.045*Math.sin(f*.5)},
    heading:{alpha:s(12,19),y:218-24*s(15,30)},
    runner:{alpha:s(20,25),x:335+3.5*Math.max(0,f-26),y:345+8*Math.abs(Math.sin(f*.62)),angle:3*Math.sin(f*.7)},
    cards:[
      {x:-665*ex1,y:20-265*ex1,alpha:s(26,30)*(1-s(50,52)),scale:1,success:f>=45,pressed:f>=47,selected:f>=44},
      {x:-665*ex2,y:75-65*s(48,53)-265*ex2,alpha:s(26,31)*(1-s(71,73)),scale:.97+.03*s(48,53),success:f>=66,pressed:f>=68,selected:f>=65},
      {x:0,y:130-105*s(69,74),alpha:s(26,31),scale:.93+.07*s(69,74),success:false,pressed:false,selected:false}
    ],
    visibleRound:f<53?0:f<74?1:2,
    fictional:true,artApproval:'PENDING_USER_APPROVAL'};
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function page(item,index){
  return '<article class="quiz-card" id="quiz-'+index+'" data-independent-parent="'+index+'">'
    +'<div class="q-label">FICTIONAL VOCABULARY DEMO · 0'+(index+1)+'</div>'
    +'<div class="question">'+escape(item.question)+'</div>'
    +'<div class="choices">'+item.choices.map((t,j)=>'<div class="choice" id="choice-'+index+'-'+j+'"><span class="choice-letter">'+String.fromCharCode(65+j)+'</span>'+escape(t)+'</div>').join('')+'</div>'
    +'<div class="success-screen" id="success-'+index+'"><div class="success-tick">&#10003;</div><div class="success-text">CORRECT</div><div class="success-sub">Great progress</div><div class="next-button" id="next-'+index+'">NEXT QUESTION <span>&#8594;</span></div></div>'
    +'</article>';
}
export function html(){
  validate();
  const script=[
    "'use strict';(function(){",
    'const pose='+pose.toString()+';',
    'const els={icon:document.getElementById("launch-icon"),runner:document.getElementById("runner"),heading:document.getElementById("heading"),cards:[0,1,2].map(i=>document.getElementById("quiz-"+i)),success:[0,1,2].map(i=>document.getElementById("success-"+i)),next:[0,1,2].map(i=>document.getElementById("next-"+i)),first:[0,1,2].map(i=>document.getElementById("choice-"+i+"-0"))};',
    'function seek(f){const p=pose(f);els.icon.style.opacity=p.icon.alpha;els.icon.style.transform="translate(-50%,-50%) scale("+p.icon.size+")";els.runner.style.opacity=p.runner.alpha;els.runner.style.transform="translate("+p.runner.x+"px,"+p.runner.y+"px) rotate("+p.runner.angle+"deg)";els.heading.style.opacity=p.heading.alpha;els.heading.style.transform="translateY("+p.heading.y+"px)";',
    'p.cards.forEach((c,i)=>{els.cards[i].style.transform="translate("+c.x+"px,"+c.y+"px) scale("+c.scale+")";els.cards[i].style.opacity=c.alpha;els.success[i].style.opacity=c.success?1:0;els.success[i].style.visibility=c.success?"visible":"hidden";els.next[i].style.filter=c.pressed?"brightness(.70)":"none";els.next[i].style.transform=c.pressed?"scale(.97)":"scale(1)";els.first[i].style.background=c.selected?"#246e81":"#283b64";});window.__syntheticPose=p;return p;}',
    'window.__syntheticSeek=seek;window.addEventListener("hf-seek",e=>{const t=Number(e&&e.detail&&e.detail.time);if(Number.isFinite(t))seek(Math.round(t*30));});seek(0);',
    '})();'
  ].join('\n');
  return ['<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Original fictional three-question kinetic experiment</title>',
   '<style>*{box-sizing:border-box}body,html{margin:0;width:100%;height:100%;background:transparent;overflow:hidden;font-family:Arial,sans-serif}',
   '#scene{position:relative;width:720px;height:1280px;overflow:hidden;background:radial-gradient(circle at 46% 20%,#263c71,#142446 68%,#0f1d39);color:#f4f7ff}',
   '#heading{position:absolute;top:0;left:45px;width:630px;text-align:center;color:#f4d88b;font-size:62px;font-weight:900;letter-spacing:2px;z-index:7;white-space:nowrap}',
   '#launch-icon{position:absolute;left:360px;top:340px;width:138px;height:138px;background:#5ed5af;border:7px solid #b0ffdc;border-radius:28px;box-shadow:0 10px 42px #15444d77;display:grid;place-items:center;color:#0a4447;font-weight:900;z-index:9}',
   '#launch-icon svg{width:106px;height:106px}#runner{position:absolute;left:0;top:0;width:72px;height:72px;z-index:8;filter:drop-shadow(0 7px 3px #0b1a3577)}#runner svg{width:72px;height:72px}',
   '#stack{position:absolute;left:68px;top:445px;width:584px;height:665px;overflow:hidden;z-index:6}',
   '.quiz-card{position:absolute;left:0;top:0;width:584px;height:585px;background:#22385e;border:3px solid #90accb;border-radius:29px;padding:25px 28px;box-shadow:0 15px 25px #080f2077;transform-origin:top center}',
   '#quiz-0{z-index:3}#quiz-1{z-index:2}#quiz-2{z-index:1}',
   '.q-label{color:#b9d5e7;font-weight:700;font-size:17px;letter-spacing:1px}.question{border-radius:19px;background:#4b719b;text-align:center;font-size:42px;letter-spacing:3px;font-weight:900;padding:17px 4px;margin-top:13px;}',
   '.choices{display:grid;gap:12px;margin-top:21px}.choice{height:67px;padding:12px 16px;background:#283b64;border:2px solid #6d8ab4;border-radius:14px;color:#f9fcff;font-size:25px;font-weight:700;display:flex;align-items:center;gap:18px}',
   '.choice-letter{font-size:23px;color:#cae0fa;background:#415a81;padding:6px 10px;border-radius:9px}',
   '.success-screen{position:absolute;inset:0;background:#204761;border-radius:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:4;visibility:hidden}',
   '.success-tick{width:100px;height:100px;border-radius:50%;background:#82e8a7;color:#0f684f;text-align:center;font-size:77px;font-weight:900;line-height:100px}',
   '.success-text{font-size:58px;font-weight:900;letter-spacing:3px;color:#e8fffa;margin-top:28px}.success-sub{font-size:28px;margin-top:10px;color:#c6eddf}',
   '.next-button{margin-top:38px;background:#f2a348;border:4px solid #ffe0a3;border-radius:13px;color:#392813;font-size:26px;font-weight:900;letter-spacing:1px;padding:18px 25px;transition:none}.next-button span{margin-left:16px}',
   '#footer{position:absolute;bottom:56px;width:720px;text-align:center;font-size:18px;letter-spacing:1.8px;color:#9faecc}',
   '</style></head><body><div id="scene" data-composition-id="cinetic-fictional-three-step" data-no-timeline data-start="0" data-duration="3.166667" data-width="720" data-height="1280" data-fps="30">',
   '<div id="launch-icon" aria-label="fictional icon"><svg viewBox="0 0 100 100"><circle cx="60" cy="19" r="12" fill="#12525b"/><path d="M57 31 L41 53 L29 68 M43 51 L69 66 L86 61 M45 42 L21 40 L12 48" stroke="#12525b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>',
   '<div id="heading">MEMORY SPRINT</div>',
   '<div id="runner" aria-label="fictional runner"><svg viewBox="0 0 100 100"><circle cx="60" cy="19" r="12" fill="#67eac2"/><path d="M57 31 L41 53 L29 68 M43 51 L69 66 L86 61 M45 42 L21 40 L12 48" stroke="#67eac2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>',
   '<div id="stack">'+SPEC.rounds.map(page).join('')+'</div>',
   '<div id="footer">PUBLIC SYNTHETIC MOTION PROOF · NOT AN APP RECORDING</div>',
   '<script>'+script+'</script></div></body></html>\n'].join('\n');
}
export function build(dir){
  const root=resolve(dir);assert(!existsSync(root),'new output required');mkdirSync(root,{recursive:true});
  writeFileSync(resolve(root,'index.html'),html(),{flag:'wx'});
  writeFileSync(resolve(root,'fixture.json'),JSON.stringify(SPEC,null,2)+'\n',{flag:'wx'});
  writeFileSync(resolve(root,'review-gates.json'),JSON.stringify({engine:'hyperframes@0.8.143',actualRender:'PENDING',art:'PENDING_USER_APPROVAL',brand:'FICTIONAL',privateAssets:'ZERO',realS08Test:'NOT_PROVEN',userRelease:'NOT_APPROVED'},null,2)+'\n',{flag:'wx'});
  return root;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{assert(process.argv.length===3,'Usage: node three-step-quiz-synthetic-95f.mjs <fresh-dir>');console.log(build(process.argv[2]));}
  catch(e){console.error(e);process.exitCode=1;}
}
