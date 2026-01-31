-- ================================================================
-- ИСПРАВЛЕНИЕ: Создание функции soft_delete_property
-- ================================================================

-- 1. Сначала создадим функцию soft_delete_property
-- ИСПРАВЛЕНО: Убраны несуществующие колонки, приведено в соответствие со схемой
CREATE OR REPLACE FUNCTION soft_delete_property(
    property_id UUID,
    user_id BIGINT,
    reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    property_record RECORD;
    days_active_count INTEGER;
BEGIN
    -- Получаем запись
    SELECT * INTO property_record
    FROM saved_properties
    WHERE id = property_id 
    AND telegram_user_id = user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Property not found or access denied';
    END IF;

    -- Вычисляем сколько дней объект был активен
    days_active_count := EXTRACT(DAY FROM (NOW() - property_record.created_at))::INTEGER;

    -- Архивируем объект (только существующие колонки!)
    INSERT INTO archived_properties (
        id,
        telegram_user_id,
        latitude,
        longitude,
        title,
        description,
        property_type,
        price,
        currency,
        bedrooms,
        bathrooms,
        amenities,
        photos,
        contact_phone,
        contact_name,
        source_type,
        forward_from_chat_id,
        forward_from_chat_title,
        forward_from_username,
        forward_from_message_id,
        forward_date,
        google_maps_url,
        can_restore,
        archive_reason,
        archived_at,
        archived_by,
        original_created_at,
        original_updated_at,
        days_active
    ) VALUES (
        property_record.id,
        property_record.telegram_user_id,
        property_record.latitude,
        property_record.longitude,
        property_record.title,
        property_record.description,
        property_record.property_type,
        property_record.price,
        property_record.currency,
        property_record.bedrooms,
        property_record.bathrooms,
        property_record.amenities,
        property_record.photos,
        property_record.contact_phone,
        property_record.contact_name,
        property_record.source_type,
        property_record.forward_from_chat_id,
        property_record.forward_from_chat_title,
        property_record.forward_from_username,
        property_record.forward_from_message_id,
        property_record.forward_date,
        property_record.google_maps_url,
        TRUE, -- can_restore
        reason, -- archive_reason
        NOW(), -- archived_at
        user_id, -- archived_by
        property_record.created_at, -- original_created_at
        property_record.updated_at, -- original_updated_at
        days_active_count -- days_active
    );

    -- Удаляем из основной таблицы
    DELETE FROM saved_properties
    WHERE id = property_id 
    AND telegram_user_id = user_id;

    RETURN TRUE;
END;
$$;

-- 2. Даём права на выполнение функции
GRANT EXECUTE ON FUNCTION soft_delete_property TO anon, authenticated;

-- 3. Добавляем RLS политику для anon пользователей (для Admin Panel)
CREATE POLICY IF NOT EXISTS "Allow anon read archived"
  ON archived_properties FOR SELECT
  TO anon, authenticated
  USING (can_restore = true);

-- 4. Проверяем что функция создана
SELECT 
    'soft_delete_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') as created,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') 
        THEN '✅ ФУНКЦИЯ СОЗДАНА!'
        ELSE '❌ Ошибка создания'
    END as status;

-- 5. Проверяем параметры функции
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
WHERE p.proname = 'soft_delete_property';

-- ================================================================
-- ТЕСТ: Теперь попробуем удалить тестовый объект
-- ================================================================

-- 6. Создаём тестовый объект
INSERT INTO saved_properties (
    telegram_user_id, latitude, longitude,
    title, property_type, price, currency
) VALUES (
    999999999, 6.0329, 80.2168,
    'ТЕСТ - Удалить через функцию', 'apartment', 500, 'USD'
)
RETURNING id, title;

-- 7. Скопируйте ID из результата выше и вставьте сюда:
-- SELECT soft_delete_property('ВСТАВЬТЕ_ID'::UUID, 999999999, 'test_deletion');

-- 8. После выполнения проверьте:
-- SELECT COUNT(*) as "В saved_properties" FROM saved_properties WHERE telegram_user_id = 999999999;
-- SELECT COUNT(*) as "В archived_properties" FROM archived_properties WHERE telegram_user_id = 999999999;
-- SELECT * FROM archived_properties WHERE telegram_user_id = 999999999;

-- ================================================================
-- ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
-- - soft_delete_property функция создана ✅
-- - Тестовый объект создан (получите ID)
-- - После вызова функции: 0 в saved_properties, 1 в archived_properties
-- ================================================================
