# S3 isolated native browser timeline proof

**Draft R&D only: not a completed commercial timeline editor or changed production pipeline.**

This synthetic proof uses original HTML/CSS plus the merged S1/S3 neutral data modules (no external timeline library). It intentionally avoids React, GSAP, Theatre Studio and licensed UI assets. It uses a transient Playwright Core 1.55.0 (Apache-2.0 package) installation in a temporary OS directory and the GitHub Actions runner's Chrome browser only. No `package.json` / root lock file additions.

The visible 30fps timeline has a native draggable clip named `headline`, start/end trim handles and buttons for inserting a keyframe at frame 12, Undo and Redo. The editor keeps immutable S3 operation history and sends the validated `editable-scene-v1` to a **temporary loopback** local-server JSON file. After six real browser operations and three pointer gestures, a page reload must recover the exact final scene.

**Expected synthetic operation sequence:**

1. `headline` initially spans half-open frames 4..26 and has keys at 4/25.
2. Real mouse clip drag +30 pixels at 10 px/frame -> frames 7..29.
3. Real mouse right-edge drag -20 pixels -> frames 7..27.
4. Real mouse left-edge drag +10 pixels -> frames 8..27.
5. Insert frame-12 key into a linear segment -> keys 8/12/26.
6. Undo removes frame-12 key and Redo restores it. Save count must reach 6.
7. Reject a forged remote media POST, keep JSON hash unchanged, reload browser and independently check persisted 8..27 clip + 8/12/26 keyframes. Repeated random frame access remains deterministic.

CI fails if pointer capture, actual trim, server write, keyframe insertion, undo/redo, reject-unsafe, SHA receipt or reload disagree. Short-lived artifacts contain only an original synthetic screenshot and JSON metrics.

**Unverified:** actual Konva+timeline UI integration, professional editor ergonomics, advanced easing/Bezier curve GUI, real company assets, image/font/media rights, hard production parity with Canvas+FFmpeg video, native Windows Premiere import, human art signoff. No official editor package was adopted and no contact with licensors was made. Published S2 Konva archive/GUI evidence remains separate. Production `src/free`, root `package.json`, `scripts/render.mjs` and private State Engine must not be changed by this R&D.

Run in GitHub Actions with `node experiments/timeline-browser/verify.mjs` after checking exact-head CI. A green test proves **only** this original synthetic Chrome interaction sequence.
