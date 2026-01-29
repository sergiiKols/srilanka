-- ============================================
-- ПРОВЕРКА СОСТОЯНИЯ БАЗЫ ДАННЫХ
-- Дата: 2026-01-29
-- ============================================

-- 1. ПРОВЕРКА ТАБЛИЦ
-- ============================================

SELECT 'ПРОВЕРКА ТАБЛИЦ' AS check_type;

-- Проверяем существование таблиц
SELECT 
  tablename AS table_name,
  schemaname AS schema_name
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tenants', 'saved_properties', 'access_attempts')
ORDER BY tablename;

-- 2. ПРОВЕРКА ФУНКЦИЙ
-- ============================================

SELECT 'ПРОВЕРКА ФУНКЦИЙ' AS check_type;

-- Проверяем существование функций
SELECT 
  routine_name AS function_name,
  routine_type AS type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generate_token_6chars',
    'update_updated_at_column',
    'update_tenants_properties_count'
  )
ORDER BY routine_name;

-- 3. ПРОВЕРКА ТРИГГЕРОВ
-- ============================================

SELECT 'ПРОВЕРКА ТРИГГЕРОВ' AS check_type;

-- Проверяем существование триггеров
SELECT 
  trigger_name,
  event_object_table AS table_name,
  action_timing AS timing,
  event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. ПРОВЕРКА ИНДЕКСОВ
-- ============================================

SELECT 'ПРОВЕРКА ИНДЕКСОВ' AS check_type;

-- Проверяем индексы на таблице tenants
SELECT 
  indexname AS index_name,
  tablename AS table_name
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tenants', 'saved_properties', 'access_attempts')
ORDER BY tablename, indexname;

-- 5. ПРОВЕРКА STORAGE BUCKETS
-- ============================================

SELECT 'ПРОВЕРКА STORAGE' AS check_type;

-- Проверяем существование bucket для фото
SELECT 
  id AS bucket_id,
  name AS bucket_name,
  public,
  created_at
FROM storage.buckets
WHERE name = 'tenant-photos';

-- 6. ПРОВЕРКА ДАННЫХ
-- ============================================

SELECT 'ПРОВЕРКА ДАННЫХ' AS check_type;

-- Количество записей в таблицах
SELECT 
  'tenants' AS table_name,
  COUNT(*) AS record_count
FROM tenants
UNION ALL
SELECT 
  'saved_properties' AS table_name,
  COUNT(*) AS record_count
FROM saved_properties
UNION ALL
SELECT 
  'access_attempts' AS table_name,
  COUNT(*) AS record_count
FROM access_attempts;

-- 7. ТЕСТИРОВАНИЕ ФУНКЦИИ generate_token_6chars()
-- ============================================

SELECT 'ТЕСТ ГЕНЕРАЦИИ ТОКЕНА' AS check_type;

-- Генерируем тестовый токен
SELECT 
  generate_token_6chars() AS generated_token,
  length(generate_token_6chars()) AS token_length;

-- 8. ПРОВЕРКА СТРУКТУРЫ saved_properties
-- ============================================

SELECT 'СТРУКТУРА saved_properties' AS check_type;

-- Все колонки таблицы saved_properties
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'saved_properties'
ORDER BY ordinal_position;

-- 9. ПРОВЕРКА FORWARD МЕТАДАННЫХ
-- ============================================

SELECT 'FORWARD МЕТАДАННЫЕ В saved_properties' AS check_type;

-- Проверяем что есть поля для forward метаданных
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'saved_properties'
  AND column_name LIKE 'forward_%'
ORDER BY column_name;

-- 10. ИТОГОВЫЙ СТАТУС
-- ============================================

SELECT 'ИТОГОВЫЙ СТАТУС' AS check_type;

SELECT 
  '✅ Таблица tenants' AS status,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'tenants') AS exists
UNION ALL
SELECT 
  '✅ Таблица saved_properties' AS status,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'saved_properties') AS exists
UNION ALL
SELECT 
  '✅ Функция generate_token_6chars' AS status,
  EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_token_6chars') AS exists
UNION ALL
SELECT 
  '✅ Функция update_tenants_properties_count' AS status,
  EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_tenants_properties_count') AS exists
UNION ALL
SELECT 
  '✅ Storage bucket tenant-photos' AS status,
  EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'tenant-photos') AS exists;

-- ============================================
-- РЕКОМЕНДАЦИИ
-- ============================================

/*
ЕСЛИ ЧТО-ТО НЕ СОЗДАНО, ВЫПОЛНИТЕ В ПОРЯДКЕ:

1. database/01_create_tenants_table.sql
2. database/02_create_token_function.sql  
3. database/03_create_saved_properties_table_FIXED.sql
4. Создать Storage bucket (см. ниже)

СОЗДАНИЕ STORAGE BUCKET:
*/

-- Раскомментируйте и выполните если bucket не создан:
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-photos',
  'tenant-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- RLS policy для публичного доступа на чтение
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-photos');

-- RLS policy для загрузки (все авторизованные пользователи)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tenant-photos' AND auth.role() = 'authenticated');
*/
