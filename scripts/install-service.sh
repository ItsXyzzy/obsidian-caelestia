#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="$(command -v node)" || { echo "node not found in PATH" >&2; exit 1; }
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"

mkdir -p "$UNIT_DIR"
cat > "$UNIT_DIR/caelestia-obsidian-sync.service" <<EOF
[Unit]
Description=Sync Caelestia scheme to Obsidian theme

[Service]
ExecStart=$NODE $DIR/sync-scheme.mjs --watch
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now caelestia-obsidian-sync.service
echo "Installed. Logs: journalctl --user -u caelestia-obsidian-sync -f"