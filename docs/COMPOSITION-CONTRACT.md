# M3-B — Bounded persistent-object composition

This is the opt-in motion-layer experiment for issue #11. It does not change the
existing renderer, use external inputs, or output MP4s. M4 will integrate that separately.

Contract: version 1, exactly 30 fps, 360–450 total frames, 4–5 contiguous named
segments, a bounded camera track, and 2–12 rounded-rectangle objects with IDs and
z-index. The same signal object must be visible at every segment boundary.

Keyframes contain an integer frame plus normalized x/y/width/height, radius,
rotation, opacity, horizontal reveal-mask and linear/precise easing. Frames are
independently evaluated; segments are labels, not ownership/reset boundaries.
Object width/height/radius tracks provide box/circle/pill/bar shape morphing.
No arbitrary expressions or freeform timeline/effect plugin inputs.

Public API:
- validateMultiObjectSpec(spec): fail-closed typed/key/geometry/timeline validation.
- evaluateMultiObjectFrame(spec, frame): deterministic stable-ID state with camera.
- drawMultiObjectFrame(profile, frame, spec): in-memory native Canvas output.

The example in examples/advanced-objects.json uses a four-shot 12-second synthetic
continuous object and a secondary track. Source/test fixtures use no media assets.
Tests validate stable IDs, direct random frame access, changed JSON specs,
portrait/landscape dimensions and input refusal.

Not yet implemented: external image layers, raster asset integration, camera-aware
text layout, real product UI, beat/audio, scene encoding, or a creative approval.
Those are follow-up M4 deliverables. CI technical success cannot approve visuals.
