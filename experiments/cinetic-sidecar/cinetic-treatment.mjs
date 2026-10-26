// Source-bound director treatment. Upstream metadata are NOT implemented effects.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeDirectorPlan } from './adapter.mjs';
import { loadCineticLibrary, CINETIC_UPSTREAM_SHA, LIBRARY_GIT_BLOB, PICKER_GIT_BLOB } from './cinetic-techniques.mjs';
const sha256=b=>createHash('sha256').update(b).digest('hex');
const md=s=>String(s).replace(/[\r\n\t]+/g,' ').replace(/[\u0000-\u001f]/g,' ').replace(/\|/g,'\\|').trim();
export function compileTreatment(input,selection) {
  const plan=normalizeDirectorPlan(input);
  const library=loadCineticLibrary();
  if(selection?.status!=='CINETIC_UPSTREAM_DIRECTOR_PICKS_PROPOSALS_ONLY' ||
    selection.upstreamCommit!==CINETIC_UPSTREAM_SHA ||
    selection.catalogGitBlob!==LIBRARY_GIT_BLOB ||
    selection.pickerGitBlob!==PICKER_GIT_BLOB ||
    selection.catalogSha256!==library.sha256 ||
    selection.render?.frames!==plan.render.frames ||
    selection.render?.width!==plan.render.width ||
    selection.render?.height!==plan.render.height ||
    selection.render?.fps!==plan.render.fps ||
    !Array.isArray(selection.selectedPicks) ||
    selection.selectedPicks.length<1 || selection.selectedPicks.length>16 ||
    !plan.direction.techniqueIds.every(id=>selection.selectedPicks.some(p=>p.id===id)))
    throw Error('selection provenance/plan mismatch');
  const byId=new Map(library.data.techniques.map(x=>[x.id,x]));
  const seen=new Set();
  const techniques=selection.selectedPicks.map(p=>{
    const x=byId.get(p.id);
    if(!x || seen.has(p.id) || x.name!==p.name || x.role!==p.role || x.category!==p.category)
      throw Error('selected technique was not found in pinned catalog');
    seen.add(p.id);
    return x;
  });
  const seconds=plan.render.frames/plan.render.fps;
  const brief=[
    '# BRIEF: '+md(plan.brief.title),
    '',
    'Original public synthetic film only. Not a company-approved advertisement.',
    '',
    '- Intent: '+md(plan.brief.intent),
    '- Trigger: '+md(plan.brief.trigger),
    '- Physical response: '+md(plan.brief.physicalResponse),
    '- Audience understanding: '+md(plan.brief.audienceUnderstanding),
    '- Output: '+plan.render.width+'x'+plan.render.height+' @ '+plan.render.fps+'fps, '+seconds.toFixed(3)+'s',
    '- Proposed visual language: '+md(plan.direction.visualLanguage),
    '- Scene implementation: '+md(plan.direction.visualMotif),
    '- Upstream selector: '+CINETIC_UPSTREAM_SHA+'; seed '+selection.seed,
    '- Music/SFX: NOT SPECIFIED',
    '- Official brand/CIS: NOT VERIFIED',
    ''
  ].join('\n');
  const rows=plan.beats.map(b=>'| '+md(b.id)+' | '+md(b.kind)+' | '+b.startFrame+'-'+(b.endFrame-1)+
    ' | '+(b.startFrame/plan.render.fps).toFixed(3)+'-'+(b.endFrame/plan.render.fps).toFixed(3)+
    ' | '+md(b.meaning)+' | '+md(b.onScreenText)+' | NOT DONE |');
  const recipes=techniques.map(x=>[
    '### '+md(x.name)+' ('+x.id+')',
    '',
    '- Category / role: '+x.category+' / '+x.role,
    '- Why: '+md(x.summary),
    '- Original upstream build recipe: '+md(x.recipe),
    '- Timing: '+md(x.timing),
    '- Use: '+md(x.use_when),
    '- Avoid: '+md(x.avoid_when),
    '- Implementation in actual rendered scene: NOT VERIFIED, NOT AUTO APPLIED.',
    ''
  ].join('\n')).join('\n');
  const treatment=[
    '# TREATMENT: '+md(plan.brief.title),'',
    '## Causal story','',
    md(plan.brief.trigger)+' -> '+md(plan.brief.physicalResponse)+' -> '+md(plan.brief.audienceUnderstanding),
    '',
    '## Beat-locked picture / copy / sound table','',
    '| Beat | Act | Frames | Seconds | Meaningful motion | Copy | Sound |',
    '| --- | --- | ---: | ---: | --- | --- | --- |',
    ...rows,'',
    '## Authentically selected Cinetic techniques','',
    'These are planning suggestions from the pinned 273-technique catalog. The existing sidecar renderer does not implement these recipes automatically. Every selected move must be implemented and visually audited before it can be called applied.',
    '',recipes,
    '## Release gates','',
    'Director treatment: PREPARED; Upstream picks: VERIFIED; Pick-to-pixel implementation: NOT VERIFIED; True renderer run for this exact treatment: NOT RUN; Art and sound: PENDING; Windows Premiere: NOT TESTED; Final release: BLOCKED.',''
  ].join('\n');
  return {brief,treatment,receipt:{
    status:'DIRECTOR_TREATMENT_GENERATED_NOT_RENDERED',
    catalogCommit:CINETIC_UPSTREAM_SHA,selectionSeed:selection.seed,
    techniqueIds:techniques.map(x=>x.id),
    gates:{techniqueImplementation:'NOT_VERIFIED',video:'NOT_RUN',art:'PENDING',commercial:'BLOCKED',release:'BLOCKED'}
  }};
}
export function writeTreatment(planFile,selectionDir) {
  const path=resolve(planFile),dir=resolve(selectionDir);
  if(!existsSync(dir))throw Error('selection directory missing');
  const bytes=readFileSync(path);
  const selected=JSON.parse(readFileSync(join(dir,'director-selection.json'),'utf8'));
  if(selected.requestedPlanSha256!==sha256(bytes))throw Error('original plan changed since technique selection');
  const result=compileTreatment(JSON.parse(bytes.toString('utf8')),selected);
  for(const n of ['BRIEF.md','TREATMENT.md','treatment-gates.json'])
    if(existsSync(join(dir,n)))throw Error('refusing overwrite');
  writeFileSync(join(dir,'BRIEF.md'),result.brief,{flag:'wx'});
  writeFileSync(join(dir,'TREATMENT.md'),result.treatment,{flag:'wx'});
  writeFileSync(join(dir,'treatment-gates.json'),JSON.stringify(result.receipt,null,2)+'\n',{flag:'wx'});
  return result.receipt;
}
