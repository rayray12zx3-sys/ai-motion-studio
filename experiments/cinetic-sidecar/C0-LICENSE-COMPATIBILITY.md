# C0 — Cinetic / HyperFrames runtime and design rights assessment (2026-10-18)

**Scope:** synthetic-only isolated CLI evaluation. This is a bounded technical/usage-class audit, **not** a legal opinion or production-license clearance.

## Source/version chain

| Component | Pin / verified evidence | Status |
| --- | --- | --- |
| Cinetic Agent Skill | `Leonxlnx/cinetic` at Git commit `ecfa6605de1adb9345ce937724810dc32267d068`, `skills/cinetic/LICENSE.txt` MIT | Source/Skill instructions audited at high level; full script chain not yet run here |
| Upstream Cinetic HyperFrames recipe | `skills/cinetic/references/hyperframes-engine.md` refers to **0.8.79**, GSAP paused timeline, local scripts and fonts | Version-specific guidance; no automatic 0.8.143 equivalence |
| Actual R&D renderer | `hyperframes@0.8.143`, tarball SHA-1 `8761025aa327993c605a307ec2d9f01fe6bde047` checked with npm registry in Actions | Basic HTML + frame-seek MP4/ProRes Alpha success; full upstream Cinetic script compatibility not proved |
| HyperFrames project source | Apache-2.0 repository [LICENSE](https://github.com/heygen-com/hyperframes/blob/main/LICENSE); CLI package publishes under that repository | npm package contents, bundled fonts/templates/native and transitive license obligations remain separately conditional |
| GSAP | [GSAP Standard No-Charge License](https://gsap.com/standard-license) (official, consulted 2026-10-18) | Many commercial works allowed; qualifying competitive no-code visual animation builders need prior written consent. **HyperFrames Studio GUI remains excluded.** No added GSAP Studio dependency by this branch. |
| Font | Existing root `@fontsource/noto-sans-tc@5.3.0`, only exact unicode-range subsets selected at runtime with SHA256 manifest; fonts not uploaded as artifacts | Technical font source/cmap path validated in synthetic runtime; final Taiwan glyph shape/brand/small-device legibility remains Visual QA |
| FFmpeg / video codecs | existing pinned root FFmpeg/FFprobe hash-checked on ephemeral GitHub runner | output decode proven; native Windows Premiere and software redistribution/codec legal review not complete |

**Avoid false positive:** HyperFrames CLI technical success is not authorization to bundle HyperFrames Studio/compiled GUI or distribute a no-code visual animation builder. The project-specific license classification and exact transitives need their own approval. No prior user decision to avoid contacting/buying licenses is changed.

## Verified C2/C3 synthetic milestones

- [Single-brief 16:9 real MP4 + Alpha run #39116128436](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116128436): 1280×720/24fps/48f; real decoded H.264 and ap4h/yuva444p Alpha technical pass; pinned Noto source subsets: 6.
- [Two-brief 16:9 + 9:16 run #39116273741](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116273741): 1280×720 and 720×1280, both 24fps/48f, two original different scripts, same adapter source, two real MP4 + two real Alpha MOV, decoder/frame/source rights checks passed; second portrait font subset count: 5.
- Independent **timecoded extracted-frame QA** of this first two-brief artifact: no evidence of typography clipping in the sampled frames, but major creative deficiency: **caption-only scene succession with no continuous object, no visual cause-and-effect**. This is a substantive quality **FAIL** relative to user's meaningful-animation goal, regardless of technical pass. Production art remains `PENDING_USER_APPROVAL` — do not replace that field or claim final reject decision for owner.
- Bounded remediation: new **persistent semantic node+link motif** across scatter→connect→resolve (original locally generated SVG based entirely on frame and fixed geometry); this is an intermediate art-facing experiment, not implementation of Cinetic's full 273 technique library. CI and real render evidence must be rerun and inspected before any qualitative claim.

## Independent review and stop gates

**Cinetic director** supplies narrative intent and source-pinned technique *proposals*; the isolated CLI renders fixed synthetic source only. **Visual Design Review v0.2.2** independently reviews sampled and, when available, full-speed decoded motion (legibility, Taiwan typography, causal continuity, visual originality, safe areas and alpha compositing). Cinetic self-critique is never a substitute for this independent gate. **Only the operator** can set art acceptance for an exact render variant; codec tests cannot.

Remotion rights are an independent blocker if anyone later selects that alternative; no default Remotion and no user/company ad copy, screenshots, NAS assets, voice, external templates or third-party branded media. No private Google Drive identifiers, no new paid cloud account, no changes to public main or previously approved private K-Series masters.

**Next:** judge the persistent motif as actual full-speed footage; if still insufficient, revise original direction/art language with the operator's objective rather than adding more schema or generic test-only plumbing; finally two-brief 6–10-second original concept, responsive layout, independent Visual QA, separate native Windows Premiere, and formal commercial adoption decision.