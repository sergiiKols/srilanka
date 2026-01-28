-- ================================================
-- 🚀 SUPABASE KEEP-ALIVE - DYNAMIC VERSION v2.0
-- ================================================
-- Автоматическое обнаружение и обработка всех таблиц
-- С защитой от падений и детальным логированием
-- ================================================

-- ====================================
-- 1. ТАБЛИЦА КОНФИГУРАЦИИ ТАБЛИЦ
-- ====================================

CREATE TABLE IF NOT EXISTS keep_alive_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 50, -- Порядок обработки (1=первые, 99=последние)
    required_fields JSONB DEFAULT '{}'::JSONB, -- Обязательные поля и их значения
    notes TEXT,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE keep_alive_config IS 'Configuration for dynamic keep-alive system';
COMMENT ON COLUMN keep_alive_config.priority IS '1-10: High priority (parent tables), 11-50: Medium, 51-99: Low/disabled';
COMMENT ON COLUMN keep_alive_config.required_fields IS 'JSON with required field names and their default values';

-- ====================================
-- 2. ТАБЛИЦА ЛОГОВ
-- ====================================

CREATE TABLE IF NOT EXISTS keep_alive_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'skipped'
    record_id UUID,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keep_alive_logs_table_name ON keep_alive_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_keep_alive_logs_created_at ON keep_alive_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keep_alive_logs_status ON keep_alive_logs(status);

COMMENT ON TABLE keep_alive_logs IS 'Detailed logs of all keep-alive operations';

-- ====================================
-- 3. НАЧАЛЬНАЯ КОНФИГУРАЦИЯ (24 таблицы)
-- ====================================

INSERT INTO keep_alive_config (table_name, is_enabled, priority, required_fields, notes) VALUES
-- ✅ PRIORITY 1: Системные таблицы (простые, без зависимостей)
('system_config', true, 1, '{"config_key": "keepalive_test_%%RANDOM%%"}', 'System configuration table'),
('schema_migrations', false, 99, null, 'Too technical, skip'),

-- ✅ PRIORITY 2: Независимые основные таблицы (без FK)
('telegram_accounts', true, 2, '{
  "phone_number": "+999%%RANDOM8%%",
  "account_name": "KeepAlive Test %%DATE%%",
  "api_id": "test_keepalive",
  "api_hash": "test_hash_%%UUID%%",
  "is_active": false,
  "notes": "AUTO-GENERATED: Keep-alive test record. Safe to delete."
}', 'Telegram accounts for publishing'),

('telegram_groups', true, 2, '{
  "telegram_id": "@keepalive_%%TIMESTAMP%%",
  "group_name": "KeepAlive Test %%DATE%%",
  "group_type": "group",
  "is_active": false,
  "auto_publish": false,
  "notes": "AUTO-GENERATED: Keep-alive test record. Safe to delete."
}', 'Telegram groups and channels'),

('users', true, 2, '{
  "first_name": "KeepAlive",
  "last_name": "Test %%UUID%%",
  "user_type": "tourist",
  "role": "client"
}', 'User profiles'),

('landlords', true, 2, '{
  "business_name": "KeepAlive Test Ltd",
  "primary_email": "landlord_keepalive_%%UUID%%@test.com",
  "verified": false,
  "subscription_tier": "free"
}', 'Property owners'),

-- ✅ PRIORITY 3: Таблицы с некритичными FK
('property_listings', true, 3, '{
  "property_type": "villa",
  "price_monthly": 100,
  "location_name": "KeepAlive Test",
  "latitude": 0.0,
  "longitude": 0.0,
  "bedrooms": 1,
  "bathrooms": 1,
  "original_description": "AUTO-GENERATED: Keep-alive test record created on %%TIMESTAMP%%. Safe to delete.",
  "status": "deleted",
  "temperature": "cold",
  "photos": ["https://example.com/keepalive.jpg"]
}', 'Client property listings'),

('properties', true, 3, '{
  "property_type": "villa",
  "title": "KeepAlive Test Property",
  "description": "AUTO-GENERATED: Keep-alive test record. Safe to delete.",
  "price_per_month": 100,
  "city": "Test City",
  "country": "Test Country",
  "bedrooms": 1,
  "bathrooms": 1,
  "status": "inactive"
}', 'Landlord properties - needs landlord_id, location (PostGIS)'),

('rental_requests', true, 3, '{
  "title": "KeepAlive Test Request",
  "check_in": "%%FUTUREDATE%%",
  "check_out": "%%FUTUREDATE%%",
  "budget_per_night_min": 100,
  "budget_per_night_max": 200,
  "city": "Test City",
  "country": "Test Country",
  "status": "expired"
}', 'Client rental requests - needs user_id, location (PostGIS)'),

('subscriptions', true, 3, '{
  "tier": "free",
  "price_amount": 0,
  "billing_period": "monthly",
  "status": "cancelled",
  "starts_at": "%%NOW%%",
  "ends_at": "%%FUTUREDATE%%",
  "auto_renew": false
}', 'Landlord subscriptions - needs landlord_id'),

-- ✅ PRIORITY 4: Таблицы с зависимостями (могут упасть)
('listing_publications', true, 4, '{
  "telegram_message_id": 999999999,
  "message_text": "KeepAlive test",
  "is_active": false
}', 'Publications in Telegram groups - needs listing_id, group_id, account_id'),

('landlord_responses', true, 4, '{
  "landlord_name": "KeepAlive Test",
  "property_name": "Test Property",
  "status": "rejected",
  "original_message": "AUTO-GENERATED: Keep-alive test record. Safe to delete."
}', 'Landlord responses - needs listing_id'),

('temperature_change_log', true, 4, '{
  "old_temperature": "hot",
  "new_temperature": "cold",
  "old_priority": 4,
  "new_priority": 1,
  "change_reason": "keepalive_test"
}', 'Temperature change log - needs listing_id'),

('offers', true, 4, '{
  "status": "rejected",
  "message": "KeepAlive test"
}', 'Property offers - needs property_id, request_id'),

('messages', true, 4, '{
  "content": "KeepAlive test message",
  "message_type": "text",
  "status": "sent",
  "is_read": true
}', 'User messages - needs from_user_id, to_user_id'),

('client_maps', true, 4, '{
  "title": "KeepAlive Test Map",
  "description": "Test map",
  "zoom_level": 12,
  "map_style": "streets",
  "is_public": false
}', 'Personal maps - needs user_id, center_location (PostGIS)'),

('map_markers', true, 4, '{
  "color": "blue",
  "icon": "home",
  "size": "medium",
  "is_favorite": false,
  "is_hidden": true
}', 'Map markers - needs map_id, offer_id, property_id'),

('payments', true, 4, '{
  "amount": 0,
  "currency": "USD",
  "payment_type": "subscription",
  "status": "failed",
  "payment_method": "manual"
}', 'Payments - needs user_id or landlord_id'),

('notifications', true, 4, '{
  "type": "system",
  "title": "KeepAlive Test",
  "message": "Test notification",
  "is_read": true,
  "sent_via_email": false,
  "sent_via_telegram": false,
  "sent_via_push": false
}', 'Notifications - needs user_id'),

('analytics_events', true, 4, '{
  "event_type": "keepalive_test",
  "event_category": "system",
  "source": "api",
  "metadata": {}
}', 'Analytics events - optional user_id'),

('reviews', true, 4, '{
  "rating": 5,
  "title": "KeepAlive Test Review",
  "comment": "KeepAlive test review",
  "is_verified": false,
  "is_featured": false
}', 'Reviews - needs property_id, user_id, landlord_id'),

('saved_properties', true, 4, '{
  "notes": "KeepAlive test"
}', 'Saved properties - needs user_id, property_id'),

-- ⚠️ DISABLED: Специальные таблицы
('poi_locations', false, 99, null, 'Too large (6,176 records), skip to avoid bloat'),
('spatial_ref_sys', false, 99, null, 'PostGIS system table, do not modify')

ON CONFLICT (table_name) DO UPDATE SET
    updated_at = NOW();

-- ====================================
-- 4. ФУНКЦИЯ: ЗАМЕНА ПЛЕЙСХОЛДЕРОВ
-- ====================================

CREATE OR REPLACE FUNCTION replace_placeholders(template TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT := template;
BEGIN
    -- %%UUID%% → случайный UUID
    result := REGEXP_REPLACE(result, '%%UUID%%', gen_random_uuid()::TEXT, 'g');
    
    -- %%RANDOM%% → случайное число
    result := REGEXP_REPLACE(result, '%%RANDOM%%', FLOOR(RANDOM() * 1000000)::TEXT, 'g');
    
    -- %%RANDOM8%% → 8-значное случайное число
    result := REGEXP_REPLACE(result, '%%RANDOM8%%', FLOOR(RANDOM() * 100000000)::TEXT, 'g');
    
    -- %%TIMESTAMP%% → Unix timestamp
    result := REGEXP_REPLACE(result, '%%TIMESTAMP%%', EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT, 'g');
    
    -- %%DATE%% → текущая дата
    result := REGEXP_REPLACE(result, '%%DATE%%', NOW()::DATE::TEXT, 'g');
    
    -- %%NOW%% → текущее время
    result := REGEXP_REPLACE(result, '%%NOW%%', NOW()::TEXT, 'g');
    
    -- %%FUTUREDATE%% → дата через 30 дней
    result := REGEXP_REPLACE(result, '%%FUTUREDATE%%', (NOW() + INTERVAL '30 days')::DATE::TEXT, 'g');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION replace_placeholders IS 'Replaces placeholders like %%UUID%%, %%RANDOM%% with actual values';

-- ====================================
-- 5. ГЛАВНАЯ ФУНКЦИЯ: ДИНАМИЧЕСКИЙ KEEP-ALIVE
-- ====================================

CREATE OR REPLACE FUNCTION keep_alive_test_records_v2()
RETURNS TABLE(
    table_name TEXT,
    status TEXT,
    record_id UUID,
    error_message TEXT,
    execution_time_ms INTEGER
) AS $$
DECLARE
    table_config RECORD;
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    exec_time INTEGER;
    result_record_id UUID;
    result_status TEXT;
    result_error TEXT;
    is_system_enabled BOOLEAN;
    insert_query TEXT;
    fields_json JSONB;
    field_key TEXT;
    field_value TEXT;
    columns_list TEXT := '';
    values_list TEXT := '';
    created_ids JSONB := '{}'::JSONB; -- Храним созданные ID для FK
BEGIN
    -- Проверяем глобальный флаг
    SELECT config_value INTO is_system_enabled
    FROM system_config
    WHERE config_key = 'keep_alive_enabled';
    
    IF NOT is_system_enabled THEN
        RETURN QUERY SELECT 
            'system'::TEXT,
            'DISABLED'::TEXT,
            NULL::UUID,
            'Keep-alive is turned off in system_config'::TEXT,
            0::INTEGER;
        RETURN;
    END IF;
    
    -- Обрабатываем каждую таблицу по приоритету
    FOR table_config IN 
        SELECT * FROM keep_alive_config 
        WHERE is_enabled = true 
        ORDER BY priority ASC, table_name ASC
    LOOP
        start_time := clock_timestamp();
        result_record_id := NULL;
        result_status := 'ERROR';
        result_error := NULL;
        
        BEGIN
            -- Подготавливаем поля для INSERT
            fields_json := table_config.required_fields;
            columns_list := '';
            values_list := '';
            
            -- Строим INSERT query динамически
            FOR field_key, field_value IN SELECT * FROM jsonb_each_text(fields_json)
            LOOP
                -- Заменяем плейсхолдеры
                field_value := replace_placeholders(field_value);
                
                -- Добавляем поле
                IF columns_list != '' THEN
                    columns_list := columns_list || ', ';
                    values_list := values_list || ', ';
                END IF;
                
                columns_list := columns_list || quote_ident(field_key);
                values_list := values_list || quote_literal(field_value);
            END LOOP;
            
            -- Формируем и выполняем INSERT
            IF columns_list != '' THEN
                insert_query := FORMAT(
                    'INSERT INTO %I (%s) VALUES (%s) RETURNING id',
                    table_config.table_name,
                    columns_list,
                    values_list
                );
                
                EXECUTE insert_query INTO result_record_id;
                
                result_status := 'SUCCESS';
                
                -- Сохраняем ID для использования в FK
                IF result_record_id IS NOT NULL THEN
                    created_ids := jsonb_set(
                        created_ids, 
                        ARRAY[table_config.table_name], 
                        to_jsonb(result_record_id)
                    );
                END IF;
                
                -- Обновляем статистику успеха
                UPDATE keep_alive_config SET
                    last_success_at = NOW(),
                    success_count = success_count + 1,
                    last_error = NULL,
                    updated_at = NOW()
                WHERE id = table_config.id;
            ELSE
                result_status := 'SKIPPED';
                result_error := 'No required fields defined';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            result_status := 'ERROR';
            result_error := SQLERRM;
            
            -- Обновляем статистику ошибки
            UPDATE keep_alive_config SET
                last_error = result_error,
                error_count = error_count + 1,
                updated_at = NOW()
            WHERE id = table_config.id;
        END;
        
        -- Считаем время выполнения
        end_time := clock_timestamp();
        exec_time := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
        
        -- Логируем результат
        INSERT INTO keep_alive_logs (table_name, status, record_id, error_message, execution_time_ms)
        VALUES (table_config.table_name, result_status, result_record_id, result_error, exec_time);
        
        -- Возвращаем результат
        RETURN QUERY SELECT 
            table_config.table_name::TEXT,
            result_status,
            result_record_id,
            result_error,
            exec_time;
    END LOOP;
    
    -- Итоговая запись
    RETURN QUERY SELECT 
        'SUMMARY'::TEXT,
        'COMPLETED'::TEXT,
        NULL::UUID,
        'Keep-alive cycle completed at ' || NOW()::TEXT,
        0::INTEGER;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION keep_alive_test_records_v2 IS 'Dynamic keep-alive: processes all enabled tables with error isolation';

-- ====================================
-- 6. ФУНКЦИЯ: ДОБАВЛЕНИЕ НОВОЙ ТАБЛИЦЫ
-- ====================================

CREATE OR REPLACE FUNCTION add_table_to_keepalive(
    p_table_name VARCHAR,
    p_required_fields JSONB DEFAULT '{}'::JSONB,
    p_priority INTEGER DEFAULT 50,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO keep_alive_config (table_name, is_enabled, priority, required_fields, notes)
    VALUES (p_table_name, true, p_priority, p_required_fields, p_notes)
    ON CONFLICT (table_name) DO UPDATE SET
        required_fields = EXCLUDED.required_fields,
        priority = EXCLUDED.priority,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_table_to_keepalive IS 'Helper function to add new table to keep-alive system';

-- ====================================
-- 7. ФУНКЦИЯ: CLEANUP (30 дней)
-- ====================================

CREATE OR REPLACE FUNCTION cleanup_keepalive_records_v2()
RETURNS TABLE(
    table_name TEXT,
    deleted_count INTEGER,
    status TEXT
) AS $$
DECLARE
    table_config RECORD;
    del_count INTEGER;
    cleanup_query TEXT;
BEGIN
    FOR table_config IN 
        SELECT DISTINCT kac.table_name
        FROM keep_alive_config kac
        WHERE kac.is_enabled = true
    LOOP
        BEGIN
            -- Пробуем удалить по created_at
            cleanup_query := FORMAT(
                'DELETE FROM %I WHERE created_at < NOW() - INTERVAL ''30 days'' 
                 AND (notes LIKE ''%%Keep-alive%%'' OR notes LIKE ''%%AUTO-GENERATED%%'')',
                table_config.table_name
            );
            
            EXECUTE cleanup_query;
            GET DIAGNOSTICS del_count = ROW_COUNT;
            
            RETURN QUERY SELECT 
                table_config.table_name::TEXT,
                del_count,
                'SUCCESS'::TEXT;
                
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                table_config.table_name::TEXT,
                0::INTEGER,
                ('ERROR: ' || SQLERRM)::TEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_keepalive_records_v2 IS 'Removes keep-alive test records older than 30 days';

-- ====================================
-- 8. VIEW: СТАТИСТИКА KEEP-ALIVE
-- ====================================

CREATE OR REPLACE VIEW keep_alive_stats AS
SELECT 
    kac.table_name,
    kac.is_enabled,
    kac.priority,
    kac.success_count,
    kac.error_count,
    kac.last_success_at,
    kac.last_error,
    (SELECT COUNT(*) FROM keep_alive_logs kal 
     WHERE kal.table_name = kac.table_name 
     AND kal.created_at > NOW() - INTERVAL '7 days') as logs_last_7days,
    (SELECT COUNT(*) FROM keep_alive_logs kal 
     WHERE kal.table_name = kac.table_name 
     AND kal.status = 'ERROR' 
     AND kal.created_at > NOW() - INTERVAL '7 days') as errors_last_7days
FROM keep_alive_config kac
ORDER BY kac.priority, kac.table_name;

COMMENT ON VIEW keep_alive_stats IS 'Statistics overview for keep-alive system';

-- ====================================
-- 9. ТЕСТОВЫЙ ЗАПУСК
-- ====================================

-- Раскомментируйте для тестирования:
-- SELECT * FROM keep_alive_test_records_v2();
-- SELECT * FROM keep_alive_stats;
-- SELECT * FROM keep_alive_logs ORDER BY created_at DESC LIMIT 20;

-- ====================================
-- ГОТОВО! 🎉
-- ====================================
