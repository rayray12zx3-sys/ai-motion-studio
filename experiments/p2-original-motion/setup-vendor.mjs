import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const origin=path.join(dir,'node_modules/gsap/dist/gsap.min.js');
const dest=path.join(dir,'vendor/gsap-3.15.0.min.js');
if(!fs.existsSync(origin))throw Error('Pinned GSAP 3.15.0 not installed; run npm install --ignore-scripts in this experiment only');
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.copyFileSync(origin,dest);
console.log('Pinned 3.15.0 vendor script staged for OFFLINE local rendering only:',dest);
