import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {displayFontFamily,displayFontManifest} from '../src/creative/display-font.mjs';
import {compileMotionBrief} from '../src/creative/brief.mjs';
import {drawAdvancedFrame,loadAdvancedArt} from '../src/creative/advanced.mjs';

const template=JSON.parse(readFileSync(new URL('../examples/advanced-film.json',import.meta.url)));
const load=id=>JSON.parse(readFileSync(new URL('../examples/brief-'+id+'.json',import.meta.url)));
const root=dirname(fileURLToPath(new URL('../examples/advanced-film.json',import.meta.url)));

test('offline licensed Noto Sans TC 700 is registered and SHA-provenanced',()=>{
  assert.ok(displayFontFamily.includes('M8Display'));
  assert.ok(displayFontManifest.length>0);
  for(const f of displayFontManifest){
    assert.ok(f.name.endsWith('-700-normal.woff2'));
    assert.equal(f.license,'OFL-1.1');
    assert.equal(f.weight,700);
    assert.match(f.sha256,/^[0-9a-f]{64}$/);
  }
});

test('all 4 M8 beats change stage geometry, not just words or palette',async()=>{
  const studio=compileMotionBrief(load('studio'),template);
  const learning=compileMotionBrief(load('learning'),template);
  assert.deepEqual(studio.motion.segments,learning.motion.segments);
  assert.deepEqual(studio.motion.camera,learning.motion.camera);
  assert.deepEqual(studio.asset_manifest,learning.asset_manifest);
  const art=await loadAdvancedArt(studio,root);
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:360};
    for(const frame of [35,135,225,320]){
      const first=drawAdvancedFrame(profile,frame,studio,art).getContext('2d').getImageData(0,0,width,height).data;
      const second=drawAdvancedFrame(profile,frame,learning,art).getContext('2d').getImageData(0,0,width,height).data;
      const x0=Math.round(width*.10),x1=Math.round(width*.90);
      const y0=Math.round(height*.40),y1=Math.round(height*.84);
      let changed=0,total=0;
      for(let y=y0;y<y1;y+=3)for(let x=x0;x<x1;x+=3){
        const i=(y*width+x)*4;total++;
        if(Math.abs(first[i]-second[i])+Math.abs(first[i+1]-second[i+1])+
           Math.abs(first[i+2]-second[i+2])>52)changed++;
      }
      assert.ok(changed/total>.20,
        'M8 stage requires >=20% visibly distinct pixels: '+width+'x'+height+
        ' f='+frame+' ratio='+changed/total);
    }
  }
});

test('M8 is random-access deterministic and ending remains held',async()=>{
  const spec=compileMotionBrief(load('learning'),template),art=await loadAdvancedArt(spec,root);
  for(const [width,height] of [[640,360],[360,640]]){
    const profile={width,height,fps:30,frames:360};
    const frames=[0,35,89,90,91,135,180,225,270,320,345,359];
    const original=frames.map(frame=>drawAdvancedFrame(profile,frame,spec,art).toBuffer('image/png'));
    for(const frame of frames.slice().reverse())drawAdvancedFrame(profile,frame,spec,art);
    frames.forEach((frame,i)=>assert.deepEqual(drawAdvancedFrame(profile,frame,spec,art).toBuffer('image/png'),original[i]));
    assert.deepEqual(original.at(-2),original.at(-1));
  }
});
