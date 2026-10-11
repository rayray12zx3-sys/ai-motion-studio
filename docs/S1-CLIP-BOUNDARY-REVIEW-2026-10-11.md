# S1 clip-boundary motion audit (optional, read-only)

## Scope and motivation

The original `experiments/editor-contract/original-synthetic.json` is a technical regression fixture. Its `headline` clip ends at frame **26**, and its `accent` clip ends at frame **20**, although both still have opacity **1** on their final active frame. The existing correct S1 half-open clip evaluator excludes them at the next frame, creating a visible discontinuity. This is **not evidence of an FFmpeg bug** and the original test fixture must not be silently rewritten.

This small **pure-data review diagnostic** raises review-only `VISIBLE_CLIP_EXIT` warnings when a clip ends *before* the video ends but its last keyframe remains more opaque than a bounded threshold. Likewise `VISIBLE_CLIP_ENTRANCE` warns for a nonzero-starting clip whose first keyframe is already visible. The severity is `REVIEW_ONLY`: intentional hard cuts can be valid editorial decisions, and an opacity change is not a sufficient quality metric.

## Run from the repository root

```powershell
node scripts/audit-editable-motion.mjs experiments/editor-contract/original-synthetic.json
node --test tests/editor-motion-audit.test.mjs
```

A machine-readable JSON report prints to your own terminal. The CLI neither mutates a scene nor emits/publishes media; it reads only the explicitly supplied bounded local S1 scene file. CI uses synthetic fixtures only. Original scene geometry, editor saves, frame hashes, codecs, render report and output are unaffected.

Expected baseline: two exit advisories (`headline` at 26, `accent` at 20), not a failing build. A clip ending exactly at the final video boundary does not warn, since no following frame exists. The threshold may be adjusted for manual diagnosis but must stay strictly between 0 and 1.

**Limitations:** no WYSIWYG claim, no contrast/safe-zone/camera/shape/timing artistic grading, no exhaustive motion assessment, no built-in export trigger, and no Premiere/native player testing. A smooth fade can still look poor. Full-speed human review and independently authorized visual changes remain separate.

This is independent of the frozen M11/M12 artistic drafts and the unmerged optional six-second PR #93; it introduces no external engine, package or media and does not replace any existing Motion QA R&D branch.
