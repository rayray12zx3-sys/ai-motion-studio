import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import theatre from '@theatre/core';
const {getProject,types}=theatre;
const state=JSON.parse(readFileSync(new URL('../fixtures/project-state.json',import.meta.url)));
test('Theatre Core consumes keyframed state with deterministic random-access seeks in Node',async()=>{
  const project=getProject('Motion Studio M10 Node',{state});
  const sheet=project.sheet('Canvas');
  const obj=sheet.object('Practice Card',{
    x:types.number(0,{range:[-200,200]}),
    opacity:types.number(1,{range:[0,1]}),
    rotation:types.number(0,{range:[-180,180]}),
    scale:types.number(1,{range:[0.5,2]})
  });
  await project.ready;
  const sample=frame=>{
    sheet.sequence.position=frame/30;
    const v=obj.value;
    return {x:v.x,opacity:v.opacity,rotation:v.rotation,scale:v.scale};
  };
  const frames=[0,15,30,45,60,75,90];
  const expected=frames.map(sample);
  assert.notEqual(expected[0].x,expected[2].x);
  assert.notEqual(expected[0].opacity,expected[2].opacity);
  for(const frame of frames.slice().reverse())sample(frame);
  frames.forEach((frame,i)=>assert.deepEqual(sample(frame),expected[i]));
  assert.equal(sample(90).opacity,0);
});
