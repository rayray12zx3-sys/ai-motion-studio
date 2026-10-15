// Dry-run-tested Drive adapter. NOT ACTIVATED: trusted workflow needs short-lived OAuth.
import {parsePublicDispatch,parsePrivateJob} from './private-job-contract.mjs';
const DRIVE='https://www.googleapis.com/drive/v3',UPLOAD='https://www.googleapis.com/upload/drive/v3';
const validId=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{15,150}$/.test(s);
const fail=()=>{throw new Error('Drive job transport failed; details withheld from public logs.');};
const check=async(response)=>{if(!response?.ok)fail();return response;};
export function privateDriveTransport({token,stagingFolderId,outputFolderId,fetchImpl=fetch}){
 if(typeof token!=='string'||token.length<20||!validId(stagingFolderId)||!validId(outputFolderId)||typeof fetchImpl!=='function')fail();
 const auth={Authorization:'Bearer '+token};
 const trustedFetch=async(url,options={})=>{
  if(!url.startsWith('https://www.googleapis.com/'))fail();
  return check(await fetchImpl(url,{...options,headers:{...auth,...options.headers}}));
 };
 return Object.freeze({
  async getJob(dispatchInput){
   const {job_id}=parsePublicDispatch(dispatchInput);
   const name=job_id+'.json';
   const q="'"+stagingFolderId+"' in parents and name='"+name+"' and trashed=false";
   const url=DRIVE+'/files?'+new URLSearchParams({q,fields:'files(id,name,mimeType,parents)',pageSize:'2'}).toString();
   const listed=await(await trustedFetch(url)).json();
   if(!Array.isArray(listed?.files)||listed.files.length!==1)fail();
   const doc=listed.files[0];
   if(!validId(doc.id)||doc.name!==name||doc.mimeType!=='application/json'||!doc.parents?.includes(stagingFolderId))fail();
   const response=await trustedFetch(DRIVE+'/files/'+doc.id+'?alt=media');
   const raw=await response.text();
   if(raw.length>16384)fail();
   let job;try{job=JSON.parse(raw)}catch{fail()}
   return parsePrivateJob(job,dispatchInput);
  },
  async putPrivateOutput(job,filename,data,mime='video/quicktime'){
   if(!job||typeof job.job_id!=='string')fail();
   parsePublicDispatch({job_id:job.job_id});
   if(typeof filename!=='string'||!/^K(?:01|03|04|05|06|07|09|10|13|19)-alpha\.mov$/.test(filename))fail();
   if(!(data instanceof Uint8Array)||data.byteLength<100||data.byteLength>536870912||mime!=='video/quicktime')fail();
   const head=await trustedFetch(UPLOAD+'/files?uploadType=resumable',{
    method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':mime,'X-Upload-Content-Length':String(data.byteLength)},
    body:JSON.stringify({name:filename,parents:[outputFolderId],description:'Helios private deliverable; art pending'})
   });
   const loc=head.headers.get('location');
   if(!loc || !loc.startsWith(UPLOAD+'/'))fail();
   const done=await trustedFetch(loc,{method:'PUT',headers:{'Content-Type':mime,'Content-Length':String(data.byteLength)},body:data});
   const saved=await done.json();
   if(!validId(saved?.id))fail();
   return Object.freeze({id:saved.id});
  }
 });
}
