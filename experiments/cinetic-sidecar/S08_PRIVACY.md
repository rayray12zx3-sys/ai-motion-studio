# S08 Private Render Transfer privacy notice

This is a personal, operator-controlled experimental video-rendering integration,
not a public file-processing service. It uses Google Drive `drive.file` access to
read only an explicitly selected input archive and create unapproved rendered video
and QA files in an explicitly selected private folder. It does not request whole-Drive
access, Gmail access, account passwords, or domain-wide delegation.

The local consent tool keeps OAuth credentials in memory and does not download media.
The operator may provision the offline grant only into the `s08-ephemeral-media`
GitHub environment secret. The grant can be revoked in Google Account third-party
connections; deleting the environment secret disables future automated transfers.
Refresh tokens are not guaranteed permanent: user revocation, security policy,
inactivity or Google token limits can require a new consent.

During an authorized manual run on the designated experimental branch, source and
rendered media exist temporarily on a GitHub-hosted Linux runner. They are not
committed to Git, included in public job logs, or uploaded as GitHub artifacts.
Outputs are sent to the selected private Google Drive folder and downloaded again
by the runner to verify SHA-256. Temporary media and private render diagnostics are
removed at job completion; no customer media is used for advertising or model training.

Google and GitHub process data under their own applicable policies. The operator
controls retention of the original and output files in Drive, and may delete them
there. Public repository discussions must contain only nonsensitive aggregate status.
Report implementation issues through this repository without attaching private
files, Drive IDs, credentials, or private content.

This notice describes the intended bounded workflow. Actual deployment and render
status must be checked against exact-commit CI and the private CURRENT record.
