#!/usr/bin/env bash
# Invoked only inside a fresh loopback-only network namespace, no credentials.
set -euo pipefail
umask 077
cd "$RUNNER_TEMP/s08-scene"
if [[ -f scene.js ]]; then
  node --check scene.js
  node test_scene.cjs
  node test_full_seek.cjs
fi
hyperframes render -c index.html -o "$RUNNER_TEMP/private-hf95.mp4" --fps 30 --quality draft
