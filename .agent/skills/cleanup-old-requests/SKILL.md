## Name: Cleanup Old Requests

## Description:
Автоматическая очистка/архивация старых заявок и связанных данных

## Purpose:
Регулярно проходиться по заявкам и удалять/архивировать старые, чтобы БД не забивалась.

---

## НАЗНАЧЕНИЕ
Регулярная очистка истекших заявок (дата check-out прошла или старше месяца)

## КОГДА ЗАПУСКАЕТСЯ
- Автоматически, каждый день в 00:00 UTC (CRON job)
- Или кнопка в админ-панели для ручного запуска

## ЧТО НА ВХОДЕ
- `retention_days` (по умолчанию 30) - как долго хранить заявки
- `dry_run` (boolean) - тестовый режим без удаления

## ЧТО НА ВЫХОДЕ
```json
{
  "archived_requests": 15,
  "deleted_offers": 45,
  "freed_space_mb": 125,
  "log": ["request_123 archived", "..."]
}
```

## ЧТО СИСТЕМА ДЕЛАЕТ

### Шаг 1: Поиск старых заявок
```sql
SELECT * FROM rental_requests 
WHERE check_out < (NOW() - INTERVAL '30 days')
   OR status = 'abandoned'
   OR status = 'completed'
```

### Шаг 2: Архивация
```sql
UPDATE rental_requests 
SET status = 'archived', archived_at = NOW()
WHERE id IN (...)
```

### Шаг 3: Очистка связанных данных
```sql
-- Offers для архивированных requests
UPDATE rental_offers 
SET status = 'archived'
WHERE request_id IN (...)
```

### Шаг 4: Логирование
```javascript
console.log(`Архивировано ${count} заявок`);
await logCleanup({ archived_requests: count, date: new Date() });
```

## ВАЖНЫЕ ВОПРОСЫ
- **Удалять или архивировать:** Архивировать (для статистики)
- **Связанные данные:** Offers архивировать, properties оставлять
- **Properties:** Не удалять (могут использоваться в других заявках)
- **Отчет админу:** Да, в админ-панель

## Expected Output
Отчёт о выполнении + обновлённая БД
