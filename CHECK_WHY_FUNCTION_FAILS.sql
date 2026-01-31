-- Check why soft_delete_property returns TRUE but doesn't archive

-- Count before
SELECT COUNT(*) as before_saved FROM saved_properties WHERE telegram_user_id = 999999999;
SELECT COUNT(*) as before_archived FROM archived_properties WHERE telegram_user_id = 999999999;

-- Call function with specific ID
SELECT soft_delete_property(
    '59f945fa-6f24-4c2b-b959-0a5978e5f6dc'::UUID,
    999999999,
    'specific_test'
) as result;

-- Count after
SELECT COUNT(*) as after_saved FROM saved_properties WHERE telegram_user_id = 999999999;
SELECT COUNT(*) as after_archived FROM archived_properties WHERE telegram_user_id = 999999999;

-- Check if the specific object moved
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = '59f945fa-6f24-4c2b-b959-0a5978e5f6dc'::UUID) as specific_in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = '59f945fa-6f24-4c2b-b959-0a5978e5f6dc'::UUID) as specific_in_archived;

-- Check current definition of soft_delete_property
SELECT pg_get_functiondef(p.oid) 
FROM pg_proc p 
WHERE p.proname = 'soft_delete_property'
LIMIT 1;
