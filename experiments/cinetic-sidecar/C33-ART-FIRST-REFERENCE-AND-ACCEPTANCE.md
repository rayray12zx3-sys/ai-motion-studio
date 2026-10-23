# C3.3 — Art-first styleframe gate and reference-to-original-design rules

**Scope:** user-directed look-development after C3.2's technically successful but unfinished aesthetic. This is NOT a new default engine, motion film revision, user-art approval or a merge request. The three generated scenes remain **separate user-reviewable concept stills** until art QA passes. Former C3 C3.1 C3.2 source and all previously approved private K art remain untouched.

## What was actually learned from primary-source case studies

| Credited studio / official page | Source-supported process principle | ORIGINAL creative choice in C3.3 (not copied frames, IP or art) |
| --- | --- | --- |
| [Ordinary Folk, *School of Motion Manifesto*](https://www.ordinaryfolk.co/project/school-of-motion-manifesto) (2019) | Their account says visual complexity progresses from lines/shapes toward designs across multiple dimensions | Increase the story's spatial/material scale: separated smaller paper-film shots → ordered physical reel → one full-frame water-impact composition |
| [BUCK, *Google Vids*](https://www.buck.co/work/google-vids) | Studio directly reports deep script and storyboard development alongside motion-system design | Ensure each key still physically demonstrates a cause/creative operation; do not make unrelated card states |
| [BUCK, *Illumina*](https://buck.co/work/illumina) | Studio describes physically tangible mixed-media design (2D/2.5D/3D) and visual transitions serving narrative | Original film perforations, printed-paper material and atmospheric storm layers give depth to an original raindrop story |

**Evidence scope:** verified official writeups. The entire reference videos have **NOT been independently decoded and studied frame-by-frame**. No reference footage, still images, external logos, copyrighted character/media, music or source animation was copied into the art source. Styleframe source is **original Python + editable SVG** and fully separate from any generative sample image.

## Exact three stills, not merely labels

1. `01 / FRAGMENTS` at ~1.0s: original layered storm world, three optically differentiated physical weather photograms, recurring coral raindrop. Headline **散落鏡頭**.
2. `02 / ASSEMBLY` at ~3.7s: light-editorial paper field and tangible perforated filmstrip, three actual chronological photos drawn as original weather SVG scenes, red handoff cursor. Headline **剪出節奏**.
3. `03 / RESOLUTION` at ~7.0s: full-frame waterline, continuous environmental cloud depth and elliptical impact ripples, visibly central recurring raindrop. Headline **故事成形**.

**Design invariants:** same 1280×720, hand-off via one coral object `#e9755e`, tonal slate water and paper material, Traditional Chinese headings, 80px safe-zone starting margin, restrained copy, differentiated hero focal area per scene. Three stills purposefully have different compositions, not a uniform dashboard template.

**Additional short secondary headlines** are newly invented public-synthetic copy, **not an approved company script**. No final brand identity assumed.

## Actual build and safety boundary

- `styleframe-c33.py`: Python **stdlib** creates exactly three self-contained SVGs and JSON manifest to a NEW folder; overwriting an older review set fails closed.
- `styleframe-c33.test.py`: checks distinct art scenes, reference-language stage text, no scripts/media or external dependencies inside source SVG, and human-approval hold.
- `cinetic-c33-styleframes.yml`: isolated Linux runner adds **preview-only** CairoSVG/Pillow converter and Noto font; exports actual 1280×720 PNGs + 3-wide preview strip + SHA256. **No new production package, vendor GUI/GSAP or new renderer** is installed. This is NOT evidence that the private production host possesses licensed approved premium fonts.
- No generative image is accepted as a reproducible source or evidence of tested exports. An ideation mockup's rendered badges and QA statements are **NOT** production proof.

## Mandatory visual art QA after actual PNG extraction

| Check | What must be observed before any animation |
| --- | --- |
| Composition | One dominant focal object, coherent intentional negative space, readable Chinese headline, subject and heading don't collide |
| Detail | Material, depth, lighting, water/cloud forms earn their presence and don't mimic an interchangeable motion template |
| Continuity | The recurring red raindrop/playhead and same physical film units visibly connect 01→02→03 |
| Typography | Noto preview glyph shape, whitespace and contrast tested visually at actual 1280×720 and downscaled device preview; font source SHA and final family **NOT YET production cleared** |
| Genuine story | Images alone make the relation between weather shots, editorial handoff, final impact understandable; no fake product claim |
| Technical | Real pixels encoded to PNG, 3 distinct SHA256, no external media, readable source SVG, previews archived without binary font distribution |
| Owner | Creative acceptance is `USER_ART_PENDING`; user may reject any/all stills; a contact strip can't certify full-speed movement, native Premiere, soundtrack, motion blur or alpha |

**Gate after art acceptance:** build just a 2–3 second directed motion/transition proof from the accepted exact visual language, review full-speed and revise, then extend to 8 seconds and consider 60fps/Alpha/rights/Windows validations. **Do not invest in a full third 8-second animation before the three stills actually pass creative QA.**

## Drift checks

- Purpose: improve perceived professional art quality, not accumulate more green CI counters.
- Existing operator decision: preserve unapproved C3.2 and all separately accepted K masters; branch Draft #140 only; no main merge.
- Outputs: 3 actual original styleframes, source files, QA image triptych, negative visual findings, human review stop.
- Blockers: rights, native Premiere, full speed film, fonts/art acceptance independent from technical green CI.
