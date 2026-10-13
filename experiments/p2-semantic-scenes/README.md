# P2 — semantic object / product-UI scene compiler (isolated R&D)

## Why this slice exists
The existing ARC/FOCUS v3 are real 12-second MP4s with actual CC BY 4.0 music, but their scene logic is handwritten in different branches of film.js. Each new brief requires another code branch. **No V1–V4 rework, no v3 mutation.**

The new bounded translation layer is:

**ChatGPT creative direction → authored semantic spec → validated entity/state/shot graph → arbitrary-order seekable SVG → optional offline encoded MP4 → independent review.**

This is **not** a general natural-language parser or an autonomous model. The active ChatGPT conversation authors the original scenes; the deterministic Node executor renders them. It is deliberately isolated from the official production Canvas+FFmpeg and optional Konva systems.

## Two different original fictional UI use cases
- **Atlas / Board:** drag an unscheduled note into a date slot. One task entity keeps its identity through three shots. The actual UI state changes from Unscheduled to Tuesday / scheduled.
- **Index / Caption:** select an audio timeline phrase and carry that source phrase into an editable caption draft. The status changes from Not selected to Caption draft ready. This uses different scene layout, rhythm, and trigger.

The two briefs change only declarative data. No brief-specific new JS renderer branch is written. No reference frames, third-party film imagery, company material, real marketing claims or copied brand layouts are included.

## Commands (isolated)
From the repository root with Node 24.x:

    node --test experiments/p2-semantic-scenes/tests/*.test.mjs
    node experiments/p2-semantic-scenes/scripts/emit-svg-frames.mjs board
    node experiments/p2-semantic-scenes/scripts/emit-svg-frames.mjs caption
    node experiments/p2-semantic-scenes/scripts/emit-svg-frames.mjs board --all

All sample/full SVGs and technical manifests go into a local ignored artifacts folder. To generate optional technical MP4s with the offline tools Python CairoSVG, FFmpeg and FFprobe:

    python3 experiments/p2-semantic-scenes/scripts/render_video.py board
    python3 experiments/p2-semantic-scenes/scripts/render_video.py caption

The default MP4 has no audio and is **NOT commercial-ready**. Optional genuine locally licensed music requires both a local original MP3 and a human-reviewed credits notice:

    python3 experiments/p2-semantic-scenes/scripts/render_video.py board --music-file /private/authorized.mp3 --credits-file /private/MUSIC-CREDITS.md --music-offset 0

The optional music path recognizes only the established Kevin MacLeod CC BY 4.0 attribution lane, not arbitrary soundtrack rights. A BPM grid is only a timing hypothesis; it is NOT proof of musical alignment or audition.

## Proof and limitations
- Validates 3–8 contiguous shots, bounded layouts/poses, stable hero identity, one observable operation per entity, original-only media, action-source/result causal links, authored BPM alignment, deterministic out-of-order frame seeking, SVG text escape and two distinct brief treatments.
- The same rendered hero card physically occupies interpolated screen positions on scene transitions; this is not yet sophisticated real-content image, group, mask, camera or lighting continuity.
- Current text uses platform sans-serif fonts; cross-platform deterministic typography and commercial font rights are NOT cleared. Complicated paragraph fitting remains absent.
- Symbolic panels/track/waveform are schematic product interface work, not mature art direction or a professional reference-quality film.
- BPM does not establish phase agreement to the actual audio. Audio, claims, visuals and rights must be independently audited from full MP4s before any user art request.
- Dedicated CI on this stacked R&D now renders **both complete 360-frame silent H.264 MP4s** and decodes every frame through a signal-only audit. It does not test soundtrack synchronization or professional aesthetics; full-speed viewing, real authorized musical mix and legal review still remain open.
- This does not replace ARC/FOCUS v3, add a model or API, change the root package, modify main, touch frozen M11/M12, or merge any Draft.

## Product Charter five-field gate
| Field | Evidence |
| --- | --- |
| Goal impact | Eliminate film-specific logic for two unrelated original product/UI briefs; reusable semantic identity plus action-to-result. |
| Decision source | Issue #4 17:00 continuation; PR #111–#114; user-approved ChatGPT-mediated director as R&D. |
| Smallest proof | Shared source implementation, two different data briefs, timeline/seek/state tests, real technical sample outputs. |
| Tools and rights | Isolated Node built-ins, optional CairoSVG/FFmpeg; no paid service or root production dependency. Rights/art remain open. |
| Next step and stop | Test full output and audiovisual QC; then improve layer composition, responsive typography, motivated camera, musical phrase mapping. Stop for real mature art/asset/license/major architecture approval only. |

**Technical CI PASS never equals professional art approval.**


## Full MP4 decoded-frame and audio signal review (new, advisory only)
P2 provides a **common offline post-render analyzer** for user-authorized *local* H.264 MP4s:

    python3 experiments/p2-semantic-scenes/scripts/av_audit.py /private/local/review.mp4 --expected-frames 360 --output /private/local/review-av-qc.json

Optionally feed a local hand-authored JSON list of film-intended cue frames, transition/interaction types and their narrative reason via --cues /private/local/intended-cues.json. Never enter private Drive links, company media metadata, secret receipts, or review audio assets in public test fixtures or Issue comments.

The analyzer uses FFmpeg to decode **every actual frame** to a small grayscale proxy for blank/luma-jump candidates, analyzes decoded mono audio RMS-energy increases, and notes whether cue-proximate rises are found. It checks real streams, not just authored screenshots. All findings are **advisory** and have explicit NOT APPROVED status: a giant luminosity change may be an intentional motivated cut; a matching loudness peak is not musical synchrony; grayscale cannot assess microtypography, palette, expression, full-speed emotional rhythm or license validity. Full-speed watching/listening and human product/art/rights checks remain separate. It must not emit ART_PASS or auto-publish.

Hosted CI on this stacked PR generates **two complete 360-frame synthetic silent MP4s**, decodes every actual frame with this analyzer and uploads technical reports and films. **It does not decode the private original v3 media inside public CI**, has no music so cannot check sonic alignment, and does not constitute professional artistic or rights approval. The original full v3 media are separately available to the user and require genuine audiovisual/full-speed review.

## P2 action-proof progression (isolated next Draft)
The common scene compiler now requires an **authored, bounded gesture trajectory** for every product operation, plus an actual on-screen resultLabel. An animated cursor shows what the viewer is meant to click, drag or select; the exact operation frame updates the same stable hero entity, and the post-action message remains visible in the resulting shot. Atlas and Index use different triggers, on-screen origins and targets. This closes a genuine narrative-evidence defect: a state transition in JSON does not by itself depict a believable UI operation. However these are still synthetic, schematic UI panels, **not** genuine authorized screenshots, realistic product compositing, polished easing/camera/materials, or an artistic approval. Never infer clickability or actual product functionality from fictional onscreen content.


## Art-composition iteration from actual two full-film internal rejection
From **actual fully encoded** silent review MP4 contact samples, both previous films were visually rejected internally despite complete CI. The shared weaknesses were excessive empty canvas, marginal small-type product information, a task gesture that did not move the task into its real date target, and an audio selection that had no selected-source region. Rather than repaint one video, this experimental stage changes the **shared scene composition rules**:
- Responsive headline/subheadline scale and structured reading hierarchy;
- A date-planning workspace with visible choice rows and emphasized selected Tuesday target;
- A waveform source panel with explicit selected range after the causal UI operation;
- A drag result terminal pose inherited exactly at the next shot's first frame, so the semantic card no longer teleports when scene changes;
- Slightly larger and deliberately foregrounded product entity label/state.

These are purposeful product-story improvements, **not a new style copied from any reference video**. They still lack licensed real product footage/photos, sophisticated hierarchy/materials and cinematic quality. Per-shot visual change/legibility/temporal fit must be inspected again using decoded full MP4 contact samples. The internal art verdict must remain **REJECTED / human approval PENDING** until actual film viewing supports improvement; never infer it from test success.


## P2 soundtrack reuse + semantic cue sheet (Draft-only, after #118)

Both Atlas and Index now have a shared **authored-film cue exporter**, not per-film handwritten audio timings. It derives film shot changes and the actual causal UI gesture/impact frames from the semantic scene compiler:

    node experiments/p2-semantic-scenes/scripts/score-cues.mjs board
    node experiments/p2-semantic-scenes/scripts/score-cues.mjs caption

Each command writes a bounded \`artifacts/<film-id>/score-cues.json\` for the existing \`av_audit.py --cues\` interface. The cue list includes shot purpose, gesture initiation and actual state-change event. This is a storyboard-specific *intent map*, not a musical performance/phrase detector.

For **private/local only** full H.264 engineering renders, use an already independently verified source MP3 plus the associated CC BY 4.0 publication credits, never a remote URL or an AI audio model. Example with the existing source-verified Kevin MacLeod **Floating Cities** recording:

    python3 experiments/p2-semantic-scenes/scripts/score_soundtrack.py \
      --video /private/atlas-silent.mp4 \
      --music /private/Floating_Cities_verified.mp3 \
      --credits /private/MUSIC-CREDITS.md \
      --cues experiments/p2-semantic-scenes/artifacts/atlas-board-to-date/score-cues.json \
      --track floating-cities \
      --output /private/atlas-music-review.mp4

For Index, use the distinct \`cipher\` track key with the verified Cipher MP3; its exact SHA, official source and original 12s excerpt offset are separately pinned. The offline mixer (a) refuses mismatched MP3 hashes or missing attribution/source/modification notice, (b) refuses overwriting originals, (c) **copies the original video bitstream** while replacing/adding genuine licensed soundtrack audio, (d) confirms actual AAC and full-frame H.264 decode via \`av_audit\`, and (e) records beat-grid distances as **unverified hypotheses**, not claims of true musical synchronization. Final public posting must carry attribution and change notice with the work.

**Rights and quality:** verifying the bytes against the two earlier downloaded official sources and scanning credit text does not establish every downstream commercial right; it only checks one documented music lane. No song files, private video, private Google Drive references, receipts, artifacts or soundtrack waveforms are committed. CC BY license credits do not clear client footage, product UI, fonts or ad claims. Neither waveform RMS proximity nor theoretical BPM-grid proximity validates full-speed audible beat/phrase match. The existing two synthetic product films remain **INTERNALLY NOT ART-READY**; do not ask the owner to judge this engineering soundtrack test as a polished creative film. This addition affects neither the approved production engine nor prior v3 ARC/FOCUS.

## Original ChatGPT-authored JSON brief → actual offline film (Draft R&D after #121)

The user-approved AI Creative Director is the **active ChatGPT conversation**. It can propose and critique a distinct original concept, then author a **local JSON** file conforming to the already existing `p2-semantic-scenes-v1` input contract. Do not install model APIs, connect an external LLM, publish client/reference media, or add a JS scene branch per brief.

1. Author an original-only JSON object using the fields exemplified by the two fictional `examples/two-original-briefs.mjs` records: `version, id, assetPolicy, profile, theme, music, entities, shots, operations`. Different briefs may change authored content, objects, timings and original UI treatments **within the presently supported scene layouts**. This is *bounded declarative authoring*, not a universal generative UI/layout designer.
2. Save the spec **locally** as a `.json` file. It is explicit user-directed file input, not GitHub/API scraping. If it contains private user material, **do not commit it or upload it to public Actions**. To make review frames + cause/effect evidence:

       node experiments/p2-semantic-scenes/scripts/emit-svg-frames.mjs --spec /local/original.json
       node experiments/p2-semantic-scenes/scripts/score-cues.mjs --spec /local/original.json

3. For an offline full 360-frame H.264 silent engineering film using the already available optional CairoSVG + FFmpeg:

       python3 experiments/p2-semantic-scenes/scripts/render_video.py --spec /local/original.json

   This route uses the **same compiler/renderer** as Atlas/Index, not a special new film branch. The supported encoded P2 JSON film profile is currently **1080×1920, 30fps, 360f**, and the original input must be `assetPolicy: original-only`. Other profiles, non-synthetic media, fonts, original music mixes and commercial output remain independent verification/rights gates. The script refuses to overwrite an existing JSON-authored MP4; use a new safe `id` for a version.
4. Review actual decoded full-frame video, narrative scene purpose, object continuity, text layout, licensed sound/beat phrasing, and human art separately. `--spec` does **not** invoke the ChatGPT model from Node and tests do not demonstrate unattended creative generation. The local `artifacts` folder remains ignored, no client media is pushed to the repository. Score cues are authored decisions, not musical taste validation.

**Reproducibility proof:** dedicated CI converts an original synthetic Atlas declarative example into JSON at runtime, then renders that complete 360-frame film from JSON. Index remains a separate JS-fixture control, and an independent test creates a third distinct synthetic JSON brief with no edits to production or film renderer source. Actual codec, audit and CI evidence remain separate from professional art acceptance.


## Optional full-film local review package (isolated extension)

The user-directed ChatGPT conversation authors the same local original-only JSON.
**One offline command** now renders the actual complete MP4, the same
director-authored source/transition/gesture/impact cue list, the existing
independent *decoded* 360-frame AV advisory report, and a SHA-linked
`silent_review-review-package.json`. This reuses the proven renderer and
analyzer; it does **not** add an inference API, a second motion engine or a
new creative style.

    python3 experiments/p2-semantic-scenes/scripts/render_video.py --spec /local/original.json --review-package

The manifest records the local input JSON and render-manifest SHA256,
encoded MP4 SHA256, cue/report file names, actual decoded-frame count and
explicit `PENDING` human-art/rights/music approval. A marker is written
**only after** independent decode and hash checks succeed. The flag refuses
`--smoke-frames` because a partial clip is not a complete human-review
deliverable. The former CLI and existing separate commands remain valid.

`--review-package` intentionally does **not** upload, share or prove
browser playback in Google Drive. Human previews continue through the
existing authorized private Drive workflow; no private review URLs, paid
services, company source or licensed assets are put in public CI.


## Original authored multi-depth scene studies (isolated, operator-authorized 2026-10-13)

Two existing complete fictional product briefs now exercise an **optional additive**
`shot.layers` composition vocabulary. These data live inside the original
`p2-semantic-scenes-v1` isolated pilot, **not the production Canvas/S1 schema**.
No user/product video, image generation model, new package, external reference
frames or public source rights are used.

Each original layer has a stable `id`, narrative `purpose`, bounded 1000-unit
`bounds`, `drift`, opacity, a semantic tone, and a front/rear composition depth.
The supported kinds are:
- `spatial-grid`: authored receding planning-space grid, used to give Atlas's
  calendar destination a sense of material space and continuity.
- `signal-ribbon`: phase-continuous illustrated audio flow, used in Index to
  carry the same source identity into a caption result, not an actual decoded recording.
- `orbit-markers`: restrained point-of-interest emphasis near the task
  destination or source selection; not a performance/product measurement.

A shared layer ID keeps the same kind/depth/tone across shots. At a cut its
normalized pose starts from the previous shot's **terminal** position, then
transitions to the next shot pose with deterministic easing. Fresh layers
fade in; each generated SVG frame is a pure function of authored JSON plus
frame index, so out-of-order seek remains valid. The compiler rejects
out-of-frame and drifting geometry, unsafe source content, duplicate IDs,
unsupported shapes and identity shifts.

These are source-first scene-composition building blocks rather than
preapproved aesthetic templates. Existing `board`/`caption` CLI and JSON
`--spec` now both render the authored depth layers through the SAME
compiler and full-MP4 offline workflow. Old specs with no layers remain
accepted. Full 360-frame outputs, cue/data contract, and negative tests
remain the technical acceptance; human watching the *motion at full speed*,
real font/material rights, artistic quality and official renderer adoption
remain **PENDING**. Do not equate more layers with reference-quality motion.


## Optional 16:9 two-brief editorial re-layout (isolated Draft R&D)

This experiment tests one **reusable semantic animation plan** in two aspect-ratio presentations, and then across **two unrelated original product briefs**. The same existing `board` and `caption` authored data, source-to-gesture-to-result state/frames, and original 9:16 SVG player are retained. A separate landscape **1920x1080 split editorial view** places the unchanged portrait film on the left and adds data-driven shot headings, persistent object state and actual progress on the right. It is a responsive *presentation/composition* study, **not** complete true horizontal scene-by-scene spatial reflow or real APP media support.

From root in an already-authorized offline Node/CairoSVG/FFmpeg environment:

    node experiments/p2-semantic-scenes/scripts/emit-widescreen-frames.mjs board
    node experiments/p2-semantic-scenes/scripts/emit-widescreen-frames.mjs caption
    python3 experiments/p2-semantic-scenes/scripts/render_video.py board --widescreen --review-package
    python3 experiments/p2-semantic-scenes/scripts/render_video.py caption --widescreen --review-package

The `--spec /private/authorized-original.json --widescreen` route accepts the **same local original-only authored JSON contract** as the existing vertical route. No new schema, brief-specific renderer JS, remote API or root media loader is added. Widescreen output is a **different filename** and separate SVG frame directory; original portrait artifacts and default CLI behavior remain unchanged. Each aspect receives actual full-length H.264 decode/QC reports. The human artistic gate stays **PENDING** and the landscape typography can still differ by OS font; this experiment must not be promoted to `main` or claimed to deliver commercial responsive quality without operator review.

**Company/private media boundary:** Even if the owner provides current real app recordings for separate PRIVATE compatibility benchmarking, **only original synthetic fixtures enter this branch, CI, PR or public artifacts**. Source content and canonical version adoption remain with the separate private video-production workflow. This branch must not attempt to import production assets or update private State Engine approvals.


## Native 16:9 semantic reflow follow-up (Draft R&D; not production)

The prior `--widescreen` proof was a split editorial view embedding the old 9:16 film. This newer **additional, opt-in** `--native-landscape` mode uses the **same exact authored P2 shot/entity/gesture graph** but now renders each scene directly in 1920x1080 coordinates. It recomposes headings and context, moves the persistent hero and its action trajectory into a true landscape source/workspace, and reuses authored original spatial-depth layers. There is **no nested portrait SVG**. Separate Atlas/Index source objects show different board/track treatment with no film-specific branch or changed input schema.

Existing default 9:16 and split `--widescreen` remain unchanged and independently testable. All variants keep the same 30fps, 360f, 12-second P2 R&D constraint:

    node experiments/p2-semantic-scenes/scripts/emit-native-landscape-frames.mjs board
    node experiments/p2-semantic-scenes/scripts/emit-native-landscape-frames.mjs caption
    python3 experiments/p2-semantic-scenes/scripts/render_video.py board --native-landscape --review-package
    python3 experiments/p2-semantic-scenes/scripts/render_video.py caption --native-landscape --review-package

For a **new original-only**, validated local JSON brief, use `--spec /private/local/original.json --native-landscape --review-package`; an independently authored third brief is also exercised through the existing compiler in tests. The command refuses to combine `--native-landscape` and `--widescreen`, preserves its former full review package and writes a separate `native_landscape_silent_review.mp4` plus manifest instead of overwriting the existing 9:16 or split comparison. Generated media stay under ignored local `artifacts/`, with **public GitHub Actions using only original synthetic fixtures**.

The native mode is a bounded geometry study, **not** an unrestricted landscape SceneSpec or approved artistic result. The compiler's source layouts are still limited to `board`, `track`, `reading`, synthetic object kinds and original-only assets; layout measurements use font-independent approximations and OS sans-serif, so text portability remains OPEN. All 360-frame technical decoding evidence is **engineering only**, not human full-speed film/Commercial/Premiere acceptance. No new model/provider, package, official Canvas/FFmpeg product integration, third-party company footage, external audio, licensed references or ad-state changes are included. No automatic Draft merging or creativity authority.
