#!/usr/bin/env node
/** New visual-production renderer policy. Existing approved/history and read-only QA unaffected. */
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const APPROVED_DEFAULT='canvas-js+ffmpeg';
const OPTIONAL=['threejs+webgl','hyperframes+threejs','svg-js+ffmpeg'];
const FORBIDDEN=/\b(?:import\s+PIL|from\s+PIL\s+import|Pillow|pil\.Image)\b/i;
function fail(code,subject=''){throw new Error(code+(subject?': '+subject:''))}
function checkedFile(root,relative){
 if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||relative.split(/[\\/]/).includes('..'))fail('UNSAFE_SOURCE_PATH',String(relative));
 const p=path.join(root,relative);if(!fs.existsSync(p))fail('SOURCE_MISSING',relative);return p;
}
export function validateManifest(m,root=process.cwd()){
 if(!m||m.kind!=='new-animation-visual-production')fail('NOT_A_PRODUCTION_RENDER_MANIFEST');
 if(!m.requested_engine||!m.actual_engine)fail('ENGINE_UNDECLARED');
 if(m.requested_engine!==m.actual_engine)fail('SILENT_RENDERER_DOWNGRADE_FORBIDDEN');
 if(m.actual_engine!==APPROVED_DEFAULT){
  if(!OPTIONAL.includes(m.actual_engine))fail('RENDERER_NOT_APPROVED',m.actual_engine);
  if(m.engine_authorization!=='explicit-task-only'||typeof m.authorization_evidence!=='string'||m.authorization_evidence.trim().length<8)
   fail('NONDEFAULT_ENGINE_AUTH_REQUIRED');
 }
 if(!Array.isArray(m.sources)||m.sources.length===0)fail('NO_VISUAL_SOURCES_DECLARED');
 if(!m.sources.some(s=>s?.role==='visual'))fail('NO_VISUAL_SOURCE');
 for(const s of m.sources){
  if(!['visual','qa'].includes(s?.role))fail('SOURCE_ROLE_INVALID',String(s?.path));
  const p=checkedFile(root,s.path),code=fs.readFileSync(p,'utf8');
  if(s.role==='visual'&&(p.endsWith('.py')||FORBIDDEN.test(code)))fail('PYTHON_PILLOW_VISUAL_FORBIDDEN',s.path);
 }
 if(m.status==='release'){
  if(!m.runtime_receipt||!m.verified_renderer||m.verified_renderer!==m.actual_engine)fail('ENGINE_RUNTIME_PROOF_REQUIRED');
  checkedFile(root,m.runtime_receipt);
 }
 return {status:'PASS',actual_engine:m.actual_engine,production_visual_sources:m.sources.filter(s=>s.role==='visual').length};
}
const productionSource=p=>/^(?:src\/|experiments\/|animations\/|scenes\/|scripts\/render)/.test(p);
export function changedSourceViolations(paths){
 const violations=[];
 for(const raw of paths){
  const p=raw.trim().replaceAll('\\','/');if(!p||!productionSource(p)||!/\.py$/i.test(p))continue;
  const pathParts=p.toLowerCase().split('/');
  if(pathParts.includes('qa')||pathParts.includes('tests')||pathParts.includes('verification'))continue;
  const filename=pathParts.at(-1);
  if(/(?:render|animation|animate|motion|scene|composite)/.test(filename)||pathParts.some(seg=>/^(?:scenes|animations|renderers|visual)$/.test(seg)))
   violations.push(p+': NEW_OR_MODIFIED_PYTHON_VISUAL_RENDER_FORBIDDEN');
 }
 return violations;
}
function main(){
 const args=process.argv.slice(2),n=args.indexOf('--manifest');
 if(n!==-1){if(!args[n+1])fail('MANIFEST_PATH_REQUIRED');const file=path.resolve(args[n+1]);console.log(JSON.stringify(validateManifest(JSON.parse(fs.readFileSync(file,'utf8')),path.dirname(file))));return;}
 if(args.includes('--changed-list-stdin')){
  const input=fs.readFileSync(0,'utf8').split(/\r?\n/),v=changedSourceViolations(input);
  if(v.length)fail('VISUAL_RENDER_SOURCE_POLICY',v.join('; '));console.log('RENDERER_POLICY_CHANGED_FILES_PASS');return;
 }
 fail('USAGE','--manifest file.json | --changed-list-stdin');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{main()}catch(e){console.error(e.message);process.exitCode=2}}
