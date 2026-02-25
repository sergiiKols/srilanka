#!/bin/bash

# ========================================
# DEPLOYMENT SCRIPT
# ========================================
# Автоматический деплой на production сервер

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please copy .env.docker to .env and fill in your values"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main

# Build and start containers
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

# Wait for app to start
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}📊 Container status:${NC}"
    docker compose ps
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${RED}📋 Logs:${NC}"
    docker compose logs --tail=50
    exit 1
fi

# Show logs
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker compose logs --tail=20

echo -e "${GREEN}✅ Done! Your application is running.${NC}"
echo -e "${GREEN}🌐 Access it at: https://your-domain.com${NC}"
