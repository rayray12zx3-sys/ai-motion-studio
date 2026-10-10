# S2 Konva — isolated synthetic browser proof

**Status: Draft R&D. No editor release, no production dependency, no rendering-engine replacement.**

## Exact scope

A real Ubuntu GitHub Actions Chrome session loads the **actual pinned `konva@10.7.1` prebuilt browser bundle** locally from a verified npm tarball (SHA-512 fixed in the script), draws an original rectangle on a 360×640 stage, drags the synthetic `card-title` with genuine mouse events and confirms:
1. Konva pointer event and changed normalized x/y of the persistent `card-title` object.
2. New neutral `editable-scene-v1` passes the S1 validator, including no imported media.
3. A local ephemeral HTTP server writes the JSON to a **temporary OS directory**, then parses it back with the same validator.
4. Page reload re-reads the saved JSON from the ephemeral directory and reopens the moved shape at the same x/y.
5. A synthetic screenshot and JSON-only report are saved as short-lived Actions artifacts.

The runtime code is intentionally standalone: browser `index.html` / `editor.mjs`; Node `verify.mjs` runs the local test. The neutral schema is loaded as read-only shared code from `experiments/editor-contract/scene.mjs`. No changes or imports to `src/free`, `scripts/render.mjs`, the root `package.json` or `package-lock.json`.

## Temporary tooling, not adopted dependencies

- Konva actual package: `10.7.1`; verified immutable registry archive checksum `sha512-z/JyXPaT6tWBSEcaT70mdfN3oNQ6U6rDxlH9OkRdxlJaf23DOqfMPGptQWVvXlWfKMJQWEa+PNe9ru3zQR7ifw==`. Package's MIT license and optional `canvas` / `skia-canvas` peers were checked in merged [R&D PR #53](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/53).
- Playwright Core `1.55.0` is downloaded only to a short-lived **OS temp folder** for the CI browser gesture; upstream package license is checked to equal Apache-2.0 in the test. No production package, no reusable `node_modules`, no paid accounts.
- Browser and server use only `127.0.0.1`. No remote images, fonts, audio, company inputs, private Drive IDs/URLs or external browser/editor hosts are requested.
- Synthetic sample is `original-synthetic.json` already merged through S1. This proof uses **no third-party media or fonts** and grants no redistribution license to private company materials.

## Not proven

Native timeline/keyframe-curve GUI, scalable text rendering, undo/redo, keyboard shortcuts, Canvas output pixel parity, 1080p Alpha MOV/MP4 video encoding, actual Windows Premiere, accessibility/performance, real asset provenance and human art acceptance are **not proven** by this Drag→Save→Reload test. It should **not** authorize a new root editor dependency or promotion to production.

**CI:** `node experiments/konva-browser/verify.mjs` in a dedicated path-scoped workflow. Fail closed when Chrome, native drag, pinned archive bytes, local save, schema validation or reload is unavailable. The 12-minute timeout and public synthetic-only artifact restrictions apply.
