import {compileMotionBrief} from './brief.mjs';
import {validateAdvancedSpec} from './advanced.mjs';

const exact=(x,keys)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&
  Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
export const SCENE_FAMILIES=Object.freeze(['studio','learning-lab']);
export function validateTemplateRegistry(registry){
  if(!exact(registry,['schema_version','engine','components','templates'])||
    registry.schema_version!==1||registry.engine!=='offline-canvas-advanced-v1'||
    !Array.isArray(registry.components)||registry.components.length<2||
    registry.components.length>40||!Array.isArray(registry.templates)||
    registry.templates.length<2||registry.templates.length>80)
    throw new Error('Invalid template registry');
  const ids=new Set();
  for(const c of registry.components){
    if(!exact(c,['id','category','render_path','license','requires'])||
      typeof c.id!=='string'||!['studio','learning-lab','m6-curtain'].includes(c.id)||
      ids.has(c.id)||!['scene-family','transition'].includes(c.category)||
      typeof c.render_path!=='string'||!/^[a-z/.-]+\.mjs$/.test(c.render_path)||
      c.license!=='PROJECT_ORIGINAL_UNVERIFIED'||!Array.isArray(c.requires)||
      !c.requires.every(x=>typeof x==='string'&&/^[a-z0-9-]+$/.test(x)))
      throw new Error('Invalid or unreviewed component registry entry');
    ids.add(c.id);
  }
  const seen=new Set();
  for(const t of registry.templates){
    if(!exact(t,['id','description','category','style_id','scene_families','example_brief','fps','frames','profiles','components','creative_qc'])||
      typeof t.id!=='string'||!/^[a-z][a-z0-9-]{2,39}$/.test(t.id)||
      seen.has(t.id)||!['brand','education','explainer'].includes(t.category)||
      typeof t.description!=='string'||t.description.length>100||
      !SCENE_FAMILIES.includes(t.style_id)||
      !Array.isArray(t.scene_families)||t.scene_families.length!==4||
      !t.scene_families.every(x=>SCENE_FAMILIES.includes(x)&&ids.has(x))||
      typeof t.example_brief!=='string'||!/^examples\/brief-[a-z0-9-]+\.json$/.test(t.example_brief)||
      t.fps!==30||t.frames!==360||
      !Array.isArray(t.profiles)||t.profiles.join(',')!=='16:9,9:16'||
      !Array.isArray(t.components)||!t.components.every(x=>ids.has(x))||
      !t.components.includes('m6-curtain')||
      t.creative_qc!=='PENDING_HUMAN_REVIEW')
      throw new Error('Invalid, unsafe or unsupported template entry');
    if(!new Set(t.scene_families).size)throw new Error('Missing scene family');
    for(const family of t.scene_families)if(!t.components.includes(family))
      throw new Error('Unregistered scene component');
    seen.add(t.id);
  }
}
export function findTemplate(registry,templateId){
  validateTemplateRegistry(registry);
  const template=registry.templates.find(x=>x.id===templateId);
  if(!template)throw new Error('Unknown template id');
  return structuredClone(template);
}
export function searchTemplates(registry,{category,component}={}){
  validateTemplateRegistry(registry);
  if(category!==undefined&&!['brand','education','explainer'].includes(category))
    throw new Error('Unsupported template category');
  if(component!==undefined&&!registry.components.some(c=>c.id===component))
    throw new Error('Unknown component');
  return registry.templates.filter(t=>(!category||t.category===category)&&
    (!component||t.components.includes(component))).map(t=>structuredClone(t));
}
export function compileRegisteredTemplate(brief,base,registry,templateId){
  const entry=findTemplate(registry,templateId);
  const result=compileMotionBrief(brief,base);
  // No generated code or arbitrary path supplied by the user. A compiled
  // template selects from known scene-renderer components at each beat.
  result.art_direction.scene_families=[...entry.scene_families];
  validateAdvancedSpec(result);
  return result;
}
