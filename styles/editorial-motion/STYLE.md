# editorial-motion — Style Contract v0.1 (pilot)

**Essence**: modern editorial / Swiss-inspired kinetic typography, not a copy of any
particular poster. One clear title, one supporting statement, a disciplined grid
and one meaningful signal colour. The viewer must understand the message, not the effects.

## Invariants
- Flat warm paper background, dark ink, restrained neutral secondary details.
- Exactly one accent palette: `coral` or `cobalt`. Accent marks hierarchy, not decoration.
- Flush-left alignment, generous negative space and size contrast.
- Existing locked Noto Sans TC 400 only unless fonts are independently licensed, pinned
  and tested. Do not silently use host/system fonts or remote font fetching.
- `stacked` and `split` are layout intents, not pixel-coordinate requests.
  Portrait must meaningfully reflow rather than shrink the landscape arrangement.
- Motion is precise easing or linear; no spring/bounce, uncontrolled randomness,
  particle showers, fake 3D, excessive glow or dramatic camera effects.
- All content visible in a frame must be legible at native output size.

## Pilot vocabulary
- A timed signal-colour rule/bar.
- Clip-masked upward headline reveal.
- Short, ordered supporting-text stagger.
- Stable final hierarchy and hold; simple graphic module, not stock assets.
- Two pacing presets: `measured` for considered introduction and `brisk`
  for tighter reveals. Both must preserve readable end holds.

## Six-second grammar (30 fps / 180 frames)
- 0–18: establishing rule/module.
- 12–55: title clip reveal.
- 42–100: supporting text stagger.
- 100–180: composition settles and holds for reading.
These are design ranges; exact entrance curves belong to the checked-in code.

## Reject, rather than pretend success
Overflow, unsupported glyphs, extra JSON keys, negative/missing frames,
unlicensed external assets, missing font coverage and any output overwrite.
Do not imply that a technical check constitutes subjective design approval.

## Review
Check typography size, alignment, contrast and reading time on 16:9 and 9:16.
Review intermediate key-action frames, not only the four default contact-sheet
samples. Ask the human reviewer to approve or revise before final delivery.
