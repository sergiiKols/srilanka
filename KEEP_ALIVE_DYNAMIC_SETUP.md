# 🚀 Keep-Alive Dynamic System v2.0 - Установка

## 📋 Что это?

Динамическая система Keep-Alive, которая:
- ✅ Автоматически обрабатывает **ВСЕ таблицы** в Supabase
- ✅ **Не падает** если одна таблица даёт ошибку
- ✅ Детальное **логирование** всех операций
- ✅ **UI управление** - включать/выключать любую таблицу
- ✅ **Масштабируемость** - новые таблицы добавляются легко

---

## 🔧 Шаг 1: Установка SQL схемы

### 1.1 Откройте Supabase SQL Editor

Перейдите: **Dashboard → SQL Editor**

### 1.2 Выполните скрипт установки

Скопируйте содержимое файла `supabase_keep_alive_DYNAMIC.sql` и выполните в SQL Editor.

**Что создаётся:**
- 📊 Таблица `keep_alive_config` (конфигурация для каждой таблицы)
- 📋 Таблица `keep_alive_logs` (детальные логи)
- ⚙️ Функция `keep_alive_test_records_v2()` (главная функция)
- 🔧 Функция `replace_placeholders()` (генерация данных)
- ➕ Функция `add_table_to_keepalive()` (добавление новых таблиц)
- 🗑️ Функция `cleanup_keepalive_records_v2()` (очистка старых записей)
- 📈 View `keep_alive_stats` (статистика)

**Результат:**
```sql
✅ Created table: keep_alive_config
✅ Created table: keep_alive_logs
✅ Inserted 22 table configurations
✅ Created 4 functions
✅ Created 1 view
```

---

## 🎯 Шаг 2: Настройка Cron Jobs

### 2.1 Включите pg_cron расширение

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2.2 Создайте Cron Job для создания записей

**Метод A: Через UI** (Dashboard → Database → Cron Jobs)

- **Name:** `keep-alive-dynamic`
- **Schedule:** `0 3 */3 * *` (каждые 3 дня в 3:00 UTC)
- **SQL:** `SELECT * FROM keep_alive_test_records_v2();`

**Метод B: Через SQL:**

```sql
SELECT cron.schedule(
  'keep-alive-dynamic',
  '0 3 */3 * *',
  $$SELECT * FROM keep_alive_test_records_v2();$$
);
```

### 2.3 Создайте Cron Job для очистки старых записей

**Schedule:** `0 4 * * 0` (каждое воскресенье в 4:00 UTC)

```sql
SELECT cron.schedule(
  'cleanup-keepalive-dynamic',
  '0 4 * * 0',
  $$SELECT * FROM cleanup_keepalive_records_v2();$$
);
```

---

## ✅ Шаг 3: Проверка установки

### 3.1 Проверьте конфигурацию таблиц

```sql
SELECT table_name, is_enabled, priority, success_count, error_count
FROM keep_alive_config
ORDER BY priority, table_name;
```

**Ожидаемый результат:** 22 таблицы с различными приоритетами

### 3.2 Тестовый запуск

```sql
SELECT * FROM keep_alive_test_records_v2();
```

**Ожидаемый вывод:**
```
table_name          | status  | record_id | error_message | execution_time_ms
--------------------|---------|-----------|---------------|------------------
telegram_accounts   | SUCCESS | abc-123   | null          | 45
telegram_groups     | SUCCESS | def-456   | null          | 38
users               | SUCCESS | ghi-789   | null          | 52
...
SUMMARY             | COMPLETED | null    | Keep-alive... | 0
```

### 3.3 Проверьте логи

```sql
SELECT table_name, status, error_message, created_at
FROM keep_alive_logs
ORDER BY created_at DESC
LIMIT 20;
```

### 3.4 Проверьте статистику

```sql
SELECT * FROM keep_alive_stats;
```

---

## 🎨 Шаг 4: Проверьте UI админку

### 4.1 Откройте страницу Keep-Alive

```
http://localhost:4321/admin/keep-alive
```

или

```
https://your-domain.com/admin/keep-alive
```

### 4.2 Что вы должны увидеть:

- **Статистика:** Всего таблиц, Включено, Успешность, Логи за 7 дней
- **Вкладка "Таблицы":** Grid из всех 22 таблиц с toggle переключателями
- **Вкладка "Логи":** Таблица со всеми операциями
- **Кнопки:** "Включено/Выключено" (глобальный toggle), "Запустить сейчас"

---

## 🔧 Шаг 5: Настройка под ваши нужды

### 5.1 Включить/Выключить таблицу

**Через UI:** Кликните на toggle переключатель рядом с таблицей

**Через SQL:**
```sql
UPDATE keep_alive_config
SET is_enabled = false
WHERE table_name = 'poi_locations';
```

### 5.2 Изменить приоритет таблицы

```sql
UPDATE keep_alive_config
SET priority = 1 -- высокий приоритет
WHERE table_name = 'users';
```

**Приоритеты:**
- `1-10`: Высокий (обрабатываются первыми, родительские таблицы)
- `11-50`: Средний (основные таблицы)
- `51-99`: Низкий (проблемные или disabled таблицы)

### 5.3 Добавить новую таблицу

**Метод A: Через функцию**
```sql
SELECT add_table_to_keepalive(
  'new_feature_table',
  '{"name": "KeepAlive Test", "is_active": false}'::JSONB,
  30, -- priority
  'New feature table added'
);
```

**Метод B: Прямой INSERT**
```sql
INSERT INTO keep_alive_config (table_name, is_enabled, priority, required_fields, notes)
VALUES (
  'new_feature_table',
  true,
  30,
  '{
    "name": "KeepAlive Test",
    "is_active": false,
    "created_at": "%%NOW%%"
  }'::JSONB,
  'New feature table'
);
```

### 5.4 Изменить поля для таблицы

```sql
UPDATE keep_alive_config
SET required_fields = '{
  "email": "keepalive_%%UUID%%@test.com",
  "name": "Test User",
  "role": "user",
  "is_active": false
}'::JSONB
WHERE table_name = 'users';
```

---

## 📊 Плейсхолдеры для required_fields

Используйте эти плейсхолдеры в JSON конфигурации:

| Плейсхолдер | Заменяется на | Пример |
|-------------|---------------|--------|
| `%%UUID%%` | Случайный UUID | `abc123-def456-...` |
| `%%RANDOM%%` | Случайное число (0-999999) | `847392` |
| `%%RANDOM8%%` | 8-значное число | `93847562` |
| `%%TIMESTAMP%%` | Unix timestamp | `1706436000` |
| `%%DATE%%` | Текущая дата | `2026-01-28` |
| `%%NOW%%` | Текущее время | `2026-01-28 10:30:45` |
| `%%FUTUREDATE%%` | Дата через 30 дней | `2026-02-27` |

---

## 🐛 Troubleshooting

### Проблема: Таблица всегда падает с ошибкой

**Решение 1:** Проверьте required_fields
```sql
SELECT table_name, required_fields, last_error
FROM keep_alive_config
WHERE table_name = 'problem_table';
```

**Решение 2:** Выключите таблицу временно
```sql
UPDATE keep_alive_config
SET is_enabled = false
WHERE table_name = 'problem_table';
```

**Решение 3:** Добавьте недостающие поля в required_fields

### Проблема: Foreign Key constraint

**Решение:** Убедитесь что родительские таблицы имеют меньший priority

```sql
-- Родительская таблица должна быть priority 2
UPDATE keep_alive_config SET priority = 2 WHERE table_name = 'users';

-- Дочерняя таблица priority 3 или выше
UPDATE keep_alive_config SET priority = 3 WHERE table_name = 'messages';
```

### Проблема: Unique constraint

**Решение:** Используйте плейсхолдеры для генерации уникальных значений

```sql
UPDATE keep_alive_config
SET required_fields = '{
  "email": "keepalive_%%UUID%%@test.com",
  "username": "user_%%RANDOM8%%"
}'::JSONB
WHERE table_name = 'users';
```

---

## 📈 Мониторинг

### Проверка статуса системы

```sql
SELECT 
    COUNT(*) FILTER (WHERE is_enabled = true) as enabled_tables,
    COUNT(*) FILTER (WHERE last_error IS NOT NULL) as tables_with_errors,
    SUM(success_count) as total_successes,
    SUM(error_count) as total_errors
FROM keep_alive_config;
```

### Топ-5 проблемных таблиц

```sql
SELECT table_name, error_count, last_error
FROM keep_alive_config
WHERE error_count > 0
ORDER BY error_count DESC
LIMIT 5;
```

### Последние 20 логов с ошибками

```sql
SELECT table_name, error_message, created_at
FROM keep_alive_logs
WHERE status = 'ERROR'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔄 Миграция со старой версии

Если у вас уже установлена старая версия Keep-Alive:

### 1. Проверьте наличие старой функции
```sql
SELECT * FROM pg_proc WHERE proname = 'keep_alive_test_records';
```

### 2. Удалите старый Cron Job
```sql
SELECT cron.unschedule('keep-alive-test-records');
```

### 3. Установите новую версию (Шаг 1)

### 4. Настройте новые Cron Jobs (Шаг 2)

---

## ✅ Готово!

Динамическая система Keep-Alive установлена и готова к работе! 🎉

**Проверьте:**
- ✅ UI админки: `/admin/keep-alive`
- ✅ Cron jobs настроены
- ✅ Тестовый запуск прошёл успешно
- ✅ Логи пишутся

**Enjoy!** 🚀
