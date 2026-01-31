-- =====================================================
-- МИГРАЦИЯ: Добавление колонки price_usd
-- Дата: 2026-01-31
-- Цель: Унификация цен для фильтров и сортировки
-- =====================================================

-- 1. Добавляем колонку price_usd в saved_properties
ALTER TABLE saved_properties 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

-- 2. Добавляем комментарий к колонке
COMMENT ON COLUMN saved_properties.price_usd IS 'Цена в USD для унифицированного сравнения и фильтрации. Автоматически конвертируется из price + currency';

-- 3. Создаем индекс для быстрой фильтрации по цене
CREATE INDEX IF NOT EXISTS idx_saved_properties_price_usd 
ON saved_properties(price_usd) 
WHERE price_usd IS NOT NULL;

-- 4. Обновляем существующие записи (конвертируем price в USD)
-- Курсы на 31.01.2026:
UPDATE saved_properties 
SET price_usd = 
  CASE 
    WHEN currency = 'USD' OR currency IS NULL THEN price
    WHEN currency = 'LKR' THEN price * 0.0031  -- 1 LKR = $0.0031
    WHEN currency = 'EUR' THEN price * 1.09     -- 1 EUR = $1.09
    WHEN currency = 'GBP' THEN price * 1.27     -- 1 GBP = $1.27
    WHEN currency = 'INR' THEN price * 0.012    -- 1 INR = $0.012
    WHEN currency = 'RUB' THEN price * 0.011    -- 1 RUB = $0.011
    ELSE price -- Неизвестная валюта - считаем USD
  END
WHERE price IS NOT NULL AND price_usd IS NULL;

-- 5. Создаем функцию для автоматического расчета price_usd при вставке/обновлении
CREATE OR REPLACE FUNCTION calculate_price_usd()
RETURNS TRIGGER AS $$
BEGIN
  -- Если price изменился или currency изменился - пересчитываем price_usd
  IF (TG_OP = 'INSERT' OR NEW.price != OLD.price OR NEW.currency != OLD.currency) THEN
    NEW.price_usd := CASE 
      WHEN NEW.currency = 'USD' OR NEW.currency IS NULL THEN NEW.price
      WHEN NEW.currency = 'LKR' THEN NEW.price * 0.0031
      WHEN NEW.currency = 'EUR' THEN NEW.price * 1.09
      WHEN NEW.currency = 'GBP' THEN NEW.price * 1.27
      WHEN NEW.currency = 'INR' THEN NEW.price * 0.012
      WHEN NEW.currency = 'RUB' THEN NEW.price * 0.011
      ELSE NEW.price
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Создаем триггер для автоматического расчета
DROP TRIGGER IF EXISTS trigger_calculate_price_usd ON saved_properties;
CREATE TRIGGER trigger_calculate_price_usd
  BEFORE INSERT OR UPDATE OF price, currency ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_usd();

-- 7. Добавляем price_usd в archived_properties тоже
ALTER TABLE archived_properties 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

COMMENT ON COLUMN archived_properties.price_usd IS 'Цена в USD для унифицированного сравнения (архивные объекты)';

-- 8. Обновляем archived_properties
UPDATE archived_properties 
SET price_usd = 
  CASE 
    WHEN currency = 'USD' OR currency IS NULL THEN price
    WHEN currency = 'LKR' THEN price * 0.0031
    WHEN currency = 'EUR' THEN price * 1.09
    WHEN currency = 'GBP' THEN price * 1.27
    WHEN currency = 'INR' THEN price * 0.012
    WHEN currency = 'RUB' THEN price * 0.011
    ELSE price
  END
WHERE price IS NOT NULL AND price_usd IS NULL;

-- 9. Создаем view для удобного просмотра цен в разных валютах
CREATE OR REPLACE VIEW properties_with_prices AS
SELECT 
  id,
  title,
  price as price_original,
  currency as currency_original,
  price_usd,
  price_period,
  -- Расчет эквивалентов
  CASE WHEN currency = 'LKR' THEN price ELSE price_usd * 322.58 END as price_lkr,
  CASE WHEN currency = 'EUR' THEN price ELSE price_usd * 0.92 END as price_eur,
  -- Форматированные строки
  CASE currency
    WHEN 'USD' THEN '$' || ROUND(price)::text
    WHEN 'LKR' THEN 'Rs ' || ROUND(price)::text
    WHEN 'EUR' THEN '€' || ROUND(price)::text
    ELSE ROUND(price)::text || ' ' || currency
  END as price_formatted,
  '$' || ROUND(price_usd)::text as price_usd_formatted,
  latitude,
  longitude,
  address,
  created_at
FROM saved_properties
WHERE price IS NOT NULL;

-- 10. Создаем функцию для получения объектов с фильтром по цене (в USD)
CREATE OR REPLACE FUNCTION get_properties_by_price_usd(
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 999999
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price NUMERIC,
  currency TEXT,
  price_usd NUMERIC,
  price_period TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.title,
    sp.price,
    sp.currency,
    sp.price_usd,
    sp.price_period,
    sp.address,
    sp.latitude,
    sp.longitude
  FROM saved_properties sp
  WHERE sp.price_usd >= min_price 
    AND sp.price_usd <= max_price
  ORDER BY sp.price_usd ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ПРОВЕРКА МИГРАЦИИ
-- =====================================================

-- Проверяем что колонка создана
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_properties' 
  AND column_name = 'price_usd';

-- Проверяем что триггер создан
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_calculate_price_usd';

-- Проверяем конвертацию цен (примеры)
SELECT 
  title,
  price || ' ' || currency as original_price,
  '$' || ROUND(price_usd)::text as price_in_usd,
  CASE 
    WHEN currency = 'LKR' THEN 'Rs ' || ROUND(price_usd * 322.58)::text
    WHEN currency = 'EUR' THEN '€' || ROUND(price_usd * 0.92)::text
    ELSE '$' || ROUND(price_usd)::text
  END as converted_back
FROM saved_properties
WHERE price IS NOT NULL
LIMIT 10;

-- =====================================================
-- ОТКАТ МИГРАЦИИ (если нужно)
-- =====================================================

-- DROP TRIGGER IF EXISTS trigger_calculate_price_usd ON saved_properties;
-- DROP FUNCTION IF EXISTS calculate_price_usd();
-- DROP FUNCTION IF EXISTS get_properties_by_price_usd(NUMERIC, NUMERIC);
-- DROP VIEW IF EXISTS properties_with_prices;
-- ALTER TABLE saved_properties DROP COLUMN IF EXISTS price_usd;
-- ALTER TABLE archived_properties DROP COLUMN IF EXISTS price_usd;
