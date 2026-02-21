#!/bin/bash
set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}"
ELEVENLABS_AGENT_ID="${ELEVENLABS_AGENT_ID}"

if [ -z "$ELEVENLABS_API_KEY" ] || [ -z "$ELEVENLABS_AGENT_ID" ]; then
  echo "❌ Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID"
  exit 1
fi

echo "🔧 Adding custom tools to ElevenLabs agent..."
echo "   Agent ID: $ELEVENLABS_AGENT_ID"

# Add client-side tools to the agent
curl -X PATCH \
  "https://api.elevenlabs.io/v1/convai/agents/$ELEVENLABS_AGENT_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_config": {
      "agent": {
        "tools": [
          {
            "type": "client",
            "name": "send_email",
            "description": "Send an email to Panagiotis on behalf of the user. Use this when the user wants to schedule a meeting, request a quote, or discuss a project in detail.",
            "parameters": {
              "type": "object",
              "properties": {
                "subject": {
                  "type": "string",
                  "description": "Email subject line"
                },
                "message": {
                  "type": "string",
                  "description": "Email message body"
                },
                "user_email": {
                  "type": "string",
                  "description": "User'\''s email address for reply"
                },
                "user_name": {
                  "type": "string",
                  "description": "User'\''s name"
                }
              },
              "required": ["subject", "message", "user_email", "user_name"]
            }
          },
          {
            "type": "client",
            "name": "schedule_meeting",
            "description": "Help the user schedule a meeting with Panagiotis. Use this when the user wants to book a consultation or demo.",
            "parameters": {
              "type": "object",
              "properties": {
                "preferred_date": {
                  "type": "string",
                  "description": "User'\''s preferred date/time"
                },
                "topic": {
                  "type": "string",
                  "description": "Meeting topic or agenda"
                },
                "duration": {
                  "type": "string",
                  "description": "Estimated duration (e.g., 30min, 1hr)"
                },
                "user_email": {
                  "type": "string",
                  "description": "User'\''s email for calendar invite"
                }
              },
              "required": ["preferred_date", "topic", "user_email"]
            }
          }
        ]
      }
    }
  }' | jq '.'

echo ""
echo "✅ Tools added successfully!"
echo ""
echo "Available tools:"
echo "  - send_email: Send email to Panagiotis"
echo "  - schedule_meeting: Schedule a meeting"
