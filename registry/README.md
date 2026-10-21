# Motion Prompt Registry — reference-only v1

AI Motion Studio 的**唯讀來源索引**，供動畫導演與美術審查 Agent 共用。純 Node 24 內建模組，無新 npm 依賴、無網路／瀏覽器執行、無生成費用；不更改渲染引擎／SceneSpec／字型／正式交付。

## 覆蓋與授權
- **Motion Prompt**：從 [official catalog.tsv](https://github.com/showheyohtaki/motion-prompt/blob/main/api/v1/en/catalog.tsv) 固定擷取 144 筆；6 packs（motion/camera/ui/lp/photo/motion2），原始欄位 id、分類、名稱、tags、摘要。上游 blob SHA：`8e1d64533ce3fbfa509a7619e972ff58bdffb3c6`，2026-10-21。原作 [MIT License © 2026 Shohei Ohtaki](https://github.com/showheyohtaki/motion-prompt/blob/main/LICENSE)。Prompt/規格/Canvas 參考**只存官方連結**；若使用原始程式碼必須保留 MIT 著作權授權聲明。
- **Kittenjam Motion Library**：8 張入口／分類卡片（1 個根入口加 7 種分類；分類不代表 7 個可獨立下載的動畫），**未查證重製許可**，不複製 Prompt、預覽或程式碼。
- **Prompt Motion 3D customize**：5 張實際公開頁面參考卡（3D 與作品集模板、UI 形變、網頁運鏡、產品宣傳），作者自有內容，**未查證重製許可**，不複製 Prompt、預覽或程式碼。
- 資料含 157 張卡；`REFERENCE_ONLY` 表示查詢參考，**不是商用素材/美術核准/渲染支援證明**。兩站的完整批量索引仍需逐項驗證來源與權利；Kittenjam 分類卡不得當成獨立動效數量，Prompt Motion 個別頁面不得視為授權重用。

## 本地查詢
```sh
node registry/cli.mjs info
node registry/cli.mjs search "文字進場"
node registry/cli.mjs search "懸停按鈕" --reviewer
node registry/cli.mjs recommend "驗證成功 字卡"
node registry/cli.mjs get MP-005
node registry/cli.mjs review MP-005
node registry/cli.mjs validate
node --test tests/motion-registry.test.mjs
```

`search` 的繁中別名是可解釋的關鍵字映射，**不是向量語意搜尋**；候選按詞彙相符程度排序，需 Agent 再核對動作意圖與實際來源規格。上游沒有透過 TSV 公布每筆效果的精確 easing/時長，因此本地索引不捏造這些參數，必須按 `motion_spec_url` 讀取官方完整規格。未做即時授權/可用性保證。

## Agent 消費介面
- `.agents/skills/motion-registry/SKILL.md`：Codex 或支援 Agent Skills 的執行器可發現。
- `registry/cli.mjs`：`info/search/recommend/get/review/validate` 每次輸出 JSON，供其他 Agent/subprocess 消費。
- `review` 輸出明確 `NOT_EVALUATED / PENDING_EVIDENCE / PENDING_HUMAN`，**不執行影片畫面分析，也不自動美術通過**。
- 如果其他 Agent 不能呼叫 repo CLI，只能透過 GitHub 讀取 `registry/catalog.json`，不能聲稱已原生接線。

## START / FINISH 防偏移檢核
| Gate | 本 PR 方案 |
| --- | --- |
| Goal | brief → 導演候選動作／美術來源驗收，降低重複找來源；屬 Agent 工程能力，**不是動畫產出或美術實測** |
| Decision | 本次操作者明確請求整合三來源；主線 Canvas/FFmpeg、Konva、既有 Draft 與拒絕/凍結設計不變 |
| Evidence | 凍結 144 官方 TSV 索引、2 站入口；Node 本地測試 + PR exact-head CI（結果需另附） |
| Rights | Motion Prompt MIT、保留 notice；另外兩站只存連結/獨立摘要；不引入字型/第三方程式/媒體 |
| Stop gate | source prompt 全量複製、他站廣泛爬取、正式渲染、人工美術、Windows Premiere 仍需獨立權利或實測 |

## 維護
僅由人工審核的 PR 更新 `catalog.json`；需比對上游 source SHA、ID 數量、真實連結、資產權利與衝突項。不要自動下載/執行上游 prompt、程式碼、影片，也不要在公開 CI 放私密資料。
