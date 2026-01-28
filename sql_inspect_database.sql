-- ================================================
-- 🔍 SQL КОМАНДЫ ДЛЯ АНАЛИЗА СТРУКТУРЫ БАЗЫ ДАННЫХ
-- ================================================
-- Скопируйте эти команды в Supabase SQL Editor
-- Каждую команду можно запускать отдельно
-- ================================================

-- ================================================
-- 1. СПИСОК ВСЕХ ТАБЛИЦ
-- ================================================
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ================================================
-- 2. ПОЛНАЯ СТРУКТУРА ВСЕХ ТАБЛИЦ (колонки + типы)
-- ================================================
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ================================================
-- 3. ДЕТАЛЬНАЯ СТРУКТУРА КАЖДОЙ ТАБЛИЦЫ (КРАСИВО)
-- ================================================
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  CASE 
    WHEN c.character_maximum_length IS NOT NULL 
    THEN c.data_type || '(' || c.character_maximum_length || ')'
    WHEN c.numeric_precision IS NOT NULL 
    THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
    ELSE c.data_type
  END as full_type,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY → ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
    ELSE ''
  END as key_type
FROM information_schema.columns c
LEFT JOIN (
  SELECT 
    ku.table_name,
    ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku
    ON tc.constraint_name = ku.constraint_name
    AND tc.table_schema = ku.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
  SELECT 
    ku.table_name,
    ku.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS ku
    ON tc.constraint_name = ku.constraint_name
    AND tc.table_schema = ku.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- ================================================
-- 4. PRIMARY KEYS (первичные ключи)
-- ================================================
SELECT 
  tc.table_name,
  ku.column_name,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage ku
  ON tc.constraint_name = ku.constraint_name
  AND tc.table_schema = ku.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ================================================
-- 5. FOREIGN KEYS (внешние ключи и связи)
-- ================================================
SELECT 
  tc.table_name AS from_table,
  ku.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  tc.constraint_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS ku
  ON tc.constraint_name = ku.constraint_name
  AND tc.table_schema = ku.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, ku.column_name;

-- ================================================
-- 6. ИНДЕКСЫ
-- ================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ================================================
-- 7. CONSTRAINTS (ограничения: CHECK, UNIQUE и т.д.)
-- ================================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type IN ('CHECK', 'UNIQUE')
ORDER BY tc.table_name, tc.constraint_type;

-- ================================================
-- 8. ФУНКЦИИ (пользовательские функции)
-- ================================================
SELECT 
  routine_schema,
  routine_name,
  routine_type,
  data_type AS return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ================================================
-- 9. ТРИГГЕРЫ
-- ================================================
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ================================================
-- 10. RLS ПОЛИТИКИ (Row Level Security)
-- ================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================
-- 11. РАЗМЕР ТАБЛИЦ
-- ================================================
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ================================================
-- 12. КОЛИЧЕСТВО ЗАПИСЕЙ В КАЖДОЙ ТАБЛИЦЕ
-- ================================================
-- ВНИМАНИЕ: Эта команда может быть медленной на больших базах
SELECT 
  schemaname,
  relname AS tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ================================================
-- 13. ПРОВЕРКА СУЩЕСТВОВАНИЯ КЛЮЧЕВЫХ ТАБЛИЦ
-- ================================================
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '✅ users EXISTS'
    ELSE '❌ users NOT FOUND'
  END as users_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'client_rental_requests') 
    THEN '✅ client_rental_requests EXISTS'
    ELSE '❌ client_rental_requests NOT FOUND'
  END as client_requests_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pois') 
    THEN '✅ pois EXISTS'
    ELSE '❌ pois NOT FOUND'
  END as pois_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_accounts') 
    THEN '✅ telegram_accounts EXISTS'
    ELSE '❌ telegram_accounts NOT FOUND'
  END as telegram_accounts_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_listings') 
    THEN '✅ property_listings EXISTS'
    ELSE '❌ property_listings NOT FOUND'
  END as property_listings_table;

-- ================================================
-- 14. ПОЛНАЯ СХЕМА ОДНОЙ ТАБЛИЦЫ (замените TABLE_NAME)
-- ================================================
-- Пример: SELECT * FROM generate_table_info('users');

CREATE OR REPLACE FUNCTION generate_table_info(table_name_param TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT,
  constraint_info TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT,
    COALESCE(
      CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FK → ' || fk.foreign_table_name || '.' || fk.foreign_column_name
        ELSE ''
      END,
      ''
    )::TEXT as constraint_info
  FROM information_schema.columns c
  LEFT JOIN (
    SELECT ku.table_name, ku.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku
      ON tc.constraint_name = ku.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
  ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
  LEFT JOIN (
    SELECT 
      ku.table_name,
      ku.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage ku
      ON tc.constraint_name = ku.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  ) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
  WHERE c.table_schema = 'public' 
    AND c.table_name = table_name_param
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Пример использования:
-- SELECT * FROM generate_table_info('users');
-- SELECT * FROM generate_table_info('pois');

-- ================================================
-- 15. ЭКСПОРТ СТРУКТУРЫ В JSON (для анализа)
-- ================================================
SELECT json_agg(
  json_build_object(
    'table', t.table_name,
    'columns', (
      SELECT json_agg(
        json_build_object(
          'name', c.column_name,
          'type', c.data_type,
          'nullable', c.is_nullable,
          'default', c.column_default
        )
      )
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' 
        AND c.table_name = t.table_name
    )
  )
) as database_structure
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE';

-- ================================================
-- 🎯 БЫСТРАЯ ПРОВЕРКА: Что применено?
-- ================================================
SELECT 
  'Tables' as object_type,
  COUNT(*)::TEXT as count
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Columns',
  COUNT(*)::TEXT
FROM information_schema.columns
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Functions',
  COUNT(*)::TEXT
FROM information_schema.routines
WHERE routine_schema = 'public'
UNION ALL
SELECT 
  'Indexes',
  COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'RLS Policies',
  COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Triggers',
  COUNT(*)::TEXT
FROM information_schema.triggers
WHERE trigger_schema = 'public';
