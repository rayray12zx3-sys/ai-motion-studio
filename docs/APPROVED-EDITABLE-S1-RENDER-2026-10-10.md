# Operator-approved opt-in S1 scene → Canvas+FFmpeg (2026-10-10)

**Explicit operator approval:** Adopt a *new optional* adapter to turn the existing audited `editable-scene-v1` neutral scene saved by the local Konva editor into actual video using **the same existing local Canvas + hash-verified FFmpeg engine family**. Do not change the original `scripts/render.mjs`, old locked `{title,subtitle}` SceneSpec, any default route, root package/lockfile, private assets, external plugins or M11 rejected/M12 frozen art. This operator approval **does not approve** new arbitrary Bezier schema v2 or new media imports.

## Architecture and strict compatibility

`editor/.local/scene.json` → `parseEditableScene` / `validateEditableRenderScene` → `evaluateEditableFrame(scene, frame)` → **`src/free/editable-scene.mjs`** (same installed `@napi-rs/canvas`, locked `@fontsource/noto-sans-tc`, neutral layers) → separate **`scripts/render-editable.mjs`** → existing hash-verified pinned `ffmpeg-static` / `ffprobe-static` → H.264 MP4 or ProRes 4444 Alpha MOV.

The new mode implements only **S1 v1**: up to 16 rect/text layers, layer z-order and half-open clip ranges, per-key x/y/scale/rotation/opacity, existing linear/ease-out-cubic interpolation, strict RGB hex colors, current four fixed source canvas dimensions, 30fps and at most 1800 frames. It uses a self-authored fixed rectangle footprint because S1 v1 has no user-editable dimensions. The locked font guard disallows unsupported glyphs on export, even when a browser input previously accepted the text. `assets:[]` only; any media URL/import or arbitrary/unknown scene fields are rejected. Never silently delete unsupported scene layers or approximate a custom Bezier.

**Canonical video pixels for this new opt-in S1 mode are derived from this Canvas painter, not Konva.** Konva's current visual objects are *selection-position proxies*, not WYSIWYG text, colors, sizes or final motion-blur. The legacy `drawFrame(profile,frame,{title,subtitle})` continues to produce its exact existing fixed layouts/gradients and is **not** converted; no false parity with those layouts is claimed.

## Run on your own computer (without admin)

From a clean checkout root with Node 24, after installing existing root pinned dependencies and existing pinned encoder:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node scripts/setup-encoder.mjs
# First use the locally saved neutral editor scene; never commit this private file:
node scripts/render-editable.mjs editor/.local/scene.json local-first mp4
# For a separate local Alpha video from the same scene:
node scripts/render-editable.mjs editor/.local/scene.json local-alpha alpha
```

The output goes only into ignored `out/editable-local-first/` or `out/editable-local-alpha/` respectively, with one video, review-frame PNGs, a contact sheet and `render-report.json`. **Every run ID must be unique:** output directories are never overwritten. Choose only a bounded lowercase `a-z0-9-` label beginning with a letter, or the tool rejects it.

The renderer never accepts URLs or makes runtime network requests. `scripts/setup-encoder.mjs` is the existing **installation-only**, SHA-256 verified encoder provisioning step; it may download from its known release endpoint only at setup, not when exporting. Do not put media/user/company materials into the public repository or public CI.

CI uses only `experiments/editor-contract/original-synthetic.json`, runs a real MP4 + ProRes 4444 Alpha 30-frame smoke, ffprobe count/dimensions/fps/codec/format checks, SHA-256 frame/report checks, H.264 decoded channel-error bound and decoded transparent/visible Alpha checks. Existing official renderer unit and root CI must remain green. CI artifacts are synthetic only with 7-day retention.

## Additional permitted usability integration — opt-in local GUI export

The authorized S1 Canvas+FFmpeg path may also be invoked by the operator **from the separately installed local Konva editor GUI**. This is not new engine adoption: it calls the exact already-approved `scripts/render-editable.mjs` CLI through Node's `spawn` with fixed trusted arguments; no untrusted shell, media file path, browser-provided output directory, provider access or new runtime dependencies. The scene is snapshotted from persisted canonical JSON after exact ETag validation, and the transient private snapshot is deleted when the encode finishes. A unique output run directory is always generated under ignored `out/`; a second simultaneous browser export is refused, and the UI shows status and relative file paths.

This option must be gated by original-synthetic, real hosted Windows Chrome/Edge + Linux Chrome browser clicks, actual native MP4 and ProRes Alpha, scene hash/version conflict, foreign-origin/body/mode refusals, generated video metadata/codec/frame checks, snapshot cleanup, clean editor-only install behavior and all existing renderer regressions. If it fails, do not promote the GUI export as complete. It remains opt-in and does not alter any default video output.

## Not yet approved or completed

- **WYSIWYG** editor geometry or exact letterform/pixel parity with the Konva UI (currently proxies).
- Arbitrary Bezier control points/S1 schema v2, image/video/audio import or production license/provenance clearance.
- True editing-time audio track + captions/commercial script/media integration, motion blur beyond authored v1 law, human art/safe-zone review.
- Real Windows Premiere Pro import/composite on the user's exact software and GPU. Encoded ffprobe/QC does not prove Premiere acceptance.
- Commercial output approval: renderer report explicitly remains `UNAPPROVED`.

For related research, see [independent evaluation of the 20 X-linked repositories](X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md). **No external engine, skill repository, media asset or package is imported from the list.**
