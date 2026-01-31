DROP FUNCTION IF EXISTS soft_delete_property(UUID, BIGINT, TEXT) CASCADE;

CREATE FUNCTION soft_delete_property(
  property_id UUID,
  user_id BIGINT,
  reason TEXT DEFAULT 'user_deleted'
)
RETURNS BOOLEAN AS $$
DECLARE
  property_record RECORD;
  days_diff INTEGER;
BEGIN
  SELECT * INTO property_record
  FROM saved_properties
  WHERE id = property_id AND telegram_user_id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  
  days_diff := EXTRACT(DAY FROM (NOW() - property_record.created_at));
  
  INSERT INTO archived_properties (
    id, telegram_user_id, latitude, longitude,
    title, description, raw_text, property_type, photos,
    price, currency, bedrooms, bathrooms, amenities,
    contact_phone, contact_name, source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_date,
    google_maps_url,
    original_created_at, original_updated_at,
    archived_at, archived_by, archive_reason,
    days_active, views_count, clicks_count, can_restore
  ) VALUES (
    property_record.id, property_record.telegram_user_id,
    property_record.latitude, property_record.longitude,
    property_record.title, property_record.description,
    property_record.raw_text, property_record.property_type,
    property_record.photos,
    property_record.price, property_record.currency,
    property_record.bedrooms, property_record.bathrooms,
    CASE 
      WHEN property_record.amenities IS NULL THEN NULL
      ELSE ARRAY(SELECT jsonb_array_elements_text(property_record.amenities))
    END,
    property_record.contact_phone, property_record.contact_name,
    property_record.source_type,
    property_record.forward_from_chat_id,
    property_record.forward_from_chat_title,
    property_record.forward_from_username,
    property_record.forward_from_message_id,
    property_record.forward_date,
    property_record.google_maps_url,
    property_record.created_at, property_record.updated_at,
    NOW(), user_id, reason,
    days_diff, 0, 0, TRUE
  );
  
  DELETE FROM saved_properties
  WHERE id = property_id AND telegram_user_id = user_id;
  
  UPDATE tenants 
  SET saved_properties_count = GREATEST(saved_properties_count - 1, 0)
  WHERE telegram_user_id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION soft_delete_property(UUID, BIGINT, TEXT) TO anon, authenticated;

SELECT soft_delete_property(
    '5c6a8b66-d2a8-4a92-913f-9db5db916576'::UUID,
    999999999,
    'final_working_test'
) as result;

SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE telegram_user_id = 999999999) as saved,
    (SELECT COUNT(*) FROM archived_properties WHERE telegram_user_id = 999999999) as archived;
