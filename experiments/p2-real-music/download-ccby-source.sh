#!/usr/bin/env bash
set -euo pipefail
mkdir -p artifacts
declare -A urls=(
 [ARC_Cipher]="https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3"
 [FOCUS_Floating_Cities]="https://incompetech.com/music/royalty-free/mp3-royaltyfree/Floating%20Cities.mp3"
)
for name in ARC_Cipher FOCUS_Floating_Cities; do
  echo "::group::Download ${name}"
  # Keep this source-domain pinned and strictly forbid HTML placeholder files.
  curl --fail --location --silent --show-error --retry 2 --connect-timeout 12 --max-time 90 \
    "${urls[$name]}" --output "artifacts/$name.mp3"
  test "$(stat -c%s "artifacts/$name.mp3")" -gt 100000
  ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=noprint_wrappers=1 "artifacts/$name.mp3"
  ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=nw=1:nk=1 "artifacts/$name.mp3" | grep -qx mp3
  sha256sum "artifacts/$name.mp3"
  echo "::endgroup::"
done
cp MUSIC-CREDITS.md artifacts/MUSIC-CREDITS.md
