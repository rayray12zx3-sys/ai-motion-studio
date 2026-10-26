## 2026-10-26 Windows native compatibility check — awaiting exact-head CI

A narrowly scoped Windows GitHub runner smoke workflow was added to exercise the *existing* isolated public-synthetic Cinetic `full` command: Node 24, Python 3.11, current locked local dependencies, publisher-pin HyperFrames 0.8.143, SHA-verified FFmpeg on Windows, real 24fps/48-frame H264 MP4 + ProRes4444 Alpha MOV and Windows FFprobe/decoder QA. Fixed platform-specific `file://` → path handling of the verifier and selects `python` on Windows / `python3` on Linux rather than assuming POSIX. It does **not** install Premiere or expose company assets. A passing Windows-native GitHub run will close only `WINDOWS_NATIVE_ENGINE_SMOKE`; **`WINDOWS_PREMIERE_IMPORT=NOT_TESTED` remains unchanged**. Do not claim this change passed until the exact new CI run completes and its logs are read.

---

# Cinetic CURRENT — 2026-10-26 VERIFIED

**Scope completed: original-public-synthetic single-entry Cinetic film technical MVP. Full production-grade Cinetic / client release NOT COMPLETE.**

**Latest VERIFIED full executable/workflow HEAD** [`31307c9b70293a7f928213a5c6de58d770bb9fcf`](https://github.com/rayray12zx3-sys/ai-motion-studio/commit/31307c9b70293a7f928213a5c6de58d770bb9fcf); [exact-head GitHub Actions #40274035678](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40274035678) **SUCCESS**. This covers prior real source-backed director+scene+8s/60fps HyperFrames H264/ProRes4444 Alpha/original sound and adds exact-byte three-part archival QA and strict JSON manifest readback. Earlier [#40272184913](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40272184913) at `40fa18e00102e5468278619c447697b1c4d86e66` independently proved the exact same underlying video/sound and technique application; later code changes were bounded workflow archival. This handoff document update follows the executable CI; do not conflate documentation SHA with verified executable SHA.

**Independent real artifact proof:** [Run artifact #12628937137](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40272184913/artifacts/12628937137) downloaded, ZIP CRC PASS, media SHA256 matched receipt, **both video tracks fully decoded 480/480**. MP4 **1280×720, 8s, 60fps/480f**, H264/AAC stereo 48kHz, SHA256 `574d612e42cd4b4767d2ada321a868bca044b661e586901c53b436c4f2432bc9`. MOV **ProRes4444 ap4h/`yuva444p12le`, 8s, 60fps/480f**, SHA256 `a8a57ae8b254864c46f78b2b392d5ed952868ed20c695ee9561af7daa7d9829e`. Independently sampled alpha f0/f180/f324/f400/f479: min/max 0/255; all four corners transparent. MOV deliberately silent for editing. Silent H264 SHA256 `734e646b12d6a97a4e7864016ad355cc2e58b57ea0e4edb4c7bc8461a688f8af`. GitHub artifact retention is short; permanent receipt IDs/hashes here remain even after expiration.

**Persistent private delivery independently verified:** existing project private Google Drive folder now contains the genuine 8s 60fps audible MP4 (read back exact SHA256 `574d612e42cd4b4767d2ada321a868bca044b661e586901c53b436c4f2432bc9`) and **three individually stored ZIP archives** containing the original 115,157,371-byte silent transparent ProRes4444 MOV split into `part01.bin` (40,000,000 B), `part02.bin` (40,000,000 B), `part03.bin` (35,157,371 B), each with the SAME strict-valid `manifest.json`. Latest public-synthetic [GitHub Actions run #40274035678](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40274035678) archived these exact files. All **3 Drive ZIPs were individually re-downloaded**, byte-exact SHA-matched to their original GH artifacts, ZIP CRC/strict JSON validated, and all three internal raw piece hashes matched the manifest. Concatenation of parts **in numeric order** yielded original SHA256 `a8a57ae8b254864c46f78b2b392d5ed952868ed20c695ee9561af7daa7d9829e`; this is the SAME fully decoded MOV shown above. **Individual parts and ZIPs are NOT independently playable MOV files.** On Windows extract the three `partNN.bin` files into one directory, then `cmd /c "copy /b part01.bin+part02.bin+part03.bin overlay-alpha.mov"`, then `Get-FileHash -Algorithm SHA256 overlay-alpha.mov` and compare against the full hash. Do not place private Drive identifiers, media and credentials in public GitHub docs.

**Actual upstream technique integration:** Required `tr-anchor-overlay-cut` is first in actual `director-selection.json`, with original upstream random suggestions preserved separately under `originalPickerIds`. The sole source-backed implementation is `storyboard-film.mjs` SHA256 `d0c4323827d5b906154e864337a840c503e3dcf8188aebdd0e1105f33bcb50be`, transition boundary **frame 324**. `full-receipt.json` records this one `selectedPlanRecipesImplemented` and `selectedUpstreamRecipesRendered=PARTIAL_ONLY_EXPLICIT_PLAN_RECIPE_SOURCE_AND_MEDIA_QA`. **One implemented technique ≠ 273 implemented effects.** Other suggestions are not applied to pixels.

**User-art caution:** Previous PPT-like sidebar was identified in decoded output; the exact opted-in new version now uses three more differentiated compositions with the sidebar removed. Independent sampled-frame technical review does not prove full-speed creative quality; prior feedback that the art was plain remains active. `USER_ART=PENDING`, `WINDOWS_PREMIERE=NOT_TESTED`, `COMMERCIAL_RIGHTS=CONDITIONAL`, `RELEASE=BLOCKED`. No user approval, native Premiere proof, generic auto-install of upstream scripts, new default renderer or company/private footage.

**Next action:** Play current real 8s video at 1× to the user and obtain exact-version aesthetic decision; if rejected, revise the *same* isolated scene rather than add tools. Pending remaining user- or environment-bound steps: fair same-brief Canvas comparison, full-speed visual/device test, licensed project-specific footage/fonts/audio/brand clearing, Windows Premiere import/alpha/export, then explicit release permission. Preserve prior K-series approvals, frozen M11/M12, existing default Canvas+FFmpeg and unmerged PR #140.

---

## 2026-10-26 director-to-pixel correspondence fix (verify new exact-head action)

Previous full workflow produced authentic random upstream technique suggestions **disconnected** from the one scene-implemented technique in the plan. That contradicted the product goal. The selector now keeps requested, catalog-validated Cinetic plan IDs first in its output, then retains unmodified original `pick.py` suggestions separately with `originalPickerIds` provenance. The director BRIEF/TREATMENT therefore includes the **exact intended** `tr-anchor-overlay-cut` and the machine receipt can assert that **only that one** selected source-backed recipe has a corresponding scene implementation and real-media technical pass. Remaining random suggestions remain unimplemented, not silently credited. This is a change in selection policy, **not** proof of automatically rendering the entire technique catalog.

Still: user creative review, commercial rights, independent full-speed device-scale viewing and native Windows Premiere not approved. All outputs public-original synthetic. Validate the new exact-head CI before crediting this fix.

---

## 2026-10-26 original synthetic sound finishing (scope-limited)

- New deterministic `cinetic-soundscape.mjs` synthesizes **no third-party recordings**: restrained tone, edit cue, and raindrop/ripple sound on the 8s 60fps fictional storyboard frame grid. It runs **only** for `storyboard-film` with the scene-implemented `tr-anchor-overlay-cut` in the same `full` CLI.
- Existing transparent ProRes4444 Alpha MOV remains **silent and unmodified**. A separate H.264+AAC `preview-with-original-sound.mp4` is generated after true media QA with a non-overwriting deterministic WAV, isolated FFmpeg loudnorm target, actual ffprobe video/audio stream checks, and an `originalSound` receipt gate. No new npm dependency, sample pack or paid service.
- The soundtrack is a **prototype, not a licensed/approved commercial score**; final sound-design taste, independently measured LUFS/true peak, user full-speed listening, Windows Premiere, all-media client rights and production approval remain open. The source-backed user brief and 273 proposal list remain unchanged.
- Current evidence requires a new exact-head Action check and actual decoder/audio validation; do not mark this audio feature PASS before CI and media inspection.

---

## 2026-10-26 art-correction iteration (must be validated by exact-head CI)

Independent decoded actual MP4 contact frames from commit `10de3d75` showed the **same left caption / right framed panel layout in all three beats**, the known operator-rejected PPT-like direction. No creative approval was given. This follow-up isolates a second original synthetic style pass **only for the opted-in `tr-anchor-overlay-cut` smoke plan**: beat-specific full-canvas typography, freer physical film placements, an expanded concluding weather scene, no persistent sidebar box or fake dashboard dividers. Earlier `storyboard-film.plan.json` remains an unchanged legacy comparison. The same source-applied technique/first-frame shape marker/production-release BLOCKED gates remain. Re-evaluate from actual new decoded media; no style PASS before independent review and user signoff.

---

## 2026-10-26 Implementation continuation — new evidence requires new CI

- The isolated source branch now targets a **real source-applied** original Cinetic `tr-anchor-overlay-cut` on the **8s/60fps public-synthetic storyboard**: a persistent red foreground cue is frame-position-matched at act 1→2, the scene underneath hard-swaps, and the cue glides to its scene slot over 40f. This is one genuine implemented recipe only, not all 273.
- `storyboard-film.mjs` implements pixel-time scene behavior; `storyboard-film.test.mjs` checks exact cut boundary continuity, first-frame world swap and deterministic destination. `cinetic-full.mjs` records the exact plan technique ID, source SHA and cut frame **only after genuine decoder-based media QA**, while keeping randomly selected `pick.py` proposals separately **NOT_VERIFIED**.
- The pre-existing public-original workflow has been changed to run **full** on the existing 8s/60fps case instead of duplicate render paths; it now tests and uploads one matched source-and-media receipt, original BRIEF/TREATMENT, actual MP4 and Alpha MOV. This was not a production-engine switch, no new third-party dependencies and no public private/company media.
- **Do not mark this implementation or the 60fps media PASS until the new exact-head Action has actually completed SUCCESS and original output is checked.** Design quality, 1x human visual review, matched Canvas baseline, audio, Windows Premiere, licensed commercial use and art approval remain open.

---

# Cinetic｜HANDOFF_CURRENT（2026-10-26，Asia/Taipei）

> **交接已建立 ≠ 作品或商用系統完成。** 本檔是 Cinetic 隔離實驗路線的精簡續接入口；現行證據與變動以 GitHub Live PR／Issue／CI 為準。勿複製私人素材或 Google Drive 檔案 ID 到公開 Repo。

## 1. 第一個讀取點與決策邊界

1. 本 Repo 的 [產品憲章](../../docs/PRODUCT-CHARTER-AND-DRIFT-CHECK.md) 與 [整體續接入口](../../docs/CONTINUE-HERE.md)：核心目標是對話驅動的高品質、可重複影片，而非不斷新增工具或測試。
2. [Issue #138](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/138)：Cinetic 最新里程碑、真實渲染證據、私人交付資料索引及此前使用者美術回饋。
3. 本資料夾 [CINETIC_SINGLE_ENTRY_MVP.md](CINETIC_SINGLE_ENTRY_MVP.md)、[C3-INDEPENDENT-VISUAL-QA.md](C3-INDEPENDENT-VISUAL-QA.md)、[C0-LICENSE-COMPATIBILITY.md](C0-LICENSE-COMPATIBILITY.md)：執行方式、視覺驗收、授權限制。
4. [專案限定 Skill](../../.agents/skills/cinetic-synthetic-sidecar/SKILL.md)：**僅**限明確選擇 Cinetic 原創公開合成素材時使用，不取代已核准 K 系列／Canvas+FFmpeg。

## 2. 已查核之程式碼與遠端狀態

- Repo：`rayray12zx3-sys/ai-motion-studio`；Cinetic 工作分支：`work/cinetic-single-entry-mvp-20261026`。
- 本次驗證前工作分支 HEAD：`705954b5b5c4bceeb73bfc2927fcbe8ff571873f`（2026-10-26 台灣時間）；main：`8db999ace933ebe0ad7204384deec6472934904b`。本檔提交僅增加交接文字，不使 `main` 或正式渲染引擎發生變更。
- [Draft PR #140](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/140)：OPEN／DRAFT／NOT MERGED，原 head `experiment/cinetic-director-adapter-20261018`，**不是**上述較新的 work 分支。勿把兩條分支或 PR 的驗證當作同一 SHA；不可擅自合併。
- [真實一鍵 CI #40225753484](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/40225753484)：COMPLETED/SUCCESS；測試的**程式碼／workflow commit** 是 `4df533a38c112340e284cce1ca7430b0c8fb2f9f`，作業 `genuine-engine-public-synthetic-only` 全部步驟成功。來源記錄：36 個主測試中 35 PASS、1 個可選私有 fixture SKIP，加上 10 個 adapter 測試 PASS。
- 比較上述 CI SHA → 本次驗證前工作分支 SHA：**ahead 2／behind 0**，變動限 Skill、README、單入口文件與上游導演參考資料，無執行程式碼修改。**因此通過的是已執行的 CI 版本；未宣稱文件後繼 HEAD 重新跑過 exact-head CI。**

## 3. 真正已完成的能力（有條件 TECH_PASS）

- 單一 `experiments/cinetic-sidecar/cinetic-flow.mjs full` 已在授權的公開原創合成計畫上實測：SHA 受控原始 plan → MIT 上游 Cinetic **273 筆技法資料／14 類**與原版 `pick.py` 選技 → 依原始 plan 指紋產生 `BRIEF.md`、`TREATMENT.md` → 真實 `hyperframes@0.8.143` 渲染 H.264 MP4＋ProRes4444 透明 MOV → FFprobe/FFmpeg 解碼、影格、透明度與字形檢核 → 機器收據。
- 已跑真實技術輪廓：2 秒橫式 24fps／48f；2 秒直式 24fps／48f；8 秒橫式 30fps／240f；8 秒橫式 60fps／480f。單指令 full 實例為 2 秒／48f；技術證據與媒體索引見 Issue #138，不在本檔重貼私人連結。
- 上游配方選取**僅是導演建議**，沒有自動轉換為 273 個實際像素技法。不得把 `pick/treat` 或真實渲染成功描述成「完整 Cinetic Skill 已安裝」或「選中的效果已全部出現在影片」。
- 現有已核准的 K 系列版本、私人專案、主引擎、M11/M12 決策不變。無公開公司影片／聲音／字型檔／私人 state，無預設商用部署。

## 4. 最新精確狀態與驗收阻礙

| 項目 | 狀態 |
| --- | --- |
| Cinetic 原創合成單入口／選技／Treatment／真實 MP4＋Alpha／技術 QA | **PASS**（上述固定 CI 及樣本） |
| 273 項配方逐項可執行並對應渲染畫面 | **NOT_COMPLETE** |
| 原版完整 Agent Skill 自動安裝／未審核上游腳本執行 | **NO／禁止隱式執行** |
| 指定影片 1× 全速／裝置尺寸／與現行 Canvas 同 brief 公平比對 | **PENDING** |
| C3 舊版卡片風格 | **USER_ART_NOT_APPROVED**；使用者反饋「有意義，但排版、美術、設計普通、陽春」 |
| 後續 C3.2 故事板與 60fps 樣片 | **TECH_PASS，USER_ART_PENDING／VISUAL_NEEDS_REFINEMENT** |
| 音樂、SFX、調色、正式品牌與素材商用授權 | **NOT_DONE／CONDITIONAL** |
| 於使用者 Windows Premiere 本機實際匯入／Alpha／輸出 | **NOT_TESTED** |
| 正式專案上線、替換預設引擎、合併 Draft #140 | **BLOCKED／NOT_AUTHORIZED** |

## 5. 接續執行次序：先補影片品質，不再堆新工具

1. **P0（下一輪最有價值）**：在既有 Cinetic Sidecar 選一個**原創公開合成、真正有主題**的 brief，依 `BRIEF/TREATMENT` 明確選 **1–2 個**上游動效原理並在既有場景作實際 source-backed choreography；留下「被選配方 ID → 實作原始碼 → 影片時間碼／影格 → QA」的可追蹤對照。不要為此另開新 Skill／renderer／S08 工具；不得假裝所有 273 個配方都已實作。
2. **P0 真正觀影驗收**：保留一支完整可播放影片與透明 MOV；在相同公開合成 brief 下產出現行 Canvas/FFmpeg 基準版（若未建立，標記未建立），實際全速觀看並紀錄時碼問題：動作因果、字卡遮擋、視覺主體、排版辨識、動線、停留節奏、特效與故事一致性，以及手機尺寸。缺少實際視訊觀影證據不得給出通過分數。
3. **P1**：針對本次審查的最大美術落差在相同素材／分支做一輪小幅可逆改進、重新輸出及比較，避免只改微裝飾或再添 dashboard/card 版型；待真實成果可供使用者核對才標示 `USER_ART_REVIEW_PENDING`。
4. **P2 人工／外部驗收**：商用實際品牌/字型/音訊/第三方 dependency／編碼授權；Windows Premiere 實機、Alpha 合成與回輸出；使用者明確逐版本美術認可。上述關卡未過，禁止稱 production release 或移入日常引擎。

## 6. 每次交接驗證法

- 以最新 GitHub **live** work 分支 HEAD、Issue #138、PR #140 和與程式碼 SHA 完全對應的 Actions 重查；不要以本文截至 2026-10-26 的快照取代新資料。
- 區分 `TECH_PASS`、`VISUAL_REVIEW`、`USER_ART_APPROVED`、`WIN_PREMIERE_PASS` 與 `PRODUCTION_RELEASE`，不可跨越推論。
- 更新本檔與 Issue #138 的精簡指標即可，**不新建第二份執行權威、不改 main、不新增未經核准的外部服務／付費步驟／私有媒體上傳**。
- 交接完成條件是：本文件可從工作分支讀回、Issue #138 提供連結、分支 commit 與來源 CI 可核對。這只代表**上下文交接完成**，不代表產品完成。
