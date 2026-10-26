import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {soundscapeWav,finishStoryboardWithOriginalSound} from './cinetic-soundscape.mjs';
test('original stereo PCM is reproducible, 48kHz/8s and bounded',()=>{
 const a=soundscapeWav(),b=soundscapeWav();
 assert.equal(a.length,44+48000*8*4);
 assert.equal(a.toString('ascii',0,4),'RIFF');
 assert.equal(a.toString('ascii',8,12),'WAVE');
 assert.equal(a.readUInt32LE(24),48000);
 assert.equal(a.readUInt16LE(22),2);
 assert.equal(createHash('sha256').update(a).digest('hex'),createHash('sha256').update(b).digest('hex'));
 let nonzero=0,max=0;for(let i=44;i<a.length;i+=2){const x=Math.abs(a.readInt16LE(i));if(x>0)nonzero++;max=Math.max(max,x);}
 assert.ok(nonzero>48000&&max>200&&max<32767);
});
test('sound cannot be created without an actual video and cannot overwrite',()=>{
 const d=mkdtempSync(join(tmpdir(),'cinetic-sound-refuse-'));
 try {assert.throws(()=>finishStoryboardWithOriginalSound(d),/real synthetic video/);
   assert.equal(existsSync(join(d,'original-synthetic-sound.wav')),false);}
 finally{rmSync(d,{recursive:true,force:true});}
});
