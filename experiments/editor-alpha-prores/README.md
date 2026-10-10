# S4 — original synthetic 1080×1920 ProRes 4444 Alpha probe

**Isolated R&D only, not Windows Premiere or complete production Alpha acceptance.**

Eight original 1080×1920 transparent Canvas frames are created from simple shapes with **no text/media/fonts or private inputs**: a moving fully opaque cyan block, an unrelated half-alpha orange block, and a fully transparent background. The existing hash-pinned `ffmpeg-static` 6.1.1 executable is provisioned by `scripts/setup-encoder.mjs`, and used unchanged to encode ProRes 4444 / 16-bit alpha as MOV. No new product dependency or artist asset is added.

Decoding the resulting MOV back to RGBA and probing its actual stream must demonstrate `prores` codec, alpha-bearing pixel format, 1080×1920, 30fps, exactly 8 decoded frames, transparent corner alpha near 0, opaque shape alpha near 255, and half-alpha pixels near 128. Numerical tolerances accommodate codec/8-bit conversion: transparent <=10, opaque >=245 and half-alpha 128±15. Full per-channel byte parity is **not expected** for ProRes.

This is intentionally **not** the 30-frame original S1 scene, not the neutral Canvas painter from #59/#62/#64, and not the official `drawForegroundFrame` export. It verifies only the FFmpeg ProRes 4444 alpha technical encode/decode path on controlled synthetic data. The test also compares official smoke PNG bytes before/after to ensure no production changes.

Do not interpret a passing technical CI as proof that Windows Premiere imports the MOV correctly, that 30-frame/1080p production workflows retain image quality, that real footage/music/photos are licensed, or that AI Motion Studio is a finished product. Explicit operator approval is still needed for any production encoder/UI/SceneSpec migration, Windows Premiere actual test, corporate source media, M11/M12 art or copyright decisions.

The Actions workflow installs only already-locked root npm packages, checks the existing encoder SHA-256, runs a bounded test on Ubuntu, and publishes one original synthetic MOV with a JSON report for 7 days. Nothing is included in the public Git repository except source/tests. No contact with GSAP/Webflow or any licensor.
