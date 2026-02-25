# SSL Certificates Setup

## Автоматическая настройка с Let's Encrypt

### Шаг 1: Установите Certbot

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx

# MacOS
brew install certbot
```

### Шаг 2: Получите сертификат

```bash
# Замените your-domain.com на ваш домен
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Шаг 3: Автоматическое обновление

Certbot автоматически добавит задачу в cron для обновления сертификатов.

Проверка:
```bash
sudo certbot renew --dry-run
```

---

## Ручная установка SSL сертификата

Если у вас уже есть сертификаты:

1. Поместите файлы в эту директорию:
   - `certificate.crt` - сертификат
   - `private.key` - приватный ключ
   - `ca_bundle.crt` - цепочка сертификатов (опционально)

2. Обновите `nginx/conf.d/default.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_trusted_certificate /etc/nginx/ssl/ca_bundle.crt;

    # ... остальная конфигурация
}
```

3. Перезапустите Nginx:
```bash
docker compose restart nginx
```

---

## Самоподписанный сертификат (только для разработки!)

```bash
cd nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private.key \
  -out certificate.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

⚠️ **ВНИМАНИЕ**: Самоподписанные сертификаты НЕ должны использоваться в production!

---

## Проверка SSL конфигурации

После установки сертификатов:

```bash
# Проверка синтаксиса Nginx
docker compose exec nginx nginx -t

# Перезагрузка конфигурации
docker compose exec nginx nginx -s reload

# Тест SSL
curl -I https://your-domain.com
```

Онлайн проверка:
- https://www.ssllabs.com/ssltest/
- https://www.sslshopper.com/ssl-checker.html
