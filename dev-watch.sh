#!/bin/bash
# Watches scripts/ and mirrors changes into chrome-overrides/ so Chrome
# Local Overrides serves the current repo content without symlinks
# (which Chrome doesn't reliably follow on macOS).
#
# Usage: ./dev-watch.sh   (leave running in a terminal tab)

set -e
REPO="$(cd "$(dirname "$0")" && pwd)"
OVERRIDES_BASE="$REPO/chrome-overrides"

sync() {
  find "$OVERRIDES_BASE" -type f 2>/dev/null | while read -r dst; do
    case "$dst" in
      */scripts/*)
        rel="${dst##*/scripts/}"
        src="$REPO/scripts/$rel"
        if [ -f "$src" ] && ! cmp -s "$src" "$dst"; then
          cp "$src" "$dst"
          echo "[$(date +%H:%M:%S)] synced scripts/$rel"
        fi
        ;;
    esac
  done
}

sync
echo "[$(date +%H:%M:%S)] watching $REPO/scripts ..."
fswatch -o "$REPO/scripts" | while read -r _; do sync; done
