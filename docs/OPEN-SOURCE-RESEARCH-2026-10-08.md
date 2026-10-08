# External motion architecture / license research — 2026-10-08

Decision: **reference architecture and original mechanics**, not wholesale
copying third-party templates or their preview media. Commercial and no-credit
**final exports** remain mandatory. Any source that has uncertain licensing
must not be imported. Separate code/binary notices from finished-film credits.

| Project | Confirmed functionality | Declared code license / caveat | Reuse decision |
| --- | --- | --- | --- |
| Motion Canvas (motion-canvas/motion-canvas) | Typed scenes, compositional node hierarchy, generators, realtime editor; image-sequence and FFmpeg exporters | GitHub repository reports MIT as of 2026-10-08; notices required on copied/distributed software; dependencies/exporters need individual review | **Study** nodes/hierarchy, deterministic transitions and preview workflow; don't swap our renderer yet |
| Theatre.js Core (theatre-js/theatre) | Programmatic parameter/time animation, high-fidelity keyframes | Apache-2.0 for Core (NOTICE/patent terms), AGPL-3.0 for Studio; mixed license per package, stale pushes compared to Motion Canvas | **Study** property animation and timeline editing; do not bring AGPL Studio into this source tree without license analysis |
| ali-abassi/remotion-templates | 100 families/1,000 registered variations, manifest, agent catalog/recipes, thumbnail and QA gate | Public repo metadata **does not advertise a machine-recognized SPDX license**; README also explicitly warns third-party asset provenance; Remotion itself has tiered commercial license | **Copy no code/assets**; adapt data model ideas (registry, recipe, previews and gates) |
| RenderComp/free-remotion-templates | 50 composition templates, standalone props, ASSETS.md provenance | MIT for template code; preserve source notices, Remotion engine separately licensed, bundled media separately licensed | Good model for media inventory; **no renderer adoption** |
| reactvideoeditor/remotion-templates | 81 small component-style examples | README claims MIT, but GitHub license metadata is empty; verify actual distribution terms and each embedded asset; Remotion still tiered | Learn component APIs/preview metadata; **copy no code/media** until verified |
| Remotion engine | Browser/React-rendered frame composition, programmable clips, tools | Not blanket-free for commercial business; Remotion license lists free individual and <=3-person for-profit orgs, paid company tier outside eligibility | **Do not install** as universal commercial default |
| Theatre.js Studio | Interactive timeline editing | AGPL-3.0 editor license, distinct from Apache-2.0 Core | Architecture reference only; not embedded |
| Motionity | Visual layer/mask/keyframe editor UX | Licensing/dependency chain not fully reviewed in this checkpoint | Exploratory UX reference only, no import |

Primary reference URLs:
- https://github.com/motion-canvas/motion-canvas
- https://motioncanvas.io/docs
- https://github.com/theatre-js/theatre/blob/main/LICENSE
- https://github.com/ali-abassi/remotion-templates
- https://github.com/RenderComp/free-remotion-templates
- https://github.com/reactvideoeditor/remotion-templates
- https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
- https://openfontlicense.org/ofl-faq/
- https://wiki.creativecommons.org/wiki/CC0_FAQ
- https://www.ffmpeg.org/legal.html
- https://x264.org/licensing/

Specific decisions:
1. Keep offline Canvas as V1 default; Motion Canvas is evaluated only if a
   reproducible feature gap remains that current scene-family architecture
   cannot close.
2. Adopt the concept of a bounded search/safe renderer registry and original
   declarative composition; avoid bringing Remotion and its per-entity licensing
   into the default dependency graph.
3. CC0/original imagery only in videos pending stronger rights attestation.
   CC-BY licenses demand attribution; exclude them from final no-credit exports.
4. Treat repository source LICENSE (still undecided), third-party software
   notices, codec patents, trademarks and consent as separate review items.
   No automation can certify ownership merely from a claimed SPDX label.
