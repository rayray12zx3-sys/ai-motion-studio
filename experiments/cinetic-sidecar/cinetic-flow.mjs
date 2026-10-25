#!/usr/bin/env node
// One entrypoint over EXISTING Cinetic sidecar adapter, font preparation and actual HyperFrames verifier.
// Synthetic-only R&D; no installations, uploads, PR merges, default-route takeovers or art approvals.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, statSync, realpathSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { doctor, auditExistingVideo } from './cinetic-diagnostics.mjs';

export const PIN = 'hyperframes@0.8.143';
export const GATES = Object.freeze({
  userArt:'PENDING', visualReview:'PENDING', commercial:'BLOCKED',
  premiereWindows:'NOT_TESTED', fullUpstreamSkill:'NOT_INSTALLED', release:'BLOCKED'
});
const sha = file => createHash('sha256').update(readFileSync(file)).digest('hex');
export function options(argv) {
  const [plan, output, ...rest] = argv;
  if (!plan || !output || plan.startsWith('--') || output.startsWith('--')) throw new Error('Usage: <plan.json> <new-output-dir> [--prepare-only | --render --hf /absolute/cli.js --hf-sha SHA256]');
  const opt={plan,output,mode:null,hf:null,hash:null};
  for (let i=0;i<rest.length;i++) {
    const flag=rest[i];
    if (flag==='--prepare-only' || flag==='--render') {
      if(opt.mode)throw new Error('one operation only'); opt.mode=flag.slice(2);
    } else if(flag==='--hf' || flag==='--hf-sha') {
      const key=flag==='--hf'?'hf':'hash';
      if(opt[key]!==null || !rest[i+1] || rest[i+1].startsWith('--'))throw new Error('missing or duplicate argument '+flag);
      opt[key]=rest[++i];
    } else throw new Error('unknown option '+flag);
  }
  if(!opt.mode)throw new Error('explicit --prepare-only or --render required');
  if(opt.mode==='prepare-only' && (opt.hf || opt.hash))throw new Error('render arguments prohibited in preparation');
  if(opt.mode==='render' && (!opt.hf || !/^[0-9a-f]{64}$/.test(opt.hash||'')))throw new Error('render requires --hf and --hf-sha');
  return opt;
}
export function assertSynthetic(plan) {
  if(plan?.schemaVersion!==1 || plan.engine!=='cinetic-hyperframes' || plan.contentClass!=='public-synthetic')
    throw new Error('explicit public-synthetic Cinetic v1 plan required; private company data prohibited');
  if('userArt' in plan || 'approval' in plan || 'privateAssets' in plan)throw new Error('approval/private media overrides forbidden');
  return plan;
}
export function pinnedBinary(path, fingerprint) {
  if(!isAbsolute(path)) throw new Error('HyperFrames executable path must be absolute');
  const real=realpathSync(path);
  if(!statSync(real).isFile() || sha(real)!==fingerprint)throw new Error('HyperFrames executable SHA mismatch');
  return real;
}
export function binaryCommand(bin, args) {
  return /\.(mjs|cjs|js)$/i.test(bin)?[process.execPath,[bin,...args]]:[bin,args];
}
export function execute(bin,args,dir,timeout=600000) {
  const [exe,argv]=binaryCommand(bin,args);
  const r=spawnSync(exe,argv,{cwd:dir,shell:false,encoding:'utf8',timeout,maxBuffer:1<<20,stdio:['ignore','pipe','pipe'],
    env:{...process.env,HYPERFRAMES_NO_TELEMETRY:'1',HYPERFRAMES_SKIP_SKILLS:'1',CI:'true'}});
  if(r.error||r.status!==0)throw new Error('command failed: '+String(r.error||r.stderr).slice(0,400));
  return r.stdout;
}
export async function run(argv) {
  const o=options(argv), input=assertSynthetic(JSON.parse(readFileSync(resolve(o.plan),'utf8')));
  const dir=resolve(o.output);
  if(existsSync(dir))throw new Error('refuse existing output directory or overwrite');
  // Existing strict plan contract validates semantic beats, bounded text, source class, deterministic poses.
  const { normalizeDirectorPlan }=await import('./adapter.mjs');
  const plan=normalizeDirectorPlan(input);
  // Verify CLI BEFORE writing outputs so a mistyped/unauthenticated tool cannot create a job.
  const bin=o.mode==='render'?pinnedBinary(o.hf,o.hash):null;
  // Existing font SHA evidence and source-only storyboard; no new renderer or font fallback.
  const { prepareSyntheticRender }=await import('./prepare-render.mjs');
  const prepared=prepareSyntheticRender(input,dir);
  const base={schema:'cinetic-flow-v0.1',route:'EXPLICIT_PUBLIC_SYNTHETIC_ONLY',
    director:'CINETIC_ADAPTER_NOT_FULL_273_TECHNIQUES',expectedEngine:PIN,
    render:plan.render,source:'ORIGINAL_SYNTHETIC',gates:GATES};
  if(o.mode==='prepare-only') {
    const receipt={...base,technical:'PREPARED_NOT_RENDERED'};
    writeFileSync(join(dir,'flow-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
    return receipt;
  }
  // Exact flags from already-proven public GitHub HyperFrames workflows. No npx, npm, shell or network call by orchestrator.
  execute(bin,['render','-c','index.html','-o','./preview.mp4','--fps',String(plan.render.fps),'--quality','draft'],dir);
  execute(bin,['render','-c','index-alpha.html','-o','./overlay-alpha.mov','--format','mov','--fps',String(plan.render.fps)],dir);
  // Delegate all real video/alpha/font/frame checks to the EXISTING verifier; do not duplicate the S08 QA stack.
  execute(process.execPath,[resolve(new URL('./verify-render.mjs',import.meta.url).pathname),dir],dir,180000);
  const technical=JSON.parse(readFileSync(join(dir,'technical-report.json'),'utf8'));
  if(technical.status!=='SYNTHETIC_RENDER_TECHNICAL_QA_PASS_NOT_ART_APPROVAL')
    throw new Error('existing renderer verifier did not pass');
  const receipt={...base,technical:'LOCAL_PINNED_ENTRYPOINT_MEDIA_QA_PASS_ENGINE_PROVENANCE_REQUIRES_EXTERNAL_AUDIT',
    cli:{sha256:o.hash,packageProvenance:'DECLARED_PINNED_ENTRYPOINT; NPM_TARBALL_NOT_INDEPENDENTLY_REVERIFIED'},
    outputs:{mp4:technical.mp4.sha256,mov:technical.alpha.sha256}};
  writeFileSync(join(dir,'flow-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  return receipt;
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const argv=process.argv.slice(2);
  const operation=argv[0];
  const report=operation==='full' ? import('./cinetic-full.mjs').then(m=>m.fullPipeline(argv.slice(1)))
    : operation==='treat' ? import('./cinetic-treatment.mjs').then(m=>m.writeTreatment(argv[1],argv[2]))
    : operation==='pick' ? import('./cinetic-techniques.mjs').then(m=>m.selectDirectorTechniques(argv.slice(1)))
    : operation==='doctor' ? Promise.resolve(doctor({hf:argv[1]||null,hfSha:argv[2]||null}))
    : operation==='audit-video' ? Promise.resolve(auditExistingVideo(argv[1],{
       width:Number(argv[2]),height:Number(argv[3]),fps:Number(argv[4]),
       frames:Number(argv[5]),sha256:argv[6]}))
    : run(argv);
  report.then(x=>{console.log(JSON.stringify(x,null,2));
    if(x.status==='BLOCKED' || x.status==='READY_TO_ATTEMPT_NOT_RENDERED' || x.status==='VIDEO_BYTES_TECH_PASS_ORIGIN_UNVERIFIED')
      process.exitCode=x.status==='BLOCKED'?2:0;
    if(x.status==='BLOCKED_MISSING_DEPENDENCIES')process.exitCode=2;
  }).catch(e=>{console.error('CINETIC_FLOW_BLOCKED:',e.message);process.exitCode=2;});
}