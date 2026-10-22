// Private K09 text injection at render time; never store private copy in public GitHub.
// Source template must be trusted; all copy is rendered via item() -> textContent.
import {parsePrivateJob} from './private-job-contract.mjs';
const FALLBACK="const old=item('真的嗎？',278,207,104),next=item('你確定？',311,205,107);";
const DOT="const dot=item('·',621,247,91,'soft');";
const fail=()=>{throw Error('K09 copy cannot fit an accessible short motion card.');};
export function splitK09Text(text){
  if(typeof text!=='string'||text.length<2||text.length>72||/[\u0000-\u001f\u007f]/u.test(text))fail();
  const chars=[...text.normalize('NFC').trim()];
  if(chars.length<2)fail();
  let split=-1;
  for(let i=0;i<chars.length-1;i++)if(/[？?!！。]/u.test(chars[i])){split=i+1;break}
  if(split<1)split=Math.ceil(chars.length/2);
  const first=chars.slice(0,split).join('').trim(),second=chars.slice(split).join('').trim();
  if(!first||!second||[...first].length>16||[...second].length>16)fail();
  return Object.freeze([first,second]);
}
export function makePrivateK09Gallery(baseHtml,job){
  const validated=parsePrivateJob(job,{job_id:job?.job_id});
  if(validated.effect_id!=='K09'||typeof baseHtml!=='string')fail();
  if(baseHtml.split(FALLBACK).length!==2||baseHtml.split(DOT).length!==2)fail();
  const parts=splitK09Text(validated.text);
  // Escape markup delimiters before embedding JSON in the trusted localhost HTML response.
  const safe=JSON.stringify(parts)
    .replace(/</g,'\\u003C').replace(/>/g,'\\u003E')
    .replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028')
    .replace(/\u2029/g,'\\u2029');
  const replacement="const __k09="+safe+";\n"+
    "const __sz=s=>Math.min(107,Math.floor(640/[...s].length));\n"+
    "const __pos=s=>Math.floor((960-[...s].length*__sz(s))/2);\n"+
    "const old=item(__k09[0],__pos(__k09[0]),207,__sz(__k09[0])),next=item(__k09[1],__pos(__k09[1]),205,__sz(__k09[1]));";
  return baseHtml.replace(FALLBACK,replacement)
    .replace(DOT,"const dot=item('·',Math.min(885,__pos(__k09[0])+[...__k09[0]].length*__sz(__k09[0])+14),247,91,'soft');");
}
