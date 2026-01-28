-- ================================================
-- 🔄 SUPABASE KEEP-ALIVE - SAFE VERSION (без cleanup)
-- ================================================

-- Таблица конфигурации
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_config (config_key, config_value, description)
VALUES ('keep_alive_enabled', true, 'Enable/disable automatic test records every 3 days')
ON CONFLICT (config_key) DO NOTHING;

-- Функция создания тестовых записей
CREATE OR REPLACE FUNCTION keep_alive_test_records()
RETURNS TABLE(
    table_name TEXT,
    record_id UUID,
    status TEXT
) AS $$
DECLARE
    is_enabled BOOLEAN;
    test_account_id UUID;
    test_group_id UUID;
    test_listing_id UUID;
    test_publication_id UUID;
BEGIN
    -- Проверяем, включена ли функция
    SELECT config_value INTO is_enabled
    FROM system_config
    WHERE config_key = 'keep_alive_enabled';
    
    IF NOT is_enabled THEN
        RETURN QUERY SELECT 
            'system'::TEXT as table_name,
            NULL::UUID as record_id,
            'DISABLED: Keep-alive is turned off'::TEXT as status;
        RETURN;
    END IF;
    
    -- 1. TELEGRAM_ACCOUNTS
    BEGIN
        INSERT INTO telegram_accounts (
            phone_number,
            account_name,
            api_id,
            api_hash,
            is_active,
            notes
        )
        VALUES (
            '+999' || FLOOR(RANDOM() * 100000000)::TEXT,
            'KeepAlive Test ' || NOW()::DATE,
            'test_keep_alive',
            'test_hash_' || gen_random_uuid()::TEXT,
            false,
            'AUTO-GENERATED: Keep-alive test record. Safe to delete.'
        )
        RETURNING id INTO test_account_id;
        
        RETURN QUERY SELECT 
            'telegram_accounts'::TEXT,
            test_account_id,
            'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'telegram_accounts'::TEXT,
            NULL::UUID,
            'ERROR: ' || SQLERRM;
    END;
    
    -- 2. TELEGRAM_GROUPS
    BEGIN
        INSERT INTO telegram_groups (
            telegram_id,
            group_name,
            group_type,
            is_active,
            auto_publish,
            notes
        )
        VALUES (
            '@keepalive_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            'KeepAlive Test ' || NOW()::DATE,
            'group',
            false,
            false,
            'AUTO-GENERATED: Keep-alive test record. Safe to delete.'
        )
        RETURNING id INTO test_group_id;
        
        RETURN QUERY SELECT 
            'telegram_groups'::TEXT,
            test_group_id,
            'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'telegram_groups'::TEXT,
            NULL::UUID,
            'ERROR: ' || SQLERRM;
    END;
    
    -- 3. PROPERTY_LISTINGS
    BEGIN
        INSERT INTO property_listings (
            property_type,
            price_monthly,
            location_name,
            latitude,
            longitude,
            bedrooms,
            bathrooms,
            original_description,
            status,
            temperature,
            photos
        )
        VALUES (
            'villa',
            100,
            'KeepAlive Test',
            0.0,
            0.0,
            1,
            1,
            'AUTO-GENERATED: Keep-alive test record created on ' || NOW()::TEXT || '. Safe to delete.',
            'deleted',
            'cold',
            ARRAY['https://example.com/keepalive.jpg']
        )
        RETURNING id INTO test_listing_id;
        
        RETURN QUERY SELECT 
            'property_listings'::TEXT,
            test_listing_id,
            'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'property_listings'::TEXT,
            NULL::UUID,
            'ERROR: ' || SQLERRM;
    END;
    
    -- 4. LISTING_PUBLICATIONS
    IF test_listing_id IS NOT NULL AND test_group_id IS NOT NULL AND test_account_id IS NOT NULL THEN
        BEGIN
            INSERT INTO listing_publications (
                listing_id,
                group_id,
                account_id,
                telegram_message_id,
                message_text,
                is_active
            )
            VALUES (
                test_listing_id,
                test_group_id,
                test_account_id,
                999999999,
                'KeepAlive test',
                false
            )
            RETURNING id INTO test_publication_id;
            
            RETURN QUERY SELECT 
                'listing_publications'::TEXT,
                test_publication_id,
                'SUCCESS'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'listing_publications'::TEXT,
                NULL::UUID,
                'ERROR: ' || SQLERRM;
        END;
    END IF;
    
    -- 5. LANDLORD_RESPONSES
    IF test_listing_id IS NOT NULL THEN
        BEGIN
            INSERT INTO landlord_responses (
                listing_id,
                landlord_name,
                property_name,
                status,
                original_message
            )
            VALUES (
                test_listing_id,
                'KeepAlive Test',
                'Test Property',
                'rejected',
                'AUTO-GENERATED: Keep-alive test record. Safe to delete.'
            );
            
            RETURN QUERY SELECT 
                'landlord_responses'::TEXT,
                gen_random_uuid(),
                'SUCCESS'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'landlord_responses'::TEXT,
                NULL::UUID,
                'ERROR: ' || SQLERRM;
        END;
    END IF;
    
    -- 6. TEMPERATURE_CHANGE_LOG
    IF test_listing_id IS NOT NULL THEN
        BEGIN
            INSERT INTO temperature_change_log (
                listing_id,
                old_temperature,
                new_temperature,
                old_priority,
                new_priority,
                change_reason
            )
            VALUES (
                test_listing_id,
                'hot',
                'cold',
                4,
                1,
                'keepalive_test'
            );
            
            RETURN QUERY SELECT 
                'temperature_change_log'::TEXT,
                gen_random_uuid(),
                'SUCCESS'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'temperature_change_log'::TEXT,
                NULL::UUID,
                'ERROR: ' || SQLERRM;
        END;
    END IF;
    
    RETURN QUERY SELECT 
        'summary'::TEXT,
        NULL::UUID,
        'Keep-alive cycle completed at ' || NOW()::TEXT;
    
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE system_config IS 'System configuration for keep-alive feature';
COMMENT ON FUNCTION keep_alive_test_records IS 'Creates test records every 3 days to keep Supabase active';
