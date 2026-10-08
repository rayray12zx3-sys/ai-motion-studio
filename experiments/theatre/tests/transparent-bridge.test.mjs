import test from 'node:test';
import assert from 'node:assert/strict';
import {createKeyframedCanvasRenderer} from '../src/canvas-renderer.mjs';

test('Theatre keyframes create actual transparent lower-third overlays',async()=>{
  const draw=await createKeyframedCanvasRenderer({
    background:'transparent',placement:'lower-third'
  });
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:91};
    const frames=[0,15,30,60,90];
    const before=frames.map(f=>draw(profile,f).toBuffer('image/png'));
    assert.notDeepEqual(before[0],before[2]);
    const png=draw(profile,30);
    const pix=png.getContext('2d').getImageData(0,0,width,height).data;
    let top=0,mid=0;
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        const a=pix[(y*width+x)*4+3];
        if(y<height*.42&&a!==0)top++;
        if(y>=height*.5&&a!==0)mid++;
      }
    }
    assert.equal(top,0,'Upper stage must stay transparent for the original plate');
    assert.ok(mid>500,'Theatre-controlled card must render in the bottom region');
    for(const f of frames.slice().reverse())draw(profile,f);
    frames.forEach((f,i)=>assert.deepEqual(
      draw(profile,f).toBuffer('image/png'),before[i]));
  }
});
test('invalid presentation modes fail closed',async()=>{
  await assert.rejects(()=>createKeyframedCanvasRenderer({background:'remote'}));
  await assert.rejects(()=>createKeyframedCanvasRenderer({placement:'escape-safe-area'}));
});
