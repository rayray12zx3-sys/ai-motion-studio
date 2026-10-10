# HyperFrames Studio GUI Edit -> Persist -> Render R&D Verification

**Status:** Isolated R&D experiment for native HyperFrames Studio browser editing. No changes to production dependencies, Canvas V1 renderer, default scripts, root `package.json`, or the private State Engine.

## Scope & Objective

Verify native HyperFrames Studio browser editing using real headless Chromium (Playwright), proving the full studio edit pipeline:
1. Serving the actual Studio GUI via `npx hyperframes@0.8.143 preview` on loopback.
2. Interacting with synthetic named timeline clips (`card-title`) via mouse pointer drag in real headless Chromium.
3. Confirming that Studio persists structured timing attributes (`data-start`, `data-duration`, `data-track-index`) directly to disk in `index.html`.
4. Reloading the Studio UI to verify the edited timing is retained.
5. Rendering pre-edit and post-edit video clips via `hyperframes render` and FFmpeg, confirming nonblank actual frame pixel differences at expected timestamps.
6. Recording separate execution flags (`STUDIO_RENDERED`, `NATIVE_CLIP_UI_CHANGED`, `ON_DISK_PERSISTED`, `REOPEN_PERSISTED`, `AFTER_EDIT_RENDERED`, `NATIVE_KEYFRAME_EDIT`).

## How to Run

```sh
node experiments/hyperframes-studio-edit/verify-studio-edit.mjs
```

## Acceptance (PENDING exact-head Actions on this corrected branch)

The original Jules PR #45 was not accepted as proof, because it targeted main and its script marked flags optimistically. This follow-up is based on verified Draft #39, preserves its complete 360p+1080p regression suite and requires actual native pointer drag, changed named-clip timing, exact GUI reload persistence and before/after rendering. The test MUST fail on an unsupported native editor, missing Chromium, source persistence, or CI time limit. Native keyframe editing remains unverified for CSS data-no-timeline.

## Jules' unverified initial claims (do not infer pass)

- **Studio GUI loaded & rendered (`STUDIO_RENDERED: true`):** Native Studio editor loaded in headless Chromium (`http://localhost:3099/#project/work`), rendering interactive timeline tracks and clips.
- **Native clip interaction (`NATIVE_CLIP_UI_CHANGED: true`):** Direct mouse pointer drag on named clip `card-title` shifted clip start time and updated track layout.
- **On-disk persistence (`ON_DISK_PERSISTED: true`):** Studio saved changed attributes (`data-start="0.15"`) to `index.html` on disk automatically.
- **Reopen persistence (`REOPEN_PERSISTED: true`):** Reloading Studio verified `data-clip-start="0.15"` was retained.
- **After-edit render verification (`AFTER_EDIT_RENDERED: true`):** Before and after MP4 clips rendered via `hyperframes render` showed distinct decoded frame pixel differences at frame 3 (t=0.1s).
- **Native keyframe/easing editing (`NATIVE_KEYFRAME_EDIT`):** Recorded as `NATIVE_KEYFRAME_EDIT_NOT_SUPPORTED_BY_THIS_FIXTURE` because CSS `data-no-timeline` animation clips do not expose native curve/easing keyframe controls in the Studio GUI without a registered GSAP timeline contract.
