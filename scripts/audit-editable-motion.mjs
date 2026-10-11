// Optional read-only local CLI. Warnings never change video output or CI verdict.
import {readFileSync,lstatSync} from 'node:fs';
import {resolve} from 'node:path';
import {parseEditableScene} from '../experiments/editor-contract/scene.mjs';
import {auditEditableMotion} from '../experiments/editor-contract/motion-audit.mjs';

if(process.argv.length!==3)throw Error('Usage: node scripts/audit-editable-motion.mjs <local-s1-scene.json>');
const scenePath=resolve(process.argv[2]);
const info=lstatSync(scenePath);
if(!info.isFile()||info.isSymbolicLink()||info.size===0||info.size>65536)
 throw Error('Expected a bounded regular local S1 JSON file');
const scene=parseEditableScene(readFileSync(scenePath,'utf8'));
console.log(JSON.stringify(auditEditableMotion(scene),null,2));
