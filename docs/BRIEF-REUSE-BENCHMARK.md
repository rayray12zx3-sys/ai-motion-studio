# M7 — Bounded Brief-to-SceneSpec reuse

Two independent brief inputs share the M6 renderer, timeline, camera,
approved local PNG and 4 scene layouts without any renderer source changes
between outputs. First brief: motion design identity; second: fictional
learning and practice progression with separate stage copy and palette.

- Studio: examples/brief-studio.json (style studio)
- Learning: examples/brief-learning.json (style learning-lab)
- Both 12s / 360 frames / 30fps, 16:9 and 9:16 by the same draw function.
- Learning data values are synthetic illustrations, not tested app claims.
- No remote assets, user inputs outside approved JSON or added dependencies.

Commands (Node 24 checkout):
    npm run lint && npm run typecheck && npm test
    npm run preview:brief:studio
    npm run preview:brief:learning
    npm run preview:brief:learning:vertical

Full MP4, when specifically approved:
    node scripts/render-advanced.mjs landscape examples/brief-learning.json advanced-learning-landscape
    node scripts/render-advanced.mjs vertical examples/brief-learning.json advanced-learning-vertical

This does not automatically parse natural language. Human/agent writes a
bounded JSON brief; compiler validates and maps it to scene spec. Layouts and
artwork are reused intentionally. Two briefs are not proof of a universal
design system. Keep creative_qc PENDING_HUMAN_REVIEW; no user sign-off yet.
