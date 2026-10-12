import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLayerOrder,LAYER_ORDER,createMotionEngine} from '../src/scene-engine.mjs';

test('layer contract requires increasing paint order',()=>{
  const make=(ids)=>({querySelectorAll:()=>ids.map(n=>({id:String(n),getAttribute:()=>String(n)}))});
  assert.equal(validateLayerOrder(make([0,20,30,100])).length,4);
  assert.throws(()=>validateLayerOrder(make([0,30,20])),/paint order/);
  assert.equal(LAYER_ORDER.at(-1),'fixed-hud');
});

test('actual GSAP and all three plugins required',()=>{
  assert.throws(()=>createMotionEngine({gsap:{},MorphSVGPlugin:{},DrawSVGPlugin:{},MotionPathPlugin:{}}),/Actual GSAP/);
  assert.throws(()=>createMotionEngine({gsap:{timeline(){}},MorphSVGPlugin:null,DrawSVGPlugin:{},MotionPathPlugin:{}}),/Missing licensed/);
});
