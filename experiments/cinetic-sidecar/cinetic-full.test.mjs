import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fullOptions,fullPipeline} from './cinetic-full.mjs';
const valid=['example.json','out/new-job','--render','--hf','/tmp/hyperframes.js','--hf-sha','f'.repeat(64)];
test('single full command requires explicit render authorization and pinned CLI SHA',()=>{
 assert.equal(fullOptions(valid).render,true);
 assert.equal(fullOptions([...valid,'--seed','42','--energy','high']).energy,'high');
 assert.throws(()=>fullOptions(['example.json','out/new-job']),/explicit/);
 assert.throws(()=>fullOptions(valid.filter(x=>x!=='--render')),/explicit/);
 assert.throws(()=>fullOptions([...valid,'--hf-sha','0'.repeat(64)]),/duplicate/);
});
test('reject unsupported options, negative seed and absent values',()=>{
 assert.throws(()=>fullOptions([...valid,'--unrecognized','x']),/unsupported/);
 assert.throws(()=>fullOptions([...valid,'--seed','-1']),/seed/);
 assert.throws(()=>fullOptions([...valid,'--seed','9999999999999']),/seed/);
 assert.throws(()=>fullOptions([...valid,'--energy','unsafe']),/energy/);
 assert.throws(()=>fullOptions([...valid,'--energy']),/missing/);
});
test('full command cannot consume private source or claim an unverified engine before output creation', async t=>{
 const d=mkdtempSync(join(tmpdir(),'cinetic-full-preflight-'));
 t.after(()=>rmSync(d,{recursive:true,force:true}));
 const p=JSON.parse(readFileSync(new URL('./probe.plan.json',import.meta.url),'utf8'));
 const source=join(d,'plan.json'),dest=join(d,'new-root');
 p.contentClass='company-private';writeFileSync(source,JSON.stringify(p));
 await assert.rejects(()=>fullPipeline([source,dest,...valid.slice(2)]),/synthetic/);
 assert.equal(existsSync(dest),false);
 p.contentClass='public-synthetic';writeFileSync(source,JSON.stringify(p));
 await assert.rejects(()=>fullPipeline([source,dest,...valid.slice(2)]));
 assert.equal(existsSync(dest),false);
});
test('duplicate options, existing root and nonsynthetic input cannot bypass gate',()=>{
 const wrong=[...valid,'--render'];
 assert.throws(()=>fullOptions(wrong),/duplicate/);
 const c=[...valid];c[c.indexOf('--hf-sha')+1]='bogus';
 assert.throws(()=>fullOptions(c),/sha/);
});
