# M10 Theatre.js integration (isolated Spike)

**Scope:** a genuine pinned Theatre.js Core 0.7.2 Node.js frame-seek test,
and an AGPL-3.0 Studio 0.7.2 browser editor for synthetic sample keyframes.
Studio does not ship inside the MP4 production renderer.

Run with the committed and pinned nested lockfile:

    npm ci --prefix experiments/theatre --ignore-scripts --no-audit --no-fund
    npm test --prefix experiments/theatre
    npm run bundle --prefix experiments/theatre
    npm run serve --prefix experiments/theatre

Then open http://127.0.0.1:4178 and edit Practice Card.
The Studio app exports a state JSON. Use Core to read it when
rendering frames at frame/30 seconds; no wall-clock playback required.

**This is an isolated R&D spike, NOT a production renderer promotion.**
The base M9 renderer still uses its own animation data. Real Chromium
Studio editing, native Outline selection, native Dope Sheet keyframe
dragging, exported JSON reload, Core random seek and Canvas transparency
are verified by a dedicated GitHub Actions test. Company media/rights
and actual target NLE acceptance are not part of that synthetic test.
Never mix company assets, receipts, masks or private Drive links into
this public experiment.

The packages have **different software licenses**:
@theatre/core Apache-2.0; @theatre/studio AGPL-3.0-only.
These concern software distribution and Studio modifications, not
automatically output credits in the rendered advertisement.

Official sources:
https://www.theatrejs.com/docs/latest/api/core
https://www.theatrejs.com/docs/latest/api/studio
https://github.com/theatre-js/theatre

## Lower-third Alpha compositing experiment

The same tested Theatre project state can now draw to a **transparent**
@napi-rs/canvas image (rather than a solid test background), with a
bounded lower-third placement. This is the reusable underlying primitive
for NLE overlays, and does not copy company text or media into public
GitHub. Use `createKeyframedCanvasRenderer({background:'transparent',
placement:'lower-third'})` and pass a 30fps frame index. Studio is development-only; it is never
embedded into the production MP4 renderer or distributed final movie.

## Verified acceptance (synthetic-only)

[Native Studio + Core/Canvas browser workflow](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37945912339)
passed at source commit `61fc8868bd883a93ef6299446244462886042089`:

1. Use Chromium DOM controls to set x keyframes at frames 15 and 45,
   export project JSON, reimport into independent Theatre Core / Canvas.
2. Use real browser mouse events to select the Studio Outline object.
3. Identify the actual native Dope Sheet diamond by exported keyframe ID,
   drag x=-60 from 1.500s to 1.833s, and re-export JSON.
4. Assert time **actually changes in exported state**, the original value
   remains -60, Core returns it at the moved time, and the Canvas pixels
   change while retaining deterministic reverse-seek output.
5. Verify transparent upper stage and non-empty lower-third pixels.
   Synthetic screenshot/test report are Actions artifacts; these tests
   never access a company asset or a private editor state.

A separate [synthetic ProRes 4444 Alpha workflow](https://github.com/rayray12zx3-sys/ai-motion-studio/actions/runs/37933801249)
passed MOV encode, alpha decode and opaque MP4 composite preview. The
MOV and MP4 were delivered to approved **private** Google Drive outside
public source. Real company NAS ingestion, true license entitlement,
actual Premiere Pro on Windows, user creative review and unattended Drive
upload are still **NOT VERIFIED / NOT APPROVED**.


