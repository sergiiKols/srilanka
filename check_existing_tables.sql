-- Проверка существующих таблиц

-- 1. Все таблицы в базе
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Проверка конкретных таблиц для системы курсов
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cron_jobs') 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT EXISTS' 
  END as cron_jobs_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cron_job_logs') 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT EXISTS' 
  END as cron_job_logs_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_rates_log') 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT EXISTS' 
  END as exchange_rates_log_status;

-- 3. Если таблицы существуют, проверяем их структуру
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('cron_jobs', 'cron_job_logs', 'exchange_rates_log')
ORDER BY table_name, ordinal_position;

-- 4. Проверяем есть ли задача update_exchange_rates
SELECT 
  name,
  description,
  schedule,
  enabled,
  last_run_at,
  next_run_at
FROM cron_jobs
WHERE name = 'update_exchange_rates';
