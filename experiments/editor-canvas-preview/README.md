# S4 (partial) — isolated neutral scene to Canvas frame feasibility

**Purely synthetic in-memory preview. NOT production Canvas+FFmpeg integration or video parity.**

This small opt-in adapter uses the root project's **already installed** `@napi-rs/canvas` and the existing locked `fontFamily`/`validateSpec` checks from `src/free/scene.mjs`, without touching production files or the Node package/lock graph.

- Input: S1 `editable-scene-v1` validated JSON, with all media imports still forbidden.
- Frame: S1 `evaluateEditableFrame` gives immutable per-frame rectangles and bounded text. A self-authored Canvas painter renders an intentionally simple, original synthetic composition with normalized translation, scale, rotation, opacity, a locked font and a fixed opaque background. The painter's geometry **is not** the official current renderer composition.
- Output: in-memory Canvas RGBA pixels only, no file output, FFmpeg integration, ProRes/MP4 export, remote media or private company material.
- Scaling: checks matching aspect ratio from original 360×640 to 1080×1920; no claim of visual approval or encoding/alpha parity.
- Test: 30 original 360×640 frames have deterministic SHA-256 independent of random frame seek; edited/reopened S3 frame sequence ([8,27), keyframes 8/12/26) also reproduces identical pixels after serialization while visibly differing at expected frames; sample opaque RGBA alpha is 255; 1080×1920 frames are deterministic.
- **Critical production invariance check:** `drawFrame(profiles.smoke,12)` from the original Canvas production renderer yields exactly the same PNG bytes before and after all experimental preview tests. This does not compare a new neutral scene frame to existing renderer pixel semantics, because the schemas/shapes and art direction are different.

## Unresolved product gates

This is **not** the full S4 milestone. Before production adoption, the owner must separately approve any public SceneSpec compiler/renderer API or dependency migration; full 30fps encoded MP4/1080×1920 ProRes 4444 Alpha parity, preview vs actual pixels, actual Windows Premiere import and safe-area checks, licensed real media provenance and visual/editor usability remain open.

Run `node --test tests/editor-canvas-preview.test.mjs` or the repository's normal `npm test`. No additional package installation should be required beyond the existing root's pinned dependencies and existing CI. Everything in public GitHub Actions uses original synthetic shapes and text, never company inputs.
