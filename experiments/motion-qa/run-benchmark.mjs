// Standalone synthetic-only 9:16 motion QA acceptance; never reads input media.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {BENCHMARK_SCENARIOS,runOriginalMotionBenchmark} from './render-benchmark.mjs';

if(process.argv.length!==2)throw new Error('No external or private source input permitted');
if(Number(process.versions.node.split('.')[0])!==24)
  throw new Error('Node 24 required');
const expectation={
  baseline:{status:'PASS',code:null},
  blank:{status:'BLOCKED',code:'UNEXPECTED_EMPTY_FRAME'},
  'alpha-leak':{status:'BLOCKED',code:'ALPHA_OUTSIDE_DECLARED_SAFE_RECT'},
  teleport:{status:'REVIEW',code:'CENTROID_JUMP'},
  freeze:{status:'REVIEW',code:'UNEXPECTED_FREEZE'}
};
const scenarios=[];
for(const name of BENCHMARK_SCENARIOS){
  const evaluation=runOriginalMotionBenchmark(name);
  const expected=expectation[name];
  assert.equal(evaluation.report.status,expected.status,
    'Regression in synthetic '+name+' scenario');
  if(expected.code)assert.ok(evaluation.report.findings.some(f=>f.code===expected.code));
  scenarios.push({
    name,
    verdict:evaluation.report.status,
    metrics:evaluation.report.metrics,
    findings:evaluation.report.findings
  });
}
const doc={
  schema_version:1,kind:'ORIGINAL_SYNTHETIC_CANVAS_MOTION_QA',
  format:'METRICS_ONLY_NO_VIDEO_OR_SOURCE_PIXELS',
  generated_by:'experiments/motion-qa/run-benchmark.mjs',
  sampled_frames_per_scenario:80,
  profile:{width:180,height:320,fps:30},
  successful_scenarios:scenarios.length,
  creative_approval:'HUMAN_REVIEW_REQUIRED',
  software_adoption:'EXPERIMENT_ONLY',
  all_expected_heuristic_signals_passed:true,
  scenarios
};
const json=JSON.stringify(doc,null,2)+'\n';
const dest=resolve('out/motion-qa-synthetic-benchmark');
mkdirSync(dest,{recursive:true});
writeFileSync(join(dest,'benchmark.json'),json,{flag:'w'});
console.log('MOTION_QA_ORIGINAL_CANVAS_BENCHMARK_PASS',JSON.stringify({
  synthetic_scenarios:scenarios.length,frames_each:80,
  verdicts:scenarios.map(x=>({name:x.name,status:x.verdict,
    findings:x.findings.map(y=>y.code)})),
  report_sha256:createHash('sha256').update(json).digest('hex'),
  retained_source_media:false,
  creative_approval:'HUMAN_REVIEW_REQUIRED'
}));
