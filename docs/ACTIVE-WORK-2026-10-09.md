# Active work and release gates — 2026-10-09

> Coordination snapshot for the public **ai-motion-studio** repository. This is a living task index, not a claim that draft implementation is part of `main`. For implementation truth use the linked exact PR head, source and Actions run. The operator's latest decision takes priority over older issue text.

## Current editorial decision

**Pause M12 creative redesign and reference-driven style acceptance.** Both X reference videos were **not actually watched**; previous implementations were based on creators' textual instructions only. The operator cannot currently obtain the X videos. **Find and inspect accessible replacement reference videos later, only after the independent engineering/coordination tasks below are completed.** Do not assert visual similarity to inaccessible references or invent frame-by-frame findings.

M11 visual direction is **REJECTED**. M12 is **NOT APPROVED / PENDING NEW REFERENCE & HUMAN ART REVIEW**. Do not merge any stacked Draft PR just because CI passes. Do not imply M12's 4-second synthetic study replaces private S03's ~1-second edit.

## Evidence pointers, not merged status

| Lane | Actual public evidence | Open gate |
| --- | --- | --- |
| Baseline `main` | `ee7ac06df83f1531d48ca7d5486e2268ca6ce65b` at this snapshot | No automatic merge / preserve main |
| M9 templates / final-output rights | Draft [#23](../pull/23) | Review dependencies, rights; no source/license claims beyond evidence |
| M10 Theatre Core, Studio and private asset contract | Draft [#24](../pull/24) at `789439070a8258ca29fae1051add8cd717763a4f` | Commit nested npm lock, switch to `npm ci`, browser keyframe + export acceptance, Core/Canvas consumption |
| M11 generic Product-UI and safe-area | Draft [#25](../pull/25) | Rejected M11 artistic direction; private APP not available |
| M12 one-shape style candidate | Draft [#26](../pull/26) at `062497fda846cfd93a7319f6197d104292c71ba2` | References unwatched, meaningful UI object continuity + cursor jump, human art review |
| Engineering scope | [#4](../issues/4), [#5](../issues/5), [#11](../issues/11) | Separate actual shipped tests and pending work from historical checklist items |

## Pre-reference execution order

1. **Make current truth easy to recover.** Keep this file and focused Issue/PR checklists in sync with exact head changes; do not rewrite history or treat stale unchecked boxes as absence of features. Distinguish `implemented`, `CI verified`, `browser verified`, `human approved`, `production adopted`.
2. **M10 reproducible install.** Take the already generated `m10-isolated-dependency-lock` artifact from the M10 workflow, validate its root manifest matches `experiments/theatre/package.json`, commit `experiments/theatre/package-lock.json` to an appropriate Draft PR, and change the **isolated experiment** workflow from `npm install` to `npm ci`. Verify clean Node 24 on Ubuntu; do not touch the root locked renderer. If artifact unavailable or inconsistent, regenerate reproducibly and verify; never claim complete from a successful artifact upload alone.
3. **Theatre browser functional acceptance.** In a real browser open development-only Studio; edit/seek at least two keyframes, export JSON, reload the exported state in Theatre Core, verify deterministic frame-accurate Canvas/transparent renders and no blank/teleport frames. Keep Studio AGPL runtime isolated; do not bundle it into a finished video or public production code without separate license analysis. Node-only/bundle tests are not a browser test.
4. **Secure source & private asset boundary.** Extend the existing rights/catalog validation before exposing media loading: approved local-only or private approved source, content SHA, commercial/no-credit rights evidence, expiry, fail-closed path controls, no network/absolute/traversal inputs. Never publish user-supplied IG/FB RGBA mask, client APP footage, scripts, purchased assets, NAS paths or authorization records in this repository, Issues or public CI artifacts.
5. **Production-format synthetic verification.** Test 1080×1920, 30fps, ProRes 4444 with alpha from **synthetic** assets, decode representative frames and inspect Premiere compatibility. This is a technical export gate, not a private advert adoption or visual-style approval. Respect codec/legal review separately.
6. **Review delivery loop.** Keep public standard GitHub Actions for permitted synthetic QA. For human review, upload MP4 privately through the connected Google Drive workflow and give the operator a direct preview link. Do not publish private Drive identifiers/sharing details to the public repository. A one-off successful upload is **not** proof of automated Actions→Drive delivery; implementing a secure automatic connection is a separate assessed task.
7. **Only after the pre-reference tasks:** research **accessible, watchable alternative** professional Product-UI / one-shape interaction videos. Inspect the actual frames at full speed before deriving a timing map, technique checklist and new M12 art-direction benchmark. No unsupported parity claim.

## Known QC evidence and limitations

- M12 full synthetic output and Easing curves were reviewed, but significant art gaps remain: rectangle-size-only morph, limited information hierarchy, rigid eight 15-frame beats, superficial semantic interaction and a cursor reposition discontinuity around frame 75. [Detailed finding](../pull/26#issuecomment-6077528888).
- On exact M12 head `062497fda...`, the operator supplied **original private 1080×1920 IG/FB RGBA mask** again. Private offline checker compared all 120 alpha PNG frames, nearest-scaled to review size: **zero alpha collision pixels**. [Evidence note](../pull/26#issuecomment-6077528888). This proves a **single static guide's collision check**, not dynamic IG/FB app placement, face/CTA safety, video quality or commercial readiness. The private mask file remains outside the repository.
- Studio Core/Bundle CI green in #24 does **not** prove GUI editing/export or full production pipeline. M10 lock artifact had a one-day retention and is not a committed lock.
- Commercial-final-output no-attribution requirement concerns the finished video; retain required open-source software notices and independent codec rights review.

## Stop conditions

- No user art approval: M12 remains Draft; no visual promotion.
- No accessible replacement video: do **not** fake frame-level reference analysis.
- Missing/private/unlicensed asset: fail closed; do not add it to public test or repo.
- Reproducibility/alpha/frames/permissions test failure: stop promotion, record the exact failed gate.
- No modifications to `ai-video-template`, private production State Engine or its `main` as a side effect.
- No unapproved PR merges, force pushes, main rewrites or new paid dependencies.


## Conversation close-out — 2026-10-09 20:20 Taiwan

This checkpoint is a **handoff to a different ChatGPT conversation**; do not assume ephemeral conversation files/tool working directories, including any downloaded ZIP, are available in the new execution.

**Exact verified GitHub state at close-out:**

- `main` remains `ee7ac06df83f1531d48ca7d5486e2268ca6ce65b`.
- [M10 Draft #24](../pull/24) head `789439070a8258ca29fae1051add8cd717763a4f`; its nested `experiments/theatre/package-lock.json` **does not yet exist in the branch**. Real-browser Studio acceptance remains open.
- [M12 Draft #26](../pull/26) head `062497fda846cfd93a7319f6197d104292c71ba2`, technically passing, **not creatively approved**. No style rework until actual accessible reference videos have been watched, and only after pre-reference engineering work.
- This coordination [Draft #27](../pull/27) is docs-only, based on `main`, **not merged**. It does not supersede any creative PR or production state.
- [Issue #28](../issues/28) remains OPEN and is the **immediate engineering task**. The M10 lock from artifact `11568483390` (run `37820068205`) was parsed earlier but an attempted cross-tool text transfer did not pass length verification. **No incomplete lock was written.** Next executor must obtain the actual full bytes via a reliable environment, validate manifest/lock, commit them to Draft #24, switch isolated workflow `npm install` → `npm ci`, run exact-head checks, and then exercise browser keyframe edit/export→Core rendering. Do not reuse a truncated transfer or report success without readback.
- [Issue #5 alpha smoke note](../issues/5#issuecomment-6079647454) records a **local synthetic** 1080×1920 30fps ProRes 4444 Alpha export/decode PASS. Not automated in CI; not checked in Premiere on Windows, not approved for client delivery. The original 120-frame M12 alpha/private static IG/FB guide collision check was zero collisions; the private mask is still **outside this public repo**.
- Human-review MP4s go to the operator's **private Google Drive preview workflow**, not public GitHub; one-off upload already demonstrated, fully automated Actions→Drive handoff not established. Do not include Drive IDs/URLs or company artifacts in public docs.
- No changes were made to the private advertisement production repository or to any repo `main` during this close-out.

**Next-chat order:** start from repo HEAD/Issue #28; execute and verify M10 nested lock + isolated `npm ci`; then Studio real browser GUI / export → Core/Canvas bridge; then remaining private-source boundary, synthetic formal alpha/Premiere validation, and review pipeline. Only **after** these independent tasks, find and inspect actual watchable alternative reference videos, define objective M12 art targets and resume creative work. Keep creative and technical PASS separate; no PR merges without explicit approval.

**Stop conditions:** expired/missing artifacts, inconsistent dependency graph, unavailable real GUI, unverified license or private source, failed tests, source leak, or user approval gate. Record blocker precisely and stop; no fabricated success, no fallback to publicizing private content.


## Follow-up execution evidence — 2026-10-09 (after close-out)

This section supersedes only **the historical pending-status descriptions** from the close-out above. It does not merge or approve any PR. GitHub code/Actions are the authoritative implementation evidence.

- **M10 nested lock resolved.** Restored exact artifact contents as `experiments/theatre/package-lock.json` with 32 lock entries and unchanged manifest; commit `ae6047b5d9ce07735ee52944cf1f4153058026bb`. Isolated CI switched from `npm install` to `npm ci` in `9355e62fd01f4627eae6e61670833a75c5745ce9`. [Run 37931246371](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37931246371): Node 24, Ubuntu 24.04, unchanged-lock check, Core random-access test and Studio bundle PASS.
- **M10 actual browser-operated Studio roundtrip PASS.** Synthetic HTML controls in Chromium invoke Theatre Studio transactions at frames 15/45, export state JSON, and re-import with Core to produce deterministic transparent Canvas output. The successful [Run 37932361107](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37932361107) includes browser screenshot, JSON trace and alpha/nonblank tests. This is a real browser/API roundtrip; **native Theatre Studio timeline dragging in the GUI is NOT separately tested**.
- **Private-source gate implemented only as a synthetic local preflight.** New `src/creative/private-source-resolver.mjs` checks a separately approved absolute local root, SHA-256, grants, symlink/traversal rejection, and avoids exposing private paths. Synthetic tests passed in CI. This is NOT a live company NAS integration or final contract/license review.
- **1080×1920 ProRes 4444 alpha automated smoke PASS.** [Run 37933801249](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37933801249) on PR #24 HEAD `af4d218796e05936e797a8074b2d10c2a1b66f29` encoded 30 frames at 30fps; `ap4h` alpha MOV re-decoded with top alpha collisions 0 and lower-third nonzero alpha pixels 28,971. An opaque H.264 MP4 composite preview was separately produced. No private company assets were used. Windows Premiere import/overlay/export acceptance is still **NOT TESTED**.
- **Private human-preview delivery restored.** The above synthetic MP4 preview and Alpha MOV were uploaded to the existing approved private Google Drive review folder and confirmed by listing/file sizes. Private Google Drive file identifiers, links, credentials, and real company assets are intentionally omitted from the public repository. Fully automated CI→Drive delivery is still **NOT IMPLEMENTED**.
- **AGPL/Core separation audit.** `@theatre/studio@0.7.2` is confined to `experiments/theatre/` and its AGPL-3.0 dev editor; the root package's production dependency graph excludes Studio and Core, and `experiments/theatre/public/bundle.js` is ignored. The separate Core integration remains in R&D pending promotion.
- [M10 Draft PR #24](../pull/24) and [coordination Draft #27](../pull/27) remain unmerged. M12 [Draft #26](../pull/26) stays frozen/not art-approved; do not search/rebuild from unviewed X references before the independent work's remaining gates are closed.

**Remaining gates:** actual Windows Premiere Pro testing with the synthetic Alpha MOV and plate composite; confirm source/contract authorization and restricted local runtime with actual approved company assets (only when authorized); consider a separately scoped secure CI→Drive automation if required. M10 passing technical tests does not imply a creative M12 acceptance or commercial advert adoption.


## Tool/license research register — 2026-10-09

The standalone personal motion-tool / commercial-video output decision and an evidence-linked inventory of permitted, conditional, and excluded third-party animation tools are now recorded in [TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) (Draft coordination PR #27). Includes HyperFrames, Motion Designer, Motion Video Kit, HTML Animation, Video Shotcraft, Motion Canvas, ThreeUI, Remotion, Theatre.js, GSAP, OpenMontage, OneTake and Video Talkcraft, with separate attribution rules for distributed code vs finished ads. **Research registration is not an installed tool, runtime integration or creative acceptance.**

Separate M10 native Studio UI inspection (non-passing/diagnostic until verified) is under Draft PR #24. M12 art remains paused until viable moving-image references are inspected and explicitly approved by the operator.
