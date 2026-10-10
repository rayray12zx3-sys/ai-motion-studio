# X 20-repository motion list — bounded adoption review (2026-10-10)

Original source: https://x.com/laobaishare/status/2108533494725103926 (posted 2026-10-09, author @laobaishare). The post lists 20 links; it is **a third-party social recommendation, not an authoritative technical or licensing source**. Its headline's implied Netflix employment/endorsement, “67 skills”, and special dependence on a particular Claude model have **not been independently verified**. Source repositories were checked directly on GitHub on 2026-10-10.

## Project-specific adoption decision

AI Motion Studio is a **personal, source-available tool for producing commercial advertisements**. The GitHub repository's visibility does not waive third-party licenses. Operator approval covers a distinct MIT Konva editor and a separate, opt-in **existing Canvas+FFmpeg** S1 v1 frame/export adapter. It does **not** cover adopting Remotion/GSAP Studio/HyperFrames GUI or other engine packages, private company media, arbitrary Bezier v2, or M11 rejected/M12 frozen art.

| # | Linked repository | Observed license signal | What is relevant | Decision |
| --- | --- | --- | --- | --- |
| 1 | [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | MIT for repository; example **depends on Remotion** | Contact sheet, per-beat review gates, audio cue timeline and synthetic SFX | **Reference methods only**; do not copy its entire Remotion runtime |
| 2 | [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | MIT code; downloaded music, fonts, logos have separate licenses | Pure seek(t) frame capture, subframe blur research, audio peak alignment, flash/cut seam checks | **Highest-value technical reference**; no automatic browser-render or downloaded media install |
| 3 | [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | MIT repository | Launch motion timing, composition, review patterns | Selective design checklist inspiration |
| 4 | [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | MIT Skill repository; Remotion external runtime separately licensed | Agent prompt organization | No Remotion runtime migration |
| 5 | [t3knobox/klik-anim-skill-creation](https://github.com/t3knobox/klik-anim-skill-creation) | GitHub did not identify a repository license, no root LICENSE found | Animation/camera grammar and QA gates | Read-only reference; do not copy/distribute without resolved rights |
| 6 | [Sunwood-ai-labs/hyperframes-motion-reel-skill](https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill) | MIT Skill; HyperFrames/GSAP distinct licensing | Beat-sync reel patterns | No direct engine or Studio import |
| 7 | [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) | MIT Skill; compositions use GSAP | Product launch shot/audio production checklists | Reference direction only, do not import GSAP Studio |
| 8 | [cth9191/animate](https://github.com/cth9191/animate) | MIT | Single Canvas deterministic frames, story/look approvals, multi-aspect layouts, seeded visual styles | **High-value style/workflow reference**; no renderer replacement |
| 9 | [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) | MIT | Color, typography, safe-area/shot composition, animation principles | Select minimal text guidance, no auto-install |
| 10 | [nateherkai/hyperframes-student-kit](https://github.com/nateherkai/hyperframes-student-kit) | GitHub classification 'Other'; repository LICENSE says MIT for original material, **THIRD_PARTY_NOTICES** clarifies GSAP, card media, Google Fonts and independent rights | Large metadata/registry and transcript-informed editing concepts | **Do not copy 406 media cards, templates or bundled runtime**; existing local asset-rights Draft covers provenance design |
| 11 | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Apache-2.0 upstream; bundled Studio assets/GSAP issue separate | CLI performance research already performed | Existing pinned 0.8.143 CLI **isolated R&D only**; no Studio GUI adoption |
| 12 | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | GitHub classification 'Other'; official product terms distinct from permissively licensed skill repository | React animation engine alternative | Not required: preserve existing Canvas+FFmpeg official renderer |
| 13 | [remotion-dev/skills](https://github.com/remotion-dev/skills) | No GitHub root license detected at review | Remotion-specific guidance | No install/copy; downstream engine out of scope |
| 14 | [greensock/GSAP](https://github.com/greensock/GSAP) | GitHub root license field not detected; governed by project license/standard terms | Tween vocabulary | No GSAP Studio; no new GSAP dependency |
| 15 | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | MIT | Engine-agnostic easing, hierarchy, choreography, microinteraction quality rules | **Recommended written reference**; no Lottie player required |
| 16 | [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) | CC0 repository index; linked items each separately licensed | Discovery/curation map | Research index only |
| 17 | [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) | GitHub 'Other'; directly inspected root **MIT LICENSE**, bundled Geist font OFL / Lucide ISC | Timeline-aligned overlays, ProRes Alpha and visual comparison workflow | Relevant **Premiere-oriented reference**, but asset/model dependency audit before code reuse |
| 18 | [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) | MIT Skill; Motion.dev engine separate | Web motion gestures and spring hints | Not essential to Canvas exporter |
| 19 | [motiondivision/motion](https://github.com/motiondivision/motion) | MIT library | Motion on web, spring/gesture ideas | Not needed in current Konva Canvas editor dependency graph |
| 20 | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | MIT library | Lottie player/web assets if a future export format is requested | Not needed for MP4/ProRes output |

## Engineering extraction — without copying external runtime

**Immediately relevant to the approved S1 adapter:** deterministic frame `f(frame)`, a single bounded 30fps frame authority, frame SHA-256 and negative tests, a synthetic contact sheet, encoded width/height/fps/frame-count/codec/Alpha checks, explicit quality gates, and no automatic media downloads. The approved direct S1 → locked `@napi-rs/canvas` → hash-pinned FFmpeg route remains **the only target**; never replace it with Playwright/Remotion/HyperFrames because those examples are persuasive.

**Next optional purely self-authored improvements:** sample-by-beat contact sheets, 1-frame flash/regression detection, motion blur (requires explicit quality/semantics tests, not simply blending across edits/hard cuts), rhythm/SFX event metadata separate from scene v1, safe-area warnings, preview-output geometry QA. Do not add Bezier fields to `editable-scene-v1`; do not silently alter full-video pacing or typography under the guise of adopting a Skill.

**Claims never made:** this list proves high-quality brand motion, 67 working skills, that the author is employed by Netflix, that example media can be reused in advertisements, that a GitHub MIT label covers embedded fonts/music, or that our Konva position proxies match final pixels. OSS package installation, transitive licenses, assets, engine switches and terms require distinct audits and approvals.

## Source inspection

- Original X list https://x.com/laobaishare/status/2108533494725103926
- Howseen README and skill: https://github.com/howseen-ai/claude-motion-design — notes `fetch_assets.py` downloads third-party media and documents FFmpeg/Playwright/subframe workflow
- Claude Motion README/package: https://github.com/whaleyxbt/claude-motion — Remotion packages under its `package.json`
- Animate README: https://github.com/cth9191/animate — Canvas/style/storyboard/gates
- LottieFiles Skill: https://github.com/LottieFiles/motion-design-skill — philosophy-first patterns
- HyperFrames Student Kit third-party notices: https://github.com/nateherkai/hyperframes-student-kit/blob/main/THIRD_PARTY_NOTICES.md
- Barty MIT and font notices: https://github.com/Barty-Bart/motion-graphics/blob/main/LICENSE

**Outcome:** external project **evaluation completed**, no third-party packages/assets imported and no outside runtime copied. Operator-authorized S1 opt-in Canvas+FFmpeg work is independent, source-authored and tested on original synthetic only.
