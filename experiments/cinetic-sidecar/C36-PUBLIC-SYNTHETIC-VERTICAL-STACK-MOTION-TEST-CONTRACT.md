# C3.6 — Public-synthetic-only choreography contract: one header / falling actor / vertically stacked sheet transition

**STATUS: `ART_DIRECTION_CONTRACT_ONLY / NOT_UPSTREAM_CINETIC_ENGINE_RUN / USER_ART_PENDING`.**

This isolated research entry contains **no private product visuals, customer screenshots, private vocabulary words, private voice recordings, Drive URIs, credentials or delivery frames**. It does not install/upstream-run the Cinetic engine and does not alter default renderer paths or approved K-series works.

## Opt-in public-synthetic narrative and causal motion sequence

**Generic public story:** A neutral geometric token enters a stage from the right; tapping it lets a visible synthetic character/device chip fall due to gravity, continue traveling toward the left, and update a centered card-stack as the user responds. The front sheet lifts **UPWARD** and fades while the following synthetic page has always been physically visible **UNDER** it and rises to the same location. The success glyph is an attached sub-object of the outgoing sheet, not an unrelated overlay and never floats into the header region. A single standalone title element enters once then relocates upward and remains fixed. Its material/color system is distinct from task cards.

**Synthetic actor asset:** use a neutral original vector geometry with explicitly resolved facing direction (facing=LEFT while velocity.x<0); do not mirror an existing proprietary/recognizable character. If an actor uses only one original frozen pose, mark `pose_animation=NOT_PROVEN`; translating/bobbing a sprite cannot be called a full run cycle.

## Proposed 95-frame / 30fps design-spec test fixture (not accepted by any real runtime yet)

| Frame range | Element | Trigger and action | Must preserve |
|---|---|---|---|
| f000–005 | icon | blank canvas / icon offscreen | no early visibility |
| f006–023 | icon | translate +X offscreen -> center; #184 inspiration, right-to-left per director | once only, center alignment |
| f010–039 | title | delayed right-to-left subtle blur trail, then *the same one object* relocates into separate identity region | no second copy, no persistent motion blur |
| f024–045 | synthetic actor | contact → depart icon → gravity drop → clear physical ground contact | continuity and facing, no teleport |
| f038–064 | two full sheets | layer first above second; second real synthetic page content fully exists underneath | no transparent text ghosting; whole page not individual options |
| f045–094 | synthetic actor | moving left continuously while new sheets appear | actual pose cycle or explicit placeholder label; no progress rail |
| f060–080 | selected answer and sheet | attached success symbol; first full page moves UP and fades **concurrently** with second page rising from below | result never moves independently outside clipping rectangle |
| f083–094 | new full page | stable readability hold, no speculative answer outcome | carry only stated second question |

## Testable formal constraints

1. `backgroundSheet.z < foregroundSheet.z`; second sheet exists at f47 **prior** to first answer.
2. `oldSheet.x == newSheet.x == stage_center_x` during transition (within subpixel interpolation tolerance).
3. During f65..76, oldSheet.y must be **strictly decreasing** and newSheet.y must be **strictly decreasing** (both moving upward, not sideways). Their visibility ranges overlap; old page opacity later goes to zero without ghosting.
4. Attached check inherits the old page transform and viewport clipping; when the old sheet leaves it cannot remain visible above the mode header.
5. Mode header one lifetime + one source object identity; text of synthetic quiz must not be replaced by a duplicate title animation.
6. Motion director MUST record whether each output is `director_only`, `adapter_contract_pass`, `synthetic_hyperframes_real_render` or `upstream_cinetic_runtime_pass`. These statuses are not interchangeable.
7. Synthetic art creative QA and user's approval remain separate from unit tests, MP4 decoding, CI green, and any underlying renderer license audit.

**Recommended next Cinetic engineering move:** Build a completely public/original page-stack fixture against the *existing isolated director adapter and seek contracts*, run reverse-seek + render-frame reproducibility and film full-speed QA, then verify the exact pinned upstream Cinetic Skill runtime/third-party license before declaring this engine adopted. Do not broaden the current `contentClass: public-synthetic` gate or route private media into public CI.

**This commit only records a reusable motion direction and acceptance checklist.** It does NOT prove runtime functionality or higher aesthetic quality.
