# P2 complete licensed-music v3 engineering evidence — 2026-10-12

**Operator requested:** previous procedurally synthesized music felt strange; acquire real free-to-use background music from a legitimate audio library (YouTube suggested as an example) and continue without seeking unnecessary owner approval. Selected the composer’s original incompetech.com CC BY 4.0 catalog. Download used the official `pieces.json` filename fields (**Cipher2.mp3** and **Floating Cities.mp3**) instead of unverified guessed URL strings. Public Github Actions music ingress CI and root CI at prior head both SUCCESS.

## Filmmusic replacement results (actual locally rendered and decoded; not just planned)
| | ARC / Thread | FOCUS / Aperture |
| --- | --- | --- |
| Composer/title | Kevin MacLeod, `Cipher` | Kevin MacLeod, `Floating Cities` |
| Official track page | https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100844 | https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600018 |
| License | CC BY 4.0 / title+author+link+edit disclosure required | CC BY 4.0 / title+author+link+edit disclosure required |
| Original excerpt | 12.0s–24.0s | 0.0s–12.0s |
| Film output | H264 1080×1920 30fps **360 frames**, AAC 48kHz stereo, exactly 12.0s | Same |
| Audio measured EBU-R128 | **−17.4 LUFS**, peak **−5.2dBFS** | **−19.1 LUFS**, peak **−5.2dBFS** |
| v3 final MP4 sha256 | `8de33b11afd27a1daf66e40fe5210404081c7872d4feb0ea4605c71feb1c5a05` | `2e8e0af408a2e57e4d786aed2d7c3cdd2c9e19568b50789cb9baaf164d087503` |
| Original song MP3 sha256 | `d3d0614535a61d748e2fd8d5117fc4d781022a7624794802a2462d8af3fdd522` | `e7365652410d1fbc8a14d87537855d625c1a5fa8b7de8c626f47c13256ef2ddd` |
| Copied video elementary stream hash | `f3b039597bb438fc01bf461f004b9179710ab991098bebe53ca69ebfa39f77a1` — byte-identical to v2 | `4d59b3f93f4918435e6dc80ad825ed1bf54373565a4dbb24a5fbe95fa27c0be0` — byte-identical to v2 |

The old synthetic audio was **entirely dropped** (`-map 0:v -map [licensed-music]`; source audio not mapped). This edit was deliberate: do not represent it as adding old synthesizer SFX. Film geometry/color/frames are unchanged. The actual user-facing v3 videos, complete licensed source MP3s, detailed audio QC and **VERIFIED_v2** publication-credit notice were stored in the user's authorized **private preview Drive folder**, then confirmed independently by listing. No Drive file IDs/paths/media are added to this public repository. Original v2 films retained, not overwritten. Earlier imprecise credit notice is marked SUPERSEDED privately.

## Requirements for reproduction and publication
- `remix.py` is a source-only remix recipe requiring approved private input video files and appropriately licensed two real MP3s; those assets are NOT in this repository. Configure `P2_FILM_DIR`, `P2_MUSIC_DIR`, `P2_OUTPUT_DIR`, FFmpeg and FFprobe and run it. It deliberately fails without source bytes.
- License requires actual end-user-accessible attribution and change notice when the video is published. The companion `MUSIC-CREDITS.md` contains exact author, title, license and edits; **a companion private folder file alone does not suffice for public YouTube distribution unless the credit is also supplied publicly with the work**.
- GitHub workflow validates the **music source file** and publishes brief-lived CC BY artifact **with the required credit notice**, permissible under CC BY with attribution; CI cannot reproduce private video remuxing and should never claim to do so.
- Media music rights do **not** clear product/advertising claims, fonts, trademarks or original synthetic scene quality. **ART_OPEN**; no audible/visual art-quality assertion based on codec measurements. YouTube audio library was researched but not scraped/ripped.
- This is **isolated research** stacked after #113; no root Canvas/FFmpeg/Konva official runtime, private video upload to public repo, paid service or model provider installation. Further P2 creative-quality research remains separate from this narrow licensed music repair.
