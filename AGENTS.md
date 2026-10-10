# Motion execution boundary

- The production path is `src/free` plus `scripts/render.mjs`. Root installation and CI must never import/install Remotion or run the optional legacy experiment.
- Use `npm ci --ignore-scripts`, then `node scripts/setup-encoder.mjs`. Dependency installation is the only network lane; the renderer is offline.
- Preserve private/public boundaries: only synthetic scenes in public tests, artifacts, Issues and PRs. Keep private briefs, source UI, voice, renders and credentials outside Git.
- Frame state is a pure function of frame number, profile and bounded scene text. Use only the locked font files. No system fonts, remote assets, wall-clock/locale inputs or unseeded random values.
- Do not overwrite review output. Never mark creative/safe-area/production approval from technical smoke results.
- Run lint, syntax checks, tests and smoke render. Validate exact width/height/fps/frame count/codec with ffprobe; preserve review frames/contact sheet and hashes in ignored output or synthetic CI artifacts.
- Standalone repository only: no State Engine integration, provider/generation calls or private production adoption here.
- Source changes use branch/PR. Never force push or delete main. Branch protection settings require separate verified administration access.

## Approved editor/renderer separation (operator decision 2026-10-10)

- Keep Canvas+FFmpeg as the authoritative default/production renderer. HyperFrames CLI is R&D-only and must not enter the root dependency graph.
- Never import, copy or distribute HyperFrames Studio GUI/compiled assets or implement a GSAP-backed no-code Studio visual editor for production. Do not contact licensors or purchase licensing as part of this project workflow; the operator chose the non-contact separation route.
- Prototype a self-authored neutral EditableSceneSpec, isolated Konva interactive UI and optional MIT timeline components only on dedicated Draft branches. Actual package adoption requires pinned version, transitive/license/NOTICE audit, CI and separate authorization where production dependencies or architecture change.
- Maintain user-approved source-only scope, private company/Drive/NAS exclusions, M11 rejected and M12 frozen. See docs/EDITOR-SEPARATION-ROADMAP-2026-10-10.md.
