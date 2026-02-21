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
WEB_PORT=3008

if lsof -i:3008 >/dev/null 2>&1; then
    echo "⚠️  Port 3008 is busy. Finding next available..."
    WEB_PORT=$(find_free_port 3008)
fi

if [ "$WEB_PORT" -eq "$API_PORT" ]; then
    WEB_PORT=$(find_free_port $((WEB_PORT + 1)))
fi

echo "✅ Ports assigned:"
echo "   ➜ API: http://localhost:$API_PORT"
echo "   ➜ Web: http://localhost:$WEB_PORT"

# 2. Load .env.local files for secrets (NGROK_AUTHTOKEN, ELEVENLABS_*)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

load_env_file() {
    local file="$1"
    [ -f "$file" ] || return
    echo "📦 Loading $file..."
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

# Load root first, then web — web values take precedence
load_env_file "$ROOT_DIR/.env.local"
load_env_file "$ROOT_DIR/apps/web/.env.local"

# 3. Python Environment Setup
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

if [ -f "$API_DIR/.venv/bin/python" ]; then
    PYTHON_CMD="$API_DIR/.venv/bin/python"
    echo "🐍 Using virtual environment: $PYTHON_CMD"
else
    PYTHON_CMD="python3"
    echo "⚠️  No .venv found in apps/api, using system python."
fi

# 4. Cloudflare tunnel helper (replaces ngrok — no interstitial page blocking external services)
TUNNEL_PID=""

start_tunnel() {
    # Kill any stale tunnel processes
    pkill -f "cloudflared tunnel" 2>/dev/null
    pkill -f "ngrok http" 2>/dev/null
    sleep 1

    echo "🌐 Starting Cloudflare tunnel for port $WEB_PORT..."
    # Use cloudflared quick tunnel — free, no auth required, no interstitial page
    cloudflared tunnel --url "http://localhost:$WEB_PORT" > /tmp/tunnel-bootstrap.log 2>&1 &
    TUNNEL_PID=$!

    # Wait up to 30s for tunnel to expose a URL
    local tunnel_url=""
    local attempts=0
    while [ -z "$tunnel_url" ] && [ $attempts -lt 60 ]; do
        sleep 0.5
        # cloudflared outputs: "Your quick Tunnel has been created! Visit it at: https://xxx.trycloudflare.com"
        tunnel_url=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/tunnel-bootstrap.log 2>/dev/null | head -1)
        ((attempts++))
    done

    if [ -z "$tunnel_url" ]; then
        echo "⚠️  Cloudflare tunnel URL not available after 30s — ElevenLabs agent not patched"
        echo "   Check /tmp/tunnel-bootstrap.log for details"
        return
    fi

    echo "🔗 Cloudflare tunnel: $tunnel_url"
    patch_elevenlabs_agent "$tunnel_url"
}

patch_elevenlabs_agent() {
    local tunnel_url="$1"
    local custom_llm_url="${tunnel_url}/api/voice/llm/chat/completions"
    local tool_base_url="${tunnel_url}/api/voice/tools/notify"

    if [ -z "$ELEVENLABS_API_KEY" ] || [ -z "$ELEVENLABS_AGENT_ID" ]; then
        echo "⚠️  ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID not set — skipping agent patch"
        return
    fi

    echo "🔧 Patching ElevenLabs agent $ELEVENLABS_AGENT_ID → $custom_llm_url"

    # Fetch current agent config
    local agent_json
    agent_json=$(curl -s \
        "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_AGENT_ID" \
        -H "xi-api-key: $ELEVENLABS_API_KEY")

    local current_llm
    current_llm=$(echo "$agent_json" | \
        python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('conversation_config',{}).get('agent',{}).get('prompt',{}).get('llm','unknown'))" 2>/dev/null)

    echo "   Current LLM: $current_llm"

    if [ "$current_llm" = "custom-llm" ]; then
        echo "   Agent is on custom LLM — updating tunnel URL..."
        local http_status
        http_status=$(curl -s -o /tmp/el-patch-response.json -w "%{http_code}" \
            -X PATCH \
            "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_AGENT_ID" \
            -H "xi-api-key: $ELEVENLABS_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
              \"conversation_config\": {
                \"agent\": {
                  \"prompt\": {
                    \"llm\": \"custom-llm\",
                    \"cascade_timeout_seconds\": 15,
                    \"custom_llm\": {
                      \"url\": \"$custom_llm_url\",
                      \"model_id\": \"gpt-4o-mini\"
                    }
                  }
                }
              }
            }")

        if [ "$http_status" = "200" ]; then
            echo "✅ ElevenLabs agent patched — custom LLM URL updated to tunnel"
        else
            echo "❌ Failed to patch ElevenLabs agent (HTTP $http_status):"
            cat /tmp/el-patch-response.json
        fi
    else
        echo "✅ Agent is using managed LLM ($current_llm) — skipping LLM patch to preserve setting"
        echo "   Custom LLM fallback URL would be: $custom_llm_url"
    fi

    # Patch tool webhook URLs to point to the tunnel
    echo "🔧 Patching tool webhook URLs → $tool_base_url"
    local tool_ids
    tool_ids=$(echo "$agent_json" | \
        python3 -c "import sys,json; d=json.load(sys.stdin); ids=d.get('conversation_config',{}).get('agent',{}).get('prompt',{}).get('tool_ids',[]); print('\n'.join(ids))" 2>/dev/null)

    if [ -z "$tool_ids" ]; then
        echo "   No tools registered on agent — skipping tool patch"
    else
        while IFS= read -r tool_id; do
            [ -z "$tool_id" ] && continue

            # Get current tool config to extract the tool name
            local tool_json tool_name
            tool_json=$(curl -s \
                "https://api.elevenlabs.io/v1/convai/tools/$tool_id" \
                -H "xi-api-key: $ELEVENLABS_API_KEY")
            tool_name=$(echo "$tool_json" | \
                python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_config',{}).get('name','unknown'))" 2>/dev/null)

            local new_url="${tool_base_url}?tool=${tool_name}"
            echo "   Patching tool $tool_name ($tool_id) → $new_url"

            # Build full patch payload via python3 to safely handle JSON escaping
            local patch_payload
            patch_payload=$(echo "$tool_json" | python3 -c "
import sys, json
d = json.load(sys.stdin)
tc = d.get('tool_config', {})
payload = {
    'tool_config': {
        'type': 'webhook',
        'name': tc.get('name', ''),
        'description': tc.get('description', ''),
        'api_schema': {
            'url': '$new_url',
            'method': 'POST',
            'request_body_schema': tc.get('api_schema', {}).get('request_body_schema', {})
        }
    }
}
print(json.dumps(payload))
" 2>/dev/null)

            local patch_status
            patch_status=$(echo "$patch_payload" | curl -s -o /tmp/el-tool-patch.json -w "%{http_code}" \
                -X PATCH \
                "https://api.elevenlabs.io/v1/convai/tools/$tool_id" \
                -H "xi-api-key: $ELEVENLABS_API_KEY" \
                -H "Content-Type: application/json" \
                -d @-)

            if [ "$patch_status" = "200" ]; then
                echo "   ✅ $tool_name → $new_url"
            else
                echo "   ❌ Failed to patch $tool_name (HTTP $patch_status):"
                cat /tmp/el-tool-patch.json
            fi
        done <<< "$tool_ids"
    fi

    # Register post-call webhook for terminal visibility of transcripts + tool calls
    echo "🔧 Registering post-call webhook → ${tunnel_url}/api/voice/webhook/post-call"
    local webhook_status
    webhook_status=$(curl -s -o /tmp/el-webhook.json -w "%{http_code}" \
        -X PATCH \
        "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_AGENT_ID" \
        -H "xi-api-key: $ELEVENLABS_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
          \"platform_settings\": {
            \"workspace_overrides\": {
              \"webhooks\": {
                \"post_call_webhook_id\": null
              }
            }
          }
        }")
    echo "   Post-call webhook note: configure via ElevenLabs dashboard → agent → Advanced → Post-call webhook"
    echo "   Local endpoint ready at: ${tunnel_url}/api/voice/webhook/post-call"
}

# 5. Cleanup Trap
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID $WEB_PID 2>/dev/null
    if [ -n "$TUNNEL_PID" ]; then
        kill $TUNNEL_PID 2>/dev/null
        echo "🌐 Cloudflare tunnel closed"
    fi
    exit
}
trap cleanup SIGINT SIGTERM

# 6. Process Launch
echo ""
echo "🚀 Launching FastAPI backend..."
cd "$API_DIR"
$PYTHON_CMD -m uvicorn main:app --reload --port $API_PORT --host 127.0.0.1 &
API_PID=$!

echo "🚀 Launching Next.js frontend..."
cd "$WEB_DIR"
echo "🧹 Clearing Next.js cache..."
rm -rf .next
export NEXT_PUBLIC_API_URL="http://localhost:$API_PORT"
export PORT=$WEB_PORT

# Force Local Config
export CATALYST_API_URL="http://localhost:8001/v1"
export CATALYST_TENANT_ID="catalyst_widget"
export NEXT_PUBLIC_CATALYST_WS_URL="ws://localhost:8765"

npm run dev &
WEB_PID=$!

# 7. Wait for Next.js to be ready, then start tunnel
echo ""
echo "⏳ Waiting for Next.js to be ready on port $WEB_PORT..."
attempts=0
while ! curl -s "http://localhost:$WEB_PORT/" > /dev/null 2>&1; do
    sleep 1
    ((attempts++))
    if [ $attempts -ge 60 ]; then
        echo "⚠️  Next.js not ready after 60s — skipping tunnel"
        break
    fi
done

if curl -s "http://localhost:$WEB_PORT/" > /dev/null 2>&1; then
    echo "✅ Next.js is ready"
    start_tunnel
fi

echo ""
echo "✨ All services running! Press Ctrl+C to stop."
echo ""

wait

