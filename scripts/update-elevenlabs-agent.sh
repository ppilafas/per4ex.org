#!/bin/bash

# Update ElevenLabs Agent with Supercore Branding
# Usage: ./scripts/update-elevenlabs-agent.sh

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$ELEVENLABS_API_KEY" ] || [ -z "$ELEVENLABS_AGENT_ID" ]; then
    echo "❌ Error: ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set"
    exit 1
fi

echo "🔧 Updating ElevenLabs agent: $ELEVENLABS_AGENT_ID"
echo ""

# Agent configuration with Supercore branding
# Note: Keeping custom_llm configuration, only updating greeting and prompt
curl -X PATCH \
  "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_AGENT_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_config": {
      "agent": {
        "prompt": {
          "prompt": "You are the Supercore AI voice assistant. You help visitors learn about Panagiotis Pilafas, his AI engineering work, and projects. Be conversational, helpful, and concise. The custom LLM endpoint provides you with comprehensive knowledge base context about all projects and capabilities."
        },
        "first_message": "Hi! I'\''m the Supercore AI assistant. I can tell you about Panagiotis'\'' work in AI systems engineering, his projects, or help you explore potential collaborations. What would you like to know?",
        "language": "en"
      }
    }
  }' | jq '.'

echo ""
echo "✅ Agent updated successfully!"
echo ""
echo "Updated configuration:"
echo "  - First message: Introduces as Supercore assistant"
echo "  - System prompt: References Supercore branding"
echo "  - LLM: gpt-4o-mini"
