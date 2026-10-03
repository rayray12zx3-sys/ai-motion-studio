# Architecture

## Purpose

`ai-motion-studio` is an isolated experiment space for animation-first development.

The goal is to keep motion R&D separate from the operational complexity of `ai-video-template` until the workflow and visual quality are proven.

## Directory intent

### `src/free/`

Current production engine: pure frame-based Canvas scenes, locked font subsets and hash-verified FFmpeg export. No account, paid renderer or network input is required at render time.

### `src/remotion/`

Historical optional R&D path (excluded from root install/CI):

- Remotion compositions
- reusable motion components
- typography and layout experiments
- deterministic frame-based animation

### `src/three/`

Optional future path:

- Three.js
- WebGL
- shaders
- 3D camera and particle experiments

Three.js is deliberately not a dependency in Phase 1.

### `src/shared/`

Future portable pieces:

- timing helpers
- easing utilities
- shared types
- animation tokens
- reusable transition primitives

### `docs/`

Project decisions, boundaries, integration notes, and validation criteria.

## Principles

1. **Animation-first, not pipeline-first**
   - Validate motion quality before pipeline integration.

2. **Avoid premature abstraction**
   - Build concrete scenes first.
   - Extract utilities only after reuse becomes real.

3. **Extraction-friendly design**
   - Stable pieces should be portable into `ai-video-template`.

4. **Optional 3D**
   - Three.js is an extension, not a requirement.

5. **No hidden coupling**
   - Phase 1 must not depend on the main video-template repository.

## Near-term roadmap

- validate the first title-card demo
- add a logo-reveal composition
- add shared timing/easing helpers
- add an infographic motion prototype
- evaluate Three.js only after 2D motion workflow is stable
