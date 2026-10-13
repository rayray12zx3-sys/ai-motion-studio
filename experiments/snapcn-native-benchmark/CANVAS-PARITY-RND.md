# Evaluating a **zero-new-dependency Canvas** camera language transfer

**Operator approval:** 2026-10-13 visual direction accepted for isolated original snapcn tests; next task is to see whether their approved 3D device/camera motion holds up **without the Remotion runtime** in the company-use pipeline. This does **not** authorize production adoption, a new commercial software license, changing main, modifying S02 or real company UI/media.

## What is transferred (and what isn't)
- Original source: `shadcn-labs/snapcn` commit `afce9f0aa8c9d464409efd1e4d4f227ca4809c04`, MIT, Copyright (c) 2026 Sri Nath (snap-cn). Upstream component is the **unmodified reference** rendered in the preceding Draft [#129](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/129).
- This branch transposes its normalized **PhoneFrame showcase keyframe poses** (camera pitch/yaw/roll, zoom/pan, float/entrance) into a standalone opt-in original Canvas film. The projection and quad subdivision warp are **self-authored**, not copied from Remotion renderer or its source. Textured phone shell and synthetic planning UI are original stand-ins; do not redistribute third-party default demo media.
- Draws every frame via **already-root-pinned `@napi-rs/canvas@1.0.10`**, pipes its raw pixels through hash-verified existing **FFmpeg 5.3.0** to full 1080×1920 / 30fps / 240f H.264 MP4. Uses the locked `ffprobe-static` for decoding/metadata checks. No new root packages, extra network runtime, Remotion, Pro snapcn, paid service, private video, font imports or codec licenses.
- Adds a real deterministic seek/frame comparison and future-compatible camera motion unit tests. Does **not** alter `src/free/*`, `scripts/render.mjs`, Konva, `main`, S1-v1 schema or any other project.
- Uses the **same original static planning UI** that the upstream-remotion evaluation uses. This is a narrow visual/technical comparison, not an entire Agent compiler architecture.

## Required quality judgment
Watch the accepted [#129](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/129) original snapcn native **8s 1080x1920** output and this Canvas-port result at full speed. Compare the **same authored camera beat**: phone silhouette, perspective/rotation, treatment of product plate at 0–2s and 3–6s, legibility and antialiasing, image edge seams, lens motion and visual hierarchy. Distinguish intentional shared overzoom in original source from new problems due to the port.

| Gate | Initial state |
| --- | --- |
| Native snapcn technical render | PASS on #129 exact-head CI |
| Canvas portrait exact 240-frame render / format / codec | PENDING this PR's exact-head Actions |
| Real full-speed side-by-side viewing | PENDING |
| Preservation of accepted motion quality | PENDING HUMAN |
| Company production Remotion license | NOT PROVIDED / NOT NEEDED by this isolated Canvas path |
| Canvas benchmark official product integration | NOT APPROVED |
| Actual Premiere Windows import | UNVERIFIED |

**Decision:** If geometric raster warping looks worse, DO NOT turn this into the professional motion quality baseline or adopt it in `main`. Keep upstream original as visual benchmark, analyze limited transferable ideas or other zero-paid sources. If Canvas transfer is convincingly close enough after full-speed review, seek new explicit operator permission for the separate formal SceneSpec / renderer integration (not granted by these studies). This is not a universal Motion Graphics solution and does not claim mature Agent selection logic.
