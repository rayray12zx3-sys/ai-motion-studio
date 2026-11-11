/**
 * One-step authoring-time preflight. No renderer imports, network, models,
 * copied reference assets, creative approval or schema migration.
 * Shows how two very different original treatments use one bounded contract.
 */
const stop=message=>{throw Error(message)};
const required=(v,key)=>typeof v==="string"&&v.trim().length>=4&&v.length<=300?v.trim():stop(key+" needs descriptive text");
const sceneKinds=new Set(["svg-gsap","html-css","threejs"]);
const transitionKinds=new Set(["establish","carry","transform","spatial-reveal","motivated-cut"]);
const cameraKinds=new Set(["locked","push-in","pull-back","dolly","crane","rack-focus","arc","track"]);
const actionKinds=new Set(["draw","morph","kinetic-type","data-transformation","focus-pull","space-reveal","physical-response","camera-move","hold"]);
const id=s=>typeof s==="string"&&/^[a-z][a-z0-9-]*$/.test(s);
export function preflightCreativeTreatment(input){
 if(!input||input.version!=="creative-treatment-rnd-v1")stop("Unsupported creative treatment");
 for(const k of ["id","concept","audience","message"])required(input[k],k);
 if(!id(input.id))stop("Unsafe film ID");
 const {fps,frames,width,height}=input.profile||{};
 if(![fps,frames,width,height].every(Number.isInteger)||fps<24||fps>120||frames<fps*4||frames>fps*180||width<320||height<320||width>4096||height>4096)stop("Unsafe frame profile");
 const {palette,cameraLanguage,exclude}=input.visual||{};
 if(!Array.isArray(palette)||palette.length<2||palette.length>5||palette.some(x=>!/^#[0-9A-Fa-f]{6}$/.test(x)))stop("Bounded intentional palette required");
 required(cameraLanguage,"Camera visual grammar");
 if(!Array.isArray(exclude)||exclude.length<2||exclude.some(s=>typeof s!=="string"||s.length>90))stop("Explicit exclusions required");
 if(input.rights?.assetPolicy!=="original-only")stop("Private/external assets not approved for this experiment");
 const rhythm=input.rhythm||{},mode=rhythm.mode;
 if(!["beat-led","cinematic"].includes(mode))stop("Unknown rhythm mode");
 required(rhythm.reason,"Rhythm reason");
 if(mode==="beat-led"&&(!Number.isInteger(rhythm.bpm)||rhythm.bpm<60||rhythm.bpm>200||!Number.isInteger(rhythm.offsetFrame)||rhythm.offsetFrame<0||rhythm.offsetFrame>fps||input.audio?.mode!=="original-synth"))stop("Beat-led contract requires fixed grid and original sound plan");
 if(mode==="cinematic"&&(rhythm.bpm!==undefined||rhythm.offsetFrame!==undefined||input.audio?.mode!=="silent"))stop("Cinematic plan must not inherit a mandatory music beat");
 const shots=input.shots;
 if(!Array.isArray(shots)||shots.length<2||shots.length>10)stop("2–10 distinct shots required");
 let prev=null;const used=new Set(),result=[];
 for(const s of shots){
  if(!id(s.id)||used.has(s.id))stop("Unique shot id required");
  used.add(s.id);
  if(!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<0||s.end>frames||s.end-s.start<Math.round(fps*.55))stop("Invalid shot timing");
  if((!prev&&s.start!==0)||(prev&&s.start!==prev.end))stop("Timeline gap/overlap");
  required(s.intent,"Shot narrative intent");
  if(!id(s.heroId)||!sceneKinds.has(s.technique)||!cameraKinds.has(s.camera?.move))stop("Hero, technique and purposeful camera required");
  required(s.camera.why,"Camera purpose");
  if(!transitionKinds.has(s.bridge?.kind))stop("Invalid transition logic");
  if(!prev&&s.bridge.kind!=="establish")stop("Opening must establish one object");
  if(prev){
   if(s.bridge.kind==="establish")stop("An unrelated new opening cannot occur mid-film");
   required(s.bridge.why,"Transition reason");
   if(s.bridge.kind!=="motivated-cut"&&s.bridge.from!==prev.heroId)stop("Lost persistent object identity");
   if(s.bridge.kind==="carry"&&s.heroId!==prev.heroId)stop("Carry cannot silently replace subject");
  }
  if(!Array.isArray(s.actions)||!s.actions.length||s.actions.length>12)stop("Specific motivated actions required");
  for(const a of s.actions){
   if(!actionKinds.has(a.kind)||!Number.isInteger(a.start)||!Number.isInteger(a.end)||a.start<s.start||a.end>s.end||a.start>=a.end)stop("Invalid action");
   required(a.why,"Animation purpose");
   if(mode==="beat-led"&&a.accent){
    const period=fps*60/rhythm.bpm,nearest=rhythm.offsetFrame+Math.round((a.start-rhythm.offsetFrame)/period)*period;
    if(Math.abs(a.start-nearest)>Math.max(2,Math.round(fps*.075)))stop("Accented action off the authored beat");
   }
  }
  for(let f=s.start;f<s.end;f++){
   const focal=s.actions.filter(a=>a.focal&&a.start<=f&&f<a.end).length;
   if(focal>2)stop("Too many simultaneous focal motions at "+f);
  }
  for(const read of s.readings||[]){
   if(!Number.isInteger(read.start)||!Number.isInteger(read.end)||read.start<s.start||read.end>s.end||read.end-read.start<Math.ceil(fps*(mode==="beat-led"?.33:.65)))stop("Insufficient text reading hold");
   required(read.text,"Visible text");
  }
  result.push({id:s.id,start:s.start,end:s.end,heroId:s.heroId,technique:s.technique,transition:s.bridge.kind,camera:s.camera.move,actions:s.actions.length});
  prev=s;
 }
 if(prev.end!==frames)stop("Incomplete storyboard");
 if(!used.has(input.signature?.shotId))stop("Signature shot missing");
 required(input.signature.why,"Signature shot purpose");
 if(!shots.find(s=>s.id===input.signature.shotId).actions.some(a=>a.focal))stop("Signature scene lacks foreground action");
 return Object.freeze({pass:true,filmId:input.id,seconds:frames/fps,fps,mode,signatureShot:input.signature.shotId,shots:result,quality:"PENDING_HUMAN",techOnly:true,
  limitations:"Storyboard/timing invariants only; not generated art, real visual QA, audio synchronization, media rights or production engine adoption."});
}
