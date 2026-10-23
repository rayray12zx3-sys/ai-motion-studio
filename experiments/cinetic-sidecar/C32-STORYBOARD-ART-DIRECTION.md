# C3.2 — Film editing makes meaning: storyboard-led original motion exploration

## Decision, gate, and user source

The user explicitly rejected the C3 8-second art as **generic and rudimentary**, while recognizing the causal story. Prior C3.1 editorial signal-graph is a recorded, unapproved exploration. C3.2 shifts the *subject matter* to **a physical raindrop film storyboard** rather than decorating another data graphic. This is a safe synthetic creative branch inside Draft #140, not a revision or approval of K01–K20.

**Premise**: three unrelated shots — cloud, falling drop, water impact — have limited meaning. When the same three film frames physically reorder along the timeline and then resolve into the complete rain-impact film frame, editing *creates* an intelligible causal story. The tangible editorial object remains the same throughout; an accent-colored drop crosses the sequence.

## Design language / deliberate distinction

- **Real subject, not abstract dashboard**: three uniquely hand-drawn original scenes, each with weather/water information, instead of duplicate numerical cards, fake bars, ticks or interchangeable dashboard UI.
- **Film editing as art direction**: original cut-out film frames with leader perforations, a contiguous physical reel/rail, one moving editorial playhead, and final in-frame rain/splash/ripple payoff. The cards move into an edit order, then miniaturize into the filmstrip under the enlarged composite shot.
- **Composition**: asymmetrical left editorial typographic column at x≈82; large real-motion right picture x≈535–1200; ample breathing room without excessive emptiness. The word and picture share an anchor but do not fight over identical large-card slots.
- **Palette/material**: graphite/ink sea, green-grey cool light, restrained coral red for one continuous raindrop/playhead, purpose-driven water cyan. No gradients, stock images, generic AI decoration or borrowed commercial reference assets.
- **Typography**: verified pinned source only `@fontsource/noto-sans-tc@5.3.0` WOFF2 subsets required by three exact original public phrases; main copy is `散落鏡頭`, `剪出節奏`, `故事成形`. Do not silently install another font; premium library admission does not mean font is present or the final art is approved.
- **Motion**: opt-in storyboard scene only, **8.0 s / 60fps / 480f**, all motion from explicit `hf-seek` integer frames; no arbitrary browser clocks, remote fetch, third-party video samples or non-deterministic timeline.
- **Scope**: deliberately a single 16:9 story film for a technical/artistic experiment, not a multi-platform template, brand claim or actual editing software demonstration.

## Exact story beats and review questions

| Time | Frames | Visual event | Copy | Viewer understanding |
| --- | --- | --- | --- | --- |
| 0.0–2.4s | 0–143 | Three unique picture fragments, tilted and separated; red drop visibly exists at the start | 散落鏡頭 | The same subject is present but not yet an ordered story |
| 2.4–5.4s | 144–323 | Film frames physically re-order into one editorial rail. The red cue travels across them | 剪出節奏 | The editor imposes a sequence of events |
| 5.4–8.0s | 324–479 | Old frames move into the narrow filmstrip; one full-size rain picture expands, raindrop hits water and generates a visible ripple | 故事成形 | Cause, action and reaction become one coherent shot |

**Selection provenance**: Upstream Cinetic `tr-velocity-handoff-cut` ID is metadata for direction, **not** a claim that upstream's actual cut recipe is implemented. The scene code and SVG frames are entirely original.

## Art stop gates and evidence

1. **Visual Design QA** must review **actual decoded time-coded frames AND full-speed 60fps MP4**, especially 0–1s hook, cutting motion at 2.4s, reading holds at 5.4s and final causal result. No numeric /100 score based solely on a contact sheet.
2. **Real alpha technical**: exact 480 frames at 60fps, H.264, ProRes 4444 ap4h `yuva444p*`, real nonzero alpha and transparent outer 8px on light/dark composite samples, source/font manifests. No need to infer alpha from the MP4.
3. **Creative**: check genuine rain/drop/splash recognition at target size; clean font hierarchy, readable Chinese, legible spacing, no clip overlaps, restrained palette and meaningful visual handoff; if the visual reads as flat vector placeholders, revise the art instead of adding arbitrary glow.
4. **Approval**: `USER_ART_PENDING` until explicit operator review. Preserve user's exact rejection of the previous C3 and all separately approved v9/v2 K assets; no merge, no production adoption.
5. **Commercial/Windows**: exact HyperFrames, GSAP/CLI transitive license scope and native Windows Premiere alpha import still NOT CLEARED. Full upstream Cinetic agent script suite still NOT INSTALLED.

**Success criterion**: the viewer can answer "What does editing change?" from the images alone (reordered shots and rain hitting water). If not, the demonstration is incomplete even when CI is green.

## Drift check

Purpose: motion-art differentiation with actual finished 60fps footage, not an editor feature. Source: user artistic rejection + approved Cinetic synthetic sidecar. Scope: one explicit opt-in synthetic fixture, no new root dependency or paid runtime. Deliverable: coded original art, user-watchable MP4/GIF, verifiable ProRes alpha and independent negative/positive QA. Stop: do not promote until creative/legal/Windows decisions are expressly approved.
