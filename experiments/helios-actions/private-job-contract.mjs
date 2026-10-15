// Trusted executor contract. No network access, no secrets, no user data in public dispatch.
export const APPROVED_EFFECTS=Object.freeze(['K01','K03','K04','K05','K06','K07','K09','K10','K13','K19']);
export const STATES=Object.freeze(['QUEUED','RUNNING','TECH_QA_PASS_ART_PENDING','ART_APPROVED','FAILED']);
const JOB_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const exactKeys=(o,keys)=>{
  if(!o || typeof o!=='object'||Array.isArray(o))return false;
  return Object.keys(o).length===keys.length && keys.every(k=>Object.prototype.hasOwnProperty.call(o,k));
};
const invalid=()=>{throw new Error('Invalid job contract. No private fields or values are logged.');};
export function parsePublicDispatch(input){
  if(!exactKeys(input,['job_id'])||typeof input.job_id!=='string'||!JOB_ID.test(input.job_id))invalid();
  return Object.freeze({job_id:input.job_id});
}
export function parsePrivateJob(input,dispatch){
  const {job_id}=parsePublicDispatch(dispatch);
  const keys=['schema','job_id','effect_id','text','resolution','fps','duration_seconds'];
  if(!exactKeys(input,keys)||input.schema!==1||input.job_id!==job_id)invalid();
  if(!APPROVED_EFFECTS.includes(input.effect_id))invalid();
  // The user text is data only. It must be applied via textContent, never innerHTML/eval.
  if(typeof input.text!=='string'||input.text.length<1||input.text.length>72||/[\u0000-\u001f\u007f]/u.test(input.text))invalid();
  if(!['1280x720','1920x1080','1080x1920'].includes(input.resolution))invalid();
  if(![24,25,30].includes(input.fps)||typeof input.duration_seconds!=='number'||input.duration_seconds<.6||input.duration_seconds>8)invalid();
  return Object.freeze({...input});
}
export function publicSafeJobStatus(privateJob,phase,files=[]){
  if(!JOB_ID.test(privateJob.job_id)||!STATES.includes(phase)||!Array.isArray(files)||files.length>10)invalid();
  if(!files.every(f=>typeof f==='string'&&/^[a-f0-9]{64}$/.test(f)))invalid();
  // Deliberately does not copy text, source identifiers, private file URLs or names.
  return Object.freeze({job_id:privateJob.job_id,phase,sha256:files.slice()});
}
