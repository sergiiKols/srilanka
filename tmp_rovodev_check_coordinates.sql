-- Проверка координат объектов
-- Ищем объекты с этими Google Maps ссылками

SELECT 
    id,
    title,
    latitude,
    longitude,
    google_maps_url,
    description,
    created_at
FROM saved_properties
WHERE google_maps_url LIKE '%KSZKYnL8PmKigKPe7%'
   OR google_maps_url LIKE '%3k4khwBzm2tPtZKN6%'
   OR description LIKE '%KSZKYnL8PmKigKPe7%'
   OR description LIKE '%3k4khwBzm2tPtZKN6%'
ORDER BY created_at DESC;

-- Также покажем все последние объекты для сравнения
SELECT 
    id,
    title,
    latitude,
    longitude,
    LEFT(google_maps_url, 50) as url_preview,
    created_at
FROM saved_properties
ORDER BY created_at DESC
LIMIT 5;
