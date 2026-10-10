# S1 — EditableSceneSpec (isolated data-only experiment)

**Status:** S1 R&D proposal, not an adopted production schema, GUI, renderer, or new dependency.

This experiment adds no npm dependency and does not import or modify `src/free`, `scripts/render.mjs`, the root package, FFmpeg or the existing M3/M7 Draft contracts. It is a **separate** neutral editor data model to evaluate before designing a GUI. Its `version: 1` is scoped to `kind: "editable-scene-spec"` and is **not** the same contract as the older M3 `validateMultiObjectSpec` or M7 Brief-to-SceneSpec.

## Contract

- `kind: "editable-scene-spec"`, `version: 1`, lowercase stable ID, `profile` in `landscape|vertical|smoke`, `fps: 30`, `durationFrames` 30–450, 1–12 layers.
- Only original **synthetic** `rect` or `text` layers; no file path, URL, plugin, shader, remote font, stock asset or executable expression. Text is limited to 80 Unicode code points, no control/format characters; a locked `fontId` identifier is recorded but actual glyph coverage is **not** asserted by this pure-data experiment.
- Each layer has unique ID, bounded z-order/color/size, a half-open clip interval `[start,end)`, and 2–24 strictly increasing absolute-frame keyframes covering both ends. Multiple clips may overlap. Layer ordering is z-index then ASCII ID.
- Keyframes contain normalized x/y, scale, rotation (radians), opacity and target-keyframe easing `linear|hold|ease-out-cubic`. All values finite and bounded. `hold` keeps the left value until the right keyframe instant.
- `evaluateEditableFrame(spec, frame)` evaluates each frame independently without mutation or time-dependent state. `serializeEditableSpec` writes canonical ordered JSON; `parseEditableSpec` validates/re-canonicalizes it, refusing unknown keys, malformed/unbounded input or unsupported asset sources.
- JSON is capped at 64Ki UTF-16 code units; only versioned known properties are accepted. This is a format boundary, not an authorization to use private material or distribute any third-party assets.

## Verification

Run `node --test tests/editor-spec.test.mjs` from the repository root (Node 24 in CI). The tests cover frame 0/15/29, overlapping clips, stable layer order, cubic and hold interpolation, reverse seeks, serialization/reopen, malformed/unbounded documents, and a baseline `src/free/scene.mjs` Canvas output parity check. Root `npm test` already includes `tests/*.test.mjs`; no CI workflow change is required.

**Not proven by S1:** visual editor interaction, pointer drag, animation curve UX, Konva or React Timeline Editor package licenses, native Canvas compilation from the neutral model, video export, Windows Premiere acceptance or commercial-media clearance. Those remain S2–S5 gates. The authoritative renderer is still the unchanged Canvas+FFmpeg pipeline.
