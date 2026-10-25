import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {options,assertSynthetic,pinnedBinary,binaryCommand,GATES,run} from './cinetic-flow.mjs';
const plan={schemaVersion:1,engine:'cinetic-hyperframes',contentClass:'public-synthetic',render:{width:1280,height:720,fps:24,frames:48}};
test('explicit render permission required',()=>assert.throws(()=>options(['a.json','out']),/explicit/));
test('prepare-only is non-render',()=>assert.equal(options(['a','out','--prepare-only']).mode,'prepare-only'));
test('render requires CLI and 64-byte identity proof',()=>assert.throws(()=>options(['a','o','--render','--hf','/tmp/f']),/requires/));
test('only one job operation',()=>assert.throws(()=>options(['a','o','--prepare-only','--render']),/one operation/));
test('cannot add unknown switches',()=>assert.throws(()=>options(['a','o','--render','--npx','yes']),/unknown/));
test('prepare mode cannot borrow render grants',()=>assert.throws(()=>options(['a','o','--prepare-only','--hf','/x']),/prohibited/));
test('public synthetic and opt-in are mandatory',()=>{
  assert.equal(assertSynthetic(plan),plan);
  assert.throws(()=>assertSynthetic({...plan,contentClass:'company-private'}),/prohibited/);
  assert.throws(()=>assertSynthetic({...plan,engine:'default'}),/prohibited/);
  assert.throws(()=>assertSynthetic({...plan,userArt:'APPROVED'}),/forbidden/);
});
test('tool SHA pins local file, tampered identity blocked',()=>{
  const d=mkdtempSync(join(tmpdir(),'cinetic-hf-pin-'));
  try {const p=join(d,'cli.js');writeFileSync(p,'original');
    const h=createHash('sha256').update('original').digest('hex');
    assert.equal(pinnedBinary(p,h),p);
    assert.throws(()=>pinnedBinary(p,'0'.repeat(64)),/mismatch/);
    assert.throws(()=>pinnedBinary('relative.js',h),/absolute/);
  }finally{rmSync(d,{recursive:true,force:true});}
});
test('no shells, npx or npm in executable invocation',()=>{
  assert.deepEqual(binaryCommand('/opt/hf.js',['render']),[process.execPath,['/opt/hf.js','render']]);
  assert.deepEqual(binaryCommand('/opt/hf',['render']),['/opt/hf',['render']]);
});
test('approval gates never set by adapter',()=>{
  assert.equal(GATES.userArt,'PENDING');assert.equal(GATES.release,'BLOCKED');
});
test('source output location cannot be overwritten',async()=>{
  const d=mkdtempSync(join(tmpdir(),'cinetic-fail-'));
  try {const p=join(d,'plan.json');writeFileSync(p,JSON.stringify(plan));
    await assert.rejects(()=>run([p,d,'--prepare-only']),/refuse existing output directory/);
  }finally{rmSync(d,{recursive:true,force:true});}
});
