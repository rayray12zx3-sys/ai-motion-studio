# Creative Technique — use the locked Canvas renderer

## Baseline first
Read `AGENTS.md`; run `npm ci --ignore-scripts` and `node scripts/setup-encoder.mjs`
from the checkout root. Existing `npm test`, `npm run lint`, `npm run typecheck`,
`npm run render:smoke`, `npm run render:vertical` and `npm run render:demo`
are the baseline. Do not execute the isolated legacy Remotion or Three.js directories.

## Picture is a pure function of frame
A scene must be representable as `frame = draw(profile, frameNumber, validatedSpec)`.
Compute all motion from the supplied integer frame and the fixed 30 fps profile.
Never depend on previous frame state, Date, locale, network inputs or unseeded random.
Evaluate the same frames in a different order and compare pixel/PNG output.
Use the already locked Noto Sans TC font coverage check; unsupported text fails before writes.

## Timeline and primitives
Use a single bounded frame timeline for each six-second scene (180 frames).
Convert inclusive/exclusive motion intervals to clamped progress in [0,1].
Expose only primitives actually needed by two proof briefs. Prefer simple,
pure interpolation, cubic Bézier easing and Canvas clip masks. New dependencies
must be justified separately; no browser runner, online fonts or audio by default.
Do not expose arbitrary executable expressions in SceneSpec.

## Composition and preflight
Compute layout from the actual `profile.width` / `profile.height`.
Use separate landscape/portrait layout rules and measure text with the locked font
before creating `out/`. Reject unsupported/overflowing content; do not cut text.
A 360×640 smoke profile is diagnostic, not proof of production safe-area compliance.

## Review protocol
Preserve MP4, sampled frames, contact sheet, frame hashes and report.
Inspect start, end, text onset/fully-visible frames, transition boundaries,
and both aspect ratios at final display size. Check text holds, no collisions,
style consistency, and readability; annotate manual decisions in PR.
Keep `technical_qc` independent of `creative_qc`, which stays
`PENDING_HUMAN_REVIEW`; `approval` stays `UNAPPROVED`.

## Scope
No app UI, 3D, TTS, music/voice, external footage, network assets, production secrets,
cross-repository integration or renderer replacement in M0–M2.
This guide is only a contract for a bounded editorial-motion POC.
