# S4 — neutral EditableSceneSpec versus official Canvas contract audit

**Scope: original-synthetic compatibility research, not a production renderer API, formal migration or visual parity.**

## Actual differences confirmed from checked-in source

| Contract | Official `src/free/scene.mjs` and `scripts/render.mjs` | Isolated S1/S3 neutral editor | Unresolved bridge decision |
| --- | --- | --- | --- |
| Source schema | `validateSpec` accepts exactly `title` and `subtitle` with locked-font glyph coverage, no other keys | `editable-scene-v1` with stable layer IDs, z, color, text, rect, keys, transforms, clip intervals, `assets: []` | Either explicitly choose copy-only with visual losses, or approve future schema/compiler changes |
| Motion | Internal global cubic ease, pre-authored fixed position/appearance/timing; no per-object tracks | Independent per-layer linear / ease-out-cubic keyframes, trim, move, rotate/scale/opacity, undo | A true motion compiler requires independent semantics/art review; cannot represent neutral movement in existing two-field spec |
| Geometry/background | Fixed gradient, wrapped text and decorative accent shape; locked Noto Sans TC font file hashes | Original independent preview uses different solid background, rectangle/text geometry; Konva browser rectangle is only a proxy | Existing pixel parity is **not demonstrated**, even when profile and fps match |
| Timebase | `smoke` 360×640 at 30fps 30f; `vertical` 1080×1920 and `landscape` 1920×1080 at 30fps 180f | 360×640, 640×360, 1080×1920, 1920×1080; 30fps with 30..1800 frames | Reject unsupported or unmatched time profiles until expressly mapped, no silent duration changes |
| Media rights | Official path accepts no remote input; text/font only | Editor rejects every external asset (`assets: []`) | Existing M3-A #12 PNG file integrity/declared license **does not prove real commercial rights**; no ingestion here |
| Video | Official `scripts/render.mjs` outputs H.264 MP4 from the approved Canvas via pinned FFmpeg | Isolated #64 original browser-saved neutral scene to a *different* Canvas painter and FFmpeg, #65 8f standalone Alpha test | These technical checks do not establish full official renderer parity, formal Alpha delivery or Windows Premiere |

## Machine-audited scope

- `official-compatibility.mjs` reads only the real exported official `profiles` and `validateSpec` plus the existing neutral scene validator. It records exact profile matches, object counts, animated/trimmed/eased layer IDs and the permanent **`NOT_PROVEN_NO_SHARED_GEOMETRY`** result. A profile match is never a pixel-parity claim.
- The only optional draft bridge is `projectOfficialCopyOnly(scene,{acknowledgeVisualLosses:true})`: strictly two named `title`/`subtitle` neutral **text** layers, actual official font/glyph validation, and an explicit acknowledgement that all scene timing, layout, shapes, transforms, color, keyframes, Alpha and pixels are lost. It produces a tagged **candidate copy data object**, **not** a production migration, renderer call, video or adoption permission. The shipped original fixture lacks both named slots, so it correctly cannot be projected.
- Fails closed for incompatible schema, any outside media, missing/duplicate/extra text slots, unsupported glyphs and ambiguous/unknown delivery profile. Does **not** mutate any scene or official renderer state.
- Root regression `node --test tests/editor-official-compatibility.test.mjs` checks all three actual official profiles, refusal of accidental parity conclusions, explicit lossy-copy acknowledgement, invalid/foreign input, and **byte-identical official `drawFrame(profiles.smoke,12)` PNG before/after** the audit.

## Explicit next decision gates

1. **No approval needed** for further synthetic-only independent test inventory or human-readable documentation, with no new root dependency or production code changes.
2. **Owner approval mandatory** before choosing a formal neutral→official renderer compiler or changing `src/free`, official SceneSpec, font/asset policy, package/lock graph or artwork. The current two-field spec cannot express an arbitrary timeline.
3. **Other future approval/evidence**: production/preview same-scene actual pixel equality; full 1080p Alpha and H.264 delivery; real Windows Premiere import; licensed private corporate media, media rights receipts; human visual acceptance, bezier/timeline ergonomics.

**Restrictions:** no GSAP/HyperFrames Studio GUI, no licensor outreach, no company NAS or private Drive paths, no State Engine, no rejected M11/frozen M12 art, no use of an AGPL Studio editor. Everything is original synthetic and no dependencies are installed.
