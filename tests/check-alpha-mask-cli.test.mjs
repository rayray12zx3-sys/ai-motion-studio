import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';

function run(mask,overlay){
 const folder=mkdtempSync(join(tmpdir(),'alpha-mask-test-'));
 try{
   for(const [name,c] of [['reference.png',mask],['content.png',overlay]])
     writeFileSync(join(folder,name),c.toBuffer('image/png'));
   const r=spawnSync(process.execPath,
     ['scripts/check-alpha-mask.mjs',join(folder,'reference.png'),
     join(folder,'content.png')],{encoding:'utf8',timeout:15000,windowsHide:true});
   return {status:r.status,report:r.stdout?JSON.parse(r.stdout):null,stderr:r.stderr};
 }finally{rmSync(folder,{recursive:true,force:true});}
}
test('real RGBA loading preserves transparent video window and blocked gray UI',()=>{
 const mask=createCanvas(24,24),m=mask.getContext('2d');
 m.fillStyle='rgba(164,165,160,1)';m.fillRect(0,0,24,24);
 m.clearRect(4,4,16,16);
 const video=createCanvas(24,24),v=video.getContext('2d');
 v.fillStyle='rgba(255,80,50,1)';v.fillRect(8,8,6,6);
 const good=run(mask,video);
 assert.equal(good.status,0,good.stderr);
 assert.equal(good.report.covered_pixels,0);
 assert.equal(good.report.platform_final_approval,'PENDING_HUMAN_REVIEW');
 v.fillRect(0,0,5,5);
 const bad=run(mask,video);
 assert.equal(bad.status,2);
 assert.ok(bad.report.covered_pixels>0);
});
