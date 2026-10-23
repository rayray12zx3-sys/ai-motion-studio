# C3 visual/design and technical gate — 2026-10-18

## 2026-10-23 C3 acceptance matrix (pre-registered; **not yet executed**)

This section defines the missing evidence for the existing Issue #138, **not** another synthetic artifact or an automatic art signoff. The original 8-second 240f, 1280×720/30fps MP4/Alpha evidence remains TECH PASS; its earlier sampled-frame review remains NEEDS_REFINEMENT. No previously approved client art is modified.

| Review category | Evidence to inspect (for EACH of two distinct, original 6–10s synthetic briefs and each selected renderer) | Stop condition |
| --- | --- | --- |
| Meaningful motion | Original storyboard with intent → trigger → physical response → audience result mapped to exact frame beats; 1× encoded MP4 and independently extracted key events | A label or subtitle changing without causal transformation; arbitrary geometric ornament |
| Visual specificity | Named truthful original interaction and recurring object/graphic; reviewer can describe what changed without reading explanatory captions | Generic indistinguishable card/bar slideshow |
| Typography & device | Actual Taiwan Traditional Chinese glyphs, title/options and subtitle at target screen scale, font provenance/hash, bounds and safe areas | Missing/incorrect glyph, clipped text, unsafe logo, overlapping UI |
| Timing and continuity | Full 1× film (not contact-sheet-only), event timestamp defects and transitions; preserve intact object identity across cut | Flashback, alpha discontinuity, unreadable critical affordance, fake user interaction |
| Media handoff | ffprobe/frame count/fps, real ProRes 4444 alpha and color/edge inspection (if delivery requires), reproducible SHA+receipt | Codec, frame, alpha, source integrity failure |
| Comparative tradeoff | For the SAME two briefs, render through unchanged existing default where legal/available; side-by-side at 1×; tally revision count, actual compute/runtime/cost from receipts rather than estimates | Missing baseline must be marked BLOCKED, never zero cost or automatic Cinetic win |
| Operator approval | Signed exact SHA or explicit rejection by the user, after actual playback | No surrogate self-approval by the renderer or static numeric gate |

**Evidence format:** one review row per clip and format with exact SHA, source commit, target device, 1× viewer, observation timecodes, rating PASS/FAIL/PENDING, defects, repair variant and rerender receipt if needed; one cross-engine comparison row per common brief. A QA reviewer cannot turn incomplete user signoff into PASS. Use the already-installed `visual-design-review` v0.2.2 rather than inventing additional Director/Art Agents.

**Allowed immediate next work:** source/static planning and audit of existing outputs are safe. Further rendering or remote Actions are opt-in and require checking exact permissions, privacy and cost. The protected real S08 v22u renderer/Drive upload is a separate C4 technical PASS, not proof that this two-brief C3 art gate passed.

---


**Media source:** original 8-second synthetic source from branch HEAD `06849d82701e30fba53016cf4fac9f2dd994ffb6` (before this documentation-only update). [Exact-source CI #39119764010](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39119764010), [two-day artifact #12134200142](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39119764010/artifacts/12134200142). No owner/client/company material used.

## Status (keep distinct)

| Gate | Result / evidence |
| --- | --- |
| C1 opt-in Cinetic direction contract | **PASS (R&D)**: separate scoped project skill, explicit engine router, no global visual-review interception |
| C0 upstream integrity | **PASS for metadata only**: `Leonxlnx/cinetic` pinned commit `ecfa6605de1adb9345ce937724810dc32267d068`, MIT source, exactly 273 technique entries; selected `tr-velocity-handoff-cut` exists but **was NOT faithfully reimplemented** |
| C3 actual renderer technical QA | **PASS**: 1280×720 / 30fps / 240f / 8.000 s; H.264 MP4 SHA256 `0824916a855d93003b86f548db7129bcd152df59c6c1f7e5c0aefc2ddc3afe7c` and actual ProRes 4444 ap4h/yuva444p10le MOV SHA256 `406e5dcddb36dc90ad8edd81a27fc37ea348ae4983ebc73c3554ea12b369fd7c`; decoder samples across every act, margin transparency and visible alpha were verified; first-frame synthetic objects now visible (61,106 nonzero-alpha pixels) |
| Font/source technical | **PASS for synthetic R&D host only:** root-locked Noto Sans TC subset shards with recorded SHA and Unicode range, not approved for all Taiwan/brand cases |
| Independent evidence-limited Visual Design QA | **NEEDS_REFINEMENT / NOT_ART_APPROVED**, detailed below |
| User art sign-off | **PENDING_USER_APPROVAL**, only the operator can accept exact motion work |
| Windows Premiere native import/alpha/export | **NOT_TESTED** |
| HyperFrames/GSAP exact commercial use and transitives | **CONDITIONAL_NOT_APPROVED**; excludes bundled no-code Studio GUI |
| Full upstream Cinetic Agent Skill installation/execution | **NOT_DONE**: project-scoped adapter uses pinned source data and original choreography, not all upstream scripts/music/60fps/full 273 techniques |

## Independent visual review — sampled real decoded frames (not full-speed certification)

The independent reviewer examined frame 0 of the revised exact-head render, and a 10-timecode contact sheet of the preceding scene design before the first-frame fix (other scene device and text composition unchanged). This is actual artifact evidence, not an imagined mockup. **No numeric rubric score** is assigned because brand specification, device-scale legibility, full-speed timing and complete source editability were not reviewed.

- **0.00s / revised exact head / observed:** three distinct evidence cards and their internal lines are visible on the first frame. This fixes the prior all-black opening, while MOV corner/side alpha margins remain transparent. A readable headline is not yet visible on frame 0; first-second hook still needs a real-speed creative review.
- **0.4–2.2s / sampled preceding composition / observed:** title `分散訊號` and three information cards are visually separate and are legible at the sampled review scale. Considerable upper-stage negative space; the bars have no concrete semantics, so the feature is still hypothetical.
- **2.6–4.8s / sampled preceding composition / observed:** `找到關聯` appears and the *same* three cards move together as connecting paths appear. This is a visible causal relationship, unlike the initial dot-only/caption-only prototype.
- **5.7–7.4s / sampled preceding composition / observed:** `形成判讀` and the aggregate result card are displayed; the three source cards shrink into the one result. Possible tight spacing near the title-to-result handoff merits a full-size/timecode check before formal approval.

**Remaining creative risks / priority:**
1. **High — specificity:** this demonstrates a reusable motion primitive, not an actual product feature. The schematic bars could represent many unrelated services. Build a named, truthful synthetic product interaction before claiming Cinetic-level direction or commercial ad readiness.
2. **Medium — hierarchy & rhythm:** lengthy sparse opening and considerable top negative space. Independently watch 8.0 s motion at target playback scale; adjust the opening and causal event timing, not just static frame composition.
3. **Medium — format fidelity:** Cinetic's full preferred 60fps/audio/finish/true motion-blur gates are not met by the 30fps silent benchmark. Native Windows Premiere and camera/sound handoff remain separate.

**Critical permissions:** Neither tech PASS nor a visual rubric can set `USER_ART_APPROVED`. No imported previous K-series art approval; no automatic preview-to-production deployment; maintain public/private media boundary.

## Required operator check
Review the combined 8-second GIF and/or original full-speed MP4. An explicit owner art judgment is needed before promoting the exact scene. If feedback indicates that this still looks generic, revise the substantive feature concept and object behaviour, not just opacity/easing. Promotion to routine commercial jobs requires separate rights and Windows Premiere acceptance.
