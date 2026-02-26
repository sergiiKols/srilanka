-- =====================================================
-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- Дата: 2026-02-25
-- Описание: Все таблицы для системы аренды недвижимости
-- =====================================================

-- =====================================================
-- РАСШИРЕНИЯ
-- =====================================================

-- Генерация UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Для работы с географическими данными (опционально)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- ТАБЛИЦА 1: tenants (арендаторы)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
  -- Идентификаторы
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  
  -- Безопасность
  map_secret_token VARCHAR(6) UNIQUE NOT NULL,
  personal_map_url TEXT UNIQUE,
  
  -- Статистика
  saved_properties_count INT DEFAULT 0,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE tenants IS 'Арендаторы - пользователи которые ищут жильё';
COMMENT ON COLUMN tenants.telegram_user_id IS 'Уникальный ID пользователя из Telegram';
COMMENT ON COLUMN tenants.map_secret_token IS 'Секретный токен для доступа к карте (6 символов)';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tenants_telegram_id ON tenants(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_token ON tenants(map_secret_token);

-- =====================================================
-- ФУНКЦИЯ: generate_token_6chars()
-- =====================================================

CREATE OR REPLACE FUNCTION generate_token_6chars()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_token_6chars() IS 'Генерирует случайный 6-символьный токен (62^6 = 56 млрд комбинаций)';

-- =====================================================
-- ТАБЛИЦА 2: saved_properties (сохранённые объекты)
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_properties (
  -- Идентификаторы
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  
  -- Основная информация
  title TEXT,
  description TEXT,
  notes TEXT,
  raw_text TEXT,
  
  -- Местоположение
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_maps_url TEXT,
  address TEXT,
  
  -- Детали объекта
  property_type TEXT,
  bedrooms INT,
  bathrooms INT,
  area_sqm INT,
  
  -- Финансы
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  price_period TEXT,
  price_usd NUMERIC, -- автоматически конвертируется
  
  -- Медиа
  photos TEXT[],
  videos JSONB DEFAULT '[]'::jsonb,
  
  -- Удобства и фильтры
  amenities JSONB,
  pool BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  breakfast BOOLEAN DEFAULT false,
  air_conditioning BOOLEAN DEFAULT false,
  kitchen BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  beachfront BOOLEAN DEFAULT false,
  garden BOOLEAN DEFAULT false,
  
  -- Безопасность и метрики
  security TEXT DEFAULT 'none' CHECK (security IN ('none', 'standard', 'high', 'gated')),
  wifi_speed INTEGER,
  beach_distance INTEGER,
  area_name TEXT,
  
  -- AI метаданные
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  ai_provider TEXT,
  
  -- Контакты
  contact_info TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  
  -- Метаданные пересылки (forward)
  source_type TEXT DEFAULT 'direct',
  forward_from_user_id BIGINT,
  forward_from_username TEXT,
  forward_from_first_name TEXT,
  forward_from_chat_id BIGINT,
  forward_from_chat_title TEXT,
  forward_from_chat_username TEXT,
  forward_from_message_id BIGINT,
  forward_date TIMESTAMPTZ,
  original_message_link TEXT,
  
  -- Метаданные
  is_favorite BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE saved_properties IS 'Объекты недвижимости сохранённые арендаторами';
COMMENT ON COLUMN saved_properties.photos IS 'Массив URL фотографий объекта';
COMMENT ON COLUMN saved_properties.videos IS 'Массив видео [{file_id, thumbnail_id, duration, size}]';
COMMENT ON COLUMN saved_properties.price_usd IS 'Цена в USD (автоматически конвертируется)';
COMMENT ON COLUMN saved_properties.deleted_at IS 'Soft delete: NULL = активный, NOT NULL = удалён';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_saved_props_tenant ON saved_properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_props_telegram_id ON saved_properties(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_props_location ON saved_properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saved_props_created ON saved_properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_props_favorite ON saved_properties(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_deleted_at ON saved_properties(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saved_properties_active ON saved_properties(telegram_user_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_properties_price_usd ON saved_properties(price_usd) WHERE price_usd IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_saved_properties_pool ON saved_properties(pool) WHERE pool = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_parking ON saved_properties(parking) WHERE parking = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_beachfront ON saved_properties(beachfront) WHERE beachfront = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_area_name ON saved_properties(area_name);
CREATE INDEX IF NOT EXISTS idx_saved_properties_videos ON saved_properties USING GIN (videos);

-- =====================================================
-- ТРИГГЕРЫ для saved_properties
-- =====================================================

-- Триггер 1: Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_properties_updated_at
  BEFORE UPDATE ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Триггер 2: Обновление счётчика в tenants
CREATE OR REPLACE FUNCTION update_tenants_properties_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE tenants 
    SET saved_properties_count = saved_properties_count + 1
    WHERE telegram_user_id = NEW.telegram_user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE tenants 
    SET saved_properties_count = saved_properties_count - 1
    WHERE telegram_user_id = OLD.telegram_user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_count_on_insert
  AFTER INSERT ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_properties_count();

CREATE TRIGGER update_properties_count_on_delete
  AFTER DELETE ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_properties_count();

-- Триггер 3: Автоматическая конвертация price в price_usd
CREATE OR REPLACE FUNCTION calculate_price_usd()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.price != OLD.price OR NEW.currency != OLD.currency) THEN
    NEW.price_usd := CASE 
      WHEN NEW.currency = 'USD' OR NEW.currency IS NULL THEN NEW.price
      WHEN NEW.currency = 'LKR' THEN NEW.price * 0.0031
      WHEN NEW.currency = 'EUR' THEN NEW.price * 1.09
      WHEN NEW.currency = 'GBP' THEN NEW.price * 1.27
      WHEN NEW.currency = 'INR' THEN NEW.price * 0.012
      WHEN NEW.currency = 'RUB' THEN NEW.price * 0.011
      ELSE NEW.price
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_price_usd
  BEFORE INSERT OR UPDATE OF price, currency ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_usd();

-- =====================================================
-- ТАБЛИЦА 3: archived_properties (архив удалённых)
-- =====================================================

CREATE TABLE IF NOT EXISTS archived_properties (
  -- Основные поля (копия из saved_properties)
  id UUID PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  
  -- Координаты
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Основная информация
  title TEXT,
  description TEXT,
  raw_text TEXT,
  property_type TEXT,
  
  -- Фотографии и видео
  photos TEXT[] DEFAULT '{}',
  videos JSONB DEFAULT '[]'::jsonb,
  
  -- Цена
  price INTEGER,
  currency TEXT DEFAULT 'USD',
  price_usd NUMERIC,
  
  -- Детали
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[],
  
  -- Контакты
  contact_phone TEXT,
  contact_name TEXT,
  
  -- Источник
  source_type TEXT DEFAULT 'forward',
  forward_from_chat_id BIGINT,
  forward_from_chat_title TEXT,
  forward_from_username TEXT,
  forward_from_message_id BIGINT,
  forward_date TIMESTAMPTZ,
  google_maps_url TEXT,
  
  -- Оригинальные даты
  original_created_at TIMESTAMPTZ NOT NULL,
  original_updated_at TIMESTAMPTZ,
  
  -- Поля архивации
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_by BIGINT,
  archive_reason TEXT DEFAULT 'user_deleted',
  
  -- Аналитика
  days_active INTEGER,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Восстановление
  can_restore BOOLEAN DEFAULT TRUE,
  restored_at TIMESTAMPTZ,
  restored_by BIGINT,
  
  -- Метаданные
  notes TEXT,
  tags TEXT[]
);

-- Индексы для архива
CREATE INDEX IF NOT EXISTS idx_archived_user ON archived_properties(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_archived_date ON archived_properties(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_archived_reason ON archived_properties(archive_reason);

-- =====================================================
-- ФУНКЦИИ архивирования
-- =====================================================

CREATE OR REPLACE FUNCTION archive_property(
  property_id UUID, 
  reason TEXT DEFAULT 'user_deleted', 
  archived_by_user BIGINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  property_record RECORD;
  days_diff INTEGER;
BEGIN
  SELECT * INTO property_record FROM saved_properties WHERE id = property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found: %', property_id;
  END IF;
  
  days_diff := EXTRACT(DAY FROM (NOW() - property_record.created_at));
  
  INSERT INTO archived_properties (
    id, telegram_user_id, latitude, longitude,
    title, description, raw_text, property_type,
    photos, videos, price, currency, price_usd,
    bedrooms, bathrooms, amenities,
    contact_phone, contact_name, source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_from_date,
    google_maps_url, original_created_at, original_updated_at,
    archived_at, archived_by, archive_reason, days_active
  ) VALUES (
    property_record.id, property_record.telegram_user_id,
    property_record.latitude, property_record.longitude,
    property_record.title, property_record.description, 
    property_record.raw_text, property_record.property_type,
    property_record.photos, property_record.videos,
    property_record.price, property_record.currency, property_record.price_usd,
    property_record.bedrooms, property_record.bathrooms, property_record.amenities,
    property_record.contact_phone, property_record.contact_name, property_record.source_type,
    property_record.forward_from_chat_id, property_record.forward_from_chat_title,
    property_record.forward_from_username, property_record.forward_from_message_id, 
    property_record.forward_date, property_record.google_maps_url,
    property_record.created_at, property_record.updated_at,
    NOW(), archived_by_user, reason, days_diff
  );
  
  DELETE FROM saved_properties WHERE id = property_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_property(
  property_id UUID, 
  restored_by_user BIGINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  archived_record RECORD;
BEGIN
  SELECT * INTO archived_record
  FROM archived_properties
  WHERE id = property_id AND can_restore = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found or cannot be restored: %', property_id;
  END IF;
  
  INSERT INTO saved_properties (
    id, telegram_user_id, latitude, longitude,
    title, description, raw_text, property_type,
    photos, videos, price, currency,
    bedrooms, bathrooms, amenities,
    contact_phone, contact_name, source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_from_date,
    google_maps_url, created_at, updated_at
  ) VALUES (
    archived_record.id, archived_record.telegram_user_id,
    archived_record.latitude, archived_record.longitude,
    archived_record.title, archived_record.description, 
    archived_record.raw_text, archived_record.property_type,
    archived_record.photos, archived_record.videos,
    archived_record.price, archived_record.currency,
    archived_record.bedrooms, archived_record.bathrooms, archived_record.amenities,
    archived_record.contact_phone, archived_record.contact_name, archived_record.source_type,
    archived_record.forward_from_chat_id, archived_record.forward_from_chat_title,
    archived_record.forward_from_username, archived_record.forward_from_message_id, 
    archived_record.forward_date, archived_record.google_maps_url,
    archived_record.original_created_at, NOW()
  );
  
  UPDATE archived_properties
  SET restored_at = NOW(), restored_by = restored_by_user, can_restore = FALSE
  WHERE id = property_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ТАБЛИЦА 4: pois (Points of Interest - спаршенные POI)
-- =====================================================

CREATE TABLE IF NOT EXISTS pois (
  -- Идентификаторы
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  osm_id TEXT,
  google_place_id TEXT,
  
  -- Основное
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  layer TEXT NOT NULL, -- 'food', 'beach', 'culture', 'medical', 'transport', 'shopping', 'entertainment'
  subcategory TEXT,
  
  -- Координаты
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Детали
  description TEXT,
  address TEXT,
  area TEXT, -- Negombo, Tangalle, Unawatuna, etc.
  phone TEXT,
  website TEXT,
  email TEXT,
  
  -- Время работы
  opening_hours TEXT,
  opening_hours_formatted JSONB,
  
  -- Рейтинги
  rating DECIMAL(2,1),
  rating_count INTEGER,
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  
  -- Удобства
  wifi BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  credit_cards BOOLEAN DEFAULT false,
  outdoor_seating BOOLEAN DEFAULT false,
  
  -- Изображения
  photos TEXT[],
  thumbnail_url TEXT,
  
  -- Метаданные парсинга
  source TEXT NOT NULL, -- 'osm', 'google', 'user', 'manual'
  parsing_pass INTEGER, -- 1 или 2
  quality_score DECIMAL(3,2), -- от 0.00 до 1.00
  last_verified_at TIMESTAMPTZ,
  
  -- Статус
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Социальные сети
  social_facebook TEXT,
  social_instagram TEXT,
  social_tripadvisor TEXT,
  
  -- Дополнительные данные
  tags TEXT[],
  amenities JSONB,
  raw_data JSONB, -- Полные данные от провайдера
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии для POI
COMMENT ON TABLE pois IS 'Points of Interest - спаршенные места (рестораны, пляжи, достопримечательности и т.д.)';
COMMENT ON COLUMN pois.layer IS 'Слой карты: food, beach, culture, medical, transport, shopping, entertainment';
COMMENT ON COLUMN pois.category IS 'Категория: restaurant, cafe, beach, temple, hospital, etc.';
COMMENT ON COLUMN pois.parsing_pass IS 'Проход парсинга: 1 (0-1km), 2 (1-3km+)';
COMMENT ON COLUMN pois.quality_score IS 'Оценка качества данных от 0.00 до 1.00';
COMMENT ON COLUMN pois.source IS 'Источник данных: osm (OpenStreetMap), google (Google Places), user (пользователь), manual';

-- Индексы для POI
CREATE INDEX IF NOT EXISTS idx_pois_location ON pois(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pois_category ON pois(category);
CREATE INDEX IF NOT EXISTS idx_pois_layer ON pois(layer);
CREATE INDEX IF NOT EXISTS idx_pois_area ON pois(area);
CREATE INDEX IF NOT EXISTS idx_pois_active ON pois(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pois_verified ON pois(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_pois_featured ON pois(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_pois_rating ON pois(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_source ON pois(source);
CREATE INDEX IF NOT EXISTS idx_pois_tags ON pois USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_pois_amenities ON pois USING GIN (amenities);

-- Триггер для обновления updated_at в POI
CREATE TRIGGER update_pois_updated_at
  BEFORE UPDATE ON pois
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE: Bucket для фотографий
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-photos',
  'tenant-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies для Storage
CREATE POLICY "Public read access for tenant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-photos');

CREATE POLICY "Allow anon and authenticated to upload tenant photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-photos'
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

CREATE POLICY "Service role can update tenant photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tenant-photos' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'tenant-photos' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete tenant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tenant-photos' AND auth.role() = 'service_role');

-- =====================================================
-- VIEWS: Полезные представления
-- =====================================================

-- View 1: Свойства с ценами в разных валютах
CREATE OR REPLACE VIEW properties_with_prices AS
SELECT 
  id, title,
  price as price_original,
  currency as currency_original,
  price_usd,
  price_period,
  CASE WHEN currency = 'LKR' THEN price ELSE price_usd * 322.58 END as price_lkr,
  CASE WHEN currency = 'EUR' THEN price ELSE price_usd * 0.92 END as price_eur,
  '$' || ROUND(price_usd)::text as price_usd_formatted,
  latitude, longitude, address, created_at
FROM saved_properties
WHERE price IS NOT NULL AND deleted_at IS NULL;

-- View 2: Статистика архива
CREATE OR REPLACE VIEW archive_statistics AS
SELECT 
  archive_reason,
  COUNT(*) as total_archived,
  AVG(days_active) as avg_days_active,
  COUNT(*) FILTER (WHERE restored_at IS NOT NULL) as restored_count,
  MIN(archived_at) as first_archived,
  MAX(archived_at) as last_archived
FROM archived_properties
GROUP BY archive_reason
ORDER BY total_archived DESC;

-- View 3: POI по слоям
CREATE OR REPLACE VIEW pois_by_layer AS
SELECT 
  layer,
  category,
  COUNT(*) as total_pois,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count,
  COUNT(*) FILTER (WHERE rating >= 4.0) as high_rated_count,
  AVG(rating) as avg_rating,
  MIN(created_at) as first_added,
  MAX(created_at) as last_added
FROM pois
WHERE is_active = true
GROUP BY layer, category
ORDER BY layer, total_pois DESC;

-- =====================================================
-- ФУНКЦИИ: Утилиты
-- =====================================================

-- Функция: Получить объекты по цене в USD
CREATE OR REPLACE FUNCTION get_properties_by_price_usd(
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 999999
)
RETURNS TABLE (
  id UUID, title TEXT, price NUMERIC, currency TEXT,
  price_usd NUMERIC, price_period TEXT,
  address TEXT, latitude NUMERIC, longitude NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT sp.id, sp.title, sp.price, sp.currency, sp.price_usd, sp.price_period,
         sp.address, sp.latitude, sp.longitude
  FROM saved_properties sp
  WHERE sp.price_usd >= min_price 
    AND sp.price_usd <= max_price
    AND sp.deleted_at IS NULL
  ORDER BY sp.price_usd ASC;
END;
$$ LANGUAGE plpgsql;

-- Функция: Поиск POI в радиусе
CREATE OR REPLACE FUNCTION find_pois_nearby(
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  radius_km DECIMAL DEFAULT 1.0,
  poi_layer TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID, title TEXT, category TEXT, layer TEXT,
  distance_km DECIMAL, rating DECIMAL,
  latitude DECIMAL, longitude DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.category, p.layer,
    -- Расчет расстояния (формула haversine упрощенная)
    ROUND(
      (6371 * acos(
        cos(radians(lat)) * cos(radians(p.latitude)) * 
        cos(radians(p.longitude) - radians(lon)) + 
        sin(radians(lat)) * sin(radians(p.latitude))
      ))::numeric, 2
    ) as distance_km,
    p.rating,
    p.latitude, p.longitude
  FROM pois p
  WHERE p.is_active = true
    AND (poi_layer IS NULL OR p.layer = poi_layer)
    AND (
      6371 * acos(
        cos(radians(lat)) * cos(radians(p.latitude)) * 
        cos(radians(p.longitude) - radians(lon)) + 
        sin(radians(lat)) * sin(radians(p.latitude))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ЗАВЕРШЕНИЕ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ База данных успешно создана!';
  RAISE NOTICE '📊 Таблицы: tenants, saved_properties, archived_properties, pois';
  RAISE NOTICE '🔧 Функции: archive_property, restore_property, get_properties_by_price_usd, find_pois_nearby';
  RAISE NOTICE '📈 Views: properties_with_prices, archive_statistics, pois_by_layer';
END $$;
