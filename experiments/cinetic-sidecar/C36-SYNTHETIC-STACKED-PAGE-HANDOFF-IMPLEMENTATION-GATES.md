# C3.6 — generic stacked-card handoff choreography contract (public synthetic only)

**Status: DESIGN_CONTRACT_ONLY / UPSTREAM_CINETIC_ENGINE_NOT_RUN / NOT_RENDERED / USER_ART_PENDING.**

This is an original, bounded **fictional public-synthetic** animation pattern. It contains no private product source, UI, words, logos, customer copy, accounts, storage links, narration or project identifiers. It is not evidence that the present adapter implements a physically correct stack/page-flip.

## Intent → trigger → physical response → audience understanding

- **Intent**: Viewers recognize that successive complete cards occupy one stack, with one foremost focus.
- **Trigger**: The foreground card receives a completion mark.
- **Physical response**: On the SAME frames, the foreground *whole card* travels in negative Y and fades behind a masked stage; the lower complete card rises and scales from 0.95 to 1.0. A small completion mark remains attached to the outgoing foreground page and must not obscure the lower card.
- **Audience understanding**: One item has completed and the next is already in line without a time-consuming scene reset.

## Object model & non-negotiable spatial identity

The page is a single parent group holding **title plus all option/result rows**, not 5 independently translated captions. The next page must be an already resident independent parent. Make layer order `background < incoming sheet < foreground sheet < foreground attached check < independent mode title`. The mode heading lives OUTSIDE the page group and moves only once from initial reveal to its heading position. No duplicated label clones.

The page group should not move horizontally as a substitute for the desired **vertical** handoff. Clip ONLY the rising page inside a soft upper viewport transition, never the independent heading.

## Example synthetic timeline in integer frames (30fps, 95f)

- 0–5: icon wholly beyond right edge; no first-frame leak.
- 6–23: entrance, RIGHT→LEFT (this is a direction instruction, not a quoted upstream effect).
- 24–28: click/down impulse.
- 28–46: synthetic figure detaches and falls visibly, eases at floor; retain figure's natural LEFT-facing posture while moving toward left, do not flip merely because the transform path is leftward.
- 31–50: exactly one mode-heading object moves from under icon to its separate heading location.
- 36–62: complete front page plus complete background second page in visibly separate z-layers; runner can continue moving independently.
- **63–81**: success check begins on the FRONT page at the same time that the front moves **up**, fades and is softly viewport-masked, **while** the second page simultaneously moves into place.
- 82–95: new page is primary; no fabricated second completion state.
  
All timing is an explicit **illustrative contract**, not blessed easing, native app behavior, licensing proof or Cinetic runtime verification.

## Cinetic adapter compatibility gap

The existing `adapter.mjs` schema (`scatter/connect/resolve` + a `visualMotif`) lacks typed object-parent groups, overlapping child tweens, attachment constraints, editable assets and masking. A valid generic plan may be accepted by its schema but will still render its existing generic illustration. **A green adapter validation or synthetic CLI HTML playback must NOT be presented as this stacked-card motion working.**

To claim implementation, add opt-in `page-stack-handoff` schema with:
1. Explicit page group IDs + one heading semantic id (reject duplicates).
2. Framed start/end across overlapping transitions, z-order and positional constraints.
3. Physically defined y-up departure, alpha-drop curve, next-page simultaneous y-up arrival.
4. Check glyph parented to outgoing page; viewport fade excludes heading.
5. Deterministic seek tests for t=0, pre-click, transition first/mid/last and reverse-seek.
6. Independent true render, two-player sizes, decoded audio/alpha tests where required.
7. Separate design QA and end-user art approval.

**No execution of any private media in the public synthetic CI.** Do not promote source-only contract to upstream Cinetic engine parity, approved animation pack or available Premiere/AE workflow.

## Regression gate

Keep `main`, existing approved K-series typography animations, all official current renderers and earlier C3.4/C3.5 research unchanged. This document is strictly a future integration acceptance target and is intentionally missing any protected artwork or source.
