import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const registryPath=path.join(here,"catalog.json");
export const registry=JSON.parse(fs.readFileSync(registryPath,"utf8"));

const aliases=[
  [/驗證|確認|核對|打勾|勾選|通過|成功/,["check","success","confirm","complete","progress"]],
  [/文字|字幕|標題|單字|字卡|字詞/,["text","word","title","typography","headline"]],
  [/逐字|打字|輸入/,["typewriter","typing","input","cursor"]],
  [/進場|登場|出現/,["entrance","pop","reveal","stagger"]],
  [/轉場|切換|換場/,["transition","wipe","morph","mask"]],
  [/落地|彈跳|回穩|回彈/,["bounce","overshoot","spring","settle","squash"]],
  [/鏡頭|運鏡|攝影機/,["camera","dolly","pan","crane","orbit"]],
  [/互動|操作|懸停|滑鼠/,["hover","click","cursor","gesture","interaction"]],
  [/3d|三維|立體|空間/,["3d","three.js","camera","depth"]],
  [/分鏡|導演|敘事/,["storyboard","camera","shot","direction"]],
  [/節奏|緩動|速度/,["easing","timing","spring","motion"]],
  [/圖表|數據|數字|統計/,["chart","count","data","number","stats"]],
  [/色調|光線|打光/,["lighting","photo","tone","shadow"]],
  [/遮罩|揭露/,["mask","reveal","clip"]],
  [/網頁|按鈕|卡片/,["ui","button","card","hover"]],
  [/微互動|微動效|互動細節/,["interaction","microinteraction","gesture","ui","motion"]],
  [/視覺|美術|風格|品牌動效/,["visual","design","branding","typography","motion"]],
];
const norm=s=>String(s??"").normalize("NFKC").toLocaleLowerCase("en-US");
export function tokenize(query){
  const q=norm(query).trim();
  if(!q)return [];
  const terms=q.split(/[\s,，;；、/]+/u).filter(Boolean);
  for(const [re,words] of aliases)if(re.test(q))terms.push(...words);
  return [...new Set(terms.filter(t=>t.length>=2))];
}
export function getEntry(id){
  const raw=String(id??"").trim().replace(/^#/,"");
  const key=/^\d{1,3}$/.test(raw)?"MP-"+raw.padStart(3,"0"):raw.toUpperCase();
  return registry.entries.find(x=>x.id===key)||null;
}
export function search(query,{role="director",limit=5}={}){
  if(!["director","reviewer"].includes(role))throw Error("role must be director or reviewer");
  if(!Number.isInteger(limit)||limit<1||limit>50)throw Error("limit must be 1..50");
  const q=norm(query).trim();if(!q)return [];
  const terms=tokenize(query);
  return registry.entries.map(entry=>{
    const a=norm([entry.id,entry.title,entry.title_zh||""].join(" "));
    const b=norm([entry.provider,entry.pack,entry.category,entry.semantic_purpose].join(" "));
    const c=norm([entry.source_summary,...entry.tags].join(" "));
    const score=terms.reduce((total,t)=>total+(a.includes(t)?6:0)+(b.includes(t)?3:0)+(c.includes(t)?2:0),0)+(a.includes(q)?12:0);
    return {entry,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id))
  .slice(0,limit).map(({entry,score})=>({
    id:entry.id,title:entry.title_zh||entry.title,provider:entry.provider,score,
    purpose:entry.semantic_purpose,source_url:entry.source_url,
    prompt_url:entry.prompt_url,source_license:entry.source_license,
    production_status:entry.production_status,
    role,art_status:entry.art_status
  }));
}
export function review(id){
  const entry=getEntry(id);
  if(!entry)return null;
  return {id:entry.id,title:entry.title_zh||entry.title,reference_url:entry.source_url,
    criteria:entry.review_rules,source_license:entry.source_license,
    source_code_reuse:entry.source_code_reuse,
    technical_verdict:"NOT_EVALUATED",visual_verdict:"PENDING_EVIDENCE",
    human_art_approval:"PENDING_HUMAN",
    caveat:"需完整可觀看動態、時間碼、目標文案與輸出證據；不可因找到參考項目就自動判定合格。"};
}
export function validate(input=registry){
  const errors=[];
  if(input.schema_version!=="1.0.0")errors.push("unknown schema");
  if(!Array.isArray(input.entries))return ["missing entries"];
  const seen=new Set();
  for(const e of input.entries){
    if(!e.id||seen.has(e.id))errors.push("duplicate/missing id "+e.id);
    seen.add(e.id);
    if(!/^https:\/\//.test(e.source_url||""))errors.push("invalid source URL "+e.id);
    if(e.provider==="motion-prompt"&&(e.source_license!=="MIT"||!e.prompt_url||!e.motion_spec_url))errors.push("invalid motion-prompt metadata "+e.id);
    if(e.provider!=="motion-prompt"&&(e.source_license!=="NOT_VERIFIED"||e.prompt_url!==null||e.source_code_reuse!=="DO_NOT_COPY"))errors.push("external rights breach "+e.id);
    if(!Array.isArray(e.review_rules)||!e.review_rules.length||e.production_status!=="REFERENCE_ONLY"||e.art_status!=="NOT_REVIEWED")errors.push("review gate invalid "+e.id);
  }
  if(input.entries.filter(e=>e.provider==="motion-prompt").length!==144)errors.push("not 144 canonical entries");
  if(input.entries.filter(e=>e.provider==="kittenjam").length!==8)errors.push("not 8 Kittenjam root/facet references");
  if(input.entries.filter(e=>e.provider==="prompt-motion").length!==5)errors.push("not 5 Prompt Motion page references");
  if(input.entries.filter(e=>e.provider==="recent-design").length!==1)errors.push("not 1 Recent Motion gallery entry");
  if(input.entries.filter(e=>e.provider==="60fps-design").length!==2)errors.push("not 2 60fps gallery facets");
  return errors;
}
const argv=process.argv.slice(2);
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [cmd,...args]=argv;
  try{
    let value;
    if(cmd==="search"||cmd==="recommend"){
      const role=args.includes("--reviewer")?"reviewer":"director";
      const phrase=args.filter(a=>!a.startsWith("--")).join(" ");
      value=search(phrase,{role,limit:cmd==="recommend"?3:10});
    }else if(cmd==="get")value=getEntry(args[0]);
    else if(cmd==="review")value=review(args[0]);
    else if(cmd==="info")value={schema_version:registry.schema_version,snapshot_date:registry.snapshot_date,
      total:registry.entries.length,by_source:registry.sources.map(s=>({provider:s.provider,count:registry.entries.filter(x=>x.provider===s.provider).length,license:s.license}))};
    else if(cmd==="validate"){const errors=validate();value={ok:!errors.length,errors};if(errors.length)process.exitCode=1;}
    else {console.error("Usage: node registry/cli.mjs search <query> [--reviewer] | recommend <query> | get <id> | review <id> | info | validate");process.exitCode=2;}
    if(value!==undefined){if(value===null){console.error("Not found");process.exitCode=1;}else console.log(JSON.stringify(value,null,2));}
  }catch(err){console.error(err.message);process.exitCode=2;}
}
