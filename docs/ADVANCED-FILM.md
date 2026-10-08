# M4 — Advanced Motion POC (draft)

This opt-in advanced 12-second film reuses the M3-B persistent object timeline
and M3-A local-PNG integrity preflight. Its four beats are opener, interaction,
data illustration and closing identity. One stable object carries continuous
shape/motion tracks through the entire render.

Input uses an explicit trusted JSON path; the image source path is scoped to that
JSON file's containing directory. No remote assets, browser or paid dependencies.

Original synthetic signal-art is a committed PNG fixture with declared CC0-1.0
and SHA-256 metadata. This is not a third-party artwork or a logo. The imagery
is illustrative; rights declarations still need human provenance verification
for any real production inputs.

The opt-in render command uses the existing hash-checked encoder and ffprobe,
an exact 30 fps, 360-frame output, full frame hashes, snapshots and contact sheet.
Existing 6-second commands are unchanged. The source creates no audio.

Visual QC gate: inspect both MP4s at full speed plus segment boundaries,
particularly the opener's initial short masked reveal, cross-beat text reading
and the position of the verified raster art in portrait. Technical CI PASS
does not grant creative/safe-area/production approval.
