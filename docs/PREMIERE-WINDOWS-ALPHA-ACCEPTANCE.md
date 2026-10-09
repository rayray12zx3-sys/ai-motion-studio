# Premiere Pro Windows — synthetic Alpha MOV acceptance

> Status: TEST PLAN, **NOT EXECUTED ON WINDOWS**. Updated 2026-10-10 Asia/Taipei. Does not authorize engine adoption, artistic approval or commercial licensing.

## Inputs and boundaries

- **Approved Canvas V1 foreground**: optional 1080×1920, 30fps, 180-frame, 6-second ProRes 4444 Alpha MOV. [Merged #30](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/30) / [#31](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/31); original opaque H.264 mode unchanged.
- **R&D comparator HyperFrames**: 1080×1920, 30fps, 30-frame, one-second synthetic Alpha MOV in [unmerged Draft #39](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/39), tested at exact SHA `1639103d2f8abbee81f08d3712ced85776bca13f` by [CI #37974222938](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37974222938). The two outputs differ in engine, timing and design; do not equate their pixel hashes.
- Use ONLY original synthetic overlays and checker/colored solid background. No company footage, NAS paths, IG/FB private masks, advertising scripts, actual product UI, private Drive URLs/IDs or credentials in public GitHub.
- Preserve original local files/projects; make an isolated disposable test project. If the short-lived Actions synthetic artifact expired, regenerate using pinned source and approved dependencies. Never swap in an unlicensed third-party sample.

## 1. File-level preflight (local FFprobe/FFmpeg, separate from Adobe validation)

Confirm `codec_name=prores`, `codec_tag_string=ap4h`, 1080×1920, `r_frame_rate=30/1`, correct `nb_frames` (Canvas 180 or HyperFrames 30), and Alpha-capable pixel format such as `yuva444p10le`. Preserve SHA-256, bytes, source commit and tool versions. Re-encoded output on another machine may differ; report that instead of claiming byte equality.
Independently decode start, middle and end RGBA frames. Assert transparent non-artwork areas and visible intended foreground. Exact HyperFrames CI expects visible Alpha pixels at frames 0/15/29 of **0/226,434/0**, with no Alpha leakage in first 540 rows or leftmost 48 columns for its declared synthetic test. These numbers are baseline evidence, not universal thresholds for a different renderer.

## 2. Native Windows Premiere Pro GUI (required, cannot be replaced by CI)

1. Record actual Windows build, Premiere version, GPU/driver, renderer setting, FFmpeg version and source hashes.
2. In a fresh 1080×1920, progressive square-pixel 30fps sequence, put dark and light synthetic backgrounds on V1; put each Alpha MOV on V2 **one at a time**. Keep each clip at original duration.
3. Confirm genuine Premiere import, metadata, frame-accurate timeline playback, no missing/black frames, no scaling or decode errors. Inspect frame 0, middle (HyperFrames 15; Canvas representative documented middle) and final frame on both dark and light backgrounds.
4. At 100% monitor zoom inspect foreground edges for black/colored halos, Alpha safe margins and unwanted solid rectangles. If already correct, do not modify import settings.
5. If wrong, use Project panel → Modify → Interpret Footage → Alpha Channel. Record default and attempted **straight versus premultiplied** interpretation, retry and assess on both backgrounds. Do not pretend a setting change proves the source file format.
6. Export a NEW **synthetic composite** H.264 MP4. This normally produces an opaque background-composited video; do not claim that such MP4 has retained the original MOV Alpha. FFprobe the output dimensions, fps, intended duration and frame count; visually check the rendered beginning/middle/end and edge halos.
7. Write a minimal local report with technical observations. Keep private paths, machine user IDs and client media out of public reports; store synthetic screenshot evidence privately if it includes machine/user identifiers.

## Fail-closed verdicts

| Observation | Verdict |
| --- | --- |
| Incorrect codec, dimensions, frame count or missing Alpha in FFmpeg | `BLOCKED_FILE` |
| FFmpeg passes but Premiere not opened | `PREMIERE_NOT_TESTED` |
| Premiere imports but compositing/edge quality fails | `BLOCKED_ALPHA` |
| Native composite works, export not validated | `PARTIAL_COMPOSITE_ONLY` |
| Native Premiere import, playback, Alpha composite and exported H.264 all verified | `TECHNICAL_PASS_SYNTHETIC_ONLY` |
| Commercial dependency/codec rights, artwork or private source unresolved | Separate `LEGAL_ART_PRODUCTION_HOLD` even if technical PASS |

## Report contract

At minimum record `test_date_taipei`, `source_engine`, `source_commit`, `source_sha256`, `input_frames`, `codec`, `premiere_version`, `windows_version`, `default_alpha_interpretation`, `actual_import_ok`, `native_playback_ok`, `native_composite_ok`, `edge_halo`, `export_h264_ok`, `export_frames`, `evidence_synthetic_only: true`, `art_approval: NOT_GRANTED`, and `commercial_license_clearance: SEPARATE_GATE`. Never invent values for absent fields.

## Official Adobe references

- [ProRes and Adobe Premiere / Windows compatibility](https://www.adobe.com/creativecloud/file-types/video/codec/prores.html).
- [Premiere — Modify / Interpret Footage Alpha controls](https://helpx.adobe.com/premiere/desktop/edit-projects/modify-clip-properties/modifying-clip-properties-with-interpret-footage.html) (2026-04-02).
- [Adobe: straight versus premultiplied Alpha and edge halos](https://helpx.adobe.com/mena_en/after-effects/desktop/work-with-footage-items/import-and-interpret-footage-items/importing-interpreting-footage-items.html).

**Boundary:** only actual local Windows Premiere execution can close this gate. Prepare a single Codex/local handoff when local testing is requested/available. The documentation and CI constitute preparation, not completion.
