# AI Motion Studio

Independent R&D sandbox for **AI-assisted code animation and motion graphics**.

## Goal

This repository validates animation workflows before any integration into `ai-video-template`.

Primary focus:

- Remotion-based motion graphics
- AI-assisted animation prototyping
- reusable scene and timing patterns
- future Three.js / WebGL experiments
- clean extraction of proven modules into `ai-video-template`

## Current scope

The first phase is intentionally small:

- React + TypeScript + Remotion
- one 6-second 1920×1080 / 30 fps demo composition
- reusable delivery profiles, including 1080×1920 / 30 fps / MP4 for vertical social-video handoff
- reusable component boundary
- architecture and future-integration notes

## Explicit non-scope

This repository does **not** currently include:

- the main `ai-video-template` production pipeline
- PixVerse automation
- dubbing / TTS pipeline logic
- production asset management
- full template orchestration
- Three.js runtime dependencies

Those should only be added after the animation workflow is validated here.

## Structure

```text
src/
  remotion/     # Remotion compositions and animation components
  three/        # Reserved for future Three.js / WebGL experiments
  shared/       # Shared types, timing helpers and animation utilities
docs/           # Architecture and future integration notes
```

## Local usage

Requirements:

- Node.js 24 recommended
- npm

Install:

```bash
npm install
```

Open Remotion Studio:

```bash
npm run dev
```

Type-check:

```bash
npm run typecheck
```

Render the demo:

```bash
npm run render:demo
```

Output:

```text
out/motion-demo.mp4
```

## Integration principle

Do **not** merge this repository wholesale into `ai-video-template`.

The intended path is:

1. validate an animation here
2. refactor it into reusable pieces
3. define a small prop / scene contract
4. move only the proven subset into `ai-video-template`
5. keep experimental animation R&D isolated here

## Status

**Phase 1 — scaffold / motion-quality validation.**
