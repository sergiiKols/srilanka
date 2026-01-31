-- Step-by-step debugging

-- Step 1: Check if object exists
SELECT id, title FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

-- Step 2: Try to INSERT into archived_properties manually
INSERT INTO archived_properties (
    id, telegram_user_id, latitude, longitude,
    title, property_type, price, currency,
    original_created_at, archived_at, archive_reason, can_restore, days_active
)
SELECT 
    id, telegram_user_id, latitude, longitude,
    title, property_type, price, currency,
    created_at, NOW(), 'manual_test', TRUE, 0
FROM saved_properties
WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID
RETURNING id, title;

-- Step 3: Check if inserted
SELECT COUNT(*) as archived_count FROM archived_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID;

-- Step 4: Try to DELETE from saved_properties
DELETE FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID
RETURNING id, title;

-- Step 5: Final check
SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = 'bfd8c3ab-4c85-4008-a004-ce923f4c5b2f'::UUID) as in_archived;
