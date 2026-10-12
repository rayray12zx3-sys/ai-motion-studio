# Real 3D and shader-transition research gate (stacked after #100)

**Reference-derived capability:** HeyGen HyperFrames documentation describes three distinct runtime needs: ordinary programmed motion → GSAP; **real lighting, camera and spatial depth → Three.js**; important between-shot transitions → a deliberately placed GPU shader. Sources: https://github.com/heygen-com/hyperframes/blob/main/docs/prompting/runtimes-and-3d.mdx and https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-animation/adapters/three.md . Only original techniques/patterns were implemented; bundled HeyGen/other commercial sample media have not been used.

## Source-level deliverables

- `three-depth.mjs`: isolated, frame-addressable actual Three.js scene with nested transform groups, 3D geometry (high-resolution icosahedron, three independently moving torus rigs, orbit-marker group), physically-based materials, real perspective camera, practical lights, shader-based procedural energy field, single `seekFrame(n)` state and explicit browser-only WebGLRenderer. This is not a fake 3D SVG scaling effect.
- `shader-transition.mjs`: bounded deterministic two-pass GPU compositor using two `WebGLRenderTarget`s and a fragment shader wipe between separately rendered original scenes. Uses no textures/assets fetched from the network and has explicit 0/1 endpoints. The shader is for one intentional handoff (4.25–5.05s), not every cut.
- `examples/depth-field.html`: a small original composition with a 1080×1920, 300-frame timeline that can respond to `window.seekFrame(n)` and the documented HyperFrames `hf-seek` event. Uses `three@0.181.2` as a *local package import*; nothing relies on live CDN or a Studio GUI. CSS design is proof text, not a licensed final font or client ad.
- `tests/three-depth.test.mjs`: actual Three.js package object/geometry, parent/world-space depth and perspective, order-independent arbitrary frame seeking and render-target compositor calls (test stubs for WebGL renderer only).

## What the tests mean

- The Node tests exercise the **real Three.js 0.181.2 math/scene classes**; they do not compile shaders on an actual GPU. This distinction is non-negotiable.
- Before upgrading to an animation-quality benchmark: render full-size real WebGL frames in offline Chromium with a verified GPU/SwiftShader path, examine screenshot and clip continuity, verify no async assets and source font/codec rights; then compare real professional reference films. **No claim that Node PASS equals real WebGL render PASS.**
- Do not automatically import Three.js into root production or Konva. Existing Canvas+FFmpeg remains unchanged; this is a bounded alternative engine R&D experiment. No real user/company assets used and no public/private Google Drive IDs stored.
- Licence: `three@0.181.2` official NPM package declares MIT, official THREE upstream LICENSE MIT. GSAP `3.15.0` remains proprietary Standard No Charge. Separate the final filmed media, asset/brand/voice rights, package notices, H.264 codec usage and distributing a software editor. Exact npm integrity/lock still needed before production adoption.

**Status at authoring time:** source and syntax prepared, waiting for exact-head isolated GitHub Actions node modules checks. **GPU browser demonstration, shader compile, final videos, creative approval, Premiere tests, engine migration: NOT VERIFIED/NOT AUTHORIZED.**
