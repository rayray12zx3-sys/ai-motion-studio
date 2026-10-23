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