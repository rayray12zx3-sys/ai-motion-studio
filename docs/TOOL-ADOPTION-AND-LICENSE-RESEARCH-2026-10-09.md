# AI Motion Studio — tool adoption and commercial-video license register
Date: 2026-10-09 (Asia/Taipei). Owner decision: this GitHub repository is the operator's **personally owned tool**; the tool is not offered or sold as a service. The operator may use it to make **commercial advertisements delivered to an employer/company**, ordinarily as rendered media only. The GitHub repository visibility (Public vs Private) **does not itself define commercial use or remove license conditions**.

> Status: RESEARCH REGISTER / **NOT an installed-dependency list or blanket legal clearance**. Source-license statements were checked against linked upstream LICENSE/README files on 2026-10-09; conditions can change. If code or media is imported, pin a specific upstream revision, document notices, review transitive deps and seek permission where needed. This document belongs to coordination Draft PR #27; not merged into main. Separate code licenses, tool/user eligibility, media licenses, and finished-video attribution.

## Goals and mandatory release rules

- Prefer a free-to-use, reproducible, local, commercially permitted motion workflow, deterministic seek/render and AI/Codex integration, preserving Canvas + FFmpeg V1 until a real benchmark proves an improvement.
- Finished company advertisement: commercial display, modification and reuse allowed; **no mandatory end-video attribution** from dependencies or embedded third-party material. Attribution/NOTICE obligations for **distributed software** remain intact. Rights to real company footage, stock, music, fonts, people, brands, apps and codecs require independent checks.
- Not offering this program commercially does not make every use of it noncommercial: the act of producing paid/company advertisements may count as commercial tool use. Record whose employees operate/own a licensed tool, whether the company receives editable project code, and any company-level licensing thresholds.
- Do not copy public reference-site MP4s, source videos, thumbnails, commercial sample music, proprietary UI designs, or licensed remote assets into the project solely because they are accessible online. Use links plus original descriptive recipes unless a reuse grant has been verified.
- All unapproved engines and templates remain in isolated R&D/agent-skill evaluation; **no new production npm dependency, no production-State-Engine changes, no automatic PR merge**.

## A. Favorable candidates — source licenses verified, adoption still needs functional QA

| Candidate / official source | Verified upstream code license | Utility | Priority / recommended action |
| --- | --- | --- | --- |
| [HyperFrames](https://github.com/heygen-com/hyperframes) ([LICENSE](https://github.com/heygen-com/hyperframes/blob/main/LICENSE)) | Apache-2.0 | HTML/CSS/GSAP/Three.js compositions, MP4 rendering, showcase sources and agent workflow | **P1 isolated renderer trial**, compare real MP4 frames/performance to Canvas, keep existing engine |
| [Motion Designer](https://github.com/kaventro/motion-designer) ([LICENSE](https://github.com/kaventro/motion-designer/blob/main/LICENSE)) | MIT | Agent film-direction skill, timing, device mockups, render QA and example preview MP4s | **P1 evaluate Codex skill/review rules**, not runtime replacement; inspect audio/model dependency terms |
| [Motion Video Kit](https://github.com/echris6/motion-video-kit) ([LICENSE](https://github.com/echris6/motion-video-kit/blob/main/LICENSE)) | MIT | Critic-vs-builder quality gates, contrast/loudness/freeze checks, film grammar | **P1 adapt original, renderer-independent QA tests** |
| [HTML Animation](https://github.com/acelera-agency/html-animation) ([LICENSE](https://github.com/acelera-agency/html-animation/blob/main/LICENSE)) | MIT | Agent-oriented single-HTML, frame-exact, Playwright/FFmpeg social motion output | **P1 isolated skill and reference timing benchmark** |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) ([LICENSE](https://github.com/motion-canvas/motion-canvas/blob/main/LICENSE)) | MIT | Typed scene composition, graphs, previews and timelines | P2 study or test only after a proven Canvas gap |
| [Three.js](https://github.com/mrdoob/three.js) ([LICENSE](https://github.com/mrdoob/three.js/blob/master/LICENSE)) | MIT | 3D camera, shader scenes, UI surfaces | P2 isolated compositional experiment |
| [ThreeUI Community](https://github.com/MengTo/threeui) ([LICENSE](https://github.com/MengTo/threeui/blob/main/LICENSE)) | MIT for included community code, subject to bundled asset notices | Reusable original 3D/UI component patterns | P2 prefer locally bundled entitled community assets, **NOT third-party website preview media or Pro packs** |

MIT/Apache license generally permits commercial use and does not force a credit slate into a new, independently authored rendered film; if distributing modified code, preserve required software copyright/license/NOTICE text, patent conditions as applicable. Verify sample projects/media separately. P1/P2 means *safe to evaluate in an isolated lane*, not auto-installed or final-media approved.

## B. Conditional tools / reference-only sources

| Candidate | License and boundary | Decision |
| --- | --- | --- |
| [Video Shotcraft](https://github.com/Vincentwei1021/video-shotcraft) ([LICENSE](https://github.com/Vincentwei1021/video-shotcraft/blob/main/LICENSE)) | Repository code Apache-2.0; its *Remotion* engine, music, example footage and fetched third-party clips are **separately licensed**. Visual gallery and recipe indexes are not blanket media reuse grants. | **P1 reference/metadata grammar; runtime P2 conditional** on Remotion eligibility and media audit |
| [Remotion](https://www.remotion.dev/docs/license/faq) | Source-available proprietary terms. Official FAQ (updated 2026-09-30) permits individual commercial video creation under Free License, including delivering only MP4 to a client, but the actual organization's personnel, ownership/collaboration and product/tool-building model matter. Not automatically free if a company operates/owns the project. Codec patents are separate. | **Conditional / not in default production dependency graph**. Check actual operating entity/beneficiary and written eligibility before rollout |
| [Theatre.js Core and Studio](https://github.com/theatre-js/theatre) | `@theatre/core` Apache-2.0; `@theatre/studio` AGPL-3.0. Studio/source redistribution and network-use obligations distinct from produced films. | Existing **M10 R&D** keeps Studio in the nested dev-editor bundle and Core separate from production. See Draft [PR #24](../pull/24) and [Issue #28](../issues/28) |
| [GSAP](https://gsap.com/standard-license) | GreenSock Standard **No Charge** license (not MIT). Standard animation/client work may be free, but conditions for some competitive no-code visual animation builder products and proprietary distribution remain. | Use within a confined animation composition only after confirming editor/builder use against official terms; do not call it an unrestricted OSS dependency |
| [OpenMontage](https://github.com/calesthio/OpenMontage) ([LICENSE](https://github.com/calesthio/OpenMontage/blob/main/LICENSE)) | AGPL-3.0; use/modify/redistribution/network obligations require separate analysis | **Architecture research only**, do not merge whole agent production system |
| [OneTake](https://github.com/feitangyuan/onetake) ([LICENSE](https://github.com/feitangyuan/onetake/blob/main/LICENSE)) | PolyForm Noncommercial 1.0.0. Personal ownership **does not neutralize** commercial use restriction when producing company ads. | **No code/skill/tool use for commercial ad** without upstream license; abstract general concepts only |
| [Video Talkcraft](https://github.com/Vincentwei1021/video-talkcraft) ([LICENSE](https://github.com/Vincentwei1021/video-talkcraft/blob/main/LICENSE)) | PolyForm Noncommercial 1.0.0; explicit prior authorization needed for commercial toolkit usage, even though produced videos belong to creators | **No ad-producing runtime/skill use** without author permission; learn generic workflow principles, do not copy licensed code |

## C. Watchable-reference and asset sources — NOT automatically licensed as reusable templates

- [Prompt Motion / Product UI](https://prompt-motion.com/?tag=product-ui): inspiration, published prompts and source URLs; redistribution or clip use **unverified**.
- [Video Shotcraft Gallery](https://vincentwei1021.github.io/video-shotcraft/): classified example shot/motion styles; source code/Remotion license and individual audiovisual media rights separate.
- [HyperFrames Showcase](https://hyperframes.heygen.com/showcase): evaluate linked real composition sources and actual playable/downloadable examples; source dependencies/assets require review.
- [MotionSites](https://github.com/zhaosenlin12-creator/MotionSites): prompt/preview collection; verify exact downloadable binary and individual rights, do not import unreviewed video.
- [Taste Motion](https://buildwithtaste.com): reference annotation and MCP ideas; beta feature/tool claims are **not locally verified**.
- [ThreeUI Gallery](https://threeui.com): view references; website video/assets/paid component bundles are not automatically covered by the community MIT license.
- Reference conversion milestone: **obtain actual MP4 or browser-playable moving-image evidence**, inspect source license and relevant frames, store URL and technique notes, create **original** motion vocabulary/beat maps, and keep downloaded third-party binaries outside public repository until permitted. Do not claim frame-level analysis from thumbnails/README alone.

## D. Existing licensed production tools and remaining source-governance issues

See [THIRD_PARTY.md](../THIRD_PARTY.md) on the M9/M10 stack: `@napi-rs/canvas@1.0.10` MIT, Noto Sans TC SIL OFL 1.1, FFmpeg/ffmpeg-static and bundled encoder GPL/other component notices, FFprobe and H.264/ProRes codec rights. The existing root `package.json` has **no** HyperFrames, Motion Designer, Motion Video Kit, HTML Animation, Remotion or Three.js production runtime dependency. This inventory is intentionally only a **decision register**.

Repository-wide owner-authored source LICENSE is still undecided. Do not infer that a GitHub Public repository grants MIT rights. Private GitHub ownership changes confidentiality and CI minute billing, not the license of somebody else's tool or samples.

## Integration candidates and evidence gates (order does not override live M10/M12 release gates)

1. **P0** preserve existing M10 lock/CI/browser/transparent ProRes tests; maintain asset isolation and independent technical vs human creative gates. Do not merge Draft PRs automatically.
2. **P1** evaluate Motion Designer, HTML Animation and Motion Video Kit *as instructions/QA techniques*, with independent synthetic reference brief, deterministic output, contact sheet/full-speed clip and licensing checklist; adopt original reviewed abstractions only.
3. **P1/P2** test HyperFrames in an isolated branch against the same original product-UI brief; measure visual motion, continuity, editability, render reproducibility/performance, alpha and final rights. No default-renderer change without proven improvement.
4. **P1 reference library** build an index of Shotcraft/Prompt Motion examples: source URL, preview format actually seen, technique description, abstract beat grammar, provenance, license status. Do not bundle third-party MP4 or copyrighted templates.
5. **P2** consider Three.js/ThreeUI components and Remotion only when a concrete motion/editor gap justifies it and all tool/source/media rights checks pass.
6. **Blocking quality gate**: M11 art was rejected; M12 remains Draft and unapproved. First finish independent technical tasks, then acquire *watchable* high-quality original reference videos; review footage at full speed before beginning a new M12 art direction. Technical CI green is not an animation quality approval.

## Evidence references (checked 2026-10-09)

- GitHub source LICENSE files linked for verified MIT/Apache/AGPL/PolyForm projects above.
- Remotion: https://www.remotion.dev/docs/license/faq and https://www.remotion.dev/docs/license/pricing (individual-versus-company, delivering only video file).
- GSAP: https://gsap.com/standard-license and https://github.com/greensock/GSAP (Standard No Charge license, not MIT).
- Existing project research: [OPEN-SOURCE-RESEARCH-2026-10-08.md](OPEN-SOURCE-RESEARCH-2026-10-08.md) on the M9 branch, [M10 PR #24](../pull/24), [active work](ACTIVE-WORK-2026-10-09.md), [M12 PR #26](../pull/26).
- Unverified licensing or unsupported tool claims should stay **conditional**, rather than being promoted as cleared.
