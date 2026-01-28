-- ================================================
-- 🔥 TELEGRAM LISTING SYSTEM - DATABASE SCHEMA
-- ================================================
-- Дата создания: 2026-01-27
-- Описание: Полная схема БД для системы публикации объявлений через Telegram
-- Статус: Phase 1 - Infrastructure Setup
-- BACKUP COPY - РЕЗЕРВНАЯ КОПИЯ
-- ================================================

-- ================================================
-- ТАБЛИЦА 1: telegram_accounts
-- Описание: Telegram аккаунты для публикации объявлений
-- ================================================
CREATE TABLE IF NOT EXISTS telegram_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Основная информация
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    
    -- Telegram API данные
    api_id VARCHAR(50) NOT NULL,
    api_hash VARCHAR(100) NOT NULL,
    session_string TEXT, -- Сохраненная сессия GramJS
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    
    -- Статистика использования
    total_publications INT DEFAULT 0,
    daily_publications INT DEFAULT 0,
    daily_limit INT DEFAULT 50, -- Лимит публикаций в день
    
    -- Метаданные
    notes TEXT,
    
    CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+?[0-9]{10,15}$')
);

-- ================================================
-- ТАБЛИЦА 2: telegram_groups
-- Описание: Группы/каналы для публикации объявлений
-- ================================================
CREATE TABLE IF NOT EXISTS telegram_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Основная информация
    telegram_id VARCHAR(100) NOT NULL UNIQUE, -- Username (@group) или ID чата
    group_name VARCHAR(200) NOT NULL,
    group_type VARCHAR(20) DEFAULT 'group', -- 'group', 'channel', 'supergroup'
    
    -- Настройки публикации
    is_active BOOLEAN DEFAULT true,
    auto_publish BOOLEAN DEFAULT true, -- Автоматически публиковать сюда
    priority INT DEFAULT 5, -- Приоритет публикации (1-10)
    
    -- Географические фильтры
    target_locations TEXT[], -- ['Negombo', 'Hikkaduwa', 'Unawatuna']
    
    -- Фильтры по типу недвижимости
    allowed_property_types TEXT[], -- ['villa', 'apartment', 'room']
    min_price_monthly INT,
    max_price_monthly INT,
    
    -- Статистика
    total_publications INT DEFAULT 0,
    last_publication_at TIMESTAMPTZ,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    notes TEXT
);

-- ================================================
-- ТАБЛИЦА 3: property_listings
-- Описание: Объявления о недвижимости от клиентов
-- ================================================
CREATE TABLE IF NOT EXISTS property_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связь с клиентом
    client_request_id UUID REFERENCES client_rental_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Основные данные объекта
    property_type VARCHAR(50) NOT NULL, -- 'villa', 'apartment', 'room', 'house'
    price_monthly INT NOT NULL,
    location_name VARCHAR(200) NOT NULL, -- 'Negombo', 'Hikkaduwa'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Характеристики
    bedrooms INT,
    bathrooms INT,
    area_sqm INT,
    has_wifi BOOLEAN DEFAULT false,
    has_pool BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_kitchen BOOLEAN DEFAULT false,
    has_air_conditioning BOOLEAN DEFAULT false,
    
    -- Описание
    original_description TEXT, -- Оригинальный текст от клиента
    optimized_description TEXT, -- Текст после обработки Grok AI
    description_lang VARCHAR(5) DEFAULT 'ru', -- 'ru', 'en'
    
    -- Медиа
    photos TEXT[], -- Массив URL фотографий
    video_url TEXT,
    
    -- Контактная информация
    contact_name VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_telegram VARCHAR(100),
    contact_whatsapp VARCHAR(20),
    
    -- Статус публикации
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'validated', 'published', 'expired', 'deleted'
    validation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'valid', 'invalid'
    validation_errors JSONB, -- Список ошибок валидации
    
    -- Система температуры
    temperature VARCHAR(20) DEFAULT 'hot', -- 'hot' 🔴, 'warm' 🟠, 'cool' 🟡, 'cold' 🔵
    temperature_color VARCHAR(7) DEFAULT '#FF0000',
    temperature_priority INT DEFAULT 4, -- 4=hot, 3=warm, 2=cool, 1=cold
    temperature_changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Статистика
    views_count INT DEFAULT 0,
    responses_count INT DEFAULT 0,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- Когда истекает объявление
    deleted_at TIMESTAMPTZ,
    
    -- Метаданные Grok AI
    grok_optimization_attempted BOOLEAN DEFAULT false,
    grok_optimization_success BOOLEAN DEFAULT false,
    grok_optimization_at TIMESTAMPTZ,
    
    CONSTRAINT valid_property_type CHECK (property_type IN ('villa', 'apartment', 'room', 'house', 'guesthouse', 'hostel')),
    CONSTRAINT valid_price CHECK (price_monthly >= 100 AND price_monthly <= 10000),
    CONSTRAINT valid_bedrooms CHECK (bedrooms >= 0 AND bedrooms <= 10),
    CONSTRAINT valid_temperature CHECK (temperature IN ('hot', 'warm', 'cool', 'cold')),
    CONSTRAINT valid_status CHECK (status IN ('new', 'validated', 'published', 'expired', 'deleted'))
);

-- ================================================
-- ТАБЛИЦА 4: listing_publications
-- Описание: Публикации объявлений в Telegram группах
-- ================================================
CREATE TABLE IF NOT EXISTS listing_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связи
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES telegram_groups(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES telegram_accounts(id) ON DELETE CASCADE,
    
    -- Данные публикации
    telegram_message_id BIGINT NOT NULL, -- ID сообщения в Telegram
    message_text TEXT NOT NULL, -- Текст отправленного сообщения
    message_lang VARCHAR(5) DEFAULT 'ru',
    
    -- Медиа
    has_photos BOOLEAN DEFAULT false,
    photos_count INT DEFAULT 0,
    
    -- Статус
    is_active BOOLEAN DEFAULT true, -- Активна ли публикация
    deleted_at TIMESTAMPTZ, -- Когда удалена
    
    -- Статистика
    views_count INT DEFAULT 0,
    responses_count INT DEFAULT 0, -- Количество откликов
    
    -- Метаданные
    published_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Уникальность: одно объявление не публикуется дважды в одну группу
    CONSTRAINT unique_listing_per_group UNIQUE (listing_id, group_id)
);

-- ================================================
-- ТАБЛИЦА 5: landlord_responses
-- Описание: Отклики арендодателей на объявления
-- ================================================
CREATE TABLE IF NOT EXISTS landlord_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связи
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES listing_publications(id) ON DELETE SET NULL,
    
    -- Данные арендодателя
    landlord_telegram_id BIGINT, -- Telegram User ID
    landlord_username VARCHAR(100), -- @username
    landlord_phone VARCHAR(20),
    landlord_name VARCHAR(100),
    
    -- Данные объекта от арендодателя
    property_name VARCHAR(200),
    property_address TEXT,
    property_description TEXT,
    property_photos TEXT[], -- URL фотографий
    
    -- Условия
    price_monthly INT,
    available_from DATE,
    min_rental_months INT DEFAULT 1,
    
    -- Характеристики
    property_features JSONB, -- Гибкие характеристики
    
    -- Геолокация
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_verified BOOLEAN DEFAULT false,
    
    -- Статус валидации
    validation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'valid', 'invalid', 'incomplete'
    validation_errors JSONB,
    required_fields TEXT[], -- Недостающие поля
    
    -- Статус обработки
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'processing', 'sent_to_client', 'accepted', 'rejected'
    sent_to_client BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    
    -- Персональная карта
    personal_map_generated BOOLEAN DEFAULT false,
    personal_map_url TEXT,
    
    -- Оригинальное сообщение
    original_message TEXT,
    message_timestamp TIMESTAMPTZ,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_validation_status CHECK (validation_status IN ('pending', 'valid', 'invalid', 'incomplete')),
    CONSTRAINT valid_response_status CHECK (status IN ('new', 'processing', 'sent_to_client', 'accepted', 'rejected'))
);

-- ================================================
-- ТАБЛИЦА 6: temperature_change_log
-- Описание: Лог изменения температуры объектов
-- ================================================
CREATE TABLE IF NOT EXISTS temperature_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связь
    listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
    
    -- Изменение температуры
    old_temperature VARCHAR(20),
    new_temperature VARCHAR(20) NOT NULL,
    old_priority INT,
    new_priority INT NOT NULL,
    
    -- Причина изменения
    change_reason VARCHAR(50) DEFAULT 'auto_cooldown', -- 'auto_cooldown', 'manual', 'new_listing'
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = автоматическое
    
    -- Метаданные
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_old_temperature CHECK (old_temperature IN ('hot', 'warm', 'cool', 'cold') OR old_temperature IS NULL),
    CONSTRAINT valid_new_temperature CHECK (new_temperature IN ('hot', 'warm', 'cool', 'cold'))
);

-- ================================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ================================================

-- Индексы для telegram_accounts
CREATE INDEX idx_telegram_accounts_active ON telegram_accounts(is_active) WHERE is_active = true;
CREATE INDEX idx_telegram_accounts_phone ON telegram_accounts(phone_number);

-- Индексы для telegram_groups
CREATE INDEX idx_telegram_groups_active ON telegram_groups(is_active) WHERE is_active = true;
CREATE INDEX idx_telegram_groups_auto_publish ON telegram_groups(auto_publish) WHERE auto_publish = true;
CREATE INDEX idx_telegram_groups_priority ON telegram_groups(priority DESC);
CREATE INDEX idx_telegram_groups_telegram_id ON telegram_groups(telegram_id);

-- Индексы для property_listings
CREATE INDEX idx_property_listings_status ON property_listings(status);
CREATE INDEX idx_property_listings_temperature ON property_listings(temperature, temperature_priority DESC);
CREATE INDEX idx_property_listings_user ON property_listings(user_id);
CREATE INDEX idx_property_listings_client_request ON property_listings(client_request_id);
CREATE INDEX idx_property_listings_location ON property_listings(latitude, longitude);
CREATE INDEX idx_property_listings_created ON property_listings(created_at DESC);
CREATE INDEX idx_property_listings_published ON property_listings(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_property_listings_active ON property_listings(status, deleted_at) WHERE deleted_at IS NULL;

-- Индексы для listing_publications
CREATE INDEX idx_listing_publications_listing ON listing_publications(listing_id);
CREATE INDEX idx_listing_publications_group ON listing_publications(group_id);
CREATE INDEX idx_listing_publications_account ON listing_publications(account_id);
CREATE INDEX idx_listing_publications_active ON listing_publications(is_active) WHERE is_active = true;
CREATE INDEX idx_listing_publications_published ON listing_publications(published_at DESC);

-- Индексы для landlord_responses
CREATE INDEX idx_landlord_responses_listing ON landlord_responses(listing_id);
CREATE INDEX idx_landlord_responses_publication ON landlord_responses(publication_id);
CREATE INDEX idx_landlord_responses_status ON landlord_responses(status);
CREATE INDEX idx_landlord_responses_validation ON landlord_responses(validation_status);
CREATE INDEX idx_landlord_responses_telegram ON landlord_responses(landlord_telegram_id);
CREATE INDEX idx_landlord_responses_created ON landlord_responses(created_at DESC);

-- Индексы для temperature_change_log
CREATE INDEX idx_temperature_log_listing ON temperature_change_log(listing_id);
CREATE INDEX idx_temperature_log_changed ON temperature_change_log(changed_at DESC);

-- ================================================
-- ФУНКЦИЯ 1: cool_down_objects()
-- Описание: Автоматическое охлаждение объектов по времени
-- Запуск: Каждый час через Supabase Cron
-- ================================================

CREATE OR REPLACE FUNCTION cool_down_objects()
RETURNS TABLE(
    listing_id UUID,
    old_temp VARCHAR(20),
    new_temp VARCHAR(20),
    hours_elapsed INT
) AS $$
DECLARE
    current_time TIMESTAMPTZ := NOW();
BEGIN
    -- Обновляем температуру объектов и логируем изменения
    RETURN QUERY
    WITH updates AS (
        UPDATE property_listings
        SET 
            temperature = CASE 
                -- 🔴 HOT → 🟠 WARM (после 24 часов)
                WHEN temperature = 'hot' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 24 
                THEN 'warm'
                
                -- 🟠 WARM → 🟡 COOL (после 72 часов от начала)
                WHEN temperature = 'warm' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN 'cool'
                
                -- 🟡 COOL → 🔵 COLD (после 120 часов от начала)
                WHEN temperature = 'cool' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN 'cold'
                
                ELSE temperature
            END,
            temperature_priority = CASE 
                WHEN temperature = 'hot' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 24 
                THEN 3
                WHEN temperature = 'warm' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN 2
                WHEN temperature = 'cool' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN 1
                ELSE temperature_priority
            END,
            temperature_color = CASE 
                WHEN temperature = 'hot' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 24 
                THEN '#FFA500'
                WHEN temperature = 'warm' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN '#FFFF00'
                WHEN temperature = 'cool' AND 
                     EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                THEN '#0000FF'
                ELSE temperature_color
            END,
            temperature_changed_at = CASE
                WHEN temperature != CASE 
                    WHEN temperature = 'hot' AND 
                         EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 24 
                    THEN 'warm'
                    WHEN temperature = 'warm' AND 
                         EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                    THEN 'cool'
                    WHEN temperature = 'cool' AND 
                         EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48 
                    THEN 'cold'
                    ELSE temperature
                END
                THEN current_time
                ELSE temperature_changed_at
            END,
            updated_at = current_time
        WHERE 
            status = 'published' 
            AND deleted_at IS NULL
            AND (
                (temperature = 'hot' AND EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 24) OR
                (temperature = 'warm' AND EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48) OR
                (temperature = 'cool' AND EXTRACT(EPOCH FROM (current_time - temperature_changed_at))/3600 >= 48)
            )
        RETURNING 
            id as listing_id,
            LAG(temperature) OVER (PARTITION BY id ORDER BY temperature_changed_at) as old_temp,
            temperature as new_temp,
            EXTRACT(EPOCH FROM (current_time - LAG(temperature_changed_at) OVER (PARTITION BY id ORDER BY temperature_changed_at)))/3600 as hours_elapsed
    )
    SELECT 
        u.listing_id,
        pl.temperature as old_temp,
        u.new_temp,
        EXTRACT(EPOCH FROM (current_time - pl.temperature_changed_at))/3600::INT as hours_elapsed
    FROM updates u
    JOIN property_listings pl ON pl.id = u.listing_id;
    
    -- Логируем изменения
    INSERT INTO temperature_change_log (listing_id, old_temperature, new_temperature, old_priority, new_priority, change_reason)
    SELECT 
        pl.id,
        'hot' as old_temperature,
        pl.temperature as new_temperature,
        4 as old_priority,
        pl.temperature_priority as new_priority,
        'auto_cooldown' as change_reason
    FROM property_listings pl
    WHERE pl.updated_at = current_time 
      AND pl.temperature != 'hot';
      
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ФУНКЦИЯ 2: validate_listing_data()
-- Описание: Валидация данных объявления
-- Возвращает: validation_status и список ошибок
-- ================================================

CREATE OR REPLACE FUNCTION validate_listing_data(listing_uuid UUID)
RETURNS TABLE(
    is_valid BOOLEAN,
    validation_errors JSONB,
    missing_fields TEXT[]
) AS $$
DECLARE
    listing property_listings%ROWTYPE;
    errors JSONB := '[]'::JSONB;
    missing TEXT[] := ARRAY[]::TEXT[];
    valid BOOLEAN := true;
BEGIN
    -- Получаем объявление
    SELECT * INTO listing FROM property_listings WHERE id = listing_uuid;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, '["Listing not found"]'::JSONB, ARRAY['listing']::TEXT[];
        RETURN;
    END IF;
    
    -- Проверка обязательных полей
    
    -- property_type
    IF listing.property_type IS NULL THEN
        missing := array_append(missing, 'property_type');
        errors := errors || '["Missing property_type"]'::JSONB;
        valid := false;
    END IF;
    
    -- price_monthly
    IF listing.price_monthly IS NULL THEN
        missing := array_append(missing, 'price_monthly');
        errors := errors || '["Missing price_monthly"]'::JSONB;
        valid := false;
    ELSIF listing.price_monthly < 100 OR listing.price_monthly > 10000 THEN
        errors := errors || '["Price must be between $100 and $10,000"]'::JSONB;
        valid := false;
    END IF;
    
    -- location
    IF listing.location_name IS NULL OR listing.location_name = '' THEN
        missing := array_append(missing, 'location_name');
        errors := errors || '["Missing location_name"]'::JSONB;
        valid := false;
    END IF;
    
    IF listing.latitude IS NULL OR listing.longitude IS NULL THEN
        missing := array_append(missing, 'coordinates');
        errors := errors || '["Missing coordinates (latitude/longitude)"]'::JSONB;
        valid := false;
    END IF;
    
    -- bedrooms
    IF listing.bedrooms IS NULL THEN
        missing := array_append(missing, 'bedrooms');
        errors := errors || '["Missing bedrooms count"]'::JSONB;
        valid := false;
    END IF;
    
    -- photos
    IF listing.photos IS NULL OR array_length(listing.photos, 1) < 3 THEN
        missing := array_append(missing, 'photos');
        errors := errors || '["Minimum 3 photos required"]'::JSONB;
        valid := false;
    END IF;
    
    -- description
    IF listing.original_description IS NULL OR length(listing.original_description) < 50 THEN
        missing := array_append(missing, 'description');
        errors := errors || '["Description must be at least 50 characters"]'::JSONB;
        valid := false;
    END IF;
    
    -- Обновляем статус в таблице
    UPDATE property_listings
    SET 
        validation_status = CASE WHEN valid THEN 'valid' ELSE 'invalid' END,
        validation_errors = errors,
        updated_at = NOW()
    WHERE id = listing_uuid;
    
    RETURN QUERY SELECT valid, errors, missing;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- RLS (ROW LEVEL SECURITY) ПОЛИТИКИ
-- ================================================

-- Включаем RLS для всех таблиц
ALTER TABLE telegram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlord_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_change_log ENABLE ROW LEVEL SECURITY;

-- telegram_accounts: только администраторы
CREATE POLICY "Admin full access to telegram_accounts" ON telegram_accounts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- telegram_groups: админы могут всё, пользователи - только читать
CREATE POLICY "Admin full access to telegram_groups" ON telegram_groups
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can read telegram_groups" ON telegram_groups
    FOR SELECT USING (is_active = true);

-- property_listings: пользователи видят только свои
CREATE POLICY "Users can manage own listings" ON property_listings
    FOR ALL USING (
        auth.uid() = user_id OR
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can read published listings" ON property_listings
    FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- listing_publications: все могут читать активные
CREATE POLICY "All can read active publications" ON listing_publications
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to publications" ON listing_publications
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- landlord_responses: пользователи видят отклики на свои объявления
CREATE POLICY "Users can read responses to own listings" ON landlord_responses
    FOR SELECT USING (
        listing_id IN (SELECT id FROM property_listings WHERE user_id = auth.uid()) OR
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Admin full access to responses" ON landlord_responses
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- temperature_change_log: только чтение для всех
CREATE POLICY "All can read temperature log" ON temperature_change_log
    FOR SELECT USING (true);

CREATE POLICY "Admin can modify temperature log" ON temperature_change_log
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- ================================================
-- ТРИГГЕРЫ
-- ================================================

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telegram_accounts_updated_at BEFORE UPDATE ON telegram_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_groups_updated_at BEFORE UPDATE ON telegram_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_listings_updated_at BEFORE UPDATE ON property_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landlord_responses_updated_at BEFORE UPDATE ON landlord_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ================================================

COMMENT ON TABLE telegram_accounts IS 'Telegram аккаунты для публикации объявлений через Telegram Client API';
COMMENT ON TABLE telegram_groups IS 'Группы и каналы Telegram для публикации объявлений';
COMMENT ON TABLE property_listings IS 'Объявления о недвижимости от клиентов с системой температурной градации';
COMMENT ON TABLE listing_publications IS 'История публикаций объявлений в Telegram группах';
COMMENT ON TABLE landlord_responses IS 'Отклики арендодателей на объявления';
COMMENT ON TABLE temperature_change_log IS 'Лог изменения температуры объектов (hot→warm→cool→cold)';

-- ================================================
-- ГОТОВО! 🎉
-- ================================================
-- Следующие шаги:
-- 1. Выполнить этот SQL в Supabase SQL Editor
-- 2. Настроить Supabase Cron для функции cool_down_objects()
-- 3. Создать TypeScript типы (supabase gen types typescript)
-- 4. Начать Phase 2: Валидация данных клиента
-- ================================================
