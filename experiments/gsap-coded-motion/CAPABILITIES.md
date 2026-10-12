# Specialist coded-motion capability gate — research only

**2026-10-12 operator direction:** stop repairing V1–V4 in tiny increments. Instead, first verify reusable, high-spec motion authoring and actual specialist tools. Do not ask for film approval until a source-backed animation-quality benchmark justifies it. The two original 12-second V4 films already exist in private Google Drive, but they **did not prove professional-grade visual quality**.

## Concrete new capability (stacked after Draft PR #99)

The `src/spatial-graph.mjs` design-pixel scene graph makes meaningful groups, local transforms, parent opacity, explicit camera movement, parallax depth, clip inheritance, protected text and actual front-to-back painting possible. `src/svg-stage.mjs` physically paints the flattened SVG leaves in layer order, with a dedicated viewport clip wrapper per leaf so compositor transforms cannot incorrectly double-transform the mask. Clip polygons are transformed with their parent and intersect as true convex polygons, including rotated and nested clipping groups; the geometry checker is a **conservative box/polygon check** and cannot replace pixel-level or full-speed inspection.

`src/coded-motion-director.mjs` audits the *treatment* for competing focal events and insufficient text reading holds; it is a useful bounded gate and **does not perform AI creative direction**. `src/tech-stage-bridge.mjs` attaches the adapter from Draft #99 to actual GSAP 3.15.0 + MorphSVGPlugin/DrawSVGPlugin/MotionPathPlugin, ensuring a **single time-based, frame-exact, programmatic scene entrypoint**. Crucially, GSAP animates an inner graphic child, not the compositor-owned `data-motion-id` wrapper; otherwise world transforms, camera, and orbit animation fight over SVG `transform`.

The original technical stage `examples/orbital-circuit-lab.html` uses layered SVG art, an atmospheric depth grid, a persistent morphable core, multi-part circuit reveals, camera/parallax, real path-following foreground satellite, a protected type hierarchy and a stable margin/HUD. This is **not a client ad**, **not a professional art acceptance**, and **not a replacement for the already-frozen M11/M12 films**.

## Evidence, precise claims

- Local Node 22: **13/13** original tests PASS (parent/child matrices, random access seek, layer order, intentional-vs-accidental text occlusion, rotating/nested mask geometry, camera, invalid schema rejection, beat timing, two different written treatments, and SVG actual reordering).
- Actual offline Chromium via Playwright with **GSAP 3.15.0** + the three named plugins loaded from the checked-in *npm distribution* locally: script errors 0, GSAP warnings 0, sample frames 0/45/90/150/230/299, whole **300-frame motion-state audit 0 reported geometric violations**, true path morph **84 unique shapes**, satellite path following **266 different transformations**.
- Seeking 130→20→130 reproduces both the SVG path and the complete screenshot byte-for-byte under that one Chromium/font/runtime environment.
- No video was published for creative review at this gate; the benchmark is technical only. Actual MP4 frame count, sound, encoder, FFmpeg/Premiere compatibility, creative style parity and commercial material clearance **were not newly tested by this slice**.
- No Three.js engine or full 3D scene is claimed. Depth here is **2.5-D parallax**; WebGL/Three.js remains a separate research question requiring real benefit and separate tests.
- Sampling and declared bounding boxes can miss semantic/readability errors, anti-aliased edges, path-specific occlusion and offscreen safe-area failures. A full-speed human review remains separate. This code is not a generic prompt-to-film agent.

## Offline development commands

From this isolated directory: `npm install --ignore-scripts --no-audit --no-fund` (GSAP exactly 3.15.0 as requested by `package.json`), then `npm run check`. On Linux with Python Playwright installed and `/usr/bin/chromium` available, `python scripts/browser_smoke.py` creates an inline offline smoke document using only local GSAP distribution code and writes local ignored screenshots/report. External network scripts, template footage and company assets are forbidden.

The GitHub Actions lightweight check tests only Node source and contract tests, **not** the Chromium full-speed visual quality or npm transitive license. A fresh verified npm lock and exact package integrity must be reviewed before any production adoption. Avoid silently mixing this experiment into the official Canvas/FFmpeg pipeline or Konva GUI.

## Rights and stop condition

GSAP JavaScript library and these plugins are GreenSock proprietary **Standard No Charge**, not MIT. Official source: https://gsap.com/standard-license/. Free coded commercial animations differ from building a competing no-code visual animation app. Keep the code lane standalone, do not copy HyperFrames or GSAP Studio GUI, do not contact or purchase third-party licensing on behalf of owner, and check the legal entity/distribution scenario before a new commercial engine deployment. No third-party example films, company source footage, fonts, or hidden private Drive IDs are in this public tree.

**Gate status:** reusable 2D/2.5D scene graph and real GSAP integration browser smoke TECHNICAL PASS. End-to-end **professional multi-shot creative animation** still NOT PROVEN. No automatic merge/renderer migration. Operator explicitly requested continuing technology research until it is worthwhile to ask for human art review; this branch does not ask for that review.
