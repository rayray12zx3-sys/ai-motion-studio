import test from 'node:test';
import assert from 'node:assert/strict';
import {threaded,aperture} from '../examples/chat-authored-product-treatments.mjs';
import {syntheticProduct} from '../examples/original-brief-inputs.mjs';
import {preflightCreativeTreatment} from '../src/treatment.mjs';
import {runCreativeDirector} from '../src/agent-director.mjs';
test('two actual GPT-authored synthetic product treatments pass original shot timeline contract',async()=>{
 const a=preflightCreativeTreatment(threaded.treatment),b=preflightCreativeTreatment(aperture.treatment);
 assert.equal(a.pass,true);assert.equal(b.pass,true);
 assert.equal(a.shots.length,4);assert.equal(b.shots.length,5);
 assert.notDeepEqual(a.shots.map(s=>s.camera),b.shots.map(s=>s.camera));
 let n=0;const out=await runCreativeDirector({brief:syntheticProduct,complete:async()=>[threaded,aperture][n++]});
 assert.equal(out.status,'CREATIVE_CANDIDATES_READY');
 assert.equal(out.candidates.length,2);
 assert.equal(out.art,'PENDING_HUMAN');
 assert.equal(out.renderStatus,'NOT_RENDERED');
});
