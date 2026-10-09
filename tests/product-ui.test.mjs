import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {drawProductUIFrame,validateProductUIScene} from '../src/creative/product-ui.mjs';
import {socialSafeRect,SOCIAL_9_16_SAFE_V1} from '../src/creative/social-safe-area.mjs';

const fixture=JSON.parse(readFileSync(new URL('../examples/product-ui-synthetic.json',import.meta.url)));
test('synthetic scene contract matches generic shot durations and rejects unknown fields',()=>{
  assert.equal(fixture.origin,'SYNTHETIC_CONCEPT_NOT_APP_RECORDING');
  assert.deepEqual(fixture.scenes.map(s=>s.frames),[30,95,107]);
  fixture.scenes.forEach(validateProductUIScene);
  assert.throws(()=>validateProductUIScene({...fixture.scenes[0],source_url:'https://example.invalid'}));
  assert.throws(()=>validateProductUIScene({...fixture.scenes[0],hero:'🙂'}));
  assert.throws(()=>validateProductUIScene({...fixture.scenes[0],mode:'native-app'}));
  assert.throws(()=>validateProductUIScene({...fixture.scenes[0],frames:10000}));
});
test('conservative social safe rectangle accepts 9:16 only',()=>{
  const r=socialSafeRect({width:1080,height:1920});
  assert.deepEqual(r,{x:98,y:279,w:766,h:1248});
  assert.equal(SOCIAL_9_16_SAFE_V1.status,'CONSERVATIVE_PRESET_REQUIRES_PLATFORM_REVIEW');
  assert.throws(()=>socialSafeRect({width:1920,height:1080}));
  assert.throws(()=>socialSafeRect({width:1080,height:1920},{left:0,right:0,top:0,bottom:0}));
});
test('all pixels outside safe region retain zero alpha',()=>{
  for(const [w,h] of [[360,640],[540,960]]){
    const safe=socialSafeRect({width:w,height:h});
    for(const scene of fixture.scenes)for(const f of [0,Math.floor(scene.frames/2),scene.frames-1]){
      const image=drawProductUIFrame({width:w,height:h},f,scene);
      const data=image.getContext('2d').getImageData(0,0,w,h).data;
      let inside=0,outside=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const a=data[(y*w+x)*4+3];
        if(x<safe.x||x>=safe.x+safe.w||y<safe.y||y>=safe.y+safe.h)outside+=a>0?1:0;
        else inside+=a>0?1:0;
      }
      assert.equal(outside,0,'alpha leaks '+scene.mode+' frame '+f);
      assert.ok(inside>400,'missing rendered concept content');
    }
  }
});
test('random access is deterministic and synthetic concept images actually animate',()=>{
  for(const scene of fixture.scenes){
    const p={width:360,height:640};
    const frames=[0,Math.max(1,Math.floor(scene.frames/4)),Math.floor(scene.frames/2),scene.frames-1];
    const digest=f=>createHash('sha256').update(drawProductUIFrame(p,f,scene).toBuffer('image/png')).digest('hex');
    const expected=frames.map(digest);
    assert.ok(new Set(expected).size>1,scene.mode+' rendered no temporal difference');
    for(const f of [...frames].reverse())digest(f);
    assert.deepEqual(frames.map(digest),expected);
    assert.throws(()=>drawProductUIFrame(p,scene.frames,scene));
  }
});
