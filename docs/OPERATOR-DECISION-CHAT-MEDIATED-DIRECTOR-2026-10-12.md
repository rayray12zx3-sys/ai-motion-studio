# 2026-10-12 operator decision — ChatGPT conversation-mediated Creative Director

**Decision status: OPERATOR_APPROVED_EXECUTION_MODE**, narrowly scoped to *how the Creative Director receives its model reasoning*; this does not ratify new animation aesthetics, a third-party engine, schema changes, paid inference, media-rights imports or merging existing Draft PRs.

The operator responded **「我想沿用目前 ChatGPT 對話」** when offered two distinct options: (1) the current ChatGPT conversation orchestrates creative direction and authorized GitHub steps, vs (2) the AI Motion Studio Node application itself calls a model provider/API. **Option (1) is selected.** User has previously rejected Work-mode handoff. Do not repeatedly ask them to choose API services unless the user explicitly revisits this decision.

## How this works in actual use (not wishful automation)

1. **Natural-language brief in ChatGPT.** ChatGPT acts as creative director, proposes two genuinely different original directions based on audience/message/product action→visible result/shot purpose, and records a bounded structured treatment. The product references (Prompt Motion original films) are for observing general principles only, not copying their shots, images, brands, UI, music or scripts.
2. **Conversation-led review.** ChatGPT uses a separate explicit critical pass for originality risks, action→result chain, typography readability, visual attention, rhythm, claims and media-rights. This is *not an independent model-provider review* unless one was actually used. Do not claim ART_PASS or RIGHTS_PASS merely because model text or JSON passed validation.
3. **Structured handoff to existing isolated code.** For public synthetic research, ChatGPT may put its authored JSON/test fixtures in an isolated branch, then run the already established `preflightCreativeTreatment`, `runCreativeDirector`-compatible callback tests, and the exact-head dedicated CI. CI may **mock** callbacks; mock tests prove protocol, not model autonomy. Keep company media and private briefs out of public GitHub, CI artifacts and issue comments.
4. **Animation output and real review.** ChatGPT directs original deterministic shot/timeline/motion code and the authorized offline renderer, producing two genuinely different complete MP4s (and alpha only when properly supported). Check actual frame count, resolution, fps, audio, licensing and full-speed viewing, not just script/schema PASS. Repair objective defects before human aesthetic review.
5. **Human gate.** Ask the operator for actual quality judgment when a meaningful watchable creative candidate exists; separately obtain permission for private company footage, paid services, material commercial licenses, engine/schema/production migrations or merger of still-Draft research.

## Explicit non-capabilities

- The Node repository **does not** gain autonomous access to the ChatGPT model. No OPENAI_API_KEY or external LLM HTTP call is silently installed.
- The assistant can perform orchestration **during active conversation** using available authorized tools; it **cannot** promise unattended background jobs, durable execution after the conversation ends, or automatic invocation of itself by GitHub Actions without separate user-approved infrastructure.
- Existing `complete` / `completeReview` callback ports are retained as optional abstraction/testing contracts; they are **not a reason to stop** and ask for a new provider. A ChatGPT conversation may author valid candidate JSON itself, log the actual provenance, and send that to the preflight.
- Different concepts in tests are necessary but not sufficient for truly professional Motion Graphics. `ART=PENDING_HUMAN`, `RIGHTS=PENDING`, actual rendered-film gate OPEN.

## Immediate continuation target

**P1 → P2:** reuse original treatments and the validated productProof causal checks from Draft #112 to build an original, standalone **product/UI-first** watchable 2D animation. Keep a second genuinely different treatment as a reuse/control brief. Original synthetic materials only. Do not revive old V1–V4 polishing or add a third unrelated shader primitive. Produce and audit an actual MP4 before calling this stage complete; a CLI/test-only milestone is engineering progress, not an animation-quality outcome.

Record live SHA, exact-head CI, real output, defects, rights/creative status, and next stop gate in Issue #4. New chats should start there and reread the Product Charter and this decision.

## Charter START/FINISH drift check

- **Goal:** unblock real conversation-driven creative direction without a second model service while moving toward original professional watchable motion.
- **Source/decision:** operator explicitly selected ChatGPT-conversation mediation; production engine/media/rights/draft-merger approvals unchanged.
- **Deliverable/proof:** dated durable decision and next concrete P1→P2 workflow. No film produced by this decision alone.
- **Tools/rights:** no model provider install, paid API, unlicensed reference assets or public private links.
- **Next/stop:** proceed with isolated synthetic rendered prototypes; stop only at meaningful aesthetic acceptance or genuine engine/commercial/rights authorization.
