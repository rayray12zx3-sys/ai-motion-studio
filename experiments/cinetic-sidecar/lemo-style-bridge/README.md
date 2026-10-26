# Game Show Flat → Cinetic experimental source-safe bridge

## Evidence / version
- Source inspiration: [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) pinned at `413a6bd6d78ebd3bdd5abaec9538a26867f890df`; style `styles/game-show/STYLE.md`, original blob `7a4a01447c26870379b6fd914894889444b642f6`.
- Style reference, genre grammar and directing only; this module was originally written for the user's **public-synthetic** testing and copies no demo characters, audio, client APP, fonts or images. Official code/docs MIT, demonstration footage CC BY 4.0 with explicit voice exceptions. See upstream LICENSE / README / demo CREDITS before any actual reuse.
- The actual implementation has `makeContract()`, deterministic `frameState()` and `frameSvg()`. It **renders SVG pixels** for fictional 3-round quiz examples, not merely a style name or an abstract quality checklist.
- Test: `node --test experiments/cinetic-sidecar/lemo-style-bridge/style_bridge_public.test.mjs` — 7/7 PASS on isolated local Node v22.16.0 on 2026-10-27. Needs repeated exact-commit CI/Windows verification before production reuse.
- Sample input only: `{contentClass:'public-synthetic',title:'猜字遊戲',rounds:[{word:'EMBER',options:['熱','冷','快','慢']},{word:'NOVA',options:['星','海','天','風']},{word:'QUEST',options:['尋找','跑步','收集','閱讀']}]}`. Example: `frameSvg(makeContract(input),44)`.

## Boundary and remaining work
- This is **not** an installable ChatGPT Skill, not an official Lemo execution path, not a Cinetic HyperFrames 0.8.143 renderer adapter, not all 59 styles, and does not change the existing Cinetic single-entry flow. It is an opt-in pixel-generating source-safe bridge.
- This repository/branch is PUBLIC. Real S08 application images, company questions and private derivative runner MUST NOT be inserted or pushed here; the actual S08 style-directed video is made only in isolated private storage with an original Python/Pillow renderer.
- Official pinned 273 Cinetic technique picks are still planning proposals, not auto-applied pixels. A future genuine HyperFrames integration needs a separately approved full rendering contract and binary SHA verification.
- Do not merge main/Draft PRs or launch paid workflows just from this experiment. User visual approval, native Premiere and commercial rights are still blocked.
