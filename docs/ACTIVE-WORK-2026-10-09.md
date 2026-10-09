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
