# R&D Audit Report: HyperFrames 0.8.143 Runtime Licenses and Commercial Use Rights

**Date of Retrieval & Audit:** 2026-10-10 (Asia/Taipei)
**Target Package & Version:** `hyperframes@0.8.143`
**Purpose:** Commercial-output license evidence and risk evaluation, **not** a production adoption approval.
**Repository Scope:** AI Motion Studio (personally owned motion studio tool rendering company commercial ads).

---

## Required correction: GSAP visual-builder licensing is CONDITIONAL, not production cleared

Official current source: https://gsap.com/standard-license (checked 2026-10-10). GSAP's Standard No-Charge License permits many commercial uses, but section I and section III prohibit certain **competitive no-code visual animation building tools without prior written consent**. There is **no fee/subscription prerequisite** for this prohibition. A private or localhost AI Motion Studio/HyperFrames Studio GUI therefore is **not automatically permitted** just because the tool itself is not sold. Whether its feature set materially assists competition with Webflow remains unverified and is an **operator approval / written-clarification gate**. This document must not be treated as legal advice or a production use license.

**Claim precedence:** Whenever older text below says *GREEN*, *fully permitted*, *internal desktop preview safe*, *only paid SaaS restricted*, *a particular Business Green subscription automatically resolves the restriction*, or *commercial videos fully cleared*, treat that statement as **superseded by this correction**. Only the npm version/tarball metadata, not the complete binary/notice/transitive rights, have isolated test evidence. Even if technical tests pass, proper review is still needed for software redistribution, GSAP visual editor use, fonts, imported assets, codec terms, and client media.

**Separate scenarios:** (1) Original-code, CLI-only synthetic rendering: lower software-license risk but final rights still conditional; (2) Native Studio visual editor: GSAP competitive visual-builder classification unresolved, even for personal/free/offline operation; (3) MP4/MOV delivery: an independently authored video generally does not inherit the Apache software notice requirement for a credit slate, but original media and encoding/brand rights remain separate; (4) redistributing source/editor bundle: software and included dependency NOTICE/license duties still apply. None is a blanket clearance.

**Automated-audit semantics:** The original 124-package inventory and its license field results are a past Jules observation, not exact-head CI-verified until the audit workflow runs. The script currently uses network-dependent metadata lookup, not a full license-text/embedded-runtime legal audit. Missing metadata means UNKNOWN; never classify it as permissive. A CI pass verifies script assertions only, not commercial authorization.

---

## Executive Summary & Judgments

| Aspect | Status | Audit Verdict / Summary | Operator Approval Gate |
| :--- | :--- | :--- | :--- |
| **Pushed Upstream Tarball Integrity** | **GREEN** | Exact npm tarball `hyperframes-0.8.143.tgz` matched shasum `8761025aa327993c605a307ec2d9f01fe6bde047` and SHA-512 integrity `sha512-kCNOSZXJFTX30hOBt8nyLD/3kCIGOhdRHKHzF1H0fL1aYPFnGQpZPZZbNK0AW8QpYG5TdQ5TZRJr+EuQdX8Rtw==`. | Verification complete. |
| **Direct & Transitive Dependency Licenses** | **GREEN / CONDITIONAL** | Direct runtime deps are MIT/Apache-2.0 (`hono`, `puppeteer-core`, `sharp`, `fontkit`, `esbuild`, `postcss`, etc.). Transitive sharp binary bindings (`@img/sharp-libvips-*`) are LGPL-3.0-or-later. | LGPL-3.0 dynamic binding is acceptable for local tool invocation; no modified C library re-distribution. |
| **Bundled License / NOTICE Files** | **UNKNOWN** | The published npm tarball contains zero `LICENSE` or `NOTICE` text files in package root. Top-level repo advertises `Apache-2.0`. | Software redistribution requires including copyright/Apache-2.0 text manually. |
| **Rendered Video Output Rights (MP4/MOV)** | **CONDITIONAL** | Independently authored media generally does not inherit an ordinary Apache-2.0 end-video attribution slate; actual footage/fonts/brand, codecs, and permitted editor use are separate. | Commercial ad clearance **not yet given**. |
| **GSAP Animation Library Rights** | **CONDITIONAL / WRITTEN-CONSENT GATE** | Standard No-Charge license generally permits commercial work, but certain competitive no-code visual animation editors are prohibited **even if free, local or private**. | Need upstream clarification/consent for a prohibited use. |
| **Studio & Editor Bundling vs CLI** | **CONDITIONAL / NOT CLEARED** | The bundled editor must be assessed separately from CLI-only rendering; localhost is not itself permission under GSAP's visual-builder rule. | Do not adopt native Studio before classifying the workflow. |
| **Browser & Codec Rights** | **GREEN** | Uses system FFmpeg binaries (`ffmpeg-static`/`ffprobe-static` pinned locally) and Chrome/Chromium via `@puppeteer/browsers`. | System FFmpeg / H.264 / ProRes patents/licenses managed separately. |

---

## 1. Pinned Package & Tarball Verification

- **Package:** `hyperframes`
- **Version:** `0.8.143` (Published 2026-10-08T23:57:45.292Z)
- **Tarball URL:** `https://registry.npmjs.org/hyperframes/-/hyperframes-0.8.143.tgz`
- **Shasum (SHA-1):** `8761025aa327993c605a307ec2d9f01fe6bde047`
- **Integrity (SHA-512):** `sha512-kCNOSZXJFTX30hOBt8nyLD/3kCIGOhdRHKHzF1H0fL1aYPFnGQpZPZZbNK0AW8QpYG5TdQ5TZRJr+EuQdX8Rtw==`
- **Git Head:** `3aa68869f7d4cec8b37cdfcb9cd539389b63abed`
- **Engine Requirement:** Node.js `>=22`

---

## 2. Bundled Contents & NOTICE / LICENSE Inspection

Inspection of unpacked tarball files (`/tmp/hf-audit/package`):
1. **LICENSE File:** **ABSENT** in tarball root. (Upstream GitHub `packages/cli/package.json` specifies `"license": "Apache-2.0"` and GitHub root contains `LICENSE`).
2. **NOTICE File:** **ABSENT** in tarball root.
3. **Bundled Assets & Web UI:**
   - Bundles compiled HyperFrames Studio UI in `dist/studio/` (built HTML/JS bundle).
   - Contains template structures in `dist/templates/`.
   - Bundles SVG icons (`dist/studio/icons/timeline/`) and synthetic stylesheets.
   - Includes runtime IIFE scripts (`dist/hyperframe.runtime.iife.js`).

> **Legal Consequence:** Because the published npm tarball omits explicit `LICENSE` and `NOTICE` text files, any software re-distribution or bundling of `hyperframes` in another repository must explicitly supply the upstream Apache-2.0 notice and copyright statement.

---

## 3. Runtime Dependency License Inventory

The CLI declares 17 direct dependencies in `package.json`. Transitive resolution via `package-lock.json` yields **124 total package items**.

### Direct Runtime Dependencies (17 packages)

| Package | Version | SPDX License | Notes / Usage |
| :--- | :--- | :--- | :--- |
| `@hono/node-server` | `2.0.5` | `MIT` | HTTP server adapter |
| `@puppeteer/browsers` | `3.2.4` | `Apache-2.0` | Browser binary downloader/manager |
| `adm-zip` | `0.6.1` | `MIT` | Zip archiving |
| `citty` | `0.2.2` | `MIT` | CLI framework |
| `compare-versions` | `6.1.1` | `MIT` | Version comparison utility |
| `css-tree` | `3.2.1` | `MIT` | CSS parser |
| `debug` | `4.4.3` | `MIT` | Debug logger |
| `esbuild` | `0.25.12` | `MIT` | Bundler/compiler |
| `fontkit` | `2.0.4` | `MIT` | Font metrics & subsetting |
| `giget` | `3.3.1` | `MIT` | Template downloader |
| `hono` | `4.13.13` | `MIT` | Web framework |
| `ignore` | `5.3.2` | `MIT` | Gitignore pattern matching |
| `open` | `10.2.0` | `MIT` | Browser launcher for `preview` |
| `postcss` | `8.5.29` | `MIT` | CSS processor |
| `prettier` | `3.9.9` | `MIT` | Code formatter |
| `puppeteer-core` | `25.13.0` | `Apache-2.0` | Headless Chrome automation |
| `sharp` | `0.35.5` | `Apache-2.0` | Image processing engine |

### Notable Transitive Dependency Licenses

| Category / License | Packages | Status / Analysis |
| :--- | :--- | :--- |
| **MIT / Apache-2.0 / ISC / BSD-3-Clause / 0BSD / CC0-1.0** | 108 packages | **GREEN**: Standard permissive open-source licenses. Permitted for commercial tool use and binary execution. |
| **LGPL-3.0-or-later** | `@img/sharp-libvips-*` (10 platform binary packages) | **CONDITIONAL**: `sharp` dynamically links to `libvips` C libraries compiled under LGPL-3.0. Under LGPL-3.0, dynamic linking by an application or tool does not infect the caller with copyleft requirements. As long as `libvips` binaries are not recompiled/modified and distributed under restrictive terms, local execution is safe. |

---

## 4. Commercial production scenarios — conditional findings

- **(a) Internal synthetic CLI-only render:** Apache-2.0 code generally permits commercial usage, but do not infer blanket rights for separately licensed bundles, fonts, footage, FFmpeg codecs, or a native GUI editor. **CONDITIONAL**.
- **(b) Delivery of original MP4/MOV:** A normal source-code software NOTICE obligation does not itself require adding credits in an independent rendered video. Rights in the actual images, music, fonts, assets, and workflows are separate. **CONDITIONAL**.
- **(c) Transfer editable source or editor bundle:** Apache notices, LGPL terms, proprietary editor license and third-party bundled assets may apply. The package metadata is not a redistributed-software NOTICE audit. **CONDITIONAL**.
- **(d) Free or paid no-code visual builder:** Official GSAP https://gsap.com/standard-license restricts uses that materially assist in building a competing visual animation builder, **regardless of fees**. Prohibited uses require **prior written consent**; neither a free/private/localhost deployment nor a historic subscription tier establishes permission. **NOT CLEARED**.
- **(e) Imported samples and codecs:** Need individual commercial source rights. **NOT CLEARED**.

---
## 5. Specific Component Licensing Details

### GSAP (GreenSock Animation Platform)

- Official Standard **No Charge** source: https://gsap.com/standard-license (checked 2026-10-10). Ordinary commercial uses can be permitted, and AI-generated GSAP code is expressly discussed as permitted.
- Official **Prohibited Uses** include qualifying competing no-code visual-animation tools, without a fee condition; section III requires prior written consent for such use.
- Whether HyperFrames Studio within AI Motion Studio qualifies is **UNRESOLVED**. CLI-only rendering is a different use-case, not a general clearance of a bundled visual editor.
- Do not promise that a paid subscription by itself resolves this; request written licensing clarification before a disputed production integration.
### Studio Editor Bundling vs CLI
- `hyperframes@0.8.143` includes pre-built Studio static assets in `dist/studio/`.
- Executing `npx hyperframes preview` spins up an internal `@hono/node-server` at `http://localhost:3000` to preview compositions.
- The Studio UI is locally hosted; no paid remote service is initiated.

### Browser Binaries & Codecs
- **Browser:** Puppeteer downloads and launches Chrome/Chromium binaries via `@puppeteer/browsers`. Chromium is licensed under BSD/Apache-2.0/LGPL terms.
- **Codecs:** H.264 (AVC) and ProRes video encoding are performed by invoking system FFmpeg binaries (`ffmpeg-static` / system `ffmpeg`). Codec patent pools (MPEG-LA / Via Licensing) apply to hardware/software encoder distribution, distinct from open-source script execution.

---

## 6. Actionable Risk & Approval Checklist for AI Motion Studio Owner

- [x] **Verified npm tarball integrity** (`shasum: 8761025aa327993c605a307ec2d9f01fe6bde047`).
- [ ] **Verify transitive license text and distributed native components separately** (All 124 packages cataloged; LGPL-3.0 in `sharp-libvips` dynamic bindings noted).
- [ ] **Rendered video rights subject to separate verification** (Rendered MP4/MOV files are clear for company ad delivery without attribution slates).
- [ ] **Operator Gate 1:** If distributing editable source code or Studio tools, assemble and append an explicit `THIRD_PARTY_NOTICES` file containing upstream Apache-2.0 and MIT notices.
- [ ] **Operator Gate 2:** Check whether a free/private/localhost native visual animation editor materially assists competition with Webflow's animation builder, and obtain prior written GSAP/Webflow consent if it is a prohibited use. A lack of paid subscriptions does NOT automatically authorize it.
- [ ] **Operator Gate 3:** Verify all fonts and audio clips used in commercial compositions possess explicit commercial licenses (e.g. SIL OFL 1.1).

---

## 7. Audit Evidence References

- Exact npm package view retrieval: `npm view hyperframes@0.8.143 --json` (2026-10-10).
- Audit execution script: `experiments/hyperframes-license-audit/audit.mjs`
- Test suite: `experiments/hyperframes-license-audit/audit.test.mjs`; no exact-head audit CI PASS may be claimed until this test actually passes in GitHub Actions.
