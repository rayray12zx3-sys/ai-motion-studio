---
title: S08 Private Render Transfer
---

# S08 Private Render Transfer

A personal, operator-controlled integration for rendering an explicitly selected
Google Drive animation archive on a temporary Linux runner and returning the
unapproved video and QA to an explicitly selected private Drive folder.

Only `drive.file` access is requested. This is not an open upload or public
rendering service. The consent callback runs on the operator's localhost;
this informational site never receives OAuth codes, tokens, or private media.

[Privacy notice](privacy.html) ·
[Source and implementation status](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/140)

Support: contact the repository owner through GitHub without posting private media
or credentials. The experimental branch remains unmerged; actual render and art
acceptance are separate gates.
