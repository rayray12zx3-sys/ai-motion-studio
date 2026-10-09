# Motion QA R&D — original deterministic visual diagnostics

**Scope:** a synthetic-only, dependency-free experiment. This is **not** a creative-style generator, existing animator replacement, or approval to use third-party examples.

Run on Node.js 24:

```bash
npm ci --ignore-scripts --no-audit --no-fund
node --check experiments/motion-qa/frame-metrics.mjs
node --check experiments/motion-qa/render-benchmark.mjs
node --test experiments/motion-qa/tests/*.test.mjs
node experiments/motion-qa/run-benchmark.mjs
```

Use `analyzeMotionFrames({frames,width,height,safeRect,...})` with **in-memory RGBA Uint8Array/Uint8ClampedArray frame samples**, only from authorized sources. It returns bounded metrics and aggregate findings. The caller is responsible for sampling frame timestamps and supplying any conservative 9:16 safe rectangle. No media paths, URLs, buffers, private screenshots or pixels are serialized into reports. The function never makes network or filesystem requests.

**Current checks:**

- Hard blockers: transparent blank poses where not deliberately exempted; visible alpha beyond a caller-defined safe rectangle.
- Review flags: conspicuous centroid jumps and runs of exact duplicate frames (except an explicitly allowed ending hold).
- Per-frame: visible alpha pixel count, alpha bounds, centroid, count/fraction of changed pixels; invisible RGB matte is ignored.
- Input guards: limited dimensions, sample count, data length and total pixel budget to avoid runaway workloads.

The `PASS` label means **only these sampled, technical heuristics passed**. Every report still carries `creative_approval: HUMAN_REVIEW_REQUIRED`. A deliberate long hold, jump, cut or transparent intro can be correct; adjustable thresholds/exemptions and visual review remain necessary. These checks cannot judge pacing, expressive motion, UI truth, originality, published platform safe-zones, licensing, or whether a finished advertisement is compliant.

This original code is independent of the external tools listed in [the adoption register in Draft PR #27](https://github.com/rayray12zx3-sys/ai-motion-studio/blob/docs/coordination-pre-reference-20261009/docs/TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) (file exists on coordination Draft PR #27, not yet main). The idea of separating a builder from a critic can be researched from MIT-licensed Motion Video Kit / Motion Designer, but **no code, example music, frames, video or third-party asset has been imported**. The license of any future runtime must be reviewed separately.

## Real rendered original animation benchmark

- `render-benchmark.mjs` draws a new, deterministic **180×320 / 9:16 / 30fps / 80-frame** original Canvas animation (not a borrowed APP interface or video).
- `run-benchmark.mjs` repeats 80 frames under **five** bounded scenarios: baseline, blank, alpha-leak, teleport, freeze (**400 real drawn frames** in total). It never accepts an external source file or URL.
- The approved baseline permits an intentional **20-transition ending hold** and produces no false freeze alarms; defect scenarios must trigger exactly their intended technical alert class. This is a narrow false-positive / sensitivity benchmark, not a comprehensive grading of art.
- `out/motion-qa-synthetic-benchmark/benchmark.json` is a **metrics-only** machine-readable report: frame count, visible alpha/centroid/bounds/change counts, findings, severity and human-review-required marker. It excludes pixels, source files, company paths, music, and visual media.
- [GitHub isolated benchmark CI #37951143429](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37951143429) passed at commit `6a1df593dc8ce79c3a6a9d27e930a768a6c0a5af` (plus [root CI #37951143438](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37951143438)). Artifact `motion-qa-synthetic-report` id `11625758270` expires; the regression is reproducible from code.
- The initial benchmark run **failed intentionally strict scenario expectations** because the injected teleport also caused an alpha safe-zone leak. The fixture was corrected to a large *within-zone* position jump (`cardX=106`); the separate alpha-leak scenario remains independently blocked. Do not treat that initial failure as a source-engine defect.

## Remaining before production adoption

The source is an R&D prototype in [Draft PR #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) and is **not yet integrated into M11/M12 or company ads**. Benchmark actual original operator-reviewed motion clips later, calibrate cuts/transitions/intentional holds and safe areas per approved target platform, then require owner approval for release. The terminal status `PASS` never replaces full-speed aesthetic judgment or company editorial truth checks.

**Promotion gate:** first get exact-head GitHub Actions CI; then benchmark QA against only original synthetic frames with an operator-reviewed clip. Do not turn warnings into automatic art approval, install new paid tools, touch the private ad State Engine, or merge this isolated Draft PR without permission.
