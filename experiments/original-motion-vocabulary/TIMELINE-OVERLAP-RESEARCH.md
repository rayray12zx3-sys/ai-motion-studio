# Original multi-shot overlapping alpha timeline — opt-in R&D

## Product-facing improvement

The original #135 director plan can only **concatenate** opaque per-shot previews. It cannot deliver a completed **multi-shot transparent ProRes master**, and cannot use shots with genuine simultaneous movement during a transition. This opt-in R&D adds frame-accurate cross-scene composition, not another fixed card/typography template.

A bounded original-only JSON describes 2–5 shots of existing motion modes with explicit `frames` and `overlap_in_frames`. The **real per-frame RGBA layers** of two scenes are alpha-composited during transitions with a deterministic smooth curve. Output is one decoded full-length 1080x1920 30fps ProRes 4444 Alpha MOV, one full H.264 preview on a dark *review-only* background, and per-shot/transition metadata with SHA256. Never substitute an image pan/slideshow or already-encoded clip join for these overlapping motion samples.

## Actual test briefs

- `examples/motion-education-four-shots.json` — question/recall → focus pointer → fictional milestone feedback → practice prompt. 4 shots, **415 frames / 13.833 s**.
- `examples/motion-creative-four-shots.json` — graphic concept comparison → focus pointer → creative iteration → abstract final reveal. 4 shots, **441 frames / 14.7 s**.

These briefs use different technique orders and source text but exactly the same code. Both contain only *original synthetic graphic assets* and general fictional language. No company ad copy, current/old app screenshot, licensed third-party animation, audio, marketing score/offer/claim or live-app video.

```sh
python render_motion_timeline.py --plan examples/motion-education-four-shots.json --out out/education
python render_motion_timeline.py --plan examples/motion-creative-four-shots.json --out out/creative
python -m unittest discover -s tests -v
```

Dependencies: existing isolated offline Python/Pillow 12.3.0 renderer plus FFmpeg `prores_ks`/`libx264` and fonts-noto-cjk in the CI environment. This is **NOT** an authorized dependency or architecture migration into the main Canvas+hash-pinned FFmpeg pipeline.

The timeline refuses output overwrite, unknown input fields, URLs/media attachments, invalid duration/overlap, duplicate IDs, unsupported modes and unknown source kinds. Per-frame output depends only on validated spec and frame index. Every MOV and MP4 is decoded for the full frame count; SHA256, codec, alpha `yuva*` pixel format and sampled frame variations are recorded. The `timeline_manifest.json` explicitly maintains `art=PENDING_HUMAN`, `premiere_import=UNVERIFIED`, and `commercial_rights=NOT_CLEARED_BY_THIS_TECHNICAL_TEST`.

## Critical limits

- **No natural-language model inside the renderer.** ChatGPT/Codex may author the structured JSON from user intent; this code executes only the bounded, validated original plan.
- Techniques are still simple infographic/hud/reward/comparison/CTA motifs with fixed internal choreography, rather than an unrestricted creative animation engine.
- No professional creative approval, Premiere Windows Alpha import verification, licensed client footage or product/offers claim permission. Exact font family/font binary is not cross-host pinned.
- **Do not merge into main** without an explicit product architecture and rights/quality decision. Keep this stacked on Draft #135. Do not touch separate AI-generated actors/lip-sync or private company production State Engine.

## Charter START / FINISH

**Goal impact:** an independent multi-shot overlapping animation, reusable by two new, different briefs without per-video code edits. **Source & authority:** #4/#5/#11 motion-first north star; isolated research only, no production adoption. **Proof:** full 415- and 441-frame Alpha MOV and H264 previews, pixel differences, every transition with exactly two simultaneous scenes, actual video decode/SHA. **Rights:** original synthetic public CI only; private company source remains out. **Stop:** owner ART review, formal SceneSpec/Canvas contract integration, cross-OS fonts and Premiere import remain gated.
