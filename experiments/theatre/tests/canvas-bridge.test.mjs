import test from 'node:test';
import assert from 'node:assert/strict';
import {createKeyframedCanvasRenderer} from '../src/canvas-renderer.mjs';
test('actual Theatre keyframes drive deterministic Canvas PNG in two aspects',async()=>{
  const draw=await createKeyframedCanvasRenderer();
  for(const [width,height] of [[640,360],[360,640]]){
    const p={width,height,fps:30,frames:91};
    const frames=[0,15,30,45,60,75,90];
    const images=frames.map(f=>draw(p,f).toBuffer('image/png'));
    assert.notDeepEqual(images[0],images[2],'Theatre-controlled motion must change pixels');
    for(const f of frames.slice().reverse())draw(p,f);
    frames.forEach((f,i)=>assert.deepEqual(draw(p,f).toBuffer('image/png'),images[i]));
    assert.equal(images[0][0],137);assert.equal(images[0][1],80);
  }
});
