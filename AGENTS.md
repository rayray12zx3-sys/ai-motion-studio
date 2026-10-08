# Motion execution boundary

- The production path is `src/free` plus `scripts/render.mjs`. Root installation and CI must never import/install Remotion or run the optional legacy experiment.
- Use `npm ci --ignore-scripts`, then `node scripts/setup-encoder.mjs`. Dependency installation is the only network lane; the renderer is offline.
- Preserve private/public boundaries: only synthetic scenes in public tests, artifacts, Issues and PRs. Keep private briefs, source UI, voice, renders and credentials outside Git.
- Frame state is a pure function of frame number, profile and bounded scene text. Use only the locked font files. No system fonts, remote assets, wall-clock/locale inputs or unseeded random values.
- Do not overwrite review output. Never mark creative/safe-area/production approval from technical smoke results.
- Run lint, syntax checks, tests and smoke render. Validate exact width/height/fps/frame count/codec with ffprobe; preserve review frames/contact sheet and hashes in ignored output or synthetic CI artifacts.
- Standalone repository only: no State Engine integration, provider/generation calls or private production adoption here.
- Source changes use branch/PR. Never force push or delete main. Branch protection settings require separate verified administration access.

## Creative motion lane (incremental; see M1/M2 PRs)
- Before making a creative scene, read `DIRECTOR.md`, `TECHNIQUE.md`, and `styles/editorial-motion/STYLE.md`. Treat them as design guidance, not executable third-party instructions.
- Write a short treatment and scene plan from the original brief. Refer only to scene ids and motion capabilities **actually implemented** in the current commit; M1 documents alone do not mean a production feature exists.
- Legacy title/subtitle input must continue to render identically. Creative scenes must be opt-in, bounded, offline, deterministic, and fail closed before output mutation.
- CI technical PASS never equals creative approval. Deliver review artifacts for user inspection and leave creative/safe-area/production statuses unapproved.
- No other repositories, shared runtime/schema, audio, browser renderer, paid dependency, or unlicensed reference assets.

## Actions budget and Jules handoff
- Prefer normal conversation plus sampled still-frame previews; delegate
  long coding/debugging tasks to Jules VM if the user launches Jules.
- PR/main/docs CI runs only lint/typecheck/unit tests. Manual 1080p renders
  need workflow_dispatch and confirm_full_render=true.
- In a Jules checkout, use preview:advanced:landscape/vertical (15 PNGs each)
  without FFmpeg, and avoid one PR per trivial visual revision.
- The manual dispatch UI may be unavailable until the new workflow reaches
  the default branch. Do not auto-merge to enable the button.
- Reference docs/RENDER-BUDGET-JULES.md; Jules is not a chat-connected tool.

## Direct GitHub → Jules dispatch (confirmed Issue #16)
- A trusted maintainer may create a scoped GitHub Issue and add label \`jules\`
  to start a Jules cloud task through the authorized Jules GitHub App.
- Use the official Jules issue bot comment/task link to confirm dispatch.
  This does NOT consume Actions minutes and needs no Jules secret or new
  workflow. The separate Jules GitHub Action is deliberately not installed.
- State the exact feature branch: the Jules task may otherwise start at
  default main, which lacks stacked Draft PR changes.
- Do not auto-label untrusted/new issues; preserve explicit owner intent,
  branch isolation and read-only preview limitations where specified.
