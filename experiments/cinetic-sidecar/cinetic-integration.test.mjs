// Fully synthetic integration of the existing single entry wiring. This is NOT HyperFrames engine evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'cinetic-integration-synthetic-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  for(const name of ['cinetic-flow.mjs','cinetic-diagnostics.mjs'])
    copyFileSync(new URL('./'+name,import.meta.url),join(dir,name));
  writeFileSync(join(dir,'package.json'),'"use strict"'); // overwritten below with ESM declaration
  writeFileSync(join(dir,'package.json'),JSON.stringify({type:'module'}));
  writeFileSync(join(dir,'adapter.mjs'),`export const normalizeDirectorPlan=x=>{
    if(x?.engine!=='cinetic-hyperframes' || x?.contentClass!=='public-synthetic' || !x.render?.frames)
      throw new Error('invalid synthetic fixture plan');
    return x;
  };`);
  writeFileSync(join(dir,'prepare-render.mjs'),`import {mkdirSync,writeFileSync} from 'node:fs';
  import {join} from 'node:path';
  export function prepareSyntheticRender(input,dir){mkdirSync(dir,{recursive:false});
    writeFileSync(join(dir,'validated-plan.json'),JSON.stringify(input));
    writeFileSync(join(dir,'index.html'),'<html>synthetic fixture</html>');
    writeFileSync(join(dir,'index-alpha.html'),'<html>synthetic alpha fixture</html>');
    return {dir};}`);
  writeFileSync(join(dir,'verify-render.mjs'),`import {writeFileSync,readFileSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
  const dir=process.argv[2];const sha=n=>createHash('sha256').update(readFileSync(join(dir,n))).digest('hex');
  writeFileSync(join(dir,'technical-report.json'),JSON.stringify({status:'SYNTHETIC_RENDER_TECHNICAL_QA_PASS_NOT_ART_APPROVAL',mp4:{sha256:sha('preview.mp4')},alpha:{sha256:sha('overlay-alpha.mov')}}));`);
  const plan={schemaVersion:1,engine:'cinetic-hyperframes',contentClass:'public-synthetic',render:{width:1280,height:720,fps:24,frames:48}};
  writeFileSync(join(dir,'plan.json'),JSON.stringify(plan));
  return dir;
}

test('actual CLI prepare-only wires existing Adapter and preparer and writes truthful pending receipt', async t=>{
 const dir=fixture(t),out=join(dir,'new-output');const {run}=await import(pathToFileURL(join(dir,'cinetic-flow.mjs')).href);
 const receipt=await run([join(dir,'plan.json'),out,'--prepare-only']);
 assert.equal(receipt.technical,'PREPARED_NOT_RENDERED');assert.equal(receipt.gates.release,'BLOCKED');
 assert.equal(JSON.parse(readFileSync(join(out,'flow-receipt.json'))).technical,'PREPARED_NOT_RENDERED');
 assert.equal(JSON.parse(readFileSync(join(out,'validated-plan.json'))).engine,'cinetic-hyperframes');
 assert.equal(existsSync(join(out,'preview.mp4')),false);
});

test('synthetic fake CLI proves true orchestration wiring without making genuine engine claim',async t=>{
 const dir=fixture(t),out=join(dir,'render-test');
 const fake=join(dir,'fake-cli.js');
 writeFileSync(fake,`import {writeFileSync} from 'node:fs';
   const a=process.argv.slice(2);if(a[0]!=='render')process.exit(19);
   const dest=a[a.indexOf('-o')+1];if(!['./preview.mp4','./overlay-alpha.mov'].includes(dest))process.exit(20);
   writeFileSync(dest,dest.includes('mov')?'synthetic-alpha-only':'synthetic-opaque-only');`);
 const h=createHash('sha256').update(readFileSync(fake)).digest('hex');
 const {run}=await import(pathToFileURL(join(dir,'cinetic-flow.mjs')).href);
 const receipt=await run([join(dir,'plan.json'),out,'--render','--hf',fake,'--hf-sha',h]);
 assert.equal(receipt.technical,'LOCAL_PINNED_ENTRYPOINT_MEDIA_QA_PASS_ENGINE_PROVENANCE_REQUIRES_EXTERNAL_AUDIT');
 assert.equal(receipt.gates.release,'BLOCKED');assert.equal(existsSync(join(out,'preview.mp4')),true);
 assert.equal(existsSync(join(out,'overlay-alpha.mov')),true);
 assert.equal(receipt.cli.packageProvenance,'DECLARED_PINNED_ENTRYPOINT; NPM_TARBALL_NOT_INDEPENDENTLY_REVERIFIED');
});

test('preflight errors fail closed BEFORE even creating output folder',async t=>{
 const dir=fixture(t),out=join(dir,'failure-output');
 const {run}=await import(pathToFileURL(join(dir,'cinetic-flow.mjs')).href);
 await assert.rejects(()=>run([join(dir,'plan.json'),out,'--render','--hf',join(dir,'missing.mjs'),'--hf-sha','f'.repeat(64)]));
 assert.equal(existsSync(out),false);
});