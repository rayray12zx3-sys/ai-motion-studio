# Motion execution boundary

- The production path is `src/free` plus `scripts/render.mjs`. Root installation and CI must never import/install Remotion or run the optional legacy experiment.
- Use `npm ci --ignore-scripts`, then `node scripts/setup-encoder.mjs`. Dependency installation is the only network lane; the renderer is offline.
- Preserve private/public boundaries: only synthetic scenes in public tests, artifacts, Issues and PRs. Keep private briefs, source UI, voice, renders and credentials outside Git.
- Frame state is a pure function of frame number, profile and bounded scene text. Use only the locked font files. No system fonts, remote assets, wall-clock/locale inputs or unseeded random values.
- Do not overwrite review output. Never mark creative/safe-area/production approval from technical smoke results.
- Run lint, syntax checks, tests and smoke render. Validate exact width/height/fps/frame count/codec with ffprobe; preserve review frames/contact sheet and hashes in ignored output or synthetic CI artifacts.
- Standalone repository only: no State Engine integration, provider/generation calls or private production adoption here.
- Source changes use branch/PR. Never force push or delete main. Branch protection settings require separate verified administration access.
