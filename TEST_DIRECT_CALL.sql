-- Direct call to archive_property and check logs
DO $$
DECLARE
    result BOOLEAN;
BEGIN
    RAISE NOTICE 'Starting archive test...';
    
    -- Call archive_property directly
    result := archive_property(
        'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID,
        'direct_call_test',
        999999999
    );
    
    RAISE NOTICE 'Archive result: %', result;
END $$;

-- Check where object is now
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_archived;

-- Check all archived objects
SELECT COUNT(*) as total_archived FROM archived_properties;

-- Check RLS policies on saved_properties
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'saved_properties'
AND cmd = 'DELETE';
