import test from 'node:test';import assert from 'node:assert/strict';
import {detectIsolatedPops} from '../src/frame-continuity.mjs';
test('detects a compositor pop rather than ordinary moving frames',()=>{
 const result=detectIsolatedPops([.88,.90,3.51,.94,.88]);
 assert.equal(result.length,1);assert.equal(result[0].frame,3);
});
test('gradual motion and mild intentional animation do not trigger warnings',()=>{
 assert.deepEqual(detectIsolatedPops([.8,.9,1.15,1.0,.95,.92]),[]);
});
test('invalid film data and negative spikes fail closed',()=>{
 assert.throws(()=>detectIsolatedPops([1,NaN,1]),/Invalid frame difference/);
 assert.throws(()=>detectIsolatedPops([1,-2,1]),/Invalid frame difference/);
});
