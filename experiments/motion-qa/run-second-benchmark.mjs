// Second fully original Canvas benchmark with explicit storyboard-intent annotations.
// No external media inputs, URLs, user/company assets, or raw-frame report storage.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {
  SECOND_PROFILE,SECOND_SCENARIOS,analyzeSecondOriginalComposition
} from './render-second-benchmark.mjs';

if(process.argv.length!==2)throw new Error('External benchmark sources not supported');
if(Number(process.versions.node.split('.')[0])!==24)
  throw new Error('Node 24 required');
const expected={
  'approved-edit': ['PASS',null],
  'undeclared-cut': ['REVIEW','CENTROID_JUMP'],
  'undeclared-hold': ['REVIEW','UNEXPECTED_FREEZE'],
  'blank-at-cut': ['BLOCKED','UNEXPECTED_EMPTY_FRAME'],
  'alpha-leak-at-cut': ['BLOCKED','ALPHA_OUTSIDE_DECLARED_SAFE_RECT'],
  'midscene-freeze': ['REVIEW','UNEXPECTED_FREEZE']
};
const cases=[];
for(const scenario of SECOND_SCENARIOS){
  const {report}=analyzeSecondOriginalComposition(scenario);
  const [status,alert]=expected[scenario];
  assert.equal(report.status,status,scenario+' unexpected QA status');
  if(alert)assert.ok(report.findings.some(f=>f.code===alert),
    scenario+' missing '+alert);
  assert.equal(report.creative_approval,'HUMAN_REVIEW_REQUIRED');
  cases.push({
    scenario,status:report.status,
    storyboard_intent:report.declared_editor_intent,
    metrics:report.metrics,findings:report.findings
  });
}
const report={
  schema_version:1,format:'METRICS_ONLY_NO_SOURCE_FRAMES',
  kind:'SECOND_ORIGINAL_CANVAS_CUT_AND_HOLD_BENCHMARK',
  profile:SECOND_PROFILE,
  generated_frames:SECOND_PROFILE.frames*cases.length,
  scenario_count:cases.length,
  source_media_retained:false,
  creative_approval:'HUMAN_REVIEW_REQUIRED',
  all_expected_signals_passed:true,
  cases
};
const json=JSON.stringify(report,null,2)+'\n';
const dir=resolve('out/motion-qa-synthetic-benchmark');
mkdirSync(dir,{recursive:true});
writeFileSync(join(dir,'secondary-benchmark.json'),json,{flag:'w'});
console.log('MOTION_QA_SECOND_ORIGINAL_BENCHMARK_PASS',JSON.stringify({
  generated_frames:report.generated_frames,
  cases:cases.map(c=>({scenario:c.scenario,status:c.status,
    finding_codes:c.findings.map(f=>f.code)})),
  sha256:createHash('sha256').update(json).digest('hex'),
  raw_frames_saved:false,
  art_approval:'HUMAN_REVIEW_REQUIRED'
}));
