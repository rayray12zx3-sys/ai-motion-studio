# Cinetic director sidecar — C1 adapter + C2/C3 isolated synthetic render proof

**Status 2026-10-18:** confined director-plan adapter plus two real separately encoded **16:9 and 9:16 2-second H.264 MP4 + ProRes 4444 Alpha MOV** samples on an isolated pinned CLI. Real decoded frames and transparent margins verified by [two-brief CI #39116273741](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116273741). An additional **persistent three-node graph** now carries the visual object across beats, with actual render and technical checks passing at [CI #39116764337](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116764337). **Not** upstream Cinetic Skill fully installed, **not** an approved production backend, and **not** approved art or commercial rights.

## 2026-10-18 latest exact-source C3 continuation

- [Pinned eight-second narrative run #39119764010](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39119764010) at source commit `06849d82701e30fba53016cf4fac9f2dd994ffb6` is **TECHNICAL PASS**, using an original semantic **evidence-card → relation → result-card** motion device, 1280×720, 30fps, 240f / 8 sec. Actual H.264 MP4 and transparent ProRes4444 ap4h MOV passed decoded QA (including first-frame visible objects, transparent margins, actual motion); a user-reviewable 8sec GIF exists in the short-retention artifact.
- The disposable runner read the upstream official `Leonxlnx/cinetic` commit `ecfa6605de1adb9345ce937724810dc32267d068` **without executing its scripts**, verified MIT source, 273 official technique records and exact selected technique ID. This is **source provenance, not complete Skill installation or technique implementation**.
- Project-local `.agents/skills/cinetic-synthetic-sidecar/SKILL.md` only activates on explicit Cinetic synthetic requests. It **does not replace** the Python K order Skill or independent `visual-design-review` Skill.
- The [C3 evidence-based independent visual review](C3-INDEPENDENT-VISUAL-QA.md) records remaining creative specificity, rhythm and device-scale concerns. User art approval, upstream full Agent Skill workflow, GSAP/HyperFrames commercial rights, 60fps finish and native Windows Premiere are **still outstanding**.
- Regression observed: a first-frame visible opening rightly failed the *old* alpha QA requirement for an entirely empty first frame; verification was corrected to require visible frame zero **only** for the explicitly opted-in evidence-card motif, while preserving transparent margins and the old graph contract. Both latest source C2 and C3 workflows then passed. Existing root/default dependencies and previously approved user-art assets untouched.

## Boundary and historical continuity
- Planning and decision: [Issue #138](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/138); original [roadmap #4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4); project charter on `main`.
- Upstream Cinetic: [Leonxlnx/cinetic](https://github.com/Leonxlnx/cinetic/tree/ecfa6605de1adb9345ce937724810dc32267d068), MIT Skill, pinned source commit `ecfa6605de1adb9345ce937724810dc32267d068`. Its broader scripts/dependencies **have not been copied, installed, or executed** here. The single technique reference in the public fixture is **metadata**, not evidence that the original algorithm was fully implemented.
- HyperFrames CLI research from existing **Draft #33 / #39** includes actual MP4/Alpha synthetic render evidence. It does not prove **this** adapter renders correctly. Cinetic docs referenced 0.8.79; historical experiment used 0.8.143. Version compatibility, npm dependencies, GSAP commercial usage and optional Studio GUI limitations are **not cleared**; [license scope Draft #46](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/46) remains separate.
- Current main Canvas + FFmpeg, opt-in Konva S1, and private Python/Pillow + FFmpeg K series remain separate and untouched. Accepted K v9 20 plus the three original v2 variants are **not** modified or re-approved. M11/M12 art exclusions are unchanged.

## Scope of this PR
- The input **requires** `engine: "cinetic-hyperframes"` and `contentClass: "public-synthetic"`; no implicit/global interception of motion requests.
- Validate an original, bounded Traditional Chinese **intent → trigger → physical response → audience understanding** narrative, with explicit causal beat sequence (scatter → connect → resolve), pinned technique provenance and integer frames.
- Emit a flat-track self-contained **HTML prototype driven by deterministic integer-frame `hf-seek` events** for an isolated future HyperFrames CLI check, plus validated plan, deterministic timeline and a **fail-closed QA handoff**. The output uses bounded original HTML/CSS styling and inline frame-driven motion (no CSS keyframes) that **does not claim complete Cinetic choreography, licensed font parity, alpha support or production visual quality**.
- QA is a separate reviewer: Visual Design Review checks decoded/timecoded output and typography; **only the user** approves artwork. Never self-upgrade to `USER_ART_APPROVED` from Cinetic self-critique or technical green CI.
- No remote media, private text, Drive IDs/URLs, secrets, paid providers, root npm dependency modification, HyperFrames Studio/GSAP no-code editor, automatic public job dispatch or autonomous production publishing.

## Run the isolated contract
With Node 24 already available:

```sh
node --test experiments/cinetic-sidecar/adapter.test.mjs
node experiments/cinetic-sidecar/adapter.mjs experiments/cinetic-sidecar/sample.plan.json out/cinetic-contract
```

Four contract outputs: `validated-plan.json`, `timeline.json`, `index.html`, `review-gates.json`. `out/` is git-ignored. Isolated render/QA continuation:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node experiments/cinetic-sidecar/prepare-render.mjs experiments/cinetic-sidecar/probe.plan.json out/cinetic-c2
# Separate output: replace probe.plan.json with portrait.plan.json and out/cinetic-c2-portrait
# Actual CLI render is exercised only by the pinned isolated workflow, NOT a default production command.
```

 A passing test proves only the **contract and synthetic reverse-seek behavior**. It does **not** run Chrome/HyperFrames, render an MP4 or validate MOV alpha.

## Reviewer authority
1. Cinetic's director idea/technique selection: **proposal**, never final design decision.
2. Renderer and technical QA: check actual frame count, dimensions, deterministic seek, font hash/cmap, decoded alpha and light/dark compositing **after** approved isolated rendering exists.
3. `visual-design-review`: independent full-speed/timecoded legibility, meaningful cause-and-effect, Taiwan Traditional Chinese, composition, distinct style, brand and safety. Critical findings block.
4. User: `USER_ART_APPROVED` only for exact verified output variant, never inherited.
5. Native Windows Premiere and full commercial rights: independent gates.

## Next increment (C3 quality, C0 license finalization, C4 decision gate)
Two original synthetic briefs in 16:9 and 9:16 **have been rendered and decoded** using the isolated R&D CLI. The initial contact sheets showed caption-only animation, so a persistent original semantic graphic was implemented and rendered in both profiles. **Full-speed independent Visual Design QA and actual user art acceptance remain open.** A two-second synthetic feasibility clip cannot establish the desired premium/meaningful six-to-ten-second art quality. Review the new asset at full speed, refine original scene-specific visual language rather than merely expanding generic effects, compare against the unchanged Python baseline, and finish [C0 license findings](C0-LICENSE-COMPATIBILITY.md) before any production adoption. Record explicit PASS/FAIL/BLOCKED and reproducible commit IDs. Keep the current approved render paths as default and fully reversible.

### Known limitations and do-not-claim list
- CSS `font-family:sans-serif` is only a temporary **non-approved prototype**: deterministic licensed Taiwanese CJK font integration and framewise collision checks are required before actual commercial output.
- Causal effects here are bounded starter primitives, not a faithful 273-technique Cinetic renderer.
- This adapter writes plan/HTML/QA JSON only. It cannot operate Premiere/AE, install the Cinetic Skill globally, or by itself invoke the HyperFrames CLI.
