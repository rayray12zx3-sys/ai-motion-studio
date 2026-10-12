import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSpatialGraph,auditFrameRange,auditBeatPlan,multiply,transformPoint,boundsOf} from '../src/spatial-graph.mjs';
import {validateMotionTreatment,compareTreatments} from '../src/coded-motion-director.mjs';
const scene=(more={})=>({width:1080,height:1920,fps:30,frames:180,nodes:[
  {id:'hero',role:'group',x:100,y:200,scaleX:1,scaleY:1,clip:{x:0,y:0,width:800,height:1100}},
  {id:'panel',parent:'hero',role:'surface',x:0,y:0,width:800,height:1100,plane:10,opaque:true},
  {id:'title',parent:'hero',role:'text',x:80,y:40,width:540,height:95,plane:35,protect:true},
  {id:'ring',parent:'hero',role:'art',x:100,y:250,width:300,height:300,plane:20},
  {id:'satellite',parent:'hero',role:'art',x:150,y:290,width:32,height:32,plane:65},
 ],tracks:[{id:'hero',field:'x',keyframes:[{frame:0,value:100},{frame:90,value:220},{frame:179,value:100}]}],...more});
test('parent-child affine transforms are shared across props and deeply nested groups',()=>{
 const g=compileSpatialGraph(scene());const a=g.sample(0);assert.equal(a.states.get('title').world[4],180);assert.equal(a.states.get('title').world[5],240);
 const s=g.sample(90);assert.equal(s.states.get('title').world[4],300);
 assert.equal(s.states.get('satellite').world[4]-s.states.get('ring').world[4],50);
 const p=transformPoint(multiply([0,1,-1,0,100,0],[1,0,0,1,50,0]),0,0);assert.deepEqual(p,{x:100,y:50});
 assert.deepEqual(boundsOf([1,0,0,1,20,30],40,50),{x:20,y:30,width:40,height:50});
});
test('stable scene state independent of requested frame order; keyframes do not consume history',()=>{
 const g=compileSpatialGraph(scene());const one=g.sample(100).states.get('ring');g.sample(12);g.sample(178);const two=g.sample(100).states.get('ring');assert.deepEqual(one,two);
 assert.equal(g.sample(0).issues.length,0);assert.throws(()=>g.sample(180),/outside/);
 assert.equal(g.frames,180);assert.equal(g.nodeCount,5);
});
test('draw stack places satellite above orbit and title above opaque main panel',()=>{
 const g=compileSpatialGraph(scene());const s=g.sample(30);assert.deepEqual(s.display.map(v=>v.id),['panel','ring','title','satellite']);assert.equal(s.issues.length,0);
});
test('unintended overlay over protected text is detected by its geometric overlap',()=>{
 const raw=scene();raw.nodes.push({id:'late-opaque-panel',role:'surface',x:90,y:225,width:650,height:280,plane:75,opaque:true});
 const g=compileSpatialGraph(raw);const a=g.sample(0);assert.ok(a.issues.some(x=>x.kind==='unexpected-occlusion'&&x.id==='title'&&x.by==='late-opaque-panel'));
 assert.ok(auditFrameRange(g,{start:0,end:60,step:15}).issues.length>0);
});
test('partial title clipping is detected, including animated group mask movement',()=>{
 const raw=scene();raw.nodes.find(v=>v.id==='hero').clip={x:0,y:0,width:130,height:100};
 const g=compileSpatialGraph(raw);assert.ok(g.sample(0).issues.some(v=>v.kind==='unexpected-clip'&&v.id==='title'));
 raw.nodes.find(v=>v.id==='title').clipAllowed=true;assert.equal(compileSpatialGraph(raw).sample(0).issues.length,0);
});
test('semantically marked intentional overlay and hidden group opacity are handled',()=>{
 const raw=scene();raw.nodes.push({id:'intentional-lightwipe',role:'surface',x:180,y:240,width:300,height:95,plane:100,opaque:true,intentionalOcclusion:true});
 raw.tracks.push({id:'hero',field:'opacity',keyframes:[{frame:0,value:0},{frame:30,value:1}]});
 const g=compileSpatialGraph(raw);assert.equal(g.sample(0).display.length,1); // lightwipe alone, group descendants hidden
 assert.equal(g.sample(30).issues.length,0);
});
test('camera and parallax are explicit and deterministic, without changing world clipping',()=>{
 const raw=scene({camera:{x:[{frame:0,value:0},{frame:60,value:100}],y:[{frame:0,value:0},{frame:60,value:50}],zoom:[{frame:0,value:1},{frame:60,value:1.4}]}});
 raw.nodes.find(v=>v.id==='satellite').depth=25;
 const g=compileSpatialGraph(raw);const a=g.sample(60);assert.equal(a.viewport.zoom,1.4);assert.notEqual(a.states.get('satellite').viewport[4],a.states.get('satellite').world[4]);
 assert.equal(a.issues.length,0);
});
test('bad ancestry, bad mask, overlapping tracks, invalid keyframes and illegal roles reject early',()=>{
 const duplicate=scene();duplicate.nodes.push({...duplicate.nodes[1]});assert.throws(()=>compileSpatialGraph(duplicate),/Duplicate/);
 const missing=scene();missing.nodes[1].parent='missing';assert.throws(()=>compileSpatialGraph(missing),/Missing parent/);
 const circular=scene();circular.nodes[0].parent='a';circular.nodes.push({id:'a',role:'group',parent:'hero'});assert.throws(()=>compileSpatialGraph(circular),/cycle/);
 const invalid=scene();invalid.nodes[0].clip.width=0;assert.throws(()=>compileSpatialGraph(invalid),/positive/);
 const tracked=scene();tracked.tracks.push({...tracked.tracks[0]});assert.throws(()=>compileSpatialGraph(tracked),/Duplicate track/);
 const badTime=scene();badTime.tracks[0].keyframes[1].frame=181;assert.throws(()=>compileSpatialGraph(badTime),/Bad frame/);
});
test('director flags illegible holds and too many concurrent focal effects',()=>{
 const a=auditBeatPlan({fps:30,frames:180,beats:[
 {id:'title',start:0,end:10,readable:true,focal:true},
 {id:'morph',start:2,end:80,focal:true},
 {id:'camera',start:4,end:80,focal:true}]});
 assert.ok(a.findings.some(f=>f.kind==='short-read'&&f.id==='title'));
 assert.ok(a.findings.some(f=>f.kind==='competing-motion'&&f.frame===4));assert.equal(a.pass,false);
});
test('two distinct brief treatments use a shared motion language without a hardwired visual style',()=>{
 const first={message:'One object becomes a world',fps:30,frames:240,beats:[
 {id:'a',action:'morph',objectId:'core',start:0,end:30,focal:true},
 {id:'b',action:'draw',start:30,end:70,focal:true},
 {id:'c',action:'text',start:70,end:145,readable:true},
 {id:'d',action:'orbit',objectId:'satellite',start:145,end:195,focal:true}
 ]};
 const second={message:'Ideas connect across a city',fps:30,frames:240,beats:[
 {id:'a',action:'camera',start:0,end:36,focal:true},
 {id:'b',action:'draw',start:40,end:70,focal:true},
 {id:'c',action:'text',start:80,end:160,readable:true},
 {id:'d',action:'orbit',objectId:'tram',start:180,end:222,focal:true}
 ]};
 const result=compareTreatments(first,second);assert.equal(result.a.pass,true);assert.equal(result.b.pass,true);
 assert.equal(result.distinctMessage,true);assert.ok(result.sharedActions.includes('draw'));assert.ok(result.secondUniqueActions.includes('camera'));
});
test('rotated parent clip remains polygonal, follows group, and detects a clipped protected title',()=>{
 const base={width:800,height:800,fps:30,frames:120,nodes:[
 {id:'container',role:'group',x:170,y:210,rotation:35,clip:{x:0,y:0,width:300,height:280}},
 {id:'text',role:'text',parent:'container',x:20,y:30,width:190,height:60,protect:true,plane:10},
 {id:'badge',role:'surface',parent:'container',x:90,y:180,width:50,height:45,plane:15}
 ]};
 const first=compileSpatialGraph(base).sample(0);
 assert.equal(first.issues.length,0);
 const poly=first.states.get('text').clipPolygon;
 assert.equal(poly.length,4);
 assert.ok(Math.abs(poly[0].x-poly[1].x)>1&&Math.abs(poly[0].y-poly[1].y)>1);
 base.nodes[1].x=260;
 const second=compileSpatialGraph(base).sample(0);
 assert.ok(second.issues.some(i=>i.kind==='unexpected-clip'&&i.id==='text'));
});
test('two nested rotated clipping parents intersect their polygons, not only bounding rectangles',()=>{
 const base={width:800,height:800,fps:30,frames:120,nodes:[
 {id:'a',role:'group',x:100,y:100,rotation:25,clip:{x:0,y:0,width:250,height:250}},
 {id:'b',role:'group',parent:'a',x:60,y:80,rotation:-30,clip:{x:0,y:0,width:100,height:100}},
 {id:'text',role:'text',parent:'b',x:4,y:4,width:65,height:30,protect:true,plane:10}
 ]};
 const s=compileSpatialGraph(base).sample(0);
 assert.equal(s.issues.length,0);assert.ok(s.states.get('text').clipPolygon.length>=3);
});
