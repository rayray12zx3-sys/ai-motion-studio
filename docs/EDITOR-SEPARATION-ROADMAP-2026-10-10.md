# AI Motion Studio — Editor/Renderer Separation Roadmap

**Operator decision date:** 2026-10-10 Asia/Taipei. **Status:** APPROVED DIRECTION, NOT AN IMPLEMENTED EDITOR OR AN APPROVED NEW PRODUCTION DEPENDENCY.

## Non-negotiable operator decision

- Keep the existing deterministic Canvas + FFmpeg renderer as the sole production/default rendering lane. Preserve opaque MP4 and already-approved optional Canvas ProRes 4444 Alpha profiles; do not change package.json/package-lock.json in this planning PR.
- Keep HyperFrames CLI pinned 0.8.143 only for isolated synthetic research. Its R&D exact-head success is not production adoption or blanket license clearance. Do not run/ship/copy HyperFrames Studio GUI or its compiled web assets into AI Motion Studio. Do not promote its Studio-edit PR #47 to production.
- Do not use GSAP Studio, a GSAP-backed no-code visual editor, or Theatre.js Studio (AGPL-3.0) as the production GUI. Old experiments remain historical Drafts for evidence only; do not delete them or misrepresent their commercial permission.
- Do not contact GSAP/Webflow or other licensors and do not purchase commercial licenses. Instead favor components with clear published permissive licenses and audit the actual pinned package and transitive dependency/asset license texts before import.
- A public or private GitHub repository changes access control, not the software license. Commercial use is assessed for a personal tool producing company advertisements, including media outputs and software dependencies.
- Private company assets, NAS paths, screenshots, rights receipts, private Drive URLs/IDs, secrets and private State Engine code must never enter this public repository. All public PRs/Actions use only original synthetic fixtures. Do not resume rejected M11 or frozen M12 art.

## Shortlist — as of 2026-10-10 (source licenses only, no install authorized)

| Option | Official project/license evidence | Proposed role | Decision/risk |
| --- | --- | --- | --- |
| Konva | MIT; https://github.com/konvajs/konva and https://github.com/konvajs/konva/blob/master/LICENSE | Primary interactive canvas GUI for selection, move, scale, rotate, groups | **First isolated prototype candidate**; MIT, no license key. It does not become the authority for delivered pixels. |
| React Timeline Editor | MIT; https://github.com/xzdarcy/react-timeline-editor/blob/master/LICENSE ; npm @xzdarcy/react-timeline-editor | Clip tracks, drag/resize, snapping; candidate for isolated timeline | **Benchmark in sandbox only**: React 18+ peers and interactjs/react-virtualized etc require transitive audit. It does not prove keyframe/easing curve editing. |
| Fabric.js | MIT; https://github.com/fabricjs/fabric.js/blob/master/LICENSE | Alternate rich editable canvas objects/text/transforms | Compare with Konva only if its scene-object and text requirements are better; avoid adopting both by default. |
| Moveable | MIT; https://github.com/daybrush/moveable | Alternative DOM overlay transforms, drag/scale/rotate/snapping | Optional only if preview DOM approach wins; Konva already handles canvas transforms. |
| Motion Canvas | MIT; https://github.com/motion-canvas/motion-canvas/blob/main/LICENSE | Architecture reference for animation time, preview/editor separation | **Reference only**. A different scene/renderer model; never swap the production engine for its mere license. |
| Motionity | Read project first: https://github.com/alyssaxuu/motionity | UX reference for a motion editor and editable timeline | Never copy bundled sample media/icons, import the project, or assume all embedded assets have MIT rights. |
| tldraw SDK | Restricted SDK license; https://github.com/tldraw/tldraw/blob/main/LICENSE.md | Not selected | **Exclude**: official SDK requires production license keys/trial or other terms. Its public source does not make the SDK MIT. |
| Theatre.js Studio | AGPL-3.0; https://github.com/theatre-js/theatre/blob/main/README.md | Historical optional experiment only | **Exclude from production GUI** pending separate copyleft/redistribution obligations; Core Apache-2.0 does not make Studio Apache. |
| HyperFrames Studio + GSAP | https://gsap.com/standard-license | Existing experimental comparator only | **Exclude from production GUI**. Competitive no-code visual builder restriction cannot be cured by a private repo, and operator will not seek license clarification. |

Above license classification applies to listed upstream projects, not every font, stock image, npm transitive package, browser, encoder or binary distributed with a candidate. Before using any package, pin archive URL and integrity, record SPDX, copyright/NOTICE and transitive inventory; treat missing licenses as UNKNOWN and block adoption. General permissive software licenses do not automatically authorize third-party media.

## Proposed component boundaries

1. **Neutral project model**: a versioned EditableSceneSpec document with scene/profile IDs, stable object IDs, bounded text, layers/z-order, transforms, normalized keyframes (time in frame numbers / specified fps), duration, easing, and local asset provenance (license evidence and content hash). Reject invalid or unbounded input; avoid hidden timing state, wall-clock random values, network assets and host font fallbacks.
2. **Visual editor adapter**: isolated browser UI reads/writes only this neutral data. Konva controls selection, group transforms and viewport; the timeline adapter handles track/time edits. UI preview is advisory until compared against authoritative Canvas rendered frames. Undo/redo should operate on neutral edits, not vendor-only JSON.
3. **Authoritative compiler/render**: a validated adapter maps supported neutral properties into the existing src/free Canvas renderer; any unsupported parameter fails closed. scripts/render.mjs and root Node/FFmpeg/font lock remain unchanged until new functionality passes an explicit opt-in gate.
4. **Independent R&D**: HyperFrames CLI may use the same synthetic scene semantics for comparison only, in its own branch with no Studio GUI or production import. Keep historical #33/#39/#47 Drafts as evidence; no automatic engine migration.

## Verified checkpoint — S1 pure-data slice (2026-10-10)

- **Completed scoped experiment, not a renderer migration:** [PR #51](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/51) merged. Original self-authored `experiments/editor-contract/scene.mjs` and synthetic fixture have no imports, no npm dependencies and no access to company media. Tests run in existing root CI.
- Exact pre-merge HEAD `9b3b3d68c9553502cc81d8ec3085383fefd7c117`; [CI #38021694739](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38021694739) passed 14/14 root tests including 6 targeted editor-data cases, as well as existing production checks. Merged as `97a4dc9fbdcbe75475d306e30cac3987c5788d71`.
- Tested immutable source editing, 30fps frame 0/15/29, strict schema and malformed/extra-field rejection, z+ID ordering, overlap, linear/ease-out timing, and JSON roundtrip. **Not tested:** file system editor save, mouse/GUI controls, font/layout rights, provenance evidence (assets deliberately forbidden), output pixel parity, actual Windows Premiere operation or production integration.
- Continue S1's unimplemented source rights/provenance model **without importing any binary assets**, or advance S2 only through an isolated Konva dependency/NOTICE evaluation. Neither authorizes replacing Canvas+FFmpeg or installing a root production editor.
## Implementation milestones — each independent PR; no art or production adoption inferred

**S0 — Governance and rights baseline (this docs-only plan):** record no-contact choice and Studio exclusion in canonical handoff, AGENTS guidance and machine-readable state; no new dependencies, no new hosted services. Reuse existing Issues #4/#5 for broad roadmap/rights tracking rather than duplicate tickets.

**S1 — Neutral data and pure deterministic timing adapter, no new dependencies:** prototype an opt-in EditableSceneSpec schema and tests in a strictly isolated folder. Include versioning, stable IDs, object ordering, start/end overlap, frame 0/15/29 samples, transform/easing interpolation, out-of-range and malformed JSON rejection, save/reopen roundtrip and backward-compatibility of the current scene. Do not change production outputs. This PR may be narrowly reviewed, but a formal renderer schema/API migration still needs operator approval.

**S2 — Konva interactive-canvas sandbox:** pin Konva in an independent editor-only package manifest/lock and audit archive, transitive packages and NOTICE. Build one synthetic 9:16 movable title/card; verify actual pointer selection/drag/resize/rotate, serialized neutral state and reopen. No company media or external asset APIs, no production npm graph changes. Compare Fabric.js only if Konva has a concrete blocking requirement.

**S3 — Separate timeline sandbox:** first test a lightweight vendor-neutral timeline interaction. If complexity justifies it, benchmark @xzdarcy/react-timeline-editor with isolated React dependencies and pinned rights. Verify clip create/move/trim, overlapping tracks, snap-to-frame, seeking backwards, undo/redo, keyframe records and easing curves. Crucially, the timeline component alone does NOT prove native easing-curve UX; add that separately only after data tests.

**S4 — End-to-end roundtrip and visual parity:** GUI edits neutral state, saves, reloads identically, and runs existing Canvas+FFmpeg renderer **through an opt-in adapter**. Check exact 30fps/frame count/dimensions/codec; deterministic independent re-renders; fixed sampled PNG/hashes and visual-safe-area QA in both 16:9 and 9:16. Re-run existing alpha 1080x1920 ProRes 4444 synthetic regression, without touching company footage. Detect differences between fast GUI preview and actual output; preview must not redefine authoritative pixels.

**S5 — Human acceptance and optional rollout (separate authorization):** show real playable previews, interactive latency, editor ergonomics, deterministic/export checks, license/NOTICE evidence, external-only storage and whether fonts are embedded. No new main dependency, default renderer/UI, HyperFrames adoption, actual Windows Premiere work or creative approval without explicit operator authorization. If gates fail, keep editor optional Draft and main unchanged.

## Explicit pass/fail gates

- Exact PR head verified on GitHub: root CI green plus targeted editor/browser test green, real browser pointer events and screenshot/log evidence. One passing lint test or Studio R&D demo never counts as final GUI acceptance.
- Two independent render runs: decoded frame equality for each frame over one 30-frame synthetic fixture; before/after edits must differ at expected timestamps and re-opened state must reproduce the same edit; reverse seek must preserve results.
- All npm packages are exact-version pinned in isolated folder with checksummed tarballs, license inventory and attribution/NOTICE; block unknown/noncommercial/production-key packages until excluded or explicitly operator approved.
- Maintains src/free, scripts/render.mjs, root package and lock, private State Engine, M11/M12 art and company assets without unapproved modification. FFmpeg, fonts and codecs remain separately checked as before.
- Distinguish **direction accepted**, **synthetic R&D test passed**, **editor fit tested**, **commercial software rights reviewed** and **production adoption approved** in GitHub state; never collapse them into a single 'done' flag.

## Immediate next engineering action

Begin **S1 only** on a clean, isolated Draft based on freshly verified main: no dependency install and no production modifications. First inspect existing renderer scene shape and M3/M7 SceneSpec draft work to avoid incompatible parallel contracts. Write a small pure-data adapter/test specification, then seek exact-head Actions evidence. Follow with S2 Konva sandbox only after dependency/license audit and operator acceptance of any production dependency change. This roadmap does **not** authorize a broad migration.

