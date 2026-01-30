-- ============================================
-- НАСТРОЙКА ЛОГИКИ АРХИВАЦИИ
-- Удалённые объекты → архив (видны только админу)
-- ============================================

-- 1. Убедиться что таблица archived_properties создана
-- (Сначала выполните 06_create_archived_properties_table.sql)

-- 2. Удалить колонку deleted_at из saved_properties
-- (Больше не используем soft delete)
ALTER TABLE saved_properties DROP COLUMN IF EXISTS deleted_at;

-- 3. Изменить логику проверки дубликатов
-- Теперь дубликаты проверяем ТОЛЬКО в активных объектах

CREATE OR REPLACE FUNCTION check_duplicate_property(
  user_id BIGINT,
  lat DECIMAL,
  lng DECIMAL,
  check_price INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ,
  latitude DECIMAL,
  longitude DECIMAL,
  price INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.title,
    sp.created_at,
    sp.latitude,
    sp.longitude,
    sp.price
  FROM saved_properties sp
  WHERE sp.telegram_user_id = user_id
    AND (
      -- Проверка по координатам (в радиусе 100м)
      (
        ABS(sp.latitude - lat) < 0.001 
        AND ABS(sp.longitude - lng) < 0.001
      )
      OR
      -- Проверка по цене (если указана)
      (
        check_price IS NOT NULL 
        AND sp.price = check_price
        AND ABS(sp.latitude - lat) < 0.01 
        AND ABS(sp.longitude - lng) < 0.01
      )
    )
  ORDER BY sp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Изменить логику загрузки объектов на карту клиента
-- Клиент видит ТОЛЬКО активные объекты (из saved_properties)

CREATE OR REPLACE VIEW client_active_properties AS
SELECT 
  id,
  telegram_user_id,
  latitude,
  longitude,
  title,
  description,
  property_type,
  photos,
  price,
  currency,
  bedrooms,
  bathrooms,
  amenities,
  contact_phone,
  created_at,
  updated_at
FROM saved_properties
ORDER BY created_at DESC;

-- 5. Создать view для админской карты
-- Админ видит: активные + архивные (с меткой)

CREATE OR REPLACE VIEW admin_all_properties AS
-- Активные объекты
SELECT 
  id,
  telegram_user_id,
  latitude,
  longitude,
  title,
  description,
  property_type,
  photos,
  price,
  currency,
  bedrooms,
  bathrooms,
  amenities,
  contact_phone,
  created_at,
  updated_at,
  FALSE as is_archived,
  NULL::TEXT as archive_reason,
  NULL::TIMESTAMPTZ as archived_at
FROM saved_properties

UNION ALL

-- Архивные объекты (помечены как archived)
SELECT 
  id,
  telegram_user_id,
  latitude,
  longitude,
  title,
  description,
  property_type,
  photos,
  price,
  currency,
  bedrooms,
  bathrooms,
  amenities,
  contact_phone,
  original_created_at as created_at,
  NULL::TIMESTAMPTZ as updated_at,
  TRUE as is_archived,
  archive_reason,
  archived_at
FROM archived_properties
WHERE can_restore = TRUE -- Показываем только не восстановленные

ORDER BY created_at DESC;

-- 6. RLS политики для views

-- Клиенты видят только свои активные объекты
CREATE POLICY "Users see only their active properties"
  ON saved_properties FOR SELECT
  USING (
    telegram_user_id = (current_setting('request.jwt.claims', true)::json->>'user_id')::BIGINT
    OR
    telegram_user_id = (auth.jwt()->>'user_id')::BIGINT
  );

-- 7. Функция "мягкого" удаления (архивация)
-- Используется когда пользователь удаляет объект

CREATE OR REPLACE FUNCTION soft_delete_property(
  property_id UUID,
  user_id BIGINT,
  reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Архивируем объект
  PERFORM archive_property(property_id, reason, user_id);
  
  -- Уменьшаем счётчик у tenant
  UPDATE tenants 
  SET saved_properties_count = saved_properties_count - 1
  WHERE telegram_user_id = user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in soft_delete_property: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger на автоматическое уменьшение счётчика при удалении

CREATE OR REPLACE FUNCTION decrease_tenant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tenants 
  SET saved_properties_count = saved_properties_count - 1
  WHERE telegram_user_id = OLD.telegram_user_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrease_count ON saved_properties;
CREATE TRIGGER trigger_decrease_count
  BEFORE DELETE ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION decrease_tenant_count();

-- ============================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- ============================================

-- Клиент видит свои активные объекты:
-- SELECT * FROM client_active_properties WHERE telegram_user_id = 8311531873;

-- Админ видит всё (активные + архивные):
-- SELECT * FROM admin_all_properties ORDER BY created_at DESC;

-- Админ видит только архивные:
-- SELECT * FROM admin_all_properties WHERE is_archived = TRUE;

-- Пользователь удаляет объект (архивация):
-- SELECT soft_delete_property('uuid-here', 8311531873, 'user_deleted');

-- Админ восстанавливает объект:
-- SELECT restore_property('uuid-here', admin_user_id);

-- Проверка дубликатов (только среди активных):
-- SELECT * FROM check_duplicate_property(8311531873, 6.9271, 79.8612, 500);

-- ============================================
-- ИТОГОВАЯ ЛОГИКА:
-- 
-- 1. Клиент создаёт объект → saved_properties
-- 2. Клиент удаляет объект → archived_properties
-- 3. Клиент видит карту → только saved_properties
-- 4. Админ видит карту → saved_properties + archived_properties (с меткой)
-- 5. Дубликаты проверяются → только в saved_properties
-- 6. Админ может восстановить → из archived_properties обратно
-- ============================================
