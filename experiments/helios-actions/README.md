# Helios R&D — ten real kinetic-typography render tests

**Production status:** **TECH_PASS / ART_PENDING / PREMIERE_NOT_TESTED**. This is a **Draft PR** only; `main` keeps its approved Canvas+FFmpeg renderer and Konva editor. This branch does **not** install Helios in the production dependency lockfile or publish a user-facing video tool.

## Ten distinct synthetic animation concepts

| ID | Motion principle |
| --- | --- |
| K01 | Per-glyph compression and recoil |
| K03 | Tracking (character-spacing) breathing |
| K04 | Geometry-based horizontal slice recombination |
| K05 | Word-by-word emphatic relay |
| K06 | Collision between semantically opposed phrases |
| K07 | Line break and semantic folding |
| K09 | Punctuation handoff to the next phrase |
| K10 | Typographic rule extends into a second line |
| K13 | Main title folds into an information label |
| K19 | Three event-paced typographic states |

Original public demonstration text only; **no user/company scripts, footage, private Google Drive URLs, job inputs, credentials or secret materials** in the public repo.

Files:
- `motion-recipes.json` — unique concept names, semantic intent, statuses.
- `gallery.html` — hand-authored deterministic frame-state rendering for all ten, not decoration overlays.
- `render-ten.mjs` — real `@helios-project/renderer@1.79.0`, pinned `@fontsource/noto-sans-tc`, frame-seek hash comparison, ProRes 4444 FFmpeg transcode and decoded Alpha validation, per-item MP4 and 25-second concatenated preview.
- `.github/workflows/helios-isolated-technical.yml` — Linux GitHub Actions, technical verification, **short-lived synthetic** artifacts. This does not imply automatic private Drive delivery.
- `PRIVATE-JOB-BOUNDARY.md` — controls and unresolved prerequisites for private rendering on a public-runner platform.

## Verified baseline

Successful synthetic GitHub Actions run: https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38741776695

All ten at **1280×720, 24 fps, 2.5 seconds, 60 frames**; each `ProRes 4444` MOV has decoded Alpha min 0 / max 255 and four fully transparent corners, mid-frame visible text and deterministic frame seeking. Ten individual MP4s and a 25-second concatenated preview are generated. The exact Git commit and SHA256 are recorded in the private Google Drive project's machine-readable manifest, not pasted into this public branch.

The earlier K09 and K13 visual continuity problems were amended before the final technical pass. **These outputs have not yet received human art approval, subtitle/speech synchronization testing, or Premiere Pro native import testing.** Do not claim Claude-level visuals based on codec metadata.

## Access, security, and future integration

A public GitHub repository is acceptable for the program *only*. Protected Github→Google Drive workload identity, private per-job data, constrained workflow dispatch, non-public artifacts/logs, short-lived access, persisted job state, and safe delivery are **not yet provisioned**; until then this branch is for synthetic testing only. GitHub's standard job logs/artifacts must not be used to carry private customer/company clips.

Helios is ELv2 source-available. Confirm usage/license terms before productizing or offering the renderer as a hosted third-party service. No new paid service, secrets, repository visibility change or production deployment was made. Do not merge the Draft PR without separate architecture/license/art review.

**Definition of full completion**: secure private data pipeline, general-chat job trigger and result lookup, native Premiere QA and actual user visual acceptance. The ten rendered motion prototypes alone do not fulfill all those criteria.

## Private task boundary progress (simulation, not activated)

A strict UUIDv4-only dispatch schema and a pinned Google Drive reader/resumable-MOV-writer are in `private-job-contract.mjs` and `private-drive-adapter.mjs`. Their mock tests run in `.github/workflows/private-job-contract-test.yml` without OAuth, OIDC, GitHub secrets, private Drive data, or private Action artifacts. Google service account access to My Drive, credential provisioning, reliable private job dispatch, private write-back and user review are not validated. Nothing automatically sends personal data to the public repository.
