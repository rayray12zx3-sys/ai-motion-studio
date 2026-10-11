# AI Motion Studio — 2026-10-11 continuation and existing decisions

> This is a dated **index of already established operator decisions and verified milestones**, not a fresh design approval or substitute for live GitHub. At every continuation: read `AGENTS.md`, `docs/CONTINUE-HERE.md`, `docs/PROJECT-STATE.json` and current PR/Issue/commit checks. Newer live evidence supersedes stale project snapshots.

## Goal was already decided: do not ask again

The goal is an **animation-first, deterministic, reusable motion-graphics workflow** that can eventually make polished, commercially usable video outputs. Refer to `docs/ARCHITECTURE.md` (animation quality before production integration), `docs/INTEGRATION.md` (selective extraction after actual visual validation) and the prior creative research. A single successful encoder export **does not** mean the motion direction/visual quality is approved; neither does a basic synthetic scene become the product's quality ceiling.

The user has directed continued, bounded autonomous engineering work **until a real human decision or user-PC access is necessary**. Do not repeatedly ask whether improving professional animation quality is the objective. This direction is **not blanket approval** of new engines, artistic treatments, asset imports, license commitments, destructive local actions, broad PR merges or design freezes being lifted.

## Current implementation and user-validated limits (2026-10-11)

- Default authoritative local path remains **Canvas + SHA-256-verified FFmpeg**; optional Konva editor is separately packaged, **not pixel-accurate WYSIWYG**, and approved S1-v1 scene export is additive.
- The original 30-frame synthetic scene **deliberately** has abrupt half-open clip exits. This is acceptable technical test data but an unsatisfactory professional animation example.
- **Issue [#90](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/90): OPEN.** Codex Cloud checks passed; user's local Codex **reported** actual Windows Chrome GUI, persistence, MP4/ProRes Alpha and sampled review technical PASS. Local tests **46 pass, 0 fail, 1 Windows symlink-permission skip** (see the [operator-report comment](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/90#issuecomment-6108726595)). These local media files and private/ignored scene data are **not remotely inspectable from GitHub**. Premiere Pro is not installed on that PC: native import/compositing remains BLOCKED; human artistic review remains PENDING. Do not label either PASS.
- **PR [#92](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/92): MERGED 2026-10-11** at `955834bd96940bd553c16ee6d34bb55b16b7003e`, after 10 exact-head successful jobs; only two verification-script lines changed.
- **PR [#93](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/93): OPEN DRAFT, NOT MERGED**. Separate optional six-second, asset-free, text/rectangle motion sample with intentional fades, exact-head 51/51 root tests and actual 180-frame MP4/Alpha CI. It is **NOT a user-approved visual direction or a finished commercial motion test**. Do not put it into the official baseline solely because CI passed.
- **PR [#94](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/94): MERGED 2026-10-11** at `b30974f1d07bf497a75d8c71372e61d3acd3c183`, exact-head 52/52 tests. The new `scripts/audit-editable-motion.mjs` is a standalone **read-only S1 clip-boundary advisory**, not a renderer mutation, automatic video-quality verdict or mandated fade style.
- **Issue [#91](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/91): OPEN, REFERENCE_ONLY.** Skillry examples must not enter this issue's work, trigger new browsing/engine adoption, or become an unapproved style recipe.

## Preserve earlier creative/editorial work and human ownership

- The **Creative Harness** and editorial style documents (`DIRECTOR.md`, `TECHNIQUE.md`, `styles/editorial-motion/STYLE.md`) were proposed in [Draft PR #9](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/9), historically stacked and **not present in main**. Review them as proposals for context, **not canonical approvals**; do not silently merge their stack.
- [Draft M11 #25](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/25) **visual direction REJECTED**; [Draft M12 #26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) **frozen/not approved**, in part because target reference videos were not actually watched. Do not repeat rejected shapes/pacing, misstate reference parity or unfreeze work.
- HyperFrames/GSAP Studio/AGPL experimental branches are isolated; do not import/add packages based on attractive demo imagery. Real company/NAS material, private mask, ads, customer briefs, credentials and private Drive links/IDs must stay out of public GitHub.
- Technical `PASS` must be distinguished from browser `PASS`, local Windows `PASS` (with evidence origin), Premiere compatibility, 100% frame QA, rights clearance and **human artistic acceptance**.

## Next authorized execution order

1. **Read current actual source, historic creative plans and live CI** before proposing a new art direction. Preserve source and rejected/frozen constraints. The animation-first objective is not an open question.
2. Finish bounded, safe, **additive S1 engineering/diagnostics and docs** with synthetic input, reproducible exact-head tests and no new dependencies/schema/renderer changes. Merge narrow CI-green technical/docs changes only after actual diff review and delegated scope checks. Do not conflate draft code with main.
3. Use **watchable full-speed videos**, not still contact sheets or encoder summaries, for any candidate *visual* evaluation. PR #93 is a **technical test candidate** until the operator approves its creative direction; its intentionally simple rectangles are not evidence of commercial-quality output.
4. **Stop and request operator involvement only at a genuine decision gate:** creative/style acceptance or changes to the frozen M11/M12; schema-v2/arbitrary Bezier, geometry/shape feature expansion that changes renderer contract, replacing engine, adopting a new third-party component/license, real/company media and commercial rights, destructive user-PC work or actual Premiere installation/use.
5. **Do not close Issue #90** for green cloud CI alone. Native Premiere and artistic review gates remain separate. Protect existing ignored local files and leave real input/output outside public repo.

## Future handoff hygiene

When changing a tracked source file, record exact PR-head tests and outcomes, update the affected PR/Issue, and publish a succinct latest checkpoint here or in the active canonical handoff. Never invent a completion percentage for S0–S5 or infer release readiness from component smoke tests. Prefer an explicit `PASS/FAIL/BLOCKED` evidence table over unsupported quality claims.
