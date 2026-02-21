#!/bin/bash

# Supercore local dev bootstrap
# Launches the Next.js app with env loaded from .env.local files

set -e

find_free_port() {
    local port=$1
    while lsof -i:$port >/dev/null 2>&1; do
        ((port++))
    done
    echo $port
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"

# Find available port
WEB_PORT=3008
if lsof -i:3008 >/dev/null 2>&1; then
    WEB_PORT=$(find_free_port 3008)
fi
echo "✅ Web: http://localhost:$WEB_PORT"

# Load env files
load_env_file() {
    local file="$1"
    [ -f "$file" ] || return
    echo "📦 Loading $file"
    while IFS= read -r line || [ -n "$line" ]; do
        [[ "$line" =~ ^\s*# ]] && continue
        [[ -z "${line// }" ]] && continue
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            val="${val%\"}"; val="${val#\"}"
            val="${val%\'}"; val="${val#\'}"
            export "$key=$val"
        fi
    done < "$file"
}

load_env_file "$ROOT_DIR/.env.local"
load_env_file "$WEB_DIR/.env.local"

# Cleanup trap
cleanup() {
    echo ""
    echo " Stopping..."
    kill $WEB_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Launch Next.js
echo "🚀 Launching Next.js..."
cd "$WEB_DIR"
rm -rf .next
export PORT=$WEB_PORT
npm run dev &
WEB_PID=$!

echo ""
echo "✨ Dev server running on http://localhost:$WEB_PORT — Ctrl+C to stop"
echo ""

wait
