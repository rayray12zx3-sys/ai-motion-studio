// Bounded integration check for the original PNG-only preview CLI.
// No FFmpeg provisioning, GitHub APIs, external media, or commits required.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const frames=[0,24,75,89,90,91,115,179,180,209,269,270,300,345,359];
const sha256=buf=>createHash('sha256').update(buf).digest('hex');
function pngSize(buf){
  assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
  assert.equal(buf.subarray(12,16).toString('ascii'),'IHDR','PNG IHDR chunk');
  return [buf.readUInt32BE(16),buf.readUInt32BE(20)];
}
if(Number(process.versions.node.split('.')[0])!==24){
  throw new Error('Node 24 required for official preview verification');
}

for(const [name,width,height] of [['landscape',640,360],['vertical',360,640]]){
  const key='preview-ci-verify-'+name;
  const dir=join(root,'out',key);
  assert.equal(existsSync(dir),false,'Do not overwrite prior preview: '+dir);
  try {
    const check=spawnSync(process.execPath,['scripts/preview-advanced.mjs',name,key],
      {cwd:root,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024,windowsHide:true});
    if(check.error)throw check.error;
    assert.equal(check.status,0,'Preview CLI failed: '+check.stderr);
    assert.equal(existsSync(dir),true,'Preview directory missing');
    const actual=readdirSync(dir).sort();
    const expected=[...frames.map(f=>'frame-'+String(f).padStart(3,'0')+'.png'),
      'contact-sheet.png','preview-report.json'].sort();
    assert.deepEqual(actual,expected,'Preview must contain exactly 15 PNG frames, sheet, report');
    const report=JSON.parse(readFileSync(join(dir,'preview-report.json'),'utf8'));
    assert.deepEqual([report.profile.width,report.profile.height,report.profile.fps,
      report.profile.frames],[width,height,30,360]);
    assert.deepEqual(report.frames,frames,'Reported samples differ from inspected PNGs');
    assert.equal(report.samples.length,frames.length);
    assert.equal(report.approval,'UNAPPROVED');
    assert.equal(report.creative_qc,'PENDING_HUMAN_REVIEW');
    assert.equal(report.external_calls,0);
    assert.equal(report.paid_calls,0);
    const hashes=[];
    for(let i=0;i<frames.length;i++){
      const data=readFileSync(join(dir,expected.find(x=>x==='frame-'+String(frames[i]).padStart(3,'0')+'.png')));
      assert.deepEqual(pngSize(data),[width,height],'Wrong sampled frame dimensions');
      const hash=sha256(data);
      assert.equal(report.samples[i].frame,frames[i]);
      assert.equal(report.samples[i].sha256,hash);
      hashes.push(hash);
    }
    const contact=readFileSync(join(dir,'contact-sheet.png'));
    assert.deepEqual(pngSize(contact),[1400,1100],'Contact sheet dimensions');
    assert.notEqual(hashes[3],hashes[4],'Frame 89/90 should not be identical');
    assert.equal(hashes[13],hashes[14],'Final 345/359 hold should be identical');
    console.log(JSON.stringify({verification:'PASS',profile:name,
      frames_checked:frames.length,dimensions:[width,height],
      sheet_sha256:sha256(contact),sample_0_sha256:hashes[0],
      sample_359_sha256:hashes[14],
      elapsed_ms:report.duration_ms,mp4_created:false}));
  } finally {
    // The test never deletes an existing review. Only our fresh test key is cleaned.
    if(existsSync(dir))rmSync(dir,{recursive:true,force:true});
  }
}
