#!/bin/bash

# ========================================
# HEALTH CHECK SCRIPT
# ========================================
# Проверка работоспособности приложения

URL="http://localhost:3000/health.json"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Health check passed (HTTP $RESPONSE)"
    exit 0
else
    echo "❌ Health check failed (HTTP $RESPONSE)"
    echo "🔄 Attempting to restart containers..."
    
    cd "$(dirname "$0")/.."
    docker compose restart app
    
    echo "📧 Sending notification..."
    # Uncomment to send Telegram notification
    # TELEGRAM_TOKEN="your_bot_token"
    # TELEGRAM_CHAT_ID="your_chat_id"
    # MESSAGE="⚠️ Health check failed. Application restarted automatically."
    # curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
    #      -d "chat_id=${TELEGRAM_CHAT_ID}&text=${MESSAGE}"
    
    exit 1
fi
