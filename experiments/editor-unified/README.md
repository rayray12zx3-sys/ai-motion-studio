# S4 — shared synthetic Konva canvas + DOM timeline research

**Status:** Isolated R&D browser proof only; **not a production editor or permission to integrate software/media**.

## Intent and boundaries

This is the first synthetic interaction fixture placing a real Konva 10.7.1 canvas and the independent native-DOM S3 timeline on the **same** validated `editable-scene-v1` JSON state. It reuses S1 `scene.mjs`, S3 `timeline.mjs`, and the tested Konva package pin; it does not copy GSAP/HyperFrames Studio assets or require React Timeline Editor. The Konva rectangle is an original **abstract proxy** for the `headline` object, not a claim of accurate exported typography.

A temporary loopback Node server saves JSON to an ephemeral OS temporary directory. The isolated GitHub Actions workflow runs actual Chromium pointer operations. CI uses only the public original-synthetic fixture and returns a synthetic screenshot and JSON report (7-day retention). No company media, third-party fonts/icons, private URLs/IDs, Windows Premiere operation, production renderer modification, package lock changes or new root dependencies.

The Chrome test must prove in order:

1. A real pointer moves the `headline` timeline clip from `[4,26)` to `[6,28)`.
2. A real pointer trims its right edge to `[6,26)`.
3. A real pointer drags the Konva shape +36px/+16px, shifting both keyframe x/y values together **as one atomic undo unit**.
4. Undo restores the preceding canvas position, while Redo restores the modified position. Both timeline and canvas read the same in-memory state. Five local saves are confirmed.
5. An unknown remote-media asset POST is rejected, the saved SHA-256 stays intact, and a page reload reconstructs the **same** start/end, keyframes and moved canvas position.
6. All existing root CI tests must remain green at the exact PR head. The packed Konva browser runtime has a fixed actual npm SHA-512 from the previously verified MIT archive. Playwright Core 1.55.0 (Apache-2.0) is only a temporary CI test driver.

This **does not** prove a finished professional visual editor, text rendering, native easing/Bezier-curve editor, production Canvas+FFmpeg pixel/video parity, ProRes 4444 Alpha, source-image/music rights, external media ingestion, responsive interaction performance or Windows Premiere validation. No root `package.json` / `package-lock.json`, `src/free`, `scripts/render.mjs`, art-review output or private State Engine may change.

## S4 linked persisted-scene → FFmpeg test (Draft)

After the actual pointer/Undo/Redo and remote-asset-rejection checks pass, the browser harness emits only the validated original synthetic JSON to ignored `out/unified-editor-scene.json`. The same job installs **existing root packages only**, verifies the already-pinned FFmpeg executable and sends **that exact browser-saved scene** into `node experiments/editor-ffmpeg/verify.mjs out/unified-editor-scene.json`. The encoder checks the saved browser receipt's SHA-256 plus exact clip/position and outputs a short-lived original/edited MP4 and report. Neither test may read corporate media or change the production renderer.

Passing this proves one bounded original-synthetic browser state → saved JSON → experimental neutral Canvas painter → FFmpeg pipeline, **not** equivalence with the official `src/free` renderer, ProRes alpha, Windows Premiere, commercial media rights or a production-ready UI.
## Existing M3-A asset provenance — reusable design, not imported

[Draft PR #12](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/12) already contains `src/creative/assets.mjs` with trusted-root PNG verification: constrained relative paths, duplicate IDs, SHA-256, dimensions, type and declared `license`/`source`, plus symlink checks. Its standalone tests confirm **data integrity** rather than proving that named persons, copyright owners or licensors authorized ad use. The M3-A branch is stacked on an unmerged M2 base. **Do not cherry-pick the file or blindly merge its stack; do not duplicate its verifier.** A future owner-approved asset adapter would independently establish rights evidence and evaluate race/path/decoder/security threat models. Until then S1 and this fixture **require `assets: []`** and reject every real imported file.

Run `node experiments/editor-unified/verify.mjs` only in a browser-capable synthetic CI environment. This proof is not suitable for commercial production without separate S5 approval.
