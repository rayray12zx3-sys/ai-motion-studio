# AI Motion Studio — Continue here (single conversation handoff entry)

**Checkpoint date:** 2026-10-09 (Asia/Taipei). **Status:** documentation Draft [PR #27](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/27), branch `docs/coordination-pre-reference-20261009`, **not merged into `main`**.

> This file is the **entry point**, not an authoritative live API snapshot. In every new conversation: **read this document and [PROJECT-STATE.json](PROJECT-STATE.json), then query GitHub's live PRs, issues and exact-head Actions before claiming progress or editing**. Historical text in [ACTIVE-WORK-2026-10-09.md](ACTIVE-WORK-2026-10-09.md) is append-only; later checkpoints supersede earlier claims.

## Project boundaries — never silently violate

1. `rayray12zx3-sys/ai-motion-studio` is the operator's **personally owned tool**. Its rendered ads may be used **commercially by a company**. Personal ownership of code does **not** automatically make commercial ad-production use permitted under a tool's *Noncommercial* license.
2. Maintain **separate checks** for source-code license, tool-use license, third-party media/asset rights, and final video's commercial/no-visible-attribution requirements. Consult [candidate tool & license register](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) before importing anything. Study reference videos; never copy their media or proprietary source without rights.
3. Keep currently accepted Canvas + FFmpeg V1 running. Theatre.js Studio (AGPL-3.0) remains **isolated R&D**; Core (Apache-2.0) and source-asset rights require independent review. Avoid adding restricted/paid engines to production.
4. **Never commit** private company scripts, app recordings, NAS source paths, IG/FB alpha guides, user-supplied media, rights receipts, private Google Drive identifiers/links or credentials to this **public** repository. Public CI is for synthetic data only.
5. All stacked PRs remain **Draft**. **No merge, rebase, force push, main rewrite, production adoption, or company advertisement State Engine modifications** without separate approval. In particular, M11 visuals were rejected and M12 [#26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) is *not creatively approved* and must not be visually rebuilt before an actually watchable professional reference is verified.

## Branch/PR chain — refresh metadata every session

| Stage | PR | Base | Head at checkpoint | Verified or open |
| --- | --- | --- | --- | --- |
| Production baseline | `main` | — | **Re-read GitHub** | Narrow Canvas + FFmpeg technical renderer |
| M9 template / asset licenses | [#23](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23) | Prior stacked branch | Re-read GitHub | Templates, commercial output/asset gates |
| M10 Theatre / private-source preflight / alpha | [#24](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/24) | M9 | `8b09dbe046fe75253f0751603d0fafe722212053` | **All 4 exact-head CI workflows PASS**; synthetic-only |
| M11 generic Product UI | [#25](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/25) | M10 | `722dca32f2a3604116009b81bfa30326d3736be8` | **Live M10+M11 combined CI PASS**, **art rejected** |
| M12 continuous one-shape art study | [#26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) | M11 | `062497fda846cfd93a7319f6197d104292c71ba2` | Technical CI PASS; **human art NOT APPROVED / frozen** |
| Coordination, handoff, license decisions | [#27](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/27) | main | **Re-read GitHub** | Docs-only Draft; this entry lives here |
| Independent motion QA metrics | [#29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) | main | `58eff62dac7db9a2d181537e62ac649980600c2c` | **400 original Canvas frames / 5 cases, exact-head CI PASS**; R&D only, human art required |
| M10 checklist | [Issue #28](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/28) | — | Open | Engineering checks documented complete; owner review / future gates separate |

**Corrected mergeability fact:** Fresh PR query on 2026-10-09 returned `mergeable: true` for #24, **#25**, #26 and #27. An older append-only checkpoint reported `mergeable: false` for #25. **That claim is stale**; mergeability is computed state, always re-query before doing anything. A green mergeability flag is **not permission to merge or approval of downstream art**.

## Verified M10 evidence — full SHA and tested scope

At exact head `8b09dbe046fe75253f0751603d0fafe722212053`, four checks passed:

- [CI #37946136986](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37946136986)
- [Native Theatre Studio browser #37946137013](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37946137013): real mouse drag of Dope Sheet x-keyframe **1.500s → 1.833s**, export changed JSON, Theatre Core reads moved position, transparent Canvas pixels change and remain deterministic. Includes synthetic QA artifact/screenshot (short retention).
- [Synthetic ProRes 4444 Alpha MOV #37946137010](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37946137010): 1080×1920, 30fps Alpha encode and decoded transparency verification.
- [Automatic Full Motion Regression #37946137105](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37946137105)

Source usage: [M10 experiment README](https://github.com/rayray12zx3-sys/ai-motion-studio/blob/feat/m10-theatre-private-assets-20261008/experiments/theatre/README.md) is on PR #24's branch, not on this docs-only branch. Private source resolver checks local approved root/path/SHA/declared rights **using synthetic fixtures**; real NAS connection and legal proof are **not** done. One-off synthetic MOV/MP4 delivery to the approved **private Drive** folder is done, but there is no CI→Drive automated delivery. FFmpeg cross-decode and Adobe published support verify format compatibility; **no Windows Premiere in-app acceptance**. Do not block unrelated engineering just because Premiere is absent.

## Immediate next work — keep independent lanes independent

**Independent synthetic Motion QA checkpoint:** [Draft PR #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) analyzes 400 genuinely drawn original 9:16 Canvas frames across five 80-frame scenarios. Baseline plus intentional held end `PASS`; blank and safe-zone alpha `BLOCKED`; sudden teleport and freeze `REVIEW`. On exact head `58eff62dac7db9a2d181537e62ac649980600c2c`, [isolated QA #37951387748](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37951387748) and [root CI #37951387392](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37951387392) both **PASS**. Metrics-only JSON evidence is stored as a short-lived CI artifact; deterministic code reproduces it. No private frames/links or third-party media are saved. This is **not human art review or M11/M12 production adoption**.

1. **Protect continuity:** Every source change should be followed by exact-head CI and updates to the affected PR/Issue. Refresh this file/JSON on meaningful milestones. Avoid overwriting prior checkpoints silently: retain traceable links in [active work log](ACTIVE-WORK-2026-10-09.md).
2. **Validate stacked integration:** **Combined-tree acceptance is complete:** [M11 synthetic integration CI #37947659914](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37947659914) at M11 HEAD `722dca3` fetched live M10 `8b09dbe`, then passed M10 native Studio drag, root tests and M11 previews. [CI #37947660143](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37947660143) and [full regression #37947659922](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37947659922) passed as well. **Art is still rejected.** GitHub PR event's old base SHA `7894390` is not sufficient evidence of current-base testing; the workflow explicitly fetches the live base in a disposable runner.
3. **Continue QA tool benchmarking:** 400-frame synthetic benchmark already **PASS**; next validate Motion QA against a *second different, independently original* animation clip or operator-reviewed synthetic clip, calibrate intentional holds/cuts and make no art-release claim. The isolated [Motion QA experiment #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) remains unmerged. **Tool evaluation, isolated:** Study Motion Designer, Motion Video Kit, HTML Animation and HyperFrames from the [license register](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md). Build a small, *original*, deterministic Product UI brief; compare actual playable output and reviewer QA. No runtime merge before evidence. Treat Video Shotcraft as ideas/metadata first (Remotion eligibility separate), exclude OneTake and Video Talkcraft from commercial-ad tooling without additional license.
4. Only after unrelated engineering is stable: obtain **watchable** high-quality motion reference clips, perform real frame/timing inspection, then seek operator approval before any M12 creative changes.

## Paste into the next ChatGPT conversation

> Continue my GitHub project `rayray12zx3-sys/ai-motion-studio`. Read the **latest** `docs/CONTINUE-HERE.md` and `docs/PROJECT-STATE.json` on branch `docs/coordination-pre-reference-20261009`, then read latest GitHub PRs #24–#27 and #29, Issue #28, and exact-head GitHub Actions. **GitHub live state overrides any old chat summary.** Continue the top unblocked technical work, run tests and update the GitHub source, Issue/PR and handoff on every verified milestone. Keep all PRs Draft; do not merge main, publish company assets/Drive IDs, touch the private advertisement State Engine, or resume unapproved M12 art.

**Checkpoint hygiene:** Do not label work “completed” if it is only planned or committed but CI has not passed. Do not infer actual video visual similarity from thumbnails or unavailable X videos. Report blockers precisely, including changed HEADs, and carry them into the next handoff.
