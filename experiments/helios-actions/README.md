# Helios — isolated GitHub Actions technical test

**Scope:** research branch only. It does not replace the approved Canvas+FFmpeg production renderer, touch the Konva editor, or alter the root dependency graph.

- Three original *synthetic* Traditional Chinese animated titles; no real company copy or third-party media.
- The runner installs the version-pinned Helios renderer in its temporary directory. Existing pinned @fontsource/noto-sans-tc supplies actual Traditional Chinese glyphs.
- Tests deterministic forward/reverse seek, runs the genuine Helios Renderer, creates lossless transparent intermediate, transcodes to ProRes 4444, checks ffprobe codec/profile/frame count and decoded alpha extremes.
- CI synthetic artifact is ephemeral; there is no automatic Google Drive upload, persistent queue, or ChatGPT workflow-dispatch integration here. Those need a private data boundary and separate connector credentials.
- **Art quality, exact Premiere import, company-media rights and Helios production adoption are not approved by codec-level PASS.**
- Helios core is Elastic License 2.0 (ELv2), not the plugin/skill's Apache-2.0. Check actual usage before adopting it as a hosted commercial service.

Trigger: push to experiment/helios-actions-synthetic-20261015. workflow_dispatch is available after a workflow is on the default branch and separately approved.

Proof: look at the exact SHA workflow run and its acceptance.json artifact. A failed workflow means the engine has NOT passed; do not claim it passed because the prior Chromium/FFmpeg PoC was green.

**Product drift checklist:** The goal is to test a private cloud-capable rendering alternative for conversation-directed professional motion; the permitted scope is synthetic R&D, not a renderer swap or visual approval. This branch does not alter main or frozen artistic work. User review is still needed before any engine/adoption decision.
