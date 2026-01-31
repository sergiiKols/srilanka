# 👻 Диагностика "призрачного" объекта

**Дата:** 31 января 2026, 19:30  
**Проблема:** Объект показывается на карте, но не может быть удален (404 ошибка)

---

## 📊 Текущая ситуация

### База данных:
- ✅ `saved_properties`: **3 активных объекта**
- ✅ `archived_properties`: **4 архивных объекта**

### Проблемный объект:
- 🆔 ID: `d6bf7a8b-c054-44b9-a8f4-903586e34948`
- 👤 User: `8311531873`
- ❌ Ошибка: `404 Property not found`

### Логи:
```
15:58:24.879 Delete request for property: d6bf7a8b-c054-44b9-a8f4-903586e34948
15:58:24.879 Archiving property in TypeScript...
15:58:24.919 Property not found or unauthorized
```

---

## 🔍 Причина проблемы

**Объект УЖЕ находится в `archived_properties`**, но:
1. Браузер **закешировал** старые данные
2. Или объект показывается из-за **Supabase Realtime** не обновился
3. Или в базе действительно есть **дубликат** с таким же ID

---

## ✅ Решение

### Шаг 1: Проверить базу данных

Выполните SQL в **Supabase Dashboard → SQL Editor**:

```sql
-- Файл: tmp_rovodev_check_ghost_object.sql

-- 1. Есть ли объект в saved_properties?
SELECT 
  'saved_properties' as table_name,
  *
FROM saved_properties
WHERE id = 'd6bf7a8b-c054-44b9-a8f4-903586e34948';

-- 2. Есть ли объект в archived_properties?
SELECT 
  'archived_properties' as table_name,
  *
FROM archived_properties
WHERE id = 'd6bf7a8b-c054-44b9-a8f4-903586e34948';

-- 3. Все активные объекты пользователя
SELECT 
  id,
  title,
  created_at
FROM saved_properties
WHERE telegram_user_id = 8311531873
ORDER BY created_at DESC;
```

**Ожидаемый результат:**
- ❌ `saved_properties`: **0 строк** (объект НЕ должен быть там)
- ✅ `archived_properties`: **1 строка** (объект ДОЛЖЕН быть в архиве)

---

### Шаг 2: Очистить кеш браузера

#### Вариант A: Hard Refresh (быстрый)
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

#### Вариант B: Очистить весь кеш (надежный)
**Chrome/Edge:**
1. `Ctrl + Shift + Delete` (или `Cmd + Shift + Delete`)
2. Выбрать "Cached images and files"
3. Time range: "All time"
4. Нажать "Clear data"

**Safari:**
1. `Cmd + Option + E`
2. Перезагрузить страницу

---

### Шаг 3: Проверить API напрямую

Откройте в браузере:
```
https://srilanka-37u2.vercel.app/api/saved-properties?userId=8311531873&token=gjd2Xh
```

**Что должно быть:**
```json
{
  "data": [
    // Только АКТИВНЫЕ объекты (без d6bf7a8b-c054-44b9-a8f4-903586e34948)
  ]
}
```

Если `d6bf7a8b-c054-44b9-a8f4-903586e34948` **есть в ответе** - это проблема базы данных!

---

## 🐛 Если объект ДЕЙСТВИТЕЛЬНО в saved_properties

Если SQL показал, что объект **есть в `saved_properties`**, значит произошла проблема при архивации.

**Решение: Удалить вручную**

```sql
-- ОСТОРОЖНО! Проверьте ID перед выполнением!
DELETE FROM saved_properties 
WHERE id = 'd6bf7a8b-c054-44b9-a8f4-903586e34948';
```

**Или переархивировать:**

```sql
-- 1. Скопировать в архив (если еще нет)
INSERT INTO archived_properties (
  id, telegram_user_id, latitude, longitude, title, description,
  property_type, photos, price, currency, bedrooms, bathrooms,
  amenities, contact_phone, source_type, 
  original_created_at, archived_at, archive_reason, can_restore
)
SELECT 
  id, telegram_user_id, latitude, longitude, title, description,
  property_type, photos, price, currency, bedrooms, bathrooms,
  amenities, contact_phone, source_type,
  created_at, NOW(), 'manual_cleanup', true
FROM saved_properties
WHERE id = 'd6bf7a8b-c054-44b9-a8f4-903586e34948'
ON CONFLICT (id) DO NOTHING;

-- 2. Удалить из saved_properties
DELETE FROM saved_properties 
WHERE id = 'd6bf7a8b-c054-44b9-a8f4-903586e34948';
```

---

## 🔧 Если проблема повторяется

### Проблема: DELETE функция не работает

Проверьте функцию `soft_delete_property`:

```sql
-- Проверка что функция существует
SELECT * FROM pg_proc WHERE proname = 'soft_delete_property';

-- Тест функции напрямую
SELECT soft_delete_property('d6bf7a8b-c054-44b9-a8f4-903586e34948'::uuid);
```

---

## 📊 Мониторинг

После исправления проверьте:

1. **База данных:**
   ```sql
   SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 8311531873;
   -- Должно быть: 2 или меньше (без призрака)
   ```

2. **API:**
   ```
   GET /api/saved-properties?userId=8311531873&token=gjd2Xh
   ```

3. **Карта:**
   - Открыть https://srilanka-37u2.vercel.app/map/personal/8311531873/gjd2Xh
   - Должен показаться только 1 объект (или 0, если все удалены)

---

## ✅ Итоги

**Скорее всего:** Это просто кеш браузера! Сделайте Hard Refresh.

**Если не помогло:** Выполните SQL и отправьте мне результаты.

**Если объект в обеих таблицах:** Это дубликат, нужно удалить из `saved_properties`.
