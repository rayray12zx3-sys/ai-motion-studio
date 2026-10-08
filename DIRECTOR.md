# Motion Director — standalone editorial-motion pilot

## Purpose and current implementation status
Guide an agent from a user brief to a reproducible six-second motion-graphics plan.
This file provides direction; it is **not** a natural-language parser or autonomous creative-QA model.
Only use features implemented in the checked-out commit. Read `AGENTS.md`, `TECHNIQUE.md`, and `styles/editorial-motion/STYLE.md` first.

## Brief → treatment
Capture: the exact user text; intended emphasis; tone/pace; aspect ratio; mandatory wording; and whether references/assets are licensed.
Use reasonable defaults for omitted creative choices without inventing product claims or other facts.

Write a compact **Motion Treatment** containing:
1. **Message**: one sentence describing what the viewer should remember.
2. **Hierarchy**: title versus subtitle, plus the element carrying the signal colour.
3. **Style**: `editorial-motion`, and how it satisfies this particular brief.
4. **Layout**: select stacked or split based on readable text width and device orientation.
5. **Beat plan**: time for each entrance, dwell, and final hold; aim for 6 s at 30 fps.
6. **Constraints**: fonts, glyph coverage, safe area, contrast, source licenses, prohibited effects.
7. **Review**: which frames to inspect and what needs human approval.

**Do not imitate a reference composition**. Learn only typography, pacing and composition grammar.
Do not use a demo's story, shots, logos, music or other protected material.

## Scene plan gate
Translate treatment into an explicit scene plan only after checking the renderer's real contract.
The initial pilot expects a small scene, not a free-form timeline: two text roles,
a layout preset, a single accent palette and a restrained pacing choice.
If input is longer than the supported layout, refuse or ask for shorter copy; do not silently cut the user's words.
No remote image/font or video asset is permitted in the pilot.

## Two example treatments (planning examples, not rendered proofs)

**A. Technical design identity** — Message: precision feels deliberate.
Title: "精準動態"; subtitle: "節奏設計". Choose `stacked`, `coral`, `measured`.
A small signal line starts the film; the headline reveals against the grid;
the subtitle follows; end on the resolved hierarchy with enough reading time.

**B. Energetic launch** — Message: clear motion communicates speed.
Title: "輕快出發"; subtitle: "清晰每刻". Choose `split`, `cobalt`, `brisk`.
The accent and title arrive with a shorter interval; the subtitle staggers in;
an adjacent graphic module anchors the last hold. On vertical, reorganise the module
below the text rather than just compressing the horizontal design.

## Technical versus visual approval
Technical PASS requires deterministic validation, fixed dimensions/fps/frame count,
offline local rendering, provenance, and working review outputs.
Visual review separately checks contrast, clipping, responsive layout, hierarchy,
reading duration and continuity. A human must explicitly approve final creative quality;
never change an approval flag from a technical test.
