# M10 Theatre.js integration (isolated Spike)

**Scope:** a genuine pinned Theatre.js Core 0.7.2 Node.js frame-seek test,
and an AGPL-3.0 Studio 0.7.2 browser editor for synthetic sample keyframes.
Studio does not ship inside the MP4 production renderer.

Run after lockfile is committed:

    npm ci --prefix experiments/theatre --ignore-scripts --no-audit --no-fund
    npm test --prefix experiments/theatre
    npm run bundle --prefix experiments/theatre
    npm run serve --prefix experiments/theatre

Then open http://127.0.0.1:4178 and edit Practice Card.
The Studio app exports a state JSON. Use Core to read it when
rendering frames at frame/30 seconds; no wall-clock playback required.

**Current scope is an experiment, NOT full M10 integration**:
the base M9 renderer still uses its existing animation data. Before
promoting Theatre Core, verify Node 24 deterministic random access
and browser Studio actual keyframe editing/export. Do not mix private
company assets into this public demonstration.

The packages have **different software licenses**:
@theatre/core Apache-2.0; @theatre/studio AGPL-3.0-only.
These concern software distribution and Studio modifications, not
automatically output credits in the rendered advertisement.

Official sources:
https://www.theatrejs.com/docs/latest/api/core
https://www.theatrejs.com/docs/latest/api/studio
https://github.com/theatre-js/theatre
