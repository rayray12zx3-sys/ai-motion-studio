#!/usr/bin/env node
// Explicit LOCAL ONLY original vector advertisement adapter.
// NEVER commit/upload the owner's brief, rights assertion or rendered source.
// This is an optional, separately authorised path; the public Cinetic entry
// continues to reject owner-authored-local materials by default.
import {readFileSync,existsSync,realpathSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {relative,resolve,isAbsolute,sep,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {normalizeDirectorPlan} from './adapter.mjs';
import {pinnedBinary,run} from './cinetic-flow.mjs';
import {exportTransparentPngSequence} from './ad-ready-png.mjs';
const rootOfRepo=fileURLToPath(new URL('../../',import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const REQUIRED_RIGHTS=Object.freeze({
  copy:'owner-original-commercial-authorized',
  artwork:'repo-generated-original-vectors',
  font:'pinned-noto-ofl',
  audio:'none',
  voice:'none',
  photos:'none',
  externalImages:'none',
  footage:'none',
  trademarks:'none',
  paymentRequired:false,
  attributionRequiredInFinishedAd:false,
  operatorAuthorizedCommercialAds:true
});
function isWithinRepo(path){
  const rel=relative(rootOfRepo,path);
  return rel==='' || !(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel));
}
function assertPrivatePath(path,kind){
  if(!isAbsolute(path))throw Error(kind+' must be an absolute local path outside the public repository');
  if(isWithinRepo(resolve(path)))throw Error(kind+' must live outside the public repository');
  return resolve(path);
}
function exactRecord(obj, keys, name){
  if(!obj||typeof obj!=='object'||Array.isArray(obj))
    throw Error(name+' must be an object');
  const actual=Object.keys(obj);
  if(actual.length!==keys.length||actual.some(k=>!keys.includes(k)))
    throw Error(name+' has unapproved or missing rights fields');
}
function checkLocalEnvironment(env){
  if(env.CI==='true'||env.GITHUB_ACTIONS==='true'||env.GITLAB_CI==='true'||
    env.TF_BUILD==='True'||env.TF_BUILD==='true')
    throw Error('owner-authored local ads must not run in public or automated CI');
}
export function parseLocalOptions(argv){
  const [plan,rights,output,...args]=argv;
  if(!plan||!rights||!output)throw Error('Usage: <ABS-private-plan.json> <ABS-rights.json> <ABS-new-output> --hf <ABS-verified-cli> --hf-sha <64hex>');
  if(args.length!==4||args[0]!=='--hf'||args[2]!=='--hf-sha'||
    !isAbsolute(args[1]||'')||!/^[a-f0-9]{64}$/.test(args[3]||''))
    throw Error('explicit --hf ABS_PATH and --hf-sha 64hex are mandatory; no unknown flags');
  return {plan,rights,output,hf:args[1],hfsha:args[3]};
}
export function preflightOwnerLocal(argv,env=process.env){
  checkLocalEnvironment(env);
  const o=parseLocalOptions(argv);
  const source=realpathSync(assertPrivatePath(o.plan,'plan'));
  const rightsPath=realpathSync(assertPrivatePath(o.rights,'rights'));
  if(isWithinRepo(source)||isWithinRepo(rightsPath))
    throw Error('private source is linked inside the public repository');
  const out=assertPrivatePath(o.output,'output');
  if(existsSync(out))throw Error('refuse overwriting existing local ad delivery');
  if(source===out||rightsPath===out)throw Error('source and output paths must be distinct');
  // Exact source and declared rights are read before any workspace is created.
  const sourceBytes=readFileSync(source);
  const p=JSON.parse(sourceBytes.toString('utf8'));
  if(p.contentClass!=='owner-authored-local')
    throw Error('local commercial path requires explicit owner-authored-local input');
  const plan=normalizeDirectorPlan(p,{allowOwnerAuthoredLocal:true});
  if(plan.direction.visualMotif!=='ad-film')
    throw Error('local original ad supports only the audited vector ad-film motion lane');
  const att=JSON.parse(readFileSync(rightsPath,'utf8'));
  exactRecord(att,['schema','planSha256','rights'],'attestation');
  if(att.schema!=='cinetic-owner-original-commercial-v1'||att.planSha256!==hash(sourceBytes))
    throw Error('rights attestation does not bind the exact owner brief SHA256');
  exactRecord(att.rights,Object.keys(REQUIRED_RIGHTS),'rights');
  for(const [k,v] of Object.entries(REQUIRED_RIGHTS))
    if(att.rights[k]!==v)throw Error('missing required zero-fee original-only right: '+k);
  // Reject symlink executables whose real bytes do not match the caller's prior fingerprint.
  // A file's self-computed digest alone is not a publisher provenance certification.
  pinnedBinary(o.hf,o.hfsha);
  return {source,rightsPath,out,plan,sourceSha256:hash(sourceBytes),
    rightsSha256:hash(readFileSync(rightsPath)),hf:o.hf,hfsha:o.hfsha};
}
export async function renderOwnerLocal(argv){
  const ok=preflightOwnerLocal(argv);
  mkdirSync(ok.out,{recursive:false});
  const media=await run([ok.source,join(ok.out,'render'),'--render',
    '--hf',ok.hf,'--hf-sha',ok.hfsha],{allowOwnerAuthoredLocal:true});
  if(!media.outputs?.mov||!media.outputs?.mp4||
     !media.technical.includes('MEDIA_QA_PASS'))
    throw Error('native video and alpha evidence missing');
  const frames=exportTransparentPngSequence(join(ok.out,'render'),
    join(ok.out,'alpha-png'),{allowOwnerAuthoredLocal:true});
  if(frames.frames!==ok.plan.render.frames)
    throw Error('local lossless RGBA sequence incomplete');
  const receipt={
    status:'OWNER_LOCAL_AD_MOTION_AND_TRANSPARENT_SEQUENCE_TECH_PASS',
    origin:'OWNER_ATTESTED_LOCAL_CONTENT_NEVER_SENT_TO_PUBLIC_GITHUB_BY_THIS_CLI',
    attestation:'OWNER_ASSERTION_NOT_INDEPENDENT_COPYRIGHT_CERTIFICATE',
    planSha256:ok.sourceSha256,rightsSha256:ok.rightsSha256,
    render:ok.plan.render,device:ok.plan.direction.adDevice,
    sources:{
      engine:'hyperframes@0.8.143_PIN_REQUIRED',
      font:'local pinned @fontsource/noto-sans-tc OFL',
      visuals:'local original repo vectors only',
      externalMedia:'NONE_ALLOWED',
      music:'NONE'
    },
    outputs:{videoReviewH264Sha256:media.outputs.mp4,
      editorAlphaProResSha256:media.outputs.mov,
      losslessRgbaPngCount:frames.frames,losslessManifestSha256:frames.manifestSha256},
    costAndCredit:{mandatoryRenderSoftwareFee:'NONE_DECLARED_IN_AUDITED_CLI_PATH',
      creditRequiredInAdByUsedOSSAndOriginalElements:false,
      noticeRequiredIfRedistributingCodeOrFont:true},
    gates:{technical:'TRUE_MEDIA_AND_ALPHA_DECODE_PASS',
      ownership:'OWNER_ASSERTED_NOT_INDEPENDENTLY_VERIFIED',
      creative:'PENDING_FULL_SPEED_HUMAN_REVIEW',
      thirdPartyAndBrandRights:'NOT_INCLUDED',
      finalVideoCodecCommercialRights:'REVIEW_PER_TERRITORY_AND_PLATFORM',
      release:'NOT_AUTO_APPROVED'}
  };
  writeFileSync(join(ok.out,'local-delivery-receipt.json'),
    JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  renderOwnerLocal(process.argv.slice(2))
    .then(result=>process.stdout.write(JSON.stringify(result,null,2)+'\n'))
    .catch(e=>{process.stderr.write('LOCAL_OWNER_JOB_REJECTED: '+e.message+'\n');process.exitCode=2;});
