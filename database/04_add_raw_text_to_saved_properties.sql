-- ============================================
-- МИГРАЦИЯ: Добавление поля raw_text в saved_properties
-- Описание: Для сохранения полного исходного текста из Telegram
-- ============================================

-- Добавляем поле raw_text если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'saved_properties' 
    AND column_name = 'raw_text'
  ) THEN
    ALTER TABLE saved_properties 
    ADD COLUMN raw_text TEXT;
    
    COMMENT ON COLUMN saved_properties.raw_text IS 'Полный исходный текст из Telegram (backup для AI обработки)';
  END IF;
END $$;

-- Проверка
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'saved_properties' 
  AND column_name IN ('description', 'raw_text')
ORDER BY column_name;
