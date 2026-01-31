-- =====================================================
-- ДОБАВЛЕНИЕ КОЛОНКИ price_usd
-- Выполните этот SQL в Supabase SQL Editor
-- =====================================================

-- 1. Добавляем колонку price_usd в saved_properties
ALTER TABLE saved_properties 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

-- 2. Добавляем комментарий
COMMENT ON COLUMN saved_properties.price_usd IS 'Цена в USD для унифицированного сравнения';

-- 3. Создаем индекс для быстрой фильтрации
CREATE INDEX IF NOT EXISTS idx_saved_properties_price_usd 
ON saved_properties(price_usd) 
WHERE price_usd IS NOT NULL;

-- 4. Обновляем существующие записи
UPDATE saved_properties 
SET price_usd = 
  CASE 
    WHEN currency = 'USD' OR currency IS NULL THEN price
    WHEN currency = 'LKR' THEN price * 0.0031  -- 1 LKR = $0.0031
    WHEN currency = 'EUR' THEN price * 1.09     -- 1 EUR = $1.09
    WHEN currency = 'GBP' THEN price * 1.27     -- 1 GBP = $1.27
    WHEN currency = 'INR' THEN price * 0.012    -- 1 INR = $0.012
    WHEN currency = 'RUB' THEN price * 0.011    -- 1 RUB = $0.011
    ELSE price
  END
WHERE price IS NOT NULL AND price_usd IS NULL;

-- 5. Создаем функцию для автоматического расчета
CREATE OR REPLACE FUNCTION calculate_price_usd()
RETURNS TRIGGER AS $$
BEGIN
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

-- 6. Создаем триггер
DROP TRIGGER IF EXISTS trigger_calculate_price_usd ON saved_properties;
CREATE TRIGGER trigger_calculate_price_usd
  BEFORE INSERT OR UPDATE OF price, currency ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_usd();

-- 7. Добавляем в archived_properties тоже
ALTER TABLE archived_properties 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

COMMENT ON COLUMN archived_properties.price_usd IS 'Цена в USD (архивные объекты)';

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

-- =====================================================
-- ПРОВЕРКА
-- =====================================================

-- Проверяем что колонка создана
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_properties' 
  AND column_name = 'price_usd';

-- Проверяем триггер
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_calculate_price_usd';

-- Проверяем данные
SELECT 
  title,
  price || ' ' || currency as original_price,
  '$' || ROUND(price_usd)::text as price_in_usd
FROM saved_properties
WHERE price IS NOT NULL
LIMIT 5;
