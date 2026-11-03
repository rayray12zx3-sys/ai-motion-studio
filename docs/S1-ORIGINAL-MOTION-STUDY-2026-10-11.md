# Optional original-synthetic S1 motion study (6 seconds)

**Status: REVIEW CANDIDATE ONLY — NO CREATIVE APPROVAL.** This is a separate sample, not a replacement of the original 30-frame regression fixture, official Canvas+FFmpeg renderer, existing editor scene or any frozen M11/M12 art.

## Why this exists

The regression fixture `experiments/editor-contract/original-synthetic.json` intentionally ends its headline at frame 26 and its accent at frame 20 with nonzero opacity, so those layers visibly cut off. That is a valid half-open clip test but not a reasonable example of polished motion direction.

The opt-in `experiments/editor-contract/motion-study-original.json` is an original, asset-free, vertical **360×640 / 30 fps / 180-frame (6-second)** S1 v1 scene with two sequential typography-and-accent beats followed by a short credit. Every layer begins and ends at opacity 0 with an intermediate hold and bounded movement. It demonstrates intentional exits without silently changing clip semantics or the renderer.

**Important limitations:** the underlying S1 painter has fixed-size center-anchored rectangles, bounded typography and two easing modes only. This study does **not** prove full motion-graphics design quality, arbitrary shape/layout controls, professional typography, sound, camera motion, visual WYSIWYG with Konva proxies, native Premiere acceptance or rights clearance for future non-synthetic assets.

## Run locally (Node 24, existing pinned installation)

From the root directory after following `editor/README.md` to install the **existing** root packages and verified encoder:

```powershell
node --test tests/editor-motion-study.test.mjs
node scripts/render-editable.mjs experiments/editor-contract/motion-study-original.json s1-motion-study-mp4 mp4
node scripts/render-editable.mjs experiments/editor-contract/motion-study-original.json s1-motion-study-alpha alpha
```

Use new unique run IDs if those ignored output directories already exist; **do not delete or overwrite local outputs**. These commands never replace `editor/.local/scene.json` or your current localhost editor view. To try editing the example, first use an isolated local editor scene file/checkout with a new output directory and protect any existing ignored local scene; the current editor is intentionally not a general-purpose JSON importer.

Outputs reside only in ignored `out/editable-s1-motion-study-*/` and contain video, deterministic frame hashes, at most 12 sampled review PNGs, an event-labeled contact sheet and a render report. The contact sheet is **SAMPLED_NOT_FULL_QC**.

## CI review artifact

A separate pull-request workflow, `s1-motion-study-preview.yml`, performs a strict-head Linux encode of the new, **public original synthetic fixture only**, producing H.264 MP4 and ProRes 4444 Alpha MOV. Its seven-day artifact lets the owner watch the candidate without using private media. The existing 1-second CI fixture and default outputs remain unchanged.

## Human review gate

Watch the **complete 6-second MP4** before making any claim about animation quality. Check that entrances/exits have no sudden pop, that headline timing is readable, and that the visual pacing feels intentional. Inspect the Alpha MOV or sampled transparent review PNGs separately for compositing. Record specific objections rather than claiming all-motion-quality PASS from unit tests. Keep this example optional until a human explicitly accepts its direction.

Reference-only Issue #91 (Skillry) is unrelated and has not been consulted or copied. No engine integration, third-party assets, commercial approval, merged art decision or production video is granted by this document.
