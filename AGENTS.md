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
- **2026-10-10 operator extension:** Formal opt-in Konva frontend integration was explicitly approved. The independently locked `editor/` app may use audited `konva@10.7.1` and be merged after exact-head CI and actual diff review. Keep root Canvas+FFmpeg renderer/package graph unchanged. Any other editor package, schema-v2/Bezier change, real media or official renderer modification requires new authorization. See `docs/EDITOR-KONVA-ADOPTION-DECISION-2026-10-10.md`.
- **2026-10-10 additional operator approval:** A separate opt-in S1 v1 scene → the **existing** locked Canvas+FFmpeg engine is now authorized. New files `src/free/editable-scene.mjs` and `scripts/render-editable.mjs` may implement a bounded additive pipeline with hash-verified encoder, real original-synthetic MP4/Alpha output and exact-head CI, while **preserving old `src/free/scene.mjs`, default `scripts/render.mjs`, root package/lock and official text-only output**. No arbitrary Bezier schema v2, new package/media assets, Remotion/GSAP Studio, real user/company media or M11/M12 art without separate approval. See docs/APPROVED-EDITABLE-S1-RENDER-2026-10-10.md.
- Maintain user-approved source-only scope, private company/Drive/NAS exclusions, M11 rejected and M12 frozen. See docs/EDITOR-SEPARATION-ROADMAP-2026-10-10.md.
