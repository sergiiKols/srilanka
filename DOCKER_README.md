# 🐳 Docker Deployment - Полное руководство

Это главный файл документации по Docker деплою проекта Sri Lanka.

---

## 📚 Документация

### Быстрый старт
- **[QUICK_START_DOCKER.md](QUICK_START_DOCKER.md)** - Запуск за 5 минут

### Основные руководства
- **[DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md)** - Полное руководство по деплою
- **[MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md)** - Чеклист миграции с Vercel
- **[MONITORING_SETUP.md](MONITORING_SETUP.md)** - Настройка мониторинга
- **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)** - Безопасность
- **[PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)** - Оптимизация производительности
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Решение проблем

---

## 🗂️ Структура файлов

```
.
├── Dockerfile                          # Production образ
├── Dockerfile.dev                      # Development образ
├── docker-compose.yml                  # Production compose
├── docker-compose.dev.yml              # Development compose
├── docker-compose.monitoring.yml       # Мониторинг
├── docker-compose.override.yml.example # Пример переопределений
├── .dockerignore                       # Исключения для Docker
├── .env.docker                         # Шаблон переменных окружения
├── Makefile                           # Упрощенные команды
│
├── nginx/                             # Nginx конфигурация
│   ├── nginx.conf
│   ├── conf.d/
│   │   └── default.conf
│   └── ssl/
│       └── README.md
│
├── scripts/                           # Скрипты автоматизации
│   ├── deploy.sh
│   ├── backup.sh
│   ├── health-check.sh
│   ├── setup-server.sh
│   └── update-app.sh
│
├── monitoring/                        # Мониторинг
│   ├── prometheus.yml
│   ├── promtail-config.yml
│   └── grafana/
│       └── provisioning/
│
└── .github/workflows/                 # CI/CD
    └── docker-deploy.yml
```

---

## 🚀 Быстрые команды

### Разработка
```bash
# Запустить dev режим
npm run docker:dev

# Или через docker compose
docker compose -f docker-compose.dev.yml up
```

### Production
```bash
# Собрать и запустить
npm run docker:build
npm run docker:up

# Или через Makefile (Linux/Mac)
make up
```

### Просмотр логов
```bash
npm run docker:logs
# или
docker compose logs -f app
```

### Перезапуск
```bash
npm run docker:restart
# или
docker compose restart
```

### Остановка
```bash
npm run docker:down
# или
docker compose down
```

---

## 🎯 Основные сценарии

### 1. Первый запуск на сервере
```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd sri-lanka

# 2. Настроить переменные окружения
cp .env.docker .env
nano .env  # Заполнить API ключи

# 3. Запустить
docker compose up -d

# 4. Проверить статус
docker compose ps
docker compose logs -f
```

### 2. Обновление приложения
```bash
# Автоматическое обновление с zero-downtime
./scripts/update-app.sh

# Или вручную
git pull
docker compose build
docker compose up -d
```

### 3. Настройка SSL
```bash
# Установить Certbot
sudo apt-get install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d your-domain.com

# Автообновление настроено автоматически
```

### 4. Мониторинг
```bash
# Запустить с мониторингом
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Открыть Grafana
http://localhost:3001
# Login: admin / changeme
```

### 5. Резервное копирование
```bash
# Автоматический backup
./scripts/backup.sh

# Планирование через cron (каждый день в 2:00)
0 2 * * * /path/to/project/scripts/backup.sh
```

---

## 🔧 Переменные окружения

### Обязательные
```bash
# Supabase
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_ADMIN_CHAT_ID=123456789

# Google Maps
PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxx...

# Site URL
SITE_API_URL=https://your-domain.com/api
```

### Опциональные
```bash
# AI сервисы
PERPLEXITY_API_KEY=pplx-xxx...
GROQ_API_KEY=gsk_xxx...
```

---

## 📊 Требования к серверу

### Минимальные
- **CPU**: 1 core
- **RAM**: 1GB
- **Disk**: 20GB SSD
- **OS**: Ubuntu 20.04+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### Рекомендуемые
- **CPU**: 2+ cores
- **RAM**: 2GB+
- **Disk**: 50GB SSD
- **Bandwidth**: Неограниченный

---

## 🔐 Безопасность

### Чеклист
- [ ] SSL сертификаты установлены
- [ ] Firewall настроен (ufw/iptables)
- [ ] SSH доступ только по ключам
- [ ] Регулярные обновления системы
- [ ] Secrets не в Git
- [ ] Nginx rate limiting включен
- [ ] Fail2ban настроен
- [ ] Регулярные backups

Подробнее: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

---

## 📈 Производительность

### Оптимизации
- Multi-stage Docker build
- Nginx кэширование статики
- Gzip сжатие
- HTTP/2 поддержка
- CDN для статических файлов (опционально)
- Redis кэширование (опционально)

Подробнее: [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)

---

## 🆘 Помощь и поддержка

### Частые проблемы
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Решение проблем

### Логи
```bash
# Логи приложения
docker compose logs -f app

# Логи Nginx
docker compose logs -f nginx

# Все логи
docker compose logs -f

# Последние 100 строк
docker compose logs --tail=100 app
```

### Health Check
```bash
# Проверка работоспособности
curl http://localhost/health.json

# Детальная проверка
./scripts/health-check.sh
```

---

## 🔄 CI/CD

GitHub Actions workflow уже настроен:
`.github/workflows/docker-deploy.yml`

### Настройка:
1. Добавьте secrets в GitHub:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `SERVER_HOST`
   - `SERVER_USER`
   - `SSH_PRIVATE_KEY`

2. Push в main автоматически задеплоит на сервер

---

## 📝 Changelog

### Docker Setup v1.0.0
- ✅ Production Dockerfile
- ✅ Development Dockerfile
- ✅ Docker Compose конфигурация
- ✅ Nginx reverse proxy
- ✅ SSL поддержка
- ✅ Мониторинг stack (Prometheus, Grafana, Loki)
- ✅ Скрипты автоматизации
- ✅ CI/CD workflow
- ✅ Полная документация

---

## 🎓 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Astro Documentation](https://docs.astro.build/)

---

## 📞 Контакты

Если возникли вопросы - создайте Issue в репозитории.

---

**Готово к деплою! 🚀**
