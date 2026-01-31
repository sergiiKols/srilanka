-- ================================================================
-- ОТЛАДКА: Почему объект не архивируется?
-- ================================================================

-- 1. Проверяем что тестовый объект существует
SELECT 
    id, 
    title, 
    telegram_user_id,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM saved_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

-- 2. Проверяем определение функции archive_property
SELECT 
    pg_get_functiondef(p.oid) as "Определение archive_property"
FROM pg_proc p
WHERE p.proname = 'archive_property';

-- 3. Проверяем определение функции soft_delete_property
SELECT 
    pg_get_functiondef(p.oid) as "Определение soft_delete_property"
FROM pg_proc p
WHERE p.proname = 'soft_delete_property';

-- 4. Попробуем вызвать archive_property напрямую
SELECT archive_property(
    'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 
    'direct_test', 
    999999999
);

-- 5. Проверяем снова
SELECT COUNT(*) as "В saved после прямого вызова" 
FROM saved_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

SELECT COUNT(*) as "В archived после прямого вызова" 
FROM archived_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

-- 6. Если есть ошибки, смотрим логи
-- (в Supabase Dashboard -> Logs -> Postgres Logs)
