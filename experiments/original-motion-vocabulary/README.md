# Motion-graphics five-technique R&D package

This package is **original, programmatic Motion Graphics** (not character video, AI actor performance, screenshots or screenshot pushes). It demonstrates a reusable **director-spec JSON → technique choice → per-frame motion → transparent ProRes 4444 MOV → composite preview MP4 → decoded QC** workflow.

Five motion modes share the same renderer; changing text or highlight position does not require changing renderer code.

| Mode | Technique | Intended editorial use | Data gate |
|---|---|---|---|
| `recall_cycle` | animated question/retrieval/recheck flow: moving foreground panel, active arc, growing connector and sequential review nodes | educational principle explainer | avoid unsupported efficiency/performance claims |
| `interaction_focus` | corner-tracking, animated focus selection, pointer and time bar | overlay on authorized gameplay footage | align to real verified UI target |
| `event_reward` | radiating star, particles and dynamic circular emphasis | only if an **actual** game-success event occurs | no invented score, rank or reward |
| `comparison` | original neutral before/after compare, animated status pipeline | only with factual/approved comparison input | **numbers and actual scores intentionally omitted** |
| `cta_reveal` | kinetic typography, button arrival and halo | licensed brand/CTA composite after approval | no free trial, discount or download promise invented |

## Reproduce

Prerequisites: Python 3.13, Pillow 12.3.0, FFmpeg 7 with `prores_ks` and `libx264`. These tools are used for **isolated R&D**, not introduced to the locked AI Motion Studio default Node Canvas/FFmpeg renderer.

```sh
python render_motion.py --mode recall_cycle --out out
python render_motion.py --spec examples/recall_revision_a.json --out out/a
python render_motion.py --spec examples/recall_revision_b.json --out out/b
python -m unittest discover -s tests -v
```

`--spec` is a local bounded JSON document (up to 4 KB) whose `mode` chooses the motion grammar, and known string/layout parameters adjust a particular brief without source edits. Any replacement filenames need a fresh output directory because the renderer never overwrites existing renders. Use original media only. **No API calls or provider inference.**

## Technical evidence

The five locally executed full animations produced actual decoded 1080×1920 30fps movies, total **630 frames / 21s**. ProRes alpha pixfmt reported by FFprobe: `yuva444p12le`; H264 preview without alpha. An independent decoder sampled *every* full-length alpha movie at 54×96, counted distinct non-static frames and required both zero-alpha and nonzero-alpha values. For reviewer evidence see the independently decoded synthetic CI artifact and local full-film audit. A 21s concatenated review clip contains all five techniques in order.

**This is a visual-motion prototype, not ART_PASS, app integration, licensed branded media, scientific-claim clearance or a production SceneSpec v2 approval.** No external media/audio, apps, private assets or product logo is packaged. The exact ad shot placements/timing depend on the final movie; app UI and real-footage source remain separately owned by their respective pipelines. Importing the animation MOV in the user's actual Windows/Premiere environment is still unverified.

## Honest review notes

The motion is visibly real and technique-specific; panel arrival, pointer path, nodes, starburst and CTA beats are all time-dependent, not Ken Burns stills. These samples still use **clean, schematic graphic design**, not demonstrated premium 3D graphics, generative characters or professional-quality artistic signoff. Safe-zone and compositing appearance must be reviewed against the approved target footage before adoption.

## Author-directed multi-shot scene plan (not a proprietary model/provider)

A conversation agent may generate a strictly bounded JSON plan selecting existing techniques and customizing per-shot title/target/event-cutoff. The offline compositor then executes exactly that review plan, preserves the individual transparent ProRes layers and writes one complete H264 full-speed preview with a manifest of frame boundaries and every source file SHA. This is **Agent-assisted** (the human-facing agent authors structured input), **not** an automatically running general natural-language model or an official production SceneSpec.

```sh
python render_director_plan.py --plan examples/director-plan-education.json --out out/education
python render_director_plan.py --plan examples/director-plan-creative.json --out out/creative
python render_director_plan.py --plan examples/director-plan-education.json --out /tmp/check-only --dry-run
```

Separate full moving example briefs: 9-second educational motion graph (270 frames) and 8-second abstract creative design overview (240 frames). The first example has been actually encoded offline and **independently decoded with 270/270 H264 frames** and shot-specific generated alpha layers. Both are original synthetic, not source video or advertising outputs. Media URLs, duplicated scene IDs, unsupported modes and unknown fields are rejected; no automatic public sharing, external audio, claims or third-party app uploads.
