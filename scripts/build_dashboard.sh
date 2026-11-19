#!/bin/sh
set -eu
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../dashboard"
VITE_BASE_API="${VITE_BASE_API:-/api/}" pnpm build
