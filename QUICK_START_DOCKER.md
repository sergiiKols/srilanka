# 🚀 Quick Start - Docker Deployment

Быстрый старт для запуска проекта в Docker.

## ⚡ За 5 минут

### 1. Клонируйте репозиторий
```bash
git clone <your-repo-url>
cd sri-lanka
```

### 2. Настройте переменные окружения
```bash
cp .env.docker .env
# Откройте .env и заполните ваши API ключи
```

### 3. Запустите Docker Compose
```bash
docker compose up -d
```

### 4. Проверьте статус
```bash
docker compose ps
docker compose logs -f app
```

### 5. Откройте в браузере
```
http://localhost (production)
или
http://localhost:3000 (если не используете nginx)
```

---

## 🛠️ Команды для разработки

### Локальная разработка с hot-reload
```bash
docker compose -f docker-compose.dev.yml up
```

### Пересборка после изменений
```bash
docker compose build --no-cache
docker compose up -d
```

### Просмотр логов
```bash
docker compose logs -f app      # Логи приложения
docker compose logs -f nginx    # Логи Nginx
```

### Остановка
```bash
docker compose down              # Остановить контейнеры
docker compose down -v           # + удалить volumes
```

---

## 🔧 Использование Makefile (упрощенные команды)

Если у вас Linux/Mac:

```bash
make build          # Собрать образы
make up             # Запустить в production режиме
make dev            # Запустить в development режиме
make logs           # Посмотреть логи
make restart        # Перезапустить
make stop           # Остановить
make clean          # Полная очистка
```

---

## 📊 Проверка работоспособности

### Health Check
```bash
curl http://localhost/health.json
```

Ожидаемый ответ:
```json
{"status": "ok"}
```

### Мониторинг ресурсов
```bash
docker stats
```

---

## 🐛 Troubleshooting

### Порт уже занят
```bash
# Найти процесс на порту 80
sudo lsof -i :80
# или
sudo netstat -tulpn | grep :80

# Убить процесс
sudo kill -9 <PID>
```

### Контейнер не запускается
```bash
# Посмотреть детальные логи
docker compose logs app

# Перезапустить с пересборкой
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Изменения не применяются
```bash
# Полная пересборка
docker compose down -v
docker compose build --no-cache --pull
docker compose up -d
```

### Проблемы с правами (Linux)
```bash
# Добавить текущего пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📝 Следующие шаги

1. ✅ Настроить SSL сертификаты (см. `DOCKER_DEPLOYMENT_GUIDE.md`)
2. ✅ Настроить домен
3. ✅ Настроить автоматический backup
4. ✅ Настроить мониторинг
5. ✅ Настроить CI/CD

Подробная документация: `DOCKER_DEPLOYMENT_GUIDE.md`
