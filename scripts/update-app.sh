#!/bin/bash

# ========================================
# UPDATE APPLICATION SCRIPT
# ========================================
# Обновление приложения без простоя (zero-downtime deployment)

set -e

echo "🔄 Starting application update..."

# Переход в директорию проекта
cd "$(dirname "$0")/.."

# Резервное копирование перед обновлением
echo "📦 Creating backup..."
./scripts/backup.sh

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Build new image
echo "🏗️  Building new Docker image..."
docker compose build --no-cache app

# Start new container (old one still running)
echo "🚀 Starting new container..."
docker compose up -d --no-deps --scale app=2 app

# Wait for health check
echo "⏳ Waiting for new container to be healthy..."
sleep 10

# Check if new container is healthy
if docker compose exec -T app curl -f http://localhost:3000/health.json > /dev/null 2>&1; then
    echo "✅ New container is healthy"
    
    # Stop old container
    echo "🛑 Stopping old container..."
    docker compose up -d --no-deps --scale app=1 app
    
    # Clean up old images
    echo "🧹 Cleaning up old images..."
    docker image prune -f
    
    echo "✅ Update completed successfully!"
else
    echo "❌ New container is not healthy, rolling back..."
    docker compose up -d --no-deps --scale app=1 app
    exit 1
fi

# Restart nginx to ensure proper load balancing
echo "🔄 Restarting nginx..."
docker compose restart nginx

echo "✅ Application updated successfully!"
echo "📊 Current status:"
docker compose ps
