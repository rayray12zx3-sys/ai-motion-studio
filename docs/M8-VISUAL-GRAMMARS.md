# M8 — Independently composed learning visual grammar

The M7 reuse pilot proved only copy/palette reconfiguration. M8 introduces
an actual different composition engine for Learning Lab, selected by the
existing allowlisted style_id=learning-lab. No new brief JSON fields, third-party
artwork or online calls.

## Four independent layouts
- First beat: asymmetric hero headline and stacked study flashcards.
- Second beat: three milestone tiles (horizontal on landscape, vertical on portrait).
- Third beat: poster-sized demonstration value plus a 7x4 practice heatmap.
- Final beat: oversized type, aligned vertical marks, ring seal, longer hold.

Studio still uses its original M6/M7 stage module. Both share the bounded
12-second timeline, M6 interstitial, verified local art manifest, 30 fps
runtime, random-access frame determinism, and safe local file inputs.

## Typography
New heavy weight uses existing Noto Sans TC 5.3.0's 700-normal WOFF2
subsets from the pinned SIL OFL-1.1 npm package. No remote font fetching.
Every loaded 700 file's SHA-256 is recorded in review reports. No claim
is made that a different font *family* has been added.

## Explicit QA gates
- Low-cost source/type/unit checks for each PR.
- One candidate PNG batch on M8 PR: 2 briefs x 2 ratios x 15 frames.
- Test stage-region pixels in all 4 beats against original Studio output.
- Test deterministic shuffling and held final frame; inspect both contact sheets.
- Reserve **full 30fps MP4** for actual human playback/creative acceptance.
- Sample "72.4" and "+18.3%" are fictional display values, NOT app metrics.
- Keep creative_qc PENDING_HUMAN_REVIEW, approval UNAPPROVED.
- No merge to main, other film repositories, new provider or paid dependency.
