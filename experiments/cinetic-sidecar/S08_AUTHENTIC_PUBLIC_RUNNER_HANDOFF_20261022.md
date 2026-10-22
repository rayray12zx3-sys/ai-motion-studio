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
