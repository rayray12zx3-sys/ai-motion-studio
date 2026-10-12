# AI Motion Studio — Original dual-brief P2 prototype (2026-10-12)

## Intent and scope
Two ORIGINAL 12s vertical product/editorial motion treatments were authored in the *current ChatGPT conversation*, not cloned from any of the five Prompt Motion films. This bundle is an isolated chat-mediated research/prototype proof: it does not modify production Canvas/FFmpeg/Konva, choose an inference provider, grant art approval, or embed any third-party image/music assets. The product titles, UI and claims are fictional.

Original creative treatments and director preflight live on Draft PR #112 (unmerged). Render system: Chromium canvas at native 1080x1920, GSAP 3.15.0 easing under a deterministic window.seekFrame(frame), capture 360 PNG frames at 30fps, FFmpeg H.264 + generated two-channel AAC audio. GSAP is a third-party dependency; original vendor license notice preserved in its file. No fonts bundled. The local sandbox has Inter and Noto Sans installed; for pixel-identical rerender on another host install appropriately licensed equivalent fonts. No automatic remote loading, samples or creative material from Prompt Motion or company Drive was included. See https://gsap.com/licensing/ and recheck commercial usage before release/editor integration.

Films:
- `thread`: a line that follows one fictional idea into a planning route, which becomes explicit UI steps and an action that changes a visible checkbox result.
- `focus`: an editorial reduction of competing information through a persistent aperture, a selected item and a changed planning UI, ending in an aperture-grown graphic lockup.

## Reproduce (offline with supported local GSAP vendor)
`python audio.py`
`python render.py --film thread --start 0 --end 120`
`python render.py --film thread --start 120 --end 240`
`python render.py --film thread --start 240 --end 360`
Repeat for `focus` then encode using ffmpeg as in `render.py` (`--encode` with no frame work). Screenshot browser navigation may be disabled by sandbox policy; `render.py` injects local trusted authoring scripts into about:blank and doesn't browse externally. This pipeline is **not** the locked production engine.

Technical checks: 
`python quality_check.py` using original actual MP4 files. Result files are in artifacts; audio and MP4 were codec-probed at 1080x1920, 30fps, 360f, 12.000 seconds; audio AAC at 48 kHz. Human full-speed aesthetic standard and editable Premiere compatibility are NOT approved.

## Known art gaps (do not call these professional final)
The films prove real encoded moving pieces and two different treatments, but they use flat fictional UI/typography and lack true licensed photo/video asset ingestion, physically based product details, camera depth/stronger material design, an external originality judge and full-speed user creative validation. The route and aperture are authored semantic metaphors, not the final user product claim. Some deliberately contrasting scene changes show detectable large inter-frame luma differences. Cost/performance still to be benchmarked. Next highest-value step is purposeful detailed UI/layer/media compositing on a real user-authorized brief after technical/audio/QC and art review, not endless styling of this synthetic demo.

Rights: third-party GSAP standard terms govern software. All other motion/shape/UI/art/sound in this package originated here as synthetic code. `Inter` and `Noto Sans` are system fonts used at render time; **no font files are distributed.** Codec/media redistribution requires separate review.