import {preflightCreativeTreatment} from './treatment.mjs';

/**
 * Research-only model-adapter boundary. A connected, user-authorized Agent
 * injects `complete(request)`; NO vendor API, network, paid inference, CLI
 * executable template, reference prompts, or generated art is bundled here.
 *
 * Bounded iteration: two distinctly directed proposals; invalid proposals
 * are returned as explicit compiler errors for up to two repair attempts.
 * These outputs remain ART_PENDING and RIGHTS_PENDING until separate gates.
 */
const fail=m=>{throw Error(m)};
const textField=(s,k,max=350)=>typeof s==='string'&&s.trim().length>=5&&s.length<=max?s.trim():fail('Invalid '+k);
const safeId=s=>typeof s==='string'&&/^[a-z][a-z0-9-]{2,63}$/.test(s);
const rhythmModes=new Set(['beat-led','cinematic','unspecified']);
const objectives=new Set(['product-explainer','editorial-motion','spatial-story','brand-identity','concept-film']);
function assertJsonOnly(value,maxBytes=90000){
 if(typeof value==='string'){
  if(value.length>maxBytes)fail('Oversized model response');
  // No markdown fences or executable code; agent must return JSON only.
  if(!/^\s*[\[{]/.test(value))fail('Model adapter must return strict JSON');
  try{value=JSON.parse(value)}catch{fail('Invalid JSON model response')}
 }
 if(!value||typeof value!=='object'||Array.isArray(value))fail('JSON object required');
 const encoded=JSON.stringify(value);
 if(!encoded||encoded.length>maxBytes)fail('Oversized candidate');
 if(/(?:<script\b|javascript:|data:text\/html|https?:\/\/)/i.test(encoded))fail('Executable or remote source in untrusted candidate');
 return value;
}
export function validateDirectorBrief(input){
 if(!input||typeof input!=='object'||Array.isArray(input))fail('Director brief object required');
 if(!safeId(input.id))fail('Invalid brief id');
 if(!objectives.has(input.objective))fail('Unsupported creative objective');
 const goal=textField(input.goal,'goal',1200),audience=textField(input.audience,'audience');
 const message=textField(input.message,'one proven or illustrative message',500);
 if(!input.profile||![input.profile.width,input.profile.height,input.profile.fps,input.profile.frames].every(Number.isInteger)||input.profile.width<320||input.profile.width>4096||input.profile.height<320||input.profile.height>4096||input.profile.fps<24||input.profile.fps>120||input.profile.frames<input.profile.fps*4||input.profile.frames>input.profile.fps*180)fail('Invalid source film profile');
 if(!rhythmModes.has(input.rhythmPreference||'unspecified'))fail('Invalid rhythm preference');
 if(input.assetPolicy!=='original-only')fail('This experiment accepts original-only assets');
 if(!Array.isArray(input.constraints)||input.constraints.length<1||input.constraints.length>12||input.constraints.some(x=>typeof x!=='string'||x.trim().length<5||x.length>180))fail('Bounded creative constraints required');
 if(!Array.isArray(input.claims)||input.claims.length>15||input.claims.some(c=>!c||typeof c.text!=='string'||c.text.length>220||!['illustrative','needs-evidence','verified-by-owner'].includes(c.status)))fail('Every factual claim requires an explicit evidence status');
 if(/https?:\/\/i.test(JSON.stringify(input)))fail('Do not send reference URLs or remote asset pointers to the creative model');
 return Object.freeze({id:input.id,objective:input.objective,goal,audience,message,profile:Object.freeze({...input.profile}),rhythmPreference:input.rhythmPreference||'unspecified',assetPolicy:'original-only',constraints:Object.freeze([...input.constraints]),claims:Object.freeze(input.claims.map(x=>Object.freeze({text:x.text,status:x.status})))});
}
const briefs={
 'continuous-transformation':'Seek a meaningful form/material lineage and product interaction. Do not use another film\'s specific storyboard, image sequence, or palette.',
 'editorial-reveal':'Seek a compelling editorial contrast, cause/effect, or purpose-led camera revelation. Keep interaction or meaningful motivated cuts when suitable.',
 'spatial-story':'Prioritize the communicative purpose of real spatial motion; use 3D only if the meaning requires physically legible space.',
};
const hint=(brief,route,previous='')=>
 'Create ONE ORIGINAL JSON creative proposal, not source code. Brief: '+JSON.stringify(brief)+
 '\nDirection lens: '+briefs[route]+
 '\nReturn an object {briefId,interpretation,designReason,treatment}. treatment MUST satisfy creative-treatment-rnd-v1: profile matches brief exactly, rights.assetPolicy original-only, scene techniques svg-gsap/html-css/threejs, short readable text and contiguous nonempty 2–10 authored shots with motivated bridges; signature references a real shot. Beat-led uses original-synth and integer bpm/offsetFrame, cinematic uses silent and no bpm. Begin with establish, identify preceding hero for every non-cut, and show why every focal action moves. Use bounded named fields, never URLs/HTML/JS/references. Art, rights and output remain unapproved.'+
 (previous?'\nPrevious attempt was rejected; correct these specific errors without discarding the narrative brief: '+previous:'');
function structuralFingerprint(v){
 const t=v.treatment;
 return JSON.stringify({shots:t.shots.length,mode:t.rhythm.mode,steps:t.shots.map(s=>[s.technique,s.camera.move,s.bridge.kind,s.actions.map(a=>a.kind).join('+')])});
}
function isDistinct(a,b){
 if(a.treatment.concept.toLowerCase().replace(/[^a-z0-9]/g,'')===b.treatment.concept.toLowerCase().replace(/[^a-z0-9]/g,''))return false;
 const x=a.treatment.shots,y=b.treatment.shots;
 if(x.length!==y.length||a.treatment.rhythm.mode!==b.treatment.rhythm.mode)return true;
 let diff=0;
 for(let i=0;i<x.length;i++){
  if(x[i].camera.move!==y[i].camera.move)diff++;
  if(x[i].technique!==y[i].technique)diff++;
  if(x[i].bridge.kind!==y[i].bridge.kind)diff++;
  if(x[i].actions.map(q=>q.kind).join()!==y[i].actions.map(q=>q.kind).join())diff++;
 }
 return diff>=2&&structuralFingerprint(a)!==structuralFingerprint(b);
}
function auditCandidate(raw,brief){
 const x=assertJsonOnly(raw);
 if(x.briefId!==brief.id)fail('Candidate does not belong to requested brief');
 textField(x.interpretation,'interpretation',800);
 textField(x.designReason,'original design reason',800);
 if(!x.treatment||x.treatment.profile?.fps!==brief.profile.fps||x.treatment.profile?.frames!==brief.profile.frames||x.treatment.profile?.width!==brief.profile.width||x.treatment.profile?.height!==brief.profile.height)fail('Wrong output profile');
 const checked=preflightCreativeTreatment(x.treatment);
 if(x.treatment.rights.assetPolicy!=='original-only'||checked.quality!=='PENDING_HUMAN')fail('Creative or rights approval cannot be inferred');
 if(brief.rhythmPreference!=='unspecified'&&x.treatment.rhythm.mode!==brief.rhythmPreference)fail('Ignore no requested rhythm preference');
 // Claims in an advertisement must never be promoted to verified by the
 // director: only the owner can provide evidence, and no reference film
 // statistics are inherited as marketing claims.
 return {candidate:x,preflight:checked,rights:brief.claims.some(c=>c.status==='needs-evidence')?'FACT_CLAIMS_PENDING':'ORIGINAL_ONLY_NOT_LEGALLY_CLEARED'};
}
export async function runCreativeDirector({brief,complete,maxRevisions=2}={}){
 const bounded=validateDirectorBrief(brief);
 if(typeof complete!=='function')fail('An authorized model completion adapter is required');
 if(!Number.isInteger(maxRevisions)||maxRevisions<0||maxRevisions>3)fail('Unsafe revision budget');
 const routes=bounded.objective==='spatial-story'?['spatial-story','editorial-reveal']:['continuous-transformation','editorial-reveal'];
 const out=[],attempts=[];
 for(const route of routes){
  let accepted=false,error='';
  for(let k=0;k<=maxRevisions;k++){
   let raw;
   try {
    raw=await complete(Object.freeze({phase:k?'revise':'propose',route,attempt:k,brief:bounded,prompt:hint(bounded,route,error),previousAccepted:Object.freeze(out.map(o=>Object.freeze({concept:o.candidate.treatment.concept,techniques:o.candidate.treatment.shots.map(s=>s.technique)})))}));
    const a=auditCandidate(raw,bounded);
    if(out.length&&!isDistinct(out[0].candidate,a.candidate))fail('Second candidate changes only cosmetic details; invent a different shot, camera, transition or action grammar');
    out.push(Object.freeze({...a,route}));
    attempts.push(Object.freeze({route,attempt:k,result:'ACCEPTED'}));
    accepted=true;
    break;
   }catch(e){error=String(e.message||e).slice(0,420);attempts.push(Object.freeze({route,attempt:k,result:'REJECTED',reason:error}));}
  }
  if(!accepted) return Object.freeze({status:'BLOCKED',briefId:bounded.id,candidates:Object.freeze(out),attempts:Object.freeze(attempts),reason:error,art:'PENDING_HUMAN',modelStatus:'ADAPTER_INJECTED'});
 }
 return Object.freeze({status:'CREATIVE_CANDIDATES_READY',briefId:bounded.id,candidates:Object.freeze(out),attempts:Object.freeze(attempts),art:'PENDING_HUMAN',rights:bounded.claims.some(c=>c.status==='needs-evidence')?'FACT_CLAIMS_PENDING':'RIGHTS_REVIEW_REQUIRED',modelStatus:'ADAPTER_INJECTED',renderStatus:'NOT_RENDERED'});
}
