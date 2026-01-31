-- ================================================================
-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ archive_property
-- Удаляем все версии и создаём правильную
-- ================================================================

-- 1. Удаляем ВСЕ версии функции archive_property
DROP FUNCTION IF EXISTS archive_property(UUID, TEXT, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS archive_property(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS archive_property(UUID) CASCADE;

-- 2. Создаём правильную версию с forward_date
CREATE OR REPLACE FUNCTION archive_property(
    property_id UUID, 
    reason TEXT DEFAULT 'user_deleted', 
    archived_by_user BIGINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  property_record RECORD;
  days_diff INTEGER;
BEGIN
  SELECT * INTO property_record
  FROM saved_properties
  WHERE id = property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found: %', property_id;
  END IF;
  
  days_diff := EXTRACT(DAY FROM (NOW() - property_record.created_at));
  
  INSERT INTO archived_properties (
    id, telegram_user_id,
    latitude, longitude,
    title, description, raw_text, property_type,
    photos,
    price, currency,
    bedrooms, bathrooms, amenities,
    contact_phone, contact_name,
    source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_date,
    google_maps_url,
    original_created_at, original_updated_at,
    archived_at, archived_by, archive_reason,
    days_active,
    views_count, clicks_count
  ) VALUES (
    property_record.id, property_record.telegram_user_id,
    property_record.latitude, property_record.longitude,
    property_record.title, property_record.description, property_record.raw_text, property_record.property_type,
    property_record.photos,
    property_record.price, property_record.currency,
    property_record.bedrooms, property_record.bathrooms, property_record.amenities,
    property_record.contact_phone, property_record.contact_name,
    property_record.source_type,
    property_record.forward_from_chat_id, property_record.forward_from_chat_title,
    property_record.forward_from_username, property_record.forward_from_message_id, property_record.forward_date,
    property_record.google_maps_url,
    property_record.created_at, property_record.updated_at,
    NOW(), archived_by_user, reason,
    days_diff,
    0, 0
  );
  
  DELETE FROM saved_properties WHERE id = property_id;
  
  RAISE NOTICE 'Property % archived successfully', property_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in archive_property: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Даём права
GRANT EXECUTE ON FUNCTION archive_property(UUID, TEXT, BIGINT) TO anon, authenticated;

-- 4. Проверяем что функция создана правильно
SELECT 
    'archive_property' as function_name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%forward_date%' 
             AND pg_get_functiondef(p.oid) NOT LIKE '%forward_from_date%'
        THEN '✅ ИСПРАВЛЕНО! Использует forward_date'
        ELSE '❌ ВСЁ ЕЩЁ ОШИБКА'
    END as status
FROM pg_proc p
WHERE p.proname = 'archive_property';

-- 5. Тест: удаляем один из тестовых объектов
SELECT soft_delete_property('bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 999999999, 'final_test');

-- 6. Проверяем результат
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_archived;
