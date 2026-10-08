# Production dependency and license inventory

The production engine requires no subscription, creator seat, provider account or commercial SDK license key. This does not waive third-party redistribution obligations or codec patent questions.

| Dependency | Pinned version | License / role |
| --- | --- | --- |
| @napi-rs/canvas | 1.0.10 | MIT package; Skia and packaged platform libraries retain their own notices; local 2D rasterization |
| @fontsource/noto-sans-tc | 5.3.0 | SIL OFL 1.1; explicit Traditional Chinese fonts |
| ffmpeg-static | 5.3.0 | GPL-3.0-or-later package; its selected FFmpeg/x264 binary has separate bundled license/build notices |
| ffprobe-static | 3.1.0 | MIT wrapper; FFprobe binary retains FFmpeg license terms |

Exact npm graph/integrity hashes are in `package-lock.json`. Binary hashes are recorded in each render report; installation checks the approved Windows/Linux x64 FFmpeg build hash. Do not redistribute tool binaries without their corresponding licenses and source obligations. Tool binaries and font files stay in ignored `node_modules`; rendered media stays in ignored `out`.

Primary references: https://ffmpeg.org/legal.html ; https://github.com/Brooooooklyn/canvas/blob/main/LICENSE ; the font package's LICENSE and metadata; each installed tool package's license files.

Remotion's Company License may be required for organizational use. Its old source and optional dependency declaration remain in the R&D lane (`src/remotion`, `legacy/package.json`). They are excluded from the production root dependency graph, smoke CI and production instructions. Do not execute that lane without separately resolving its license. See https://www.remotion.pro/license .

No repository-wide license is invented for pre-existing code; the owner's own-code license decision remains open. This does not add a paid runtime dependency.

## M8 font weight and original design assets

Learning Lab uses the **700-weight** bundled WOFF2 subset files from the
already pinned `@fontsource/noto-sans-tc@5.3.0` package, covered by the
same SIL OFL-1.1 license as weight 400. No extra font dependency or font
redistribution was introduced. The font subset SHA-256 hashes are recorded
in preview and advanced-render provenance. The 700 weight is typographic
contrast, **not a new typeface family**.

All new flashcards, 3-step study flow, tile heatmap and brand typography are
original local Canvas drawings. Fictional sample values do not substantiate
claims of educational effectiveness. The repository-own-source LICENSE
question remains unresolved.

## M9 finished-film attribution policy

The code differentiates final media from redistributed source/binaries.
Noto Sans TC OFL usage in video graphics needs no final-film credit;
redistribution of font files requires OFL. MIT/Apache source license
notices may be required if source packages are distributed. Current
ffmpeg-static executable includes FFmpeg/x264 GPL obligations if you
redistribute the encoder, and H.264 patents/territory are an independent
open issue. A CC0 asset label is not proof of legitimate upstream rights.
See `docs/COMMERCIAL-NO-CREDIT-POLICY.md`.
