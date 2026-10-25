# Cinetic one-entry sidecar — 2026-10-26 implementation note

STATUS: Orchestration source and 11/11 local Node contract tests PASS. The new entrypoint has NOT yet been run end-to-end using a real HyperFrames CLI. This is a thin opt-in adapter to existing Cinetic code, not another renderer or a full upstream 273-technique Skill.

## Implementation

The cinetic-flow.mjs entrypoint invokes existing adapter.mjs, prepare-render.mjs, local SHA-pinned HyperFrames@0.8.143 CLI, and existing verify-render.mjs, in that order. A flow receipt is created only if true MP4 and ProRes4444 alpha MOV renders and the real decoder-based QA pass.

The CLI requires a PUBLIC-SYNTHETIC input plan with explicit engine selection, a new output directory, and --render plus the absolute local executable and SHA fingerprint. The default user Canvas/Pillow routes remain unchanged. No npx, auto-install, GitHub Actions, network/upload, private company APP media, upstream scripts or auto-art approval.

## Commands, from repository root

Run isolated tests:

    node --test experiments/cinetic-sidecar/cinetic-flow.test.mjs

Prepare only, in a new directory, once root-locked font dependencies already exist:

    node experiments/cinetic-sidecar/cinetic-flow.mjs experiments/cinetic-sidecar/probe.plan.json out/cinetic-one --prepare-only

Real engine attempt, only on a separately authorized host with audited local hyperframes@0.8.143:

    node experiments/cinetic-sidecar/cinetic-flow.mjs experiments/cinetic-sidecar/probe.plan.json out/cinetic-one-real --render --hf /ABS/PATH/hyperframes/cli.js --hf-sha FULL_64_HEX_LOCAL_ENTRYPOINT_SHA256

The binary path must be real and SHA-pinned. That hash alone does NOT prove official npm tarball provenance or license closure; keep the existing C0 audit. No Browser policy bypass.

## Evidence and blockers

Previously completed REAL HyperFrames outputs: synthetic C2 16:9/9:16 MP4+Alpha, C3 synthetic frames and private S08 v22u protected 95f success. None was produced using this NEW one-command wrapper. New local tests: 11/11 PASS (routing, explicit permissions, no overwrites, CLI SHA, public source guard, no auto approval). This container cannot run the audited local HF 0.8.143+font runtime; therefore new end-to-end REAL_ENGINE_WITH_THIS_ENTRYPOINT is NOT_VERIFIED.

The parent R&D branch and Draft PR #140 are not merged. This new branch name deliberately avoids existing push-triggered render workflow patterns. No actions or paid jobs run. C0 commercial license, C3 art/normal-speed quality, C4 Windows Premiere and user art acceptance remain BLOCKED.
