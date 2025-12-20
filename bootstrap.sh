#!/bin/bash

# Function to find a free port starting from $1
find_free_port() {
    local port=$1
    while lsof -i:$port >/dev/null 2>&1; do
        ((port++))
    done
    echo $port
}

# 1. Configuration
echo "🔍 Scanning for available ports..."

API_PORT=$(find_free_port 8000)
WEB_PORT=$(find_free_port 3000)

if [ "$WEB_PORT" -eq "$API_PORT" ]; then
    WEB_PORT=$(find_free_port $((WEB_PORT + 1)))
fi

echo "✅ Ports assigned:"
echo "   ➜ API: http://localhost:$API_PORT"
echo "   ➜ Web: http://localhost:$WEB_PORT"

# 2. Python Environment Setup
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

if [ -f "$API_DIR/.venv/bin/python" ]; then
    PYTHON_CMD="$API_DIR/.venv/bin/python"
    echo "🐍 Using virtual environment: $PYTHON_CMD"
else
    PYTHON_CMD="python3"
    echo "⚠️  No .venv found in apps/api, using system python."
fi

# 3. Cleanup Trap
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID $WEB_PID 2>/dev/null
    exit
}
trap cleanup SIGINT

# 4. Process Launch
echo ""
echo "🚀 Launching FastAPI backend..."
cd "$API_DIR"
$PYTHON_CMD -m uvicorn main:app --reload --port $API_PORT --host 127.0.0.1 &
API_PID=$!

echo "🚀 Launching Next.js frontend..."
cd "$WEB_DIR"
export NEXT_PUBLIC_API_URL="http://localhost:$API_PORT"
export PORT=$WEB_PORT
npm run dev &
WEB_PID=$!

echo ""
echo "✨ Both services are running! Press Ctrl+C to stop."
echo ""

wait

