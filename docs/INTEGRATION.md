# Future integration with ai-video-template-v2

## Current stance

This repository is intentionally separate from `ai-video-template-v2`.

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
5. Move only the stable subset into `ai-video-template-v2`.

## Integration criteria

A module should only move when it is:

- visually validated
- deterministic
- reusable
- not tightly coupled to experiments
- documented
- compatible with the target render/export pipeline
