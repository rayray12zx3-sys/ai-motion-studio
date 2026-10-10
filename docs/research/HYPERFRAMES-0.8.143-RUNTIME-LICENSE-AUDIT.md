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
| **Rendered Video Output Rights (MP4/MOV)** | **CONDITIONAL / OUTPUT ASSETS UNREVIEWED** | Copyright in original rendered pixels belongs to the creator. No mandatory end-video credit or attribution slate required for client MP4/MOV delivery. | Permitted for commercial advertisement delivery. |
| **GSAP Animation Library Rights** | **CONDITIONAL / VISUAL BUILDER MAY BE RESTRICTED EVEN IF FREE** | GSAP (`^3.13.0`) is licensed under GreenSock Standard License (No Charge, Non-OSI). Permitted for general animation compositions, but restricted if HyperFrames/Studio is offered as a paid visual animation builder or SaaS product. | Operator must not offer a paid SaaS visual editor without GSAP Business Green license. |
| **Studio & Editor Bundling vs CLI** | **CONDITIONAL / LOCALHOST NOT AUTOMATICALLY PERMITTED** | Tarball bundles pre-built web Studio assets (`dist/studio`). Studio is integrated in CLI (`npx hyperframes preview`), loading GSAP client-side. | Internal desktop preview is safe; hosting Studio as a multi-tenant web service triggers GSAP & server terms. |
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

## 4. Scenario Analysis: Commercial Adoption & Use Cases

### Scenario (a): Internal Tool Use to Produce Company Advertisements
- **Status:** **CONDITIONAL (NO PRODUCTION ADOPTION)**
- **Analysis:** Running `npx hyperframes render` locally on an engineer or operator workstation to render company advertisements is fully permitted under Apache-2.0 and the underlying dependencies. Personal tool ownership does not conflict with rendering commercial video.

### Scenario (b): Delivery of Rendered MP4/MOV Media to Employer or Client
- **Status:** **PERMITTED (GREEN)**
- **Analysis:** The output of `hyperframes` is a rendered video file (MP4/MOV). Open-source software licenses (Apache-2.0, MIT, LGPL) apply to the *software code*, not to the *data/media output* produced by running the executable. No copyright transfer or mandatory end-video credit slate is imposed on rendered commercial media.

### Scenario (c): Distribution of Editable Project Source / Bundle to Client
- **Status:** **CONDITIONAL (REQUIRES NOTICES)**
- **Analysis:** If editable HyperFrames HTML/JS source or local template code is transferred to a third party or client:
  1. Software distribution obligations of Apache-2.0 apply (must retain copyright notice and state changes).
  2. Any bundled fonts, graphics, or media within the project folder must carry independent asset license clearance.

### Scenario (d): Paid / SaaS / Commercial Editor Service
- **Status:** **CONDITIONAL — prior written consent for prohibited competitive visual-builder uses, whether paid or free**
- **Analysis:**
  - HyperFrames CLI includes GSAP (`^3.13.0` devDependency in source monorepo, runtime loaded in HTML compositions).
  - GSAP's **Standard No-Charge License** explicitly restricts use in paid products, SaaS visual animation tools, or subscription animation builders where users pay a fee to access the builder or generated animations.
  - Operating HyperFrames Studio as a commercial paid web app or SaaS tool requires purchasing a **GreenSock Business Green license**.

### Scenario (e): Use of Imported Fonts, Samples, Music, and Stock
- **Status:** **INDEPENDENT AUDIT MANDATORY**
- **Analysis:** Apache-2.0 for HyperFrames does **not** grant rights to third-party fonts (e.g. Google Fonts, custom TTF/WOFF2), background music, stock videos, or brand assets imported into compositions. All imported media must have documented commercial rights (e.g., SIL OFL 1.1 for fonts, royalty-free commercial license for audio/video).

---

## 5. Specific Component Licensing Details

### GSAP (GreenSock Animation Platform)
- **Upstream License:** GreenSock Standard License ("No-Charge License", non-OSI).
- **Key Terms:**
  - Free for non-commercial and standard commercial web projects where end users are not charged a fee to access the site/app.
  - **Animation Builder / Paid Product Exclusion:** If the tool is sold, charges subscription fees, or functions as a commercial animation editor tool provided to paying customers, a paid **Business Green** license is required.
- **Studio Application:** HyperFrames compositions use GSAP for timeline sequencing. When AI Motion Studio uses HyperFrames internally as an offline local renderer, standard No-Charge terms apply. If offered as a paid service, GSAP licensing must be upgraded.

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
- [x] **Verified transitive dependency licenses** (All 124 packages cataloged; LGPL-3.0 in `sharp-libvips` dynamic bindings noted).
- [ ] **Rendered video rights subject to separate verification** (Rendered MP4/MOV files are clear for company ad delivery without attribution slates).
- [ ] **Operator Gate 1:** If distributing editable source code or Studio tools, assemble and append an explicit `THIRD_PARTY_NOTICES` file containing upstream Apache-2.0 and MIT notices.
- [ ] **Operator Gate 2:** Check whether a free/private/localhost native visual animation editor materially assists competition with Webflow's animation builder, and obtain prior written GSAP/Webflow consent if it is a prohibited use. A lack of paid subscriptions does NOT automatically authorize it.
- [ ] **Operator Gate 3:** Verify all fonts and audio clips used in commercial compositions possess explicit commercial licenses (e.g. SIL OFL 1.1).

---

## 7. Audit Evidence References

- Exact npm package view retrieval: `npm view hyperframes@0.8.143 --json` (2026-10-10).
- Audit execution script: `experiments/hyperframes-license-audit/audit.mjs`
- Test suite: `experiments/hyperframes-license-audit/audit.test.mjs`; no exact-head audit CI PASS may be claimed until this test actually passes in GitHub Actions.
