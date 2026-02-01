-- ============================================
-- ДОБАВЛЕНИЕ ПОДДЕРЖКИ ВИДЕО
-- Добавляем колонку для хранения видео URLs из TeraBox
-- ============================================

-- 1. Добавить колонку video_url в saved_properties
-- ============================================

ALTER TABLE saved_properties
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN saved_properties.video_url IS 'URL видео на TeraBox (если пользователь прикрепил видео к объекту)';

-- 2. Добавить колонку video_thumbnail_url для превью видео
-- ============================================

ALTER TABLE saved_properties
ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

COMMENT ON COLUMN saved_properties.video_thumbnail_url IS 'URL превью (thumbnail) видео';

-- 3. Добавить метаданные видео
-- ============================================

ALTER TABLE saved_properties
ADD COLUMN IF NOT EXISTS video_duration INTEGER;

ALTER TABLE saved_properties
ADD COLUMN IF NOT EXISTS video_size INTEGER;

COMMENT ON COLUMN saved_properties.video_duration IS 'Длительность видео в секундах';
COMMENT ON COLUMN saved_properties.video_size IS 'Размер видео в байтах';

-- 4. Проверка
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'saved_properties'
  AND column_name IN ('video_url', 'video_thumbnail_url', 'video_duration', 'video_size')
ORDER BY column_name;

-- 5. Тестовый запрос
-- ============================================

-- Проверить структуру таблицы
\d saved_properties

-- Пример обновления объекта с видео
/*
UPDATE saved_properties
SET 
  video_url = 'https://terabox.com/share/video123',
  video_thumbnail_url = 'https://your-storage.com/thumb.jpg',
  video_duration = 180,
  video_size = 50000000
WHERE id = 'your-property-id';
*/

-- ============================================
-- ПРИМЕЧАНИЯ
-- ============================================

/*
1. video_url - основной URL видео на TeraBox
2. video_thumbnail_url - опциональное превью для карты
3. video_duration - длительность в секундах (для отображения пользователю)
4. video_size - размер файла в байтах (для статистики)

ВАЖНО:
- TeraBox не имеет официального API для загрузки
- В прототипе используется Supabase Storage как плейсхолдер
- В production нужно использовать реальное API TeraBox или альтернативу

Альтернативы TeraBox:
- Supabase Storage (уже используется)
- AWS S3
- Google Cloud Storage
- Cloudflare R2
- Telegram File Storage (бесплатно до 2GB на файл)
*/
