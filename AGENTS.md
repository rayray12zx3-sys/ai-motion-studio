# Motion execution boundary

## First command in every new task: product charter + drift check

**Mandatory:** read [AI Motion Studio Product Charter & Anti-Drift Gate](docs/PRODUCT-CHARTER-AND-DRIFT-CHECK.md) **before proposing a feature, changing priorities, selecting tools or opening a PR**. Use its START/FINISH five-field drift check in new implementation PRs and handoffs. A green CI or more editor/schema features do not prove progress toward AI-generated professional motion. No new implementation permission is conveyed by this pointer.

**Decision hygiene:** the north star (conversation-driven Agent-assisted high-quality motion production) is established; the restored 2026-10-11 **P0–P5 order is an assistant proposal only**, not individually operator-approved. Check original #4/#5/#11 and later *explicit* decisions; do not secretly replace existing approved Konva work, unfreeze rejected M11/frozen M12, or treat Drafts as final. Update operator-approved product scope only via an explicit decision delta, never from an assistant summary.

## Recovered agent-first motion production purpose (2026-10-11)

- Read [recovered product vision / historical source pointers](docs/RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md) and [individual tool/license decision map](docs/RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md) before proposing new packages or editor features.
- The original #4/#5/#11 objective is **natural-language brief → AI/Codex director and storyboard → bounded SceneSpec → deterministic video → visual QA/revision**, not building a general-purpose AE/Premiere replacement. The optional Konva editor is a correction aid. Do not discard Creative Harness, two-brief reuse or template-registry Draft research because it is not merged.
- Source ideas from M1/M7/M9 and skills are **historical candidates, not automatic import or art approvals**; the creative priority change does not authorize new model providers, schema/renderer revisions, asset/media usage, license-sensitive packages or merging stacked PRs. M11 rejected and M12 frozen remain unchanged.

## Continuation rule — read existing decisions before asking for renewed direction

- Read [2026-10-11 decision index](docs/CONTINUATION-DECISIONS-2026-10-11.md), [canonical handoff](docs/CONTINUE-HERE.md), [dated project state](docs/PROJECT-STATE.json) and **live** GitHub before making an implementation plan.
- The operator has already chosen the long-term **animation-first, high-quality, reusable motion graphics** goal. Continue safe, bounded engineering without repeatedly asking to reconfirm it; stop only for a real creative approval, architecture/schema/license/private-asset decision, or user-PC gate.
- Historical creative proposals in Draft PR #9 are **not merged standards**. M11 visual direction is rejected and M12 frozen; no automatic style adoption. Distinguish technically proven S1 1-second/six-second synthetic samples from professional artistic acceptance.
- The operator's "continue until you need me" direction is **not** broad permission for destructive work, unlicensed inputs, restricted/paid runtimes, schema migration or merges of frozen Drafts.

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
