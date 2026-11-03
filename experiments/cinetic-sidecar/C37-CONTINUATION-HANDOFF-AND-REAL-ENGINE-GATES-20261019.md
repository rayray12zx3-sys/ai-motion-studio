# C3.7 conversation-continuation handoff — genuine engine boundary and concrete next experiment

**2026-10-19 | PUBLIC / ORIGINAL SYNTHETIC ONLY | DRAFT RESEARCH.**

> This handoff intentionally contains **no private business media, private script/text, credentials, narration, customer assets, account references, storage URLs, product identity, or non-public project location**. It is a reusable PUBLIC-SYNTHETIC R&D brief, not a production commit or human art approval.

## Evidence-based current status

- This research line is **active, not cancelled**. Its independent [Draft PR #140](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/140) is separate from the main K-series approved typography renderer and remains unmerged. The existing default renderer, official presets, baseline fonts, project main and approved art must not be silently changed.
- C3.4: original scene-specific *styleframe* research. Screenshots alone did **not** demonstrate real time-based motion.
- C3.5: **actual** two-second / 60-frame original synthetic motion was rendered and reproducibly checked, but it was done with a self-contained **CairoSVG/Pillow/FFmpeg** renderer, **not** upstream Cinetic or HyperFrames. The fact that an MP4 exists is NOT evidence of Cinetic runtime integration.
- [C3.6 generic stacked-page motion contract](C36-SYNTHETIC-STACKED-PAGE-HANDOFF-IMPLEMENTATION-GATES.md) is now available: **DESIGN_CONTRACT_ONLY**, not implemented or visually rendered by the upstream engine. Do not auto-upgrade `USER_ART_PENDING` to approved or claim hypothetical schema/animation support has passed.
- The pinned upstream [Leonxlnx/cinetic](https://github.com/Leonxlnx/cinetic) project and its documented technique metadata were studied, but metadata provenance and copying a conceptual directing framework do not prove complete, working upstream Cinetic implementation. HyperFrames/GSAP commercial rights, source/runtime dependencies and final editor delivery require their own evaluations.
- The current `adapter.mjs` contract uses `scatter/connect/resolve` plus visual motifs. As written, it lacks typed **parent-child page groups, independently living stacked pages, attached success glyph, overlapping simultaneous Y-up + alpha transitions, visual clipping, and deterministic reverse-seek acceptance**. A passing generic adapter test cannot establish these new behaviours.

## Non-negotiable research target: physically correct vertical page-stack

Use completely **invented** labels/visuals. This public experiment is about generic visual causality, not any real app:
- Exactly one independent *mode heading*: introduce once, then move to its separate branded position without ever duplicating it.
- Icon begins **completely off-frame**, enters from right to left; click triggers a clearly visible actor drop to the floor. Preserve natural facing/motion consistency; **do not mirror a person blindly**. No progress bar unless independent art direction calls for it.
- Two **complete page parents** already exist in one vertical stack. Each parent owns one question heading plus four answer rows; don't transition them as five unrelated floating captions.
- A completion check is anchored to the foreground page. The **same overlapping frames** contain foreground **negative-Y upward exit + fade**, as the underlying complete page rises into the **same** focus area. Page order/backdrop clipping must remain coherent; avoid reusing a horizontal carousel as a substitute.
- Time-based keyframes must show readable entrance, answer action and physically explainable motion. A coherent small 30fps synthetic test is a **technical proof**, not by itself art quality.
- Ensure no transient overlay covers the heading, no title clone, no major object teleport or right-edge first-frame leak.

## Implementation / acceptance gate, not just more spec documents

1. Create a **strictly opt-in** `page-stack-handoff` motif or typed graph extension under this isolated experiment; do not alter default production behavior. Define stable object IDs, page parenting, z-order, visibility/clip bounds, attachment and explicit integer-frame motion tracks.
2. Validate frame-wise causal states (initial/offscreen; entrance; click; fall; question present; check/handoff simultaneously; subsequent page in place) and reject incompatible schedules, duplicate heading IDs or absent/incorrect page groups.
3. Write deterministic forward-seek / random-seek / reverse-seek tests. Assert front/incoming overlap exists while check appears; foreground moves UP, not X; heading is unaffected by page clipping.
4. **Run the declared Cinetic/HyperFrames engine or clearly label any fallback renderer as a separate non-engine experiment.** Capture exact CLI/version/provenance, decoder-confirmed real MP4 and alpha if generated; do not describe a synthetic FFmpeg proxy as upstream integration.
5. Perform independent timecoded mobile-size Visual Design QA, Traditional Chinese licensing/legibility where used, color/alpha on contrasting backgrounds where relevant; require actual human art review, not only green CI.
6. Keep input footage/fonts/audio **original and public-synthetic**. Do not ingest private business source, protected footage, company logos, non-public Drive IDs/URLs, credentials or copyright-sensitive asset copies. Do not dispatch paid generation, modify default renderer, merge the research PR or change approved variants without explicit gate satisfaction.

## Continuation priorities

**Parallel, not exclusive:** continue real creative animation proof refinement in its properly isolated private workflow while improving this independent public synthetic engine test. Avoid halting visual iteration pending architecture and avoid repeating plans without rendering/evidence. The next **public** output should be **actual typed adapter + executable tests + a short decoded original-synthetic motion**, or a precise blocker report if upstream runtime cannot legally/technically run—not another generic lookdev checklist.

**State boundary:** `C3.5_RENDERED_BY_ALTERNATIVE_TOOLS` / `C3.6_SPEC_ONLY` / `C3.7_HANDOFF_DOC_ONLY` / `TRUE_CINETIC_PAGE_STACK_ENGINE_NOT_VERIFIED` / `USER_ART_PENDING`.
