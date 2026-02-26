-- =====================================================
-- СКРИПТ ДЛЯ ИМПОРТА POI В БАЗУ ДАННЫХ
-- =====================================================

-- Шаг 1: Создаём временную таблицу для импорта JSON
CREATE TEMP TABLE temp_pois_import (data JSONB);

-- Шаг 2: Загружаем JSON данные (это нужно выполнить отдельно)
-- COPY temp_pois_import FROM 'path/to/POI_6176_Southwest_Coast.json';

-- Шаг 3: Парсим и вставляем данные в основную таблицу
INSERT INTO pois (
  name, 
  description, 
  category, 
  layer,
  latitude, 
  longitude, 
  address,
  phone,
  website,
  opening_hours,
  rating,
  reviews_count,
  price_level,
  photo_url,
  google_place_id,
  types,
  region,
  location,
  parsing_pass,
  source,
  is_active,
  created_at
)
SELECT DISTINCT ON (data->>'placeId')
  data->>'name' as name,
  data->>'description' as description,
  data->>'category' as category,
  CASE data->>'category'
    WHEN 'food' THEN 'food'
    WHEN 'restaurant' THEN 'food'
    WHEN 'cafe' THEN 'food'
    WHEN 'bar' THEN 'food'
    WHEN 'nightlife' THEN 'entertainment'
    WHEN 'attraction' THEN 'culture'
    WHEN 'culture' THEN 'culture'
    WHEN 'hospital' THEN 'medical'
    WHEN 'pharmacy' THEN 'medical'
    WHEN 'spa' THEN 'entertainment'
    WHEN 'beach' THEN 'beach'
    WHEN 'atm' THEN 'shopping'
    WHEN 'supermarket' THEN 'shopping'
    WHEN 'liquor' THEN 'shopping'
    WHEN 'bus' THEN 'transport'
    WHEN 'tuktuk' THEN 'transport'
    ELSE 'other'
  END as layer,
  (data->'coordinates'->>'lat')::DECIMAL(10,8) as latitude,
  (data->'coordinates'->>'lng')::DECIMAL(11,8) as longitude,
  data->>'address' as address,
  data->>'phone' as phone,
  data->>'website' as website,
  data->>'hours' as opening_hours,
  COALESCE((data->>'rating')::DECIMAL(2,1), 0) as rating,
  COALESCE((data->>'totalReviews')::INTEGER, 0) as reviews_count,
  COALESCE((data->>'priceLevel')::INTEGER, 0) as price_level,
  data->>'mainPhoto' as photo_url,
  data->>'placeId' as google_place_id,
  data->>'types' as types,
  data->>'region' as region,
  data->>'location' as location,
  COALESCE((data->>'parsingPass')::INTEGER, 2) as parsing_pass,
  data->>'source' as source,
  true as is_active,
  COALESCE((data->>'createdAt')::TIMESTAMPTZ, NOW()) as created_at
FROM temp_pois_import
WHERE data->>'placeId' IS NOT NULL
ON CONFLICT (google_place_id) DO UPDATE SET
  name = EXCLUDED.name,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  updated_at = NOW();

-- Шаг 4: Проверка
SELECT COUNT(*) as total_pois FROM pois;
SELECT category, COUNT(*) as count FROM pois GROUP BY category ORDER BY count DESC;

-- Шаг 5: Очистка
DROP TABLE temp_pois_import;
