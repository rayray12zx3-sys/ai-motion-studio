# S1 — isolated neutral scene data research

**Status:** Experimental **pure-data** exchange only. Not a production schema, visual editor, renderer, license grant or approved migration.

The versioned `editable-scene-v1` fixture has 30fps integer timing, closed-open clip intervals `[start_frame,end_frame)`, persistent IDs, deterministic layer order, normalized x/y/scale/rotation/opacity, bounded keyframes and named easing. Public functions are `validateEditableScene`, `evaluateEditableFrame`, `moveEditableLayer`, `parseEditableScene` and `serializeEditableScene`. `moveEditableLayer` is an **immutable** shift of a clip's start/end and keyframes. Parsing and serialization permit a synthetic save/reopen roundtrip; there is **no filesystem editor save** here.

## Explicit exclusions

- Imported image/audio/font assets are not allowed: the `assets` array **must be empty**. Rights proofs and local content hashes require a future separate gated design.
- No network, new npm packages, GUI dependencies, GSAP, HyperFrames Studio, Theatre Studio, copying third-party UI/assets, real company input or private URLs/IDs.
- No changes to `src/free`, production `scripts/render.mjs`, root `package.json`/`package-lock.json`, shipped Canvas+FFmpeg videos, artistic direction or Windows Premiere.
- Exact fps/profile and direct frame calculations here do **not** guarantee final canvas pixel parity, keyframe curve UI, full renderer integration, or commercial media rights.

## Distinction from existing stacks

Draft [M3 PR #13](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/13) already uses `validateMultiObjectSpec`, 360–450-frame object/camera motions, and easing `linear/precise`. Draft [M7 PR #20](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/20) already compiles bounded `MotionBrief` into its own advanced SceneSpec. **S1 does not replace either one**. Its `ease-out-cubic` and 30-frame test fixture are independently named. Any future import from M3 or M7 requires explicit type, transform, timing, and easing conversion tests.

## Verification

Run `node --test tests/editor-contract.test.mjs` or `npm test` from repo root. Test cases check frames 0, 15, 29, randomly sought/reversed frames, exact frame-time clip move and JSON roundtrip, stable z/ID sorting, deliberately overlapping clips, and refusal of unknown fields, imported media, invalid timing, nonfinite transforms, unsupported profiles, and malformed JSON. Root CI checks the source and regression tests at an exact PR head. No main merge of this R&D experiment is implied by technical CI success.

Next stage S2 is a **separate** Konva sandbox, pinned-version/NOTICE/transitive license reviewed before dependency installation or production inclusion. See [roadmap](../../docs/EDITOR-SEPARATION-ROADMAP-2026-10-10.md).
