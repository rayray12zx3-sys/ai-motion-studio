# AI Motion Studio — Continue here (single conversation handoff entry)

**Checkpoint date:** 2026-10-10 (Asia/Taipei). **Status:** canonical handoff published on **`main`** via [merged PR #27](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/27) (squash `139ffb39a4cc96ea0809f7cb902cf9786037d4b4`). Always check GitHub's live state before editing.

> This file is the **entry point**, not an authoritative live API snapshot. In every new conversation: **read this document and [PROJECT-STATE.json](PROJECT-STATE.json), then query GitHub's live PRs, issues and exact-head Actions before claiming progress or editing**. Historical text in [ACTIVE-WORK-2026-10-09.md](ACTIVE-WORK-2026-10-09.md) is append-only; later checkpoints supersede earlier claims.

## Verified isolated follow-up — 2026-10-10

- **[Issue #36](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/36) closed as completed for its bounded Draft R&D deliverable.** Jules initially created [PR #37](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/37), whose 1080p CI passed but whose base was `main` and which replaced the original 360p Alpha checks. It was reviewed and **closed unmerged**.
- **[Corrected Draft PR #39](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/39)** branches from [HyperFrames Draft #33](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/33), preserving original 360×640 H.264 (30/30 independently decoded RGB parity) and original 360×640 Alpha MOV while adding a **separate** original synthetic 1080×1920 / 30fps / 30-frame ProRes 4444 Alpha. At exact HEAD `1639103d2f8abbee81f08d3712ced85776bca13f`, [HyperFrames CI #37974222938](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37974222938) and [root CI #37974222932](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37974222932) **PASS**. The decoded full-HD Alpha samples at frames 0/15/29 have 0/226,434/0 visible pixels with no declared upper/left leaks.
- **Verified HyperFrames Studio GUI edit -> persist -> render:** On branch `feat/hyperframes-1080p-isolated-followup-issue36`, `verify-studio-edit.mjs` served native Studio on loopback via `npx hyperframes@0.8.143 preview`, loaded the editor UI in headless Chromium, and performed real mouse pointer drag interactions on synthetic clip `card-title`.
  - `STUDIO_RENDERED`: true
  - `NATIVE_CLIP_UI_CHANGED`: true
  - `ON_DISK_PERSISTED`: true (`card-title` start time updated `0s` -> `0.15s` in `index.html`)
  - `REOPEN_PERSISTED`: true (reloading Studio verified `data-clip-start="0.15"` retained)
  - `AFTER_EDIT_RENDERED`: true (rendered pre-edit vs post-edit MP4 clips confirmed nonblank decoded pixel differences at frame 3 / t=0.1s)
  - `NATIVE_KEYFRAME_EDIT`: `NATIVE_KEYFRAME_EDIT_NOT_SUPPORTED_BY_THIS_FIXTURE` (CSS `data-no-timeline` clips do not expose curve/easing keyframe UI controls without a registered GSAP timeline contract)
- **No HyperFrames adoption or merge into `main` has been authorized.** Keep R&D Draft, unchanged Canvas+FFmpeg default, M11 rejected and M12 art frozen. Pending separate gates: transitive licensing for commercial ad-production, actual Premiere Pro Windows import/export and human creative approval. Never include private company/Drive identifiers or assets in public GitHub.

## Project boundaries — never silently violate

1. `rayray12zx3-sys/ai-motion-studio` is the operator's **personally owned tool**. Its rendered ads may be used **commercially by a company**. Personal ownership of code does **not** automatically make commercial ad-production use permitted under a tool's *Noncommercial* license.
2. Maintain **separate checks** for source-code license, tool-use license, third-party media/asset rights, and final video's commercial/no-visible-attribution requirements. Consult [candidate tool & license register](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) before importing anything. Study reference videos; never copy their media or proprietary source without rights.
3. Keep currently accepted Canvas + FFmpeg V1 running. Theatre.js Studio (AGPL-3.0) remains **isolated R&D**; Core (Apache-2.0) and source-asset rights require independent review. Avoid adding restricted/paid engines to production.
4. **Never commit** private company scripts, app recordings, NAS source paths, IG/FB alpha guides, user-supplied media, rights receipts, private Google Drive identifiers/links or credentials to this **public** repository. Public CI is for synthetic data only.
5. Stacked development PRs (#23–#26 and #29) remain **Draft**; documentation PR #27 and technical PRs **#30/#31 are already merged** into main with owner approval/delegated routine authority. **No non-routine, unreviewed or failing-check merge, rebase, force push, main rewrite, risky production adoption, or company advertisement State Engine modifications** without separate approval. Routine narrow CI-green merges are delegated as specified below. In particular, M11 visuals were rejected and M12 [#26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) is *not creatively approved* and must not be visually rebuilt before an actually watchable professional reference is verified.

## Branch/PR chain — refresh metadata every session

| Stage | PR | Base | Head at checkpoint | Verified or open |
| --- | --- | --- | --- | --- |
| Production baseline | `main` | — | **Re-read GitHub** | Canvas + FFmpeg default opaque renderer **plus approved opt-in Alpha foreground** |
| M9 template / asset licenses | [#23](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23) | Prior stacked branch | Re-read GitHub | Templates, commercial output/asset gates |
| M10 Theatre / private-source preflight / alpha | [#24](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/24) | M9 | `8b09dbe046fe75253f0751603d0fafe722212053` | **All 4 exact-head CI workflows PASS**; synthetic-only |
| M11 generic Product UI | [#25](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/25) | M10 | `722dca32f2a3604116009b81bfa30326d3736be8` | **Live M10+M11 combined CI PASS**, **art rejected** |
| M12 continuous one-shape art study | [#26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) | M11 | `062497fda846cfd93a7319f6197d104292c71ba2` | Technical CI PASS; **human art NOT APPROVED / frozen** |
| Canonical handoff and license decisions | [#27](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/27) | **MERGED main** | squash `139ffb39a4cc96ea0809f7cb902cf9786037d4b4` | **Merged**; this entry and state file now live on main |
| Independent motion QA metrics | [#29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) | main | `af047b50cc0de9ec13bfd72ef65e9f43df716334` | **940 frames / 11 cases / 24 tests, exact-head CI PASS**; original 3s preview delivered privately; human art required |
| Approved transparent Canvas foreground | [#30](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/30) | **MERGED main** | squash `9199a20640137cc259c76c1e41a05c8c684370ee` | **Owner-approved; merged**; opaque default preserved, 5 pixel hashes and full-HD ProRes Alpha QA PASS |
| Foreground MOV verification hardening | [#31](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/31) | **MERGED main** | squash `a6daabc22f0f7e7774b24f98209c22a6f18c5518` | **Merged**; exact MOV frame count, first/mid/last Alpha decode checked; payload unchanged |
| HyperFrames Studio & 1080p Alpha R&D | [#39](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/39) | `experiment/hyperframes-isolated-benchmark-20261010` | Exact HEAD | **Studio GUI edit, persist & render verified; 360p+1080p Alpha PASS** |
| M10 checklist | [Issue #28](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/28) | — | Open | Engineering checks documented complete; owner review / future gates separate |

## Standing routine-merge delegation — 2026-10-10

The operator explicitly authorized continued implementation and delegated **routine merges at the risk level of PR #31**. For small, backwards-compatible, synthetic/test/doc-only technical changes with exact-head CI PASS, reviewed file diff, no new production dependencies/cost/licensing/private assets, no company-State-Engine change, no M11/M12 art and no destructive/rebase operation, the assistant may safely merge and record the result without asking again. Re-read live GitHub just before acting and set an expected SHA. This is **not blanket permission to merge every draft PR**: engine migrations, R&D-tool production adoption, stacked visual branches, paid/noncommercial licenses, real company material, irreversible changes or any unverified compatibility must be separately approved.

## Paste into the next ChatGPT conversation

> Continue my GitHub project `rayray12zx3-sys/ai-motion-studio`. Read the **latest** `docs/CONTINUE-HERE.md` and `docs/PROJECT-STATE.json` on **main**, then read latest GitHub PRs #24–#27, #29–#31, #39, Issue #28, and exact-head GitHub Actions. **GitHub live state overrides any old chat summary.** Continue the top unblocked technical work, run tests and update the GitHub source, Issue/PR and handoff on every verified milestone. Use the routine-merge delegation for narrowly scoped, backwards-compatible CI-green technical fixes; PRs #30 and #31 are already merged. Do not merge larger/creative/license-sensitive Draft PRs without separate authorization; do not publish company assets/Drive IDs, touch the private advertisement State Engine, or resume unapproved M12 art.

**Checkpoint hygiene:** Do not label work “completed” if it is only planned or committed but CI has not passed. Do not infer actual video visual similarity from thumbnails or unavailable X videos. Report blockers precisely, including changed HEADs, and carry them into the next handoff.
