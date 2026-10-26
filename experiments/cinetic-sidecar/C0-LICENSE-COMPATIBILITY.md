## 2026-10-26 Windows native runtime proof after C0 source review

The same exact isolated public-synthetic Cinetic executable SHA `3e3ef8fdf598b1b372628d18650033bca787e024` passed **Linux [#40277155799](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40277155799) AND native Windows [#40277155743](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40277155743)**. On a real Windows GitHub runner the pinned upstream catalog and original `pick.py`, local Node 24/Python 3.11, SHA-verified ffmpeg/ffprobe and publisher fingerprinted `hyperframes@0.8.143` executed one complete 2s/24fps/48f public-original MP4 + ProRes4444 Alpha render and media decode checks. Source/Unicode portability bugs were fixed with targeted checkout LF rules, `-I -X utf8`, and `fileURLToPath`. The [Windows artifact #12630313774](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40277155743/artifacts/12630313774) contains read-back machine receipts, without client media or fonts. This proves **technical Windows OS portability on hosted hardware**, not Adobe Premiere Pro compatibility.

Commercial license status is **unchanged / CONDITIONAL**, not green: upstream Cinetic source is MIT, CLI HyperFrames metadata Apache-2.0, installed source is not a cleared commercial third-party bundle or an attestation of royalty-free H264 in all markets. A synthetic test that does not copy a company's artwork cannot certify that company's brand, footage, fonts, score, license notices, software redistribution and final client's intended use. Neither a Windows hosted VM nor alpha codec verification constitutes a native Premiere project import/alpha compositing/render receipt. Required explicit owner and local gates remain open. Do **not** interpret the Windows PASS as production authorization.

---

# 2026-10-23 C0 bounded static review closure — executable-source surface and actual-MVP license lanes

**Status: UPSTREAM_STATIC_ENTRYPOINT_INVENTORY=COMPLETE_FOR_PINNED_TREE; UPSTREAM_FULL_EXECUTION/DEPENDENCY_SECURITY_AUDIT=NOT_DONE; ISOLATED_HF_PACKAGE_METADATA=VERIFIED_IN_EXISTING_PRIVATE_REPORT; COMMERCIAL_ADOPTION=CONDITIONAL; REMOTION_UPSTREAM=DISABLED.** This is a *source-only* assessment. No upstream code or installer was run and no client content was accessed in this update.

### What was actually inspected

- The immutable upstream `Leonxlnx/cinetic@ecfa6605de1adb9345ce937724810dc32267d068` full Git tree was enumerated without truncation: **201 total entries; 74 .sh/.py/.js/.mjs/.ts/.json candidates** including tests, fixtures, data and config.
- All **29 direct `skills/cinetic/scripts/**` non-test *.sh, *.py, *.js, *.mjs, *.ts files** were directly retrieved and screened for process launch, dynamic shell, network/install, deletion, FFmpeg, audio and writing patterns. Also directly retrieved both starter package.json manifests, HyperFrames starter setup.mjs and motion.js/timeline.js, and Remotion starter's runtime TypeScript modules/config. This is **file-level source coverage**, not a proof of safe dataflow, dependency closure or execution. Excludes tests/fixtures/data from the "29 runtime scripts" count.
- **HIGH-RISK direct execution paths:** `scripts/hf-finish.sh` can run `eval` from a preflight variable, clear working paths via `rm -rf`, and its starter invokes `npx -y hyperframes@0.8.79`, not the tested 0.8.143. `scripts/layout-audit.sh` can `rm -rf "$OUTDIR"` and invoke `npx tsx`/`npx remotion`. `scripts/render.sh`, `render-chunks.sh`, `deliver.sh`, `sheet.py` include Remotion/FFmpeg invocation or cleanup. `scripts/new-film.sh` may run `npm install`. `scripts/add-font.mjs` uses child-process/npm with Windows `shell:true`. Other audio/probe/forensics/measure-speed/brand tools perform file IO and some use `subprocess`/FFmpeg.
- **HyperFrames starter:** `assets/hyperframes-starter/package.json` contains `postinstall: node setup.mjs`, exact `gsap@3.14.2` and `@fontsource-variable/geist@5.3.0` dev dependencies, and unreviewed package lifecycle install semantics. The version-pinned `hyperframes@0.8.79` starter CLI is **not interchangeable with** separately tested 0.8.143 without a synthetic regression.
- **Remotion starter:** `assets/remotion-starter/package.json` depends on Remotion family `4.0.529`, React and font packages, with render/audio/QA scripts. This alternative is explicitly DISABLED in the present isolated HyperFrames Sidecar and is NOT a fallback when HF fails.
- Pattern matching found no process-launch keywords in several individual pure-data/graphics utilities; this is **not** an attestation that unexecuted modules have no side effects. Full package install hooks, runtime-supplied inputs, dependency transitive scripts and actual Windows binaries remain outside this static audit.

### Existing exact-pinned 0.8.143 dependency evidence (read from pre-existing private audit, not a new package run)

A previously verified *private, source-free* metadata report dated 2026-10-20 records **73 Linux-x64 nested npm package manifests, 5793 archive entries, 0 missing SPDX license fields, 65/73 with a root LICENSE/COPYING/NOTICE, 0 common-extension font binaries, 1 native shared-library entry and no `gsap` package in that isolated CLI archive**. License declarations: 53 MIT, 9 Apache-2.0, 6 ISC, 2 BSD-3-Clause, 1 0BSD, 1 CC0-1.0, 1 LGPL-3.0-or-later. The LGPL case was `@img/sharp-libvips-linux-x64@1.3.4`; its redistribution notices need checking **if software/native runtime is redistributed**. This does **not** imply that distributing a finished H.264 video redistributes the node_modules archive, and does not cover GSAP if it is later imported by another lane. Windows dependency inventory has **not** been performed. Do not copy private archive hashes, URLs, app data or credentials into this public documentation.

### Updated decision matrix — judge actual use, not license names alone

| Component / lane | Verified official reference | Current bounded-MVP decision | Evidence still required |
| --- | --- | --- | --- |
| Pinned Cinetic upstream Skill and 273 metadata entries | Pinned Git tree; MIT `skills/cinetic/LICENSE.txt` | **SOURCE-ONLY**. Technique names are provenance, not 273 reimplemented algorithms | Use only opt-in original sidecar; no default upstream script execution. For full upstream adoption, sandbox actual 29-script and package behavior |
| Isolated HyperFrames CLI 0.8.143 | https://github.com/heygen-com/hyperframes/blob/main/LICENSE , Apache-2.0 | **ENGINE R&D TECH PASS; bounded commercial-use candidate**, not automatic company-rights release | Exact npm release/notice retention, approved install method, output media rights, Windows host evidence |
| Native Sharp/libvips shipped with Linux CLI | Existing 73-package Linux inventory identifies LGPL-3.0-or-later native dependency | **CONDITIONAL redistribution**; internal-only rendering vs redistribution are distinct use classes | Native bundle + notices if bundling/redistributing runtime; repeat Windows package inventory for Windows deployment |
| GSAP optional `3.14.2` starter | https://gsap.com/community/standard-license/ (effective 2025-04-30) | **NOT PART OF VERIFIED MINIMAL CLI DEPENDENCY CLOSURE**. Standard terms permit ordinary commercial work but restrict Webflow-competitive no-code visual animation builders without consent | If activating bundled GSAP or an editor, record exact workflow/product category, source distribution and terms; preserve notices |
| Noto Sans TC in existing isolated sample | https://fontsource.org/fonts/noto-sans-tc/about , OFL-1.1 | **Font family license identified**, not exact deliverable font file/brand approval | Match exact locked subset/font hashes; preserve required license notices when distributing font software |
| Geist starter font | `@fontsource-variable/geist@5.3.0` declared in upstream starter | **OPTIONAL, NOT REQUIRED FOR APPROVED TAIWAN BRAND** | Determine package asset license and exact file provenance if enabled |
| FFmpeg and codecs | https://ffmpeg.org/legal.html | **Decoder/render TECH PASS**, not a pre-approved license to ship software. FFmpeg LGPL/GPL depends on compiled features | Actual `ffmpeg -buildconf` and codec/patent obligations for chosen environment and distribution class; company deliverable rights |
| Remotion 4.0.529 alternative | https://www.remotion.dev/docs/license/pricing (updated 2026-08-10) | **NOT_APPLICABLE while disabled**. Individuals/orgs up to 3 people can qualify free; larger organizations and automation face company licensing | Obtain explicit separate adoption decision and determine actual operator/company size and workflow category before any run |
| Private company APP/brand, audio and original content | Private user-authorized provenance only | **USER/RIGHTS PENDING** | Exact rights to transform, publish, use brand and distribute ad assets; human art approval |
| Native Windows Premiere & user device | No Windows receipt for this candidate | **NOT_TESTED** | Actual import/playback/export, audio/alpha as required and measured 1× mobile review |

### What C0 can and cannot sign off now

- **C0-SOURCE-INVENTORY: PASS (pinned upstream entrypoints enumerated and statically screened).** All direct `scripts/` production-source files and template runtime files were fetched. Treat dangerous patterns as risk flags rather than exploits.
- **C0-MINIMAL-HF-DEPENDENCY-METADATA: PASS FOR PRIOR LINUX ARCHIVE**, with a specific LGPL redistribution caveat. No new install, hash verification or module execution occurred in this round.
- **C0-SIDECAR-SCRIPT-ISOLATION: REQUIRED**, keep experimental explicit opt-in, do not promote the full upstream scripts or Remotion silently.
- **C0-COMMERCIAL_RIGHTS_FINAL: PENDING** for actual company, media, exact production distribution, Windows/FFmpeg build and human rights owner. **C0-ALL-UPSTREAM-SECURITY_AND_LICENSE: NOT_PASS** until reviewed against exact executed commands/dependencies, particularly installer and shell cleanup.
- **No reason to block further safe C3 source-only QA** because unused upstream scripts have not been adopted; no reason to call commercial production ready based solely on the 73-manifest inventory.

---

## 2026-10-23 additional upstream source inspection (14 more files, **not executed**)

At immutable upstream `Leonxlnx/cinetic@ecfa6605de1adb9345ce937724810dc32267d068`, Git tree enumeration reconfirmed **201 entries**, including **74 candidate .sh/.py/.js/.mjs/.ts/.json** (many config, fixtures and data). Directly opened 14 additional files and inspected their source for execution, deletion, dependency and output patterns. This is a **bounded source-pattern inventory only**, not a control-flow/taint/dependency/license review.

| File(s) newly reviewed | Observed source pattern | Required adoption gate |
| --- | --- | --- |
| `scripts/audio/listen.py` | `subprocess.run` executes constructed argument list; writes reports | Strict argument/path review, dependency and audio provenance |
| `scripts/audio/master.py`, `scripts/audio/synth.py`, `scripts/audio/score.py` | File/audio synthesis and output writing; score.py removes a stale artifact via `os.remove` | Explicit output isolation / sound provenance, role-specific license |
| `scripts/av-audit.py`, `scripts/forensics.py`, `scripts/measure-speed.py` | ffprobe/FFmpeg via subprocess and/or `Popen`; source-side decoding | Bound media inputs, timeouts and output locations; actual native execution not tested |
| `scripts/dither-gradient.py`, `scripts/palette.py` | Read configuration and generate data/images; no command-launch match in this bounded search | Still verify imports, write targets and commercial assets |
| `scripts/export-cues.ts` | `writeFileSync` plus directory creation for generated cues | Bound writable destination; validate input origin |
| `scripts/grid-check.ts`, `scripts/lint-film.mjs` | Static lint/check tooling; lint includes remote-font URL detection patterns | Treat lint claims as diagnostics, not a sandbox or proof of no network access |
| `scripts/layout-audit.sh` | Runs `npx tsx` and `npx remotion`; uses `rm -rf "$OUTDIR"` and deletes temp via trap | **BLOCK direct execution** pending fixed output path, clean temp containment, explicit dependency/Remotion rights |
| `scripts/sheet.py` | `subprocess.run` launches `npx remotion`; uses `shutil.rmtree` on temporary directories | **BLOCK implicit adoption** until path containment and full dependency/license review |

**Scope accounting:** 17 upstream files previously described as read + 14 newly directly opened here = **31 source-file reading events**, not 31 fully audited safe scripts, and some earlier nine include overlap with other descriptions. The other 43 candidate files are **not** represented as audited; many are package configuration, fixtures or datasets, so 74 is **not** an executable count. Dangerous matches above are implementation risks, not evidence of malicious code. No upstream commands were executed.

**C0 gate remains PARTIAL:** full reachable-script and transitive dependency graph, variant-specific compatibility between 0.8.79 and 0.8.143, GSAP/Remotion/audio/font/FFmpeg actual commercial rights, safe use class and any output distribution notices remain open. Current opt-in pinned HyperFrames CLI stays isolated. Company S08 and the private Google Drive content are not used for this inventory.

---

## Brand supplied APP assets vs upstream Cinetic taste bans — 2026-10-23

The immutable upstream `skills/cinetic/SKILL.md` at `ecfa6605de1adb9345ce937724810dc32267d068` was also checked: lines 14 and 53 expressly give a **user-supplied brand precedence over the default artistic bans**, and require the brief / source to document such exceptions. Its general color bans (including orange and glow) are **not** permission to redraw, recolor, or silently replace authenticated existing APP UI.

S08's source UI colors, original orange success/Next controls, source runner/icon imagery, established vertical framing and verified question content must therefore be treated as **source-supplied identity and factual UI**, not newly invented Cinetic ornament. Applying a global linter without that brand exception would risk causing the exact visual regression the user reported. This remains an independent QA rule; it does not grant broader company asset redistribution rights or imply that the upstream 273 techniques have been installed or authored.

Current official upstream project README identifies Cinetic as MIT and HyperFrames as Apache-2.0, but those statements do not clear optional Remotion, external GSAP usage classes, vendor font/media distribution, transitive dependencies or the intended commercial workflow. The project's actual private executable remains the isolated pinned HyperFrames CLI with original UI assets confined to private Drive, pending the separate rights review.

---

## 2026-10-23 source-only executable inventory extension — full upstream tree enumerated, production still BLOCKED

**Immutable review source:** [Leonxlnx/cinetic at `ecfa6605de1adb9345ce937724810dc32267d068`](https://github.com/Leonxlnx/cinetic/tree/ecfa6605de1adb9345ce937724810dc32267d068/skills/cinetic). Its complete Git tree was returned without truncation (**201 tree entries**). A filter of `skills/cinetic/` files with extensions `.sh/.py/.js/.mjs/.ts/.json` identified **74 files**, including fixtures/data, not 74 executables. This improves inventory completeness; it is **not** a full security/license audit or authorization to install those files.

Beyond the nine existing entrypoints reviewed above, **eight more exact pinned source files** were read without execution:

| Upstream source | Verified execution / asset behavior | Gate |
| --- | --- | --- |
| `scripts/add-font.mjs` | Invokes npm through `execFileSync` (Windows invocation with `shell: true`), supports `npm pack` to a disposable directory, local file copy/removal; new font binary and package provenance/notice checks are needed | BLOCK implicit adoption |
| `scripts/outline-text.py` | Requires fontTools/Brotli/uharfbuzz; writes outlined SVG from a supplied font, separate licensed font input and output provenance | CONDITIONAL |
| `scripts/pick.py` | Inspected as a local technique-selection source; keyword screening did not identify network/shell/process dispatch, but that scan is *not* a formal taint audit | SOURCE ONLY |
| `scripts/probe.py` | Calls `ffprobe` and `ffmpeg` through Python `subprocess`, including a command with overwrite flag `-y` | Explicit output bounds required |
| `scripts/audio/kit.py` | Invokes external Python/kit probes and optional **earshot** executable with subprocess and significant timeouts; availability and independent license/source must be reviewed | Not activated |
| `scripts/accumulate.py` | Launches FFmpeg subprocess decoder/encoder, with output overwrite flag `-y` | Explicit output bounds required |
| `scripts/brand-svg.ts` | Writes SVG files and executes a Python font-outline helper via `execFileSync`; depends on approved private font source and reviewed output paths | CONDITIONAL |
| `scripts/check-sync.py` | Invokes FFmpeg to decode audio as floating samples; no native Premiere, playback, or sync certification is implied | SOURCE ONLY |

**Audit discipline:** this only confirms the above source patterns, not exploitability or safety of arbitrarily supplied paths. All 74 candidates are not claimed as fully read; dependency transitive licenses, additional Remotion/audio/TypeScript tools, complete npm `postinstall` closure, and exact company commercial usage remain unapproved. Keep existing project-local `cinetic-synthetic-sidecar` isolated, do not run upstream `new-film.sh`, `hf-finish.sh`, font/audio installers or the Studio GUI on company materials.

**C0 technical decision:** continue pinned independently tested `hyperframes@0.8.143` for experimental renders. Do not represent source-only upstream Cinetic metadata/technique references as its complete 273-technique implementation. The C4 commercial promotion gate remains **BLOCKED** until the remaining full dependency/script/license review, independent art acceptance and Windows Premiere test are separately evidenced.

---

## 2026-10-23 source-pinned upstream executable audit (partial; no execution)

The upstream tree at immutable `Leonxlnx/cinetic` commit `ecfa6605de1adb9345ce937724810dc32267d068` was inspected again as **source-only**. The actual R&D film does **not** execute or automatically install the upstream Skill scripts; the separately pinned HyperFrames 0.8.143 CLI is used under protected and isolated execution.

A bounded static review read nine relevant upstream source/package entrypoints: `scripts/new-film.sh`, `hf-finish.sh`, `render.sh`, `render-chunks.sh`, `deliver.sh`, `grab.sh`, `brand-kit.sh`, `assets/hyperframes-starter/setup.mjs` and its `package.json`.

- **External/install behavior:** `new-film.sh` optionally invokes `npm install` in the generated film folder; its dependencies' install scripts would be active unless deliberately disabled. The HyperFrames starter declares `postinstall: node setup.mjs` to copy vendor GSAP/font files. This does not establish license clearance for redistributed copies, nor is it appropriate to run on private client data by default.
- **Command execution and deletion:** `hf-finish.sh` contains configurable preflight `eval "$PRE"` and performs cleanup of its working directory with `rm -rf`. The source's default HF CLI is `npx -y hyperframes@0.8.79` rather than the isolated tested `0.8.143`. Running that full script would add unreviewed shell execution, network/package-install and version-drift risks. The present protected sidecar does **not** use that script.
- **Remotion alternative:** `render.sh` and `render-chunks.sh` use `npx remotion` and FFmpeg. This lane remains separate and requires its own production license decision, not an implicit fallback. `deliver.sh` also supports `npx remotion` and temp-file removal.
- **Safe bounded conclusion:** the current project's script/CLI isolation is intentional and should remain. This is **not** a completed audit of all upstream executable Python/JS/TS scripts, transitive npm license notices, bundled fonts, FFmpeg distribution, or the user's exact commercial deployment/use model. Do not call C0 production-license PASS.
- **Before full upstream adoption**, perform a sandboxed dependency and script inventory, pin all hashes, make preflight arguments strict without `eval`, disable implicit npm install/postinstall, validate 0.8.79→0.8.143 behavior against real synthetic frames, and have the actual intended commercial usage class and licenses reviewed. No upstream script was run or credentials/media accessed during this static inspection.

---

# C0 — Cinetic / HyperFrames runtime and design rights assessment (2026-10-18)

**Scope:** synthetic-only isolated CLI evaluation. This is a bounded technical/usage-class audit, **not** a legal opinion or production-license clearance.

## Source/version chain

| Component | Pin / verified evidence | Status |
| --- | --- | --- |
| Cinetic Agent Skill | `Leonxlnx/cinetic` at Git commit `ecfa6605de1adb9345ce937724810dc32267d068`, `skills/cinetic/LICENSE.txt` MIT | Source/Skill instructions audited at high level; full script chain not yet run here |
| Upstream Cinetic HyperFrames recipe | `skills/cinetic/references/hyperframes-engine.md` refers to **0.8.79**, GSAP paused timeline, local scripts and fonts | Version-specific guidance; no automatic 0.8.143 equivalence |
| Actual R&D renderer | `hyperframes@0.8.143`, tarball SHA-1 `8761025aa327993c605a307ec2d9f01fe6bde047` checked with npm registry in Actions | Basic HTML + frame-seek MP4/ProRes Alpha success; full upstream Cinetic script compatibility not proved |
| HyperFrames project source | Apache-2.0 repository [LICENSE](https://github.com/heygen-com/hyperframes/blob/main/LICENSE); CLI package publishes under that repository | npm package contents, bundled fonts/templates/native and transitive license obligations remain separately conditional |
| GSAP | [GSAP Standard No-Charge License](https://gsap.com/standard-license) (official, consulted 2026-10-18) | Many commercial works allowed; qualifying competitive no-code visual animation builders need prior written consent. **HyperFrames Studio GUI remains excluded.** No added GSAP Studio dependency by this branch. |
| Font | Existing root `@fontsource/noto-sans-tc@5.3.0`, only exact unicode-range subsets selected at runtime with SHA256 manifest; fonts not uploaded as artifacts | Technical font source/cmap path validated in synthetic runtime; final Taiwan glyph shape/brand/small-device legibility remains Visual QA |
| FFmpeg / video codecs | existing pinned root FFmpeg/FFprobe hash-checked on ephemeral GitHub runner | output decode proven; native Windows Premiere and software redistribution/codec legal review not complete |

**Avoid false positive:** HyperFrames CLI technical success is not authorization to bundle HyperFrames Studio/compiled GUI or distribute a no-code visual animation builder. The project-specific license classification and exact transitives need their own approval. No prior user decision to avoid contacting/buying licenses is changed.

## Verified C2/C3 synthetic milestones

- [Single-brief 16:9 real MP4 + Alpha run #39116128436](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116128436): 1280×720/24fps/48f; real decoded H.264 and ap4h/yuva444p Alpha technical pass; pinned Noto source subsets: 6.
- [Two-brief 16:9 + 9:16 run #39116273741](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/39116273741): 1280×720 and 720×1280, both 24fps/48f, two original different scripts, same adapter source, two real MP4 + two real Alpha MOV, decoder/frame/source rights checks passed; second portrait font subset count: 5.
- Independent **timecoded extracted-frame QA** of this first two-brief artifact: no evidence of typography clipping in the sampled frames, but major creative deficiency: **caption-only scene succession with no continuous object, no visual cause-and-effect**. This is a substantive quality **FAIL** relative to user's meaningful-animation goal, regardless of technical pass. Production art remains `PENDING_USER_APPROVAL` — do not replace that field or claim final reject decision for owner.
- Bounded remediation: new **persistent semantic node+link motif** across scatter→connect→resolve (original locally generated SVG based entirely on frame and fixed geometry); this is an intermediate art-facing experiment, not implementation of Cinetic's full 273 technique library. CI and real render evidence must be rerun and inspected before any qualitative claim.

## Independent review and stop gates

**Cinetic director** supplies narrative intent and source-pinned technique *proposals*; the isolated CLI renders fixed synthetic source only. **Visual Design Review v0.2.2** independently reviews sampled and, when available, full-speed decoded motion (legibility, Taiwan typography, causal continuity, visual originality, safe areas and alpha compositing). Cinetic self-critique is never a substitute for this independent gate. **Only the operator** can set art acceptance for an exact render variant; codec tests cannot.

Remotion rights are an independent blocker if anyone later selects that alternative; no default Remotion and no user/company ad copy, screenshots, NAS assets, voice, external templates or third-party branded media. No private Google Drive identifiers, no new paid cloud account, no changes to public main or previously approved private K-Series masters.

**Next:** judge the persistent motif as actual full-speed footage; if still insufficient, revise original direction/art language with the operator's objective rather than adding more schema or generic test-only plumbing; finally two-brief 6–10-second original concept, responsive layout, independent Visual QA, separate native Windows Premiere, and formal commercial adoption decision.