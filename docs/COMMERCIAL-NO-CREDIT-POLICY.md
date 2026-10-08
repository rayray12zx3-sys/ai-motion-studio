# Commercial no-credit video delivery policy

User-facing requirement: zero software subscription or pay-per-render,
finished videos may be used for commercial work, and **no credits or source
attributions need be attached to the delivered video**. A film's licensing
clearance is stricter than merely compiling, playing, or passing unit tests.

## Verified baseline, distinct obligations
- Original Canvas drawings: created in this project. Source author/license
  chain must remain documented; protect against reference copying.
- Original synthetic PNG: recorded as CC0 with a digest. A CC0 claim without
  demonstrated authority does not automatically establish third-party rights.
- Noto Sans TC 400/700: pinned 5.3.0 OFL-1.1; user may use the text in a
  commercial video without mandatory acknowledgement. Redistributing the
  font binary requires preserving font license/notice.
- @napi-rs/canvas: MIT software package. MIT notice applies when copying/
  redistributing substantial software, not automatically to ordinary videos
  produced with the library.
- FFmpeg/x264: selected ffmpeg-static binary is GPL-licensed; do not bundle or
  distribute the tool without complying with its binary/source obligations.
  This is separate from generated visual content. H.264 patents and territorial
  licensing are **not** resolved by the GPL alone.
- ffprobe-static: software wrapper/binary notices similarly retained internally.
- No Remotion runtime (entity-size dependent), Theatre.js Studio (AGPL) or
  unverified community template code is imported.

## Fail-closed source asset rules
Creative media embedded into film: CC0 only, plus non-empty provenance and
SHA-256 verified by the renderer's existing local manifest; any CC-BY/
CC-BY-NC/GPL/MIT/OFL licensed as **an embedded creative asset** is rejected
by the M9 release preflight unless a separately documented no-credit grant
is reviewed and implemented. License alone cannot establish valid source
ownership; human clearance remains mandatory before actual commercial release.

Font software and renderer package licenses are categorized **separately**
from embedded image/video/audio. Do not claim video must mention the tool
because a source package uses MIT/Apache/OFL/GPL; but DO retain software
notices when distributing the code/binaries.

## Final gate
No production ready claim unless:
1. Component and creative media source, grants and metadata verified.
2. Third-party trademark, portrait/privacy and IP claims reviewed.
3. Encoder binary distribution/legal and H.264 context reviewed for intended
   delivery and jurisdiction; consider license-reviewed alternatives if needed.
4. Actual 30fps video reviewed in 16:9 and 9:16 for visual quality/readability.
5. Repo-owned code LICENSE / branch protection questions resolved.

Until then every exported report records production_license_clearance as
REQUIRES_HUMAN_REVIEW and creative_qc as PENDING_HUMAN_REVIEW.
