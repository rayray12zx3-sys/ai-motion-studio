import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {drawEditableSceneFrame,validateEditableRenderScene} from '../src/free/editable-scene.mjs';
import {drawFrame,profiles} from '../src/free/scene.mjs';
import {paintEditablePreview} from '../experiments/editor-canvas-preview/paint.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {editTimeline} from '../experiments/editor-contract/timeline.mjs';

const fixture=parseEditableScene(readFileSync(new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const pixels=(canvas)=>Buffer.from(canvas.getContext('2d').getImageData(
 0,0,canvas.width,canvas.height).data);
test('approved opt-in renderer validates v1 scene without mutating legacy default or input',()=>{
 const officialBefore=hash(drawFrame(profiles.smoke,12).toBuffer('image/png'));
 const inputBefore=serializeEditableScene(fixture);
 assert.equal(validateEditableRenderScene(fixture),true);
 const rendered=drawEditableSceneFrame(fixture,12);
 assert.deepEqual([rendered.width,rendered.height],[360,640]);
 assert.equal(serializeEditableScene(fixture),inputBefore);
 assert.equal(hash(drawFrame(profiles.smoke,12).toBuffer('image/png')),officialBefore);
});
test('all 30 original synthetic frames exactly equal the prior research Canvas painter, not Konva proxies',()=>{
 for(let i=0;i<fixture.duration_frames;i++){
  const original=pixels(paintEditablePreview(fixture,i));
  const compiled=pixels(drawEditableSceneFrame(fixture,i));
  assert.deepEqual(compiled,original,'S1 Canvas authoritative frame '+i+' diverged');
 }
});
test('four pre-existing scene sizes retain source pixels and deterministic independent frame seeks',()=>{
 for(const [width,height] of [[360,640],[640,360],[1080,1920],[1920,1080]]){
  const scene=structuredClone(fixture);
  scene.canvas={width,height};
  const raw=serializeEditableScene(scene);
  const a=pixels(drawEditableSceneFrame(scene,12));
  assert.equal(a.length,width*height*4);
  const b=pixels(drawEditableSceneFrame(scene,29));
  const reopened=pixels(drawEditableSceneFrame(parseEditableScene(raw),12));
  assert.deepEqual(a,reopened,'Scene must survive serializing in '+width+'x'+height);
  assert.notEqual(hash(a),hash(b),'Frame 12 and frame 29 should differ in '+width+'x'+height);
  assert.equal(serializeEditableScene(scene),raw);
 }
});
test('exact S1 timing/position/easing edits affect rendered pixels and remain repeatable',()=>{
 const before=pixels(drawEditableSceneFrame(fixture,12));
 let scene=editTimeline(fixture,{type:'set-key',layerId:'headline',frame:25,property:'ease',value:'ease-out-cubic'});
 const eased=pixels(drawEditableSceneFrame(scene,12));
 assert.notDeepEqual(eased,before);
 const displaced=editTimeline(scene,{type:'set-key',layerId:'headline',frame:25,property:'x',value:.9});
 const changed=pixels(drawEditableSceneFrame(displaced,12));
 assert.notDeepEqual(changed,eased);
 assert.deepEqual(pixels(drawEditableSceneFrame(scene,12)),eased);
 assert.deepEqual(pixels(drawEditableSceneFrame(fixture,12)),before);
});
test('transparent mode retains real RGBA and opaque mode guarantees full alpha',()=>{
 const first=pixels(drawEditableSceneFrame(fixture,0,{output:'transparent'}));
 assert.ok(first.every((v,i)=>i%4!==3||v===0),'first alpha must be empty');
 const alpha=pixels(drawEditableSceneFrame(fixture,12,{output:'transparent'}));
 assert.ok(alpha.some((v,i)=>i%4===3&&v>0),'visible alpha layer expected');
 assert.ok(alpha.some((v,i)=>i%4===3&&v===0),'transparent outside stage expected');
 const solid=pixels(drawEditableSceneFrame(fixture,12,{output:'opaque'}));
 assert.ok(solid.every((v,i)=>i%4!==3||v===255),'opaque stage must not lose alpha');
});
test('unknown scene fields, external media, unsupported fonts and output options fail closed',()=>{
 const cases=[
  s=>{s.assets=[{url:'https://external.example/picture.png'}];},
  s=>{s.layers[1].keys[1].ease='custom-bezier';},
  s=>{s.layers[1].text='🎨';},
  s=>{s.unknown='import';},
  s=>{s.canvas.width=1000;}
 ];
 for(const mutate of cases){const scene=structuredClone(fixture);mutate(scene);
  assert.throws(()=>validateEditableRenderScene(scene));
  assert.throws(()=>drawEditableSceneFrame(scene,12));
 }
 assert.throws(()=>drawEditableSceneFrame(fixture,12,{output:'unapproved'}),/Unsupported/);
 assert.throws(()=>drawEditableSceneFrame(fixture,-1),/Out-of-range/);
 assert.throws(()=>drawEditableSceneFrame(fixture,30),/Out-of-range/);
 assert.equal(fixture.layers[1].text,'Original Title');
});

test('approved Windows and Linux export encoder pins exactly match existing verified installer',()=>{
 const installer=readFileSync(new URL('../scripts/setup-encoder.mjs',import.meta.url),'utf8');
 const exporter=readFileSync(new URL('../scripts/render-editable.mjs',import.meta.url),'utf8');
 for(const target of ['win32-x64','linux-x64']){
  const pattern=new RegExp("'"+target+"'\\s*:\\s*'([0-9a-f]+)'");
  const sourcePin=pattern.exec(installer)?.[1],exportPin=pattern.exec(exporter)?.[1];
  assert.match(sourcePin||'',/^[0-9a-f]{64}$/,'Existing installer SHA-256 for '+target);
  assert.equal(exportPin,sourcePin,'S1 export pin must match existing installer for '+target);
 }
});
