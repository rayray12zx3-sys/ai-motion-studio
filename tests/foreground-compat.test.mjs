import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {drawFrame,drawForegroundFrame,profiles} from '../src/free/scene.mjs';

const digest=canvas=>createHash('sha256').update(
  canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data
).digest('hex');

// Immutable original values recorded on *unchanged main source* in
// GitHub CI #37958631192 before the foreground API existed.
const ORIGINAL_OPAQUE_PIXELS={
  'smoke@0':'b710f05b298ea62c94445af294e9be1d11471b0121e253bfd97d3c1386e5edd2',
  'smoke@6':'7d59b2d2dd832c65131b9dff4f40c868824ab8a34ecbc8ca8c948a1f97a75ff5',
  'smoke@12':'b3b35a0da7e79d9672b174df51885dc4fb9e426d5d2f4a3f722127b6521363d5',
  'smoke@27':'b141f56c64cda36c590b5b137638364c12a1ddfbd16f1e4dcee8543eb3f2c1e6',
  'vertical@42':'0dd6565b78c581dcfdb6bb17ea9ed0f2e41a42675b014fe617b8ddce9bb2a1ca'
};
test('legacy opaque frame RGBA hashes are byte-exact to pre-change baseline',()=>{
  for(const [key,original] of Object.entries(ORIGINAL_OPAQUE_PIXELS)){
    const [profile,frame]=key.split('@');
    const actual=digest(drawFrame(profiles[profile],Number(frame)));
    assert.equal(actual,original,'Opaque renderer changed RGBA pixels for '+key);
  }
});

test('foreground-only Canvas preserves empty alpha and no opaque background',()=>{
  const {smoke}=profiles;
  const empty=drawForegroundFrame(smoke,0);
  assert.equal(empty.width,smoke.width);
  assert.equal(empty.height,smoke.height);
  const start=empty.getContext('2d').getImageData(0,0,smoke.width,smoke.height).data;
  for(let i=3;i<start.length;i+=4)assert.equal(start[i],0,'Start frame must be all transparent');
  for(const frame of [6,12,27]){
    const canvas=drawForegroundFrame(smoke,frame);
    const data=canvas.getContext('2d').getImageData(0,0,smoke.width,smoke.height).data;
    let visible=0,top=0,unsafe=0;
    for(let y=0;y<smoke.height;y++)for(let x=0;x<smoke.width;x++){
      const alpha=data[(y*smoke.width+x)*4+3];
      if(alpha>8){
        visible++;
        if(y<150||y>=510)top++;
        if(x<12||x>=348||y<150||y>=510)unsafe++;
      }
    }
    assert.ok(visible>150,'No foreground artwork in sample '+frame);
    assert.equal(top,0,'Background/foreground separation failed');
    assert.equal(unsafe,0,'Unexpected foreground outside synthetic diagnostic bounds');
    assert.equal(digest(canvas),digest(drawForegroundFrame(smoke,frame)),
      'Foreground must be seek-deterministic');
  }
});

test('negative input and invalid scenes fail closed for foreground-only API',()=>{
  for(const invalid of [-1,profiles.smoke.frames,1.2]){
    assert.throws(()=>drawForegroundFrame(profiles.smoke,invalid),/Invalid frame/);
  }
  assert.throws(()=>drawForegroundFrame(profiles.smoke,12,{title:'😀',subtitle:'Text'}));
  assert.throws(()=>drawForegroundFrame(profiles.smoke,12,{title:'Text',subtitle:'Text',url:'https://example.invalid'}));
});
