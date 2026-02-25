# 📊 Monitoring Setup Guide

Полное руководство по настройке мониторинга для Docker-деплоя.

## 🎯 Что включено

- **Prometheus** - сбор метрик
- **Grafana** - визуализация
- **Node Exporter** - метрики системы
- **cAdvisor** - метрики Docker контейнеров
- **Loki** - централизованные логи
- **Promtail** - сбор логов

---

## 🚀 Быстрый старт

### 1. Запуск мониторинга

```bash
# Запустить основное приложение + мониторинг
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### 2. Доступ к интерфейсам

- **Grafana**: http://localhost:3001
  - Login: `admin`
  - Password: `changeme` (⚠️ смените в production!)

- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080

### 3. Настройка Grafana

1. Войдите в Grafana (admin/changeme)
2. Datasources автоматически настроены (Prometheus + Loki)
3. Импортируйте готовые дашборды:
   - Docker: https://grafana.com/grafana/dashboards/193
   - Node Exporter: https://grafana.com/grafana/dashboards/1860
   - Nginx: https://grafana.com/grafana/dashboards/12708

---

## 📈 Основные метрики

### Системные метрики (Node Exporter)
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Docker метрики (cAdvisor)
- Контейнер CPU
- Контейнер Memory
- Контейнер Network
- Контейнер Storage

### Логи приложения (Loki)
- Логи всех контейнеров
- Фильтрация по контейнеру
- Поиск по тексту

---

## 🔔 Настройка алертов

### 1. Telegram уведомления

Создайте файл `monitoring/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'telegram'

receivers:
  - name: 'telegram'
    telegram_configs:
      - bot_token: 'YOUR_BOT_TOKEN'
        chat_id: YOUR_CHAT_ID
        parse_mode: 'HTML'
```

### 2. Добавьте Alertmanager в docker-compose.monitoring.yml

```yaml
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: unless-stopped
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    ports:
      - "9093:9093"
    networks:
      - app-network
```

### 3. Создайте правила алертов

`monitoring/alerts.yml`:

```yaml
groups:
  - name: app_alerts
    interval: 30s
    rules:
      # Высокая загрузка CPU
      - alert: HighCPUUsage
        expr: container_cpu_usage_seconds_total{name="sri-lanka-app"} > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "Container {{ $labels.name }} CPU usage is above 80%"

      # Высокое использование памяти
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes{name="sri-lanka-app"} / container_spec_memory_limit_bytes{name="sri-lanka-app"} > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Container {{ $labels.name }} memory usage is above 90%"

      # Контейнер не отвечает
      - alert: ContainerDown
        expr: up{job="app-health"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
          description: "Health check failed for 1 minute"
```

---

## 🔍 Полезные Prometheus запросы

### CPU использование контейнера
```promql
rate(container_cpu_usage_seconds_total{name="sri-lanka-app"}[5m]) * 100
```

### Memory использование
```promql
container_memory_usage_bytes{name="sri-lanka-app"} / 1024 / 1024
```

### Network traffic
```promql
rate(container_network_receive_bytes_total{name="sri-lanka-app"}[5m])
```

### HTTP запросы (если добавлены метрики в приложение)
```promql
rate(http_requests_total[5m])
```

---

## 📊 Импорт готовых дашбордов в Grafana

### Через UI:
1. Grafana → Dashboards → Import
2. Введите ID дашборда:
   - **193** - Docker Dashboard
   - **1860** - Node Exporter Full
   - **12708** - Nginx
3. Выберите Prometheus datasource
4. Click "Import"

### Через API:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana/dashboards/docker.json \
  http://admin:changeme@localhost:3001/api/dashboards/db
```

---

## 🛡️ Security Best Practices

### 1. Смените пароль Grafana
```bash
docker compose exec grafana grafana-cli admin reset-admin-password NEW_PASSWORD
```

### 2. Ограничьте доступ к портам
В `docker-compose.monitoring.yml` удалите публичные порты:
```yaml
# Было:
ports:
  - "9090:9090"

# Стало (доступ только через Nginx):
expose:
  - 9090
```

### 3. Добавьте Basic Auth в Nginx
```nginx
location /prometheus/ {
    auth_basic "Prometheus";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://prometheus:9090/;
}
```

---

## 🔧 Troubleshooting

### Prometheus не собирает метрики
```bash
# Проверка targets
curl http://localhost:9090/api/v1/targets

# Проверка конфигурации
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

### Grafana не показывает данные
```bash
# Проверка datasource
curl http://localhost:3001/api/datasources

# Проверка подключения к Prometheus
curl http://localhost:3001/api/datasources/proxy/1/api/v1/query?query=up
```

### Высокое использование диска
```bash
# Очистка старых данных Prometheus (retention 30 дней по умолчанию)
docker compose exec prometheus rm -rf /prometheus/wal/*

# Или уменьшите retention в prometheus.yml:
--storage.tsdb.retention.time=15d
```

---

## 📚 Дополнительные ресурсы

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)
