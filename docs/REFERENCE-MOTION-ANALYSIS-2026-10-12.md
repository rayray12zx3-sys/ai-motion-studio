# Prompt Motion: direct full-motion reference study (2026-10-12)

**Research-only, not adopted art direction or licensed source media.** The two public templates are
https://prompt-motion.com/templates/showreel and https://prompt-motion.com/templates/realtime/customize.
The operator provided private reference copies; **do not record private Drive file IDs, URLs, media, stills or audio in this public repo**.
The actual MP4 bytes were read offline and decoded to frame series, not inferred from posters or X previews.

## Actual source-video facts, independently probed with FFprobe
| | Showreel | Realtime 3D |
| --- | --- | --- |
| Duration | 15.018s (nominal 15s, video 900/60) | 20.000s |
| Frame size | 1920×1080 | 1920×1080 |
| Video | H.264, **900 frames at 60fps** | H.264, **600 frames at 30fps** |
| Audio | AAC 48kHz 2-channel | **No audio track** |
| Time samples directly inspected | 0.25s grid / 60 visible samples, continuous-frame pixel difference analysis | 0.50s grid / 40 visible samples, continuous-frame pixel difference analysis |

### Showreel: on-screen visual sequence (observed, approximate boundaries)
- **0–1.8s**: original brand wordmark on warm off-white, orange accent expands into bars/lines; motion is causally attached to the graphic mark.
- **~2–4s**: large tightly composed one-word typography resolves sequentially into **ONE → BAR → EVERY → BEAT**, orange field, deliberate horizontal wipe/blur.
- **~4.25–5.5s**: graphic geometric square/triangle/line/circle family; space cleared of headline and shared color system retained.
- **~5.75–8.2s**: dark ring becomes stacked orange/blue/black bands and a volumetric conical mass, then concentric diagram; visually related transformations, not arbitrary separate spinning objects.
- **~8.2–10.3s**: circular multi-ring rhythm chart transforms into small data visualization and horizontal bars/callouts.
- **~10.4–12.2s**: centered black audio bars and thin orange playhead, denser near the end; increasingly filled frame.
- **~12.2–14.5s**: fast typographic recapitulation of the key words on alternating fields; last appearance collapses toward opening wordmark.
- **~14.5–15s**: stable brand mark on the opening cream field.
- Actual AAC RMS in 0.25s windows has strong alternating-quarter-second energy, **consistent** with 120BPM (a quarter note every 0.5s), but individual sound effects to visual actions are **not** claimed to have been perceptually verified. Apparent brief final hold matters: do not unconditionally ban static frames.

### Realtime 3D: on-screen spatial narrative (observed)
- **0–~3.3s**: close-up of a large video-card edge and shallow-DOF surface, black/blue poster dots, restrained slow camera.
- **~3.3–7.6s**: cinematic reveal to rows of many distinct posters arranged on a sweeping curved wall.
- **~7.6–9.5s**: rising/expanding view shows multiple curved corridors and a navigable architectural system.
- **~9.5–13.6s**: approach to one card/prompt; readable physical panel appears with original short viral motion-design prompt.
- **~13.6–16.2s**: camera recedes from the detailed wall to an orange-accented physically raised letterform; perspective, lighting and relationship to poster corridors carry meaning.
- **~16.2–20s**: simpler editorial logotype **PROMPT MOTION** on white, a noticeably long legibility hold. No audio track in this reference file.
- Therefore the site's `60fps on a laptop` instruction describes desired interactive performance; it does **not** establish 60fps for its downloadable MP4, which is measured **30fps**.

## What the actual references support — and do NOT prove
1. Their styles make opposite rhythmic choices: beat-led fast 2D type/data **versus** deliberate space/scale/macro→architecture camera language. One universal beat/focus/hold rule would be wrong.
2. Persistent visual material and transformation causality are more important than the number of GSAP/Three.js effects. A signature camera reveal is designed backward into earlier shots.
3. The actual videos confirm on-screen form, pacing and spatial imagery. They do **not** reveal source code, source-level implementation, rights of bundled posters/fonts/music, or explain exactly why the original AI model succeeded.
4. Neither film may be copied, rehosted or made a commercial asset through this research. This public repository stores **observations only**.

## Prompt/site provenance and caution
- https://prompt-motion.com/templates/showreel/customize describes a 15s pure `seek(t)` HTML approach, beat-mapped timeline, synthetic soundtrack and 3-subframe 60fps blur pipeline.
- https://prompt-motion.com/templates/realtime/customize directs a named cinematic move per scene, signature shot designed first, key/fill/rim and physical materials, deterministic seek and collision-aware camera.
- https://prompt-motion.com/blog/remotion-vs-hyperframes counts **56 self-reported stacks** out of 233 site entries. The 177 undisclosed entries preclude general renderer superiority claims.
- https://prompt-motion.com/blog/make-ai-motion-graphics-look-less-ai identifies common aesthetic shortcuts; use as optional director negative constraints, **not universal technical bans**.
- https://prompt-motion.com/blog/ai-explainer-video-prompts explicitly identifies missing factual checks in explanatory videos; commercial/factual production requires separate fact/rights clearance.

**Status:** actual video acquisition and frame-based reference study DONE; direct full-speed artistic judgment and end-to-end AI-made original quality still PENDING. A source-accurate temporal reference does not itself grant style/model/renderer approval.