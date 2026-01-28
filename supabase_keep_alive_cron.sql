-- ================================================
-- 🔄 SUPABASE KEEP-ALIVE - ТЕСТОВЫЕ ПРОХОДЫ
-- ================================================
-- Назначение: Записывать тестовые данные в таблицы каждые 3 дня
-- Причина: Поддержание активности на бесплатном тарифе Supabase
-- Частота: Каждые 3 дня (каждый понедельник, четверг, воскресенье)
-- Отключение: Удалить cron job или установить флаг keep_alive_enabled = false
-- ================================================

-- ================================================
-- ТАБЛИЦА ДЛЯ УПРАВЛЕНИЯ KEEP-ALIVE
-- ================================================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вставляем флаг управления keep-alive
INSERT INTO system_config (config_key, config_value, description)
VALUES ('keep_alive_enabled', true, 'Enable/disable automatic test records every 3 days')
ON CONFLICT (config_key) DO NOTHING;

-- ================================================
-- ФУНКЦИЯ: keep_alive_test_records()
-- Описание: Создаёт тестовые записи во всех таблицах
-- Запуск: Каждые 3 дня через Cron
-- ================================================

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
    
    -- ================================================
    -- 1. TELEGRAM_ACCOUNTS
    -- ================================================
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
            'KeepAlive Test Account ' || NOW()::DATE,
            'test_keep_alive',
            'test_hash_' || gen_random_uuid()::TEXT,
            false, -- Не активен
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
    
    -- ================================================
    -- 2. TELEGRAM_GROUPS
    -- ================================================
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
            '@keepalive_test_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
            'KeepAlive Test Group ' || NOW()::DATE,
            'group',
            false, -- Не активна
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
    
    -- ================================================
    -- 3. PROPERTY_LISTINGS
    -- ================================================
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
            100, -- Минимальная цена
            'KeepAlive Test Location',
            0.0,
            0.0,
            1,
            1,
            'AUTO-GENERATED: Keep-alive test record created on ' || NOW()::TEXT || '. This is a dummy record to maintain database activity. Safe to delete.',
            'deleted', -- Сразу помечаем как удалённый
            'cold', -- Минимальный приоритет
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
    
    -- ================================================
    -- 4. LISTING_PUBLICATIONS (если есть зависимости)
    -- ================================================
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
                999999999, -- Фейковый message_id
                'KeepAlive test publication',
                false -- Не активна
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
    
    -- ================================================
    -- 5. LANDLORD_RESPONSES
    -- ================================================
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
                'KeepAlive Test Landlord',
                'Test Property',
                'rejected', -- Сразу отклонён
                'AUTO-GENERATED: Keep-alive test record. Safe to delete.'
            );
            
            RETURN QUERY SELECT 
                'landlord_responses'::TEXT,
                gen_random_uuid(), -- Для совместимости
                'SUCCESS'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 
                'landlord_responses'::TEXT,
                NULL::UUID,
                'ERROR: ' || SQLERRM;
        END;
    END IF;
    
    -- ================================================
    -- 6. TEMPERATURE_CHANGE_LOG
    -- ================================================
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
    
    -- ================================================
    -- ИТОГ
    -- ================================================
    RETURN QUERY SELECT 
        'summary'::TEXT,
        NULL::UUID,
        'Keep-alive cycle completed at ' || NOW()::TEXT;
    
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ФУНКЦИЯ: cleanup_keepalive_records()
-- Описание: Удаляет старые тестовые записи (старше 30 дней)
-- Запуск: Каждую неделю через Cron
-- ================================================

CREATE OR REPLACE FUNCTION cleanup_keepalive_records()
RETURNS TABLE(
    table_name TEXT,
    deleted_count BIGINT
) AS $$
DECLARE
    deleted_accounts BIGINT;
    deleted_groups BIGINT;
    deleted_listings BIGINT;
BEGIN
    -- Удаляем тестовые аккаунты старше 30 дней
    DELETE FROM telegram_accounts
    WHERE notes LIKE '%Keep-alive test record%'
      AND created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_accounts = ROW_COUNT;
    
    RETURN QUERY SELECT 'telegram_accounts'::TEXT, deleted_accounts;
    
    -- Удаляем тестовые группы старше 30 дней
    DELETE FROM telegram_groups
    WHERE notes LIKE '%Keep-alive test record%'
      AND created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_groups = ROW_COUNT;
    
    RETURN QUERY SELECT 'telegram_groups'::TEXT, deleted_groups;
    
    -- Удаляем тестовые объявления старше 30 дней
    -- CASCADE автоматически удалит связанные publications, responses, logs
    DELETE FROM property_listings
    WHERE original_description LIKE '%Keep-alive test record%'
      AND created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_listings = ROW_COUNT;
    
    RETURN QUERY SELECT 'property_listings'::TEXT, deleted_listings;
    
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- КОММЕНТАРИИ
-- ================================================
COMMENT ON TABLE system_config IS 'Конфигурация системы для управления автоматическими задачами';
COMMENT ON FUNCTION keep_alive_test_records IS 'Создаёт тестовые записи каждые 3 дня для поддержания активности Supabase';
COMMENT ON FUNCTION cleanup_keepalive_records IS 'Удаляет старые тестовые записи (старше 30 дней)';

-- ================================================
-- ИНСТРУКЦИИ ПО НАСТРОЙКЕ CRON
-- ================================================

/*
1. ВКЛЮЧИТЬ KEEP-ALIVE (каждые 3 дня в 3:00 утра):
   
   SELECT cron.schedule(
     'keep-alive-test-records',
     '0 3 */3 * *',
     $$SELECT * FROM keep_alive_test_records();$$
   );

2. ОЧИСТКА СТАРЫХ ЗАПИСЕЙ (каждую неделю в 4:00 утра):
   
   SELECT cron.schedule(
     'cleanup-keepalive-records',
     '0 4 * * 0',
     $$SELECT * FROM cleanup_keepalive_records();$$
   );

3. ОТКЛЮЧИТЬ KEEP-ALIVE (временно):
   
   UPDATE system_config 
   SET config_value = false 
   WHERE config_key = 'keep_alive_enabled';

4. ВКЛЮЧИТЬ ОБРАТНО:
   
   UPDATE system_config 
   SET config_value = true 
   WHERE config_key = 'keep_alive_enabled';

5. УДАЛИТЬ CRON JOB ПОЛНОСТЬЮ:
   
   SELECT cron.unschedule('keep-alive-test-records');
   SELECT cron.unschedule('cleanup-keepalive-records');

6. ПРОВЕРИТЬ СТАТУС:
   
   SELECT * FROM system_config WHERE config_key = 'keep_alive_enabled';

7. РУЧНОЙ ЗАПУСК (для теста):
   
   SELECT * FROM keep_alive_test_records();
   SELECT * FROM cleanup_keepalive_records();
*/

-- ================================================
-- ГОТОВО! 🎉
-- ================================================
