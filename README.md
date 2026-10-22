# AI Motion Studio

## Product contract / 專案防偏移規範

**先讀 [產品目標與防偏移規範](docs/PRODUCT-CHARTER-AND-DRIFT-CHECK.md)**：本專案的核心是讓使用者透過自然語言、AI／Codex 與可重用的動畫技術，製作真正能全速觀看和審查的高品質 Motion Graphics；不是通用 Premiere／AE 替代品。Canvas + FFmpeg 是當前已核准的正式渲染基礎；Konva 是可選的輔助編輯器，其他引擎及授權研究仍保留。PR 與 Agent 工作必須執行規範中的開工／完工防偏移檢查。

**計畫與授權區分**：既有 [創作願景／歷史來源](docs/RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md) 和 [個別工具／授權地圖](docs/RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md) 已保存；其中 P0～P5 只是建議順序，**不是**使用者逐項批准的功能導入計畫。任何商用素材／新引擎／新場景結構／美術方向變更仍需個別確認。技術測試通過不代表視覺品質或商業授權通過。

## Continue development / 換對話接續

**Canonical project handoff (on `main`):** [CONTINUE-HERE.md](docs/CONTINUE-HERE.md) · [machine-readable progress](docs/PROJECT-STATE.json) · [append-only work log](docs/ACTIVE-WORK-2026-10-09.md) · [commercial output and tool-license research](docs/TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md).

Start every new agent/Codex/ChatGPT session from those files **and refresh GitHub's live PR heads, issue state and exact-head Actions**. Saved JSON is a dated checkpoint, not a substitute for remote verification. The operator delegated limited, backwards-compatible CI-green technical/docs merges; major architecture/licensing, private company assets and M11/M12 artistic decisions remain human-owned.

Standalone local motion graphics renderer with an isolated historical R&D lane.

## Goal

This repository validates animation workflows before any integration into `ai-video-template`.

Primary focus:

- Free local Canvas + FFmpeg motion graphics
- AI-assisted animation prototyping
- reusable scene and timing patterns
- future Three.js / WebGL experiments
- clean extraction of proven modules into `ai-video-template`

## Current scope

The first phase is intentionally small:

- Node.js 24 + locked Canvas/font/encoder dependencies; no Remotion in the production graph
- one 6-second 1920×1080 / 30 fps demo composition
- reusable delivery profiles, including 1080×1920 / 30 fps / MP4 for vertical social-video handoff
- reusable component boundary
- architecture and future-integration notes

## Explicit non-scope

This repository does **not** currently include:

- the main `ai-video-template` production pipeline
- PixVerse automation
- dubbing / TTS pipeline logic
- production asset management
- full template orchestration
- Three.js runtime dependencies

Those should only be added after the animation workflow is validated here.

## Structure

```text
src/
  free/         # Default deterministic local renderer
  remotion/     # Historical optional R&D; excluded from root install/CI
  three/        # Reserved for future Three.js / WebGL experiments
  shared/       # Shared types, timing helpers and animation utilities
docs/           # Architecture and future integration notes
```

## Opt-in local Konva editor (approved frontend integration)

The standalone, localhost-only scene editor is installed **separately from the official Canvas+FFmpeg renderer**:

```sh
npm ci --prefix editor --ignore-scripts --no-audit --no-fund
node editor/server.mjs
```

Open the printed `127.0.0.1` URL. The editor supports an S1 neutral scene with interactive Konva proxies, timeline/keyframes, Undo/Redo and local JSON saves. This is **not pixel-accurate official render preview or commercial asset/Windows Premiere approval**. See [editor setup](editor/README.md), [approved scope](docs/EDITOR-KONVA-ADOPTION-DECISION-2026-10-10.md) and [editor license inventory](editor/THIRD_PARTY.md).

## Approved opt-in S1 scene → actual Canvas+FFmpeg video (separate from legacy)

The Konva editor's **existing validated neutral v1 scene JSON** can now be passed to an opt-in locked Canvas+FFmpeg renderer; the original title/subtitle renderer remains the default and is not replaced. After installing the *existing* root runtime and hash-pinned FFmpeg, run:

```sh
node scripts/render-editable.mjs editor/.local/scene.json first-preview mp4
# Alternatively, a separate ProRes 4444 Alpha sample:
node scripts/render-editable.mjs editor/.local/scene.json alpha-preview alpha
```

Run IDs are unique; all results live in ignored `out/editable-<run-id>/` and include the finished local file, source/frame hashes, sample PNGs and a contact sheet. Export only accepts S1's **assets:[]** and locked-font characters. **Konva selection proxies are not WYSIWYG or legacy title/subtitle pixel parity**. No company media, real assets, Windows Premiere acceptance or creative approval is implied. See [scope and usage](docs/APPROVED-EDITABLE-S1-RENDER-2026-10-10.md) and [review of the 20 X-listed OSS projects](docs/X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md).

## Local usage

Requirements:

- Node.js 24 required
- npm
- Git and a repository checkout (run commands at its root)

Install:

```bash
npm ci --ignore-scripts
node scripts/setup-encoder.mjs
```

Validate the production path:

```bash
npm run lint
npm run typecheck
npm test
```

Render the demo:

```bash
npm run render:demo
```

Output:

```text
out/landscape/motion.mp4
```

## Integration principle

Do **not** merge this repository wholesale into `ai-video-template`.

The intended path is:

1. validate an animation here
2. refactor it into reusable pieces
3. define a small prop / scene contract
4. move only the proven subset into `ai-video-template`
5. keep experimental animation R&D isolated here

## Status

**Free renderer reliability candidate — technical checks do not approve production assets.**

Root installation, render commands and CI require no paid engine. Legacy Remotion remains excluded; its license must be resolved before anyone explicitly uses that old lane. See [THIRD_PARTY.md](THIRD_PARTY.md).

`npm run render:vertical` produces 1080×1920 / 30fps / H.264 MP4. `npm run render:smoke` produces a one-second synthetic review. Each fresh `out/<profile>` includes selected PNG frames, a contact sheet and a render report. Existing output is never overwritten. For another review, preserve/move the existing ignored folder first.

The optional second CLI argument is a local JSON brief containing only `title` and `subtitle`; keep private briefs outside Git. Current scene support is bounded typography. It does not recreate all legacy Remotion visuals, exact app UI, audio, lip-sync, final safe-area approval or arbitrary production compositions.

CI uploads only synthetic review assets. Real renders belong in approved private storage and need separate creative/technical/safe-area review before State Engine asset adoption.

<!-- PROJECT_PROGRESS:START -->
Current milestone: free local renderer reliability. REQUIRED_NOW: locked install, input guards, explicit fonts, render smoke and artifact review. Active path: local validation → PR/Ubuntu CI → human visual review. Current gate: candidate awaiting CI and creative review. Blockers: final scene design/visual approval; public branch-protection configuration. Next action: inspect synthetic artifacts and exact-head CI. Exit condition: required checks pass and reviewed scenes are accepted; no production approval is inferred. No lifetime percentage is claimed.

S08 experimental lane (Draft #140, REQUIRED_NOW): CURRENT gate = secure offline Drive authorization; local fictional safety checks 23/23 PASS, Linux isolation CI PENDING, actual private render NOT_DONE. Active path: constrained consent → protected environment → genuine 95-frame render → private Drive SHA readback → visual QA. Blockers: Production OAuth/Picker grant not provisioned and real-video evidence absent. Exit: exact private video/profile/SHA plus independent visual review; user art/Premiere remain separate. See [S08 handoff](experiments/cinetic-sidecar/S08_AUTHENTIC_PUBLIC_RUNNER_HANDOFF_20261022.md).
<!-- PROJECT_PROGRESS:END -->


## CI usage budget (independent Draft candidate)

To reduce Actions minutes, CI still runs source lint, syntax checks and
unit tests for pushes and pull requests. Full H.264 synthetic renders,
verified encoder provisioning and 7-day review artifacts require the
workflow_dispatch input confirm_full_render=true. Manual input defaults
to false. Stale PR source checks cancel on newer PR changes, while
deliberate manual rendering is not canceled.

The original six-second video renderer and format remain unchanged.
Negative input/layout preflight now runs before encoder hash validation;
a valid render still requires the exact hash-verified encoder.

This repository also integrates with Jules using trusted GitHub Issues
tagged \`jules\`; that method does not require a Jules GitHub Action.
The Jules GitHub App needs repository authorization; use scoped tasks,
check branch selection carefully, and do not put API keys in issues.
Full 1080p output and creative approval are separate human review gates.

**Draft caveat:** workflow_dispatch options only become available after
the change has been reviewed and merged into the default branch. The
advanced motion M4/M5 PR stack maintains separate opt-in creative render
steps and should be reconciled when its changes land. No branch merges
are performed by this proposal.
