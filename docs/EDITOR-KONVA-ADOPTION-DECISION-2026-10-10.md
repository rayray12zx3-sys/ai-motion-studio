# Operator decision — opt-in Konva editor frontend (2026-10-10)

**Decision:** The operator explicitly authorized moving from isolated Konva research to **formal frontend editor integration**, with no need to pause for ordinary technical implementation. This authorization **does not** constitute creative acceptance or production-renderer engine migration.

**Approved:** Pinned Konva MIT 10.7.1 as a frontend dependency in an **independent editor package and lock**, locally launchable browser UI, neutral S1 data persistence, vendor-neutral timeline/keyframe/preset editor actions, regression CI with original synthetic inputs, compatible incremental interface improvements and narrow CI-reviewed merges.

**Not approved:** Changing the default authoritative Canvas+FFmpeg renderer or official SceneSpec, adding arbitrary Bezier curve fields/S1 schema v2, installing unreviewed additional production packages, consuming actual company/source media or private NAS/Drive/State Engine, using restricted GSAP/HyperFrames Studio GUI, contacting licensors or buying licenses, running actual Windows Premiere, or changing M11 rejected / M12 frozen creative work.

**Editor scope boundary:** The Konva stage is for selecting/positioning scene objects, not final typeface/pixel parity. Root `npm ci` and official render work independently; `npm ci --prefix editor` installs the opt-in Konva frontend separately. This reduces rollout risk without narrowing the operator's approval. Dedicated GitHub CI must prove real browser interaction, disk save/ETag handling, asset rejection, old renderer regressions and exact-head diff/CI before routine merge.

**Next gate:** Human usability, actual typography/geometry parity with the official renderer, real licensed media ingest, optional Bezier schema design, professional output QA and Windows Premiere validation remain future separately approved scope. Research pass must not be reported as those gates passing.
