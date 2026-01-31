-- Проверка что price_usd работает

-- 1. Проверяем что колонка создана
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'saved_properties' 
  AND column_name = 'price_usd';

-- 2. Проверяем несколько записей с конвертацией
SELECT 
  title,
  price,
  currency,
  price_usd,
  CASE 
    WHEN currency = 'USD' THEN 'OK'
    WHEN currency = 'LKR' AND price_usd = ROUND(price * 0.0031, 2) THEN 'OK'
    ELSE 'CHECK'
  END as conversion_status
FROM saved_properties
WHERE price IS NOT NULL
LIMIT 10;

-- 3. Проверяем статистику по валютам
SELECT 
  currency,
  COUNT(*) as count,
  AVG(price) as avg_price_original,
  AVG(price_usd) as avg_price_usd
FROM saved_properties
WHERE price IS NOT NULL
GROUP BY currency;
