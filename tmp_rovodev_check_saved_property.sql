-- ============================================
-- ПРОВЕРКА: Почему объект не отображается на карте
-- ============================================

-- 1. Проверить последние 5 объектов пользователя 8311531873
SELECT 
  id,
  title,
  latitude,
  longitude,
  photos,
  array_length(photos, 1) as photo_count,
  deleted_at,
  created_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN '🔴 УДАЛЁН'
    ELSE '✅ АКТИВНЫЙ'
  END as status
FROM saved_properties
WHERE telegram_user_id = 8311531873
ORDER BY created_at DESC
LIMIT 5;

-- 2. Проверить ВСЕ объекты с локацией около 6.9271, 79.8612
-- (это координаты из вашего теста)
SELECT 
  id,
  title,
  latitude,
  longitude,
  photos,
  deleted_at,
  created_at,
  CASE 
    WHEN deleted_at IS NOT NULL THEN '🔴 УДАЛЁН'
    ELSE '✅ АКТИВНЫЙ'
  END as status
FROM saved_properties
WHERE telegram_user_id = 8311531873
  AND latitude BETWEEN 6.92 AND 6.94
  AND longitude BETWEEN 79.85 AND 79.87
ORDER BY created_at DESC;

-- 3. Подсчёт объектов
SELECT 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count,
  COUNT(*) as total_count
FROM saved_properties
WHERE telegram_user_id = 8311531873;

-- 4. Проверить есть ли объекты БЕЗ координат (latitude IS NULL)
SELECT 
  id,
  title,
  latitude,
  longitude,
  deleted_at,
  created_at
FROM saved_properties
WHERE telegram_user_id = 8311531873
  AND (latitude IS NULL OR longitude IS NULL)
ORDER BY created_at DESC
LIMIT 5;

-- 5. Проверить последний сохранённый объект (самый свежий)
SELECT 
  id,
  title,
  property_type,
  latitude,
  longitude,
  photos,
  description,
  raw_text,
  google_maps_url,
  deleted_at,
  created_at
FROM saved_properties
WHERE telegram_user_id = 8311531873
ORDER BY created_at DESC
LIMIT 1;
