import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
  BENCHMARK_PROFILE,BENCHMARK_SAFE_RECT,BENCHMARK_SCENARIOS,
  renderOriginalSample,generateBenchmarkFrames,runOriginalMotionBenchmark
} from '../render-benchmark.mjs';

const sha=data=>createHash('sha256').update(data).digest('hex');

test('renders a real original 9:16 Canvas sample at each 30fps frame',()=>{
  assert.equal(BENCHMARK_PROFILE.width*16,BENCHMARK_PROFILE.height*9);
  assert.equal(BENCHMARK_PROFILE.fps,30);
  assert.equal(BENCHMARK_PROFILE.frames,80);
  const frame=renderOriginalSample(22);
  assert.ok(frame instanceof Uint8ClampedArray);
  assert.equal(frame.byteLength,180*320*4);
  assert.equal(sha(frame),sha(renderOriginalSample(22)));
  assert.notEqual(sha(frame),sha(renderOriginalSample(23)));
  assert.equal(sha(renderOriginalSample(59)),sha(renderOriginalSample(79)),
    'Ending hold must retain the same pixels');
  assert.throws(()=>renderOriginalSample(-1),/Invalid synthetic/);
  assert.throws(()=>renderOriginalSample(80),/Invalid synthetic/);
  assert.throws(()=>renderOriginalSample(1,{scenario:'external'}),/Invalid synthetic/);
});

test('real rendered baseline has no false positive on an intentional ending hold',()=>{
  const out=runOriginalMotionBenchmark('baseline');
  assert.equal(out.scenario,'baseline');
  assert.equal(out.report.status,'PASS');
  assert.equal(out.report.creative_approval,'HUMAN_REVIEW_REQUIRED');
  assert.equal(out.report.metrics.length,80);
  assert.deepEqual(out.report.safe_rect,BENCHMARK_SAFE_RECT);
  assert.ok(out.report.metrics.every(m=>m.visible_pixels>20));
  assert.ok(out.report.metrics.every(m=>m.unsafe_alpha_pixels===0));
  assert.deepEqual(out.report.findings,[]);
  assert.equal(out.report.metrics.at(-1).changed_pixels_from_previous,0);
  assert.deepEqual(runOriginalMotionBenchmark('baseline'),out);
});

const probes=[
  ['blank','BLOCKED','UNEXPECTED_EMPTY_FRAME'],
  ['alpha-leak','BLOCKED','ALPHA_OUTSIDE_DECLARED_SAFE_RECT'],
  ['teleport','REVIEW','CENTROID_JUMP'],
  ['freeze','REVIEW','UNEXPECTED_FREEZE']
];
for(const [scenario,status,code] of probes){
  test('real Canvas '+scenario+' reliably detects '+code,()=>{
    const output=runOriginalMotionBenchmark(scenario);
    assert.equal(output.report.status,status);
    assert.ok(output.report.findings.some(x=>x.code===code),
      JSON.stringify(output.report.findings));
    assert.equal(output.report.creative_approval,'HUMAN_REVIEW_REQUIRED');
    assert.equal(output.report.source_media_retained,false);
    assert.equal('frames' in output,false,'Do not serialize source RGBA data');
    assert.equal('frames' in output.report,false,'Do not serialize source RGBA data');
  });
}
test('benchmark uses only bounded deterministic scenario names and no file/video input',()=>{
  assert.deepEqual(BENCHMARK_SCENARIOS,[
    'baseline','blank','alpha-leak','teleport','freeze'
  ]);
  assert.throws(()=>generateBenchmarkFrames('https://example.test/video.mp4'),/Unsupported/);
  assert.throws(()=>generateBenchmarkFrames('../company-private'),/Unsupported/);
});
