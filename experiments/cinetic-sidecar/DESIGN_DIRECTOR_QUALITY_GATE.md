# Cinetic — design-direction quality gate (opt-in; 2026-10-26)

**Scope:** reusable motion-graphics direction and source-backed design QA for synthetic/public-original examples. This file is a production checklist, **not an executable Skill/plugin, Cinetic technique implementation, paid tool authorization, proof of private video rights, or automatic user art approval**. Keep public/private trust boundaries in the existing Cinetic sidecar unchanged.

## Reuse before adding new Skills

When available, **reuse** the already installed ChatGPT skills/capabilities (the exact names are host-specific and not installed by this document):
- `visual-design-review`: its Design QA v0.2.2 rubric and `critique → polish → distill` passes for visual hierarchy, typography, device legibility, brand, accessibility and visual collision review.
- `motion-director-lookup` and repository `registry/cli.mjs`: consult saved source-backed Motion Reference Registry first, then the pinned Cinetic technique selector, not arbitrary third-party video/code. Record source IDs and why each candidate is necessary. Direct use of Motion Prompt source code requires retaining MIT notices; Kittenjam/Prompt Motion have unverified reproduction rights.
- `ai-motion-orders`: existing accepted K01–K20 / animation handoff and visual fail-closed rules; do not overwrite accepted variants. K## identifies AI Motion Studio recipes, **not Cinetic upstream 273 technique IDs**.
If a runtime cannot invoke these ChatGPT skills, this document supplies the conservative checklist; never claim the installed Skill was called in that host.

**Optional reading/inspiration**, not copied source or installed program: pbakaus/Impeccable critique/polish/distill, Adobe Spectrum motion, IBM Carbon motion. These are conceptual design references, not blanket UI settings for advertising.

## Hard pipeline (before final animation render)

1. **Brief & invariant lock** — message/CTA, exact text, product identity, event order, real/source vs synthetic media class, allowed license/font, fps/frame count, platform device safe envelopes. Never change locked wording to fit art.
2. **Director selects at most three distinct *mechanical* references** from registry (ID, source, purpose, license status, applicable system capability). Cinetic picker results are proposals: `selected != implemented`. Do not add techniques without cause→effect→audience consequence.
3. **Three-frame visual layout gate** — layout at first readable frame, highest-interaction frame, final resolved frame. Use a single clear optical anchor; align title/product/UI to one grid; assess left/right visual weight and extreme blank-space balance *within the actual platform-safe region*. Do not infer polished appearance from safe-zone pixel pass.
4. **Typography & design-system gate** — measured rendered font bounding boxes, Chinese locale, card reading hold, contrast on real background, one font-role hierarchy, consistent spacing/radii, logo/product hierarchy; no unauthorized extra caption, invented claim or arbitrary decorative border.
5. **Motion continuity gate** — for each object, record first visible frame, last visible frame, x/y bounds, width/height if deformation forbidden, velocity profile at joins, reference mechanism. Required transitions are an intelligible object transformation, not a hidden crop that slices words. An intentional app/card clip must move with the whole object and cannot crop independent text layers during a handoff.
6. **Device-sensitive safety gate** — evaluate all meaningful content against target ad placements AND an actual mobile playback. A generic 9:16 ratio, heuristics or isolated RGB mask check alone can never certify Meta/TikTok/Shorts in-feed UI clearance.
7. **Source-code preflight** — catch common bugs: 1-frame alpha=0 at an ownership handoff, negative modulo/phase on a new loop, discrete opacity reset, one-frame blank stage, two complete sets of question text overlapping, clipped fore/back cards, subject sprite scale changing when prohibited, out-of-bounds marketing copy.
8. **Real frame review** — inspect full decoded sequence at original 1× and key timecodes. Automated checks can cover framecount/codec, selected semantic states, pixel region/centroids, layout region; they **cannot** issue `ART_PASS`. If any visual reviewer rejects, mark `ART_REJECTED` and fix before claiming ready.
9. **Release** — only exact-SHA user artistic approval, real client-rights proof and requested editor/platform validation can move `USER_ART_PENDING` or `RELEASE_BLOCKED` to success. Keep public synthetic media separate from any company/private frame.

## Required per-preview receipt

```json
{
  "scene": "synthetic-reference",
  "source_sha256": "record-real-hash",
  "reference_ids": ["record-used-ids"],
  "frame_events": [{"frame": 0, "semantic": "state"}],
  "composition": {"title": "measured-bounds", "hero": "measured-bounds"},
  "continuity_checks": ["handoff-visibility", "loop-join", "no-cropped-text"],
  "render_engine": "record-actual-engine-and-version",
  "media_qa": "PASS_OR_BLOCKED",
  "human_art": "PENDING",
  "platform_ui": "NOT_TESTED",
  "commercial_rights": "CASE_SPECIFIC_PENDING"
}
```

**Routing regression examples** (static draft; no runtime telemetry): positive — “教育 APP 的題卡看起來偏一邊，修正視覺重心”; “角色跳動有一格消失，檢查 frame seam”; “換題卡片切到文字，做完整物件交接”; “比對 Reference Registry 的合適動畫”. Near-miss negatives — “只有想查 GIF 的檔案大小” (media metadata), “幫我只生 SRT” (subtitle), “把新的任務交給 Visual Design Review 就當作 render” (not a render). A checklist document is **not evidence of an installed or automatically invoked Agent Skill**.

## Never silently expand

No new public CI, untrusted packages, remote image processing, paid render, company input, main-branch merge or new plugin installation through this document. Improve the *existing* Cinetic path before adding any additional Skill.
