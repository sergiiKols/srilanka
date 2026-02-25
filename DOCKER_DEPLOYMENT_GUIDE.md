# 🐳 Docker Deployment Guide

Полное руководство по развертыванию проекта в Docker на вашем сервере.

---

## 📋 Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Быстрый старт](#быстрый-старт)
3. [Локальная разработка](#локальная-разработка)
4. [Production деплой](#production-деплой)
5. [Настройка SSL/HTTPS](#настройка-sslhttps)
6. [Обслуживание и мониторинг](#обслуживание-и-мониторинг)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Предварительные требования

### На вашем сервере должно быть установлено:

```bash
# 1. Docker (версия 20.10+)
docker --version

# 2. Docker Compose (версия 2.0+)
docker compose version

# 3. Git
git --version
```

### Установка Docker на Ubuntu/Debian:

```bash
# Обновить пакеты
sudo apt update

# Установить зависимости
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавить GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавить репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установить Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниться для применения прав
newgrp docker
```

---

## 🚀 Быстрый старт

### 1. Клонировать репозиторий на сервер

```bash
cd /opt  # или любая другая директория
git clone <your-repository-url> sri-lanka
cd sri-lanka
```

### 2. Настроить переменные окружения

```bash
# Скопировать шаблон
cp .env.docker .env

# Отредактировать файл .env
nano .env
```

**Обязательно заполните:**
- `SITE_API_URL` - URL вашего сервера (https://ваш-домен.ru/api)
- `PUBLIC_SUPABASE_URL` - URL Supabase проекта
- `PUBLIC_SUPABASE_ANON_KEY` - Anon ключ Supabase
- `TELEGRAM_BOT_TOKEN` - токен вашего бота
- `TELEGRAM_ADMIN_CHAT_ID` - ваш chat ID
- `PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API ключ
- `PERPLEXITY_API_KEY` - Perplexity API ключ
- `GROQ_API_KEY` - Groq API ключ

### 3. Обновить домен в nginx конфигурации

```bash
nano nginx/conf.d/default.conf
```

Замените `your-domain.com` на ваш реальный домен.

### 4. Запустить в production режиме

```bash
# Собрать и запустить контейнеры
docker compose up -d

# Проверить логи
docker compose logs -f app

# Проверить статус
docker compose ps
```

### 5. Настроить Telegram Webhook

После запуска, настройте webhook для Telegram бота:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://ваш-домен.ru/api/telegram-webhook"
```

---

## 💻 Локальная разработка

Для разработки используйте `docker-compose.dev.yml`:

```bash
# Запустить dev окружение
docker compose -f docker-compose.dev.yml up

# С пересборкой
docker compose -f docker-compose.dev.yml up --build

# В фоновом режиме
docker compose -f docker-compose.dev.yml up -d

# Остановить
docker compose -f docker-compose.dev.yml down
```

**Преимущества dev режима:**
- Hot reload (автоматическая перезагрузка при изменениях)
- Source maps для отладки
- Подробные логи
- Доступ по http://localhost:4321

---

## 🏭 Production деплой

### Архитектура

```
Internet
   ↓
[Nginx:80,443] ← SSL/TLS, Static Files, Gzip
   ↓
[Astro App:3000] ← SSR, API Routes
   ↓
[External Services] ← Supabase, Telegram, Google Maps
```

### Команды для production

```bash
# Сборка образов
docker compose build

# Запуск с пересборкой
docker compose up -d --build

# Просмотр логов
docker compose logs -f

# Рестарт сервисов
docker compose restart

# Остановка
docker compose down

# Полная очистка (⚠️ удалит все данные!)
docker compose down -v
```

### Обновление кода

```bash
# 1. Забрать изменения из git
git pull origin main

# 2. Пересобрать и перезапустить
docker compose up -d --build

# 3. Проверить логи
docker compose logs -f app
```

---

## 🔒 Настройка SSL/HTTPS

### Вариант 1: Let's Encrypt (Certbot) - Рекомендуется

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автообновление (certbot создаст cron job автоматически)
sudo certbot renew --dry-run
```

### Вариант 2: Cloudflare (бесплатный SSL)

1. Добавьте домен в Cloudflare
2. Включите SSL/TLS (Full режим)
3. Укажите A-запись на IP вашего сервера
4. Cloudflare автоматически предоставит SSL

### Обновить nginx конфигурацию для SSL

После получения сертификата, обновите `nginx/conf.d/default.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name ваш-домен.ru;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.ru/privkey.pem;
    
    # ... остальная конфигурация
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name ваш-домен.ru;
    return 301 https://$server_name$request_uri;
}
```

Затем перезапустите nginx:

```bash
docker compose restart nginx
```

---

## 📊 Обслуживание и мониторинг

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Только app
docker compose logs -f app

# Только nginx
docker compose logs -f nginx

# Последние 100 строк
docker compose logs --tail=100 app
```

### Мониторинг ресурсов

```bash
# Использование CPU/RAM
docker stats

# Размер образов
docker images

# Дисковое пространство
docker system df

# Очистка неиспользуемых данных
docker system prune -a
```

### Резервное копирование

```bash
# Создать backup скрипт
nano /opt/backup-sri-lanka.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/sri-lanka"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p $BACKUP_DIR

# Backup .env файла
cp /opt/sri-lanka/.env $BACKUP_DIR/.env_$DATE

# Backup кода (опционально, если есть локальные изменения)
cd /opt/sri-lanka
tar -czf $BACKUP_DIR/code_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    .

# Удалить старые бэкапы (старше 30 дней)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Сделать исполняемым
chmod +x /opt/backup-sri-lanka.sh

# Добавить в cron (каждый день в 3:00)
crontab -e
# Добавить строку:
# 0 3 * * * /opt/backup-sri-lanka.sh >> /var/log/sri-lanka-backup.log 2>&1
```

### Автоматический перезапуск

Docker Compose уже настроен на автоматический перезапуск (`restart: unless-stopped`), но можно добавить дополнительную проверку:

```bash
# Создать health check скрипт
nano /opt/health-check-sri-lanka.sh
```

```bash
#!/bin/bash
URL="http://localhost:3000/health.json"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed! Restarting containers..."
    cd /opt/sri-lanka
    docker compose restart app
    
    # Отправить уведомление (опционально)
    # curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
    #     -d "chat_id=<CHAT_ID>&text=⚠️ Sri Lanka app restarted due to health check failure"
fi
```

```bash
chmod +x /opt/health-check-sri-lanka.sh

# Добавить в cron (каждые 5 минут)
crontab -e
# */5 * * * * /opt/health-check-sri-lanka.sh >> /var/log/sri-lanka-health.log 2>&1
```

---

## 🔧 Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверить логи
docker compose logs app

# Проверить конфигурацию
docker compose config

# Пересобрать образ
docker compose build --no-cache app
docker compose up -d
```

### Проблема: Порт уже занят

```bash
# Найти процесс на порту 80
sudo lsof -i :80

# Убить процесс
sudo kill -9 <PID>

# Или изменить порт в docker-compose.yml
# ports:
#   - "8080:80"  # вместо "80:80"
```

### Проблема: Telegram webhook не работает

```bash
# 1. Проверить, что URL доступен извне
curl -I https://ваш-домен.ru/api/telegram-webhook

# 2. Проверить webhook в Telegram
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# 3. Переустановить webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://ваш-домен.ru/api/telegram-webhook"

# 4. Проверить логи
docker compose logs -f app | grep telegram
```

### Проблема: Высокое использование памяти

```bash
# Ограничить память для контейнера
# В docker-compose.yml добавить:
# services:
#   app:
#     deploy:
#       resources:
#         limits:
#           memory: 1G
#         reservations:
#           memory: 512M

# Перезапустить
docker compose up -d
```

### Проблема: Медленная работа

```bash
# 1. Включить кэширование в nginx (уже настроено)
# 2. Проверить размер логов
docker compose logs app | wc -l

# 3. Очистить старые логи
docker compose logs --tail=0 app

# 4. Оптимизировать Node.js
# В docker-compose.yml добавить:
# environment:
#   - NODE_ENV=production
#   - NODE_OPTIONS=--max-old-space-size=2048
```

---

## 📚 Полезные команды

```bash
# Войти в контейнер
docker compose exec app sh

# Выполнить команду в контейнере
docker compose exec app npm run build

# Просмотреть переменные окружения
docker compose exec app env

# Проверить версию Node.js
docker compose exec app node --version

# Рестарт только app
docker compose restart app

# Остановить без удаления
docker compose stop

# Запустить остановленные контейнеры
docker compose start
```

---

## 🎯 Чек-лист перед production деплоем

- [ ] Заполнены все переменные в `.env`
- [ ] Домен настроен и указывает на IP сервера
- [ ] SSL сертификат получен и настроен
- [ ] Nginx конфигурация обновлена с правильным доменом
- [ ] Telegram webhook настроен
- [ ] Проверен доступ к Supabase
- [ ] Настроены резервные копии
- [ ] Настроен мониторинг/health checks
- [ ] Firewall настроен (открыты порты 80, 443)
- [ ] Docker настроен на автозапуск (`systemctl enable docker`)

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте [Troubleshooting](#troubleshooting)
2. Посмотрите логи: `docker compose logs -f`
3. Проверьте статус: `docker compose ps`
4. Создайте issue в репозитории проекта

---

## 🔄 Автоматическое обновление из Git

Создайте webhook скрипт для автоматического деплоя:

```bash
nano /opt/deploy-sri-lanka.sh
```

```bash
#!/bin/bash
cd /opt/sri-lanka

# Забрать изменения
git pull origin main

# Пересобрать и перезапустить
docker compose up -d --build

# Логировать
echo "Deployed at $(date)" >> /var/log/sri-lanka-deploy.log
```

```bash
chmod +x /opt/deploy-sri-lanka.sh
```

Можно вызывать этот скрипт через GitHub webhooks или вручную при необходимости обновления.

---

**Готово! 🎉 Ваш проект готов к развертыванию в Docker!**
