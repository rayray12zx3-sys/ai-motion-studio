# S3 — Original neutral timeline data operations (isolated R&D)

**Status: experimental data API, not a timeline UI or production renderer.** The operator-approved Canvas+FFmpeg default and all private/company interfaces remain unchanged. No third-party packages were imported.

## Scope

- Imports only the merged S1 `scene.mjs` neutral `editable-scene-v1` validator/evaluator. The original public synthetic 30-frame 360×640 scene is used in `tests/editor-timeline.test.mjs`; media imports remain **forbidden** (`assets: []`).
- `snapSecondsToFrame(seconds, 30)` converts finite 0–60s input into an integer frame. No timebase migration, wall-clock dependence, fractional project frames, or 29.97-fps implied support.
- `editTimeline(scene, operation)` accepts exact-field, typed, bounded operations: move, duplicate (new stable ID), trim start/end to shorter `[start_frame,end_frame)` clip, insert/remove internal keyframe, or set supported value/ease at an **existing** keyframe. Every accepted operation clones the source, revalidates the S1 scene, returns an entirely new scene, and refuses unsafe JSON, remote media, bad geometry and overflow.
- `trimTimelineClip` samples retained boundary values and keeps original *linear* segment interpolation. **A trim/insert into an existing nonlinear `ease-out-cubic` segment is rejected**, not silently reparameterized to a different visual curve. Future native curve/Bezier-preservation support remains a separate gate.
- `makeTimelineHistory`, `commitTimelineEdit`, `undoTimelineEdit`, `redoTimelineEdit` implement serializable, bounded (20 undo/redo snapshots), immutable history. Future edits after undo invalidate redo. No browser storage, disk writing or company editor connection.
- Existing M3 / M7 stacked Draft contracts and `src/free` are untouched; this is an original editor exchange experiment and *not* a compatibility adapter for them.

## Validation

Run from the repository root with `node --test tests/editor-timeline.test.mjs` (also included in `npm test` automatically). Test fixed 30fps/half-open bounds, clip move and duplicate preserving stable IDs, trim start/end with interpolated boundary frames, sampled frame continuity for linear segments, eased-curve fail-closed behavior, key creation/modification/removal, frame snapping, JSON persistence and reverse seek, undo/redo/invalidation/capped history, no original mutation, invalid/fractional operations, and absence of unsafe remote media.

## Not validated

- No native GUI track drag/trim handles, Bezier curve/keyframe visual editor, keyboard shortcuts, or React Timeline Editor package installation.
- No Canvas video output parity, encode/alpha regression, Windows Premiere, company asset rights, commercial animation UI approval, production schema migration, or production Konva inclusion.
- A passing isolated test proves only **bounded deterministic timeline data operations**. It does not mean the end-user editor is complete.

Related bounded evidence: S1 [#51](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/51), S2 pinned Konva [#53](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/53) and synthetic native Chrome pointer edit [#54](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/54). The next S3 step, if independently safe, is an isolated real-browser track UI proof using no new **production** dependencies; integration with authoritative Canvas+FFmpeg video is later S4 and must be separately approved.
