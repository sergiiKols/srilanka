-- ================================================================
-- ПРОВЕРКА РЕАЛЬНОЙ СХЕМЫ saved_properties И archived_properties
-- ================================================================

-- 1. Проверяем все колонки в saved_properties
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'saved_properties'
ORDER BY ordinal_position;

-- 2. Проверяем все колонки в archived_properties
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'archived_properties'
ORDER BY ordinal_position;

-- 3. Сравниваем колонки - какие есть в saved но нет в archived
SELECT 
    'В saved_properties но НЕТ в archived_properties' as status,
    column_name
FROM information_schema.columns 
WHERE table_name = 'saved_properties'
AND column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'archived_properties'
)
ORDER BY column_name;

-- 4. Сравниваем колонки - какие есть в archived но нет в saved
SELECT 
    'В archived_properties но НЕТ в saved_properties' as status,
    column_name
FROM information_schema.columns 
WHERE table_name = 'archived_properties'
AND column_name NOT IN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'saved_properties'
)
ORDER BY column_name;

-- 5. Проверяем существование таблицы tenants
SELECT 
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tenants'
    ) as "Таблица tenants существует?";

-- 6. Если tenants существует - проверяем колонку saved_properties_count
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants'
AND column_name = 'saved_properties_count';

-- 7. Проверяем существующие функции архивации
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('archive_property', 'soft_delete_property', 'restore_property')
ORDER BY routine_name;

-- ================================================================
-- РЕЗУЛЬТАТЫ ПОКАЖУТ:
-- - Точную схему обеих таблиц
-- - Какие колонки не совпадают
-- - Существует ли таблица tenants
-- - Есть ли колонка saved_properties_count
-- - Какие функции уже созданы
-- ================================================================
