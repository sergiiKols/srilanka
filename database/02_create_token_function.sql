-- ============================================
-- ФУНКЦИЯ: generate_token_6chars()
-- Описание: Генерирует случайный токен из 6 символов (a-z, A-Z, 0-9)
-- Используется: При создании нового арендатора для безопасного доступа к карте
-- ============================================

CREATE OR REPLACE FUNCTION generate_token_6chars()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  -- Генерируем 6 случайных символов
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Комментарий для документации
COMMENT ON FUNCTION generate_token_6chars() IS 'Генерирует случайный 6-символьный токен для доступа к карте (a-z, A-Z, 0-9). 62^6 = 56 миллиардов комбинаций.';

-- ============================================
-- ТЕСТЫ
-- ============================================

-- Тест 1: Генерация одного токена
SELECT generate_token_6chars() AS test_token_1;

-- Тест 2: Генерация 5 токенов (все должны быть разные)
SELECT generate_token_6chars() AS token
FROM generate_series(1, 5);

-- Тест 3: Проверка длины (должна быть 6)
SELECT 
  generate_token_6chars() AS token,
  length(generate_token_6chars()) AS token_length;
