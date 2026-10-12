# Model-neutral, bounded AI Creative Director (Draft research)

> The north star is a natural-language briefing **actually interpreted by an authorized model** into multiple independent creative options. This is **not** a fixed template/camera algorithm, nor an already-connected model provider, production engine adoption, commercial-rights approval or professional art acceptance.

## Why this extension exists
PR #110's `preflightCreativeTreatment()` validates *manually authored* film structures; it does not propose scenes from language. #9 (Creative Harness), #20 (Brief→SceneSpec), #23 (template registry) and #29 (motion QA) are earlier stacked Draft research. **Reuse** those conceptual boundaries; do not treat them as merged APIs.

This experiment adds `src/agent-director.mjs`:
1. `validateDirectorBrief()` fails closed on unbounded/non-original inputs; objective, audience, message, factual claims, allowed assets, desired video profile and rhythm are explicit. Actual company's private brief must not be committed to a public repo or CI.
2. `runCreativeDirector({brief,complete,maxRevisions})` requires an **injected authorized model callback**. One proposal is steered toward meaningful material/form continuity; the other toward a distinct editorial cause-and-effect or spatial narrative. The model writes JSON; the runner never invents output with a canned film.
3. **Product advertisements now must declare a real causal `productProof`**: who clicks/types/drags/selects, what original fictional UI state existed first, and which visible changed state follows, with valid referenced shot IDs. This is a structural proof of intended cause and effect, not a verified interaction recording. An abstract attractive morph with no user result must not advance.
3. Each candidate is parsed as **bounded JSON only**, validated by #110's exact frame/timing/object-lineage preflight, and rejected if it has an unmotivated jump, unreadable text, unsupported technique, wrong format, unauthorized media, remote URL or executable payload.
4. A rejected candidate receives its exact error diagnostic on a **bounded revision** request. The second idea cannot merely recolor/reword the first without changing camera, transition or scene grammar. Block if it fails rather than inventing success.
5. `CREATIVE_CANDIDATES_READY` means **structural preflight only**; `renderStatus: NOT_RENDERED`, `art: PENDING_HUMAN` and commercial `rights: RIGHTS_REVIEW_REQUIRED` / `FACT_CLAIMS_PENDING` are never promoted by a model.

## How a ChatGPT/Codex Agent would call it, without new paid-provider dependencies
```js
import {runCreativeDirector} from './src/agent-director.mjs';
// Complete is your explicit, independently authorized model client.
// NEVER inject the users' private production assets into this public research.
const result=await runCreativeDirector({
  brief: originalBoundedBrief,
  complete: async ({prompt,phase,route,attempt})=>(
    await authorizedModel.generateJson({prompt,phase,route,attempt})
  ),
  maxRevisions:2
});
if(result.status!=='CREATIVE_CANDIDATES_READY')throw Error(result.reason);
console.log('Candidate creative directions await storyboard/art review',result.candidates.length);
```

There is deliberately **no actual model/provider/inference** inside this repo. The CI mock adapter proves control flow, source validation, repair and structural distinction; no prompt-only unit test can guarantee good creative work or model output quality. Subsequent opted-in work must connect an authorized inference capability, run **genuine** briefs through it, choose a candidate via explicit review rubric, render true MP4 and perform **watchable full-speed** self-review before requesting operator art judgment.

## Current user reference principles, not clips to copy
Real owner-provided Prompt Motion product videos show different purposes for object continuity, UI material and audiovisual rhythm. Borrow semantic lessons (why one action causes the next, clear product promise, purposeful signature camera, attention and audio cue plan), **not** the reference brand/shot order/graphics/song/copy/promotional numbers. Source summaries: separate Draft #111 and earlier Draft #110. No reference bytes, screenshots or Drive IDs are in this experiment.

## Charter START/FINISH
- Goal: advance brief→model candidates→preflight/repair, ready for real shot graph; NOT output film quality.
- Source: Issue #4; Draft #111 priority proposal; existing #110 source, only separate Draft R&D. No product/schema/new-engine adoption permission.
- Deliverable: two synthetic original brief contexts, 2 candidate proposals per brief with mock injectables and adversarial fail tests. Candidate film bytes NOT CREATED.
- Rights: original synthetic only, no network, runtime/editor deps, source reference or third-party sound assets, and no fee commitments. Ad numbers are evidence-gated.
- Next stop: genuine model adapter + non-copying two-brief treatment assessment; then isolated original watchable 2D/UI and distinct film. Human aesthetic/rights and any official integration PENDING.
