#!/usr/bin/env bash
set -euo pipefail
if ! command -v bwrap >/dev/null; then
  sudo apt-get update -qq >/dev/null 2>&1
  sudo apt-get install -y -qq bubblewrap >/dev/null 2>&1
fi
npm ci --ignore-scripts --no-audit --no-fund >/dev/null 2>&1
node scripts/setup-encoder.mjs >/dev/null 2>&1
export PATH="$(dirname "$(node -p "require('ffmpeg-static')")"):$(dirname "$(node -p "require('ffprobe-static').path")"):$RUNNER_TEMP/s08-runtime/node_modules/.bin:$PATH"
mkdir -p "$RUNNER_TEMP/s08-runtime"
cp experiments/cinetic-sidecar/s08-runtime/package*.json "$RUNNER_TEMP/s08-runtime/"
npm ci --prefix "$RUNNER_TEMP/s08-runtime" --ignore-scripts --no-audit --no-fund >/dev/null 2>&1
test -x "$RUNNER_TEMP/s08-runtime/node_modules/.bin/hyperframes"
echo "$RUNNER_TEMP/s08-runtime/node_modules/.bin" >> "$GITHUB_PATH"
echo "$(dirname "$(node -p "require('ffmpeg-static')")")" >> "$GITHUB_PATH"
echo "$(dirname "$(node -p "require('ffprobe-static').path")")" >> "$GITHUB_PATH"
node experiments/cinetic-sidecar/three-step-quiz-synthetic-95f.mjs "$RUNNER_TEMP/s08-preflight/s08-scene" >/dev/null
cd "$RUNNER_TEMP/s08-preflight/s08-scene"
hyperframes render -c index.html -o "$RUNNER_TEMP/s08-preflight/warmup.mp4" --fps 30 --quality draft >/dev/null 2>&1
cd "$GITHUB_WORKSPACE"
bash experiments/cinetic-sidecar/s08_isolate.sh "$RUNNER_TEMP/s08-preflight" > "$RUNNER_TEMP/s08-preflight/synthetic-isolation.log" 2>&1 || {
  cat "$RUNNER_TEMP/s08-preflight/synthetic-isolation.log"
  exit 1
}
echo 'SYNTHETIC_ENGINE_NETWORK_ISOLATION_PASS'
