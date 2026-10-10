// Test-only derived scenes from the exact public original S1 fixture.
// No company/source media, download, logo/font copying or arbitrary materials.
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEditableScene,serializeEditableScene} from '../experiments/editor-contract/scene.mjs';
const root=dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
const input=parseEditableScene(readFileSync(join(root,'experiments/editor-contract/original-synthetic.json'),'utf8'));
const out=join(root,'out','approved-s1-fullhd-fixtures');
mkdirSync(out,{recursive:true});
for(const [name,width,height] of [['landscape',1920,1080],['vertical',1080,1920]]){
 const scene=structuredClone(input);
 scene.canvas={width,height};
 scene.id='original-synthetic-'+name;
 const json=serializeEditableScene(scene);
 writeFileSync(join(out,name+'.json'),json,{flag:'wx'});
 console.log('S1_APPROVED_HD_FIXTURE',JSON.stringify({name,canvas:scene.canvas,frames:scene.duration_frames,assets:scene.assets.length}));
}
