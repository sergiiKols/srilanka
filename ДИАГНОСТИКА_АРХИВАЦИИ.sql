-- ================================================================
-- ПОЛНАЯ ДИАГНОСТИКА СИСТЕМЫ АРХИВАЦИИ
-- Выполните этот скрипт и покажите мне результаты!
-- ================================================================

-- ======== ЧАСТЬ 1: ПРОВЕРКА СТРУКТУРЫ ========

-- 1. Проверяем таблицы
SELECT 
    'saved_properties' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_properties') as exists
UNION ALL
SELECT 
    'archived_properties' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'archived_properties') as exists;

-- 2. Проверяем функции
SELECT 
    'archive_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_property') as exists,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_property') 
        THEN '✅ Функция существует'
        ELSE '❌ ФУНКЦИЯ НЕ НАЙДЕНА!'
    END as status
UNION ALL
SELECT 
    'soft_delete_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') as exists,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') 
        THEN '✅ Функция существует'
        ELSE '❌ ФУНКЦИЯ НЕ НАЙДЕНА!'
    END as status
UNION ALL
SELECT 
    'restore_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'restore_property') as exists,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'restore_property') 
        THEN '✅ Функция существует'
        ELSE '❌ ФУНКЦИЯ НЕ НАЙДЕНА!'
    END as status;

-- ======== ЧАСТЬ 2: ПРОВЕРКА ДАННЫХ ========

-- 3. Количество записей
SELECT 
    'saved_properties' as table_name,
    COUNT(*) as total_records
FROM saved_properties
UNION ALL
SELECT 
    'archived_properties' as table_name,
    COUNT(*) as total_records
FROM archived_properties;

-- 3b. Количество доступных для восстановления
SELECT 
    COUNT(*) as "Архивных записей с can_restore=true"
FROM archived_properties 
WHERE can_restore = TRUE;

-- 4. Последние 5 записей из saved_properties
SELECT 
    '=== SAVED_PROPERTIES (последние 5) ===' as info;
    
SELECT 
    id,
    title,
    property_type,
    telegram_user_id,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created
FROM saved_properties
ORDER BY created_at DESC
LIMIT 5;

-- 5. ВСЕ записи из archived_properties
SELECT 
    '=== ARCHIVED_PROPERTIES (все записи) ===' as info;

SELECT 
    id,
    title,
    property_type,
    telegram_user_id,
    can_restore,
    archive_reason,
    TO_CHAR(archived_at, 'YYYY-MM-DD HH24:MI') as archived,
    days_active
FROM archived_properties
ORDER BY archived_at DESC;

-- ======== ЧАСТЬ 3: ПРОВЕРКА RLS ПОЛИТИК ========

-- 6. RLS политики для archived_properties
SELECT 
    '=== RLS ПОЛИТИКИ для archived_properties ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'archived_properties';

-- 7. Проверка включен ли RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('saved_properties', 'archived_properties');

-- ======== ЧАСТЬ 4: ТЕСТОВОЕ УДАЛЕНИЕ (ОПЦИОНАЛЬНО) ========

-- 8. Если хотите протестировать - раскомментируйте этот блок:
/*
-- Сначала создадим тестовый объект
INSERT INTO saved_properties (
    telegram_user_id, latitude, longitude,
    title, property_type, price, currency
) VALUES (
    999999999, 6.0329, 80.2168,
    'TEST DELETE - Должен попасть в архив', 'apartment', 500, 'USD'
)
RETURNING id;

-- Скопируйте ID из результата выше и вставьте сюда:
-- SELECT soft_delete_property('ВСТАВЬТЕ_ID_СЮДА'::UUID, 999999999, 'test_deletion');

-- Проверяем результат:
-- SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 999999999;
-- SELECT COUNT(*) FROM archived_properties WHERE telegram_user_id = 999999999;
*/

-- ======== ЧАСТЬ 5: ВАЖНЫЕ ВЫВОДЫ ========

SELECT 
    '=== ИТОГОВАЯ ДИАГНОСТИКА ===' as info;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'archive_property') 
        THEN '✅'
        ELSE '❌'
    END || ' archive_property функция' as check_1,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') 
        THEN '✅'
        ELSE '❌'
    END || ' soft_delete_property функция' as check_2,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'archived_properties') 
        THEN '✅'
        ELSE '❌'
    END || ' archived_properties таблица' as check_3,
    
    (SELECT COUNT(*) FROM archived_properties)::TEXT || ' записей в архиве' as check_4,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM archived_properties WHERE can_restore = TRUE) > 0
        THEN '✅ Есть записи для показа'
        ELSE '⚠️ Архив пуст - нужно удалить объект для теста'
    END as check_5;

-- ================================================================
-- СКОПИРУЙТЕ ВСЕ РЕЗУЛЬТАТЫ И ПОКАЖИТЕ МНЕ!
-- ================================================================
