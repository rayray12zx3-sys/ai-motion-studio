# Cinetic local original advertisement — private by construction (source-only pilot)

**Purpose**: render a first-party-authorized **original vector + Traditional Chinese copy** advertising animation on an owner-controlled computer without placing the private brief, render files or rights attestation in the public GitHub repository. This is NOT a tool to import customer photos, footage, trademarks, music, brands or copyrighted text without permission. Only original vector `ad-film` devices, one locked SIL-OFL Noto Sans TC font, no remote URLs, no external media, and pinned HyperFrames/FFmpeg are allowed.

**How this differs from previous public samples**: The existing public `cinetic-flow.mjs full` still accepts **only `public-synthetic`** and may be used in public CI. The new explicit `cinetic-local-owned.mjs` accepts an `owner-authored-local` plan when accompanied by a matching signed-off owner-declared rights manifest. It refuses GitHub Actions, generic CI, in-repository files, previous outputs, unpinned runtimes and unattributed/paid third-party sources. This is code-enforced local separation, not a cloud-hosted authenticated confidential project manager.

### Input, all stored OUTSIDE the public repo

Create `D:\\private-ad-jobs\\job1\\plan.json` using the public example as a template, but set `contentClass` to `owner-authored-local`. The plan is still bounded to three stages, 16:9 or 9:16, at least 48 frames, exactly 3 copy lines/groups, `adDevice` set to `focus-clock` or `habit-path`, `adAccent` #RRGGBB, and optional `adBreakAt` for clean Traditional Chinese two-line caption splits. No photos, imports, brand logos, audio or external content.

Create `D:\\private-ad-jobs\\job1\\rights.json` as follows, only when each claim is TRUE for the actual copy. Replace the SHA256 placeholder with a real, lowercase SHA256 of the exact plan file bytes:

```json
{
  "schema": "cinetic-owner-original-commercial-v1",
  "planSha256": "REPLACE_WITH_64_LOWERCASE_SHA256_FROM_REAL_LOCAL_PLAN",
  "rights": {
    "copy": "owner-original-commercial-authorized",
    "artwork": "repo-generated-original-vectors",
    "font": "pinned-noto-ofl",
    "audio": "none",
    "voice": "none",
    "photos": "none",
    "externalImages": "none",
    "footage": "none",
    "trademarks": "none",
    "paymentRequired": false,
    "attributionRequiredInFinishedAd": false,
    "operatorAuthorizedCommercialAds": true
  }
}
```

On Windows PowerShell: `(Get-FileHash -Algorithm SHA256 'D:\\private-ad-jobs\\job1\\plan.json').Hash.ToLowerInvariant()`. This is an **owner assertion**, not a legal guarantee: do not attest to third-party/brand rights you don't own.

With authenticated locally installed HyperFrames **0.8.143** publisher-fingerprinted separately and the checked binary's actual `SHA256`, run this directly on the local computer (never hosted public Actions):

```powershell
node experiments/cinetic-sidecar/cinetic-local-owned.mjs 'D:\\private-ad-jobs\\job1\\plan.json' 'D:\\private-ad-jobs\\job1\\rights.json' 'D:\\private-ad-jobs\\job1\\render-v001' --hf 'D:\\apps\\hyperframes\\dist\\cli.js' --hf-sha 'REPLACE_WITH_REAL_VERIFIED_CLI_SHA256'
```

Output includes `render/preview.mp4`, `render/overlay-alpha.mov` and `alpha-png/frame-000000.png`…+`manifest.json` verified as RGBA transparent sequence, plus `local-delivery-receipt.json` with exact source and attestation hashes. PNG image sequence is the preferred portable lossless editing path: import at the declared frame rate and composite using a legally authorized editor/export codec. MP4 and MOV are preview/interchange only until destination/encoder licensing is assessed.

**Privacy warnings**: the render folder **contains the full local copyrighted text** in `render/validated-plan.json` and HTML, plus possibly fonts used for local rendering. Keep that folder private and don't commit it, attach it to a public Issue/Action, or share it externally. The final PNGs and selected video should be shared only after copy/brand/codec/recipient rights review; don't ship a ZIP that accidentally includes source/fonts. The tool does not contact an app, install skills, buy credits, or approve artwork. The runtime's publisher provenance must be checked separately; matching a supplied SHA alone is NOT official verification.

**Evidence boundary**: source-level positive and negative tests may run on public CI using entirely fake original content, but the real private-job render by design cannot be tested on a public CI runner. Therefore `OWNER_PRIVATE_LOCAL_RENDER=NOT_TESTED_ON_ACTUAL_OWNER_MACHINE` until explicit local results are checked. Public existing HTML/MP4/MOV/PNG runs continue as before.
