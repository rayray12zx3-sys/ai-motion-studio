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
- Local validation: 24/24 fictional tests PASS (12 transport, 7 archive, 5 HTTP-handler boundary tests). HTTP-handler tests use in-memory wire requests; live localhost browser consent is a separate required acceptance check. Exact-head Linux filesystem/PID/network isolation and actual synthetic HyperFrames render PASS at `c26e33d5bab2610c283fc6b2bb338c7461c6dd9e`, Actions run [39718337661](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39718337661). Its real-s08 job is SKIPPED, not a private-render success.

## Current required gates
1. Source/HTTP safety regressions: local 24/24 PASS; exact-head offline CI and synthetic isolated engine PASS at c26e33d5 (run 39718337661).
2. Google app Production and Picker-only key: CONFIGURED. Website referrers include localhost and the official Picker iframe origin `https://docs.google.com/*`. Prior Google consent completed, but its in-memory grant expired before provisioning; no long-term grant stored. Google will not re-display the old client secret, so the operator must add a secret in Cloud and enter it directly into localhost; never paste it in chat. Then repeat same-scope consent and actual Picker selection.
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
