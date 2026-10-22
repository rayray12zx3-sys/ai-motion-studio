#!/usr/bin/env bash
set -euo pipefail
# Linux-only namespace; source execution cannot reach Drive, npm or the Internet,
# inherit secrets, or regain sudo privileges. No changes to host firewall.
sudo unshare --net /bin/bash -c '
  ip link set lo up
  exec setpriv --reuid="$1" --regid="$2" --clear-groups --no-new-privs \
    env -i PATH="$3" HOME="$4" RUNNER_TEMP="$5" CI=true \
    HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_UPDATE_CHECK=1 \
    /bin/bash "$6"
' -- "$(id -u)" "$(id -g)" "$PATH" "$HOME" "$1" \
  "$GITHUB_WORKSPACE/experiments/cinetic-sidecar/s08_private_render.sh"
