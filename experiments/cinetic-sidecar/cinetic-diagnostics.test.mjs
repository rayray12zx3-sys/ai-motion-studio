import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {doctor,auditExistingVideo} from './cinetic-diagnostics.mjs';
const fixture=process.env.CINETIC_TRUE_HF_HISTORICAL_MP4;
const sum='5c4527be3c4f94b806ae9ae5893f99066d95b12eeface9c692daba268db1693e';
test('doctor never promotes technical approval or invents installed CLI',()=>{
 const d=doctor();assert.notEqual(d.status,'RENDER_PASS');assert.equal(d.hyperframes.status,'NOT_SUPPLIED');
 assert.ok(d.issues.some(x=>x.includes('HF')));
});
test('doctor blocks CLI hash mismatch',()=>{
 const t=mkdtempSync(join(tmpdir(),'cinetic-clitest-'));
 try {const f=join(t,'cli.js');writeFileSync(f,'legitimate static test binary');
   const d=doctor({hf:f,hfSha:'0'.repeat(64)});
   assert.equal(d.hyperframes.status,'ENTRYPOINT_SHA_MISMATCH');
 }finally{rmSync(t,{recursive:true,force:true})}
});
test('audit rejects absent file',()=>assert.equal(auditExistingVideo('/nonexistent/cinetic.mp4',{width:540,height:960,fps:30,frames:95,sha256:sum}).status,'BLOCKED'));
test('audit rejects invalid expected SHA without running decode',()=>{
 const a=auditExistingVideo(import.meta.filename||new URL(import.meta.url).pathname,{width:540,height:960,fps:30,frames:95,sha256:'bogus'});
 assert.ok(a.errors.some(x=>x.includes('SHA256')));
});
test('audit rejects a valid synthetic clip of wrong dimensions and frame count',()=>{
 const t=mkdtempSync(join(tmpdir(),'cinetic-video-test-'));
 try{const f=join(t,'tiny.mp4');const r=spawnSync('ffmpeg',['-hide_banner','-v','error','-f','lavfi','-i','color=c=black:s=64x64:r=25','-frames:v','3','-c:v','libx264','-pix_fmt','yuv420p','-y',f],{timeout:20000});assert.equal(r.status,0);
 const fs=requireSha(f);const a=auditExistingVideo(f,{width:540,height:960,fps:30,frames:95,sha256:fs});
 assert.equal(a.status,'BLOCKED');assert.ok(a.errors.some(x=>x.includes('decoded frames')));assert.ok(a.errors.some(x=>x.includes('fps')));
 }finally{rmSync(t,{recursive:true,force:true})}
});
function requireSha(f){const {readFileSync}=requireFs();return createHash('sha256').update(readFileSync(f)).digest('hex')}
function requireFs(){return fs;}
import * as fs from 'node:fs';
test('historical true HF artifact bytes and decode, without claiming new pipeline', {skip:!fixture},()=>{
 const a=auditExistingVideo(fixture,{width:540,height:960,fps:30,frames:95,sha256:sum});
 assert.equal(a.status,'VIDEO_BYTES_TECH_PASS_ORIGIN_UNVERIFIED',JSON.stringify(a.errors));
});