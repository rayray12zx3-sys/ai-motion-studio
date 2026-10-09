# M11 Product-UI synthetic animation and social 9:16 mask

The input app recording is not currently available in this workspace.
Do not pretend to extract genuine product pixels or claim a simulated UI
is a verified native screen. This engine uses original Canvas components
only. Match countdown/cards (30 frames), practice/validation/progress
(95 frames), and challenge/score/editorial progression (107 frames) are
generic samples. Public preview explicitly labels every output as a
SYNTHETIC CONCEPT, NOT APP FOOTAGE.

Social safe zone draft, NOT an official universal platform mask:
- 9:16 left 9% and right 20%
- top 14.5%, bottom 20.5%
- 1080x1920 effective x 98..864, y 279..1527.
Only overlay Alpha pixels inside this conservative rectangle. Contact
sheet additionally paints red masked regions to guide layout review.
Reels/TikTok/Shorts overlays differ by placement and account; **real
platform screenshot review still mandatory**.

Functions: socialSafeRect() and drawSafeReviewGuide(), plus
drawProductUIFrame(profile, frame, scene) with exact-key whitelist,
approved modes, 30fps scene fixtures and deterministic frame seeking.

Run on Node 24 from project root:
  npm ci --ignore-scripts
  node scripts/setup-encoder.mjs
  npm run lint && npm run typecheck && npm test
  npm run preview:product-ui:synthetic

Public Actions builds 3 synthetic 9:16 H.264 review MP4s, 12 frame PNGs,
a contact sheet showing reserved mask, and a machine-readable report.
It does not load any brand UI, private video, actor, purchased material,
or external commercial media.

When private source is accessible:
1. Verify recorded source hash/permission in controlled local storage.
2. Select native timers/cards/answers/progress screenshots, map their
   genuine source timestamps and pixel bounds to editorial shot frames.
3. Mark every new animation as editorial VFX rather than native UI.
   Leaderboard ascension and Combo/Perfect remain unverified as native.
4. Replace synthetic placeholder art in the private composition only;
   do not upload source bytes or crop images to public GitHub Actions.
5. Composite to existing 1080x1920 Premiere sequence, inspect against
   actual social-app UI overlays, then approve editable Alpha export.

Unfinished from prior milestones:
- Theatre Studio visual editing + user-export validation in a real browser.
- Nested Theatre npm lockfile is not yet committed for CI npm-ci rebuild.
- Company/private asset media resolver and licensing evidence check.
- Human video QC, S10 truth treatment, S12 current-offer confirmation.
- Stacked Draft PR reconciliation; no unapproved main merges.

This public code does not authorize changes to the private production
project's canonical main/State Engine.
