-- ============================================
-- АРХИВНАЯ ТАБЛИЦА для удалённых объектов
-- Вместо soft delete - переносим в архив
-- ============================================

-- 1. Создаём таблицу архива
CREATE TABLE IF NOT EXISTS archived_properties (
  -- === Основные поля (копия из saved_properties) ===
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
  
  -- Фотографии
  photos TEXT[] DEFAULT '{}',
  
  -- Цена
  price INTEGER,
  currency TEXT DEFAULT 'USD',
  
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
  
  -- === Поля архивации ===
  archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_by BIGINT, -- user_id или admin_id кто удалил
  archive_reason TEXT DEFAULT 'user_deleted', -- причина
  
  -- === Аналитика ===
  days_active INTEGER, -- сколько дней был активен
  views_count INTEGER DEFAULT 0, -- сколько раз смотрели на карте
  clicks_count INTEGER DEFAULT 0, -- сколько раз кликали
  last_viewed_at TIMESTAMPTZ, -- когда последний раз смотрели
  
  -- === Возможность восстановления ===
  can_restore BOOLEAN DEFAULT TRUE,
  restored_at TIMESTAMPTZ, -- если был восстановлен
  restored_by BIGINT,
  
  -- === Метаданные ===
  notes TEXT, -- заметки админа
  tags TEXT[] -- теги для поиска
);

-- 2. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_archived_user 
  ON archived_properties(telegram_user_id);

CREATE INDEX IF NOT EXISTS idx_archived_date 
  ON archived_properties(archived_at DESC);

CREATE INDEX IF NOT EXISTS idx_archived_reason 
  ON archived_properties(archive_reason);

CREATE INDEX IF NOT EXISTS idx_archived_original_date 
  ON archived_properties(original_created_at DESC);

CREATE INDEX IF NOT EXISTS idx_archived_location 
  ON archived_properties(latitude, longitude);

-- 3. RLS (Row Level Security) - только админы видят архив
ALTER TABLE archived_properties ENABLE ROW LEVEL SECURITY;

-- Админы видят всё
CREATE POLICY "Admins can view all archived properties"
  ON archived_properties FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Пользователи видят только свои архивные объекты
CREATE POLICY "Users can view their archived properties"
  ON archived_properties FOR SELECT
  TO authenticated
  USING (
    telegram_user_id = (auth.jwt() ->> 'user_id')::BIGINT
  );

-- 4. Функция автоматического архивирования
CREATE OR REPLACE FUNCTION archive_property(property_id UUID, reason TEXT DEFAULT 'user_deleted', archived_by_user BIGINT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  property_record RECORD;
  days_diff INTEGER;
BEGIN
  -- Получаем объект из основной таблицы
  SELECT * INTO property_record
  FROM saved_properties
  WHERE id = property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found: %', property_id;
  END IF;
  
  -- Вычисляем сколько дней был активен
  days_diff := EXTRACT(DAY FROM (NOW() - property_record.created_at));
  
  -- Вставляем в архив
  INSERT INTO archived_properties (
    id, telegram_user_id,
    latitude, longitude,
    title, description, raw_text, property_type,
    photos,
    price, currency,
    bedrooms, bathrooms, amenities,
    contact_phone, contact_name,
    source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_from_date,
    google_maps_url,
    original_created_at, original_updated_at,
    archived_at, archived_by, archive_reason,
    days_active,
    views_count, clicks_count
  ) VALUES (
    property_record.id, property_record.telegram_user_id,
    property_record.latitude, property_record.longitude,
    property_record.title, property_record.description, property_record.raw_text, property_record.property_type,
    property_record.photos,
    property_record.price, property_record.currency,
    property_record.bedrooms, property_record.bathrooms, property_record.amenities,
    property_record.contact_phone, property_record.contact_name,
    property_record.source_type,
    property_record.forward_from_chat_id, property_record.forward_from_chat_title,
    property_record.forward_from_username, property_record.forward_from_message_id, property_record.forward_date,
    property_record.google_maps_url,
    property_record.created_at, property_record.updated_at,
    NOW(), archived_by_user, reason,
    days_diff,
    0, 0 -- TODO: добавить счётчики просмотров если будут
  );
  
  -- Удаляем из основной таблицы
  DELETE FROM saved_properties WHERE id = property_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Функция восстановления из архива
CREATE OR REPLACE FUNCTION restore_property(property_id UUID, restored_by_user BIGINT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  archived_record RECORD;
BEGIN
  -- Получаем объект из архива
  SELECT * INTO archived_record
  FROM archived_properties
  WHERE id = property_id AND can_restore = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Archived property not found or cannot be restored: %', property_id;
  END IF;
  
  -- Восстанавливаем в основную таблицу
  INSERT INTO saved_properties (
    id, telegram_user_id,
    latitude, longitude,
    title, description, raw_text, property_type,
    photos,
    price, currency,
    bedrooms, bathrooms, amenities,
    contact_phone, contact_name,
    source_type,
    forward_from_chat_id, forward_from_chat_title,
    forward_from_username, forward_from_message_id, forward_from_date,
    google_maps_url,
    created_at, updated_at
  ) VALUES (
    archived_record.id, archived_record.telegram_user_id,
    archived_record.latitude, archived_record.longitude,
    archived_record.title, archived_record.description, archived_record.raw_text, archived_record.property_type,
    archived_record.photos,
    archived_record.price, archived_record.currency,
    archived_record.bedrooms, archived_record.bathrooms, archived_record.amenities,
    archived_record.contact_phone, archived_record.contact_name,
    archived_record.source_type,
    archived_record.forward_from_chat_id, archived_record.forward_from_chat_title,
    archived_record.forward_from_username, archived_record.forward_from_message_id, archived_record.forward_date,
    archived_record.google_maps_url,
    archived_record.original_created_at, NOW()
  );
  
  -- Помечаем в архиве как восстановленный
  UPDATE archived_properties
  SET restored_at = NOW(),
      restored_by = restored_by_user,
      can_restore = FALSE
  WHERE id = property_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. View для статистики удалений
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

-- 7. Удаляем колонку deleted_at из saved_properties (ОПЦИОНАЛЬНО!)
-- ALTER TABLE saved_properties DROP COLUMN IF EXISTS deleted_at;

-- ============================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- ============================================

-- Архивировать объект:
-- SELECT archive_property('uuid-here', 'user_deleted', 8311531873);

-- Восстановить объект:
-- SELECT restore_property('uuid-here', 8311531873);

-- Посмотреть статистику:
-- SELECT * FROM archive_statistics;

-- Посмотреть архив пользователя:
-- SELECT * FROM archived_properties WHERE telegram_user_id = 8311531873 ORDER BY archived_at DESC;

-- Посмотреть что удалялось за последний месяц:
-- SELECT * FROM archived_properties WHERE archived_at > NOW() - INTERVAL '30 days' ORDER BY archived_at DESC;
