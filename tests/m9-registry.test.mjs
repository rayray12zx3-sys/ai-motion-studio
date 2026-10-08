import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {validateTemplateRegistry,findTemplate,searchTemplates,
  compileRegisteredTemplate} from '../src/creative/template-registry.mjs';
import {verifyNoAttributionCreativeAssets} from '../src/creative/output-rights.mjs';
import {validateAdvancedSpec,loadAdvancedArt,drawAdvancedFrame} from '../src/creative/advanced.mjs';
const load=(uri)=>JSON.parse(readFileSync(new URL(uri,import.meta.url)));
const registry=load('../templates/registry.json');
const base=load('../examples/advanced-film.json');
const studio=load('../examples/brief-studio.json');
const learning=load('../examples/brief-learning.json');
const root=dirname(fileURLToPath(new URL('../examples/advanced-film.json',import.meta.url)));

test('template registry is inspectable, bounded, indexed and has no source-code execution',()=>{
  assert.doesNotThrow(()=>validateTemplateRegistry(registry));
  assert.deepEqual(registry.templates.map(t=>t.id),['studio-identity','learning-journey','hybrid-story']);
  assert.deepEqual(searchTemplates(registry,{category:'education'}).map(t=>t.id),['learning-journey']);
  assert.deepEqual(searchTemplates(registry,{component:'learning-lab'}).map(t=>t.id),
    ['learning-journey','hybrid-story']);
  assert.throws(()=>findTemplate(registry,'../secret'));
  assert.throws(()=>searchTemplates(registry,{component:'remote-video'}));
  const bad=structuredClone(registry);
  bad.templates[2].scene_families[2]='javascript:eval';
  assert.throws(()=>validateTemplateRegistry(bad));
  const badPath=structuredClone(registry);
  badPath.templates[1].example_brief='../private';
  assert.throws(()=>validateTemplateRegistry(badPath));
  const originalComponent=structuredClone(registry);
  originalComponent.components[0].render_path='https://example.org/untrusted.mjs';
  assert.throws(()=>validateTemplateRegistry(originalComponent));
});

test('three templates compose the same renderer, including a truly mixed scene sequence',()=>{
  const before=JSON.stringify(base),snapshot=JSON.stringify(registry);
  const pure=compileRegisteredTemplate(learning,base,registry,'learning-journey');
  const mixed=compileRegisteredTemplate(learning,base,registry,'hybrid-story');
  const classic=compileRegisteredTemplate(studio,base,registry,'studio-identity');
  assert.deepEqual(pure.art_direction.scene_families,['learning-lab','learning-lab','learning-lab','learning-lab']);
  assert.deepEqual(mixed.art_direction.scene_families,['studio','learning-lab','studio','learning-lab']);
  assert.deepEqual(classic.motion.segments,pure.motion.segments);
  assert.deepEqual(mixed.motion.camera,classic.motion.camera);
  assert.deepEqual(mixed.asset_manifest,classic.asset_manifest);
  assert.doesNotThrow(()=>validateAdvancedSpec(mixed));
  assert.equal(JSON.stringify(base),before);
  assert.equal(JSON.stringify(registry),snapshot);
});

test('commercial no-credit asset gate rejects attribution-dependent visual assets',()=>{
  const good=compileRegisteredTemplate(learning,base,registry,'hybrid-story');
  const rights=verifyNoAttributionCreativeAssets(good);
  assert.equal(rights.media_asset_attribution,'NOT_REQUIRED_BY_RECORDED_CC0');
  assert.equal(rights.production_license_clearance,'REQUIRES_HUMAN_REVIEW');
  assert.equal(rights.creative_assets.length,1);
  for(const badLicense of ['CC-BY-4.0','MIT','OFL-1.1','GPL-3.0','CUSTOM','CC-BY-NC']){
    const bad=structuredClone(good);
    bad.asset_manifest.assets[0].license=badLicense;
    assert.throws(()=>verifyNoAttributionCreativeAssets(bad));
  }
  const missingSource=structuredClone(good);
  missingSource.asset_manifest.assets[0].source='';
  assert.throws(()=>verifyNoAttributionCreativeAssets(missingSource));
  const missingHash=structuredClone(good);
  missingHash.asset_manifest.assets[0].sha256='bad';
  assert.throws(()=>verifyNoAttributionCreativeAssets(missingHash));
});

test('hybrid selects per-beat visuals while preserving random-access frames and ending',async()=>{
  const spec=compileRegisteredTemplate(learning,base,registry,'hybrid-story');
  const pure=compileRegisteredTemplate(learning,base,registry,'learning-journey');
  const art=await loadAdvancedArt(spec,root);
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:360};
    for(const frame of [35,135,225,315]){
      const a=drawAdvancedFrame(profile,frame,spec,art).toBuffer('image/png');
      const b=drawAdvancedFrame(profile,frame,pure,art).toBuffer('image/png');
      if([35,225].includes(frame))assert.notDeepEqual(a,b,'Mixed vs learning slot differ');
      else assert.deepEqual(a,b,'Unchanged learning slot remains byte-identical');
      assert.deepEqual(drawAdvancedFrame(profile,frame,spec,art).toBuffer('image/png'),a);
    }
    assert.deepEqual(drawAdvancedFrame(profile,345,spec,art).toBuffer('image/png'),
      drawAdvancedFrame(profile,359,spec,art).toBuffer('image/png'));
  }
});
