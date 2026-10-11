# AI Motion Studio — 產品構想復原與開發優先序（2026-10-11）

> **性質：既有決策復原／來源索引／提案排序；不是新的引擎、素材、美術、授權或整合許可。**
> 任何狀態應以最新 main、Issue、PR 與 exact-head CI 為準；歷史文件中的勾選欄位或舊 SHA 不能取代即時查證。

## 一、原始產品目標（不是 AE／Premiere 替代品）

**主要產品：對話驅動的 AI 動畫生成系統（conversation-driven motion-graphics production tool）。** 使用者以自然語言提出需求，在一般對話中由 AI/Codex Agent 規劃動畫、挑選已驗證模板／動態語彙、產生受限 SceneSpec、輸出確定性影片與審查證據、根據結果反覆修改，最終由使用者審美／商用授權核准。**不應要求使用者從零手動設計所有圖層和關鍵影格。**

原始完整循環：「Natural-language brief → motion direction/storyboard → implementation → deterministic render → MP4 + sampled frames/contact sheet → visual QA → revision → approved final render」。

**直接原始來源**：
- [Issue #4：standalone conversation-driven production roadmap](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4)：產品目標、獨立執行、SceneSpec、三類實用動畫、基準測試、成功定義
- [Issue #5：reliability／visual-QA／asset-rights／template registry audit](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/5)：四階段可重現性、視覺檢驗、可重用場景與 Agent benchmark
- [Issue #11：advanced multi-shot original animation POC](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11)：12–15 秒／4–5 shot／持續物件／雙比例重排／兩個 brief；明確反對把專案變通用編輯器
- [README goal](../README.md)、[ARCHITECTURE](ARCHITECTURE.md)、[INTEGRATION](INTEGRATION.md)：animation-first，成熟功能才選擇性遷移到 `ai-video-template`，現在保持獨立

這是**產品目標已被清楚記錄**，不是聲稱「自動簡報→影片的一鍵完整系統」已開發完成。AI 驅動的完整 brief→spec→render→review loop 仍是未完成驗收項目。

## 二、找回的創作架構（草稿不等於正式採用）

| 過去的設計／測試 | GitHub 原始來源 | 今日可確認的定位 |
| --- | --- | --- |
| 動畫導演：brief → treatment → scene-plan → QA | [Draft #9](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/9) 的 `DIRECTOR.md`、`TECHNIQUE.md`、`styles/editorial-motion/STYLE.md` | **UNMERGED PROPOSAL**：有完整語法和規格，但並非 main 上已核准的唯一美術風格 |
| 6 秒 editorial 兩種 brief | [Draft #10](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/10) | **UNMERGED POC**，影片／測試不代表高階視覺品質過關 |
| 原創資產權利驗證、持續物件及進階 12–15 秒動畫 | [Issue #11](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/11)、[Draft #12/#13/#14](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/14) | **UNMERGED ENGINEERING/ART POC**；早期進退場與版面品質被指出不足 |
| 動態遮幕與段落連續性 | [Draft #19](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/19) | **UNMERGED R&D**；針對轉場時畫面文字重疊問題 |
| 兩種故事共用 brief → SceneSpec | [Draft #20](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/20) | **UNMERGED R&D**；已有受限編譯和兩個不同 brief，但不是任意自然語言模型 |
| Learning Lab 獨立構圖語法 | [Draft #22](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/22) | **UNMERGED R&D**；針對只換字／換色卻版面相似的缺點 |
| 動畫元件／模板登錄、按 beat 編排、權利檢查 | [Draft #23](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23) | **UNMERGED R&D**；不要忽略已有模板 registry 原型或直接合併整個 stacked 分支 |
| Motion QA：空白、Alpha、安全框、凍結、移動異常 | [Draft #29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) | **UNMERGED R&D**；可供品質檢查設計參考，不能自動通過美術審查 |
| M11 Product UI 視覺處理 | [Draft #25](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/25) | **VISUAL DIRECTION REJECTED**，僅留迴歸／歷史證據 |
| M12 參考導向重做 | [Draft #26](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/26) | **FROZEN/NOT APPROVED**，參考影片未完成可觀看驗證，禁止自行重啟 |
| S1／S2／S3／S4 scene、Konva 與 Canvas+FFmpeg | [Editor Roadmap](EDITOR-SEPARATION-ROADMAP-2026-10-10.md)、[批准文件](EDITOR-KONVA-ADOPTION-DECISION-2026-10-10.md) | **已實作的底層與可選編輯器**；不是產品願景的上限 |
| S1 v2 可調幾何與隔離互動研究 | [Draft #96](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/96) | **研究授權／未合併**；矩形尺寸、文字排版與 Konva 校驗可保留，暫不升級正式使用者場景 |
| 6 秒 S1 簡易範例 | [Draft #93](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/93) | **技術展示，不是 AI 動畫品質的驗收標準** |

上述草稿需先從目前 PR head 重新確認來源、測試和依賴，再**選擇性重構、重測**；不可大規模合併 #8 → #26 疊加分支，也不可把早期 rejected style 偷渡成 approved design。

## 三、架構角色與優先順序（推薦整理；尚未核准新增工具）

1. **AI/Codex 創作導演層（核心產品）**：接收自然語言 brief；寫可審計的 treatment、shot/beat plan、技術與權利約束、SceneSpec；拒絕不受支援的規格或未授權素材。必要時先人工審稿，**無需新模型付費 API 才能研究這層**。
2. **場景／模板與高品質技術層（核心產品）**：把 M7 Brief/SceneSpec、M9 registry、原創設計語彙及 M3/M4 多鏡頭元件的**可用部分**重新驗證。目標是高品質的 2D kinetic typography、logo reveal、infographic/product UI；持續物件與 16:9／9:16 分別重新排版，而不是只換色或放大方塊。
3. **確定性渲染層（基礎設施）**：當前唯一已核准預設路徑仍是鎖定字型的 Canvas + SHA 驗證 FFmpeg，H.264／獨立 ProRes Alpha；未經實測與核准不得替換。**此技術選擇不是要刪除其他工具研究**。
4. **技術＋視覺 QC／回饋層（核心產品）**：frame hash／黑畫格／突變／codec／Alpha／版面／可讀時間／16:9、9:16 全速動畫審查；技術 PASS 與人工創作 APPROVED 分開。
5. **可選手動修正 GUI（輔助產品）**：Konva S1 v1 現有編輯器，及 Draft #96 隔離 v2。只用於局部調整，不應成為每個 brief 的必經手動 AE 式創作流程。
6. **引擎／新形式候選（研究側）**：Motion Designer、HTML Animation、Motion Video Kit 的 Agent/QA 思維；HyperFrames CLI、Motion Canvas、Three.js 需要具體能力缺口和獨立 license/quality benchmark 才可能成為候選；不引入未批准 Studio GUI。

所有工具的**個別授權、商業用途限制與採用狀態**，見 [Recovered Tool and License Map](RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md) 與原始 [完整授權登錄簿](TOOL-ADOPTION-AND-LICENSE-RESEARCH-2026-10-09.md)。

## 四、恢復主軸後的交付切片

| 優先順序 | 可執行範圍 | 可驗證交付／停止條件 |
| --- | --- | --- |
| **P0 — 知識恢復**（本份文件） | 交叉連結原始 Issues、Draft PR、工具與授權總表；把決策狀態分成 MAIN／DRAFT／R&D／REJECTED／FROZEN | 有可追溯索引，無新 npm／媒體／渲染器／美術採用 |
| **P1 — Agent 最小閉環**（下一個研究／提案） | 以**兩個不同原創 brief** 做 brief → treatment → bounded SceneSpec → 既有 Canvas MP4 的編排；僅用受限模板／已驗證程式，不改每份 JS 來源；將 M1/M7/M9 Draft 作為候選來源而非自動合併 | 兩個 brief 均產生完整可觀看影片與規格／hash／preview／報告；若 SceneSpec 或 renderer 不支援需求，列明不可支援，不偽裝完成 |
| **P2 — 真正的動畫能力／模板品質** | 根據原始 Issue #11 建立多鏡頭、至少一個持續物件、可辨識不同的故事／構圖、橫豎雙版本；先實測 full-speed 視覺，不是只做固定色塊或 Contact Sheet | 記錄布局與進退場缺陷；人類可對品質明確通過或退件。沒有藝術核准不得併入已核准模板 |
| **P3 — Agent 回饋迭代／品質量表** | 將 M29 等合成 QA 證據**選擇性**串入 renderer-independent review，新增逐 shot／逐 beat 連續性與閃格警示，人工修正紀錄可重現 | 一個確定性失敗案例可指出、重現、修改再驗證；不能把機器分數當審美授權 |
| **P4 — 編輯器／幾何 v2**（低優先於生成閉環） | 保留 Draft #96；僅待需求證明「brief→SceneSpec」缺什麼可編輯幾何，才提案 opt-in v2 adapter 與 reversible migration | 另行核准正式 schema／整合；不得覆寫本機 v1 或自動合併 |
| **P5 — 替代引擎／3D／實際素材** | 具體動畫比較有顯著差距時，才獨立評估 HyperFrames CLI、Motion Canvas、Three.js/ThreeUI、音訊／外部媒體；先清理 licence 和 provenance | 以同一原創 brief 對比真正可看的輸出、成本、效能、授權；沒有明確優勢不換正式引擎 |

**關鍵順序修正**：不需要在所有 editor GUI 功能完成後才做 P1。動畫生成、模板與 agent 迭代，應先有實際的 end-to-end 對話→影片證據。**此排序是從舊決策恢復的優先建議，不是單方面批准新功能／schema。**

## 五、仍需使用者決定的真正關卡

- 具體動畫美術品質／新標準與重啟 M11/M12（已拒／凍結）。
- 把 S1 v2 新 schema／儲存遷移／editor+encoder 正式整合；替換正式渲染器、導入新付費／限制授權套件。
- 真正第三方或公司影片／音訊／字型／商標／人物授權；私有 NAS／Drive／廣告 State Engine。
- 本機 Premiere 導入／實際合成、真實商用交付和任何破壞性操作。

其他**不改產品架構、僅合成測試與文件**的工作，可以在既有授權範圍內依小 PR、確切 SHA、CI 和真實差異審查前進。Issue [#90](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/90) 的 Windows 技術 PASS 不等於 Premiere／美術 PASS；[#91](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/91) 仍僅為 reference-only。

## 六、下一個 Codex/ChatGPT 工作入口

> 先讀此文件、[工具／授權映射](RECOVERED-TOOL-AND-LICENSE-MAP-2026-10-11.md)、[AGENTS](../AGENTS.md)、[CONTINUE-HERE](CONTINUE-HERE.md) 和 LIVE GitHub。以 Issue #4/#5/#11 為目標，不要只提升 Konva 编辑器。先找出原始 M1、M7、M9 Draft 能合法、安全重用的最小 brief→SceneSpec→Canvas 渲染／review 部分，提交獨立 Draft、原創兩份 brief、精確 head CI 與實際全速影片。禁止重啟 M11/M12、不替換 renderer、不複製外站素材、不導入新的未授權套件、不自動合併 stacked Draft 或公開公司資料。若需 schema、外部素材、重大引擎／授權／美術決策，再請求使用者。

**證據邊界：** GitHub 的文字和 PR 可恢復已記錄的構想；無法保證回復所有逐字聊天細節。任何改動不應假裝歷史提案已得到美術或法務正式核准。
