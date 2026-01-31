-- =====================================================
-- Add property filters and amenities fields
-- Добавление полей для фильтров и удобств недвижимости
-- =====================================================

-- Фильтры для поиска
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS pool BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS parking BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS breakfast BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS air_conditioning BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS kitchen BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS beachfront BOOLEAN DEFAULT false;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS garden BOOLEAN DEFAULT false;

-- Уровень безопасности
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS security TEXT DEFAULT 'none'
  CHECK (security IN ('none', 'standard', 'high', 'gated'));

-- Метрики
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS wifi_speed INTEGER;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS beach_distance INTEGER;
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS area_name TEXT;

-- Метаданные AI
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS confidence TEXT DEFAULT 'medium'
  CHECK (confidence IN ('low', 'medium', 'high'));
ALTER TABLE saved_properties ADD COLUMN IF NOT EXISTS ai_provider TEXT;

-- Исправить price_period - убрать хардкод
ALTER TABLE saved_properties ALTER COLUMN price_period DROP DEFAULT;
ALTER TABLE saved_properties ALTER COLUMN price_period TYPE TEXT;

-- Комментарии
COMMENT ON COLUMN saved_properties.pool IS 'Наличие бассейна';
COMMENT ON COLUMN saved_properties.parking IS 'Наличие парковки';
COMMENT ON COLUMN saved_properties.breakfast IS 'Включен завтрак';
COMMENT ON COLUMN saved_properties.air_conditioning IS 'Наличие кондиционера';
COMMENT ON COLUMN saved_properties.kitchen IS 'Наличие кухни';
COMMENT ON COLUMN saved_properties.pet_friendly IS 'Разрешены домашние животные';
COMMENT ON COLUMN saved_properties.beachfront IS 'Объект на берегу (в пределах 50м от пляжа)';
COMMENT ON COLUMN saved_properties.garden IS 'Наличие сада';
COMMENT ON COLUMN saved_properties.security IS 'Уровень безопасности: none, standard, high, gated';
COMMENT ON COLUMN saved_properties.wifi_speed IS 'Скорость WiFi в Mbps';
COMMENT ON COLUMN saved_properties.beach_distance IS 'Расстояние до пляжа в метрах';
COMMENT ON COLUMN saved_properties.area_name IS 'Район: Unawatuna, Hikkaduwa, Mirissa, Weligama';
COMMENT ON COLUMN saved_properties.confidence IS 'Уровень уверенности AI: low, medium, high';
COMMENT ON COLUMN saved_properties.ai_provider IS 'Провайдер AI: groq, manual, perplexity';

-- Создать индексы для фильтров
CREATE INDEX IF NOT EXISTS idx_saved_properties_pool ON saved_properties(pool) WHERE pool = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_parking ON saved_properties(parking) WHERE parking = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_beachfront ON saved_properties(beachfront) WHERE beachfront = true;
CREATE INDEX IF NOT EXISTS idx_saved_properties_area_name ON saved_properties(area_name);
CREATE INDEX IF NOT EXISTS idx_saved_properties_wifi_speed ON saved_properties(wifi_speed) WHERE wifi_speed IS NOT NULL;

-- Логирование
DO $$
BEGIN
  RAISE NOTICE '✅ Property filters and amenities fields added successfully';
END $$;
