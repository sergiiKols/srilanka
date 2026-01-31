SELECT archive_property(
    '5c6a8b66-d2a8-4a92-913f-9db5db916576'::UUID,
    'direct_test',
    999999999
) as archive_result;

SELECT 
    (SELECT COUNT(*) FROM saved_properties WHERE id = '5c6a8b66-d2a8-4a92-913f-9db5db916576'::UUID) as in_saved,
    (SELECT COUNT(*) FROM archived_properties WHERE id = '5c6a8b66-d2a8-4a92-913f-9db5db916576'::UUID) as in_archived;
