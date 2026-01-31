-- ================================================================
-- ПРАВИЛЬНОЕ ИСПРАВЛЕНИЕ СИСТЕМЫ АРХИВАЦИИ (v2 - исправлен синтаксис)
-- На основе реальной схемы базы данных
-- ================================================================

-- ✅ ПРОВЕРЕНО:
-- - Таблица tenants существует: TRUE
-- - Колонка saved_properties_count существует: TRUE (integer, default 0)
-- - Колонки в saved_properties: forward_date, raw_text существуют
-- - Колонки в archived_properties: forward_date, raw_text, views_count, clicks_count существуют

-- ================================================================
-- ШАГ 1: Упрощаем soft_delete_property до старой логики
-- ================================================================

CREATE OR REPLACE FUNCTION soft_delete_property(
  property_id UUID,
  user_id BIGINT,
  reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Архивируем объект через существующую функцию archive_property
  -- Эта функция уже корректно копирует объект в archived_properties
  -- и удаляет из saved_properties
  PERFORM archive_property(property_id, reason, user_id);
  
  -- 2. Уменьшаем счётчик у tenant
  -- GREATEST гарантирует что счётчик не уйдёт в минус
  UPDATE tenants 
  SET saved_properties_count = GREATEST(saved_properties_count - 1, 0)
  WHERE telegram_user_id = user_id;
  
  -- Логируем успешное выполнение
  RAISE NOTICE 'Property % archived successfully, reason: %', property_id, reason;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Обработка ошибок - логируем и возвращаем FALSE
    RAISE NOTICE 'Error in soft_delete_property for property %: %', property_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- ШАГ 2: Даём права на выполнение
-- ================================================================

GRANT EXECUTE ON FUNCTION soft_delete_property(UUID, BIGINT, TEXT) TO anon, authenticated;

-- ================================================================
-- ШАГ 3: Убеждаемся что RLS политика существует
-- ================================================================

-- Сначала удаляем если существует, потом создаём заново
DROP POLICY IF EXISTS "Allow anon read archived" ON archived_properties;

CREATE POLICY "Allow anon read archived"
  ON archived_properties FOR SELECT
  TO anon, authenticated
  USING (can_restore = true);

-- ================================================================
-- ШАГ 4: Проверка что функция создана правильно
-- ================================================================

SELECT 
    'soft_delete_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') as created,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') 
        THEN '✅ ФУНКЦИЯ ИСПРАВЛЕНА!'
        ELSE '❌ Ошибка создания'
    END as status;

-- ================================================================
-- ШАГ 5: ТЕСТ - Создаём тестовый объект для проверки
-- ================================================================

-- Создаём тестовый объект
INSERT INTO saved_properties (
    telegram_user_id, 
    latitude, 
    longitude,
    title, 
    property_type, 
    price, 
    currency
) VALUES (
    999999999, 
    6.0329, 
    80.2168,
    'ТЕСТ - Проверка архивации', 
    'apartment', 
    500, 
    'USD'
)
RETURNING id, title, telegram_user_id;

-- Проверяем счётчик ДО удаления
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик ДО удаления"
FROM tenants 
WHERE telegram_user_id = 999999999;

-- ================================================================
-- ШАГ 6: ИНСТРУКЦИЯ ДЛЯ ТЕСТА
-- ================================================================
-- 
-- 1. Скопируйте ID из результата выше
-- 2. Выполните (замените ID):
-- 
-- SELECT soft_delete_property('ВСТАВЬТЕ_ID_СЮДА'::UUID, 999999999, 'test_deletion');
-- 
-- 3. Проверьте результаты:
--
-- -- Должно вернуть: true
--
-- -- Проверяем что объект переместился:
-- SELECT COUNT(*) as "В saved_properties (должно быть 0)" 
-- FROM saved_properties 
-- WHERE telegram_user_id = 999999999;
--
-- SELECT COUNT(*) as "В archived_properties (должно быть 1)" 
-- FROM archived_properties 
-- WHERE telegram_user_id = 999999999;
--
-- -- Проверяем что счётчик уменьшился:
-- SELECT 
--     telegram_user_id,
--     saved_properties_count as "Счётчик ПОСЛЕ (должно уменьшиться)"
-- FROM tenants 
-- WHERE telegram_user_id = 999999999;
--
-- -- Смотрим архивную запись:
-- SELECT 
--     id, title, archive_reason, can_restore,
--     archived_at, archived_by, days_active
-- FROM archived_properties 
-- WHERE telegram_user_id = 999999999;
--
-- ================================================================

-- ================================================================
-- ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
-- ================================================================
-- 
-- ✅ Функция soft_delete_property исправлена
-- ✅ Вызывает archive_property() - не дублирует код
-- ✅ Уменьшает счётчик tenants.saved_properties_count
-- ✅ Использует GREATEST(count - 1, 0) - счётчик не уходит в минус
-- ✅ Обрабатывает ошибки через EXCEPTION
-- ✅ Логирует успех и ошибки через RAISE NOTICE
-- ✅ RLS политика создана для anon пользователей
-- ✅ Объект перемещается из saved_properties → archived_properties
-- ✅ Admin Panel может показать через "Show Archived"
-- 
-- ================================================================
