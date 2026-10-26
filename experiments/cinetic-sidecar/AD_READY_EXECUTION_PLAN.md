# Cinetic｜實用廣告動畫・免費商用免署名驗收與執行計畫
Version: 2026-10-26 / branch `work/cinetic-single-entry-mvp-20261026`

## 0. Owner-defined result (not a checklist of 273 effects)
Cinetic is “done” for a **declared output lane and use case** iff it can build and revise different actual animation/ad briefs into reusable, useful assets, **with zero mandatory per-render/software licence/subscription/API fees**, and the **final commercial advertisement requires no author/tool/asset attribution, watermark or end-card**. The no-credit claim applies to **the finished video**, not redistribution of software, fonts or source code which must retain applicable LICENSE/NOTICE. Real client media is admitted **only in an authorized private job** with written rights; public Actions are 100% owner-created synthetic tests.

## 1. START governance and status
- Decision: OWNER DEFINED GOAL for commercial/no-credit use; current Canvas+hash-pinned FFmpeg and existing private K-series remain unchanged on main. Cinetic is **opt-in sidecar only**, public GitHub CI synthetic.
- Existing pinned real engine already passed Linux and native Windows on executable commit `3e3ef8fdf598b1b372628d18650033bca787e024`: Linux Actions #40277155799; Windows #40277155743. **These establish codecs/alpha/engine only, not a useful general animation, copyright or ad release.**
- New changes only under `experiments/cinetic-sidecar/` plus opt-in public synthetic test workflow triggers; main, K variants, frozen M11/M12, Draft PR #140 and private assets untouched.

## 2. First release scope, without escalating cost
1. **Two original, distinguishable promo briefs**: e.g. productivity timer and habit/reward, with independent horizontal/vertical layouts; not rebranding a weather scene, and no unlicensed existing brand/product/UI claims. The tool must use actual user-editable text, purposeful illustrated motion, color language and pace rather than a generic left/right cards dashboard.
2. **Edit/revision proof**: change copy and creative treatment within the declared schema, preserve deterministic source, rerender a new version; verify changed frames/text and archive input/output hashes. Support safe Unicode Traditional Chinese with font coverage and original SVG/HTML/CSS/canvas vector geometry.
3. **Real renderer**: reuse pinned HyperFrames CLI + FFmpeg only, anchored to a verified exact entrypoint SHA. No implicit network, imports from client URLs, `npx skills add`, user-owned media in public Actions or automatic fee-incurring execution.
4. **No-assumed-royalties transfer**: keep MP4/ProRes existing interoperable optional outputs **subject to codec/use-rights review**. Add **transparent numbered PNG frames** as an edit/interchange lane, verifying real decoded alpha and exact frame count; PNG avoids assuming that any particular H.264/ProRes commercial patent situation is universally royalty free. Be honest about editor-specific import requirements.
5. **Actual commercial evidence**: record each *used* engine/script/font/audio/visual/codec/source with source URL, version, SPDX/terms, copy-attribution and final-ad-credit requirements, fee and redistribution-only notices. User-created illustration, self-authored copy and optional self-synthesized audio may be cleared only when actual inputs match the receipt. Refuse stock CC-BY, NC, paid plugin/API, brand claims, images or third-party audio without proof. Do not treat a license classification as legal warranty across jurisdictions.

## 3. Gate matrix and required proof
| Gate | Minimum acceptance evidence | Do not over-claim |
|---|---|---|
| C1 animation not fixture | Two materially different original advert treatments → real media, intentional causal choreography, not two edits of a frozen branded visual | Original public test is production-**style**, not a real client's commission |
| C2 revision | One brief revised changing copy/color/layout/motion; exact versioned plan+artifact hashes; deterministic frame checks | It is not general free-text natural-language AI generation unless actually integrated |
| C3 edit delivery | Alpha MOV plus PNG-sequence frames extracted and independently decoded, >=1 transparent and opaque alpha pixel, no missing frames, scripts or recipes to reassemble in an editor | Windows runner native FFmpeg test is not Adobe Premiere GUI evidence |
| C4 zero mandatory fee | Cinetic MIT; HyperFrames Apache-2.0 pinned CLI; only local OSS visual/PNG dependencies and OFL font; no paid editor, licensed stock, paid cloud, Remotion fee-tier, paywalled API | Electricity/hardware/network optionally cost money |
| C5 no required end-video attribution | Original synthetic artwork and own copy/audio, correctly identified SIL-OFL fonts, OSS engine license inventory; no music/images requiring CC-BY; verify no watermark or mandatory screen credit | Software/font redistributors may need keep NOTICE outside the video |
| C6 distribution/use | Document exact ad destination and actual codec/legal rights. Advert production can use PNG image sequence with proprietary encoding applied by separately authorized target editor/venue; no blanket H.264/ProRes patent assurance | Never issue unconditional global commercial copyright/patent clearance |
| C7 creative utility | Human 1× watchable video review + evidence of meaningful composition, pacing, safe area and message; user signoff on any user-facing final artwork | Machine test PASS ≠ taste/brand approval |

## 4. Execution order and stop/rollback
**A.** Verify existing git/live handoff, audit official licence text and point-in-time version, record this exact plan before writing executable changes.  
**B.** Implement only the missing useful variation/editable campaign-specific scene(s), safety validators, font text coverage, and regression tests. Keep existing tested true pipeline and app isolation.  
**C.** Make full-speed real render CI for two different briefs and one revision; inspect actual decoded frames and gate receipts, not just source-only tests.  
**D.** Add true lossless transparent PNG-sequence output as a optional sidecar from the actual decoded alpha MOV, with manifest/hash/frame validation and no change of original files.  
**E.** Audit used licences/attribution/cost per output, inspect media full-speed, label unresolved codec/creative/user rights honestly; update this plan, `HANDOFF_CURRENT.md` and Issue #138 with exact tested SHA, optional artifact URLs and pending gates.

Rollback: opt-in branch, no main or default changes. On failed tests preserve logs and mark FAIL; never delete or rewrite approved files. Outputs use new directories and source-hashed plans. No new production adoption without owner decision.

## 5. Completion semantics
`TECH_MVP_PASS` is not `AD_READY_ZERO_FEE_NO_CREDIT_PASS`. Only proclaim commercial project lane done when the intended **specific output lane and actually included assets** have passed C1–C7 with rights evidence. For client material, signer clears ownership of submitted images/brand/music. If any necessary legal or real-human review cannot be completed here, leave that gate PENDING, not PASS. A free original vector/PNG lane may have a narrower verified scope than one involving H.264, cloud encoding or company footage.
