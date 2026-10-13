import test from 'node:test';
import assert from 'node:assert/strict';
import {compileSemanticScenes,renderSvgFrame} from '../src/semantic-scenes.mjs';
import {renderWidescreenFrame,WIDESCREEN_PROFILE} from '../src/widescreen-composition.mjs';
import {boardBrief,captionBrief} from '../examples/two-original-briefs.mjs';
import {loadDirectorBrief} from '../scripts/load-director-brief.mjs';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('two different original user briefs reuse unchanged semantic film logic in 16:9',()=>{
 const a=compileSemanticScenes(boardBrief),b=compileSemanticScenes(captionBrief);
 assert.deepEqual(WIDESCREEN_PROFILE,{width:1920,height:1080,fps:30,frames:360});
 const outputs=[];
 for(const p of [a,b]){
   const first=renderWidescreenFrame(p,0);
   assert.match(first,/<svg[^>]*width="1920" height="1080"/);
   assert.match(first,/id="responsive-editorial-panel"/);
   assert.match(first,/id="original-semantic-film"/);
   assert.match(first,/id="persistent-hero"/);
   assert.match(first,/data-stage="SOURCE"/);
   const impact=p.operations[0].frame;
   const before=renderWidescreenFrame(p,impact-1);
   const after=renderWidescreenFrame(p,impact);
   assert.match(after,/data-stage="RESULT"/);
   assert.match(after,new RegExp(p.operations[0].to.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
   assert.notEqual(before,after);
   assert.equal(after,renderWidescreenFrame(p,impact),'No wallclock or nondeterministic seek');
   for(const frame of [0,1,59,119,120,impact,240,359]){
     const wide=renderWidescreenFrame(p,frame);
     const original=renderSvgFrame(p,frame);
     assert.ok(wide.includes(original),'Unmodified portrait film embedded without pixel rewriting');
     assert.match(wide,/PERSISTENT OBJECT/);
     assert.equal(wide.match(/<svg /g)?.length,2);
     assert.ok(!wide.includes('src="https:'));
   }
   outputs.push(renderWidescreenFrame(p,180));
 }
 assert.notEqual(outputs[0],outputs[1],'Differing briefs must have different visuals');
 assert.match(outputs[0],/GIVE IT A DAY/);
 assert.match(outputs[1],/SELECT THE LINE/);
});
test('JSON third brief reuses same renderer, with Unicode and strict escaper',()=>{
 const path=mkdtempSync(join(tmpdir(),'p2-wide-'));
 try{
   const raw=structuredClone(boardBrief);
   raw.id='alternate-storywide';
   raw.shots[1].title='新的編排成果 與原作區分';
   raw.shots[1].subtitle='The user sees a new narrative treatment.';
   raw.entities[0].label='Write & rehearse';
   const file=join(path,'third.json');
   writeFileSync(file,JSON.stringify(raw));
   const p=loadDirectorBrief('--spec',file);
   const wide=renderWidescreenFrame(p,200);
   assert.match(wide,/新的編排成果/);
   assert.match(wide,/Write &amp; rehearse/);
   assert.doesNotMatch(wide,/Write & rehearse/);
 } finally{rmSync(path,{recursive:true,force:true});}
});
test('non-authorized output profiles and seek outside film are rejected',()=>{
 const p=compileSemanticScenes(boardBrief);
 assert.throws(()=>renderWidescreenFrame({...p,profile:{...p.profile,width:1920,height:1080}},0),/review requires/);
 assert.throws(()=>renderWidescreenFrame(p,-1),/seek frame/);
 assert.throws(()=>renderWidescreenFrame(p,360),/seek frame/);
});
