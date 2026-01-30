#!/bin/bash
# Проверка webhook Telegram бота

BOT_TOKEN="YOUR_BOT_TOKEN_HERE"

echo "🔍 Проверка webhook..."
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq '.'
