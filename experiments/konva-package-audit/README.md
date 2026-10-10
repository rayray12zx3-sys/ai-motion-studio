# S2 — Konva 10.7.1 isolated package and license audit

**Status: non-production R&D only; CI evidence pending.** This does **not** install Konva, ship a visual editor, use outside commercial rights or modify the existing renderer.

## Source of candidate choice

- Konva official repository: https://github.com/konvajs/konva (upstream package metadata declares MIT).
- Pinned upstream release selected: **10.7.1**, visible in https://github.com/konvajs/konva/releases (released October 5, 2026).
- Published package `konva@10.7.1`, not an unbounded `latest` dist-tag.
- Framework-neutral **vanilla Konva** is the initial candidate. No `react-konva`, React, React Timeline Editor, Fabric.js, Moveable, GSAP or Theatre.js Studio is installed by this research.
- The upstream `package.json` observed on the repository lists optional server-side peer adapters `canvas` and `skia-canvas`. The isolated audit requires any such peers to stay optional. This does not license their native binaries, and an eventual **browser** UI should not install those adapters without an independent reason.

## Reproducible audit boundary

- `audit.mjs` reads actual npm registry metadata for exactly `konva@10.7.1`, downloads the actual published npm tarball with `npm pack --ignore-scripts`, recomputes SHA-1 and SHA-512, then inspects **the tarball's own** `package/package.json` and root LICENSE file.
- Audit **fails closed** if package name/version/license or archive hashes disagree, LICENSE is missing, runtime deps appear, or a nonoptional/unrecognized peer is introduced.
- The test suite contains synthetic tamper/unknown-dependency/mandatory-peer cases and one real published-archive check; GitHub Actions has a 12-minute max and no root package installation.
- This is a **point-in-time package technical audit**, not an independent legal opinion or audit of font rights, asset rights, browser/codec rights, future dependencies, npm install security, or redistributing editable scene files. Exact published SHA-512 needs to be captured in the checkpoint and pinned if further integration is proposed; a registry-supplied digest alone verifies downloaded consistency, not that the upstream record is immutable.
- If R&D CI passes, the conclusion is only: suitable to **consider a separate browser sandbox** with another narrowly reviewed PR. It is **not** license clearance for every future transitive package or authority to add production npm dependencies.
- No remote scripts run: `npm view`/`npm pack --ignore-scripts` fetch metadata/archive only in the research workflow. No `npm install`, no `npx`, no GUI or external images are used. Root `package.json`/`package-lock.json`, renderer and compiled video remain unchanged.

## Existing related work (avoid duplication)

M3-A [Draft PR #12](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/12) already has a PNG-only trusted-root/hash/declared-license asset verifier. Do **not** copy it into `main` or re-implement the same checks as part of this license audit. S1 [merged PR #51](https://github.com/rayray12zx3-sys/ai-motion-studio/pull/51) still forbids imported assets (`assets: []`). A future adapter must reconcile the contracts explicitly without risking private company media.

## Next gate

Only if exact-head archive CI passes, open a **separate Draft** for a synthetically controlled, isolated Konva canvas browser pointer interaction and `EditableSceneSpec` JSON serialization (save/reopen and 30fps frame-seeking) with a frozen tarball integrity. Do not modify `src/free`, introduce a production dependency, build a GSAP Studio adapter or contact licensors.
