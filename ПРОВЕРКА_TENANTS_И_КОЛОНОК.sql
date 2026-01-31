-- ================================================================
-- ПРОВЕРКА ТАБЛИЦЫ TENANTS И КОЛОНОК
-- ================================================================

-- 1. Существует ли таблица tenants?
SELECT 
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tenants'
    ) as "Таблица tenants существует?";

-- 2. Если tenants существует - проверяем колонку saved_properties_count
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenants'
AND column_name LIKE '%count%'
ORDER BY column_name;

-- 3. Смотрим колонки saved_properties (только важные для архивации)
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'saved_properties'
AND column_name IN (
    'raw_text', 
    'forward_date', 
    'forward_from_date',
    'contact_telegram',
    'location_description',
    'message_link',
    'square_meters'
)
ORDER BY column_name;

-- 4. Проверяем есть ли эти колонки в archived_properties
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'archived_properties'
AND column_name IN (
    'raw_text', 
    'forward_date', 
    'forward_from_date',
    'views_count',
    'clicks_count'
)
ORDER BY column_name;

-- 5. Проверяем определение функции soft_delete_property
SELECT 
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.proname = 'soft_delete_property';

-- ================================================================
-- РЕЗУЛЬТАТЫ ПОКАЖУТ:
-- 1. Есть ли таблица tenants
-- 2. Есть ли saved_properties_count
-- 3. Какие "проблемные" колонки есть/нет
-- 4. Текущее определение soft_delete_property
-- ================================================================
