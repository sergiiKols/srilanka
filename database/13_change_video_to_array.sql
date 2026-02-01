-- ============================================
-- ИЗМЕНЕНИЕ: video_url → videos[] (массив)
-- Поддержка множественных видео (до 20 шт)
-- ============================================

-- 1. Удалить старые колонки (если они пустые)
-- Если у вас уже есть данные - нужно сначала их скопировать!

-- Проверяем есть ли данные
SELECT COUNT(*) as videos_count 
FROM saved_properties 
WHERE video_url IS NOT NULL;

-- Если videos_count = 0, можно безопасно удалить колонки
-- Если > 0, сначала выполните миграцию данных!

-- 2. Удаляем старые single-video колонки
ALTER TABLE saved_properties
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS video_thumbnail_url,
DROP COLUMN IF EXISTS video_duration,
DROP COLUMN IF EXISTS video_size;

-- 3. Добавляем новую колонку videos (массив)
ALTER TABLE saved_properties
ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN saved_properties.videos IS 'Массив видео объектов [{file_id, thumbnail_id, duration, size}]';

-- 4. Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_saved_properties_videos 
ON saved_properties USING GIN (videos);

-- 5. Проверка
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'saved_properties'
  AND column_name = 'videos';

-- 6. Тест: добавить видео в массив
/*
UPDATE saved_properties
SET videos = jsonb_set(
  COALESCE(videos, '[]'::jsonb),
  '{0}',
  '{"file_id": "BAACAgUAAxkBAAIC...", "thumbnail_id": "AAMCBQADGQEAAgQ5aX...", "duration": 180, "size": 5000000}'::jsonb,
  true
)
WHERE id = 'your-property-id';

-- Добавить второе видео
UPDATE saved_properties
SET videos = videos || '[{"file_id": "BAACAgUAAxkBAAID...", "duration": 120, "size": 3000000}]'::jsonb
WHERE id = 'your-property-id';
*/

-- 7. Пример выборки
/*
SELECT 
  id,
  title,
  jsonb_array_length(videos) as video_count,
  videos
FROM saved_properties
WHERE jsonb_array_length(videos) > 0;
*/

-- ============================================
-- СТРУКТУРА videos массива:
-- ============================================
/*
[
  {
    "file_id": "BAACAgUAAxkBAAIC...",
    "thumbnail_id": "AAMCBQADGQEAAgQ5aX...",
    "duration": 180,
    "size": 5000000
  },
  {
    "file_id": "BAACAgVAAxkBAAID...",
    "thumbnail_id": "AAMCBQADGQEAAgQ6aY...",
    "duration": 120,
    "size": 3000000
  }
]
*/
