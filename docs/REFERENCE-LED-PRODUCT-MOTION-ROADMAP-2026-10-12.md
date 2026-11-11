# AI Motion Studio｜2026-10-12 實際參考影片後的新版創作路線（研究／待採用）

**狀態：OPERATOR-REQUESTED REASSESSMENT / ROADMAP PROPOSAL，非程式碼／引擎／授權／美術正式採用許可。**

## 本次指令與正確邊界

操作者明確要求「參考這些影片，但不是照抄。根據你學習到的東西，確認目前的計畫有哪些需要調整，給我更新後的計畫並確實記錄」。應保存所觀察到的動畫方法及優先調整理由，不能把源影片、音樂、品牌、UI、美術、腳本或 prompt 整段搬入公開專案。這次沒有要求合併正式主線、購買商業套件、解凍 M11/M12、採用第三方素材或變更商用權利。

本次已用**使用者提供的原始完整 MP4**（非網站海報、X 文本或 prompt 推測）讀取視頻規格、以固定時間間距解碼抽格並觀察畫面序列。逐格抽樣能支持畫面順序與結構性觀察，不能聲稱完成所有畫格/整部音樂的視聽藝術驗收。

| 原始作品 / 來源 | 實際 MP4 技術資料 | 可觀察的構圖、視覺敘事重點 | 不能直接推論 |
| --- | --- | --- | --- |
| [Photo print app launch](https://prompt-motion.com/twoclipping-221cab) | 1440×1440, H.264, 60fps, 1741 畫格，29.0167s video；AAC 48kHz stereo | 文字品牌→黑點／pill→照片選擇→照片調整／glass UI→手機及網頁 UI→客製裱框／訂購→實體相框與品牌回收；資訊形式更新但創作概念保持連貫 | 網站 prompt 的 54 beats 不等同 29.0167s 成片；未證明每次轉場由同一個 DOM element 實現 |
| [UGC ad generator promo](https://prompt-motion.com/twoclipping-6dd14e) | 1920×1080, H.264, 60fps, 1200 畫格，20s；AAC 44.1kHz stereo | 開頭數字／文字 hook→功能 UI／網址輸入→真實直式影片牆→生成文案和輪播→選中單片與數據看板→強調關鍵結果→品牌 | 動畫中出現的 4.2x/金額等字樣只屬參考作品畫面；對任何其他產品不構成可用的成效證據 |
| [Food craving launch](https://prompt-motion.com/ultimaxbt-2ddf1e) | 1920×1078, H.264, **30fps**, 487 畫格，16.2333s；AAC 48kHz stereo | 輸入文字需求→文字作為動態節奏材料→等待／形狀互動→菜色結果卡片→確認／訂單→簡潔結尾；字詞、按鈕和結果物件承擔訊息演進 | 原 prompt 要求 1920×1080/60fps/15s，**實際檔案不符**，證明 spec ≠ encoder fact；不能強制所有作品保持相同色盤／餐飲敘事 |

這三支都以**產品／UI／內容**的清楚訊息為中心，比單純「多個發光 3D 物件」更貼近目前希望建立的專業商業動態設計能力。但上述不是對個別創作者實際源碼或素材授權的鑑定。更早的 Prompt Motion Showreel / Realtime 3D 主站研究詳 [PR #110](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/110) 與既有參考分析。

## 調整前 → 調整後（提案）

| 軸線 | 過往工作重心 | 新建議／為什麼 |
| --- | --- | --- |
| 導演入口 | 增加特效庫／3D primitive，再組合鏡頭 | **需求 → 觀眾／產品承諾 → 一句核心概念 → 可視化事件鏈 → Signature Shot → 分鏡／聲音 → 選引擎**；不讓技術反過來決定藝術 |
| 動畫基礎單位 | 場景片段、字卡、遮罩、鏡頭特效 | **語義物件與行動／回應（Visual Lineage + Causality）**。每個轉場需說明來源與去向，支援真 morph、match cut、動機性切換；不禁止必要硬切 |
| 產品語言 | 抽象 3D／技術示範偏重 | **2D／UI／文字／媒體合成優先**，3D 材質和攝影機只有在能解釋空間或商品意義時採用，避免工具清單化 |
| 節奏 | 動態多寡、固定 easing/BPM | 按專案選 **節拍驅動／鏡頭敘事／刻意留白**；以已核准音軌實際 onset/節拍判斷，不預設每部120 BPM、60fps、無 crossfade |
| 品質 | 靠測試通過或出片後請使用者抓錯 | **分鏡文字 → 關鍵構圖 → 每拍／轉場抽格 → 全速有聲影片 → 自我缺陷修正 → 人類美術驗收**；技術客觀檢查與藝術評價分開 |
| 重用 | 各自硬寫 1 支 HTML／scene | 跨兩種原創主題驗證同一套 brief→treatment→scene/timeline/renderer，可更換腳本但不必複製整片程式 |
| 商用／真實性 | 只證明 renderer 輸出檔案 | 對照片／影片／字體／音樂的來源做授權核對；所有廣告成效、數據與產品效果敘述有證據才使用。範例素材不得進公有 repo。 |

## 新版交付順序（有停止門檻，不以增加 PR 數量當成果）

### P0 — Reference → Motion Grammar（已完成初步範例研究；細節驗證仍可補）
- 將已核實的原始 5 支以上參考影片按**概念／元素身份／使用者操作／品牌物件／轉場理由／聲音節奏／片尾功能**標註。
- 為每個觀察標示 OBSERVED_FRAMES / PROMPT_STATES / INFERENCE，不混淆它們。
- 交付：可查詢的多種動態語法與反例準則，不保留可重製第三方作品的鏡頭逐格素材。
- **完成門檻**：能用同一套欄位解釋至少兩種截然不同的影片風格，且指出源片規格與 prompt 規格不一致的事實。

### P1 — Creative Director 能力（從 #110 的人工 treatment 檢查延伸）
- 以自然語言產品需求為輸入，產生**多種原創概念**，先自評出具視覺意圖的候選創作方案。
- 導演輸出需包含：觀眾與真實訊息、視覺主軸、signature beat/shot、故事起訖、物件身份變化圖（origin→transformation→destination）、逐鏡頭 camera purpose／UI action & reaction、色彩／字體語法、節奏與音訊、禁用無意義效果、權利／事實來源、可用技術與備案。
- 保留 2D 快節奏與具空間敘事的 3D 等**不同語法**，不能把 3 片抄成「通用照片卡→手機→購物車→Logo」。
- **門檻**：對兩個不同原創 brief 能提出可讀且可測的非同構 storyboard；否則不先新增 renderer。
- **當前事實**：[Draft #110](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/110) 僅會驗證人工先寫好的 treatment，尚不具備真正 AI 自主導演／選方案的能力。

### P2 — 最小完整作品實作（真正改善可看成片）
- 以一支原創 **2D／UI 主導** 的短片作第一個候選：清楚產品／操作／回饋關係、主物件繼承、精確遮罩、可讀字級、音訊事件節點（可先用原創合成 SFX）。
- 再以**不同視覺敘事**的第二個原創 brief 作跨作品驗證；不應以複製第一支程式和換字色計數。
- 工具按實際需求選：HTML/SVG+GSAP 與 seek(frame) 可供隔離試作；真正空間需要才用 Three.js；Playwright/FFmpeg 用於逐格渲染；HyperFrames CLI 仍是研究選項。既有 Canvas+FFmpeg 正式預設及 Konva 獨立輔助不變。
- **門檻**：兩支完整、可播放、原創合成畫面的影片，能追查簡報→分鏡→程式→實際 MP4；至少一個表現出複雜但自洽的 UI/文字/內容變形，並有不只一種物件關係。

### P3 — 音訊、畫面與品質閉環
- 音訊／動作：基於實際檔案分析 BPM/重拍/峰值和事件時刻，不能只把 action start 當成 SFX hit；版權未核可時只用自有合成／靜音測試。
- 連續幀：文字重疊、遮罩、z-order、空白／跳幀／曝光跳變、臨界字型、子幀運動模糊／aliasing、不同尺寸以及真正編碼輸出的 fps / resolution / duration / codec 檢查。
- 影片應看**全速且有聲音的成片**，並分開記 TECH_PASS、ART_OPEN、RIGHTS_PENDING；不可用一張 contact sheet 或 CI PASS 取代美術判斷。
- **門檻**：系統能主動回報並修改可測得的缺陷；提供連續時間點的前後畫面及理由；品質審查不能再只圍繞舊 V1–V4 的局部問題。

### P4 — 正式產品整合（獨立決策關卡）
- 完成隔離的雙 brief 真影片後，比對產能、成本、UI 可維護性、依賴及商用授權，才討論是否把某種輸出引擎/scene contract 納入正式產品；不是「先把 99–110 個 PR 合併」。
- **人類關卡**：實際美術觀感、商用素材及音樂／字體權利、重大架構／新依賴／v2 schema、真實公司媒體、最終 Windows Premiere 編輯相容。
- 工程通過≠藝術通過≠商用可使用。

## 現有進度與重用盤點（避免白做／重複研發）

- `main` 的 Canvas+FFmpeg 正式輸出與可選 Konva/S1 保留，**未因本提案變更**。
- [Draft #9](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/9) Creative Harness、[#20](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/20) two-brief SceneSpec、[#23](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/23) 模板 registry、[#29](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/29) motion QA 均應**先盤點介面並重用適當部分**，不是平行重寫。
- [Draft #99–#109](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/109) 的 GSAP/Three.js/Shader/3D 連續性技術維持隔離研究，作為按需選用的專門工具，不是預設創意方向。
- [Draft #110](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/110) 的 reference-led treatment preflight 保留，注意它只是 bounded manual treatment QA；不應誇大為 AI Director 已完成。
- 禁止復活遭拒 M11、解凍 M12、從參考作品挪用實拍、把源 MP4/私有 Drive ID/資料加入公開 Git，或在沒核可時大幅更換 editor/renderer/licensing。
- 目前尚不清楚操作者「這次」最終成片的具體產品腳本／商業主張，因此此路線**針對產品廣告動態語法建基**，不替特定真實商品假造賣點、UI 內容或成效數據。

## 下次換新對話的接續指令

從 [Issue #4](https://github.com/rayray12zx3-sys/ai-motion-studio/issues/4) 最新 2026-10-12 留言和本提案開始，讀 `AGENTS.md` + `docs/PRODUCT-CHARTER-AND-DRIFT-CHECK.md` + `docs/CONTINUE-HERE.md`，確認 live main/PR。操作者要「參考但不照抄」三部完整產品動態廣告 MP4；當前優先 **Creative Director／物件因果／UI 合成／音訊／實片自我 QC**，不是再擴張 3D 特效或重修 V1–V4。只有兩個原創 brief 的高品質可播放影片候選及外觀／商權／引擎決策才需人類介入。對未有品質驗收或權利證據保持 PENDING。

## Product Charter START/FINISH drift check

| Field | START scope | FINISH evidence and boundaries |
| --- | --- | --- |
| Goal impact | 以實片創作方式重訂 pipeline 優先級，避免特效化漂移 | 研究／設計路線，不宣稱新影片或 AI Director 模型實作 |
| Source & decision | Operator 明確要求研究修訂並留存；改變採用優先次序仍屬待確認提案 | 沒有更動已核准的 renderer/editor/M11/M12 |
| Deliverable & proof | 實片時間取樣、prompt/source 差距、可執行階段門檻及 GitHub 連結 | 三支已本機讀取的影片規格與 storyboard 抽樣支援研究；藝術仍 PENDING |
| Tools, rights, separation | GitHub 文件和 Issue 僅存非私有文字研究 | 沒有匯入網站素材、商用作品、雲端分享網址或新增套件 |
| Next and stop gate | P1 從現有 Draft 抽取導演合約 → P2 真正生成兩個原創候選 → P3 實片 QC | 在可觀看專業程度／授權／正式移植決策才詢問操作者 |

**本文件不是編輯產品章程，也不是核准優先移植任何 Draft；產品章程的分類仍優先於此提案。**
