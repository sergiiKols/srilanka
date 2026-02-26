-- ============================================
-- БЫСТРАЯ ИНИЦИАЛИЗАЦИЯ БД - КОПИРОВАТЬ В ТЕРМИНАЛ
-- ============================================
-- После подключения к БД выполните этот код полностью

-- 1. Включить UUID расширение
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Функция генерации токенов
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

-- 3. Таблица tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  map_secret_token VARCHAR(6) UNIQUE NOT NULL,
  personal_map_url TEXT UNIQUE,
  saved_properties_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_telegram_id ON tenants(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_token ON tenants(map_secret_token);

-- 4. Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Таблица saved_properties
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  title TEXT,
  description TEXT,
  raw_text TEXT,
  notes TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_maps_url TEXT,
  address TEXT,
  property_type TEXT,
  bedrooms INT,
  bathrooms INT,
  area_sqm INT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  price_period TEXT,
  price_usd DECIMAL(10, 2),
  photos TEXT[],
  videos TEXT[],
  amenities JSONB,
  contact_info TEXT,
  contact_phone TEXT,
  contact_name TEXT,
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
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_saved_props_tenant ON saved_properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_saved_props_telegram_id ON saved_properties(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_props_location ON saved_properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saved_props_created ON saved_properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_props_favorite ON saved_properties(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_saved_props_not_deleted ON saved_properties(deleted_at) WHERE deleted_at IS NULL;

-- Триггеры
CREATE TRIGGER update_saved_properties_updated_at
  BEFORE UPDATE ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Функция обновления счетчика
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

-- 7. Проверка результата
SELECT 'Database initialized successfully!' AS status;
\dt
