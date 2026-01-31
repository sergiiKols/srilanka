-- ================================================================
-- ПЕРЕСОЗДАНИЕ soft_delete_property С ПОЛНЫМ УДАЛЕНИЕМ
-- ================================================================

-- 1. Удаляем ВСЕ версии с CASCADE
DROP FUNCTION IF EXISTS soft_delete_property(UUID, BIGINT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS soft_delete_property(UUID, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS soft_delete_property(UUID) CASCADE;

-- 2. Создаём ПРАВИЛЬНУЮ версию
CREATE FUNCTION soft_delete_property(
  property_id UUID,
  user_id BIGINT,
  reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Call archive_property to do the actual archiving
  PERFORM archive_property(property_id, reason, user_id);
  
  -- Decrease tenant counter
  UPDATE tenants 
  SET saved_properties_count = GREATEST(saved_properties_count - 1, 0)
  WHERE telegram_user_id = user_id;
  
  RAISE NOTICE 'Property % archived successfully', property_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in soft_delete_property: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Даём права
GRANT EXECUTE ON FUNCTION soft_delete_property(UUID, BIGINT, TEXT) TO anon, authenticated;

-- 4. Проверяем определение
SELECT 
    'soft_delete_property' as name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%archive_property%'
        THEN '✅ ИСПРАВЛЕНО! Вызывает archive_property'
        ELSE '❌ ВСЁ ЕЩЁ НЕПРАВИЛЬНО'
    END as status,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'soft_delete_property'
LIMIT 1;

-- 5. ТЕСТ: Удаляем ещё один объект
SELECT soft_delete_property(
    '0b2d2cee-ae98-4356-82c4-c9de4ac7681c'::UUID,
    999999999,
    'final_final_test'
) as test_result;

-- 6. Проверяем результат
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 999999999) as saved_count,
    (SELECT COUNT(*) FROM archived_properties WHERE telegram_user_id = 999999999) as archived_count;

-- Должно быть: saved_count уменьшилось, archived_count увеличилось!
