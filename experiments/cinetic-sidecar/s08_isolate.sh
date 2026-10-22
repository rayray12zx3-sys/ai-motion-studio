#!/usr/bin/env bash
set -euo pipefail
# Read-only host filesystem, private writable scene/output directory, isolated PID
# and network namespaces. Child cannot tamper with the later credentialed bridge.
mkdir -p "$1/home"
sudo bwrap --unshare-net --unshare-pid --die-with-parent --new-session \
  --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind "$1" "$1" \
  --cap-drop ALL --cap-add CAP_SETUID --cap-add CAP_SETGID --cap-add CAP_SETPCAP --clearenv \
  --setenv PATH "$PATH" --setenv HOME "$1/home" --setenv RUNNER_TEMP "$1" \
  --setenv CI true --setenv HYPERFRAMES_NO_TELEMETRY 1 \
  --setenv HYPERFRAMES_SKIP_SKILLS 1 --setenv HYPERFRAMES_NO_UPDATE_CHECK 1 \
  /usr/bin/setpriv --reuid "$(id -u)" --regid "$(id -g)" --clear-groups --bounding-set=-all --no-new-privs /bin/bash "$GITHUB_WORKSPACE/experiments/cinetic-sidecar/s08_private_render.sh"
