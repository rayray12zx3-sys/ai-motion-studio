import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {selectDirectorTechniques} from './cinetic-techniques.mjs';
import {compileTreatment,writeTreatment} from './cinetic-treatment.mjs';
const planExample=JSON.parse(readFileSync(new URL('./probe.plan.json',import.meta.url),'utf8'));
function fixture(t) {
 const dir=mkdtempSync(join(tmpdir(),'cinetic-brief-picks-'));
 t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const plan=join(dir,'plan.json');
 writeFileSync(plan,JSON.stringify(planExample));
 return {dir,plan,out:join(dir,'new-selection')};
}
test('source-pinned real official picker becomes a readable beat-locked treatment with no fake effect credit',t=>{
 const {plan,out}=fixture(t);
 const selected=selectDirectorTechniques([plan,out,'--seed','123']);
 const receipt=writeTreatment(plan,out);
 const brief=readFileSync(join(out,'BRIEF.md'),'utf8');
 const treatment=readFileSync(join(out,'TREATMENT.md'),'utf8');
 assert.match(brief,/BRIEF:/);
 assert.match(brief,/1280x720/);
 assert.match(treatment,/TREATMENT:/);
 assert.match(treatment,/NOT AUTO APPLIED/);
 assert.match(treatment,/NOT VERIFIED/);
 assert.equal(receipt.status,'DIRECTOR_TREATMENT_GENERATED_NOT_RENDERED');
 assert.equal(receipt.gates.release,'BLOCKED');
 assert.equal(receipt.techniqueIds.length,selected.selectedPicks.length);
 assert.equal(existsSync(join(out,'preview.mp4')),false);
 assert.equal(existsSync(join(out,'overlay-alpha.mov')),false);
});
test('unsafe replay and existing treatment outputs fail closed',t=>{
 const {plan,out}=fixture(t);
 selectDirectorTechniques([plan,out]);
 writeTreatment(plan,out);
 assert.throws(()=>writeTreatment(plan,out),/overwrite/);
});
test('input changed after upstream pick is rejected by original SHA fingerprint',t=>{
 const {plan,out}=fixture(t);
 selectDirectorTechniques([plan,out]);
 const x=JSON.parse(readFileSync(plan,'utf8'));x.brief.title='改動內容';
 writeFileSync(plan,JSON.stringify(x));
 assert.throws(()=>writeTreatment(plan,out),/changed since technique selection/);
 assert.equal(existsSync(join(out,'TREATMENT.md')),false);
});
test('forged picker IDs and provenance cannot appear in director plan',t=>{
 const {plan,out}=fixture(t);
 selectDirectorTechniques([plan,out]);
 const data=JSON.parse(readFileSync(join(out,'director-selection.json'),'utf8'));
 const raw=JSON.parse(readFileSync(plan,'utf8'));
 const wrong=structuredClone(data);wrong.selectedPicks[0].id='forged-upstream-id';
 assert.throws(()=>compileTreatment(raw,wrong),/not found/);
 wrong.selectedPicks[0]=data.selectedPicks[0];wrong.pickerGitBlob='e'.repeat(40);
 assert.throws(()=>compileTreatment(raw,wrong),/provenance/);
});
test('bad private plan or mismatched render dimensions cannot become treatment',t=>{
 const {plan,out}=fixture(t);
 selectDirectorTechniques([plan,out]);
 const raw=JSON.parse(readFileSync(plan,'utf8'));
 const selection=JSON.parse(readFileSync(join(out,'director-selection.json'),'utf8'));
 raw.contentClass='company-private';
 assert.throws(()=>compileTreatment(raw,selection),/synthetic/);
 raw.contentClass='public-synthetic';selection.render.frames+=1;
 assert.throws(()=>compileTreatment(raw,selection),/mismatch/);
});
