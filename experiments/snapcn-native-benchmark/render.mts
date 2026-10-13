/** Executes inside a detached, SHA-pinned upstream snapcn checkout.
 * Original, synthetic-only technical EVALUATION; no product-company use.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { ensureBrowser, getCompositions, renderMedia } from "@remotion/renderer";
import { tsconfigWebpackAlias } from "./tsconfig-webpack-alias.mts";

const root=path.resolve(import.meta.dirname,"..");
const upSha=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();
const allowed="afce9f0aa8c9d464409efd1e4d4f227ca4809c04";
if(upSha!==allowed)throw Error("Upstream SHA mismatch: abort before rendering");
const out=path.join(root,"out","ams-original");
mkdirSync(out,{recursive:true});
await ensureBrowser();
const aliases=tsconfigWebpackAlias(root);
const serveUrl=await bundle({
  entryPoint:path.join(root,"src","remotion","ams-benchmark-entry.tsx"),
  webpackOverride:base=>({
    ...base,
    resolve:{...base.resolve,alias:[
      ...Object.entries(base.resolve?.alias??{}).map(([name,alias])=>({
        name:name.replace(/\\$$/,""),alias,onlyModule:name.endsWith("$")
      })),
      ...aliases
    ]}
  })
});
const comps=await getCompositions(serveUrl,{inputProps:{}});
const ids=["AMSAtlasDevice","AMSIndexProductHero"];
if(comps.length!==ids.length||comps.some(c=>!ids.includes(c.id)))
  throw Error("Unexpected Remotion compositions / accidental upstream demo");
const outputs=[];
for(const id of ids){
 const c=comps.find(v=>v.id===id);
 if(!c)throw Error("Missing "+id);
 const outputLocation=path.join(out,id+".mp4");
 console.log("Full component film",id,c.width+"x"+c.height,c.durationInFrames+"f");
 await renderMedia({
   serveUrl,composition:c,inputProps:{},codec:"h264",outputLocation,
   concurrency:2
 });
 const stat=JSON.parse(execFileSync("ffprobe",[
   "-v","error","-count_frames","-show_streams","-show_format",
   "-of","json",outputLocation],{encoding:"utf8"}));
 const v=stat.streams.find(s=>s.codec_type==="video");
 if(!v||v.codec_name!=="h264"||+v.nb_read_frames!==c.durationInFrames||
    v.width!==c.width||v.height!==c.height)
   throw Error("Actual MP4 frame/geometry mismatch for "+id);
 const hash=createHash("sha256").update(readFileSync(outputLocation)).digest("hex");
 outputs.push({
   id,originalSnapcn:true,upstream:allowed,
   width:v.width,height:v.height,frames:+v.nb_read_frames,fps:c.fps,
   sha256:hash,media:path.basename(outputLocation),
   artisticApproval:"PENDING",referenceParity:"NOT_CLAIMED",
   commercialRemotionUse:"NOT_AUTHORIZED",
   sourceMaterial:"SYNTHETIC_ORIGINAL_ONLY",
   actualBrowserPlayback:"NOT_VERIFIED"
 });
}
writeFileSync(path.join(out,"engineering-report.json"),
 JSON.stringify({schema:"ams-snapcn-evaluation-v1",upstreamCommit:allowed,outputs},null,2)+"\n");
console.log(JSON.stringify(outputs,null,2));
