# Offline raster asset contract (M3-A pilot)

This stage introduces a **small, runnable** PNG-only integrity and provenance check,
without adding dependencies or modifying the existing Canvas renderer and output.
`verifyLocalAssets(manifest, trustedRoot)` is *not yet wired into a new film*
and does **not** claim that the project supports arbitrary photos or video.

## Manifest v1

```json
{
  "version": 1,
  "assets": [{
    "id": "graphic-sample",
    "path": "synthetic/sample.png",
    "type": "image/png",
    "sha256": "<sha256-hex-of-real-file>",
    "width": 64,
    "height": 32,
    "license": "CC0-1.0",
    "source": "Synthetic generated unit-test artwork"
  }]
}
```

A trusted caller supplies the local asset-root directory, *not* the brief.
Paths inside the manifest are simple relative PNG names only. Extra fields, remote
inputs, parent traversal, duplicates, symlinks, missing files, oversized files,
digest or dimensional mismatches fail closed before writing output.

`license` and `source` are **declared metadata**, not an automated proof
of intellectual-property rights. Asset ingestion still requires a human to verify
its origin and redistribution rights. Only synthetic original artwork is used
in public tests or CI; keep private media outside this public repository.

## Test / integration gate

`npm test` creates its own synthetic PNG fixture in a temporary directory and
tests integrity, exact shape, failure modes and symlink protection. The advanced
multi-scene renderer will later opt in and call `verifyLocalAssets` during its
preflight; the existing 6-second renderer must stay byte- and behavior-compatible.
The proposed follow-up is issue #11, not a universal media-asset pipeline.

The verifier does not decode the full image; it verifies an exact approved hash,
PNG header and dimensions. Consumers must still handle decoder failures safely.
Never fetch or dynamically install asset inputs at render time.
