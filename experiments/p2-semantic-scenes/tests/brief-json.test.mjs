import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadDirectorBrief} from '../scripts/load-director-brief.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
import {renderSvgFrame,inspectFrame} from '../src/semantic-scenes.mjs';
import {scoreCues} from '../scripts/score-cues.mjs';

function inDir(run){
 const dir=mkdtempSync(join(tmpdir(),'p2-author-'));
 try{return run(dir);}finally{rmSync(dir,{recursive:true,force:true});}
}
test('JSON original board and caption specs yield identical content/frames/cues to existing JS examples',()=>inDir(dir=>{
 for(const [name,old] of [['board',boardBrief],['caption',captionBrief]]) {
   const file=join(dir,name+'.json');
   writeFileSync(file,JSON.stringify(old),'utf8');
   const fromJson=loadDirectorBrief('--spec',file);
   const prior=loadDirectorBrief(name);
   assert.deepEqual(fromJson,prior);
   for(const frame of [0,25,119,120,168,240,359]) {
     assert.equal(renderSvgFrame(fromJson,frame),renderSvgFrame(prior,frame));
     assert.deepEqual(inspectFrame(fromJson,frame),inspectFrame(prior,frame));
   }
   assert.deepEqual(scoreCues(fromJson),scoreCues(prior));
 }
}));
test('a distinct Creative Director-authored synthetic JSON brief needs NO new renderer code',()=>inDir(dir=>{
 const custom=structuredClone(boardBrief);
 custom.id='synthetic-original-planning-variant';
 custom.entities[0].label='Storyboard the opening';
 custom.shots[0].title='AN IDEA TAKES SHAPE';
 custom.shots[0].subtitle='A fictional note becomes a purposeful scheduled action.';
 custom.operations[0].reason='The actual original action assigns a planned opening to the invented calendar.';
 const file=join(dir,'original.json');writeFileSync(file,JSON.stringify(custom));
 const p=loadDirectorBrief('--spec',file);
 assert.equal(p.id,'synthetic-original-planning-variant');
 assert.match(renderSvgFrame(p,355),/Storyboard the opening/);
 assert.equal(inspectFrame(p,165).state['atlas-card'],'Tuesday / scheduled');
 assert.equal(scoreCues(p).filter(c=>c.kind==='impact').length,1);
}));
test('reject remote, invalid, over-large, unsafe, or unverified JSON film input before rendering',()=>inDir(dir=>{
 for(const [name,change] of [
  ['asset',x=>x.assetPolicy='remote-media'],
  ['url',x=>x.entities[0].label='https://hidden-input.example'],
  ['shape',x=>x.profile.width=1920],
  ['clock',x=>x.music.auditioned=true],
 ]) {
  const x=structuredClone(boardBrief);change(x);
  const target=join(dir,name+'.json');writeFileSync(target,JSON.stringify(x));
  assert.throws(()=>loadDirectorBrief('--spec',target),{name:'Error'});
 }
 const invalid=join(dir,'bad.json');writeFileSync(invalid,'{broken');
 assert.throws(()=>loadDirectorBrief('--spec',invalid),/Invalid local JSON/);
 const huge=join(dir,'too-large.json');writeFileSync(huge,' '.repeat(24001));
 assert.throws(()=>loadDirectorBrief('--spec',huge),/24000 bytes/);
 assert.throws(()=>loadDirectorBrief('--spec','https://media.example/movie.json'));
 assert.throws(()=>loadDirectorBrief('board',invalid));
}));
