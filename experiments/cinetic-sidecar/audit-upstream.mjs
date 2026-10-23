// Read-only pinned Cinetic upstream provenance audit. No upstream script execution.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, join } from "node:path";
import { UPSTREAM_CINETIC_SHA } from "./adapter.mjs";
const root = resolve(process.argv[2] || "out/upstream-cinetic-source");
const destination = resolve(process.argv[3] || "out/cinetic-story8/upstream-provenance.json");
function assert(cond,msg){if(!cond) throw Error(msg);}
const actual = execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert(actual === UPSTREAM_CINETIC_SHA,"upstream Git source did not match pinned SHA");
const skillRoot = join(root,"skills","cinetic");
const skill = readFileSync(join(skillRoot,"SKILL.md"),"utf8");
const license = readFileSync(join(skillRoot,"LICENSE.txt"),"utf8");
const library = JSON.parse(readFileSync(join(skillRoot,"assets","library","techniques.json"),"utf8"));
const planPath = resolve(process.argv[4] || "experiments/cinetic-sidecar/story-eight.plan.json");
const plan = JSON.parse(readFileSync(planPath,"utf8"));
assert(/^---\s*\nname:\s*cinetic\s*$/m.test(skill),"expected upstream skill title missing");
assert(/MIT License/.test(license),"expected pinned upstream MIT notice missing");
assert(library.version === 1 && Array.isArray(library.techniques) && library.techniques.length === 273,"Cinetic library count/version mismatch");
const ids = new Set(library.techniques.map(x=>x.id));
assert(ids.size === library.techniques.length,"upstream technique IDs not unique");
const selections = plan.direction.techniqueIds.map(id => {
  const item = library.techniques.find(x=>x.id===id);
  assert(item, "unknown official Cinetic technique ID: "+id);
  return {id:item.id,category:item.category,name:item.name,implementedAsUpstreamRecipe:false};
});
const report = {
 status:"UPSTREAM_METADATA_PROVENANCE_PASS_NOT_A_SKILL_EXECUTION",
 repository:"Leonxlnx/cinetic",commit:actual,license:"MIT",categoryCount:new Set(library.techniques.map(x=>x.category)).size,
 totalTechniques:library.techniques.length,selected:selections,
 fullUpstreamSkillInstalled:false,upstreamExecutableScriptsRun:false,
 techniquesReproducedExactly:false,
 noGlobalAgentSkillsInstalled:true,
 sourceOnlyCheckedInDisposableRunner:true,
 projectVisualReview:"SEPARATE",
 commercialRuntimeRights:"UNRESOLVED",
};
writeFileSync(destination,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
console.log("CINETIC_PINNED_SOURCE_VERIFIED",JSON.stringify({commit:actual,count:report.totalTechniques,selected:selections.map(x=>x.id)}));
