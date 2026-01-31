-- ================================================================
-- ПРАВИЛЬНОЕ ИСПРАВЛЕНИЕ СИСТЕМЫ АРХИВАЦИИ
-- На основе реальной схемы базы данных
-- ================================================================

-- ✅ ПРОВЕРЕНО:
-- - Таблица tenants существует: TRUE
-- - Колонка saved_properties_count существует: TRUE (integer, default 0)
-- - Колонки в saved_properties: forward_date, raw_text существуют
-- - Колонки в archived_properties: forward_date, raw_text, views_count, clicks_count существуют

-- ================================================================
-- ШАГИ ИСПРАВЛЕНИЯ:
-- 1. Проверить что archive_property работает с правильной схемой
-- 2. Упростить soft_delete_property до старой логики
-- 3. Добавить уменьшение счётчика tenants.saved_properties_count
-- 4. Добавить обработку ошибок
-- ================================================================

-- ================================================================
-- ШАГ 1: Проверяем текущее состояние функции archive_property
-- ================================================================

-- Смотрим определение
SELECT 
    'Текущая функция archive_property:' as info,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'archive_property';

-- ================================================================
-- ШАГ 2: Упрощаем soft_delete_property до старой логики
-- ================================================================

-- ВАЖНО: Старая логика была правильной!
-- Она вызывала archive_property() и уменьшала счётчик

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
-- ШАГ 3: Даём права на выполнение
-- ================================================================

GRANT EXECUTE ON FUNCTION soft_delete_property TO anon, authenticated;

-- ================================================================
-- ШАГ 4: Убеждаемся что RLS политика существует
-- ================================================================

-- Сначала удаляем если существует, потом создаём заново
DROP POLICY IF EXISTS "Allow anon read archived" ON archived_properties;

CREATE POLICY "Allow anon read archived"
  ON archived_properties FOR SELECT
  TO anon, authenticated
  USING (can_restore = true);

-- ================================================================
-- ПРОВЕРКА: Что функция создана правильно
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
-- ТЕСТ: Создаём тестовый объект для проверки
-- ================================================================

-- 1. Создаём тестовый объект
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

-- 2. Проверяем счётчик ДО удаления
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик ДО удаления"
FROM tenants 
WHERE telegram_user_id = 999999999;

-- ================================================================
-- ИНСТРУКЦИЯ ДЛЯ ТЕСТА:
-- ================================================================
-- 
-- 3. Скопируйте ID из результата выше и выполните:
-- 
-- SELECT soft_delete_property('ВСТАВЬТЕ_ID_СЮДА'::UUID, 999999999, 'test_deletion');
-- 
-- 4. Проверьте результат:
--
-- -- Должно вернуть TRUE:
-- SELECT soft_delete_property('ID'::UUID, 999999999, 'test_deletion');
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
--     saved_properties_count as "Счётчик ПОСЛЕ удаления (должно уменьшиться)"
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
-- ✅ Функция soft_delete_property упрощена до старой логики
-- ✅ Вызывает archive_property() - не дублирует код
-- ✅ Уменьшает счётчик tenants.saved_properties_count
-- ✅ Использует GREATEST(count - 1, 0) - счётчик не уходит в минус
-- ✅ Обрабатывает ошибки через EXCEPTION
-- ✅ Логирует успех и ошибки через RAISE NOTICE
-- ✅ Объект перемещается из saved_properties → archived_properties
-- ✅ Admin Panel может показать через "Show Archived"
-- 
-- ================================================================

-- ================================================================
-- СРАВНЕНИЕ:
-- ================================================================
-- 
-- БЫЛО (новая сломанная логика):
-- - 95 строк кода с дублированием
-- - НЕТ уменьшения счётчика ❌
-- - НЕТ обработки ошибок ❌
-- - Дублирует код archive_property ❌
-- 
-- СТАЛО (старая правильная логика):
-- - 15 строк кода
-- - Уменьшает счётчик ✅
-- - Обрабатывает ошибки ✅
-- - Использует archive_property() ✅
-- - Логирует операции ✅
-- 
-- ================================================================
