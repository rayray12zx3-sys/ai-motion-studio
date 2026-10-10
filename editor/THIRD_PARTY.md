# Editor frontend dependency and license inventory

| Package | Exact version | Scope | Published license | Proof |
| --- | --- | --- | --- | --- |
| Konva | `10.7.1` | Local-only editor frontend | **MIT** | Real published npm archive SHA-512 `sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==`; actual package `LICENSE` / dependency inventory verified previously in [#53](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/53) |
| Playwright Core | `1.55.0` | Temporary CI/browser test helper only; **not installed in the editor's product dependency graph** | Apache-2.0 | CI verifies package manifest at test time |

Editor `package-lock.json` contains one actual browser runtime dependency: `konva@10.7.1`. Konva declares optional native peer packages `canvas` / `skia-canvas`, which are not used or adopted by the browser frontend. Runtime does not depend on React, GSAP, HyperFrames Studio, Theatre Studio or tldraw.

Konva official source/license: https://github.com/konvajs/konva/blob/master/LICENSE

**Attribution:** Preserve Konva's bundled MIT license/copyright with distributed installations. Do not claim its permissive license grants rights to user-supplied video, music, font or imagery. This project deliberately does not bundle media files or publish any private local scene.

Before distributing a binary/application bundle beyond private source use, re-audit the exact packages and their NOTICE/license texts plus any icon/font/media assets; the current CI proves only the installed dependency/license inventory and the synthetic editing behaviors.

The repo's **root** Canvas+FFmpeg runtime licenses are managed separately. The explicit 2026-10-10 operator approval covers only a standalone Konva editing frontend; it does not authorize a GSAP-backed visual Studio GUI or commercial media ingestion.
