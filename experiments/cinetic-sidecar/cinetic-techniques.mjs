// Safe adapter to the PINNED, MIT-licensed upstream Cinetic technique selector.
// Technique picks are ORIGINAL director proposals; not 273 render implementations.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDirectorPlan } from './adapter.mjs';

export const CINETIC_UPSTREAM_SHA = 'ecfa6605de1adb9345ce937724810dc32267d068';
export const LIBRARY_GIT_BLOB = '37e7b9bd80539285dbd0e0a0af51f9b0c883155c';
export const PICKER_GIT_BLOB = '4340cabb2fedae4513bd7ddff82bdd8db097dbf1';
const libraryFile = fileURLToPath(new URL('./upstream-cinetic/assets/library/techniques.json',import.meta.url));
const pickerFile = fileURLToPath(new URL('./upstream-cinetic/scripts/pick.py',import.meta.url));
const sha256 = x => createHash('sha256').update(x).digest('hex');
export function gitBlobHash(buf) {
  return createHash('sha1').update(Buffer.from('blob ' + buf.length + '\0')).update(buf).digest('hex');
}
function pinnedRead(path, expected) {
  const b=readFileSync(path);
  if (gitBlobHash(b)!==expected) throw Error('untrusted upstream vendored file SHA mismatch');
  return b;
}
export function loadCineticLibrary() {
  const bytes=pinnedRead(libraryFile,LIBRARY_GIT_BLOB);
  pinnedRead(pickerFile,PICKER_GIT_BLOB);
  const data=JSON.parse(bytes.toString('utf8'));
  if (data.version!==1 || !Array.isArray(data.techniques) || data.techniques.length!==273)
    throw Error('unexpected upstream Cinetic technique catalog structure');
  const ids=new Set();
  for (const e of data.techniques) {
    if (!e || typeof e.id!=='string' || !/^[a-z][a-z0-9-]{2,64}$/.test(e.id) ||
        typeof e.recipe!=='string' || !e.recipe.trim() || ids.has(e.id))
      throw Error('invalid upstream technique metadata');
    ids.add(e.id);
  }
  return {data,ids,sha256:sha256(bytes)};
}
export function parseSelectionArgs(argv) {
  const [planFile, outputDir, ...options]=argv;
  if (!planFile || !outputDir || planFile.startsWith('--') || outputDir.startsWith('--'))
    throw Error('Usage: pick <public-synthetic-plan.json> <NEW-output-dir> [--energy calm|medium|high] [--seed integer]');
  let energy='calm', seed=null;
  for (let i=0;i<options.length;i++) {
    if (options[i]==='--energy') {
      if (!options[i+1] || !['calm','medium','high'].includes(options[i+1]))
        throw Error('unsupported energy');
      energy=options[++i];
    } else if (options[i]==='--seed') {
      if (!options[i+1] || !/^[0-9]{1,10}$/.test(options[i+1]))
        throw Error('seed must be unsigned integer');
      seed=Number(options[++i]);
      if (!Number.isSafeInteger(seed) || seed>2147483647) throw Error('seed out of range');
    } else throw Error('unsupported selection option');
  }
  return {planFile,outputDir,energy,seed};
}
export function selectDirectorTechniques(argv) {
  const {planFile,outputDir,energy,seed}=parseSelectionArgs(argv);
  const planPath=resolve(planFile),out=resolve(outputDir);
  if (existsSync(out)) throw Error('refusing to overwrite existing technique directory');
  const raw=readFileSync(planPath);
  const plan=normalizeDirectorPlan(JSON.parse(raw.toString('utf8')));
  if (plan.contentClass!=='public-synthetic') throw Error('private media are prohibited in public selector');
  const lib=loadCineticLibrary();
  for(const id of plan.direction.techniqueIds) {
    if(!lib.ids.has(id)) throw Error('director plan includes nonexistent upstream technique ID: '+id);
  }
  const format=plan.render.height>plan.render.width?'vertical':'feature';
  const effectiveSeed=seed===null?plan.direction.seed:seed;
  const seconds=plan.render.frames/plan.render.fps;
  if (seconds<=0 || seconds>10) throw Error('unsupported director proposal duration');
  mkdirSync(out,{recursive:true});
  const pickedFile=join(out,'upstream-picked.json');
  const args=['-I',pickerFile,'--library',libraryFile,
    '--format',format,'--energy',energy,'--seconds',String(seconds),
    '--seed',String(effectiveSeed),'--json',pickedFile];
  const r=spawnSync('python3',args,{shell:false,encoding:'utf8',timeout:30000,maxBuffer:1048576,
    env:{PATH:process.env.PATH||'/usr/bin:/bin',PYTHONNOUSERSITE:'1',PYTHONDONTWRITEBYTECODE:'1'}});
  if (r.error || r.status!==0) throw Error('pinned upstream technique selector failed: '+String(r.error||r.stderr).slice(0,300));
  if (!existsSync(pickedFile) || statSync(pickedFile).size>100000) throw Error('upstream selector missing or oversized output');
  const selected=JSON.parse(readFileSync(pickedFile,'utf8'));
  if (!Array.isArray(selected.picks) || selected.picks.length<1 || selected.picks.length>16 ||
       selected.seed!==effectiveSeed) throw Error('upstream selector returned invalid result');
  const chosenIds=new Set();
  for (const p of selected.picks) {
    if (!lib.ids.has(p.id) || chosenIds.has(p.id)) throw Error('selector returned invalid/duplicate ID');
    chosenIds.add(p.id);
  }
  // A filmmaker's explicit plan must survive upstream random exploration.
  // Preserve the unmodified original picker result separately as evidence;
  // never relabel manually requested IDs as random upstream choices.
  const requiredIds=new Set(plan.direction.techniqueIds);
  const byId=new Map(lib.data.techniques.map(x=>[x.id,x]));
  const requiredPicks=plan.direction.techniqueIds.map(id=>{
    const x=byId.get(id);
    if(!x.formats.includes('any')&&!x.formats.includes(format))
      throw Error('requested Cinetic technique not suitable for chosen format: '+id);
    return {id:x.id,name:x.name,role:x.role,category:x.category};
  });
  const directedPicks=[...requiredPicks,
    ...selected.picks.filter(p=>!requiredIds.has(p.id))].slice(0,16);
  const report={
    status:'CINETIC_UPSTREAM_DIRECTOR_PICKS_PROPOSALS_ONLY',
    source:'ORIGINAL_PUBLIC_SYNTHETIC_ONLY',
    upstreamCommit:CINETIC_UPSTREAM_SHA,
    catalogGitBlob:LIBRARY_GIT_BLOB,
    pickerGitBlob:PICKER_GIT_BLOB,
    catalogCount:273,
    catalogSha256:lib.sha256,
    requestedPlanSha256:sha256(raw),
    render:plan.render,
    format,energy,seed:effectiveSeed,
    existingPlanTechniqueIds:plan.direction.techniqueIds,
    selectionPolicy:'REQUESTED_PLAN_IDS_FIRST_PLUS_VERIFIED_ORIGINAL_PICKER',
    originalPickerIds:selected.picks.map(p=>p.id),
    selectedPicks:directedPicks,
    techniqueImplementation:'NOT_VERIFIED_AND_NOT_AUTO_APPLIED',
    gates:{art:'PENDING_USER_APPROVAL',independentVisualReview:'PENDING',render:'NOT_RUN',release:'BLOCKED'}
  };
  writeFileSync(join(out,'director-selection.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  return report;
}
