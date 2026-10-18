# AI Motion Studio — Product Charter & Anti-Drift Gate

**Persistent project charter / 每次交接必讀。** Established from the original GitHub roadmap, later explicit operator decisions, and the 2026-10-11 request to prevent long-conversation drift. This charter records **what has already been decided**, **what has merely been proposed**, and the review procedure. It **does not create new implementation, art, license, data, or merge permissions**.

## 1. North star — DO NOT REDEFINE WITHOUT EXPLICIT OPERATOR DECISION

**AI Motion Studio is a standalone, conversation-driven, AI/Codex-assisted system for creating high-quality, reusable Motion Graphics** intended to produce videos the operator can review and, after rights/quality acceptance, use in actual editing and commercial work.

**Expected user experience**: describe an animation in ordinary conversation → Agent/director produces a comprehensible treatment and storyboard → chooses suitable original/authorized motion patterns and a bounded scene contract → renders reproducible video → reviews *watchable full-speed motion* and technical evidence → proposes/carries out revisions within approved scope → delivers a final approved MP4 and, when supported and separately checked, transparent ProRes MOV. The user should **not have to manually keyframe every layer** or program each variation.

**Not the product goal**: make a general-purpose replacement for Adobe Premiere/After Effects; maximize Konva UI options, schema features, test counts, or Actions jobs independently of animation output; produce only static title cards or plain rectangles and call that professional-quality animation. The optional editor remains legitimate approved supporting infrastructure. This is chiefly **programmatic/Agent-directed controllable motion graphics**; text-to-video diffusion, asset-generation models, paid inference, TTS/audio, and production media ingestion are **not implicitly approved**.

**Sources / provenance**: [original conversation-driven roadmap Issue #4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4), [quality/reuse Issue #5](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/5), [advanced multi-object, 12–15s, 4–5 shot benchmark Issue #11](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11), [ARCHITECTURE.md](ARCHITECTURE.md), [restored original vision](RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md), and [integration boundaries](INTEGRATION.md).

## 2. Decision classification — prevent assistant proposals from becoming operator approvals

| Status | Meaning | Example / evidence |
| --- | --- | --- |
| **DECIDED_GOAL** | Explicitly established product intent; may guide routine scoped work | Conversation-driven AI-assisted motion production, animation-first, reusability, reproducibility, actual human visual quality, self-contained repository [#4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4) / [#11](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11) |
| **APPROVED_CURRENT_IMPLEMENTATION** | Permission actually given for a specific bounded integration | Current Canvas + hash-verified FFmpeg production default; isolated opt-in MIT Konva GUI and S1-v1 additive export under [editor approval](EDITOR-KONVA-ADOPTION-DECISION-2026-10-10.md) and [render approval](APPROVED-EDITABLE-S1-RENDER-2026-10-10.md) |
| **RESEARCH_AUTHORIZED_ONLY** | Can investigate in isolation, not migrate into product | S1 geometry-v2 [Draft #96](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/96), HyperFrames CLI trials [Draft #33](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/33); different tests do not confer engine adoption |
| **HISTORICAL_DRAFT_OR_CANDIDATE** | Exists in GitHub but not an adopted main product or approved art style | Creative Harness [Draft #9](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/9), Brief → SceneSpec [Draft #20](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/20), template registry [Draft #23](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23), QA [Draft #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) |
| **REJECTED_OR_FROZEN** | Do not resume or merge without renewed explicit consent | M11 [Draft #25](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/25) creative direction rejected; M12 [Draft #26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) frozen without actually watched reference movies |
| **ASSISTANT_PROPOSAL_ONLY** | A planning hypothesis, not authorization, even if the document landed on main | The **P0–P5 sequence** in [restored roadmap](RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md); especially ordering AI generation vs animation quality vs GUI/alternate engines, and proposed acceptance benchmark thresholds |
| **HUMAN_GATE_OPEN** | Needs actual operator quality/right/architecture/local-app approval | Artistic acceptance, Premiere Pro native import, licensed company media, production v2 schema migration, source LICENSE selection, new commercial-license dependencies |

**Precedence**: a newer *explicit operator instruction* controls within its named scope; existing adopted `main` code and signed-off decision docs constrain implementation; live GitHub PR/Issue/CI determines current status, not dated JSON snapshots or chat recaps. A Draft PR or assistant-written merged planning document **does not retroactively grant permission**. Later operator decisions may authorize more, but only explicitly. In case of unclear/conflicting approval, do not silently pick the most permissive interpretation.

## 3. Non-negotiable engineering and rights boundaries

- Preserve current official offline reproducible Canvas + pinned-font + hash-verified FFmpeg path **until a separately authorized engine comparison and decision**. This is a *current technical baseline*, **not an eternal promise** that only those tools can achieve quality.
- Konva editor is **optional supporting UI**. Maintenance within its already approved scope may continue when needed; new geometry-v2 product migration, live asset loaders, timeline frameworks, major renderer/contract changes and new engines have separate approval gates. Do not erase completed research just to refocus on the goal.
- Keep all prior **tool investigations and individual licenses** discoverable in [recovered tool/license map](RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md), [source license register](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md), and [20-project research](X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md). “Not adopted” ≠ “never studied.” Re-evaluate candidates using real motion-quality gaps, actual versioned legal terms, transitive code and assets; do not automatically install them.
- Distinguish tool commercial eligibility, software NOTICE/source redistribution, independent output-media rights, fonts/assets/music, encoder/codec law, and final **no-mandatory-end-video-credit** goal. Personal ownership, free usage or a private repo do not nullify third-party commercial restrictions. Existing GSAP/HyperFrames Studio GUI exclusions, Theatre Studio AGPL and Remotion entity-dependent terms continue unchanged.
- Public repo/Actions/Issues contain **original synthetic-only evidence**; never put private company footage, ad copy, source UI, NAS/Drive identifiers, license receipts, project state or secrets there. No default integration into `ai-video-template`, private State Engine or other video projects.
- Technical lint/unit/codec/browser PASS does **not** mean quality/art/Premiere/software-rights PASS. No style/reference claims from still contact sheets if motion wasn't actually watched.

## 4. Per-task drift gate — required at START and FINISH

Every future ChatGPT/Codex task/PR must answer, in its planning or PR notes (a compact paragraph/table suffices):

| Required field | START: choose and record | FINISH: report actual evidence |
| --- | --- | --- |
| **Goal impact** | Which part of brief → creative direction → motion technique/reusable scene → render → watchable review → iteration improves? Or which necessary blocker/reliability/security/license issue is being removed? | Was the targeted animation capability or user workflow measurably improved? If only plumbing was changed, say **engineering-only**. |
| **Source and decision** | Source Issue/PR/charter and status: DECIDED / APPROVED / RESEARCH / DRAFT / PROPOSAL / FROZEN; disclose permission boundary. | Which approval gates remain open; did the scope stay bounded? |
| **Deliverable and proof** | The *smallest output* required: original two-brief demo, actual MP4/MOV, design comparison, deterministic QA, or technical regression. Do not create UI/schema without a concrete need. | Real artifact and full-speed inspection **when claiming creative motion quality**; exact commit/CI/format frame evidence for technical claims, separate human art status. |
| **Tools, rights, separation** | Current engine, candidate source/license/status, whether any package/provider/media/scope change is proposed; protect old projects. | Source/library/asset/codec audits honestly marked PASS/PENDING/BLOCKED; don't confuse a repo's license with demo media rights. |
| **Next action and stop gate** | Continue safe bounded work, identify **which specific decision** needs the operator rather than asking them to reapprove the same goal. | What remains unfinished, who's authorized to decide, and what link lets the next session resume? |

**Drift trigger**: work accumulates more editor/geometry/smoke iterations **without improving a real motion output, Agent reuse/iteration, rights/security gate, or necessary reliability blocker**. If triggered, **stop scope growth**, summarize value against the north star, and propose a bounded animation-facing alternative. Don't discard existing tool studies or invalidate a legitimately approved editor task. An actual user-requested editor fix can still be prioritized explicitly.

**Benchmark, not a fixed historical authorization**: candidate first release gate is two different original briefs using a shared proven source/scene system, meaningful scene/shot differentiation and responsive ratios, reproducible watchable MP4 (and verified Alpha as applicable), technical QA + full-speed human artistic review, and measurable agent iteration. Historical [#11](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11) proposed 12–15s, 4–5 shots with a persistent object. Treat any new threshold or ordering as **PROPOSAL_ONLY** until specifically agreed, not as CI-enforced acceptance on unrelated changes.

## 5. Handoff protocol and changes to this charter

At **start**: read `AGENTS.md` → this charter → [recovered vision](RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md) → [tool/license map](RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md) → `CONTINUE-HERE.md` / `PROJECT-STATE.json` → **live** GitHub main/PR/Issues/Actions. Check unresolved art/license/technical gates. Do not ask again for an already-recorded answer.

At **end**: put links, exact head SHA, evidence status `PASS/FAIL/BLOCKED/PENDING_HUMAN`, unresolved issues and next bounded step in the relevant PR/Issue, and when decisions change update central handoff. Avoid silently treating last chat's suggestion as a decision. Retain original sources and note superseded claims; do not rewrite historic approvals into a clean but fictional narrative.

To **change the product's north star, engine/editor priority, license posture, media boundary or frozen creative gate**: obtain an explicit operator decision; add a dated *decision delta* with what changed, why, authorized scope and source link; update this charter and its pointers using a reviewed PR. Technical CI alone may never amend creative decisions. Routine backwards-compatible documentation fixes still follow the delegated narrow exact-head CI/diff review process.

**Current baseline**: product north star DECIDED; Canvas/FFmpeg and optional Konva-v1 APPROVED for bounded roles; two-brief AI production quality gate PENDING; Draft #96 only R&D; source LICENSE and human visual/native Premiere approval still open. No new license, new engine, new art direction, v2 rollout or migration is approved by this charter.

## 6. Cinetic opt-in sidecar — 2026-10-18 operator decision delta (PLANNING)

**Source:** [Issue #138](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/138); linked from original [roadmap #4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4).

**Changed:** operator requested an **additional Cinetic-directed motion pipeline alongside the existing Python/Pillow+FFmpeg animation workflow**, *not* a renderer replacement. Cinetic is an Agent Skill/directing pipeline; a proposed sidecar render backend is **isolated HyperFrames CLI**. The repository's approved Canvas+FFmpeg default and opt-in Konva S1 stay unchanged, with historical HyperFrames/Helios R&D Drafts preserved. No new production runtime dependency, art style, project schema, client assets, credentials or remote service is authorized by this planning decision.

**Why:** strengthen meaning-first visual storytelling and multi-scene animation without jeopardizing accepted K-series assets or existing deterministic alpha deliverables. Reuse *existing* isolated HyperFrames code/alpha research in Drafts #33/#39, and retain the separate GSAP/Studio/license warning in Draft #46. Keep Remotion conditional, not the default, and never install/merge HyperFrames Studio's GUI into the product.

**Current status:** `PLAN_TRACKED_ISSUE_138__NOT_IMPLEMENTED`. Research (source/provenance/licensing/version compatibility) → isolated, opt-in Cinetic-director adapter → original synthetic two-brief comparison (real MP4 and alpha validation, full-speed visual review) → only then a fresh explicit production/rights/Windows Premiere approval decision. No upstream packages or code were installed by this decision note. The same operator artistic gates and one-combined-GIF review policy continue to apply; Windows Premiere native acceptance is not implied.

**Source/evidence boundary:** any public GitHub Issue, PR or CI carries only original synthetic text/media and public-source technical metadata; private Python implementation, user/company content and private Drive identifiers remain outside GitHub. Do not alter `ai-video-template`, main's renderer, approved v9/K artwork or frozen M11/M12 directions. Upstream version, transitive rights and Cinetic-specific alpha behavior must be verified from execution rather than extrapolated from earlier HyperFrames trials.

**Next handoff pointer:** [Issue #138](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/138) for C0–C4 tasks and gates; this is an **operator-approved direction to plan a sidecar**, not proof of integrated production capability or a broad consent to new licensing/install/runtime behavior.
