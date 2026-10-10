import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fitNeutralPreview,neutralPreviewPoint,normalizedPointerDelta} from '../editor/preview-geometry.mjs';
import {parseEditableScene,serializeEditableScene,evaluateEditableFrame} from '../experiments/editor-contract/scene.mjs';

const fixture=parseEditableScene(readFileSync(new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const cases=[
 {source:[360,640],viewport:[360,640],scale:1},
 {source:[640,360],viewport:[360,202.5],scale:0.5625},
 {source:[1080,1920],viewport:[360,640],scale:1/3},
 {source:[1920,1080],viewport:[360,202.5],scale:0.1875}
];

test('all four existing neutral S1 profiles retain exact aspect ratio in the editor viewport',()=>{
 for(const {source,viewport,scale} of cases){
  const copy=structuredClone(fixture);
  copy.canvas.width=source[0];copy.canvas.height=source[1];
  const unchanged=serializeEditableScene(copy);
  const view=fitNeutralPreview(copy.canvas);
  assert.deepEqual([view.sourceWidth,view.sourceHeight],source);
  assert.deepEqual([view.width,view.height],viewport);
  assert.equal(view.scale,scale);
  assert.equal(view.width/view.height,source[0]/source[1]);
  assert.ok(view.width<=360&&view.height<=640);
  assert.equal(serializeEditableScene(copy),unchanged);
  const evaluated=evaluateEditableFrame(copy,12).layers.find(l=>l.id==='headline');
  const point=neutralPreviewPoint(view,evaluated.x,evaluated.y);
  assert.equal(point.x/view.width,evaluated.x);
  assert.equal(point.y/view.height,evaluated.y);
  const d=normalizedPointerDelta(view,view.width*0.125,-view.height*0.25);
  assert.ok(Math.abs(d.x-0.125)<1e-12);
  assert.ok(Math.abs(d.y+0.25)<1e-12);
 }
});

test('invalid/unbounded viewport and coordinates are refused without scene mutation',()=>{
 for(const canvas of [{width:500,height:500},{width:0,height:640},{width:640,height:0},
   {width:640,height:360,assets:[]}, {width:Infinity,height:360},null]){
  if(canvas?.width===640&&canvas?.height===360&&canvas.assets)continue;
  assert.throws(()=>fitNeutralPreview(canvas),/Unsupported/);
 }
 const sample={width:640,height:360};
 for(const bounds of [{maxWidth:0,maxHeight:640},{maxWidth:360,maxHeight:-1},
  {maxWidth:Infinity,maxHeight:640},{maxWidth:360,maxHeight:3000}]){
  assert.throws(()=>fitNeutralPreview(sample,bounds),/Invalid/);
 }
 const view=fitNeutralPreview(sample);
 assert.throws(()=>neutralPreviewPoint(view,NaN,0),/Invalid/);
 assert.throws(()=>normalizedPointerDelta(view,Infinity,0),/Invalid/);
 assert.throws(()=>normalizedPointerDelta({width:0,height:640},1,0),/Invalid/);
 assert.equal(fixture.canvas.width,360);
 assert.equal(fixture.canvas.height,640);
});
