# M9: Template Registry and reusable compositions

## Scope and truth
M9 is a bounded, machine-readable catalog of exactly three template recipes,
built on **two existing original Canvas scene-family engines** (studio,
learning-lab), and a single fixed M6 curtain. It does not claim to support
arbitrary user JSX, unknown videos, external fonts, arbitrary length/timelines,
or fully autonomous natural-language film generation.

Files:
- templates/registry.json: source of truth for template metadata, supported
  families, category, 16:9 + 9:16, 360-frame timeline and creative QC.
- src/creative/template-registry.mjs: deterministic search and compilation.
- src/creative/output-rights.mjs: conservative media asset gate for CC0 only.
- src/creative/advanced.mjs: optionally selects an existing scene family
  independently for each of the four shot slots; legacy M4/M8 behavior preserved.

The third template "hybrid-story" is built without duplicating a renderer:
Studio opener, Learning controls, Studio metrics and Learning finale.
This proves **two scene families can actually be recombined** from data, not
merely a catalog that links to different fixed templates. The permitted
module families and slots remain intentionally narrow.

Examples for Node 24:
- npm run preview:template:hybrid:landscape
- npm run preview:template:hybrid:vertical
- npm run render:template:hybrid:landscape
- npm run render:template:hybrid:vertical

Full renderer output names are unique; no existing ignored review directory
may be overwritten. All test visuals are public synthetic fixtures.

## Licensing policy: output is not code
User goal is **finished animation free for commercial use, no attribution in
the exported video or delivery note required by its creative assets**.
The software's notices are tracked separately; MIT/Apache require retaining
their notices in redistributed source/software. OFL fonts may be used to
produce video without naming the font; font-file redistribution differs.

Only existing **CC0** creative raster assets can enter the current registered
commercial-no-credit output path. Fail on CC-BY, GPL, MIT and OFL if such a
license is mistakenly used to license an actual embedded *media asset*.
This is a conservative policy; MIT code and OFL font software are not
prohibited merely for being tools or fonts. The existing M4 asset states
it was created synthetically for the project and declares CC0; that is a
declaration, **not independent proof** of ownership or third-party rights.

Actual release stays blocked until a reviewer establishes:
- authenticity of source/rights and absence of unlicensed logos/visual media;
- trademark/portrait/privacy risks, where applicable;
- source/binary distribution notices, if distributing the rendering tool;
- separately, H.264 patent/territory/platform implications (FFmpeg/x264's
  zero-price software license alone cannot guarantee zero obligations).
Current status: production_license_clearance = REQUIRES_HUMAN_REVIEW,
creative_qc = PENDING_HUMAN_REVIEW.

## Actions change: use the free public CI benefit
The GitHub repository is public. Public standard GitHub-hosted runners are
unbilled for compute, so **meaningful full video regression should run
automatically when animation source, templates, assets, scripts or workflow
change**, not only after a manual checkbox. The new standalone
render-review workflow uses an Ubuntu standard runner, locked Node 24,
verified encoder, tiny smoke + landscape/portrait baseline + landscape/
portrait hybrid, and **1-day Artifacts**. This proves both profiles can
render end-to-end, but full-speed artistic approval remains human-only.

Large runners, storage overage, and external services are not covered by this
blanket. GitHub's excessive bulk computing policy still applies. We avoid
rendering hundreds of unrelated presets per commit or using Actions as a
general-purpose encoding farm. Automatic visual CI is tied to repo changes.
