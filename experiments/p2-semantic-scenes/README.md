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
- Dedicated CI runs Node tests and a short actual codec smoke clip. It is not a full 360-frame audiovisual QA; optional full local export needs its own inspection and licensing review.
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
