# C3.2 — Independent visual review of real 60fps storyboard render (2026-10-18)

## Source, evidence and authority

- **Exact rendered source:** `6e9db6c6d0e4d7b48039551d06d2ad1c9f7363dd` on isolated experimental branch, [GitHub Actions run #39128756955](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39128756955), **SUCCESS** (21/21 regression tests). Artifact [#12137071816](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39128756955/artifacts/12137071816); GitHub retains it **2 days**. Root `main` unchanged `88486e17e1c3b883a34635aa9092c68bb3700e17`.
- **Media evidence seen:** actual decoded MP4 contact sheet at **0,1,2,3,4,5,6,7 seconds** plus independent decoded-alpha sample JSON. MP4 and optional GIF are provided for owner full-speed viewing. Reviewer did **not** physically operate Windows Premiere or validate target mobile readability; no complete manual full-speed watch-through is claimed.
- **Source:** all graphics are original programmatic SVG scenes (cloud, falling red drop, surface impact, ripples) and actual original cut-out filmstrip; no stock footage, product logo, private text/assets, provider or AI sample frames.

## Technical outcome (separate from design)

| Gate | Verified |
| --- | --- |
| CI & deterministic reverse seeks | **PASS**, 21/21 sidecar regression tests |
| Opaque real rendered video | H.264, 1280×720, **60fps×480 frames / 8.000s**, SHA256 `4a5de774c4a6afabadcdb0772834887f8ce1a1be5442bc4bfa00c5ea080ebeaf` |
| Real transparency | ProRes `ap4h`, `yuva444p10le`, real decoded RGBA sampled at **15 frames**, outer/side alpha clear, genuine nonzero visible pixels. MOV SHA256 `bce0069db290c71d3f02c583a3c573e9c51fffb5332d845268349b06f643654e` |
| Locked fonts | Existing root `@fontsource/noto-sans-tc@5.3.0`: **8 exact local WOFF2 subsets** resolved for `散落鏡頭剪出節奏故事成形` with file SHA256/cmap coverage manifests (font binaries not archived) |
| Rights & Windows | Commercial CLI/GSAP/codec deployment **NOT CLEARED**, Windows Premiere **NOT TESTED**, full upstream Cinetic Agent/precise technique reimplementation **NOT DONE** |
| Art approval | **PENDING_USER_APPROVAL** — no automatic promotion from CI |

## Independent observation at real decoded timecodes

- **0–1s [observed]:** left main `散落鏡頭` title is readable; to the right, three separate *visibly different* shot illustrations are physically dispersed. Cloud / falling drop / circular ripple are not interchangeable generic numerical cards; coral-red narrative cue visible from frame zero. Immediate subject, useful focal balance. Some small details of the thumbnails may disappear at phone scale (**not tested**).
- **2s [observed]:** headline fades in its transition and momentarily becomes very faint; it is not established that the incoming title gets an adequate reading hold in the full-speed animation. **Medium** motion/readability risk.
- **3–4s [observed]:** same three filmed subjects visibly **re-order into a connected filmstrip**. A red progress cue traverses the reel. The visual tells *what editing changes*, rather than using generic animated charts. Stage is clearer than C3/C3.1 and the physical visual device persists across cuts.
- **5s [observed]:** the old frame group is transitioning toward the bottom timeline as the larger continuous storm/water scene becomes visible; momentary layered frames and faded main headline warrant checking motion overlap at full-size frames and in actual playback. **Medium** collision/hierarchy risk.
- **6–7s [observed]:** a much larger composition shows the red drop over a waterline and then the expanding surface ripple, while the original filmstrip remains smaller below. Clear cause-and-effect finale; strong recognizable physical event. The final frame is not a branded product or proof of a real service.
- **Overall design appraisal:** **stronger narrative specificity** than generic waveform C3.1, improved art intentionality and shot differentiation. Still visibly a flat vector storyboard demonstration rather than finished high-end illustrated/motion-blurred commercial film. Need operator's artistic judgment; no unsupported /100 score.

## Practical priority fixes if operator rejects this variant

1. **High**: enrich shot-specific visual craft and recognizable story world (e.g., realistic/mixed paper-cut textures, deliberate photographic styling *using verified rights-cleared originals only*) rather than adding default glow, blue UI gradients, random floating shapes. Use a real branded subject only after a safe specific brief is provided.
2. **Medium**: inspect full-speed readable holds precisely around 2.4s and 5.4s; ensure headings don't transition away before the scene event has become clear.
3. **Medium**: verify at native mobile viewing size and in actual light and dark footage overlay comps; evaluate safe title and object motion overlap, PNG/X-formed-alpha halos from the actual MOV, and final rain scene smoothness.

**Status:** `C3.2_TECHNICAL_PASS / VISUAL_REVIEW_PROVISIONAL / USER_ART_PENDING / C4_NOT_AUTHORIZED`. This creates an **alternative concept**, not permission to erase or revise earlier approved K01–K20 or unfreeze M11/M12. Never merge Draft #140 based on this synthetic sample.
