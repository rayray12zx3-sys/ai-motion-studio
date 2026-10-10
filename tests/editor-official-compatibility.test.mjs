import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {drawFrame,profiles,validateSpec} from '../src/free/scene.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {inspectOfficialSceneGap,projectOfficialCopyOnly} from '../experiments/editor-contract/official-compatibility.mjs';

const input=parseEditableScene(readFileSync(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(input);
function twoTextFixture(){
 const s=clone();
 s.layers[1].id='title';
 s.layers[2].id='subtitle';
 s.layers[2].type='text';
 s.layers[2].text='Synthetic Subtitle';
 return s;
}
test('S4 profile audit: matching smoke dimensions and time still cannot imply visual parity',()=>{
 const actual=inspectOfficialSceneGap(input,'smoke');
 assert.deepEqual(actual.target,{width:360,height:640,fps:30,frames:30});
 assert.deepEqual(actual.profile_checks,{dimensions:true,fps:true,duration:true});
 assert.equal(actual.parity_status,'NOT_PROVEN_NO_SHARED_GEOMETRY');
 assert.equal(actual.official_api.arbitrary_object_tracks,false);
 assert.equal(actual.scene_summary.text_layers,1);
 assert.equal(actual.scene_summary.rect_layers,2);
 assert.deepEqual(actual.scene_summary.animated_layer_ids,['accent','card-title','headline']);
 assert.deepEqual(actual.scene_summary.partial_clip_ids,['accent','headline']);
 assert.deepEqual(actual.scene_summary.individual_ease_ids,['card-title']);
 assert.equal(actual.scene_summary.named_official_copy_slots,false);
 assert.ok(actual.mandatory_visual_losses.includes('exact-rendered-pixels'));
 assert.equal(actual.production_renderer_changed,false);
});
test('S4 size/fps/duration contract explicitly refuses accidental delivery-profile promotion',()=>{
 const portrait=inspectOfficialSceneGap(input,'vertical');
 assert.deepEqual(portrait.target,{width:1080,height:1920,fps:30,frames:180});
 assert.deepEqual(portrait.profile_checks,{dimensions:false,fps:true,duration:false});
 const fullSize=clone();fullSize.canvas={width:1080,height:1920};
 const audit=inspectOfficialSceneGap(fullSize,'vertical');
 assert.deepEqual(audit.profile_checks,{dimensions:true,fps:true,duration:false});
 for(const p of ['fake','SMOKE','',null])assert.throws(()=>inspectOfficialSceneGap(input,p),/profile/);
 const landscape=inspectOfficialSceneGap(input,'landscape');
 assert.equal(landscape.profile_checks.dimensions,false);
 assert.equal(landscape.target.width,1920);
});
test('S4 unapproved text-only projection fails closed unless user accepts visual feature loss',()=>{
 const s=twoTextFixture();
 const before=serializeEditableScene(s);
 const audit=inspectOfficialSceneGap(s,'smoke');
 assert.equal(audit.scene_summary.named_official_copy_slots,true);
 assert.throws(()=>projectOfficialCopyOnly(s),/acknowledgement/);
 assert.throws(()=>projectOfficialCopyOnly(s,{acknowledgeVisualLosses:'yes'}),/acknowledgement/);
 const result=projectOfficialCopyOnly(s,{acknowledgeVisualLosses:true});
 assert.equal(result.kind,'COPY_ONLY_RND_NOT_SCENE_CONVERSION');
 assert.deepEqual(result.official_text_candidate,{title:'Original Title',subtitle:'Synthetic Subtitle'});
 assert.doesNotThrow(()=>validateSpec(result.official_text_candidate));
 assert.equal(result.pixel_parity_claim,false);
 assert.equal(result.video_delivery_approved,false);
 assert.ok(result.dropped_scene_features.includes('per-object-keyframe-timing-and-easing'));
 assert.ok(result.dropped_scene_features.includes('rectangles-and-custom-shapes'));
 assert.equal(serializeEditableScene(s),before);
 assert.deepEqual(result,projectOfficialCopyOnly(parseEditableScene(before),{acknowledgeVisualLosses:true}));
});
test('S4 copy-only projection refuses ambiguous/unsupported text, media and foreign fields',()=>{
 assert.throws(()=>projectOfficialCopyOnly(input,{acknowledgeVisualLosses:true}),/Exactly two/);
 const named=twoTextFixture();
 const foreign=structuredClone(named);foreign.assets=[{url:'https://example.invalid/asset'}];
 assert.throws(()=>inspectOfficialSceneGap(foreign,'smoke'),/Media imports/);
 assert.throws(()=>projectOfficialCopyOnly(foreign,{acknowledgeVisualLosses:true}),/Media imports/);
 const unknown=structuredClone(named);unknown.unchecked=true;
 assert.throws(()=>inspectOfficialSceneGap(unknown,'smoke'),/Invalid scene fields/);
 const nonOfficialGlyph=structuredClone(named);nonOfficialGlyph.layers[1].text='😀';
 assert.throws(()=>projectOfficialCopyOnly(nonOfficialGlyph,{acknowledgeVisualLosses:true}),
  /Unsupported glyph|glyph absent/);
 const duplicate=structuredClone(named);duplicate.layers[2].id='title';
 assert.throws(()=>projectOfficialCopyOnly(duplicate,{acknowledgeVisualLosses:true}));
 const extraText=structuredClone(named);extraText.layers[0].type='text';extraText.layers[0].text='extra';
 assert.throws(()=>projectOfficialCopyOnly(extraText,{acknowledgeVisualLosses:true}),/Exactly two/);
});
test('S4 contract audit and copy-only experiment never change approved Canvas smoke pixels',()=>{
 const officialBefore=drawFrame(profiles.smoke,12).toBuffer('image/png');
 const fixture=twoTextFixture();
 for(const p of ['smoke','vertical','landscape'])inspectOfficialSceneGap(fixture,p);
 projectOfficialCopyOnly(fixture,{acknowledgeVisualLosses:true});
 const officialAfter=drawFrame(profiles.smoke,12).toBuffer('image/png');
 assert.deepEqual(officialAfter,officialBefore);
 assert.deepEqual(input.assets,[]);
 assert.equal(input.layers[1].id,'headline');
});
