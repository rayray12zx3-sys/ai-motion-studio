# AI Motion Studio — 歷史工具／授權／採用決策復原地圖（2026-10-11）

> **來源索引，不是法律意見、2026-10-11 重新驗證 upstream terms，亦不是安裝或新商用權利授權。** 所有表列的授權是**歷史文件當時記錄的原始碼授權訊號**；代碼、Studio GUI、轉碼器、npm 相依、外部預覽影片、字型、音樂與交付影片的權利必須分開。遇到舊資料衝突，以較晚的**明確使用者決策／糾錯文件**為準，並在正式導入前重新查核現行 license。

## 關鍵原始來源（保留全部研究，不刪除）

1. [正式工具採用及商用授權登錄簿](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) — **已在 main**，詳述 2026-10-09～10 日授權研究、HyperFrames 實際影片及 Alpha 測試。
2. [2026-10-10 的 20 個 GitHub 動畫／AI Skill 專案研究](X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md) — **已在 main**，列出完整 20 項，以下只整理具體決策；勿遺漏整份名單。
3. [Editor／Renderer 分離決策與 shortlist](EDITOR-SEPARATION-ROADMAP-2026-10-10.md) — **已在 main**，比較 Konva／React Timeline Editor／Fabric.js／Moveable／Motion Canvas／Theatre／tldraw／HyperFrames。
4. [Production dependency license inventory](../THIRD_PARTY.md) — **已在 main**，列出 pinned Canvas、Noto Sans TC、FFmpeg／FFprobe 與 codec 待查事項。
5. [M9 開源／模板授權研究](https://github.com/rayray12zx3-sys/ai-motion-studio/blob/feat/m9-template-registry-license-gates-20261008/docs/OPEN-SOURCE-RESEARCH-2026-10-08.md) — **歷史 Draft #23**，Remotion 模板登錄、Theatre 和素材權利研究。
6. [HyperFrames 0.8.143 原始依賴／商用授權審計](https://github.com/rayray12zx3-sys/ai-motion-studio/blob/fix/hyperframes-license-scope-and-ci-20261010/docs/research/HYPERFRAMES-0.8.143-RUNTIME-LICENSE-AUDIT.md) — **歷史 Draft #44/#46**，含 GSAP 重要糾錯；不視為合法正式採用。
7. [Issue #4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4)、[Issue #5](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/5)、[Issue #11](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11) — Agent 產品定位、3D／動畫技術研究、品質需求。

**舊文字矛盾提醒**：正式授權登錄簿原文第 4 行自述「本文件屬 Draft #27／尚未合併」，但今日**實際 main 已含本文件**，且 PR #27 GitHub 已顯示 merged。不要因這一條過期說明而誤判 GitHub main 的檔案不存在。PR/CI 狀態應查 live。

## 技術與獨立工具的真實位置

**定位狀態圖例**：
- `MAIN_ACTIVE`：實際在正式主線中使用（不等於最終商用交付所有法律問題已解）。
- `ISOLATED_PROVEN`：有獨立實際測試／Draft，但沒有正式採用。
- `RESEARCH_ONLY`：設計／技巧參考、可做必要的原創試驗，未批准 production dependency。
- `CONDITIONAL`：商業權利、依賴、素材或產品適用範圍需進一步查核。
- `EXCLUDED`：已明確不用於當前正式產品；並不必刪除歷史研究。

| 工具／方案 | 歷史記載的授權或風險 | 已留下什麼 | 今天的定位與可保留的價值 |
| --- | --- | --- | --- |
| **@napi-rs/canvas** | 1.0.10 MIT；封裝 native libraries 各有 notices | main Canvas pure-frame 及 S1 adapter | **MAIN_ACTIVE**，標準像素輸出；不是完整 Agent |
| **FFmpeg / ffmpeg-static / ffprobe-static** | ffmpeg-static 5.3.0 package GPL-3.0-or-later；binary/x264、H.264/ProRes patents/redistribution 独立 | hash-pinned Windows/Linux exporter／Alpha 技術測試 | **MAIN_ACTIVE**；商用輸出、軟體散布、codec 權利仍要區分 |
| **Noto Sans TC** | `@fontsource/noto-sans-tc` 5.3.0 SIL OFL 1.1 | 已鎖定中英文／字形 coverage | **MAIN_ACTIVE**；成片字型使用與散布字型檔的義務不同 |
| **Konva** | 獨立釘選 `10.7.1`，MIT 套件與 npm integrity 曾審核 | [批准](EDITOR-KONVA-ADOPTION-DECISION-2026-10-10.md)、實際 opt-in localhost 編輯器 | **MAIN_ACTIVE, EDITOR ONLY**：輔助手動局部編輯；不是最終 renderer，更不是全部產品 |
| **HyperFrames CLI** | upstream source Apache-2.0；`0.8.143` npm tarball/Studio/GSAP／transitive NOT globally cleared | [Draft #33](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/33) 實際原創 HTML→MP4/Alpha MOV；[Draft #39](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/39) 1080p isolate；[#44/#46](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/46) license audit/correction | **ISOLATED_PROVEN (CLI)**；保留 alternative benchmark，**不可**因此採用 HyperFrames Studio GUI |
| **HyperFrames Studio / GSAP-backed no-code visual editor** | GSAP Standard **No Charge 非 MIT**，特定競爭性視覺動畫建構器限制適用，即使 local/private/free；tarball 可能帶已編譯 GUI | [PR #46 修正](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/46)、[正式分離決策](EDITOR-SEPARATION-ROADMAP-2026-10-10.md) | **EXCLUDED**（當前正式 GUI 路線）：使用者選擇**不聯絡授權方／不購買額外授權**，不要以匿名本機為合法豁免 |
| **GSAP 一般補間程式庫** | 標準 No Charge 條款；一般動畫作品可能可用，但競爭性可視化編輯器風險個別分析 | License register、#46 | **CONDITIONAL**；不能把一般動畫的許可直接推論到 no-code Studio／CodePen assets |
| **Theatre.js Core** | Apache-2.0 | [Draft #24 M10](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/24) Core 動畫資料與 Canvas frame evaluation 等驗證 | **ISOLATED_PROVEN**；可研究參數／timeline，但未進 main |
| **Theatre.js Studio** | AGPL-3.0，與 Core 不同；發佈／修改／network 義務需要單獨評估 | [Draft #24](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/24) 瀏覽器 keyframe/GUI 研究 | **EXCLUDED FROM PRODUCTION GUI**；歷史 Draft 可供已驗證行為參考 |
| **Remotion** | source-available / entity-specific Free & Company terms，**不是 MIT**；個人、團隊、公司操作與交付物型態需分別判斷 | legacy isolated source、[M9 研究](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23) | **CONDITIONAL / NO MAIN DEPENDENCY**；不能因別人的 Skill MIT 就當 Remotion 可免費商業內嵌 |
| **Motion Canvas** | 歷史記為 MIT；render/preview 架構另需依賴稽核 | 正式 licenses、M9 research | **RESEARCH_ONLY P2**：場景抽象／component architecture，非預設引擎 |
| **Three.js / React Three Fiber / postprocessing** | Three.js MIT；具體外部依賴／素材逐項查核 | ARCHITECTURE、Issue #5、license shortlist | **RESEARCH_ONLY P2**；先有 2D 功能缺口再採 3D |
| **ThreeUI Community** | 社群 code 標示 MIT，但 bundled models/assets／Pro packs 權利不等同 | 正式 license register | **RESEARCH_ONLY P2**：原創 3D/UI pattern，Pro／網站預覽資產不可直接挪用 |
| **Fabric.js** | MIT | Editor shortlist | **RESEARCH_ONLY ALTERNATIVE**：與 Konva 比較，不能無理由兩者都裝 |
| **React Timeline Editor** | MIT source，但 React peers/interactjs 等 transitive 須查 | Editor shortlist | **RESEARCH_ONLY ALTERNATIVE**：時間軸 UX，不等於 Bezier editor |
| **Moveable** | MIT | Editor shortlist | **RESEARCH_ONLY ALTERNATIVE**：DOM 幾何變換，如必要才試 |
| **Motionity** | 編輯器 UX／依賴與素材授權未完全查核 | Issue #5、M9、Editor shortlist | **REFERENCE_ONLY**，不可複製打包素材 |
| **tldraw SDK** | restricted SDK licensing／production keys 或其他商用條件 | Editor shortlist | **EXCLUDED**：非視為 MIT 的免費 GUI 替代方案 |
| **Motion Designer** | 歷史記錄其 source MIT；模型／聲音／外部元件另查 | [license register](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md) | **RESEARCH_ONLY P1**：Agent 導演／分鏡／motion QA，優先研究**原創規則**而非 runtime 更換 |
| **Motion Video Kit** | 歷史記錄 source MIT；依賴／範例素材另查 | license register；[Draft #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) 參考其通用 QA 原則實作原創檢查器 | **RESEARCH_ONLY P1**：builder/critic、可讀性／閃格／節奏評估 |
| **HTML Animation** | 歷史記錄 source MIT；可能有 browser/render dependencies | license register | **RESEARCH_ONLY P1**：Agent skill／single HTML／frame-exact 影片技術的隔離試驗 |
| **Video Shotcraft** | repository source Apache-2.0，**Remotion runtime／音樂／影片另行授權** | 原創 scene recipe／gallery 動態語法索引建議 | **REFERENCE P1**，商業作品不得直接複製 gallery media |
| **OpenMontage** | AGPL-3.0（含網路／散布議題） | License register | **RESEARCH ONLY**：可研究 Agent 生產架構，不合併整套程式 |
| **OneTake** | PolyForm Noncommercial 1.0.0 | License register | **EXCLUDED FOR COMPANY ADS**：個人擁有 repo 不代表幫公司製作廣告不算商用 |
| **Video Talkcraft** | PolyForm Noncommercial 1.0.0 | License register | **EXCLUDED FOR COMPANY ADS**：不使用程式／Skill 製作商業廣告，除非取得合適許可 |
| **LottieFiles motion-design-skill / lottie-web** | MIT 各自 source；外部動畫 JSON／模板／素材權利另查 | [20 專案研究](X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md) | **REFERENCE**：motion principles；沒有需求不裝 web player |
| **Motion.dev** | 歷史記為 MIT；web motion framework | 20 專案研究 | **REFERENCE**：spring／gesture vocabulary，現階段不裝入 Konva root graph |

20 專案研究另外包含 `claude-motion`、`claude-motion-design`、`motion-graphics-skills`、`claude-remotion-skill`、`klik-anim-skill-creation`、`hyperframes-motion-reel-skill`、`product-launch-motion`、`animate`、`motion-design-skills`、`hyperframes-student-kit`、`remotion-dev/skills`、`awesome-motion-design-agent-skills` 和 `Barty-Bart/motion-graphics`；各自實際 license/素材注意事項在原始 [20 專案表](X-MOTION-OPEN-SOURCE-REVIEW-2026-10-10.md)。**沒有開箱就能商用的 20-pack 認證。**

## 逐項權利判斷：過去的特殊討論確實有保存

### 使用案例

使用者個人擁有這套工具、不出售為 SaaS；但會用來製作**公司可商業播放、修改、交付**的廣告影片。**工具是私人持有／repo private，不能消除工具商用條款**。重要的區分包括：(a) 操作工具的法人／人數／權限；(b) 輸出獨立原創 MP4 是否帶有必須片尾標注；(c) 是否移交可編輯程式／Studio／依賴；(d) 字型／照片／音樂／logos／codec；(e) GitHub 主專案授權仍未決定。

### 不可混淆的六條規則

1. **免片尾授權字卡**：公司廣告不接受第三方素材或工具強制片尾 credit；但 MIT／Apache/OFL/GPL 或其他**軟體／編碼器本身**的散布／NOTICE 責任可能仍需在隨附軟體中履行。無法只靠 license label 判定真正的成片權利。
2. **素材不等於工具程式碼**：公開影片網站、prompt、展示 gallery、CC-BY 音樂、商標／UI 外觀／人物及背景字型，不會因 repo 的 MIT/Apache 授權就自動取得成片權利。CC0 素材的標示也需有可驗證來源。
3. **GSAP 最晚糾錯優先**：[Draft #44 的原始報告](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/44) 中若出現「只限制付費 SaaS」或 Green 判斷，已被 [Draft #46](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/46) 推翻；不應引用先前肯定句當法規結論。使用者決定**不用 HyperFrames/GSAP Studio GUI，不聯絡上游，不付費拿權利**。
4. **Theatre Core 和 Studio 不同**：Core Apache-2.0 不代表 Studio AGPL-3.0 可任意用於私有廣告製作工具，更不代表把 Studio source/bundle 放進 main。
5. **Remotion 實際資格未證明**：官方 Free/Company 條件要依真正運作者、團隊與交付的形式判斷；依賴它的 template/Skill 即使 MIT，也不能替引擎解決授權。
6. **FFmpeg 演算法與散布分離**：FFmpeg-static 包、實際 FFmpeg/x264 二進位、GPL/LGPL/專利／codec 條款各自處理。技術 FFprobe/Alpha 檢查和最終合法發布是兩個 gate。

### 未完授權與避免誤判的證據欄位

| 問題 | 歷史狀態 | 接續作法 |
| --- | --- | --- |
| AI Motion Studio 自己的原始碼 LICENSE | **UNDECIDED** | 由 owner 最終選擇；公開 GitHub 不等於 MIT |
| 每個候選引擎的確切版本、tarball/NOTICE/transitive | 只有少數做過隔離驗證，**不是全數合格** | 真要引入時檢查上游現行官方條款、pin SHA／npm integrity／許可文本及非程式碼素材 |
| 音訊、字型、公司媒體、付費素材 | 來源許可需要每一項證據 | 不能把 private NAS／Drive／license receipt 公開提交 |
| 原版外部動畫參考影片是否真正看過 | M11/M12 相關 X 原影片**未實際觀看** | 不能假稱逐格模仿或達成 reference parity |
| 1080p MP4／ProRes Alpha 技術輸出 | 部分 main／isolated CI 已技術驗證 | Premiere 原生匯入、實際合成及人工藝術審查仍各自待驗 |
| 產品是否使用新 AI 模型／付費 provider | **未授權自動導入** | 可以先用既有 Codex Agent + checked-in constrained specs 證明流程；需實際 provider/API 才另問 |

## 工具研究如何回到原始產品優先順序

**先做**：比較 [Motion Designer](https://github.com/kaventro/motion-designer)、[Motion Video Kit](https://github.com/echris6/motion-video-kit)、[HTML Animation](https://github.com/acelera-agency/html-animation) 中已記錄、權利清楚且可原創重寫的 Agent planning、motion QA、timing 技巧；重用已經存在的 M7 `brief → SceneSpec` 和 M9 模板 registry 思路。每次都用原創兩個 brief 實際跑完整動畫和檢查，**不是只增加工具清單**。

**暫不做**：再做通用 AE 式 editor 面板、直接用 HyperFrames Studio／GSAP Studio、替換 Canvas、導入 Remotion、商業環境下使用 PolyForm Noncommercial 專案、引入無法驗證權利的示範影片。

**後續才做**：同一 brief 的正反面 benchmark 證明 Canvas 達不到明確的動畫能力／品質／效能時，再考慮 MIT/Apache alternatives（例如 Motion Canvas 或隔離 HyperFrames CLI），仍需個別 dependency/media/使用目的權利查核。Konva 保留為生成成果的輔助調整工具，不是產品唯一方向。

對應恢復的 [產品願景與分階段路線圖](RECOVERED-PRODUCT-VISION-AND-ROADMAP-2026-10-11.md)。

## 此地圖保證與不保證

- **保證**：已實際根據 main 的正式登錄簿、20 案清單、Editor 授權決定，以及具體舊 Issue／Draft PR 檢索來源；不因沒合併就說「沒研究過」。
- **不保證**：上游在 2026-10-11 沒變更任何 license，或每個依賴／案例都有法律意見、技術 CI 與藝術評分。需正式商用導入的項目再重新查證 upstream primary sources。
- **不授權**：把上述候選全部安裝、合併歷史疊加 PR、購買/聯絡授權方、使用公司素材、解除 M11/M12 冻結、啟用新音訊／生成模型服務或替換當前渲染器。
