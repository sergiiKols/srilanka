-- ================================================================
-- ШАГ 6: ТЕСТОВОЕ УДАЛЕНИЕ
-- ================================================================

-- ЗАМЕНИТЕ 'ID_СЮДА' на реальный UUID из предыдущего шага!
-- SELECT soft_delete_property('ID_СЮДА'::UUID, 999999999, 'test_deletion');

-- Проверяем что объект переместился (должно быть 0)
SELECT COUNT(*) as "В saved_properties (должно быть 0)" 
FROM saved_properties 
WHERE telegram_user_id = 999999999;

-- Проверяем архив (должно быть 1)
SELECT COUNT(*) as "В archived_properties (должно быть 1)" 
FROM archived_properties 
WHERE telegram_user_id = 999999999;

-- Проверяем что счётчик уменьшился
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик ПОСЛЕ (должно уменьшиться)"
FROM tenants 
WHERE telegram_user_id = 999999999;

-- Смотрим архивную запись
SELECT 
    id, title, archive_reason, can_restore,
    archived_at, archived_by, days_active
FROM archived_properties 
WHERE telegram_user_id = 999999999;
