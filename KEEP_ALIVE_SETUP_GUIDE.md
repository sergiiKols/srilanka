# 🔄 SUPABASE KEEP-ALIVE - ИНСТРУКЦИЯ

**Назначение:** Автоматическое создание тестовых записей каждые 3 дня для поддержания активности базы данных на бесплатном тарифе Supabase.

**Дата создания:** 2026-01-27  
**Статус:** Готово к применению

---

## 🎯 ЧТО ЭТО ДЕЛАЕТ

### Каждые 3 дня автоматически:
1. ✅ Создаёт тестовые записи во всех таблицах:
   - `telegram_accounts` (с пометкой test)
   - `telegram_groups` (неактивная)
   - `property_listings` (status: deleted)
   - `listing_publications` (неактивная)
   - `landlord_responses` (status: rejected)
   - `temperature_change_log` (для истории)

2. ✅ Все записи помечены как тестовые:
   - `notes`: "AUTO-GENERATED: Keep-alive test record. Safe to delete."
   - Неактивные (is_active = false)
   - Минимальный приоритет

3. ✅ Автоматическая очистка:
   - Каждую неделю удаляет записи старше 30 дней
   - Не засоряет базу

---

## 📋 ШАГИ ПО УСТАНОВКЕ

### Шаг 1: Применить SQL схему

Откройте Supabase SQL Editor и выполните файл:
```
supabase_keep_alive_cron.sql
```

Или скопируйте содержимое и вставьте в SQL Editor.

### Шаг 2: Настроить Cron Jobs

#### Вариант A: Через Supabase Dashboard

1. Откройте: https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu
2. Перейдите в **Database** → **Cron Jobs**
3. Нажмите **Enable Cron** (если ещё не включено)

**Создайте Job #1: Keep-Alive**
- Name: `keep-alive-test-records`
- Schedule: `0 3 */3 * *` (каждые 3 дня в 3:00)
- SQL Command:
```sql
SELECT * FROM keep_alive_test_records();
```

**Создайте Job #2: Cleanup**
- Name: `cleanup-keepalive-records`
- Schedule: `0 4 * * 0` (каждое воскресенье в 4:00)
- SQL Command:
```sql
SELECT * FROM cleanup_keepalive_records();
```

#### Вариант B: Через SQL (если pg_cron доступен)

```sql
-- Job #1: Keep-Alive каждые 3 дня
SELECT cron.schedule(
  'keep-alive-test-records',
  '0 3 */3 * *',
  $$SELECT * FROM keep_alive_test_records();$$
);

-- Job #2: Cleanup каждую неделю
SELECT cron.schedule(
  'cleanup-keepalive-records',
  '0 4 * * 0',
  $$SELECT * FROM cleanup_keepalive_records();$$
);
```

### Шаг 3: Проверить работу

Запустите вручную для теста:
```sql
SELECT * FROM keep_alive_test_records();
```

**Ожидаемый результат:**
```
table_name              | record_id                              | status
------------------------|----------------------------------------|--------
telegram_accounts       | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
telegram_groups         | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
property_listings       | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
listing_publications    | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
landlord_responses      | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
temperature_change_log  | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | SUCCESS
summary                 | null                                   | Keep-alive cycle completed...
```

---

## ⚙️ УПРАВЛЕНИЕ

### Временно отключить Keep-Alive:
```sql
UPDATE system_config 
SET config_value = false 
WHERE config_key = 'keep_alive_enabled';
```

### Включить обратно:
```sql
UPDATE system_config 
SET config_value = true 
WHERE config_key = 'keep_alive_enabled';
```

### Проверить статус:
```sql
SELECT * FROM system_config WHERE config_key = 'keep_alive_enabled';
```

### Удалить Cron Jobs полностью:
```sql
SELECT cron.unschedule('keep-alive-test-records');
SELECT cron.unschedule('cleanup-keepalive-records');
```

### Посмотреть все Cron Jobs:
```sql
SELECT * FROM cron.job;
```

---

## 🗑️ РУЧНАЯ ОЧИСТКА

### Удалить все тестовые записи сейчас:
```sql
-- Удалить тестовые аккаунты
DELETE FROM telegram_accounts 
WHERE notes LIKE '%Keep-alive test record%';

-- Удалить тестовые группы
DELETE FROM telegram_groups 
WHERE notes LIKE '%Keep-alive test record%';

-- Удалить тестовые объявления (CASCADE удалит связанные)
DELETE FROM property_listings 
WHERE original_description LIKE '%Keep-alive test record%';
```

### Или использовать функцию:
```sql
SELECT * FROM cleanup_keepalive_records();
```

---

## 📊 РАСПИСАНИЕ CRON

### Keep-Alive: `0 3 */3 * *`
- Каждые 3 дня
- В 3:00 утра (местное время сервера)
- Дни: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31

### Cleanup: `0 4 * * 0`
- Каждое воскресенье
- В 4:00 утра
- Удаляет записи старше 30 дней

### Другие варианты расписания:

```sql
-- Каждые 2 дня в полночь
'0 0 */2 * *'

-- Каждую неделю в понедельник в 2:00
'0 2 * * 1'

-- Каждый месяц 1-го числа в 1:00
'0 1 1 * *'

-- Каждые 12 часов
'0 */12 * * *'
```

---

## 🔍 МОНИТОРИНГ

### Посмотреть последние тестовые записи:
```sql
-- Telegram Accounts
SELECT id, phone_number, account_name, created_at 
FROM telegram_accounts 
WHERE notes LIKE '%Keep-alive%'
ORDER BY created_at DESC 
LIMIT 5;

-- Property Listings
SELECT id, location_name, status, created_at 
FROM property_listings 
WHERE original_description LIKE '%Keep-alive%'
ORDER BY created_at DESC 
LIMIT 5;
```

### Проверить логи Cron (если доступно):
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname IN ('keep-alive-test-records', 'cleanup-keepalive-records')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Тестовые записи безопасны:**
   - Все помечены как неактивные
   - Не влияют на работу приложения
   - Автоматически удаляются через 30 дней

2. **Бесплатный тарif Supabase:**
   - Паузирует проекты после 7 дней неактивности
   - Keep-Alive предотвращает паузу
   - Создаёт минимальную активность в БД

3. **Можно отключить в любой момент:**
   - Просто измените флаг в `system_config`
   - Или удалите Cron Jobs

4. **Не засоряет базу:**
   - Автоочистка каждую неделю
   - Удаляет записи старше 30 дней

---

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Создать тестовые записи
```sql
SELECT * FROM keep_alive_test_records();
```
**Ожидается:** 6-7 записей с статусом SUCCESS

### Тест 2: Проверить созданные записи
```sql
SELECT COUNT(*) FROM telegram_accounts WHERE notes LIKE '%Keep-alive%';
SELECT COUNT(*) FROM telegram_groups WHERE notes LIKE '%Keep-alive%';
SELECT COUNT(*) FROM property_listings WHERE original_description LIKE '%Keep-alive%';
```
**Ожидается:** По 1+ записи в каждой таблице

### Тест 3: Очистка
```sql
-- Искусственно "состарим" записи
UPDATE property_listings 
SET created_at = NOW() - INTERVAL '31 days'
WHERE original_description LIKE '%Keep-alive%';

-- Запускаем очистку
SELECT * FROM cleanup_keepalive_records();
```
**Ожидается:** Старые записи удалены

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:
1. Проверьте, что pg_cron включён в Supabase
2. Убедитесь, что флаг `keep_alive_enabled = true`
3. Проверьте логи Cron Jobs
4. Запустите функцию вручную для отладки

---

**✅ READY TO USE!**

После применения схемы и настройки Cron ваша база данных будет оставаться активной автоматически! 🚀
