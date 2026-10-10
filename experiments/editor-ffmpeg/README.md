# S4 — isolated synthetic preview pixels to pinned FFmpeg video

**Experimental video feasibility only, not official production Canvas+FFmpeg integration or commercial ad approval.**

The original S1 synthetic scene and S3 edited/reopened neutral JSON version are painted with isolated `editor-canvas-preview/paint.mjs` (which has **different geometry** from the official product `src/free` scene). Each generates all 30 frames at 360×640, 30fps, opaque RGB24.

The isolated CI workflow uses **only existing root dependency versions**, calls existing `scripts/setup-encoder.mjs` to provision/verify the official SHA-256-pinned FFmpeg binary, and runs two outputs for each variant:

1. **Lossless H.264 RGB in Matroska (`libx264rgb`, CRF 0)**: decode all 30 frames back to RGB24 and compare every byte with the input sequence. This proves synthetic preview frame roundtrip, **not pixel identity with official production rendering**.
2. **H.264 MP4 (`libx264`, CRF 18, yuv420p)**: use pinned ffprobe to confirm fps, frame count, codec and dimensions. Decode as RGB24, measure average/max channel errors, and enforce a conservative mean-error ceiling. MP4 is lossy: byte-exact match is **not expected or claimed**.

The original and edited synthetic MP4 videos plus a JSON report are available only as short-lived GitHub Actions artifacts. No outside images, music, remote fonts, company Drive/NAS materials, private credentials or third-party GUI assets are imported. All inputs are self-authored synthetic shapes/text.

The test also confirms official `drawFrame(profiles.smoke,12)` PNG is byte-identical before and after. No root `package.json`, `package-lock.json`, original renderer CLI, FFmpeg pin, frozen M11/M12 art or company State Engine code is changed.

**Still not proven:** neutral-scene pixels versus actual official production renderer (no common artwork/geometry contract); encoded 1080×1920 video; ProRes 4444 alpha; Windows Premiere import; company media rights; released editor; creative approval.

[Merged unified Konva+timeline research PR #61](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/61) independently verified shared scene edits and undo/reload but did not verify video. A green test here must never be misrepresented as a production SceneSpec migration or commercial-rights approval.

Run in the dedicated Linux synthetic CI workflow with `node experiments/editor-ffmpeg/verify.mjs` once the existing pinned encoder is verified. All review artifacts are original synthetic work only.
