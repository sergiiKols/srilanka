-- Check if test object still exists
SELECT 
    id, 
    title, 
    telegram_user_id,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM saved_properties 
WHERE telegram_user_id = 999999999;

-- Check if it is in archive
SELECT 
    id, 
    title, 
    archive_reason,
    TO_CHAR(archived_at, 'YYYY-MM-DD HH24:MI:SS') as archived_at
FROM archived_properties 
WHERE telegram_user_id = 999999999;

-- Try to delete directly
SELECT soft_delete_property('bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 999999999, 'direct_test_2');

-- Check after delete
SELECT COUNT(*) as "saved_count" 
FROM saved_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

SELECT COUNT(*) as "archived_count" 
FROM archived_properties 
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;
