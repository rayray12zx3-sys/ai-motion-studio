import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes} from '../src/semantic-scenes.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
import {scoreCues} from '../scripts/score-cues.mjs';

test('same cue compiler exposes motivated film edits and visible product action for two different briefs',()=>{
 for(const raw of [boardBrief,captionBrief]){
  const plan=compileSemanticScenes(raw),cues=scoreCues(plan);
  assert.deepEqual(cues.map(x=>x.frame),[120,plan.operations[0].gesture.start,
    plan.operations[0].frame,240]);
  assert.equal(cues.filter(x=>x.kind==='transition').length,2);
  assert.equal(cues.filter(x=>x.kind==='interaction').length,1);
  assert.equal(cues.filter(x=>x.kind==='impact').length,1);
  assert.ok(cues.every(x=>x.reason.length>=5&&x.reason.length<=160));
  assert.ok(cues.find(x=>x.kind==='impact').reason.includes('not merely')||
            cues.find(x=>x.kind==='impact').reason.includes('not a generic'));
  assert.equal(plan.music.auditioned,false);
 }
});

test('cue export is deterministic and never permits invented art/music approval',()=>{
 const p=compileSemanticScenes(boardBrief);
 assert.equal(JSON.stringify(scoreCues(p)),JSON.stringify(scoreCues(p)));
 assert.throws(()=>scoreCues(null));
 assert.throws(()=>scoreCues({...p,shots:p.shots.map(s=>({...s,reason:'x'}))}));
 assert.doesNotMatch(JSON.stringify(scoreCues(p)),/ART_PASS|RIGHTS_PASS|AUDITIONED/);
});