# AI Motion Studio — Opt-in local Konva editor (first approved integration slice)

**Approval:** Operator explicitly approved formal Konva frontend integration on 2026-10-10. This approval does **not** change the official Canvas+FFmpeg renderer, adopt HyperFrames/GSAP Studio, authorize real/company media, or approve a Bezier schema version migration.

## Start on Windows / macOS / Linux (Node 24)

From the repository root:

```sh
npm ci --prefix editor --ignore-scripts --no-audit --no-fund
node editor/server.mjs
```

In Windows PowerShell, from the repository root, use the command shim explicitly:

```powershell
Push-Location editor
npm.cmd ci --ignore-scripts --no-audit --no-fund
node server.mjs
# After stopping the server with Ctrl+C:
Pop-Location
```

Open the **127.0.0.1** URL printed in the terminal. The app is local and does not call external services after installing its exact-version npm package. No administrator permissions or cloud account are required for normal startup. **Do not expose the port through a tunnel or reverse proxy.**

Only the editor has `konva@10.7.1` under its own `editor/package.json` and immutable `editor/package-lock.json`; root `package.json`, root `package-lock.json`, `src/free/` and `scripts/render.mjs` remain untouched. This is the actual pinned editor package install, not the old ephemeral R&D `npm pack` runtime.

## Implemented editor shell

- Live Konva object proxy canvas with selected layer highlighting, real drag, bounded normalized position saves. **All four existing S1 canvas profiles** (360×640, 640×360, 1080×1920, 1920×1080) now preserve the original neutral scene aspect ratio inside a maximum 360×640 viewport, and real pointer deltas convert back into the same normalized coordinates for save/reopen. The displayed profile and downscaled viewport dimensions are explicitly labeled; this does **not** provide locked-font or official renderer pixel parity.
- Multiple layer selector, limited text/color editing, create/duplicate/remove bounded rectangle layers.
- Native DOM frame-snapped clip drag and left/right trim on the same S1 `editable-scene-v1` document.
- S3 keyframe add/remove, per-key x/y/scale/rotation (radians)/opacity editing as a **single atomic undo entry**, visible timeline keyframe markers, two approved incoming easing presets (`linear`, `ease-out-cubic`), real frame seek, Undo/Redo with Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z (Redo). In text/number/select fields, the browser's native Ctrl+Z remains available for editing before save. Empty Undo/Redo history disables those buttons and never writes a no-op scene. Values remain bounded by S1 v1 validation.
- Persist accepted validated local JSON atomically to ignored `editor/.local/scene.json`. Existing file is backed up as `scene.json.previous`; an ETag/version check refuses stale-browser overwrites. Local scene data and backups are **never committed or uploaded**.
- The first launch opens **only the original synthetic S1 demo** if the local file does not exist. No file picker/import or outbound media source is provided. `assets: []` is strictly enforced. Data can be reset only by the local operator handling their own ignored files (never by an automated script).

## Read-only authoritative Canvas frame reference (optional)

The editable blue Konva rectangles are still **position-selection proxies**; they do not reproduce production text, object width, locked fonts, or exact pixels. To inspect the **real saved S1 Canvas result**, expand **「檢視正式 Canvas 畫格（只讀）」**, choose opaque MP4-style background or transparent Alpha-style background, then click **「重新產生目前影格」**. The preview button requests one deterministic PNG from the currently saved scene and selected frame using the very same locked `drawEditableSceneFrame` implementation as the additive approved S1 Canvas+FFmpeg exporter. The local view uses an in-memory `blob:` URL; no video export, extra scene save, CDN, external upload, or new product dependency is involved. The image is invalidated whenever the saved scene version, selected frame, or output mode changes.

The **editor installation stays independent** and continues to work without the root rendering dependencies. Only the optional saved-frame reference needs the already-approved root packages installed separately. From the *repository root*:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
# restart the existing local editor process if it was open
node editor/server.mjs
```

On Linux/macOS use `npm ci` instead of `npm.cmd ci`. Do **not** switch the main output renderer or install an external engine. The strict 127.0.0.1 endpoint `/canvas-preview.png` is **read-only**, requires a same-origin scripted request with `X-AI-Motion-Preview: 1` plus the current scene ETag, validates a bounded frame and opaque/transparent mode, and returns a PNG with `Cache-Control: no-store`. Requests with stale ETags, unauthorized requests, unsupported fonts or foreign media fail closed. No local file browser or arbitrary path is exposed.

The preview shows **output-authoritative single-frame pixels** for the same S1 mode, not pixel matching between the independent Konva stage and Canvas, not a Premiere import, and not commercial video approval.


## Critical boundary

**Canvas rectangles are draggable *position proxies*, not authoritative rendered text, fonts, product UI or commercial deliverables.** Text is edited as S1 neutral metadata and reflected in property controls, not accurately previewed with the locked production Noto Sans TC typeface. Dragging a proxy shifts **all its x/y keyframes atomically**, preserving relative timing; do not interpret this as editing an individual animation curve.

This version is a usable **local S1 schema editor shell**, not a polished editor release. It cannot import external media; has no advanced arbitrary Bezier control points, color/typography fidelity guarantee, finished multi-shot templates, audio, media-provenance clearance, or Windows Premiere acceptance. Editing never automatically triggers a production video export; the separate read-only still-reference button can draw one approved S1 Canvas frame without persisting changes. The **only** authoritative video renderer remains the original Canvas+FFmpeg path. Existing S4 experimental synthetic encoder proofs do not prove pixel parity with it.

## Explicit one-click local MP4 / ProRes Alpha export

After saving an S1 scene, use **「匯出已儲存的 S1 動畫」** beneath the stage/timeline to select opaque H.264 MP4 or transparent ProRes 4444 MOV and click **「開始本機匯出」**. Export never happens on page load, seek, typing or normal save; it requires a deliberate click. It uses the *same* locked Canvas+hash-pinned FFmpeg CLI as the approved S1 adapter, from a temporary private snapshot of the **persisted, ETag-matched** scene. The snapshot is automatically deleted afterward. No arbitrary filesystem paths, shell, external URLs, companies' source materials, uploads, or new packages are accepted.

Required setup once, from the **repository root**, in Windows PowerShell (Node 24):

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node scripts/setup-encoder.mjs
npm.cmd ci --prefix editor --ignore-scripts --no-audit --no-fund
node editor/server.mjs
```

Node's encoder setup is the *existing approved installation-only hash-verifying script*; it is separate from the offline video export action. On Linux/macOS use `npm ci` instead of `npm.cmd ci`. **Normal editor-only operation still requires only the separately pinned Konva editor package.** Missing optional root Canvas or pinned FFmpeg fails with an actionable status; neither is silently installed.

Each export uses a new server-generated `ui-…` ID and writes under ignored `out/editable-ui-…/`, with the file `motion.mp4` or `motion-alpha.mov`, locked-S1 frame hashes, review PNGs, a contact sheet and render-report JSON. The UI displays the relative output path and can copy it; no raw local folder, output target, company media or private JSON is sent to GitHub. Opening the file itself is an operator action. A single export may run at once, and has a 15-minute safety timeout. Scene updates occurring after the export starts do not change the immutable snapshot; the UI distinguishes old versions. **A successful technical encode is not a user art, Premiere, license or commercial approval.**

The loopback-only export endpoint requires a special `X-AI-Motion-Export: 1` header, exact saved-scene ETag, no request body, fixed `mp4`/`alpha` modes and strict same-origin browser protection. Server snapshots are private and ephemeral; generated video remains in local ignored `out/` for the user. The old `scripts/render.mjs` `{title,subtitle}` default and root package graph are untouched.

## Safety and technical verification

The service binds to `127.0.0.1` only, checks Host and Origin, accepts known routes, sends CSP and no-cache headers, caps parsed JSON to 65,536 UTF-8 bytes, requires strict S1 schema, stores to a fixed local-only path, checks expected ETag for writes, and rejects symlink targets. No third-party UI CDN, remote font, company NAS/Drive, private State Engine, automatic updates, telemetry or licensor contact.

Run unit tests: `node --test tests/editor-local-app.test.mjs` (requires no Konva download).

CI, on original synthetic scenes only: `node editor/verify.mjs` after the editor-only `npm ci`, with temporary Playwright Core browser-driver package. GitHub Actions emits only a 7-day screenshot and JSON report; it does **not** store user files or private assets. Read [editor/THIRD_PARTY.md](THIRD_PARTY.md) before distribution.

Any adoption of a new neutral scene schema, full Bezier semantics, company assets, Windows Premiere validation or renderer changes requires a **separate operator decision**.

## Automated Windows browser validation

`.github/workflows/editor-windows-smoke.yml` runs Node 24.19.0 on Windows Server 2022,
installs in `editor/` with `npm.cmd`, then starts the local service from `node verify.mjs`.
The installed **Chrome and Edge** run in headed mode with real browser mouse events;
Playwright Core 1.55.0 is a temporary test driver outside both product dependency graphs.
No browser or material download occurs during the editor interaction.

The same verifier runs on Linux. Additionally it checks real browser mouse drag, viewport proportions and persisted JSON/reload for S1 640×360, 1080×1920 and 1920×1080 profiles; S1 360×640 remains the baseline. It checks canvas drag, clip move and both trim handles,
five numeric keyframe properties and the two existing easing presets, persisted Undo/Redo,
reopened JSON after recreating the server, rejected external-material POST (400), and a
stale second window (409) with unchanged scene/history/disk. Artifacts contain only
original synthetic screenshots, browser trace and a JSON report identifying platform,
browser version, Node version and CI commit. Browser executable override
`MOTION_EDITOR_BROWSER_PATH` is available for a Cloud precheck; CI uses installed
`chrome` / `msedge` channels without an override.

These checks automate technical Windows browser interaction, not personal acceptance.
Only an operator can judge comfort/readability and real mouse/touch/display behavior on
their own PC, or approve creative output. Windows Premiere integration and production
pixel parity remain separate, unverified gates; no company/private materials are used.
