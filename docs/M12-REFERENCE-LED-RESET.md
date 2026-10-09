# M12 — Reference-led visual reset (draft)
This is **a new art-direction candidate**, not a tweak to rejected M11 layout.

Sources (creator's original posted production briefs, NOT frame-by-frame inspection):
- https://x.com/twoclipping/status/2102554209166000267 (20s product ad)
- https://x.com/twoclipping/status/2103273003555402193 (14s shape morph)

Original one-shape rendering: one rounded rectangular object held through eight
120-BPM beats (15 frames each), morphing underline → button → spinner/check →
summary → slider → success → collapsing exit. Big masked MATCH type first;
no scaffolding panels, extra text, showy effects, copied original media, or
disconnected cards. Shared shape/cursor transforms are analytic per frame.
Text windows are non-overlapping, the V2 selective spring overshoot is approximately 3% on affordance/reward,
with separate bounded checkmark/Combo bounce impulses. Do not infer visual
acceptance from the magnitude alone.

Beat sequence:
1 0–14 masked hero
2 15–29 shape grows into button
3 30–44 pointer click and button condenses
4 45–59 loader morphs to check
5 60–74 summary expansion
6 75–89 progress scrub directly follows cursor
7 90–104 success capsule
8 105–108 result hold, 109–119 shape exit

Public original synthetic demo; all app branding, real screens and proprietary
scripts remain private. Use existing conservative 9:16 clip and private
operator's RGBA alpha mask before any claimed platform approval. This
four-second style benchmark does NOT replace the canonical one-second S03 slot.
No licensed external sound/media in this design; any beat clicks in review
are generated procedurally, not licensed music.

**Current creative QC: prior M11 REJECTED; M12 PENDING USER REVIEW.**
Technical CI pass does not upgrade creative QC.
## M12 motion-dynamics V2 — responding to editor feedback (2026-10-09)

The editor rejected the apparent **single-speed transformations**. Earlier M12
used a single critically damped response for every shape transition, even when
changing type, press, loader, progress or exit. Technically non-linear does
NOT mean visually distinct easing.

Now `src/creative/motion-easing.mjs` provides named, bounded, deterministic
curves, and `evaluateOneShape()` assigns a different motion signature:

| Section | Gesture | Motion profile |
| --- | --- | --- |
| Type reveal | Fast reveal, softer landing | ease-out-cubic |
| Underline → Button | Energetic open, ~3% overshoot | ease-out-back |
| Tap | Brief pre-press squash/stretch | 4f anticipation |
| Button → Spinner | Tight, quick middle acceleration | ease-in-out-quad |
| Verification | Short decaying check-mark bounce | damped-bounce |
| Loader → Card | Smooth launch, settle with subtle overshoot | ease-in-out-back |
| Slider | Direct cursor-following acceleration and deceleration | ease-in-out-sine |
| COMBO | Separate reward pop + capsule elastic settle | ease-out-back + damped-bounce |
| Exit | Held label clears, controlled accelerated retreat | ease-in-out-quad |

Distinct motion speed/overshoot is now validated with quantitative tests
and a review artifact. Bounce is used selectively on interaction feedback,
not globally on every morph. Same shape identity, no UI-native claim, no
change to private advertising footage or production timing. Always require
user's actual design review before promotion.
