/**
 * The model may criticize a candidate; it NEVER clears rights, marketing
 * evidence or professional artistic acceptance. The result is a structured
 * shot-addressable design critique and a blocked/prototype-ready decision.
 */
const fail=m=>{throw Error(m)};
const short=(x,name,max=600)=>typeof x==='string'&&x.trim().length>=8&&x.length<=max?x.trim():fail('Missing or unbounded '+name);
const allowed=new Set(['pacing','readability','causality','object-lineage','composition','motion-grammar','audience-fit','accessibility','fact-evidence','rights','sound-intent']);
const severities=new Set(['minor','major','blocking']);
function unpack(v) {
 if(typeof v==='string'){
  if(v.length>14000)fail('Oversized critique');
  try{v=JSON.parse(v)}catch{fail('Model must provide strict JSON critique')}
 }
 if(!v||typeof v!=='object'||Array.isArray(v))fail('Critique object required');
 return v;
}
export function auditModelCritique({brief,acceptedCandidate,rawCritique}={}){
 if(!acceptedCandidate?.candidate?.treatment?.shots||!brief)fail('Accepted storyboard and source brief required');
 const v=unpack(rawCritique),t=acceptedCandidate.candidate.treatment,shotIds=new Set(t.shots.map(s=>s.id));
 if(v.briefId!==brief.id||v.filmId!==t.id)fail('Critique does not refer to this creative candidate');
 short(v.originalityRisk,'originality diagnosis');
 short(v.storyDiagnosis,'visual narrative diagnosis');
 if(!Array.isArray(v.issues)||v.issues.length>16)fail('Up to sixteen concrete issues');
 const issues=v.issues.map((issue,i)=>{
  if(!issue||!severities.has(issue.severity)||!allowed.has(issue.category))fail('Invalid review severity/category');
  if(issue.shotId!=='whole-film'&&!shotIds.has(issue.shotId))fail('Issue must identify an actual shot or whole film');
  const reason=short(issue.reason,'issue '+i+' reason');
  const proposedFix=short(issue.proposedFix,'issue '+i+' proposed fix');
  return Object.freeze({severity:issue.severity,category:issue.category,shotId:issue.shotId,reason,proposedFix});
 });
 if(!Array.isArray(v.unansweredQuestions)||v.unansweredQuestions.length>12||v.unansweredQuestions.some(x=>typeof x!=='string'||x.length>250))fail('Bounded explicit unknowns required');
 const needingEvidence=(brief.claims||[]).filter(x=>x.status==='needs-evidence').map(x=>x.text);
 const needsRightsReview=true;
 const status=issues.some(i=>['major','blocking'].includes(i.severity))?'REVISE_BEFORE_PROTOTYPE':'STORYBOARD_READY_FOR_INTERNAL_PROTOTYPE';
 return Object.freeze({status,filmId:t.id,issues,questions:[...v.unansweredQuestions],claimEvidence:needingEvidence,
  needsRightsReview,internalUseOnly:true,creativeQuality:'UNVERIFIED',realVideo:'NOT_RENDERED',
  reviewerScope:'MODEL_CRITIQUE_NOT_AESTHETIC_APPROVAL',diagnosis:{originalityRisk:v.originalityRisk,story:v.storyDiagnosis}});
}
export async function critiqueDirectorCandidates({brief,directorResult,completeReview}={}){
 if(!directorResult||directorResult.status!=='CREATIVE_CANDIDATES_READY'||directorResult.briefId!==brief?.id||typeof completeReview!=='function')fail('Validated candidates, same source brief and independent review adapter required');
 const reports=[];
 for(const acceptedCandidate of directorResult.candidates) {
  const treatment=acceptedCandidate.candidate.treatment;
  const prompt='Independently critique this ORIGINAL creative proposal without claiming it has been watched or rendered. '+ 
   'Return STRICT JSON {briefId,filmId,storyDiagnosis,originalityRisk,issues:[{shotId,category,severity,reason,proposedFix}],unansweredQuestions:[...]}. '+
   'Each nonempty problem must identify a genuine shot id, not a vague style adjective. Examine whether visual causality, attention, brand/product message and camera choice are actually motivated; compare against user brief, NOT source reference shots. '+
   'Mark unverified product performance, audio/source-media rights and on-screen claims as unresolved. Do not call a visual or commercial PASS. '+ 
   JSON.stringify({brief,treatment});
  let response;
  try {response=await completeReview(Object.freeze({phase:'independent-critique',briefId:brief.id,filmId:treatment.id,prompt}))}
  catch(e){fail('Independent critique unavailable: '+String(e?.message||e).slice(0,240))}
  reports.push(auditModelCritique({brief,acceptedCandidate,rawCritique:response}));
 }
 return Object.freeze({status:reports.every(x=>x.status==='STORYBOARD_READY_FOR_INTERNAL_PROTOTYPE')?'INTERNAL_STORYBOARD_REVIEWED':'CREATIVE_REVISION_REQUIRED',
  filmReports:Object.freeze(reports),rights:'PENDING',art:'PENDING_HUMAN',movie:'NOT_RENDERED',
  caveat:'A text-only critic is not the real film reviewer and cannot prove motion aesthetics.'});
}
