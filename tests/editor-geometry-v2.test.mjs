import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fitNeutralPreview} from '../editor/preview-geometry.mjs';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
import {
 validateGeometryV2Scene,evaluateGeometryV2Frame,parseGeometryV2Scene,
 serializeGeometryV2Scene,resizeGeometryV2Rect,editGeometryV2TextLayout
} from '../experiments/editor-geometry-v2/scene.mjs';
import {projectGeometryV2Frame,projectedRectCorners,v2KonvaNodeProps} from '../experiments/editor-geometry-v2/geometry.mjs';
import {drawGeometryV2Frame} from '../experiments/editor-geometry-v2/paint.mjs';
import {drawEditableSceneFrame} from '../src/free/editable-scene.mjs';

const fixture=parseGeometryV2Scene(readFileSync(
 new URL('../experiments/editor-geometry-v2/original-synthetic.json',import.meta.url),'utf8'));
const old=parseEditableScene(readFileSync(
 new URL('../experiments/editor-contract/original-synthetic.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(fixture);
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const frameHash=(canvas)=>hash(Buffer.from(canvas.getContext('2d').getImageData(
 0,0,canvas.width,canvas.height).data));
const alphaAt=(canvas,x,y)=>canvas.getContext('2d').getImageData(x,y,1,1).data[3];
const approx=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,
 'expected '+actual+' to equal '+expected);

test('geometry-v2 fixture validates, roundtrips, and is explicitly incompatible with v1',()=>{
 const input=serializeGeometryV2Scene(fixture),v1=serializeEditableScene(old);
 assert.equal(validateGeometryV2Scene(fixture),true);
 assert.equal(fixture.version,2);
 assert.deepEqual(fixture.assets,[]);
 assert.equal(fixture.duration_frames,60);
 assert.deepEqual(parseGeometryV2Scene(input),fixture);
 assert.equal(serializeGeometryV2Scene(fixture),input);
 assert.throws(()=>parseEditableScene(input),/Invalid scene/);
 assert.throws(()=>parseGeometryV2Scene(v1),/Not an isolated geometry-v2/);
 assert.deepEqual(evaluateGeometryV2Frame(fixture,30).layers.map(l=>l.id),
  ['panel','accent','headline','caption']);
 assert.throws(()=>evaluateGeometryV2Frame(fixture,60),/Out-of-range/);
});

test('isolated immutable rectangle resize changes explicit dimensions, not S1 source or original scene',()=>{
 const before=serializeGeometryV2Scene(fixture),oldBefore=serializeEditableScene(old);
 const resized=resizeGeometryV2Rect(fixture,'panel',{width:.3,height:.1});
 assert.deepEqual(resized.layers[0].geometry,{width:.3,height:.1});
 assert.deepEqual(fixture.layers[0].geometry,{width:.78,height:.255});
 assert.equal(serializeGeometryV2Scene(fixture),before);
 assert.equal(serializeEditableScene(old),oldBefore);
 assert.throws(()=>resizeGeometryV2Rect(fixture,'headline',{width:.2,height:.1}),/rectangle/);
 assert.throws(()=>resizeGeometryV2Rect(fixture,'panel',{width:0,height:.1}),/width\/height/);
 assert.throws(()=>resizeGeometryV2Rect(fixture,'panel',{width:Infinity,height:.1}),/width\/height/);
 assert.throws(()=>resizeGeometryV2Rect(fixture,'panel',{width:1.7,height:.1}),/width\/height/);
});

test('text layout is explicit, bounded, and immutable (without claiming font pixel parity)',()=>{
 const next=editGeometryV2TextLayout(fixture,'headline',
  {font_size:.073,max_width:.8,align:'right'});
 assert.equal(next.layers[2].geometry.font_size,.073);
 assert.equal(next.layers[2].geometry.align,'right');
 assert.equal(fixture.layers[2].geometry.align,'center');
 const layer=projectGeometryV2Frame(next,30).layers[2];
 const props=v2KonvaNodeProps(layer);
 assert.equal(props.align,'right');
 approx(props.width,360*.8);
 assert.equal(props.wrap,'none');
 assert.throws(()=>editGeometryV2TextLayout(fixture,'panel',
  {font_size:.05,max_width:.8,align:'center'}),/text layer/);
 assert.throws(()=>editGeometryV2TextLayout(fixture,'headline',
  {font_size:.05,max_width:.8,align:'justify'}),/layout/);
});

test('same source/viewport rect geometry and rotation maps exactly for all 4 existing profiles',()=>{
 for(const [width,height] of [[360,640],[640,360],[1080,1920],[1920,1080]]){
  const s=clone();
  s.canvas={width,height};
  for(const key of s.layers[0].keys){key.rotation=Math.PI/6;key.scale=1.2;}
  const source=projectGeometryV2Frame(s,30);
  const viewport=fitNeutralPreview(s.canvas);
  const preview=projectGeometryV2Frame(s,30,{width:viewport.width,height:viewport.height});
  const srcRect=source.layers[0],viewRect=preview.layers[0];
  const expected=projectedRectCorners(srcRect),actual=projectedRectCorners(viewRect);
  approx(viewRect.x,srcRect.x*viewport.scale);
  approx(viewRect.y,srcRect.y*viewport.scale);
  approx(viewRect.width,srcRect.width*viewport.scale);
  approx(viewRect.height,srcRect.height*viewport.scale);
  for(let i=0;i<4;i++){
   approx(actual[i].x,expected[i].x*viewport.scale);
   approx(actual[i].y,expected[i].y*viewport.scale);
  }
  const props=v2KonvaNodeProps(viewRect);
  approx(props.width,viewRect.width);
  approx(props.height,viewRect.height);
  approx(props.offsetX,viewRect.width/2);
  approx(props.offsetY,viewRect.height/2);
  approx(props.rotation,30);
  const title=source.layers[2],titlePreview=preview.layers[2];
  approx(titlePreview.fontSize,title.fontSize*viewport.scale);
  approx(titlePreview.width,title.width*viewport.scale);
 }
});

test('native isolated Canvas pixels change with rect width, while background and v1 renderer remain intact',()=>{
 const oldImageBefore=frameHash(drawEditableSceneFrame(old,15));
 const full=drawGeometryV2Frame(fixture,30,{output:'transparent'});
 const smaller=resizeGeometryV2Rect(fixture,'panel',{width:.32,height:.12});
 const small=drawGeometryV2Frame(smaller,30,{output:'transparent'});
 assert.equal(alphaAt(full,65,275),255);
 assert.equal(alphaAt(small,65,275),0);
 assert.equal(alphaAt(full,0,0),0);
 assert.equal(alphaAt(small,0,0),0);
 assert.notEqual(frameHash(full),frameHash(small));
 const opaque=drawGeometryV2Frame(fixture,30);
 assert.equal(alphaAt(opaque,0,0),255);
 assert.equal(frameHash(drawGeometryV2Frame(fixture,30,{output:'transparent'})),frameHash(full));
 assert.equal(frameHash(drawEditableSceneFrame(old,15)),oldImageBefore);
 assert.equal(fixture.layers[0].geometry.width,.78);
});

test('isolated real-frame seek is deterministic and all layer exits fade instead of popping',()=>{
 const samples=[0,9,15,30,45,59];
 const expected=samples.map(f=>frameHash(drawGeometryV2Frame(fixture,f,{output:'transparent'})));
 for(const f of [59,0,45,15,30,9])drawGeometryV2Frame(fixture,f);
 const actual=samples.map(f=>frameHash(drawGeometryV2Frame(fixture,f,{output:'transparent'})));
 assert.deepEqual(actual,expected);
 assert.equal(actual[0],actual.at(-1),'Both endpoints intentionally render fully transparent');
 assert.ok(new Set(actual).size>=4,'Mid-animation frames must vary visibly');
 assert.equal(alphaAt(drawGeometryV2Frame(fixture,0,{output:'transparent'}),180,275),0);
 assert.equal(alphaAt(drawGeometryV2Frame(fixture,59,{output:'transparent'}),180,275),0);
});

test('strict v2 refuses unknown fields, unsupported media, invalid numeric size, keys, and fonts',()=>{
 const mutations=[
 s=>{s.url='https://example.invalid/media';},
 s=>{s.assets=[{source:'external'}];},
 s=>{s.layers[0].geometry.width=NaN;},
 s=>{s.layers[0].geometry.height=0;},
 s=>{s.layers[0].geometry.unknown=5;},
 s=>{s.layers[2].geometry.align='justify';},
 s=>{s.layers[2].geometry.max_width=Infinity;},
 s=>{s.layers[0].keys[1].opacity=2;},
 s=>{s.layers[0].keys[1].ease='bezier';},
 s=>{s.canvas.width=999;}
 ];
 for(const mutate of mutations){
  const s=clone();mutate(s);
  assert.throws(()=>validateGeometryV2Scene(s));
  assert.throws(()=>drawGeometryV2Frame(s,30));
 }
 const emoji=clone();emoji.layers[2].text='🎨';
 assert.throws(()=>drawGeometryV2Frame(emoji,30));
 for(const size of [{width:100,height:100},{width:Infinity,height:640},
  {width:0,height:0}])assert.throws(()=>projectGeometryV2Frame(fixture,30,size));
 assert.throws(()=>projectedRectCorners(null),/Rectangle/);
 assert.throws(()=>v2KonvaNodeProps({type:'invalid'}),/Invalid/);
});
