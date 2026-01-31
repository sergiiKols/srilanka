DROP FUNCTION IF EXISTS soft_delete_property(UUID, BIGINT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS soft_delete_property(UUID, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS soft_delete_property(UUID) CASCADE;

CREATE FUNCTION soft_delete_property(
  property_id UUID,
  user_id BIGINT,
  reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN AS $$
BEGIN
  PERFORM archive_property(property_id, reason, user_id);
  
  UPDATE tenants 
  SET saved_properties_count = GREATEST(saved_properties_count - 1, 0)
  WHERE telegram_user_id = user_id;
  
  RAISE NOTICE 'Property % archived successfully', property_id;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in soft_delete_property: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION soft_delete_property(UUID, BIGINT, TEXT) TO anon, authenticated;

SELECT 
    'soft_delete_property' as name,
    CASE 
        WHEN pg_get_functiondef(p.oid) LIKE '%archive_property%'
        THEN 'OK: calls archive_property'
        ELSE 'ERROR: does not call archive_property'
    END as status
FROM pg_proc p
WHERE p.proname = 'soft_delete_property'
LIMIT 1;

SELECT soft_delete_property(
    '0b2d2cee-ae98-4356-82c4-c9de4ac7681c'::UUID,
    999999999,
    'test'
) as test_result;

SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 999999999) as saved,
    (SELECT COUNT(*) FROM archived_properties WHERE telegram_user_id = 999999999) as archived;
