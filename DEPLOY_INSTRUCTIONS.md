# 🚀 Инструкция по применению SQL схемы в Supabase

**Дата:** 2026-01-27  
**Проект:** https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu  
**Статус:** Готово к применению

---

## ⚡ БЫСТРЫЙ СТАРТ (3 минуты)

### Шаг 1: Откройте SQL Editor

1. Перейдите в ваш проект Supabase:
   ```
   https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/sql/new
   ```

2. Или вручную:
   - Откройте https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu
   - В левом меню нажмите **"SQL Editor"**
   - Нажмите **"New query"** (зелёная кнопка)

### Шаг 2: Скопируйте SQL схему

1. Откройте файл `supabase_telegram_listing_schema.sql` в этом проекте
2. Выделите **ВСЁ** содержимое (Ctrl+A / Cmd+A)
3. Скопируйте (Ctrl+C / Cmd+C)

### Шаг 3: Вставьте и выполните

1. Вставьте скопированный SQL в окно редактора Supabase (Ctrl+V / Cmd+V)
2. Нажмите **"RUN"** (или нажмите Ctrl+Enter / Cmd+Enter)
3. Дождитесь выполнения (может занять 10-30 секунд)

### Шаг 4: Проверьте результат

Вы должны увидеть:
```
Success. No rows returned
```

Если видите ошибку - см. секцию "Troubleshooting" ниже.

---

## ✅ ПРОВЕРКА СОЗДАННЫХ ТАБЛИЦ

### Через Table Editor:

1. Перейдите в **Table Editor** (левое меню)
2. Вы должны увидеть новые таблицы:
   - ✅ `telegram_accounts`
   - ✅ `telegram_groups`
   - ✅ `property_listings`
   - ✅ `listing_publications`
   - ✅ `landlord_responses`
   - ✅ `temperature_change_log`

### Через SQL:

Выполните в SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'telegram_accounts',
    'telegram_groups',
    'property_listings',
    'listing_publications',
    'landlord_responses',
    'temperature_change_log'
  )
ORDER BY table_name;
```

Ожидаемый результат: **6 строк**

---

## 🧪 ТЕСТИРОВАНИЕ СХЕМЫ

### Тест 1: Создание Telegram аккаунта

```sql
INSERT INTO telegram_accounts (
  phone_number, 
  account_name, 
  api_id, 
  api_hash, 
  daily_limit
)
VALUES (
  '+94771234567', 
  'Test Account', 
  'your_api_id', 
  'your_api_hash', 
  50
)
RETURNING *;
```

**Ожидаемый результат:** Новая строка с UUID и датами

### Тест 2: Создание Telegram группы

```sql
INSERT INTO telegram_groups (
  telegram_id, 
  group_name, 
  group_type, 
  target_locations, 
  allowed_property_types,
  priority
)
VALUES (
  '@test_sri_lanka_rentals', 
  'Test Sri Lanka Rentals', 
  'group',
  ARRAY['Negombo', 'Hikkaduwa'],
  ARRAY['villa', 'apartment'],
  8
)
RETURNING *;
```

### Тест 3: Создание объявления

```sql
INSERT INTO property_listings (
  property_type,
  price_monthly,
  location_name,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  has_wifi,
  has_pool,
  original_description,
  photos,
  contact_name,
  contact_phone,
  status
)
VALUES (
  'villa',
  800,
  'Negombo',
  7.2091,
  79.8358,
  3,
  2,
  true,
  true,
  'Beautiful beachfront villa with pool, 3 bedrooms, fully furnished. Perfect for digital nomads! Close to beach and restaurants.',
  ARRAY[
    'https://example.com/photo1.jpg', 
    'https://example.com/photo2.jpg', 
    'https://example.com/photo3.jpg'
  ],
  'John Doe',
  '+94771234567',
  'new'
)
RETURNING id, property_type, price_monthly, location_name, temperature, temperature_priority;
```

**Ожидаемый результат:** Новое объявление с температурой 'hot' 🔴 и приоритетом 4

### Тест 4: Валидация объявления

Замените `'listing-uuid'` на ID из предыдущего теста:

```sql
SELECT * FROM validate_listing_data('ВСТАВЬТЕ_UUID_СЮДА');
```

**Ожидаемый результат:**
```json
{
  "is_valid": true,
  "validation_errors": [],
  "missing_fields": []
}
```

### Тест 5: Функция охлаждения

```sql
-- 1. Сначала "состарим" объявление (симуляция 25 часов)
UPDATE property_listings 
SET 
  temperature_changed_at = NOW() - INTERVAL '25 hours',
  status = 'published'
WHERE property_type = 'villa';

-- 2. Запускаем функцию охлаждения
SELECT * FROM cool_down_objects();

-- 3. Проверяем, что температура изменилась на 'warm'
SELECT id, temperature, temperature_priority, temperature_changed_at 
FROM property_listings 
WHERE property_type = 'villa';
```

**Ожидаемый результат:** Температура изменилась с 'hot' на 'warm' 🟠

---

## 🔍 ПРОВЕРКА SQL ФУНКЦИЙ

```sql
-- Список всех функций
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('cool_down_objects', 'validate_listing_data')
ORDER BY routine_name;
```

**Ожидаемый результат:** 2 функции

---

## 🔐 ПРОВЕРКА RLS ПОЛИТИК

```sql
-- Список всех RLS политик
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Ожидаемый результат:** ~10 политик для всех таблиц

---

## ⚠️ TROUBLESHOOTING

### Ошибка: "relation already exists"

**Проблема:** Таблица уже создана ранее

**Решение:**
```sql
-- Удалить все таблицы и начать заново
DROP TABLE IF EXISTS temperature_change_log CASCADE;
DROP TABLE IF EXISTS landlord_responses CASCADE;
DROP TABLE IF EXISTS listing_publications CASCADE;
DROP TABLE IF EXISTS property_listings CASCADE;
DROP TABLE IF EXISTS telegram_groups CASCADE;
DROP TABLE IF EXISTS telegram_accounts CASCADE;

-- Теперь запустите схему снова
```

### Ошибка: "foreign key constraint"

**Проблема:** Ссылка на несуществующую таблицу (например, `users` или `client_rental_requests`)

**Решение:** Убедитесь, что базовые таблицы существуют:
```sql
-- Проверить, есть ли таблица users
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'users'
);

-- Проверить, есть ли таблица client_rental_requests
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'client_rental_requests'
);
```

Если таблиц нет, сначала создайте их или временно уберите foreign key constraints.

### Ошибка: "permission denied"

**Проблема:** Используется неправильный API ключ

**Решение:** Убедитесь, что:
1. Вы залогинены в Supabase Dashboard
2. Выполняете SQL в SQL Editor (не через REST API)

### Ошибка: "syntax error"

**Проблема:** SQL скопирован не полностью или повреждён

**Решение:**
1. Откройте `supabase_telegram_listing_schema.sql` заново
2. Убедитесь, что скопировали **ВСЁ** от начала до конца
3. Проверьте, что не потерялись символы при копировании

---

## 📊 ФИНАЛЬНАЯ ПРОВЕРКА

После успешного применения схемы выполните:

```sql
-- Полная статистика по таблицам
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'telegram_%' 
   OR tablename LIKE '%listing%' 
   OR tablename LIKE '%response%'
ORDER BY tablename;
```

---

## ✅ ЧТО ДАЛЬШЕ?

После успешного применения схемы:

1. ✅ **Настроить Cron Job** для `cool_down_objects()`
   - Database → Cron Jobs → New Cron Job
   - Schedule: `0 * * * *` (каждый час)
   - Function: `cool_down_objects()`

2. ✅ **Добавить тестовые данные**
   - Запустить тесты 1-3 из секции "Тестирование"

3. ✅ **Создать TypeScript клиент**
   - Генерировать типы: `npx supabase gen types typescript`

4. ✅ **Перейти к Phase 2**
   - Валидация данных клиента
   - Интеграция с чат-ботом

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- **Ваш проект:** https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu
- **SQL Editor:** https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/sql
- **Table Editor:** https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/editor
- **Документация Supabase:** https://supabase.com/docs

---

**Статус:** ⏳ Ожидает применения  
**Следующий шаг:** Выполнить SQL в Supabase SQL Editor
