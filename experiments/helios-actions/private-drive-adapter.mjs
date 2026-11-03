// Authenticated-only Google Drive transport. Run in a trusted worker, NEVER as a public artifact.
// No credentials, private text or Drive URLs are ever passed through public dispatch.
import {createHash} from 'node:crypto';
import {parsePublicDispatch,parsePrivateJob} from './private-job-contract.mjs';

const DRIVE='https://www.googleapis.com/drive/v3';
const UPLOAD='https://www.googleapis.com/upload/drive/v3';
const validId=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{15,150}$/.test(s);
const fail=()=>{throw Error('Drive job transport failed; details withheld from public logs.');};
const check=async r=>{if(!r?.ok)fail();return r;};
const digest=(algo,data)=>createHash(algo).update(data).digest('hex');
const formatFor=(effect,name)=>{
  if(name===effect+'-alpha.mov')return {mime:'video/quicktime',limit:536870912};
  if(name===effect+'-preview.mp4')return {mime:'video/mp4',limit:268435456};
  if(name===effect+'-check.png')return {mime:'image/png',limit:33554432};
  if(name==='acceptance.json')return {mime:'application/json',limit:1048576};
  fail();
};
const same=(entry,{name,mime,size,md5,jobId,folder})=>
  validId(entry?.id)&&entry.name===name&&entry.mimeType===mime&&
  Number(entry.size)===size&&entry.md5Checksum===md5&&
  entry.appProperties?.job_id===jobId&&entry.parents?.includes(folder);

export function privateDriveTransport({token,stagingFolderId,outputFolderId,fetchImpl=fetch}){
  if(typeof token!=='string'||token.length<20||!validId(stagingFolderId)||
    !validId(outputFolderId)||typeof fetchImpl!=='function')fail();

  // Always reject redirects: do not rely on a fetch implementation to strip Bearer on redirect.
  const trustedFetch=async(url,options={})=>{
    let u;try{u=new URL(url)}catch{fail()}
    if(u.protocol!=='https:'||u.hostname!=='www.googleapis.com'||u.port||
      !(u.pathname.startsWith('/drive/v3/')||u.pathname.startsWith('/upload/drive/v3/')))fail();
    try{
      const response=await fetchImpl(u.href,{
        ...options,redirect:'error',
        headers:{Authorization:'Bearer '+token,...options.headers}
      });
      return await check(response);
    }catch{fail()}
  };

  return Object.freeze({
    async getJob(dispatchInput){
      const {job_id}=parsePublicDispatch(dispatchInput);
      const name=job_id+'.json';
      const q="'"+stagingFolderId+"' in parents and name='"+name+"' and trashed=false";
      const url=DRIVE+'/files?'+new URLSearchParams({
        q,fields:'files(id,name,mimeType,parents)',pageSize:'2'
      }).toString();
      const listed=await(await trustedFetch(url)).json();
      if(!Array.isArray(listed?.files)||listed.files.length!==1)fail();
      const doc=listed.files[0];
      if(!validId(doc.id)||doc.name!==name||doc.mimeType!=='application/json'||
        !doc.parents?.includes(stagingFolderId))fail();
      const response=await trustedFetch(DRIVE+'/files/'+doc.id+'?alt=media');
      const raw=await response.text();
      if(typeof raw!=='string'||raw.length>16384)fail();
      let job;try{job=JSON.parse(raw)}catch{fail()}
      return parsePrivateJob(job,dispatchInput);
    },

    async putPrivateOutput(job,filename,data,mime){
      // The token never goes to the Chromium rendering process.
      const parsed=parsePrivateJob(job,{job_id:job?.job_id});
      const kind=formatFor(parsed.effect_id,filename);
      if(mime!==undefined&&mime!==kind.mime)fail();
      if(!(data instanceof Uint8Array)||data.byteLength<100||data.byteLength>kind.limit)fail();

      const bytes=data.byteLength,md5=digest('md5',data),sha256=digest('sha256',data);
      const q="'"+outputFolderId+"' in parents and name='"+filename+
        "' and appProperties has { key='job_id' and value='"+parsed.job_id+"' } and trashed=false";
      const findUrl=DRIVE+'/files?'+new URLSearchParams({
        q,fields:'files(id,name,mimeType,size,md5Checksum,appProperties,parents)',pageSize:'2'
      }).toString();
      const found=await(await trustedFetch(findUrl)).json();
      if(!Array.isArray(found?.files)||found.files.length>1)fail();
      if(found.files.length===1){
        if(!same(found.files[0],{name:filename,mime:kind.mime,size:bytes,md5,jobId:parsed.job_id,folder:outputFolderId}))fail();
        return Object.freeze({id:found.files[0].id,sha256,already_existed:true});
      }

      // Job UUID is stored only in the PRIVATE Drive file metadata.
      const head=await trustedFetch(UPLOAD+'/files?uploadType=resumable',{
        method:'POST',
        headers:{
          'Content-Type':'application/json; charset=UTF-8',
          'X-Upload-Content-Type':kind.mime,
          'X-Upload-Content-Length':String(bytes)
        },
        body:JSON.stringify({name:filename,parents:[outputFolderId],
          appProperties:{job_id:parsed.job_id,sha256},
          description:'Private Helios deliverable; art pending'})
      });
      const loc=head.headers?.get('location');
      if(typeof loc!=='string'||!loc.startsWith(UPLOAD+'/'))fail();
      const saved=await(await trustedFetch(loc,{
        method:'PUT',headers:{'Content-Type':kind.mime,'Content-Length':String(bytes)},body:data
      })).json();
      if(!validId(saved?.id))fail();

      // Do not report success unless authenticated Drive readback matches the bytes and job.
      const verifyUrl=DRIVE+'/files/'+saved.id+'?'+new URLSearchParams({
        fields:'id,name,mimeType,size,md5Checksum,appProperties,parents'
      }).toString();
      const verified=await(await trustedFetch(verifyUrl)).json();
      if(!same(verified,{name:filename,mime:kind.mime,size:bytes,md5,jobId:parsed.job_id,folder:outputFolderId})||
        verified.appProperties?.sha256!==sha256)fail();

      return Object.freeze({id:saved.id,sha256,already_existed:false});
    }
  });
}
