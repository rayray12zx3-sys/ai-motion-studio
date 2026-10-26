// End-to-end public-original Cinetic director+real-HyperFrames pipeline.
// One explicit authorized command, no hidden installs, no unapproved art promotion.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeDirectorPlan } from './adapter.mjs';
import { fileURLToPath } from 'node:url';
import { SOURCE_IMPLEMENTED_STORYBOARD_TECHNIQUES } from './storyboard-film.mjs';
import { finishStoryboardWithOriginalSound } from './cinetic-soundscape.mjs';
import { parseSelectionArgs, selectDirectorTechniques } from './cinetic-techniques.mjs';
import { writeTreatment } from './cinetic-treatment.mjs';
import { pinnedBinary, run } from './cinetic-flow.mjs';
const sha256=x=>createHash('sha256').update(x).digest('hex');
export function fullOptions(argv) {
  const [plan,root,...args]=argv;
  if(!plan||!root||plan.startsWith('--')||root.startsWith('--'))
    throw Error('Usage: full <public-original-plan.json> <NEW-root> --render --hf /ABS/HF_ENTRY --hf-sha SHA256 [--seed n] [--energy calm|medium|high]');
  const out={plan,root,render:false,hf:null,hash:null,seed:null,energy:'calm'};
  const used=new Set();
  for(let i=0;i<args.length;i++) {
    const flag=args[i];
    if(used.has(flag))throw Error('duplicate option '+flag);
    used.add(flag);
    if(flag==='--render')out.render=true;
    else {
      const val=args[++i];
      if(!val||val.startsWith('--'))throw Error('missing value for '+flag);
      if(flag==='--hf')out.hf=val;
      else if(flag==='--hf-sha')out.hash=val;
      else if(flag==='--seed') {
        if(!/^[0-9]{1,10}$/.test(val))throw Error('invalid seed');
        out.seed=Number(val);
        if(!Number.isSafeInteger(out.seed)||out.seed>2147483647)throw Error('seed out of range');
      }
      else if(flag==='--energy') {
        if(!['calm','medium','high'].includes(val))throw Error('invalid energy');
        out.energy=val;
      } else throw Error('unsupported full option '+flag);
    }
  }
  if(!out.render||!out.hf||!out.hash||!/^[0-9a-f]{64}$/.test(out.hash))
    throw Error('full genuine render requires explicit --render, local --hf, exact --hf-sha');
  return out;
}
export async function fullPipeline(argv) {
  const o=fullOptions(argv);
  const bytes=readFileSync(resolve(o.plan));
  const plan=normalizeDirectorPlan(JSON.parse(bytes.toString('utf8')));
  if(plan.contentClass!=='public-synthetic')throw Error('private content prohibited by public synthetic pipeline');
  const root=resolve(o.root);
  if(existsSync(root))throw Error('refuse overwriting prior full run');
  // Fail closed on executable mismatch BEFORE writing any output.
  pinnedBinary(o.hf,o.hash);
  const seed=o.seed===null?plan.direction.seed:o.seed;
  const picks=join(root,'director'),movie=join(root,'render');
  // Preflight options before creating output.
  parseSelectionArgs([o.plan,picks,'--seed',String(seed),'--energy',o.energy]);
  mkdirSync(root,{recursive:true});
  const selected=selectDirectorTechniques([o.plan,picks,'--energy',o.energy,'--seed',String(seed)]);
  const documentReceipt=writeTreatment(o.plan,picks);
  const rendered=await run([o.plan,movie,'--render','--hf',o.hf,'--hf-sha',o.hash]);
  if(!rendered?.outputs?.mp4 || !rendered.outputs.mov ||
    !String(rendered.technical).includes('MEDIA_QA_PASS'))
    throw Error('genuine HyperFrames result did not pass decoder-based QA');
  // Fail-closed: a selected upstream suggestion never counts as rendered. Only
  // explicitly requested, locally implemented motif-specific recipes are attributed.
  const appliedIds=plan.direction.visualMotif==='storyboard-film'
    ? plan.direction.techniqueIds.filter(id=>SOURCE_IMPLEMENTED_STORYBOARD_TECHNIQUES.includes(id))
    : [];
  const planRecipeEvidence=appliedIds.map(id=>({
    id,scene:'storyboard-film',
    cutFrame:plan.beats[plan.beats.length-1].startFrame,
    implementationFile:'experiments/cinetic-sidecar/storyboard-film.mjs',
    sourceSha256:sha256(readFileSync(fileURLToPath(new URL('./storyboard-film.mjs',import.meta.url)))),
    proof:'SOURCE_APPLIED_AND_GENUINE_MEDIA_QA_PASS__NO_INDEPENDENT_FULL_SPEED_ART_PASS'
  }));
  // Sound is original, deterministic and only for this exact storyboard study.
  // Keep silent transparent overlay independent for Premiere and downstream re-timing.
  const sound=plan.direction.visualMotif==='storyboard-film'&&
    plan.direction.techniqueIds.includes('tr-anchor-overlay-cut')
      ? finishStoryboardWithOriginalSound(movie) : null;
  const receipt={
    status:'CINETIC_SINGLE_COMMAND_TRUE_HF_TECH_PASS',
    sourceClass:'ORIGINAL_PUBLIC_SYNTHETIC_ONLY',
    planSha256:sha256(bytes),
    engine:'hyperframes@0.8.143',
    runtimeEntrypointSha256:o.hash,
    render:plan.render,
    director:{upstreamTechniqueCount:selected.catalogCount,selectedSeed:seed,
      selectedTechniqueIds:selected.selectedPicks.map(x=>x.id),
      implementation:'RECOMMENDED_NOT_AUTO_APPLIED',
      originalPlanRecipeImplementations:planRecipeEvidence,
      treatment:documentReceipt.status},
    media:{mp4:rendered.outputs.mp4,movAlpha:rendered.outputs.mov,
      mp4WithOriginalSound:sound?.muxedMp4Sha256||null},
    gates:{technical:'REAL_RENDER_AND_DECODE_QA_PASS',
      selectedUpstreamRecipesRendered:'NOT_VERIFIED',
      originalPlanRecipesApplied:appliedIds.length?'SOURCE_APPLIED_TECHNICAL_QA_PASS_ART_PENDING':'NO_VERIFIED_SCENE_IMPLEMENTATIONS',
      originalSound:sound?.status||'NOT_CREATED',
      visual:'PENDING_INDEPENDENT_REVIEW',
      art:'PENDING_USER_APPROVAL',
      windowsPremiere:'NOT_TESTED',commercial:'BLOCKED_PENDING_RIGHTS',
      release:'BLOCKED'}
  };
  writeFileSync(join(root,'full-receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  return receipt;
}
