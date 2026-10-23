# C3.1 art redesign: from starter cards to signal-ledger editorial

**Operator feedback (2026-10-18):** 「這支影片看得出意義，但排版、美術、設計仍普通、陽春」. The C3 `evidence-cards` exact media is **USER_ART_NOT_APPROVED**. Do not relabel it as a success or use its design as a brand template.

## Creative decision: preserve the meaning; change the visual argument

The *story* stays `分散訊號 → 找到關聯 → 形成判讀`, 8 seconds, silent original synthetic R&D. The **visual language** must no longer consist of three identical generic cards and a row of undifferentiated bars.

- **Primary visual device:** one persistent signal-reading instrument occupies the right 55% of frame. Three synthetic traces have separated peaks; the peaks visibly move into alignment, then collapse into a single result mark. These are illustrative geometric traces, *not claims about real measurements*.
- **Visual hierarchy:** a restrained off-white editorial slab occupying a left 445px column gives one large Traditional Chinese title per beat. Different title states keep the *same* anchor point. One instrument is always more visually substantial than incidental furniture.
- **Composition:** intentional 78px inset, 445px column, instrument area 604×486, asymmetrical two-field division and durable plot grid. Not a symmetric stack of cards; deliberately distinct left reading zone and right analytical object.
- **Colour and role:** ink-green stage (`#121d2b` from safe existing output background), muted pearl paper (`#e9eee9`), cool forest instruments (`#142e2e`), mint proof accent (`#b8e3ca`). Accent only marks focus/progress/reached correlation, not decoration.
- **Typography:** exact three previously reviewed Chinese fragments, no invented product words or unverified additional glyphs; 78px locked synthetic `PinnedNotoTC` regular, compact tracked heading with 385px bounded heading box. Typeface is **R&D technical stand-in**, not user artwork approval.
- **Motion:** no CSS timer, uncontrolled random or third-party source scripts; signal peaks, trackers, guide, single result are pure functions of integer frame from `hf-seek`. No fake data, external media or proprietary footage.

## Beat-by-beat

| Frames / time | Reading path and spatial event | Evidence to inspect |
|---|---|---|
| 0–71 / 0–2.4s | Three separate peaks appear on the same right-hand instrument, while `分散訊號` resolves inside the editorial slab | Content visible at first frame; heading does not escape the left panel |
| 72–161 / 2.4–5.4s | The exact same three peaks slide to one x-position; a single vertical relationship guide becomes visible; caption `找到關聯` replaces first line | Viewer can perceive the physical *alignment*, not merely a change of word |
| 162–239 / 5.4–8.0s | The three baselines move into one y-space, one large completed node appears with a check shape; `形成判讀` provides conclusion | Clear result hold, no collision and no false statement of actual accuracy |

## Explicit review gate

1. **Technical:** 1280×720, 30fps/240 frames, H.264 and **actual decoded** ProRes 4444 Alpha (ap4h/yuva444p), first frame contains content; outer 8px alpha clear. Hash-pinned Noto font shard source/cmap.
2. **Independent design assessment** from *actual decoded* timecoded frames and ideally continuous playback: hierarchy, text-in-panel and negative-space management, visual cause, rhythm/hold, Taiwan glyphs, title-safe region, light/dark Alpha halo. Do **not** award 100-point score if evidence incomplete.
3. **Current limitations:** still simulated signals with no real product-specific meaning; 30 fps versus upstream recommended 60, no soundtrack or actual motion blur; full Cinetic Skill executable pipeline not installed; Windows native Premiere **NOT_TESTED**; full HyperFrames/GSAP/codec commercial rights **not cleared**.
4. **Human:** user alone approves exact variant; no automatic conversion of technical PASS into `USER_ART_APPROVED`.

## Anti-drift boundaries

New `signal-ledger` is opt-in under the existing `engine=cinetic-hyperframes` **only for public original synthetic samples**. The formerly reviewed C3 sample/plan, C2 portrait, approved private Python K01–K20 and root Canvas+FFmpeg stay unchanged; no external images, fonts, paid providers, private Drive or company data enter public CI.

This creative refinement is a **design exploration**, not an assertion that one style is the best answer for all users or that Cinetic upstream's named velocity-handoff technique is faithfully implemented.
