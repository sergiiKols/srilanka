-- ============================================
-- ТАБЛИЦА: saved_properties (сохранённые объекты)
-- ИСПРАВЛЕННАЯ ВЕРСИЯ
-- ============================================

CREATE TABLE IF NOT EXISTS saved_properties (
  -- Идентификаторы
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT NOT NULL,
  
  -- Основная информация
  title TEXT,
  description TEXT,
  notes TEXT,
  
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
  
  -- Медиа
  photos TEXT[],
  
  -- Удобства
  amenities JSONB,
  
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
  
  -- Временные метки
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Комментарии
COMMENT ON TABLE saved_properties IS 'Объекты недвижимости сохранённые арендаторами в личную коллекцию (записная книжка)';
COMMENT ON COLUMN saved_properties.telegram_user_id IS 'Telegram ID владельца объекта';
COMMENT ON COLUMN saved_properties.photos IS 'Массив URL фотографий объекта';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_saved_props_telegram_id ON saved_properties(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_props_location ON saved_properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_saved_props_created ON saved_properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_props_favorite ON saved_properties(is_favorite) WHERE is_favorite = true;

-- Триггер для updated_at
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

-- Триггер для счётчика в tenants
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
