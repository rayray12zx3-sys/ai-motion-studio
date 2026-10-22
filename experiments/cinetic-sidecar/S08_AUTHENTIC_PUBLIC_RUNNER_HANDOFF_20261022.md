## 2026-10-23 CURRENT — privately reviewed v22u atomic-card group compositor

This is the **latest** status; all prior v22t, v22s and first-engine failure descriptions below are preserved historical evidence, not the current gate.

- Root cause of v22t's remaining card ghost: applying Canvas globalAlpha to each card shape, text layer and selection row separately, instead of drawing one complete RGBA card and then fading the **flattened group**. This creates inappropriate internal backdrop blending, unlike the earlier editorial baseline.
- New v22u **private, separately hash-pinned** source uses a genuine deterministic 95-frame Canvas composition. A transparent offscreen layer flattens the complete quiz card, rows and existing correct-response treatment; a single group alpha handles the outgoing card. Previously corrected background light, animated road and runner remain. All 20 original client assets stay private; **there are no real images, animation frames, source ZIP bytes, Drive IDs, user account secrets or token data in this public branch or Actions artifacts**.
- Protected isolated Linux job [#39817250398](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39817250398) **SUCCESS** using pinned real HyperFrames 0.8.143. ZIP+manifest verification, full 95-frame H.264 540x960 30fps decode, private Drive upload and SHA256 readback all passed; all original privately reviewed baselines remain intact.
- Independent *locally decoded* representative A/B testing, fixed 16 transition frames and identical RGB ROIs against the earlier editorial baseline:
  - first true HF: card/road/full MAE **12.628 / 6.338 / 10.952**
  - v22s: **12.593 / 2.262 / 6.866**
  - v22t: **12.634 / 2.264 / 6.873**
  - v22u: **7.807 / 2.262 / 5.294** (card disparity 38.2% lower than v22t).
- A new stdlib-only, local-files-only `s08_visual_parity_gate.py` + fictional regressions implements a **non-art-approval numeric gate** on the same 16 frames: card <=10, road <=3, full <=7. Previously released v22t fails this metric; v22u passes. The owner-only v22u protected Actions route now runs this comparison before private media upload for future requests. This never grants `USER_ART_APPROVED` or pretends the full upstream Cinetic agent system is executed.
- Independent private QA report, receipt, 95 decoded frames and visual comparisons are recorded **ONLY** in the existing sole private Drive CURRENT; never paste their source identifiers into public repository docs.
- **Remaining gates:** actual full-speed owner art sign-off, user-device 1x viewing, surrounding-ad editorial/sound sync, Windows Premiere import/export, remaining dependency/font/codec usage and full commercial-license review; no main merge. The user's creative intent is a fast in-ad APP insert, *not* a self-contained readable lesson.

---
## Editorial purpose confirmed — 2026-10-22: fast APP-operation insert

**USER-CONFIRMED creative intent:** S08 is a short, fast-moving APP-operation insert *within a longer advertisement*, not a standalone teaching segment or a long-form product demo intended for viewers to read every answer option.

- Retain the genuine, already technical-QA-passed HyperFrames **95f / 30 fps / approximately 3.17s** private baseline as the candidate insert. Do **not** lengthen simply to make all choices fully readable; do not overwrite that verified original or start additional rendering merely for readability.
- In-context visual acceptance targets: unmistakable phone APP multiple-choice interaction, answer selection and correct-feedback/Next cadence twice, followed by the unanswered third question; recognizable original APP/runner, adequate contrast and safe-area framing, no misleading implication that the third answer was completed, and clear cuts/audio sync into surrounding advertisement.
- Earlier concerns about *full reading time* no longer block this **specific fast-insert use case**. Any concern about whether the APP action remains perceptible at native phone viewing size is still a valid editorial QA issue.
- Creative-intent confirmation **does not equal** approval of this exact visual output, legal rights, or Windows Premiere integration. Keep `TECH_RENDER_PASS / DRIVE_READBACK_PASS / EDITORIAL_FAST_INSERT_CONFIRMED / USER_ART_PENDING / PREMIERE_NOT_TESTED`. Avoid merging Draft PR or modifying main; retain all proprietary media and private QA exclusively in Drive CURRENT.

---

## 2026-10-22 follow-up — independent private QA filed; art/PR gate not approved

- The independent technical/visual QA report has now been **uploaded and read back in the existing restricted private S08 output folder**. It records a full 95-frame decode, independently recomputed private media hashes, 29 representative sequence frames, 12 detailed frames, two success/Next states and the deliberately unanswered third question. The private filenames, direct URLs, media hashes, app screenshots and source materials are restricted to Google Drive CURRENT; **do not mirror them to this public repository**.
- Technical evidence from real HyperFrames 0.8.143 and private Drive readback remains **PASS** (unchanged). No fresh rerender, paid service, OAuth request, source edit or branch merge occurred in this follow-up.
- **Next acceptance gate is editorial, not an authorization retry:** decide whether the 95f/30fps sequence is intentionally a fast ≈3.17s insert within a longer ad, or should instead support reading multiple-choice content. If readability is required, create a *separately versioned*, longer revision using the existing private source and request an independent comparison; never overwrite the verified 95f baseline.
- Mandatory outstanding checks before any final production claim: owner visual approval of the exact private output, Windows Premiere Pro import/playback, commercial-rights review and whole-ad pacing/audio review. Until then mark `TECH_RENDER_PASS / DRIVE_READBACK_PASS / USER_ART_PENDING / PREMIERE_NOT_TESTED`.

---

# 2026-10-22 S08 authentic 95f HyperFrames isolated render — TECHNICAL PASS, art approval pending

This section supersedes the preceding PENDING_FILE_GRANT/no-render status. **No confidential source, output frame, real media SHA, Drive media ID, browser credentials, or Google OAuth tokens are published in this repository.** Exact private receipt/QA links and source SHA are retained in the authorized **private Google Drive S08 CURRENT** only.

- The pre-existing protected Production OAuth `drive.file` grant **was not broadened, re-entered or exported**. The `S08_DRIVE_CONFIG_JSON` secret remains deliberately marked `PENDING_FILE_GRANT` for the original direct-Picker path; the original media bridge still rejects this pending wrapper.
- The new separate `s08_app_owned_stage.py` creates an *empty* app-authorized private input and empty private output folder using the official `drive.file` app-created-file permission. The actual operator-authorized Drive connector privately wrote the exact archive bytes into the app-created input without modifying the original, and moved the app-created folder under the approved private S08 destination. No media travelled through public GitHub source, commits, PR content, issue comments, logs or artifacts.
- `s08_app_render_bridge.py` resolves only these **app-created** exact-name items, requires the correct protected private-parent relationship, exact input size, downloadable input, writable non-public output, then delegates to the unchanged content-SHA-checked private media bridge *in-process only*. No protected credentials are persisted to public workflow variables. Owner-only `S08_APP_RENDER:` is a request-only commit, and the private asset job executes without network access inside the established non-root isolate.
- [Runner #39785466087](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39785466087): private empty staging creation + permission check SUCCESS. [Runner #39786877317](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39786877317): scoped metadata after Drive moves SUCCESS. [Runner #39787329052](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39787329052): **authentic S08 `app-owned-real-s08` SUCCESS**, including pinned source-archive SHA, actual HyperFrames@0.8.143 engine, 540×960 / 30fps / H.264 / 95 decoded frames, direct private Drive upload and independent cloud readback-SHA verification. New offline regression gate **53/53 PASS**.
- The owner-authorized private Drive CURRENT includes exact MP4/GIF/95-frame ZIP/receipt IDs and separate independent frame contacts and limitations. No GitHub artifact was uploaded for the proprietary render. Root `main` unchanged; this PR remains Draft; no private repository or paid service was created.

**Do not overstate acceptance.** The real S08 animated APP sequence shows two correct-answer/Next states followed by a third unanswered question. User art approval, premium style, full-ad timing, commercial-rights review and Windows Premiere remain pending. The MP4 is explicitly **UNAPPROVED** until the owner reviews that exact private artifact. The 3.17-second clip may be too short for first-time viewers to read both multiple-choice questions.

---

## 2026-10-22 live OAuth milestone — refresh verified, exact file grants blocked

- After the operator's single official client-creation action and explicit permission to transfer credentials, Google authorization-code exchange succeeded. The user did not refill credentials. The exact drive.file offline grant is now encrypted in the existing s08-ephemeral-media environment secret S08_DRIVE_CONFIG_JSON.
- Because the official docs.google.com Picker iframe remained a complete but empty document (both fixed-file and ordinary known-folder views), selection was NOT fabricated. The grant was preserved only as {status: PENDING_FILE_GRANT, protected_oauth_config: ...}. This wrapper is deliberately rejected by the ordinary media bridge. The existing /finish per-file metadata preflight remains mandatory; no ready grant was exported.
- Live owner-only metadata probe [39782440325](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39782440325), request commit b8a56b62e12f0760b0d2f77a8f5ab413440c5dd6: OAUTH_REFRESH_PASS; SOURCE_METADATA_ACCESS_BLOCKED; DESTINATION_METADATA_ACCESS_BLOCKED; MEDIA_NOT_ACCESSED_GRANT_NOT_PROMOTED. Probe exit 3 / FAILURE is expected evidence of a blocked file grant, NOT overall success. Offline-code-test and isolated synthetic engine-preflight succeeded; real-s08 SKIPPED.
- Source commit 9099e2b1e53d8c493df8cbbc35e7bc5a0e39608b adds stale/duplicate callback handling, an ordinary known-folder Picker entry, pending-grant preservation, and a metadata-only owner probe. 42/42 fictional tests pass, including refusal to use the pending wrapper for media access and no private error/URL/credential output.
- The metadata probe requires a separate owner push changing ONLY s08_render_request.json with action=probe and a subject beginning S08_AUTH_PROBE:. It uses the same exact branch/environment restriction. It cannot download/upload media, promote the grant or run on PRs.
- Authentic MP4 / private Drive media readback SHA / actual-frame Visual Design QA remain NOT_DONE. No company bytes were downloaded in this work. Do not rerun credential-entry forms, retrieve secrets from GitHub, disable browser protections, move token-bearing Picker URLs or remove per-file preflight to force completion.
- Product drift gate: goal = preserve one-time authorization and localize the real render blocker; decision = operator-approved S08 scope, Draft #140 only; proof = actual refresh from protected Runner plus blocked metadata; tools/rights = existing runtime and same scope, no paid activation/main/merge/private repo; next gate = actual exact-file grant through a working official selection flow. This remains engineering progress, not a completed film.

--- Earlier evidence retained below ---

## 2026-10-22 next-step evidence — reusable public OSS runtime, private local renderer blocked

- Added `.github/workflows/cinetic-public-hyperframes-runtime-offline-handoff.yml` for packaging **open-source-only** pinned HyperFrames 0.8.143 npm modules on the existing public Ubuntu 24.04 runner. No APP images, private source, Google credentials, private video or fonts are in this public workflow or artifact.
- Actual public [Actions run 39774514497](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39774514497) **SUCCESS**, reusable public dependency artifact 12424220770, one-day retention. Artifact archive SHA256 `077e95da318ded4019698fc2a8eb804a6a710b85620b0d78a99e9fc56ce6d590`; extracted npm package confirmed `hyperframes@0.8.143` and the real CLI launches in the local isolated environment. This resolves npm EAI_AGAIN for OSS tooling **only**.
- An offline attempt to render the genuine local S08 composition with that **actual official HyperFrames CLI**, 95 frames / 30fps / draft, compiled composition metadata and launched browser. Chromium then denied local navigation with `net::ERR_BLOCKED_BY_ADMINISTRATOR` when visiting the renderer's localhost scene endpoint. **Exit 1, no MP4, no frames**. No alternative-browser, proxy, container flag or policy workaround was attempted. Runtime availability is NOT rendered-media acceptance.
- The original private S08 scene was independently hash verified locally; `node --check scene.js`, `test_scene.cjs` (95f events) and `test_full_seek.cjs` (95 forward + 95 reverse seeks) passed. These are **scene-level** checks, not rendered media checks. Actual private input stayed off GitHub; the public artifact contains OSS dependencies only.
- Therefore the remaining supported path is the existing GitHub-hosted Linux true-engine job, which has already rendered **fictional** inputs, after a safe authorized transport from private Drive. Its `s08-ephemeral-media` Google environment secret remains unconfigured; a connected Drive login cannot silently be reused as the Runner OAuth credential. Do not restart repeated credential-entry form or extract secrets against prior security controls. **Real S08 private MP4 and Visual QA remain NOT_DONE.**

## 2026-10-22 current — pre-secret per-file grant preflight

- `s08_oauth_bootstrap.py` now verifies both exact Picker selections via **metadata-only** Drive `files.get` using the scoped in-memory access token **before** exporting the protected environment secret. The existing S08 source ZIP must be exactly `application/zip` of the pinned source size, not trashed and downloadable; the destination must be a writable, non-public Drive folder. Source media are never downloaded by the bootstrap.
- If Google denies either metadata query, the local helper fails closed with the fixed stage `PICKER_GRANT_PREFLIGHT` instead of exporting a nonfunctional grant or echoing server errors. No new credential prompt or bypass of previously blocked Cloud-secret extraction was created.
- Three fictional preflight regressions plus existing 32 tests: **35/35 PASS**, [GitHub Actions #39769639639](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39769639639), commit `87bb60edd8f507376915c1bcab790a44fc867f8f`. The engine-preflight and real-S08 jobs in that PR-triggered run are **SKIPPED**.
- Remaining irreducible gate: real authorization-code exchange was not completed and no Google OAuth offline grant is stored in GitHub environment secrets; no authentic S08 HyperFrames MP4 or Drive round-trip QA exists. Do not ask the user to refill the previous failed form; identify a safe, owner-approved live authorization channel first.

# S08 offline authorization integration update — 2026-10-22

This section supersedes the short-lived-token and generic commit-marker instructions below.
**Engineering implementation only; actual private S08 render remains NOT_RENDERED until a verified run and private Drive readback exist.**

- `S08_DRIVE_CONFIG_JSON` must be an **environment secret** on `s08-ephemeral-media`, never a repository secret. New config requires `auth_mode=oauth_refresh`, `scope=https://www.googleapis.com/auth/drive.file`, `publishing_status=production`, `client_id`, `client_secret`, `refresh_token`, `source_file_id`, `destination_folder_id`. Do not publish values or private IDs.
- One initial Google consent plus Picker selection grants the exact archive and destination folder. `s08_oauth_bootstrap.py` runs only on localhost:8765, with a fixed callback, state, PKCE, POST Origin/CSRF checks, Host check, disabled access logs, no-store and one-hour process lifetime. It keeps credentials only in memory and downloads no private media. Its copy button is solely for the protected environment-secret UI. Stop it after provisioning and clear the clipboard.
- External OAuth Testing grants expire after seven days for Drive; configure the personal app as Production before consent. The helper rejects explicitly time-limited refresh grants. The publishing-status config is an operator attestation, not an API proof. Revocation, inactivity, token limits and policy can still require reauthorization: this is not an eternal grant.
- GitHub OIDC/WIF is preferred when an organizational Shared Drive is available. It does not by itself authorize a personal user's Drive, and service accounts cannot own/upload new files into ordinary personal My Drive storage. Do not create paid Workspace, enable billing, or use domain-wide delegation for this personal-folder workflow.
- All actions use the exact experimental branch. PR events have only fictional tests. Ordinary source pushes run fictional tests plus a real synthetic engine/network-namespace preflight; they cannot request private rendering.
- Since the workflow is not on main, the UI Run workflow button may be unavailable. The bounded fallback is a **separate owner push**, changing **only** `s08_render_request.json`, setting action to render and incrementing sequence above zero, with commit subject starting `S08_RENDER_REQUEST:`. Exact repository, ref and numeric owner actor ID are required. A combined source-change/render-request push is rejected before secrets are referenced. The environment must allow only this exact branch and zero tags.
- HyperFrames and all transitive dependencies use the isolated runtime lockfile. Installation and synthetic browser warmup happen before private input. Private source tests and engine execute with an empty environment, no new privileges, isolated process/network namespaces, and read-only host filesystem; only the dedicated private temporary directory is writable. If namespace/engine preflight fails, no private input is fetched. Private render logs are never printed/uploaded. MP4 profile/full decode and Drive byte SHA readback remain mandatory.
- Local validation: 28/28 fictional tests PASS (12 transport, 7 archive, 9 HTTP-handler boundary tests). HTTP-handler tests use in-memory wire requests; live localhost browser consent is a separate required acceptance check. Exact-head Linux filesystem/PID/network isolation and actual synthetic HyperFrames render PASS at `c26e33d5bab2610c283fc6b2bb338c7461c6dd9e`, Actions run [39718337661](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39718337661). Its real-s08 job is SKIPPED, not a private-render success.

Operator checkpoint: the user rejected repeated manual credential refills. The empty bootstrap service and its form are now closed; do not restart the refill loop. Offline coverage now exercises the complete fictional consent/Picker/export flow and rejects time-limited grants, in addition to error redaction and memory-only retry. This is not a live Google authorization proof. Actual OAuth exchange remains blocked and its exact reason is unverified. Do not request another credential entry merely to discover the next implementation defect.

## Current required gates
1. Source/HTTP safety regressions: local 28/28 PASS; exact-head offline CI and synthetic isolated engine PASS at c26e33d5 (run 39718337661).
2. Google app Production and Picker-only key: CONFIGURED. Website referrers include localhost and the official Picker iframe origin `https://docs.google.com/*`. Prior Google consent completed, but its in-memory grant expired before provisioning; no long-term grant stored. Google will not re-display the old client secret, so the operator must add a secret in Cloud and enter it directly into localhost; never paste it in chat. The current consent attempt reached Google but the local exchange was rejected; exact cause was hidden by the old generic handler. The helper now reports only allowlisted OAuth error names or fixed stages, redirects away from callback query strings, and supports same-memory retry with fresh state/PKCE. Current exchange and Picker selection remain unverified.
3. Environment branch restriction: configured through GitHub UI; secret still absent.
4. Actual private 95f H264 output / private Drive SHA readback: NOT_DONE.
5. Full-speed/framewise Visual Design QA on the actual output: NOT_DONE; user art and Premiere remain separate.

Product drift gate: goal is removing the repeated authorization blocker for real animation production; source is the operator's explicit scoped S08 request and Draft #140. Deliverables are bounded engineering until actual media exists. No root renderer/package changes, new Director/Art agents, main changes or merge; paid services forbidden. Next action is complete real consent, validate synthetic Linux isolation, then render/read back/review the actual private output.

--- Historical implementation below ---

# S08 real private APP assets in public GitHub Actions — implementation status

**Status (2026-10-22): code installed and synthetic-only workflow gates PASS; real S08 has not yet been rendered.** This is not a public-media license or user art approval.

## Existing implementation
- Source integrity and safe extract: `s08_ephemeral_archive_gate.py`. Validates exact archive SHA-256, per-asset SHA, 95f / 30fps / 540x960, HTML composition and rejects ZIP traversal. The repository contains **no** APP source bytes.
- Protected Drive API transport: `s08_drive_bridge.py`. Downloads binary only to temporary Actions storage; writes final MP4 and technical JSON back to the private destination, re-downloads to verify SHA-256, and logs **no tokens, Drive IDs, signed URLs, raw MP4, PNG or source content**.
- GitHub-hosted Ubuntu 24.04 workflow: `.github/workflows/cinetic-s08-authentic-private-transfer.yml`. Exact `hyperframes@0.8.143`, verified npm distribution checksum; confirms new H264 540×960, 30fps, 95 decoded frames. GitHub upload-artifact is intentionally **absent** in the genuine-media job. Runs on a dedicated temporary runner; deletes working files afterward.
- Offline source-gate regressions use wholly fictional ZIPs and never require Drive access or secrets. Technical tests passing **does not** imply the actual proprietary video was rendered.

## Necessary single credential provisioning — not accessible from this ChatGPT GitHub connector
Use GitHub's own repository settings, **never PR/Issue text, workflow inputs, chat messages, a repo file or shell logs**:
`ai-motion-studio → Settings → Secrets and variables → Actions → New repository secret`.
Name: `S08_DRIVE_CONFIG_JSON`. Value is one JSON object in this shape:
```json
{"access_token":"GOOGLE_DRIVE_SHORT_LIVED_OAUTH_ACCESS_TOKEN","source_file_id":"PRIVATE_SOURCE_FILE_ID","destination_folder_id":"PRIVATE_OUTPUT_FOLDER_ID"}
```
The original file and folder IDs are already in the user's private CURRENT/Drive records; **do not paste them into a public GitHub file**. Only a short-lived, authorized OAuth access token able to read this ZIP and create files in the chosen folder may be used. Google OAuth tokens may grant broad access to the account: review consent/scope, keep the lifetime short, and revoke/clear the secret immediately after the test. **Never use a permanent password or personal login session cookie.** No new AI plan, Codex, private repository, renderer Studio or paid API is required. If this credential cannot be provisioned securely, stop, do not expose the APP data.

## Trigger and completion
The live source is on experimental branch `experiment/cinetic-director-adapter-20261018`. The protected real job can run on a workflow_dispatch event (when available), or on an explicit push commit containing `[s08-real-ci]` on the same branch and modifying the workflow or its helper code. The connected GitHub tool can commit that trigger once the secret exists; it **cannot create GitHub Actions secrets or list all push-triggered runs**. Ordinary pushes and PRs only test fictional fixtures; real media is never consumed.

After real job completion, verify actual new Drive MP4 + receipt, then review full-speed frame sequence and existing Visual Design QA, repair defects and rerun as needed before presenting to user. User did not require separate Director or Art Agents. Keep public main and approved originals unchanged; PR #140 remains Draft.

**NOT DONE:** Drive access token provisioning, actual private S08 HyperFrames render, real-video visual QA, user art approval, Windows Premiere test. No file, artifact or logs should ever misstate these.
