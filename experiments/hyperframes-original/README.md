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
