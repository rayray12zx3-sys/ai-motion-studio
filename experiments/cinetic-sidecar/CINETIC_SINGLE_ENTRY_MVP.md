## 2026-10-26 CURRENT — 60fps TRUE HF PASS + official pinned 273 Cinetic technique selector

Actual real HyperFrames from the EXISTING single Cinetic entrypoint at [public CI #40223006027](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40223006027) PASS in four profiles: 2s 24fps landscape, 2s 24fps portrait, 8s 30fps landscape and 8s 60fps landscape. Each produced real H264 MP4 plus actual ProRes4444 alpha MOV and decoded QA. The true 8s 60fps storyboard had 480/480 real H264 frames and 480/480 real ProRes ap4h yuva444p12le frames, 1280x720, SHA256 MP4 4a5de774c4a6afabadcdb0772834887f8ce1a1be5442bc4bfa00c5ea080ebeaf and MOV bce0069db290c71d3f02c583a3c573e9c51fffb5332d845268349b06f643654e. Downloaded the actual GH artifact, ZIP CRC PASS and independently checked codec/frame count/full video decode and hashes. Some static samples show the original storyboard device; full-speed creative art approval was NOT done.

Official upstream MIT technique library of 273 entries in 14 categories and original pick.py source are vendored in the existing project under experiments/cinetic-sidecar/upstream-cinetic (pinned upstream ecfa6605de1adb9345ce937724810dc32267d068 with license/provenance). The existing CLI now supports 'pick': node experiments/cinetic-sidecar/cinetic-flow.mjs pick experiments/cinetic-sidecar/story-eight.plan.json out/new-picker --seed 123 --energy calm. It runs the source-pinned original selector. CI #40223006027: 26 public source tests PASS/1 private optional SKIP, 10 adapter tests PASS, picker validation PASS and the 4 actual HF render profiles PASS. Chosen IDs in director-selection.json are creative PROPOSALS only, NOT yet rendered technique implementations; approval remains PENDING and commercial release BLOCKED.

Do not run unreviewed upstream scripts, implicitly import company/private assets, merge draft PR/main, overwrite approved K motion, or claim that all 273 recipes are implementations. Local Cinetic technical MVP is operational; complete upstream filmmaking system, audio, full speed external art review, matched baseline comparisons, Windows Premiere, licensing and user art remain outstanding.

# Cinetic single-entry TRUE ENGINE Technical MVP — 2026-10-26 CURRENT

**Result: C1→C2/HF real engine→MP4+ProRes4444 alpha→existing frame/alpha technical verifier: PASS IN THREE PROFILES.** User still has NOT approved new style, company media, Windows Premiere or production release. This is a scoped real sidecar with existing adapter; **not** full upstream Cinetic 273-technique installation.

## Actual NEW entrypoint results — independently re-fetched, decoded and SHA checked

- New genuine public-original-run [GitHub Actions #40216658677](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40216658677) SUCCESS on work branch SHA `4b5f40e859babbf407dd5f4e0d4f731829cb4684`. Uses Node 24, checked official HyperFrames@0.8.143 npm tarball SHA-1 `8761025aa327993c605a307ec2d9f01fe6bde047`, separate temporary exact-version CLI with entrypoint SHA, locally pinned Noto Sans TC font package, actual headless render, existing FFprobe/FFmpeg full decode and alpha QA. **Only publicly invented synthetic clips**; no client, APP, voice, private fonts or Drive data sent to public Actions.
- [2s horizontal true MP4](https://drive.google.com/file/d/1yo1l45gHKrSxck-oEHzxIr_O87ttT0Gt/view) SHA256 `1e254461a1a09d115cab52bf0a9f7e5aee160ee9f1c3cefa2693a4d924ab0057`; [genuine ProRes4444 alpha](https://drive.google.com/file/d/1bYNH1FkbatslNzrX4hotmwlA1hunyRis/view) SHA `6ff4a8fe538c2013d3dcff1c2c5378bfa6c0595392cc3056177ef2623ccd4a9e`; 1280×720 24fps, 48/48 complete decode.
- [2s portrait true MP4](https://drive.google.com/file/d/1yXGpj0wLiWun7ezeNUNvEEjbSzSJ7cfM/view) SHA256 `192ad6d94f7d7c22bdbb392cea982d929ab0a150008893fc50f5e74f5f546824`; [portrait true ProRes4444 Alpha MOV](https://drive.google.com/file/d/1wHeiEut6LpvG4gmWAtn0Z0p23mqoPgVM/view) SHA `275d80b72092548c74b8bc17dc5248e1a9624a4bcd87440788e8819c5f914122`; 720×1280 24fps, 48/48.
- [8s story MP4](https://drive.google.com/file/d/17byn87kXVSQJTet6LP23gg6zTLOhPCXf/view) SHA256 `0824916a855d93003b86f548db7129bcd152df59c6c1f7e5c0aefc2ddc3afe7c`; [8s true ProRes4444 alpha MOV](https://drive.google.com/file/d/1aFpEvSk-oeJUDSTVLy6PF3JDkielasYS/view) SHA `406e5dcddb36dc90ad8edd81a27fc37ea348ae4983ebc73c3554ea12b369fd7c`; 1280×720 30fps, 240/240.
- [Separate independent media/SHA/alpha border report](https://drive.google.com/file/d/1kj-0U5ajc-pS7bFS55QNEpgZJsLIB31U/view), [private complete evidence folder](https://drive.google.com/drive/folders/1imD64xiaBUjypukouTiFthk_kfrNoahc), [real storyboard 12 sampled frames](https://drive.google.com/file/d/1AZ1tr8FNiMpLn7xinKYZ2Oj6M06CNIYF/view).
- Existing 20/20 local tests pass with protected true historical HF v22u; public CI runs 19 PASS / 1 historical PRIVATE optional SKIP plus adapter tests. A first public CI run failed because FFmpeg setup was ordered after tests; final successful pipeline fixes it.
- Explicitly no new global Skill or competing S08 renderer, no change to approved K effects, no PR merge or main changes. Only isolated public standard hosted GitHub Actions tests; no private Actions minute usage.

## Entry / command interface (within existing repository)

```bash
node experiments/cinetic-sidecar/cinetic-flow.mjs doctor ABSOLUTE_REVIEWED_HF_ENTRYPOINT SHA256
node experiments/cinetic-sidecar/cinetic-flow.mjs audit-video EXISTING.mp4 1280 720 30 240 EXPECTED_VIDEO_SHA256
node experiments/cinetic-sidecar/cinetic-flow.mjs experiments/cinetic-sidecar/story-eight.plan.json out/new-artifact --prepare-only
node experiments/cinetic-sidecar/cinetic-flow.mjs experiments/cinetic-sidecar/story-eight.plan.json out/new-render --render --hf /abs/local/reviewed/hf-cli.js --hf-sha SHA256
```

The general assistant/agent can author the `public-synthetic` plan using upstream Cinetic pinned source as *creative reference*. Existing `adapter.mjs` normalizes text and beats; `prepare-render.mjs` materializes deterministic HTML and licensed CJK fonts; `cinetic-flow.mjs` runs actual pinned HyperFrames and existing `verify-render.mjs` verifies video/alpha. The current schema only covers four proven layout motifs and a narrow set of causal beat forms; **do not claim all upstream techniques are executables**.

## Honest remaining gates

`ENGINE_TECH_MVP=PASS`, `FULL_UPSTREAM_CINETIC_SKILL=NOT_INSTALLED`, `TECHNIQUE_273_FULL_CRAFT=NOT_IMPLEMENTED`, `60FPS_PRODUCTION=NOT_VERIFIED`, `BRANDED_CREATIVE_DESIGN=ART_PENDING`, `SOUNDTRACK=NOT_DONE`, `HUMAN_FULL_SPEED_QA=PENDING`, `WIN_PREMIERE=NOT_TESTED`, `CLIENT_COMMERCIAL_RIGHTS=PENDING`, `USER_APPROVAL=PENDING`, `PRODUCTION_RELEASE=BLOCKED`. Public sample is technically useful but visually sparse/generic and **not a premium branded commercial ad**; do not ask user to approve it as their S08 footage. C0's upstream unsafe installer paths (eval, rm -rf, postinstall) stay disabled, and exact existing company assets must never enter the public test route.

---

## Prior history (superseded by 2026-10-26 true-engine proof)

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
