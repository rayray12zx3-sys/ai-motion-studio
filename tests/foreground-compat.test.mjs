import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {drawFrame,profiles} from '../src/free/scene.mjs';

const digest=canvas=>createHash('sha256').update(
  canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data
).digest('hex');

test('capture stable legacy opaque output fingerprints before adding foreground API',()=>{
  const sample=[['smoke',0],['smoke',6],['smoke',12],['smoke',27],['vertical',42]];
  for(const [key,index] of sample){
    const hash=digest(drawFrame(profiles[key],index));
    assert.match(hash,/^[0-9a-f]{64}$/);
    console.log('OPAQUE_BASELINE_PIXEL_SHA256 '+key+'@'+index+' '+hash);
  }
});
