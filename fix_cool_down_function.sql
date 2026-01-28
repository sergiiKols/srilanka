-- ================================================
-- ИСПРАВЛЕНИЕ ФУНКЦИИ cool_down_objects()
-- Проблема: current_time вместо NOW()
-- ================================================

CREATE OR REPLACE FUNCTION cool_down_objects()
RETURNS TABLE(
    listing_id UUID,
    old_temp VARCHAR(20),
    new_temp VARCHAR(20),
    hours_elapsed INT
) AS $$
DECLARE
    current_timestamp TIMESTAMPTZ := NOW();
BEGIN
    RETURN QUERY
    WITH updates AS (
        UPDATE property_listings
        SET 
            temperature = CASE 
                WHEN temperature = 'hot' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 24 THEN 'warm'
                WHEN temperature = 'warm' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 'cool'
                WHEN temperature = 'cool' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 'cold'
                ELSE temperature
            END,
            temperature_priority = CASE 
                WHEN temperature = 'hot' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 24 THEN 3
                WHEN temperature = 'warm' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 2
                WHEN temperature = 'cool' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 1
                ELSE temperature_priority
            END,
            temperature_color = CASE 
                WHEN temperature = 'hot' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 24 THEN '#FFA500'
                WHEN temperature = 'warm' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN '#FFFF00'
                WHEN temperature = 'cool' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN '#0000FF'
                ELSE temperature_color
            END,
            temperature_changed_at = CASE
                WHEN temperature != CASE 
                    WHEN temperature = 'hot' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 24 THEN 'warm'
                    WHEN temperature = 'warm' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 'cool'
                    WHEN temperature = 'cool' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48 THEN 'cold'
                    ELSE temperature
                END
                THEN current_timestamp
                ELSE temperature_changed_at
            END,
            updated_at = current_timestamp
        WHERE 
            status = 'published' 
            AND deleted_at IS NULL
            AND (
                (temperature = 'hot' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 24) OR
                (temperature = 'warm' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48) OR
                (temperature = 'cool' AND EXTRACT(EPOCH FROM (current_timestamp - temperature_changed_at))/3600 >= 48)
            )
        RETURNING 
            id,
            'hot'::VARCHAR(20) as old_temperature,
            temperature as new_temperature
    )
    SELECT 
        u.id as listing_id,
        u.old_temperature as old_temp,
        u.new_temperature as new_temp,
        EXTRACT(EPOCH FROM (current_timestamp - pl.temperature_changed_at))/3600::INT as hours_elapsed
    FROM updates u
    JOIN property_listings pl ON pl.id = u.id;
    
    -- Логируем изменения
    INSERT INTO temperature_change_log (listing_id, old_temperature, new_temperature, old_priority, new_priority, change_reason)
    SELECT 
        pl.id,
        CASE 
            WHEN pl.temperature_priority = 3 THEN 'hot'
            WHEN pl.temperature_priority = 2 THEN 'warm'
            WHEN pl.temperature_priority = 1 THEN 'cool'
        END as old_temperature,
        pl.temperature as new_temperature,
        pl.temperature_priority + 1 as old_priority,
        pl.temperature_priority as new_priority,
        'auto_cooldown' as change_reason
    FROM property_listings pl
    WHERE pl.updated_at >= current_timestamp - INTERVAL '1 second'
      AND pl.temperature != 'hot';
      
END;
$$ LANGUAGE plpgsql;
