#!/bin/bash
set -e

# Cloudflare Email Routing Setup via API
# This script sets up email forwarding for supercore.tech

DOMAIN="supercore.tech"
DESTINATION_EMAIL="ppilafas@gmail.com"

# You'll need your Cloudflare API token with Email Routing permissions
# Get it from: https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Zone.Email Routing Rules

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN environment variable not set"
  echo ""
  echo "To get your API token:"
  echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
  echo "2. Create Token → Custom Token"
  echo "3. Permissions: Zone > Email Routing Rules > Edit"
  echo "4. Zone Resources: Include > Specific zone > supercore.tech"
  echo "5. Export it: export CLOUDFLARE_API_TOKEN='your-token-here'"
  exit 1
fi

echo "🔍 Finding zone ID for $DOMAIN..."

# Get zone ID
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ "$ZONE_ID" == "null" ] || [ -z "$ZONE_ID" ]; then
  echo "❌ Could not find zone for $DOMAIN"
  exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

# Step 1: Enable Email Routing
echo "📧 Enabling Email Routing..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/enable" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""

# Step 2: Add destination address
echo "📬 Adding destination address: $DESTINATION_EMAIL..."
DESTINATION_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/addresses" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DESTINATION_EMAIL\"}" | jq '.')

echo "$DESTINATION_RESPONSE"
echo ""
echo "⚠️  Check your email ($DESTINATION_EMAIL) and verify the address!"
echo "   You'll receive a verification email from Cloudflare."
echo ""
read -p "Press Enter after you've verified the email address..."

# Step 3: Create routing rules
echo ""
echo "📮 Creating email routing rules..."

# info@supercore.tech
echo "  → info@supercore.tech → $DESTINATION_EMAIL"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"matchers\": [{\"type\": \"literal\", \"field\": \"to\", \"value\": \"info@$DOMAIN\"}],
    \"actions\": [{\"type\": \"forward\", \"value\": [\"$DESTINATION_EMAIL\"]}],
    \"enabled\": true,
    \"name\": \"Forward info@$DOMAIN\"
  }" | jq '.result | {id, name, enabled}'

# contact@supercore.tech
echo "  → contact@supercore.tech → $DESTINATION_EMAIL"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"matchers\": [{\"type\": \"literal\", \"field\": \"to\", \"value\": \"contact@$DOMAIN\"}],
    \"actions\": [{\"type\": \"forward\", \"value\": [\"$DESTINATION_EMAIL\"]}],
    \"enabled\": true,
    \"name\": \"Forward contact@$DOMAIN\"
  }" | jq '.result | {id, name, enabled}'

# hello@supercore.tech
echo "  → hello@supercore.tech → $DESTINATION_EMAIL"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"matchers\": [{\"type\": \"literal\", \"field\": \"to\", \"value\": \"hello@$DOMAIN\"}],
    \"actions\": [{\"type\": \"forward\", \"value\": [\"$DESTINATION_EMAIL\"]}],
    \"enabled\": true,
    \"name\": \"Forward hello@$DOMAIN\"
  }" | jq '.result | {id, name, enabled}'

# Catch-all rule
echo "  → *@supercore.tech (catch-all) → $DESTINATION_EMAIL"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/email/routing/rules" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"matchers\": [{\"type\": \"all\"}],
    \"actions\": [{\"type\": \"forward\", \"value\": [\"$DESTINATION_EMAIL\"]}],
    \"enabled\": true,
    \"priority\": 0,
    \"name\": \"Catch-all forward\"
  }" | jq '.result | {id, name, enabled}'

echo ""
echo "✅ Email routing setup complete!"
echo ""
echo "📧 Active email addresses:"
echo "   • info@supercore.tech"
echo "   • contact@supercore.tech"
echo "   • hello@supercore.tech"
echo "   • *@supercore.tech (catch-all)"
echo ""
echo "All emails will be forwarded to: $DESTINATION_EMAIL"
echo ""
echo "🧪 Test it by sending an email to info@supercore.tech"
