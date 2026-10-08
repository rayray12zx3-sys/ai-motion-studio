# Budget-first animation development: ChatGPT, Jules, and CI

Use **normal ChatGPT conversation first** for planning, code edits when a repo
tool is connected, and visual review when a sandbox with the necessary files
exists. Do not assume every chat has persistent Node/FFmpeg or repo checkout.

Use **Google Jules** for larger multi-file coding/debugging work when the
user starts a Jules task. Jules clones the selected GitHub branch into its
own VM and can run locked Node tests/previews without starting Actions.
The Jules service is **not directly connected to this conversation**.
Never add a Jules-invoking GitHub Action: it still consumes runner minutes.


## Verified GitHub → Jules integration and its PR side effect

The GitHub Issue `jules` label **does** trigger the authorized Jules GitHub
App in this repository. In the 2026-10-08 test, [Issue #16](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/16)
received the label and Jules acknowledged
[task 16512926754855591545](https://jules.google.com/task/16512926754855591545).

**Critical observed side effect:** Despite a read-only/no-PR instruction,
Jules automatically created [Draft PR #18](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/18)
against `main`, carrying the entire unmerged M0–M5 code stack (31 files),
and triggering a lightweight PR Actions run. The PR was reviewed and
**closed without merging**. Therefore: labeling an Issue does not itself
use Actions minutes, but its subsequent Jules PR **can consume Actions
minutes**. Label-to-Jules dispatch works; "read-only, no PR" compliance
was **not** established.

The Jules PR body asserted previews had been verified, but the visible
Issue/PR record did not contain command exit codes, complete reports,
contact sheets or per-frame hash evidence. **Do not mark the PNG preview
commands as verified from that message alone.**

### Approved dispatch decision

- **For coding work where a PR is acceptable:** create a small trusted
  GitHub Issue with explicit intended target branch and acceptance criteria,
  then add `jules`. Expect that Jules may produce a PR even when requested
  not to. Review the new PR target and full diff before merging; auto-created
  PRs should not be treated as approved.
- **For read-only tests, snapshots or diagnosis where NO PR/CI is wanted:**
  do **not** use the `jules` GitHub Issue label. Prefer current ChatGPT
  execution environment (only if Node 24/dependencies are available), or
  start a Jules task through the Jules user interface with a selected
  existing feature branch and review results there. Confirm the Jules
  UI behavior for the task; do not assume it will suppress publishing.
- **Never** put Jules access credentials, private inputs, secrets or
  media-generation prompts into a public issue. The separate Jules GitHub
  Action uses Actions runners and is intentionally not installed.
- Jules may start its work from `main` despite an issue describing
  another branch. Verify checkout/ref inside the task. The automatic
  PR #18 showed why a reported branch and the actual PR base must be
  checked independently.

When Jules posts findings, require the commit, commands and exit codes,
Node version, PNG/report/contact sheet counts and meaningful visual
review notes. A PR/source CI PASS is not evidence of PNG validation or
full-speed MP4 quality. Keep `creative_qc: PENDING_HUMAN_REVIEW`.

## Quick previews, no MP4 and no GitHub Actions

At the repository root in Node 24.19.0 with Git and project dependencies:

    npm ci --ignore-scripts --no-audit --no-fund
    npm run lint && npm run typecheck && npm test
    npm run preview:advanced:landscape
    npm run preview:advanced:vertical

Quick-preview commands render 15 original PNG frames at 640x360 or 360x640
plus a contact sheet, not 360 frames/MP4. They use the same checked scene,
local asset manifest, fonts, and drawAdvancedFrame logic. Neither the preview
nor the source checks requires running setup-encoder.mjs or FFmpeg.

Outputs go to ignored out/preview-advanced-landscape and
out/preview-advanced-vertical. They are never overwritten. For another pass:

    node scripts/preview-advanced.mjs vertical preview-art-v2

A still-frame technical result is NOT evidence of smooth full-speed playback,
stable pacing, bitrate/codec compliance or creative approval.

## GitHub Actions budget contract

- push to main/docs and every PR: **lint + typecheck + unit tests only**.
  The existing job identifier is preserved to avoid silently bypassing
  an existing required status check.
- Concurrent PR runs on the same PR cancel stale unfinished runs.
- The existing 1080p H.264 smoke, editorial and advanced renders, FFmpeg
  provisioning and 7-day uploaded artifacts run ONLY when a person uses
  workflow_dispatch and sets confirm_full_render to true.
- Default for confirm_full_render is false; no automatic full renders on PR.
- GitHub requires the dispatch workflow to be available on the DEFAULT
  BRANCH before its updated manual controls are usable. This change is in
  a stacked Draft PR until explicitly reviewed/merged, so the new manual
  dispatch UI cannot be assumed active yet. Do not merge merely to enable it.
- Do not mistake a skipped render step plus green unit tests for a passed
  full video regression.
- The repository currently has no verified branch-protection policy.
  Keep required check governance a separate explicit step.

## Jules task template

Choose repository rayray12zx3-sys/ai-motion-studio and the exact current
feature branch for the work; not main, not either other video repository.

Perform the requested creative refactor only within this repository.
Preserve existing legacy 6-second renderer, deterministic offline input
boundaries, pinned dependencies and previously reviewed visual behavior.
Use Node 24 and the commands above for tests and 15-frame portrait/landscape
previews. Output ignored synthetic contact sheets, list changed paths and
observed frame numbers, and report test failures precisely. Do not install
paid dependencies, fetch remote production assets, commit output renders,
trigger Actions or publish a new PR for every tiny adjustment. Offer a Draft
PR only after the user has a review-worthy candidate. Maintain creative_qc
PENDING_HUMAN_REVIEW and no production approval.

The Jules Issue integration is confirmed but Jules sessions are not directly
readable in this conversation. The official Jules task link is separate; only
GitHub-published artifacts or comments can be inspected here.
