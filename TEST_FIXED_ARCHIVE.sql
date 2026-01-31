-- ================================================================
-- ТЕСТ ИСПРАВЛЕННОЙ ФУНКЦИИ АРХИВАЦИИ
-- ================================================================

-- 1. Удаляем тестовый объект через soft_delete_property
SELECT soft_delete_property('bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 999999999, 'test_deletion') as "Результат удаления";

-- 2. Проверяем что объект переместился
SELECT COUNT(*) as "В saved_properties (должно быть 0)" 
FROM saved_properties 
WHERE telegram_user_id = 999999999;

SELECT COUNT(*) as "В archived_properties (должно быть 1)" 
FROM archived_properties 
WHERE telegram_user_id = 999999999;

-- 3. Проверяем счётчик tenants
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик (должно уменьшиться)"
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
WHERE telegram_user_id = 999999999
ORDER BY archived_at DESC
LIMIT 1;

-- 5. Проверяем Admin Panel - загрузка архивных объектов
SELECT 
    COUNT(*) as "Всего архивных с can_restore=true"
FROM archived_properties 
WHERE can_restore = TRUE;
