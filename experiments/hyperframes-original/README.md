# HyperFrames isolated renderer benchmark (original content only)

**Status:** R&D Draft, not deployed or merged. No changes to Canvas V1, the existing main MP4 path, M12 artwork, commercial advertisements, licenses, or the private State Engine.

Goal: compare the ability of an HTML/CSS native composition renderer to produce a deterministic, 1-second 360×640 / 30fps H.264 clip against the existing Canvas+FFmpeg stack. The scene is an **original abstract UI card**, not a copy of any product, screenshot, third-party gallery or employer asset.

Upstream: [HeyGen HyperFrames](https://github.com/heygen-com/hyperframes) source `LICENSE`: Apache-2.0, as checked 2026-10-10. GitHub [CLI docs](https://github.com/heygen-com/hyperframes/blob/main/packages/cli/README.md) describe `lint`, `render -c` and direct MP4 output. The upstream CLI `packages/cli/package.json` at lookup advertised `0.8.143`; this experiment requests precisely `hyperframes@0.8.143` **only in a disposable Actions runner via npx**. If npm does not publish an identical CLI at that version, the workflow must fail and the mismatch be recorded, not silently fall back to `latest`.

To run manually in a sandbox (Node >=22 with Chrome and FFmpeg installed, exact upstream npm version required):

```sh
npx --yes hyperframes@0.8.143 lint experiments/hyperframes-original --json
cd experiments/hyperframes-original
npx --yes hyperframes@0.8.143 render -c index.html -o ../../out/hyperframes-original.mp4 --fps 30 --quality draft
```

The project CI uses `verify.mjs` to check emitted H.264 codec, 360×640 dimensions, 30fps, 30 frames, SHA-256, and that the source HTML contains no external files/scripts/media embeds. Synthetic output may be shared as a short-retention public GitHub Actions artifact; **no input media or private company data is used**.

## What this does *not* prove

- It does **not** prove better-looking animation, performance parity, deterministic randomness, transparent output, or editable keyframe UI than the current Canvas engine; these need separate measurements and human inspection.
- Apache-2.0 permission covers the upstream source under its terms, not third-party gallery clips, music, logos, package dependencies, chromedriver, codecs or trademark rights. Preserve software notices when distributing software.
- No HyperFrames version, agent skill or packaged artwork has been imported into main. Npx may install transitive tools temporarily; production licence/lock review is needed separately before any adoption.
- No changes to the existing professional video project or M11/M12 creative work; no merge/production promotion without explicit substantive approval.

On failure, inspect the first failing stage (registry version, lint, Chromium/FFmpeg installation, render contract or ffprobe), fix in isolation, rerun on exact HEAD, and only then record it as verified in the GitHub PR and main handoff.


## Actual verified benchmark — 2026-10-10

- Upstream CLI `hyperframes@0.8.143` resolved from npm, [lint](https://github.com/heygen-com/hyperframes/blob/main/packages/cli/README.md) returned **0 errors / 1 warning** (`nested_structure_needs_subcomposition`: the one-layer synthetic nested `section` is not ideal for advanced Studio timeline editing). This does **not** claim native editable object tracks are ready; fix proper sub-composition architecture before promoting to any editor workflow.
- Initial [CI #37964692171](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37964692171) failed because original HTML omitted `data-no-timeline`; CLI correctly required either a registered `window.__timelines` or the explicit no-JS-timeline attribute. A separate [CI #37964814796](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37964814796) then passed lint but the render failed because the CLI could not find executable `ffmpeg`/`ffprobe` on runner PATH, despite the project having local binary packages. The Actions workflow was corrected to expose the existing **hash-verified pinned encoder and probe** only in its ephemeral runner PATH.
- [Passing render #37964963043](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37964963043): original synthetic CSS motion rendered H.264 360×640 / 30fps / 30 frames / 1 second. MP4 SHA-256 `62cbd5e212364ff941752d7a3c69b64f14a9668bf65c4533b4fd06cd7a6c213d`, 26,026 bytes. Source contains no external media/scripts/URLs. CLI remains isolated, no changes to `package.json` or Canvas main.
- [Pixel-motion-gated exact-head CI #37965164587](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37965164587) plus [root CI #37965164487](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37965164487) **PASS** at commit `88ce0aabb532fc40778a7f864245f62187cfeb55`. FFmpeg separately decoded raw RGB at frames **0 / 15 / 29**, validated exact byte length and verified **all three SHA-256 values are different**. It is a genuine moving composition; mere existence of an MP4 is not counted as animation success. The video file hash was unchanged by the stricter test.
- GitHub Actions [original-video artifact](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37965164587/artifacts/11632699175) contains only our original synthetic MP4 and a JSON metrics report; short 2-day retention. The ZIP was retrieved and its MP4 content verified against the report. **A Google Drive playable preview upload was attempted but could not be verified** due to a container-session error in file transfer; do not invent or publish a private Drive ID. GitHub proof is the available delivery at this checkpoint.
- **Result: isolated HTML renderer feasibility and actual frame-to-frame motion PASS, Studio editability and visual art quality still NOT EVALUATED, commercial adoption NOT AUTHORIZED.** Do not silently replace Canvas+FFmpeg, install skills globally or merge the R&D Draft as production.


## Flat, named timeline-layer QA — 2026-10-10

The first render's one lint warning (`nested_structure_needs_subcomposition`) was **resolved in the R&D example** without importing third-party code or restructuring the main engine. The original synthetic composition now uses **five sibling, stable-ID top-level `class=clip` tracks** (`card-body`, `card-title`, `card-label`, `progress-base`, `progress-fill`) instead of a nested section that prevented distinct timeline targets. This is still plain CSS seekable motion and is **not** proof of native Studio drag editing.

**Exact code HEAD `b4098490dd0fdd2cdf6b76a08fcc5540aea65840`:** [isolated HyperFrames CI #37965759749](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37965759749) and [root CI #37965759797](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37965759797) both **PASS**. Upstream CLI `0.8.143` now reports **0 errors / 0 warnings**, still renders H.264 360×640, 30fps, 30 frames, and separately decoded 0/15/29 frame RGB SHA-256 values remain all distinct (actual motion). Revised scene MP4 hash `dfe6e06c7082d8f391dddbd40027010c2b7c1214591e75cee79551fef7df15d4`, 25,539 bytes. Layout/composition changed intentionally, so the video hash differs from the earlier nested-scene render.

**Open:** no test yet for native interactive Studio editing, user creative approval, commercial package+transitive notice distribution, alpha output, multi-scene transition quality, or performance comparison on a matching Canvas brief. This is a technical feasibility proof only and is intentionally kept on a separate Draft PR.


## Independent full-frame determinism — verified

- After the initial 3-frame independent-render parity passed on [CI #37966633133](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37966633133), the verification script was tightened to decode **all 30 RGB frames** of **two separate CLI renders** and compare their SHA-256 at the same frame indices.
- Exact code HEAD `935639fdf3bc9bb3d7b7cacb8ef9220cb3768615`: [HyperFrames Actions #37968600800](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37968600800) and [root CI #37968601118](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37968601118) both **SUCCESS**. `decoded_frames_compared=30`; **30/30 exact decoded-frame hashes equal across render runs**, yet all 30 frames inside each clip have distinct hashes (real motion). Full decoded-sequence hash `c00bd249fbedb9ec94d500f519d09acb819830eff137db9b6bd97f5ba0aefc47`.
- MP4 source file hash remained `dfe6e06c7082d8f391dddbd40027010c2b7c1214591e75cee79551fef7df15d4`. Test asserts full decoded stream length (30 × 360 × 640 × RGB3) so a partially truncated video cannot pass by matching three samples.
- This is **within one GitHub Actions environment at one 360×640 1-second profile**; cross-machine GPU/Chrome/font reproducibility, Studio GUI keyframe changes, stable 1080×1920 6-second multilayer compositions, asset licences and subjective design quality are still not verified.
