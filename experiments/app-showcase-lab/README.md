# Original vertical app-motion R&D — synthetic UI only

**Status:** opt-in R&D / user-art pending. This is not a native/product UI mockup or an accepted advertisement. Never import private customer, company, source UI, dialogue, script, characters, recorded mouse movements, signed links or account data into public GitHub Actions or its artifacts.

## Actual reproducible public test

- `learning-ui-motion.py`: fully original synthetic *fictional* learning UI, state change → selected answer → synthetic check marker. The actual product is never depicted. Creates full-speed H.264 MP4 **540×960, 30fps, exactly 95 frames (3.1667s)** and a separate **true ProRes4444 alpha editorial-only FX MOV**.
- An overlay is explicitly clipped from the source box **(105,102)–(435,844)** and is compared against the source screenshot each frame *before encoding*. H264 is lossy and is **not byte-identical** to RGB inputs after compression.
- Public CI `source-safe-app-showcase-rnd.yml` uses a temporary Noto Sans TC preview font and Pillow/FFmpeg. Exactly **4 unit tests PASS** and the independent decoder verified actual MP4/ProRes `ap4h` 95f 30fps; alpha checked at 0/45/70/94 and its outer-only bounds. [Original success run #39140556395](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39140556395), artifact #12141024244, retention **3 days**.
- All source media within this folder and public CI are **fictional**. The original vocabulary text `ECHO` and Chinese options are test-only placeholders, **not** verified APP gameplay or a new product feature.

## Actual visual critique of decoded contact and full frames

Decoded eight-frame contact and frame 070 were inspected, not inferred from code. **The technical video works, but the visual concept is NOT user-art approved**. The fictional UI looks like generic app buttons, and the outer stage still has fixed-screen typography and cramped text/decorative underline near bottom (e.g., frame 070). This does **not** resolve the user's anti-PPT critique.

The next motion-quality milestone must be tested with approved authentic recordings **solely in a private execution context**. Source-specific clip choice, pointer/cursor cleanup, authentic UI copy integrity, editorial motion graphics, approval evidence, composite tracking and finalized placement belong to the private production repository / restricted Drive. Do NOT store authentic APP pixels or re-rendered private frames in public Actions. In particular, no synthetic fake score/running/ranking effect may be passed off as a native verified feature.

## Explicit gates

- **Synthetic technical:** PASS, not design/real-footage acceptance.
- **Real app compositing:** OUTSIDE PUBLIC REPO, source review and local proof only. Not CI certified here.
- **Art direction:** USER_ART_PENDING.
- **Commercial rights:** NOT_CLEARED; the public demo does not establish all dependencies' end-to-end commercial rights.
- **Windows Premiere Pro and alpha import:** NOT_TESTED. There is no verified platform integration.
- **Production defaults:** unchanged, root dependencies unchanged, no merge, previous approved artwork unchanged.

Avoid adopting the generic demo as a permanent animation style; its value is the independently checked frame-safe overlay contract.
