# Private local visual overlays — NO After Effects, production changes or publication

**Scope:** isolated P2 research branch only. This lane is **not** the product UI/creative-director spec, not the official Canvas+FFmpeg renderer, and not the video-production State Engine. Existing synthetic brief compiler stays `original-only`. Neither commercial asset bytes nor third-party filenames, cloud share URLs, company recordings, license receipts or full debug logs belong in this public repository.

## Why
Some licensed motion-template purchases contain independently usable MP4 and PNG footage alongside AE-only FFX presets. The latter are not decodable effects in FFmpeg. Importing a local file into an experimental composite **does not** imply the underlying native effect or exact authored AE transition has been reproduced.

## Allowed and disallowed
- Use **only a personally obtained local MP4 or PNG** for a **private technical trial** when its end-user terms permit this use.
- The script **requires** `--private-preview-only`, produces a new output under the ignored `experiments/p2-semantic-scenes/artifacts/private/` folder and refuses overwrite of existing media. It never fetches assets, sees a cloud link, or uploads an output.
- `.ffx`, `.aep`, GIF **previews**, remote URLs, files under the public source tree, and local media passed without a rights/preview intent flag are refused.
- A GIF distributed to **illustrate** an FFX preset is not assumed to be a commercially reusable overlay.
- Only two explicit offline compositions: `screen` for black-background video effects, `alpha` for truly transparent PNG. Black-background video must not be falsely treated as alpha. A high-resolution media wrapper is not presumed to have useful color key or transparency.
- Asset choices must be tied to a specific storyboard/shot. Avoid flashy overlays over scientific citations, actor performances, exact UI buttons, or result claims.
- This lane makes **no** promise that source end-user rights permit redistributing standalone raw assets, an editable template, public GitHub/Actions upload, team sharing, or a commercial release. Review purchase-specific license and delivery context separately. It is never the source of human approval.

## Local-only command
Create the ignored `artifacts/private` folder (the program creates it after validation), and obtain authorized media **outside the publicly tracked source tree**. A synthetic R&D base film may come from the existing `artifacts/` folder.

```bash
python3 experiments/p2-semantic-scenes/scripts/private_media_overlay.py \
  --base /local/private/base-vertical-silent.mp4 \
  --asset /local/private/authorized-overlay.mp4 \
  --output experiments/p2-semantic-scenes/artifacts/private/scene-effect-review.mp4 \
  --start-frame 120 --end-frame 150 \
  --mode screen --opacity 0.45 --private-preview-only
```

The input base is verified as 1080x1920 H.264 / 30 fps and 30–3600 **decoded frames**. Its existing audio, if any, is stream-copied. The output is H.264 1080x1920 / 30 fps, decoded and frame-count-checked, with a sidecar `*.private-qc.json`. Video output quality, transparent backgrounds, media-length behavior, safe areas, visual suitability, sound and legal rights are still **human-pending**. Decoding a 1080x1920 file does not mean its contents are portrait-safe. Passing a test does not make it a production shot.

**Known current limitation:** the program loops the effect clip to cover the scene; use only naturally looping footage or author an intentional timed window. Alpha mode demands an actual alpha pixel format. Gamma/transfer-function and blend colorimetric fidelity are not yet calibrated. This is a composition proof, not a high-end motion graphics authoring engine.

## Dual-project boundary / handoff
1. **Motion Studio**: develops and technically tests reusable private *optional* composite outputs from synthetic films only. Draft PR, never auto-merge.
2. **Video production**: real script, voice, app captures, story shots, paid provider and human approval stay with the existing private production workflow and `ai-video-template` State Engine. **No direct writes from this script**.
3. **Transfer**: only after asset source/license, decoded film, creative use and human approval are independently checked, create a private `MOT_...` candidate with output digest, codec, frame count, dependency references, source rights receipts and private durable locator. State Engine alone may then adopt it; never cross-wire source files or infer approvals. Material-based commercial publication needs its own rights verification.

## CI
Tests use synthetic fake file names and mocked media probes only. Public CI may validate the script's syntax/tests; it must not download a purchase, access cloud media links, render a proprietary effect, or publish private output and hashes. Any true private asset review happens locally and stays outside public GitHub, including raw/composited source bits.
