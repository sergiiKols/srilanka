#!/bin/bash

# ========================================
# BACKUP SCRIPT
# ========================================
# Создание резервной копии конфигурации

BACKUP_DIR="/backups/sri-lanka"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
PROJECT_DIR="$(dirname "$0")/.."

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup at $DATE..."

# Backup .env file
if [ -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/.env_$DATE"
    echo "✅ Backed up .env file"
fi

# Backup nginx config
if [ -d "$PROJECT_DIR/nginx" ]; then
    tar -czf "$BACKUP_DIR/nginx_config_$DATE.tar.gz" -C "$PROJECT_DIR" nginx
    echo "✅ Backed up nginx configuration"
fi

# Backup source code (optional)
echo "📦 Creating code backup..."
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    --exclude=.astro \
    -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"
echo "✅ Backed up source code"

# Clean old backups (older than 30 days)
echo "🧹 Cleaning old backups..."
find "$BACKUP_DIR" -type f -mtime +30 -delete
echo "✅ Cleaned backups older than 30 days"

echo "✅ Backup completed: $DATE"
echo "📁 Backup location: $BACKUP_DIR"
