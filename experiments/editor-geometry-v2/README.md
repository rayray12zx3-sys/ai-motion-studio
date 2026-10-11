# Isolated S1 geometry-v2 research (user-authorized 2026-10-11)

**Status:** EXPERIMENT ONLY / DRAFT / NOT MERGED / NOT ART APPROVED.

## User authorization and constraints

The operator explicitly approved **researching** a separate S1 v2 object-geometry/layout upgrade on 2026-10-11: editable shape width/height, bounded text layout and improving Konva/source render preview geometry alignment. Authorization explicitly **does not** migrate existing S1 v1, replace Canvas+FFmpeg, adopt new packages, publish private media, unfreeze M11/M12 or accept a new design direction. Preserve the current Windows `editor/.local/scene.json` and ignored `out/` files.

## Why v2 is separate

S1 v1's renderer uses hardcoded, center-anchored rectangle dimensions `width * .26` by `height * .046`, while the editor's draggable Konva proxy rectangles are `90×54` in the preview. Those are intentionally **not pixel accurate**. Editing position cannot change the final width/height.

This research defines a strict **`editable-scene-geometry-v2`** data contract in `scene.mjs`, with version `2`, existing familiar layer/frame structure and one mandatory per-layer `geometry` object:

- Rectangle: `{width,height}` **normalized by source canvas width/height**, 0.01 through 1.5. Rectangles remain center-anchored; existing per-key `scale` and `rotation` apply after dimensional sizing.
- One-line text: `{font_size,max_width,align}`: `font_size` normalized by the shorter source canvas axis (0.012–0.16); `max_width` normalized by source width (0.1–1.5), `align` is `left|center|right`. This introduces explicit typography geometry, **not** arbitrary type styles, kerning, baseline parity, line wrapping or guarantees about browsers' font pixels.

All other S1 v1 restrictions are preserved by projecting to the **existing strict v1 validator only inside this research module**: supported profiles, 30fps, half-open clip intervals, allowed keys/easings, bounded layer count and `assets:[]`. V1 editor/renderer and existing valid v1 JSON **must reject** v2 documents; no automatic migration, no local editor scene writes.

`geometry.mjs` provides the **same source/preview shape projection** used by the isolated Canvas painter and a future Konva node adapter, including center offsets, rotation and scale. Unit tests cover the four approved viewport dimensions, pixel effect of changing rectangle dimensions, separate text layout controls, deterministic seeks, alpha and invalid input refusals. This is **mathematical rectangle alignment**, not an actual interactive browser UI or Konva-vs-Canvas image-pixel comparison.

## Reproduce in an isolated checkout (Node 24)

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node --test tests/editor-geometry-v2.test.mjs
node scripts/preview-geometry-v2.mjs your-unique-preview-id
```

Windows uses `npm.cmd`; on Linux/macOS use `npm`. If working in the operator's existing local checkout, avoid switching branches over unpublished changes: prefer a separate worktree/clone for this experiment and **never** overwrite ignored local scenes or outputs. `preview-geometry-v2.mjs` loads **only** `original-synthetic.json` in this experiment, produces PNGs for frames 0, 15, 30, 45, 59 in opaque and transparent mode, a narrower-rectangle side-by-side comparison frame and a SHA-256/geometry receipt in a unique ignored `out/geometry-v2-<run-id>/` directory. Existing renderer outputs are untouched. The CLI rejects overwriting an existing review run. The `source_sha256` in the review receipt is computed from **canonical serialized geometry-v2 JSON**, not operating-system-dependent checked-out source file bytes (which can have LF versus CRLF differences); this hash records semantic scene content, not byte identity of raw Git working copies.

Dedicated Linux **and** Windows CI should publish these original-synthetic samples and receipts in a seven-day GitHub artifact, plus run the standard root tests. CI-green demonstrates strict geometry code and real experimental Canvas pixels on hosted machines only.

## Open gates; do not silently promote

1. **Research-only** real Chrome + pinned Konva `Rect` proof is now wired in `browser.html`, `browser-client.mjs` and `verify-browser.mjs`, with one synthetic width-toggle control. The browser is served only via a disposable 127.0.0.1 HTTP server, accepts only two explicit synthetic size variants, and compares node geometry plus five interior RGBA samples per variant against the native isolated Canvas painter. This is NOT complete pixel parity (edges/antialiasing unverified), not a real Konva editor with full input controls/undo/redo/save and not actual production text render. Browser font shapes, wrapping and selection overlays are still **NOT** WYSIWYG/pixel verified.
2. Explicit, backward-compatible v1→v2 project migration contract and **separate** local opt-in editor/encoder preview, not automatic startup migration — **NOT APPROVED OR IMPLEMENTED**.
3. More complex shapes, responsive layouts and arbitrary Bezier/easing-v2, optional real media/music/source provenance and any new renderer contract — separate decisions.
4. Full-speed encoded MP4/ProRes Alpha and on-device Premiere, user-artistic quality — **NOT established by PNG test**.
5. This example is deliberately a **technical geometric study**; it is **not** the professional-quality art-direction answer, and should not become a product visual style without human review.

Do not copy or merge M11/M12, HyperFrames Studio or Skillry reference-only Issue #91 into this research branch.
