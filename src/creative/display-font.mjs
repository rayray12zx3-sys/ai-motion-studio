// Licensed SIL OFL 1.1 typography already included in pinned Noto Sans TC 5.3.0.
import {GlobalFonts} from '@napi-rs/canvas';
import {readdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import '../free/scene.mjs';

const dir=join(dirname(fileURLToPath(import.meta.resolve('@fontsource/noto-sans-tc/package.json'))),'files');
const files=readdirSync(dir).filter(x=>x.endsWith('-700-normal.woff2')).sort();
if(files.length===0)throw new Error('Pinned 700-weight files unavailable');
const aliases=files.map((file,i)=>{
  const alias='M8Display'+i;
  if(!GlobalFonts.registerFromPath(join(dir,file),alias))throw new Error('Font failed to register');
  return '"'+alias+'"';
});
export const displayFontFamily=aliases.join(',');
export const displayFontManifest=files.map(name=>({
  name,weight:700,license:'OFL-1.1',
  sha256:createHash('sha256').update(readFileSync(join(dir,name))).digest('hex')
}));
