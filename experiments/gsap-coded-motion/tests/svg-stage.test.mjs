import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSpatialGraph} from '../src/spatial-graph.mjs';
import {createSvgStage} from '../src/svg-stage.mjs';
class Node {
 constructor(id='',doc=null){this.id=id;this.ownerDocument=doc;this.child=[];this.parentNode=null;this.attrs={};this.style={};}
 getAttribute(k){return this.attrs[k]??(k==='data-motion-id'?this.id:null)}
 setAttribute(k,v){this.attrs[k]=String(v)}
 appendChild(n){if(n.parentNode){n.parentNode.child=n.parentNode.child.filter(x=>x!==n)}this.child.push(n);n.parentNode=this;return n;}
 insertBefore(n,b){this.appendChild(n);return n}
 querySelectorAll(s){if(s==='[data-motion-id]')return this.child.filter(n=>n.id);return []}
 querySelector(s){return s==='defs'?this.child.find(n=>n.id==='defs')||null:null}
}
function doc(){const d={createElementNS:(_,name)=>new Node(name,d)};return d}
test('SVG composer physically moves independent painted leaves while mask is in viewport coordinates',()=>{
 const d=doc(),svg=new Node('svg',d),paint=new Node('paint',d);paint.id='';svg.child=[];
 for(const name of ['ground','title','planet'])svg.appendChild(new Node(name,d));
 const graph=compileSpatialGraph({width:800,height:1000,fps:30,frames:60,nodes:[
  {id:'rig',role:'group',x:100,y:200,clip:{x:0,y:0,width:300,height:300}},
  {id:'planet',role:'art',parent:'rig',x:90,y:80,width:120,height:120,plane:20},
  {id:'ground',role:'surface',x:0,y:0,width:500,height:1000,plane:0,opaque:true},
  {id:'title',role:'text',parent:'rig',x:30,y:10,width:230,height:75,plane:50,protect:true}
 ]});
 const stage=createSvgStage({graph,svg,paintLayer:paint});
 const result=stage.renderFrame(0);assert.deepEqual(result.paintIds,['ground','planet','title']);
 assert.deepEqual(paint.child.map(c=>c.attrs['data-motion-wrapper']),['ground','planet','title']);
 const t=paint.child[2];assert.equal(t.child[0].id,'title');assert.equal(t.child[0].getAttribute('transform'),'matrix(1 0 0 1 130 210)');
 assert.equal(t.attrs['clip-path'],'url(#motion-clip-title)');
 assert.equal(stage.renderFrame(17).issues.length,0);
});
