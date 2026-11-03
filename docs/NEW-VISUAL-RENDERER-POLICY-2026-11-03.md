# New animation visual renderer: Python/Pillow prohibition (2026-11-03)

## Decision and scope

**Operator directive, 2026-11-03:** do not use Python/Pillow as a visual production renderer for **new motion graphics**. A Python/Pillow prototype passing codec/frame checks is not a substitute for the specifically requested Canvas, WebGL, Three.js or HyperFrames engine. Never silently downgrade when the requested engine is unavailable. Return **BLOCKED_ENGINE_UNAVAILABLE**, retain prior approved assets, and report precisely what ran.

- New source frames, typography, animation objects, transitions, 3D visual layers and scene compositing: **Python visual programs and Pillow are forbidden**.
- Existing, historically approved K01–K20 outputs and old experiments: preserved unchanged; not retroactively invalidated, deleted or forcibly migrated.
- Python used only for independent read-only QA (ffprobe, SHA, frame/audio counts, timing checks, metadata), testing or file orchestration: permitted when not producing the delivered pixels.
- FFmpeg remains authorized for encoding, audio mux, codec/alpha verification; **not** evidence by itself that a different requested visual engine ran.
- Default adopted runtime remains **JS Canvas + FFmpeg**. SVG/JS, Three.js and HyperFrames are **task-specific opt-in engines** when individually authorized and their actual runtime is verified. This rule does not merge experimental engines into the product baseline.

## Required preflight and release gate

Every new video job must declare *requested_engine*, *actual_engine*, and all pixel-producing *visual* sources separately from *qa* sources. Run the executable preflight:

\`\`\`sh
node scripts/visual-renderer-gate.mjs --manifest path/to/new-job.json
\`\`\`

A manifest uses kind \`new-animation-visual-production\`; a nondefault engine requires \`engine_authorization=explicit-task-only\` plus auditable \`authorization_evidence\`. Release additionally requires an existing \`runtime_receipt\` and exact \`verified_renderer\` match. **Do not claim production engine proof from self-declaration alone**; the receipt and media logs must independently substantiate it.

For PRs, the additional CI guard rejects newly added/modified Python visual renderer files in production source paths while exempting QA/verification. It leaves legacy unmodified historical code intact. The guard is deliberately a **bounded static preflight**, not a complete sandbox or proof that no out-of-repository renderer could have run. Human oversight and runtime evidence remain mandatory.

## Acceptance separation

Technical PASS (exact 1080×1920/30fps, full decode, real alpha/audio checks) **≠** operator ART APPROVED **≠** actual native Windows Premiere PASS **≠** distribution rights cleared. Keep private ads/media/voice/script and Drive identifiers out of public GitHub, CI, source comments and Issues. Preserve source provenance and prior approved variants.

This is a narrow policy delta, not approval of any particular new art style, rendering engine, paid service or real company input in this public repository.
