-- Проверка RLS политик для exchange_rates_log

-- 1. Включен ли RLS на таблице
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'exchange_rates_log';

-- 2. Какие политики существуют
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'exchange_rates_log';

-- 3. Попробуем прочитать из таблицы
SELECT COUNT(*) as total_records
FROM exchange_rates_log;

-- 4. Попробуем вставить тестовую запись
INSERT INTO exchange_rates_log (rates, success, message)
VALUES (
  '{"USD": 1, "LKR": 0.0031}'::jsonb,
  true,
  'Test record'
)
RETURNING id, created_at;
