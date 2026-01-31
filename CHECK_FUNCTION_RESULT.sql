-- Direct call and check result
SELECT soft_delete_property(
    'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID, 
    999999999, 
    'test_3'
) as function_result;

-- Check counts immediately after
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_archived;

-- Check if raw_text column exists in saved_properties
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'saved_properties'
AND column_name IN ('raw_text', 'forward_date', 'forward_from_date');

-- Check archive_property definition for issues
SELECT routine_name, 
       CASE 
           WHEN routine_definition LIKE '%forward_from_date%' THEN 'ERROR: uses forward_from_date'
           WHEN routine_definition LIKE '%forward_date%' THEN 'OK: uses forward_date'
           ELSE 'UNKNOWN'
       END as check_status
FROM information_schema.routines
WHERE routine_name = 'archive_property';
