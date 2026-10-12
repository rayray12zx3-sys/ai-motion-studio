# GSAP coded-motion experiment — R&D only

**Status:** two original offline V4 films encoded and verified as 1080×1920 / 30fps / 360 frames / H.264 + AAC in a **private** preview workspace; `main` is not modified. **Human animation quality NOT APPROVED.** This separate branch contains an original **small reusable engine adapter**; it is not an exact reconstruction of either private V4 film, whose complete sources/reports have been privately archived alongside videos. Do not report the two sample films as built by the adapter in this PR.

## Why this exists
Owner reviewed two different V3 films and documented five visible defects: Studio approx. 2s bar→circle jolt, 6s title disappears while drawing circle, 8s satellite crosses behind curve; Learning Lab approx. 1s title clipped, 2s too many simultaneous effects. Owner rejected endless refinements and requested **actual specialist animation tools**, not infinite feature additions to Canvas/Editor.

The new V4 **isolated** source archive contains actual **GSAP 3.15.0, MorphSVG, DrawSVG, MotionPath** plus absolute-time Chromium/FFmpeg rendering. This branch turns the resulting patterns into a small shared programmatic toolkit:
- Stable parent group and SVG Z-order contracts, explicit `data-layer` validation
- Timed shape path morphing and drawn outlines (MorphSVG/DrawSVG)
- Foreground satellite motion following a real SVG path (MotionPath)
- `seekFrame(n)` to decouple authored motion from real-time wall clocks

This is **coded creative film generation**, not an integration of GSAP into a competitive no-code visual-animation builder. Do not merge into the Konva visual GUI or default renderer. Install GSAP `3.15.0` in this isolated directory only after confirming terms at https://gsap.com/standard-license/ . Pin transitive notices, font/media and FFmpeg rights separately. The version in this package is exact but there is **no committed npm lock** yet; do not claim reproducible npm integrity/published workflow from this PR.

## Evidence/status
- Two distinct original coded-film V4 H.264 MP4s were encoded and independently probed at 12.0s, 30fps, 360 frames, 1080×1920 with AAC; original motion/coded elements, no company media or unlicensed showcase footage.
- Studio SHA256: `99d653ef80b545de1613cb7638354bf2fe4b617cdb834b7d9dc37cc17724304c`
- Learning Lab SHA256: `5ebf27f9726c116e2d753f3333d8cba64e2d20ba0c15321557b16cd418636e78`
- Technical: actual Chromium GSAP seeks, local JS syntax checks, sampled SVG screenshots and FFprobe 360-frame output. **Not established:** this branch adapter's live integration with those private scene programs, main production adoption, exact Windows/Premiere acceptance, rights of distributing a no-code GUI, human art quality.
- Do not place private Google Drive file/folder IDs, media assets, or confidential company scripts into this public repository. See Issue #4 and canonical PRODUCT-CHARTER-AND-DRIFT-CHECK.md.

## No feature-count drift
Only product-facing measure is whether a third DIFFERENT prompt/brief can make a visually coherent film with less redundant work. Do not expand a timeline GUI/schema or equate CI green with creative approval. For a next trial, compare against the five user-observed issues and request their real aesthetic evaluation. No existing draft PR was merged; M11 remains rejected, M12 frozen.
