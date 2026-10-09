# Motion QA R&D — original deterministic visual diagnostics

**Scope:** a synthetic-only, dependency-free experiment. This is **not** a creative-style generator, existing animator replacement, or approval to use third-party examples.

Run on Node.js 24:

```bash
node --check experiments/motion-qa/frame-metrics.mjs
node --test experiments/motion-qa/tests/frame-metrics.test.mjs
```

Use `analyzeMotionFrames({frames,width,height,safeRect,...})` with **in-memory RGBA Uint8Array/Uint8ClampedArray frame samples**, only from authorized sources. It returns bounded metrics and aggregate findings. The caller is responsible for sampling frame timestamps and supplying any conservative 9:16 safe rectangle. No media paths, URLs, buffers, private screenshots or pixels are serialized into reports. The function never makes network or filesystem requests.

**Current checks:**

- Hard blockers: transparent blank poses where not deliberately exempted; visible alpha beyond a caller-defined safe rectangle.
- Review flags: conspicuous centroid jumps and runs of exact duplicate frames (except an explicitly allowed ending hold).
- Per-frame: visible alpha pixel count, alpha bounds, centroid, count/fraction of changed pixels; invisible RGB matte is ignored.
- Input guards: limited dimensions, sample count, data length and total pixel budget to avoid runaway workloads.

The `PASS` label means **only these sampled, technical heuristics passed**. Every report still carries `creative_approval: HUMAN_REVIEW_REQUIRED`. A deliberate long hold, jump, cut or transparent intro can be correct; adjustable thresholds/exemptions and visual review remain necessary. These checks cannot judge pacing, expressive motion, UI truth, originality, published platform safe-zones, licensing, or whether a finished advertisement is compliant.

This original code is independent of the external tools listed in [the adoption register in Draft PR #27](https://github.com/rayray12zx3-sys/ai-motion-studio/blob/docs/coordination-pre-reference-20261009/docs/TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) (file exists on coordination Draft PR #27, not yet main). The idea of separating a builder from a critic can be researched from MIT-licensed Motion Video Kit / Motion Designer, but **no code, example music, frames, video or third-party asset has been imported**. The license of any future runtime must be reviewed separately.

**Promotion gate:** first get exact-head GitHub Actions CI; then benchmark QA against only original synthetic frames with an operator-reviewed clip. Do not turn warnings into automatic art approval, install new paid tools, touch the private ad State Engine, or merge this isolated Draft PR without permission.
