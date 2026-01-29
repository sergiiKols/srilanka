-- ============================================
-- ТАБЛИЦА: tenants (арендаторы)
-- Описание: Пользователи бота, которые сохраняют объекты недвижимости
-- ============================================

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

-- Комментарии для документации
COMMENT ON TABLE tenants IS 'Арендаторы - пользователи которые ищут жильё и сохраняют объекты в личную коллекцию';
COMMENT ON COLUMN tenants.telegram_user_id IS 'Уникальный ID пользователя из Telegram';
COMMENT ON COLUMN tenants.map_secret_token IS 'Секретный токен для доступа к карте (6 символов)';
COMMENT ON COLUMN tenants.personal_map_url IS 'Полный URL личной карты пользователя';
COMMENT ON COLUMN tenants.saved_properties_count IS 'Количество сохранённых объектов';

-- Индекс для быстрого поиска по Telegram ID
CREATE INDEX IF NOT EXISTS idx_tenants_telegram_id ON tenants(telegram_user_id);

-- Индекс для поиска по токену
CREATE INDEX IF NOT EXISTS idx_tenants_token ON tenants(map_secret_token);
