-- =====================================================
-- СИСТЕМА УПРАВЛЕНИЯ CRON ЗАДАЧАМИ
-- Дата: 2026-01-31
-- Цель: Централизованное управление периодическими задачами
-- =====================================================

-- 1. Создаем таблицу для настроек cron задач
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  function_name TEXT NOT NULL, -- Имя Edge Function или SQL функции
  schedule TEXT NOT NULL, -- Cron выражение (например "0 3 * * *")
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT, -- 'success' или 'error'
  last_run_message TEXT,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_schedule CHECK (schedule ~ '^[0-9*,/-]+ [0-9*,/-]+ [0-9*,/-]+ [0-9*,/-]+ [0-9*,/-]+$')
);

-- 2. Создаем таблицу для логов выполнения
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES cron_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL, -- 'running', 'success', 'error'
  message TEXT,
  error TEXT,
  duration_ms INTEGER,
  
  -- Детали выполнения
  details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Создаем таблицу для логов обновления курсов валют
CREATE TABLE IF NOT EXISTS exchange_rates_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rates JSONB NOT NULL, -- {"LKR": 0.0031, "EUR": 1.09, ...}
  api_timestamp TIMESTAMPTZ, -- Время обновления от API
  success BOOLEAN DEFAULT true,
  message TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Индексы для быстрого доступа
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON cron_jobs(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run_at) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_id ON cron_job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_created_at ON cron_job_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_log_created_at ON exchange_rates_log(created_at DESC);

-- 5. RLS политики
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates_log ENABLE ROW LEVEL SECURITY;

-- Админы могут все
CREATE POLICY "Allow admin full access to cron_jobs" ON cron_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to cron_job_logs" ON cron_job_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to exchange_rates_log" ON exchange_rates_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Анонимные пользователи могут читать (для отображения в админке)
CREATE POLICY "Allow anon read cron_jobs" ON cron_jobs
  FOR SELECT USING (true);

CREATE POLICY "Allow anon read cron_job_logs" ON cron_job_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow anon read exchange_rates_log" ON exchange_rates_log
  FOR SELECT USING (true);

-- 6. Функция для расчета следующего запуска (упрощенная)
CREATE OR REPLACE FUNCTION calculate_next_run(schedule TEXT)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  parts TEXT[];
  minute TEXT;
  hour TEXT;
  next_run TIMESTAMPTZ;
BEGIN
  -- Парсим cron выражение "minute hour day month weekday"
  parts := string_to_array(schedule, ' ');
  minute := parts[1];
  hour := parts[2];
  
  -- Упрощенная логика: берем текущую дату + парсим время
  IF minute = '*' AND hour = '*' THEN
    -- Каждую минуту
    next_run := now() + interval '1 minute';
  ELSIF minute != '*' AND hour != '*' THEN
    -- Конкретное время сегодня или завтра
    next_run := date_trunc('day', now()) + 
                make_interval(hours => hour::int, mins => minute::int);
    IF next_run <= now() THEN
      next_run := next_run + interval '1 day';
    END IF;
  ELSE
    -- Каждый час в конкретную минуту
    next_run := date_trunc('hour', now()) + make_interval(mins => minute::int);
    IF next_run <= now() THEN
      next_run := next_run + interval '1 hour';
    END IF;
  END IF;
  
  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- 7. Функция для обновления статуса задачи
CREATE OR REPLACE FUNCTION update_cron_job_status(
  job_id UUID,
  status TEXT,
  message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE cron_jobs
  SET 
    last_run_at = now(),
    last_run_status = status,
    last_run_message = message,
    next_run_at = calculate_next_run(schedule),
    run_count = run_count + 1,
    error_count = CASE WHEN status = 'error' THEN error_count + 1 ELSE error_count END,
    updated_at = now()
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Триггер для автоматического обновления next_run_at
CREATE OR REPLACE FUNCTION trigger_update_next_run()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.schedule != OLD.schedule OR NEW.enabled != OLD.enabled) THEN
    IF NEW.enabled THEN
      NEW.next_run_at := calculate_next_run(NEW.schedule);
    ELSE
      NEW.next_run_at := NULL;
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cron_jobs_update_next_run ON cron_jobs;
CREATE TRIGGER trigger_cron_jobs_update_next_run
  BEFORE INSERT OR UPDATE ON cron_jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_next_run();

-- 9. Добавляем задачу обновления курсов валют
INSERT INTO cron_jobs (name, description, function_name, schedule, enabled, metadata)
VALUES (
  'update_exchange_rates',
  'Автоматическое обновление курсов валют через API',
  'update-exchange-rates',
  '0 3 * * *', -- Каждый день в 3:00 утра
  true,
  '{
    "api": "https://open.er-api.com/v6/latest/USD",
    "currencies": ["LKR", "EUR", "GBP", "INR", "RUB", "AUD", "CAD"],
    "auto_recalculate": true
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  schedule = EXCLUDED.schedule,
  metadata = EXCLUDED.metadata;

-- 10. View для удобного просмотра статуса задач
CREATE OR REPLACE VIEW cron_jobs_status AS
SELECT 
  cj.id,
  cj.name,
  cj.description,
  cj.schedule,
  cj.enabled,
  cj.last_run_at,
  cj.last_run_status,
  cj.last_run_message,
  cj.next_run_at,
  cj.run_count,
  cj.error_count,
  CASE 
    WHEN cj.error_count > 0 THEN ROUND((cj.run_count - cj.error_count)::numeric / cj.run_count * 100, 2)
    ELSE 100.0
  END as success_rate,
  cj.created_at,
  cj.updated_at,
  -- Последние 5 запусков
  (
    SELECT json_agg(log_data ORDER BY started_at DESC)
    FROM (
      SELECT 
        started_at,
        status,
        message,
        duration_ms
      FROM cron_job_logs
      WHERE job_id = cj.id
      ORDER BY started_at DESC
      LIMIT 5
    ) log_data
  ) as recent_runs
FROM cron_jobs cj;

-- =====================================================
-- ПРОВЕРКА МИГРАЦИИ
-- =====================================================

-- Проверяем что таблицы созданы
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('cron_jobs', 'cron_job_logs', 'exchange_rates_log');

-- Проверяем задачу обновления курсов
SELECT 
  name,
  schedule,
  enabled,
  next_run_at,
  EXTRACT(EPOCH FROM (next_run_at - now())) / 3600 as hours_until_next_run
FROM cron_jobs
WHERE name = 'update_exchange_rates';

-- Проверяем view
SELECT * FROM cron_jobs_status;

-- =====================================================
-- ОТКАТ МИГРАЦИИ (если нужно)
-- =====================================================

-- DROP VIEW IF EXISTS cron_jobs_status;
-- DROP TRIGGER IF EXISTS trigger_cron_jobs_update_next_run ON cron_jobs;
-- DROP FUNCTION IF EXISTS trigger_update_next_run();
-- DROP FUNCTION IF EXISTS update_cron_job_status(UUID, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS calculate_next_run(TEXT);
-- DROP TABLE IF EXISTS exchange_rates_log CASCADE;
-- DROP TABLE IF EXISTS cron_job_logs CASCADE;
-- DROP TABLE IF EXISTS cron_jobs CASCADE;
