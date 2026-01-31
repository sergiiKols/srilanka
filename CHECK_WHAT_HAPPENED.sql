-- ================================================================
-- ПРОВЕРКА: Почему объект не удалился?
-- ================================================================

-- 1. Существует ли тестовый объект всё ещё?
SELECT 
    id, 
    title, 
    telegram_user_id,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM saved_properties 
WHERE telegram_user_id = 999999999;

-- 2. Попал ли он в архив?
SELECT 
    id, 
    title, 
    archive_reason,
    TO_CHAR(archived_at, 'YYYY-MM-DD HH24:MI:SS') as archived_at
FROM archived_properties 
WHERE telegram_user_id = 999999999;

-- 3. Попробуем вызвать soft_delete_property напрямую и посмотрим результат
SELECT soft_delete_property('bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 999999999, 'direct_test_2');

-- 4. Проверяем снова после вызова
SELECT COUNT(*) as "В saved после вызова" 
FROM saved_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

SELECT COUNT(*) as "В archived после вызова" 
FROM archived_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

-- 5. Проверяем что вернула функция
-- Если TRUE - успех, если FALSE или NULL - ошибка
