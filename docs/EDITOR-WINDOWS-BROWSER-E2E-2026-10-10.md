# Windows browser editor evidence — 2026-10-10 (Asia/Taipei)

PR [#76](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/76) continues main `68ee13f` after checking merged PRs #71–#75. #74 already proved Windows Node/server compatibility; this change reuses and extends the existing Linux browser verifier instead of rebuilding the editor. Only CI, test tooling and documentation change. No production or editor dependency manifests, official Canvas+FFmpeg, M11/M12, real/company materials or user PC paths are modified or accessed.

## Final PR and later viewport verification

- Final exact-head `160545c167f6389666a5a7161f49ce4b0265bd9c` passed [Windows Chrome+Edge #38031806799](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031806799), [Linux Chrome #38031806792](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031806792), [root #38031806828](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031806828), [official three-profile render #38031802874](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031802874) and [post-main #38031977078](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031977078) — all PASS. [PR #76](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/76) merged `bfa4e05dc0770da8a35b9da2a9e9fab39cbb51f1`.
- [PR #77](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/77) head `44a09b71e9e0b181cdf3f76af3f407aae67f2a80` passed [Windows Chrome+Edge #38033072823](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38033072823), [Linux Chrome #38033072863](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38033072863), [root #38033072810](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38033072810); merged `8f56d225b41bbf42974b7edfc2e4c0de7c85da0f`. Exact S1 source profile labels, bounded aspect-preserving stage, browser normalized drag and JSON reload; still NOT official renderer pixel parity.

## Verified implementation checkpoint

Implementation head: `f86a535c898b9b1f7491648acc9d013820e1dfc8`. These completed runs are evidence for that implementation; documentation and explicit head checkout are added afterward. Final PR checks must all pass again before merge. The PR is the live authority for final head, merge and final CI evidence.

| Check | Evidence | Result |
| --- | --- | --- |
| Windows Server 2022, Node 24.19.0, headed Chrome + Edge | [38031493476](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031493476) | Both browser jobs PASS |
| Linux installed Chrome, same verifier | [38031493460](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031493460) | PASS |
| Root lint, syntax and regression | [38031493459](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031493459) | PASS; Cloud also passed 34/34, no skips |
| Full official synthetic regression | [38031504465](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031504465) | 360×640/30f, 1080×1920/180f and 1920×1080/180f, all 30fps, technical QC PASS |

Windows report versions: Chrome `154.0.8037.98`, Edge `152.0.4191.66`, `platform:win32`, `headless:false`. Both reports identify the implementation PR head and GitHub's tested merge tree `ab928f81f659c332eb73bc0aebdcda95ee05906f`. Final editor workflows explicitly check out the PR head, while the root PR workflow retains its existing merge-tree behavior and manual full-render dispatch checks the branch commit directly.

Windows install runs `npm.cmd ci` inside `${{ github.workspace }}/editor`; verifier starts from that same directory and resolves code/artifacts relative to its module. The temporary existing `playwright-core@1.55.0` test driver uses `cmd.exe /d /s /c npm.cmd` with its temporary directory as `cwd`, with no interpolated path or user input. It uses installed browser channels and no downloaded browser. Editor interaction requests remain on 127.0.0.1.

## Browser assertions and artifacts

- Canvas: actual browser mouse drag moves the Konva object +28/+14 pixels; Undo restores the entire pre-drag scene and Redo restores the saved scene.
- Timeline: headline moves `[4,26)` → `[6,28)`; accent left/right handles trim `[10,20)` → `[11,19)` with interpolated keys `[11,18]`. Undo restores end 20, Redo exactly restores the trimmed scene.
- Keyframe inspector: x `.64`, y `.72`, scale `1.2`, rotation `.1` radians and opacity `.9` save together. Subsequent canvas translation changes x/y; full reopened scene equals the winning saved scene. Both headline keyframe markers are asserted present.
- Easing: `linear` → `ease-out-cubic` changes the frame-12 interpolated x; Undo restores linear, Redo exactly restores the eased sample. Insertion into the nonlinear segment fails closed without changing saved JSON.
- Persistence: tabs close, service closes and is recreated with the same temporary disk JSON; a fresh tab has the same entire scene and ETag, with empty Undo/Redo history.
- External material: browser-origin forged POST with a synthetic `example.invalid` URL returns **400**, disk SHA remains unchanged, and browser requests to external hosts total **0**.
- Conflict: a second window edits stale text after the first adds a layer. Its POST returns **409**, and its scene/history/commit count and the winning disk bytes remain unchanged. The visible status identifies the conflict.

Both Windows browsers (and Cloud Chromium precheck) produce canonical saved-scene SHA-256:
`4e9daf619531d780cdecb41f2ef9c6e867d5c1239db6840a7ff296689026ec9c`.

Each Windows artifact contains initial, edited, trimmed, conflict and reopened PNGs, a Playwright trace ZIP and JSON runtime/assertion report. Retention is seven days; these are original synthetic scenes only. The archives were downloaded through the GitHub connector and SHA-256 verified against GitHub's artifact digests:

- [Chrome artifact 11662084264](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031493476/artifacts/11662084264): `8a91190fde1b2f306af1179e044f9e033a84ff50963bbf031e26b06342476321`
- [Edge artifact 11661909474](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/38031493476/artifacts/11661909474): `78d8389c25b834ef3a72dc67597004abbbbb405a9c5af2459f49ca3537390d08`

Full official render reports identify the implementation commit with a clean tree and technical QC PASS. Smoke MP4 SHA `f2f0cd9920f3eff5f804716ce8c09e1f56f47ff80115aaced232ade20f7f1824` matches the Cloud smoke output. Creative QC remains `PENDING_HUMAN_REVIEW`.

## What still needs a person

Routine editor drag/trim/key/easing/Undo/Redo/save/reload/refusal checks are now automated and do not need a user-local test script.

1. **Actual-PC compatibility and comfort:** installation under that PC's antivirus/enterprise policy, chosen browser settings/extensions, physical mouse/touch input, monitor scaling, multi-monitor arrangement and subjective readability/responsiveness. Hosted automation can test chosen configurations but cannot establish the state or experience of the user's computer without access to it.
2. **Windows Premiere application acceptance, if that deliverable is requested:** import/composite playback in the user's licensed installed version and actual GPU/environment. No Premiere app access exists in Cloud/hosted Actions; MP4/MOV technical validation does not substitute for application use.
3. **Creative and rights decisions, if progressing to real content:** subjective typography/layout/art approval and authorization/provenance for company or third-party media. This task uses none of those materials and grants no such approval.

Official renderer pixel parity/adaptation and arbitrary Bezier controls remain **engineering features outside this scope**, not manual acceptance tasks that clicking the existing editor can complete. M11/M12 stay frozen. No hosted result is described as completed local actual-use acceptance.
