---
title: S08 Private Render Transfer privacy
---

# Privacy notice

S08 Private Render Transfer is for the operator's personal workflow. It requests
Google Drive `drive.file` access only to files explicitly selected through Google
Picker and files created by this application. It does not request full-Drive,
Gmail, passwords, or domain-wide delegation.

The local consent helper keeps credentials in memory. Only the operator's protected
GitHub Actions environment stores the offline grant. Revoke access through Google
Account third-party connections and delete the environment secret to stop future runs.
Refresh tokens may be revoked or expire under Google's policies.

Private input, animation frames, rendered video, and technical QA are processed
temporarily on an authorized GitHub-hosted Linux runner. They are not committed to
Git, printed in public logs, or uploaded as GitHub artifacts. Outputs are sent to
the operator-selected private Drive folder, read back for SHA-256 verification,
and removed from the temporary runner. The operator controls Drive file retention.

This informational website receives no OAuth callbacks, credentials, or private
media. Data is not sold, used for advertising, or sent to model providers. Google
and GitHub provide storage and execution under their applicable policies.

For support, contact the repository owner via
[GitHub](https://github.com/rayray12zx3-sys/ai-motion-studio) without including
credentials, private Drive identifiers or media.
