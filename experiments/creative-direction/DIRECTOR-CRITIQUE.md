# Independent text-only director critique — next storyboard gate

The product's artistic failures are **not** fixed by 7 green preflight tests or by adding more 3D Shader objects. Original product examples and storyboard critique must challenge causal story structure BEFORE expensive rendering.

This research code provides `critiqueDirectorCandidates({brief,directorResult,completeReview})` so an **independently invoked, explicitly authorized model** can return structured scene-addressable objections and actionable revisions. The workflow does not auto-copy or import prompts/media from Prompt Motion. It:
- Requires the reviewer to name real shot IDs (or `whole-film`) and one of 11 categories, with reason and concrete remedy.
- Makes major/blocking criticism stop advancement to internal prototyping; minor or zero notes can only mean **storyboard ready for internal prototype**.
- Carries pending objective product-claim evidence even if a reviewer says there are no problems.
- Never asserts output film quality, visual taste, audio accuracy or commercial rights; no video frames exist in this lane yet.
- Uses a separate `completeReview` injected model interface; does not silently spend on a paid model or imply an independent source of creativity.
- The director/reviewer test harness uses mocked responses only. Actual provider integration + two true model responses + original playback remains a separate product/rights/visual gate.

**Next smallest proof:** send two distinct actual authorized-model outputs through director+critique, then render the selected original composition and inspect real frames and full-speed audio. Passing code tests alone cannot trigger a main merge.
