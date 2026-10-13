# snapcn native source-versus-P2 visual evaluation — 2026-10-13

**Status:** ISOLATED EVALUATION ONLY. No architecture adoption, no company production, no human ART_PASS.

## Purpose and source

The owner found that current P2 multi-depth enhancements have **not improved actual animation quality** and may regress compared with previous better films. This is a bounded response to that feedback, not an extension of geometries or another reusable governance system. Instead of recreating the look ourselves, evaluate **the real, unmodified free snapcn components** on original synthetic material, then compare their actual motion to the best earlier AI Motion Studio films and five private reference videos.

Source upstream: `shadcn-labs/snapcn` commit `afce9f0aa8c9d464409efd1e4d4f227ca4809c04`. Free MIT source `LICENSE` (2026 Sri Nath), **not** a blanket Remotion license. Upstream `pnpm-lock.yaml` SHA `dbe0d04480a09c821ad44ff1d49cbddc0c7c187f` and `pnpm@10.33.0` are used in isolated Actions with `--frozen-lockfile`. The source imports the actual `registry/snap-cn/phone-frame/index.tsx` and `registry/snap-cn/hero-launch/index.tsx` unchanged; this repo contributes ONLY an evaluation entrypoint and fictional, original plate images.

We verified historical [Issue #6](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/6): company advertising must not depend on a newly paid renderer. Remotion is a **conditional evaluation tool**, not a production engine or newly granted commercial license. Operator's scenario is >3 employees / company ad editing; individual-seat operation alone does not settle licensing. The evaluation does not confer rights for company commercial Remotion use; no payment is approved.

## Genuine upstream benchmark, not an original imitation

- **Atlas / product-device treatment:** a complete 240f (8s) 1080×1920 native `PhoneFrame` cinematic showcase with a separately authored, labeled fictional planning UI plate. Source is **not a recording of a real app**.
- **Index / kinetic product-story treatment:** a complete 170f (~5.67s) 1280×720 native `HeroLaunch` built around two original fictional source/result plates with a descriptive headline, no external demo video and **no invented product performance claims**.
- The compositions intentionally exercise different source components and aspect ratios. This is NOT a claim of fully matched content/duration/aspect to the prior 360f P2 pair, or of professional-quality scene selection. Motion-quality comparison must consider aspect/duration fairness and should not report numerical superiority without appropriate controls.

The CI runner clones snapcn at exact SHA, installs **the upstream frozen lockfile in that temporary checkout**, copies only this study's synthetic plate fixtures and entrypoint into it, renders both original components with upstream native `@remotion/bundler` + `@remotion/renderer`, then calls actual `ffprobe -count_frames` and hashes the full MP4s. All output stays in a short-lived **synthetic** GitHub Actions artifact. No production renderer, dependency, user/company source video, company script, music, licensed assets, privacy token, private Google Drive link, Pro component, Pro MCP or paid inference is added to this public repository.

## Review and stop/decision gates

The next review compares these *full-speed* source-native films with:
- Existing P2 original Atlas/Index 12s silent R3, and earlier **stronger** revisions (not just the latest poor candidate).
- The original operator-supplied five reference MP4s in private Drive, outside GitHub.
- The same engineering criteria: frames/codec/raster/font, object fidelity, meaningful visual hierarchy, smooth physical timing, shots, responsiveness, output reproducibility, actual audio state.

The test runner's output is engineering evidence only. It does not claim real browser playback, identical brand typography, commercial software rights, source-license review of third-party media, reference parity, Premiere import, or artistic sign-off. If snapcn visibly outperforms earlier efforts, only then investigate a **selective transfer** or existing free render alternative with appropriate code/license review, never auto-migrate official Canvas+FFmpeg or merge the Draft. The user still owns final art and any commercial, integration or paid-license decision.
