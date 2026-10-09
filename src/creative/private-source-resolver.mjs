// Local-only, read-only private source verifier. Never logs or returns source paths or bytes.
// Rights metadata is still a precheck, NOT final proof of the underlying license.
import {constants,closeSync,fstatSync,lstatSync,openSync,readSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isAbsolute,join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {authorizeCommercialNoCredit} from './asset-authorization.mjs';

const publicRepositoryRoot=realpathSync(fileURLToPath(new URL('../../',import.meta.url)));
const inside=(root,candidate)=>{
  const d=relative(root,candidate);
  return d===''||(!d.startsWith('..'+sep)&&d!=='..'&&!isAbsolute(d));
};
const fail=()=>{throw new Error('Private source verification failed');};

/**
 * Verify a single file against a separate, in-memory private rights catalog.
 *
 * The caller supplies a separately approved absolute root and one POSIX-style
 * relative path. The path and original receipts must NEVER be checked into
 * this public repository, CI artifacts, build reports or issue comments.
 *
 * This preflight returns only a scrubbed ID, SHA and byte length. Caller must
 * still conduct human contract review, and must safely reopen/copy the source
 * in its separate private execution environment before rendering.
 */
export function verifyPrivateLocalAsset({catalog,assetId,on,approvedRoot,relativePath}={}){
  const grant=authorizeCommercialNoCredit(catalog,[assetId],{on});
  if(grant.scope!=='private'||typeof approvedRoot!=='string'||
    !isAbsolute(approvedRoot)||typeof relativePath!=='string'||
    relativePath.length===0||relativePath.length>500||
    relativePath.includes('\\')||relativePath.includes(':')||
    relativePath.includes('\0')||isAbsolute(relativePath))fail();
  const parts=relativePath.split('/');
  if(parts.some(part=>!part||part==='.'||part==='..'||part.length>200))fail();
  let fd;
  try{
    const root=realpathSync(approvedRoot);
    if(!lstatSync(root).isDirectory()||inside(publicRepositoryRoot,root)||
      inside(root,publicRepositoryRoot))fail();
    let name=root;
    for(const part of parts){
      name=join(name,part);
      if(lstatSync(name).isSymbolicLink())fail();
    }
    const file=realpathSync(name);
    if(!inside(root,file)||file===root||inside(publicRepositoryRoot,file))fail();
    const flags=constants.O_RDONLY|(constants.O_NOFOLLOW||0);
    fd=openSync(file,flags);
    const stat=fstatSync(fd);
    if(!stat.isFile()||stat.size===0)fail();
    const hash=createHash('sha256');
    const buf=Buffer.allocUnsafe(1024*1024);
    let length;
    while((length=readSync(fd,buf,0,buf.length,null))>0)hash.update(buf.subarray(0,length));
    const actual=hash.digest('hex');
    if(actual!==grant.assets[0].sha256)fail();
    return Object.freeze({
      status:'PRIVATE_SOURCE_HASH_VERIFIED',
      id:grant.assets[0].id,
      sha256:actual,
      bytes:stat.size,
      requires_human_source_review:true
    });
  }catch(error){
    // Never let filesystem errors disclose company paths in app logs.
    fail();
  }finally{
    if(fd!==undefined)closeSync(fd);
  }
}
