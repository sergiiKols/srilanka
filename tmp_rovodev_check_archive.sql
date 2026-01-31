-- ============================================
-- ПОЛНАЯ ДИАГНОСТИКА АРХИВАЦИИ
-- ============================================

-- 1. Сколько активных объектов
SELECT 
  'saved_properties' as table_name,
  COUNT(*) as total_count
FROM saved_properties;

-- 2. Сколько архивных объектов (ВСЕГО)
SELECT 
  'archived_properties (total)' as table_name,
  COUNT(*) as total_count
FROM archived_properties;

-- 3. Сколько архивных объектов (can_restore = true)
SELECT 
  'archived_properties (can_restore=true)' as table_name,
  COUNT(*) as total_count
FROM archived_properties
WHERE can_restore = true;

-- 4. Сколько архивных объектов (can_restore = false)
SELECT 
  'archived_properties (can_restore=false)' as table_name,
  COUNT(*) as total_count
FROM archived_properties
WHERE can_restore = false;

-- 5. Список ВСЕХ архивных объектов
SELECT 
  id,
  title,
  telegram_user_id,
  archived_at,
  archive_reason,
  can_restore,
  days_active
FROM archived_properties
ORDER BY archived_at DESC;

-- 6. Список последних активных объектов (по user_id)
SELECT 
  telegram_user_id,
  COUNT(*) as property_count
FROM saved_properties
GROUP BY telegram_user_id
ORDER BY property_count DESC;

-- 7. Проверка - есть ли объекты которые должны быть в архиве
-- (если была миграция с deleted_at, могли остаться)
SELECT 
  COUNT(*) as potentially_missing_archived
FROM saved_properties
WHERE created_at < NOW() - INTERVAL '30 days';

-- 8. История удалений (последние действия)
SELECT 
  id,
  title,
  telegram_user_id,
  archived_at,
  archive_reason
FROM archived_properties
ORDER BY archived_at DESC
LIMIT 20;
