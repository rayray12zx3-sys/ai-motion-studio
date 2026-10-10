# AI Motion Studio — Opt-in local Konva editor (first approved integration slice)

**Approval:** Operator explicitly approved formal Konva frontend integration on 2026-10-10. This approval does **not** change the official Canvas+FFmpeg renderer, adopt HyperFrames/GSAP Studio, authorize real/company media, or approve a Bezier schema version migration.

## Start on Windows / macOS / Linux (Node 24)

From the repository root:

```sh
npm ci --prefix editor --ignore-scripts --no-audit --no-fund
node editor/server.mjs
```

Open the **127.0.0.1** URL printed in the terminal. The app is local and does not call external services after installing its exact-version npm package. No administrator permissions or cloud account are required for normal startup. **Do not expose the port through a tunnel or reverse proxy.**

Only the editor has `konva@10.7.1` under its own `editor/package.json` and immutable `editor/package-lock.json`; root `package.json`, root `package-lock.json`, `src/free/` and `scripts/render.mjs` remain untouched. This is the actual pinned editor package install, not the old ephemeral R&D `npm pack` runtime.

## Implemented editor shell

- Live Konva object proxy canvas with selected layer highlighting, real drag, bounded normalized position saves.
- Multiple layer selector, limited text/color editing, create/duplicate/remove bounded rectangle layers.
- Native DOM frame-snapped clip drag and left/right trim on the same S1 `editable-scene-v1` document.
- S3 keyframe add/remove, per-key x/y/scale/rotation (radians)/opacity editing as a **single atomic undo entry**, visible timeline keyframe markers, two approved incoming easing presets (`linear`, `ease-out-cubic`), real frame seek, Undo/Redo with Ctrl+Z / Ctrl+Y. Values remain bounded by S1 v1 validation.
- Persist accepted validated local JSON atomically to ignored `editor/.local/scene.json`. Existing file is backed up as `scene.json.previous`; an ETag/version check refuses stale-browser overwrites. Local scene data and backups are **never committed or uploaded**.
- The first launch opens **only the original synthetic S1 demo** if the local file does not exist. No file picker/import or outbound media source is provided. `assets: []` is strictly enforced. Data can be reset only by the local operator handling their own ignored files (never by an automated script).

## Critical boundary

**Canvas rectangles are draggable *position proxies*, not authoritative rendered text, fonts, product UI or commercial deliverables.** Text is edited as S1 neutral metadata and reflected in property controls, not accurately previewed with the locked production Noto Sans TC typeface. Dragging a proxy shifts **all its x/y keyframes atomically**, preserving relative timing; do not interpret this as editing an individual animation curve.

This version is a usable **local S1 schema editor shell**, not a polished editor release. It cannot import external media; has no advanced arbitrary Bezier control points, color/typography fidelity guarantee, finished multi-shot templates, audio, media-provenance clearance, or Windows Premiere acceptance. Editing never triggers a production render. The **only** authoritative video renderer remains the original Canvas+FFmpeg path. Existing S4 experimental synthetic encoder proofs do not prove pixel parity with it.

## Safety and technical verification

The service binds to `127.0.0.1` only, checks Host and Origin, accepts known routes, sends CSP and no-cache headers, caps parsed JSON to 65,536 UTF-8 bytes, requires strict S1 schema, stores to a fixed local-only path, checks expected ETag for writes, and rejects symlink targets. No third-party UI CDN, remote font, company NAS/Drive, private State Engine, automatic updates, telemetry or licensor contact.

Run unit tests: `node --test tests/editor-local-app.test.mjs` (requires no Konva download).

CI, on original synthetic scenes only: `node editor/verify.mjs` after the editor-only `npm ci`, with temporary Playwright Core browser-driver package. GitHub Actions emits only a 7-day screenshot and JSON report; it does **not** store user files or private assets. Read [editor/THIRD_PARTY.md](THIRD_PARTY.md) before distribution.

Any adoption of a new neutral scene schema, full Bezier semantics, company assets, Windows Premiere validation or renderer changes requires a **separate operator decision**.
