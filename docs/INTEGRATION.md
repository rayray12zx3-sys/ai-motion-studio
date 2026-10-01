# Future integration with ai-video-template

## Current stance

This repository is intentionally separate from `ai-video-template`.

The future goal is **selective extraction**, not wholesale merging.

## Candidates for later integration

- reusable animation primitives
- title-card presets
- logo-reveal modules
- motion typography helpers
- infographic scene patterns
- render/export conventions

## Keep independent for now

- experimental compositions
- unfinished Three.js scenes
- high-risk visual prototypes
- one-off AI-generated motion experiments

## Recommended path

1. Validate a scene in `ai-motion-studio`.
2. Refactor it into portable components.
3. Define a small prop / scene contract.
4. Verify deterministic rendering and maintainability.
5. Move only the stable subset into `ai-video-template`.

## Integration criteria

A module should only move when it is:

- visually validated
- deterministic
- reusable
- not tightly coupled to experiments
- documented
- compatible with the target render/export pipeline


## External asset handoff before direct integration

Until direct integration exists, production projects should treat `ai-motion-studio` as an external execution subsystem. A rendered motion asset handed back to `ai-video-template` should carry at least:

- stable asset / scene / composition identity
- source repository and exact commit SHA
- input dependency identities
- render width / height / fps
- duration and/or frame count
- codec / container
- SHA-256 of the materialized output
- durable asset locator outside the public repository
- render command or preset version
- QC and approval status

For vertical social-video delivery, the reusable target profile is **1080×1920, 30 fps, MP4**. Exact platform-safe-area overlays remain project-private production references and must not be committed to this public repository unless they are independently safe to publish.
