# S3 — Native two-preset keyframe easing selector and seek (original synthetic R&D)

**Scope: standalone original-synthetic HTML Canvas/DOM experiment. Not a professional Bezier curve editor, combined Konva integration or production renderer.**

## Narrow verified intent

- Use the existing S1 `editable-scene-v1` and S3 immutable `commitTimelineEdit`, `undoTimelineEdit`, `redoTimelineEdit`. No S1/S3 contract/schema change and **no new root npm packages**.
- Display a visual HTML Canvas rectangle proxy at a selected **integer frame**, entirely self-authored and different from official Canvas/FFmpeg typography/geometry.
- Select the `headline` end keyframe (25 in the original synthetic fixture) and switch its **incoming segment preset** from `linear` to existing `ease-out-cubic`. The S1 scene evaluator determines exact x/opacity at frame 12; the browser must actually observe changed mid-frame coordinates and alpha.
- Preserve keyframe endpoints and clip bounds, commit the change as one S3 undo unit, persist JSON in a temporary localhost-only server, Undo and Redo, then reopen and re-evaluate the same frame. Chrome keyboard slider seeks frame 29 → 0 → 12 and must reproduce the same sample on reverse seek.
- **Fail closed:** attempting to insert a new keyframe inside an existing cubic eased segment is rejected by the already-merged S3 curve-preserving guard. The saved JSON hash must remain unchanged. A forged external media POST is separately refused.
- Verify original synthetic screenshot and JSON-only metrics; browser helper uses temporary Playwright Core 1.55.0 (Apache-2.0), with all test-only packages installed outside the project. Browser/HTTP loopback only, no private images, company NAS/Drive URLs, credentials, remote font/stock assets or media.

## Explicit limitations

This validates selecting between **two existing easing presets**, not interactive tangent handles, arbitrary cubic Bezier control points, a curve graph, easing/keyframe reparameterization, multi-track UX, professional performance, or complete Konva+timeline integration. The S1 scene itself supports only `linear` and `ease-out-cubic`, so adding arbitrary Bezier parameters would require a separate schema decision and tests. This PR intentionally does **not** add such fields.

The test is not production Canvas renderer output, does not demonstrate official and editor pixels match, does not render ProRes/video, and does not change `src/free`, the official CLI, root `package.json`/lock file, M11/M12 visuals, HyperFrames/GSAP Studio exclusion or private State Engine. Corporate/stock media rights and Windows Premiere acceptance remain separate.

Run on GitHub Actions in the dedicated exact-head isolated 12-minute Chrome workflow. Any failed selection/ease sample/Undo/Redo/disk write/unsafe insert/JSON reload fails the audit; never treat a static screenshot as proof of behavior.
