-- Final test of all fixed functions

-- Test 1: Check we have 1 archived object now
SELECT COUNT(*) as "Archived objects count" FROM archived_properties;

-- Test 2: Check how many test objects left
SELECT COUNT(*) as "Test objects left" FROM saved_properties WHERE telegram_user_id = 999999999;

-- Test 3: Delete another test object using soft_delete_property
SELECT soft_delete_property(
    (SELECT id FROM saved_properties WHERE telegram_user_id = 999999999 LIMIT 1),
    999999999,
    'function_test'
) as "Function result";

-- Test 4: Check counts after function call
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 999999999) as "Saved (should decrease)",
    (SELECT COUNT(*) FROM archived_properties WHERE telegram_user_id = 999999999) as "Archived (should be 2)";

-- Test 5: Check tenants counter
SELECT 
    telegram_user_id,
    saved_properties_count as "Properties count"
FROM tenants 
WHERE telegram_user_id = 999999999;

-- Test 6: View archived objects
SELECT 
    id,
    title,
    archive_reason,
    can_restore,
    TO_CHAR(archived_at, 'YYYY-MM-DD HH24:MI') as archived_at
FROM archived_properties
WHERE telegram_user_id = 999999999
ORDER BY archived_at DESC;

-- Test 7: Check Admin Panel can read them
SELECT COUNT(*) as "Admin Panel will show" 
FROM archived_properties 
WHERE can_restore = TRUE;
