# AI Motion Studio

Standalone local motion graphics renderer with an isolated historical R&D lane.

## Goal

This repository validates animation workflows before any integration into `ai-video-template`.

Primary focus:

- Free local Canvas + FFmpeg motion graphics
- AI-assisted animation prototyping
- reusable scene and timing patterns
- future Three.js / WebGL experiments
- clean extraction of proven modules into `ai-video-template`

## Current scope

The first phase is intentionally small:

- Node.js 24 + locked Canvas/font/encoder dependencies; no Remotion in the production graph
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
  free/         # Default deterministic local renderer
  remotion/     # Historical optional R&D; excluded from root install/CI
  three/        # Reserved for future Three.js / WebGL experiments
  shared/       # Shared types, timing helpers and animation utilities
docs/           # Architecture and future integration notes
```

## Local usage

Requirements:

- Node.js 24 required
- npm
- Git and a repository checkout (run commands at its root)

Install:

```bash
npm ci --ignore-scripts
node scripts/setup-encoder.mjs
```

Validate the production path:

```bash
npm run lint
npm run typecheck
npm test
```

Render the demo:

```bash
npm run render:demo
```

Output:

```text
out/landscape/motion.mp4
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

**Free renderer reliability candidate — technical checks do not approve production assets.**

Root installation, render commands and CI require no paid engine. Legacy Remotion remains excluded; its license must be resolved before anyone explicitly uses that old lane. See [THIRD_PARTY.md](THIRD_PARTY.md).

`npm run render:vertical` produces 1080×1920 / 30fps / H.264 MP4. `npm run render:smoke` produces a one-second synthetic review. Each fresh `out/<profile>` includes selected PNG frames, a contact sheet and a render report. Existing output is never overwritten. For another review, preserve/move the existing ignored folder first.

The optional second CLI argument is a local JSON brief containing only `title` and `subtitle`; keep private briefs outside Git. Current scene support is bounded typography. It does not recreate all legacy Remotion visuals, exact app UI, audio, lip-sync, final safe-area approval or arbitrary production compositions.

CI uploads only synthetic review assets. Real renders belong in approved private storage and need separate creative/technical/safe-area review before State Engine asset adoption.

<!-- PROJECT_PROGRESS:START -->
Current milestone: free local renderer reliability. REQUIRED_NOW: locked install, input guards, explicit fonts, render smoke and artifact review. Active path: local validation → PR/Ubuntu CI → human visual review. Current gate: candidate awaiting CI and creative review. Blockers: final scene design/visual approval; public branch-protection configuration. Next action: inspect synthetic artifacts and exact-head CI. Exit condition: required checks pass and reviewed scenes are accepted; no production approval is inferred. No lifetime percentage is claimed.
<!-- PROJECT_PROGRESS:END -->
