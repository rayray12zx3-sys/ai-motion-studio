import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync,writeFileSync,readFileSync,existsSync } from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readFileSync as read} from 'node:fs';
import {loadCineticLibrary,selectDirectorTechniques,parseSelectionArgs,gitBlobHash,LIBRARY_GIT_BLOB} from './cinetic-techniques.mjs';

function source() {
  return JSON.parse(read(new URL('./probe.plan.json',import.meta.url),'utf8'));
}
function sandbox(t) {
  const d=mkdtempSync(join(tmpdir(),'cinetic-techniques-'));
  t.after(()=>rmSync(d,{recursive:true,force:true}));
  const plan=join(d,'input.json');
  writeFileSync(plan,JSON.stringify(source()));
  return {dir:d,plan};
}
test('official MIT catalog is pinned, complete 273, unique and original technique exists',()=>{
  const {data,ids,sha256}=loadCineticLibrary();
  assert.equal(data.techniques.length,273);
  assert.equal(ids.size,273);
  assert.ok(ids.has('tr-velocity-handoff-cut'));
  assert.match(sha256,/^[0-9a-f]{64}$/);
});
test('Git blob SHA validates declared catalog bytes, mutations do not retain the pin',()=>{
  const b=read(new URL('./upstream-cinetic/assets/library/techniques.json',import.meta.url));
  assert.equal(gitBlobHash(b),LIBRARY_GIT_BLOB);
  const copy=Buffer.from(b);copy[20]^=1;
  assert.notEqual(gitBlobHash(copy),LIBRARY_GIT_BLOB);
});
test('selection options reject unknown flags, energy and unsafe seeds',()=>{
  assert.throws(()=>parseSelectionArgs(['a','b','--energy','bad']),/energy/);
  assert.throws(()=>parseSelectionArgs(['a','b','--seed','-1']),/seed/);
  assert.throws(()=>parseSelectionArgs(['a','b','--seed','99999999999']),/seed/);
  assert.throws(()=>parseSelectionArgs(['a','b','--unknown']),/unsupported/);
});
test('official upstream picker produces deterministic actual picks and never implies rendering',t=>{
  const {dir,plan}=sandbox(t);
  const first=selectDirectorTechniques([plan,join(dir,'first'),'--seed','123','--energy','calm']);
  const second=selectDirectorTechniques([plan,join(dir,'second'),'--seed','123','--energy','calm']);
  assert.deepEqual(first.selectedPicks,second.selectedPicks);
  assert.ok(first.selectedPicks.length>=1);
  assert.equal(first.selectedPicks[0].id,source().direction.techniqueIds[0]);
  assert.equal(first.selectionPolicy,'REQUESTED_PLAN_IDS_FIRST_PLUS_VERIFIED_ORIGINAL_PICKER');
  assert.ok(first.originalPickerIds.length>0);
  assert.equal(first.catalogCount,273);
  assert.equal(first.status,'CINETIC_UPSTREAM_DIRECTOR_PICKS_PROPOSALS_ONLY');
  assert.equal(first.gates.render,'NOT_RUN');
  assert.equal(first.gates.release,'BLOCKED');
  assert.equal(first.techniqueImplementation,'NOT_VERIFIED_AND_NOT_AUTO_APPLIED');
  assert.ok(existsSync(join(dir,'first','upstream-picked.json')));
  assert.deepEqual(JSON.parse(readFileSync(join(dir,'first','director-selection.json'),'utf8')),first);
  assert.equal(existsSync(join(dir,'first','preview.mp4')),false);
});
test('portrait plan uses upstream vertical filters and preserves unapproved art',t=>{
 const {dir,plan}=sandbox(t);
 const p=source();p.render.width=720;p.render.height=1280;
 writeFileSync(plan,JSON.stringify(p));
 const r=selectDirectorTechniques([plan,join(dir,'portrait'),'--seed','25','--energy','medium']);
 assert.equal(r.format,'vertical');
 assert.equal(r.gates.art,'PENDING_USER_APPROVAL');
 assert.ok(r.selectedPicks.length>0);
});
test('existing result directory refuses overwrite and unknown metadata ID fails closed',t=>{
 const {dir,plan}=sandbox(t);
 const out=join(dir,'same');
 selectDirectorTechniques([plan,out,'--seed','9']);
 assert.throws(()=>selectDirectorTechniques([plan,out,'--seed','9']),/refusing/);
 const data=source();data.direction.techniqueIds=['fake-technique-id'];
 writeFileSync(plan,JSON.stringify(data));
 assert.throws(()=>selectDirectorTechniques([plan,join(dir,'bad')]),/nonexistent upstream technique/);
 assert.equal(existsSync(join(dir,'bad')),false);
});
test('private text, URLs, markup and invalid plan fail before output creation',t=>{
 const {dir,plan}=sandbox(t);
 const bad=source();bad.contentClass='company-private';
 writeFileSync(plan,JSON.stringify(bad));
 assert.throws(()=>selectDirectorTechniques([plan,join(dir,'privacy')]),/synthetic/);
 assert.equal(existsSync(join(dir,'privacy')),false);
 bad.contentClass='public-synthetic';bad.brief.title='https://example.com/private';
 writeFileSync(plan,JSON.stringify(bad));
 assert.throws(()=>selectDirectorTechniques([plan,join(dir,'url')]),/forbidden/);
 assert.equal(existsSync(join(dir,'url')),false);
});

test('explicit storyboard technique is included in treatment proposals; other random picks stay unrendered',t=>{
 const {dir,plan}=sandbox(t);
 const input=JSON.parse(read(new URL('./storyboard-film-60fps-smoke.plan.json',import.meta.url),'utf8'));
 writeFileSync(plan,JSON.stringify(input));
 const selected=selectDirectorTechniques([plan,join(dir,'storyboard'),'--seed','142']);
 assert.equal(selected.selectedPicks[0].id,'tr-anchor-overlay-cut');
 assert.ok(selected.originalPickerIds.length>0);
 assert.ok(selected.selectedPicks.every((x,i,a)=>a.findIndex(y=>y.id===x.id)===i));
 assert.equal(selected.gates.render,'NOT_RUN');
});
