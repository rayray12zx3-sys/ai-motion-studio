# Transparent Canvas Foreground — isolated R&D

Checkpoint: 2026-10-10 (Asia/Taipei) · **Draft PR #30** · branch `feat/foreground-alpha-isolation-20261010` · not merged to main.

## What changed and what did not

- `src/free/scene.mjs` exports an **opt-in** `drawForegroundFrame(profile,frame,spec)` which draws only typography/progress artwork to a transparent RGBA Canvas. The old `drawFrame()` continues filling the existing gradient and runs **the exact same foreground painter directly on the same background Canvas**, without an intermediate composite.
- The original `scripts/render.mjs`, root `package.json`, `package-lock.json` and the H.264 default CLI are **untouched**. This experiment does not install an engine, import third-party artwork or change MP4 output settings.
- `scripts/render-foreground.mjs` is an **opt-in separate CLI**, supports only synthetic demo presets (`smoke` 360×640/30 frames; `vertical-smoke` 1080×1920/30 frames; `vertical` 1080×1920/180 frames). Rejects arbitrary file/URL inputs and existing output folders. It verifies the pinned FFmpeg binary hash, streams RGBA to ProRes 4444 (`ap4h`), probes dimensions and Alpha-capable pixel format, decodes a sample and asserts top-row Alpha=0 and visible foreground pixels. Output is `out/foreground-<profile>/synthetic-foreground-alpha.mov` plus `report.json` in ignored local `out/`.
- No actual company footage, mask, script, brand/logo, rights receipt or private Google Drive identifier was read or uploaded.

## Run locally (Node 24 and existing pinned dependencies)

```bash
npm ci --ignore-scripts --no-audit --no-fund
node --test tests/foreground-compat.test.mjs
node scripts/setup-encoder.mjs
node scripts/render-foreground.mjs smoke
node scripts/render-foreground.mjs vertical-smoke
```

The opt-in 6-second vertical command is `node scripts/render-foreground.mjs vertical`; it can require substantial memory/disk/CPU and is not part of routine automated CI. The `vertical-smoke` option exercises full 1080×1920 resolution over only 30 frames, minimizing continuous Actions cost. `out/` cannot exist for the same selected foreground profile or the script refuses to overwrite it. Do not treat this synthetic MOV as a company deliverable. Existing `npm run render:vertical` and `npm run render:smoke` still mean **opaque H.264 video**.

## Exact compatibility and QA evidence

Before changing `src/free/scene.mjs`, [GitHub CI #37958631192](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37958631192) measured five unmodified `drawFrame()` RGBA SHA-256 values (smoke frames 0/6/12/27 and vertical frame 42). `tests/foreground-compat.test.mjs` hard-codes these as **pre-change golden vectors** and requires *exact byte-for-byte equality* after the refactor; the first post-change [CI #37958912800](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37958912800) PASS proves no affected opaque RGBA sample changed. A sample selection is not a universal proof for every future brief/frame: retain regression tests.

[Isolated foreground workflow #37959188639](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37959188639) + [root CI #37959188757](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37959188757) both PASS on implementation HEAD `c1769fec761fe63a89eb791a090c4cd28be9c73b`:
- Real synthetic foreground Canvas α is empty at frame 0; mid-animation has visible artwork and blank corners/upper stage.
- The independent [Motion QA research PR #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) was checked out at **pinned** source SHA `af047b50cc0de9ec13bfd72ef65e9f43df716334` in the disposable runner. 30 real foreground frames `PASS`, and injected blank/unsafe-Alpha frames `BLOCKED`. **No Motion QA runtime dependency** was added to production; updating the pinned QA revision requires a new exact-head test.
- 360×640 / 30fps / 30-frame ProRes 4444 `ap4h` decoded as `yuva444p10le`; sample frame 12 top nonzero alpha=**0**, visible foreground pixels=**2648**. Synthetic MOV SHA-256 `bbadcaea59a213070e034b8167819dfa64e01624302d4d8cb04ecaac9be35c33`; actual MOV is **not uploaded** to public CI, only `report.json` metadata. It is local, opt-in, reproducible with pinned encoder.

## Separate gates — do not overstate

- **1080×1920 / 30fps / 30-frame (one-second) Alpha MOV is verified in CI** at [run #37959790271](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37959790271) on implementation HEAD `49280a06fecf154403da97aceae677ed461b5540`: `ap4h` ProRes 4444, decoded `yuva444p10le`, upper alpha nonzero=0, foreground sample positive-alpha pixels=17,994; MOV SHA-256 `2c20a3135063dade372f42b89020cbd7ebdca145ea887eaa0931990d3ad790ae`, file length 4,384,851 bytes. **Full 180-frame six-second vertical** output is now ALSO CI-tested on [run #37960064650](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37960064650) at HEAD `2797a78957a1bd977e095137294dc4296e87135d`: 1080×1920 / 30fps / 180 frames, ProRes 4444 `ap4h`, decoded `yuva444p10le`, upper transparent region alpha nonzero **0**, visible foreground pixels **19,734** at frame 42. MOV SHA-256 `60b4760115aceccbc940b8502d7f0a045d2ce5e8871f4dc6a5b56fd5b6d031af`, MOV size **27,283,200 bytes**. The concurrent [root CI #37960064640](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37960064640) passed. MOV stays out of public GitHub; only the three synthesized codec/alpha reports are uploaded. Root [CI #37959790269](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37959790269) also passed. Only metadata reports were uploaded, not source MOVs.
- Windows Premiere-specific import, composite and export remain untested. Absence of Premiere should not block independent R&D.
- Production adoption, rights to company assets, private NAS access, product UI animation art approval and safe zones for particular social platforms remain separate.
- Human creative review is **always required**, especially on M11 (rejected) and M12 (frozen). Do not merge Draft PRs, change private advertisement State Engine or publish company media.

## Next engineering steps

1. Preserve exact-head SHA, read back test artifacts and update [coordination PR #27](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/27) continuation files after final Docs CI is green.
2. Full-resolution 180-frame vertical *synthetic* Alpha MOV is now verified, but cost is nonzero: current Draft CI re-encodes all three profiles for each relevant push. Before promotion, consider limiting full-res tests to explicit workflow_dispatch to reduce Action minutes, keeping smoke and QA checks on PRs.
3. Keep a reproducible read-only Motion QA bridge and no dependency promotion without user approval.
