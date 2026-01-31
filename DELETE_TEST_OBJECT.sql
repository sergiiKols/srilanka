-- ================================================================
-- УДАЛЕНИЕ ТЕСТОВОГО ОБЪЕКТА
-- ================================================================

-- Удаляем тестовый объект через функцию soft_delete_property
SELECT soft_delete_property('bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 999999999, 'test_deletion');

-- Проверяем результаты:

-- 1. В saved_properties (должно быть 0)
SELECT COUNT(*) as "В saved_properties (должно быть 0)" 
FROM saved_properties 
WHERE telegram_user_id = 999999999;

-- 2. В archived_properties (должно быть 1)
SELECT COUNT(*) as "В archived_properties (должно быть 1)" 
FROM archived_properties 
WHERE telegram_user_id = 999999999;

-- 3. Счётчик (должно уменьшиться)
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик ПОСЛЕ"
FROM tenants 
WHERE telegram_user_id = 999999999;

-- 4. Смотрим архивную запись
SELECT 
    id, 
    title, 
    archive_reason, 
    can_restore,
    TO_CHAR(archived_at, 'YYYY-MM-DD HH24:MI:SS') as archived_at,
    archived_by, 
    days_active
FROM archived_properties 
WHERE telegram_user_id = 999999999;
