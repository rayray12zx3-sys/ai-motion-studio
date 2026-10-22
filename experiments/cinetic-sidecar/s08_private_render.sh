#!/usr/bin/env bash
# Invoked only inside a fresh loopback-only network namespace, no credentials.
set -euo pipefail
umask 077
test "$(id -u)" -ne 0
grep -Eq '^CapBnd:[[:space:]]+0000000000000000$' /proc/self/status
node - "$(dirname "$0")/.s08_sandbox_write_probe" <<'JS'
const fs=require('fs'), assert=require('assert');
assert(!process.env.S08_DRIVE_CONFIG_JSON);
try { fs.writeFileSync(process.argv[2], 'synthetic write must fail'); throw Error('HOST_FILESYSTEM_WRITABLE'); }
catch(e) { assert.equal(e.code,'EROFS'); }
JS
cd "$RUNNER_TEMP/s08-scene"
if [[ -f scene.js ]]; then
  node --check scene.js
  node test_scene.cjs
  node test_full_seek.cjs
fi
hyperframes render -c index.html -o "$RUNNER_TEMP/private-hf95.mp4" --fps 30 --quality draft
