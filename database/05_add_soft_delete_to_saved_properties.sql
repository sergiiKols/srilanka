-- ============================================
-- МИГРАЦИЯ: Soft Delete для saved_properties
-- Описание: Объекты не удаляются физически, а помечаются как deleted
-- ============================================

-- Добавляем поле deleted_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'saved_properties' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE saved_properties 
    ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    
    COMMENT ON COLUMN saved_properties.deleted_at IS 'Метка времени удаления (NULL = активный объект, NOT NULL = удалён)';
  END IF;
END $$;

-- Создаём индекс для быстрой фильтрации
CREATE INDEX IF NOT EXISTS idx_saved_properties_deleted_at 
ON saved_properties(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Создаём индекс для активных объектов
CREATE INDEX IF NOT EXISTS idx_saved_properties_active 
ON saved_properties(telegram_user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Проверка
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'saved_properties' 
  AND column_name IN ('deleted_at', 'created_at')
ORDER BY column_name;

-- Статистика
SELECT 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_properties,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_properties,
  COUNT(*) as total_properties
FROM saved_properties;
