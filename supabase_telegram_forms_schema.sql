-- ================================================
-- TELEGRAM WEB APP FORMS SCHEMA
-- ================================================
-- Схема для управления Telegram формами, заявками и логами
-- Создано: 2026-01-25

-- ================================================
-- 1. ТАБЛИЦА КОНФИГУРАЦИЙ ФОРМ
-- ================================================
CREATE TABLE IF NOT EXISTS form_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  submit_text TEXT DEFAULT 'Отправить',
  
  -- Поля формы (массив объектов FormField)
  -- [{id, type, label, placeholder, required, options}]
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Telegram Bot настройки
  bot_token_encrypted TEXT, -- зашифрованный токен бота
  chat_id TEXT, -- куда отправлять уведомления
  
  -- Шаблон сообщения для Telegram
  -- Поддерживает плейсхолдеры: {firstName}, {userId}, {field_id}
  message_template TEXT DEFAULT 'Новая заявка от {firstName} (ID: {userId})',
  
  -- Статус и метаданные
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Статистика
  total_submissions INTEGER DEFAULT 0,
  last_submission_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_form_configs_active ON form_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_form_configs_created_by ON form_configs(created_by);

-- ================================================
-- 2. ТАБЛИЦА ЗАЯВОК (SUBMISSIONS)
-- ================================================
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES form_configs(id) ON DELETE CASCADE,
  
  -- Данные пользователя Telegram
  user_id TEXT NOT NULL, -- Telegram user_id
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  
  -- Данные формы (field_id: value)
  data JSONB NOT NULL,
  
  -- Информация о отправке в Telegram
  telegram_message_id BIGINT, -- ID отправленного сообщения
  telegram_chat_id TEXT, -- куда было отправлено
  
  -- Статус обработки
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'sent', 'error')),
  error_message TEXT,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- IP и user agent (опционально)
  ip_address INET,
  user_agent TEXT
);

-- Индексы для быстрого поиска и статистики
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_created ON form_submissions(form_id, created_at DESC);

-- ================================================
-- 3. ТАБЛИЦА ЛОГОВ
-- ================================================
CREATE TABLE IF NOT EXISTS form_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES form_configs(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  
  -- Тип события
  event_type TEXT NOT NULL CHECK (event_type IN (
    'form_created',
    'form_updated',
    'form_deleted',
    'submit_start',
    'submit_success',
    'validation_error',
    'telegram_send_error',
    'telegram_send_success',
    'rate_limit_exceeded'
  )),
  
  -- Детали события
  error_message TEXT,
  error_code TEXT,
  metadata JSONB, -- дополнительные данные
  
  -- Временная метка
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для анализа логов
CREATE INDEX IF NOT EXISTS idx_form_logs_form_id ON form_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_form_logs_event_type ON form_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_form_logs_created_at ON form_logs(created_at DESC);

-- ================================================
-- 4. ТАБЛИЦА RATE LIMITING
-- ================================================
CREATE TABLE IF NOT EXISTS form_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES form_configs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Telegram user_id
  
  -- Счетчик попыток
  attempts INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Блокировка
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(form_id, user_id)
);

-- Индекс для проверки rate limit
CREATE INDEX IF NOT EXISTS idx_form_rate_limits_check ON form_rate_limits(form_id, user_id, blocked_until);

-- ================================================
-- 5. ТРИГГЕРЫ
-- ================================================

-- Триггер для обновления updated_at в form_configs
CREATE OR REPLACE FUNCTION update_form_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_form_configs_updated_at
  BEFORE UPDATE ON form_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_form_configs_updated_at();

-- Триггер для обновления статистики при новой заявке
CREATE OR REPLACE FUNCTION update_form_submission_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE form_configs
  SET 
    total_submissions = total_submissions + 1,
    last_submission_at = NOW()
  WHERE id = NEW.form_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_submission_stats
  AFTER INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_form_submission_stats();

-- ================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Включаем RLS для всех таблиц
ALTER TABLE form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_rate_limits ENABLE ROW LEVEL SECURITY;

-- Политики для form_configs
-- Админы могут всё
CREATE POLICY "Admins can do everything with forms"
  ON form_configs
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Все могут читать активные формы (для отображения)
CREATE POLICY "Anyone can view active forms"
  ON form_configs
  FOR SELECT
  USING (is_active = true);

-- Политики для form_submissions
-- Админы могут видеть все заявки
CREATE POLICY "Admins can view all submissions"
  ON form_submissions
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Сервисная роль может создавать заявки (API endpoint)
CREATE POLICY "Service role can insert submissions"
  ON form_submissions
  FOR INSERT
  WITH CHECK (true);

-- Политики для form_logs
-- Админы могут видеть логи
CREATE POLICY "Admins can view logs"
  ON form_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Сервисная роль может создавать логи
CREATE POLICY "Service role can insert logs"
  ON form_logs
  FOR INSERT
  WITH CHECK (true);

-- Политики для form_rate_limits
-- Сервисная роль может управлять rate limits
CREATE POLICY "Service role can manage rate limits"
  ON form_rate_limits
  FOR ALL
  WITH CHECK (true);

-- ================================================
-- 7. ФУНКЦИИ ДЛЯ РАБОТЫ С ФОРМАМИ
-- ================================================

-- Функция для проверки rate limit
CREATE OR REPLACE FUNCTION check_form_rate_limit(
  p_form_id UUID,
  p_user_id TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Проверяем существующую запись
  SELECT * INTO v_record
  FROM form_rate_limits
  WHERE form_id = p_form_id AND user_id = p_user_id;
  
  -- Если пользователь заблокирован
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Если записи нет или окно истекло, сбрасываем
  IF v_record IS NULL OR v_record.last_attempt_at < v_window_start THEN
    INSERT INTO form_rate_limits (form_id, user_id, attempts, last_attempt_at)
    VALUES (p_form_id, p_user_id, 1, NOW())
    ON CONFLICT (form_id, user_id) 
    DO UPDATE SET attempts = 1, last_attempt_at = NOW(), blocked_until = NULL;
    RETURN TRUE;
  END IF;
  
  -- Если превышен лимит
  IF v_record.attempts >= p_max_attempts THEN
    UPDATE form_rate_limits
    SET blocked_until = NOW() + '1 hour'::INTERVAL
    WHERE form_id = p_form_id AND user_id = p_user_id;
    RETURN FALSE;
  END IF;
  
  -- Увеличиваем счетчик
  UPDATE form_rate_limits
  SET attempts = attempts + 1, last_attempt_at = NOW()
  WHERE form_id = p_form_id AND user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. НАЧАЛЬНЫЕ ДАННЫЕ (ОПЦИОНАЛЬНО)
-- ================================================

-- Создаем тестовую форму (закомментировано, раскомментируйте при необходимости)
/*
INSERT INTO form_configs (title, description, fields, message_template, is_active)
VALUES (
  'Тестовая форма',
  'Пример формы для тестирования Telegram Web App',
  '[
    {"id": "name", "type": "text", "label": "Ваше имя", "placeholder": "Введите имя", "required": true},
    {"id": "email", "type": "email", "label": "Email", "placeholder": "your@email.com", "required": true},
    {"id": "message", "type": "textarea", "label": "Сообщение", "placeholder": "Ваше сообщение", "required": false}
  ]'::jsonb,
  '🆕 Новая заявка от {firstName}

Имя: {name}
Email: {email}
Сообщение: {message}

ID пользователя: {userId}',
  true
);
*/

-- ================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ================================================

COMMENT ON TABLE form_configs IS 'Конфигурации Telegram форм';
COMMENT ON TABLE form_submissions IS 'Заявки, отправленные через Telegram формы';
COMMENT ON TABLE form_logs IS 'Логи событий для отладки и мониторинга';
COMMENT ON TABLE form_rate_limits IS 'Rate limiting для защиты от спама';

COMMENT ON COLUMN form_configs.fields IS 'JSONB массив полей формы: [{id, type, label, placeholder, required, options}]';
COMMENT ON COLUMN form_configs.bot_token_encrypted IS 'Зашифрованный Telegram Bot Token (или NULL если используется общий из .env)';
COMMENT ON COLUMN form_submissions.data IS 'JSONB объект с данными формы: {field_id: value}';
