-- ============================================
-- TENANT REQUESTS TABLE
-- Таблица для запросов арендаторов на поиск жилья
-- ============================================

-- Создание таблицы tenant_requests
CREATE TABLE IF NOT EXISTS tenant_requests (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Telegram user info
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  
  -- 📍 Локация
  location TEXT NOT NULL CHECK (location IN ('unawatuna', 'mirissa', 'hikkaduwa', 'tangalle', 'weligama', 'galle', 'ahangama')),
  
  -- 📅 Даты пребывания
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_count INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- 👥 Гости
  adults_count INT NOT NULL CHECK (adults_count >= 1 AND adults_count <= 30),
  children_count INT DEFAULT 0 CHECK (children_count >= 0 AND children_count <= 10),
  guest_type TEXT NOT NULL CHECK (guest_type IN ('family', 'friends', 'couple', 'solo')),
  
  -- 🎯 Цель поездки
  trip_purpose TEXT NOT NULL CHECK (trip_purpose IN ('vacation', 'work', 'event', 'other')),
  
  -- 🐾 Животные
  has_pets BOOLEAN NOT NULL DEFAULT false,
  
  -- ⏱️ Пролонгация
  extension_possible TEXT CHECK (extension_possible IN ('yes', 'no', 'dont_know')),
  
  -- 💬 Дополнительные пожелания
  additional_requirements TEXT,
  
  -- 🌍 Язык формы
  form_language TEXT DEFAULT 'ru' CHECK (form_language IN ('ru', 'en')),
  
  -- 📊 Статус запроса
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'matched', 'closed', 'cancelled')),
  
  -- ✅ Валидация
  validation_status TEXT DEFAULT 'valid' CHECK (validation_status IN ('valid', 'invalid', 'pending')),
  validation_errors JSONB,
  
  -- 📝 Мета-информация
  source TEXT DEFAULT 'telegram_web_app',
  user_agent TEXT,
  ip_address INET,
  
  -- ⏰ Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

-- Индекс по telegram_user_id для быстрого поиска заявок пользователя
CREATE INDEX IF NOT EXISTS idx_tenant_requests_user 
ON tenant_requests(telegram_user_id);

-- Индекс по датам для поиска активных заявок
CREATE INDEX IF NOT EXISTS idx_tenant_requests_dates 
ON tenant_requests(check_in_date, check_out_date);

-- Индекс по статусу для фильтрации
CREATE INDEX IF NOT EXISTS idx_tenant_requests_status 
ON tenant_requests(status);

-- Составной индекс для активных заявок пользователя
CREATE INDEX IF NOT EXISTS idx_tenant_requests_user_status 
ON tenant_requests(telegram_user_id, status);

-- Индекс по created_at для сортировки
CREATE INDEX IF NOT EXISTS idx_tenant_requests_created 
ON tenant_requests(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tenant_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_requests_updated_at
BEFORE UPDATE ON tenant_requests
FOR EACH ROW
EXECUTE FUNCTION update_tenant_requests_updated_at();

-- Триггер для установки published_at при изменении статуса на published
CREATE OR REPLACE FUNCTION set_tenant_request_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_request_published_at
BEFORE UPDATE ON tenant_requests
FOR EACH ROW
EXECUTE FUNCTION set_tenant_request_published_at();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Включаем RLS
ALTER TABLE tenant_requests ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои заявки
CREATE POLICY tenant_requests_select_own
ON tenant_requests
FOR SELECT
USING (
  telegram_user_id = current_setting('app.telegram_user_id', true)::BIGINT
);

-- Политика: пользователи могут создавать свои заявки
CREATE POLICY tenant_requests_insert_own
ON tenant_requests
FOR INSERT
WITH CHECK (
  telegram_user_id = current_setting('app.telegram_user_id', true)::BIGINT
);

-- Политика: пользователи могут обновлять свои заявки (только если не published)
CREATE POLICY tenant_requests_update_own
ON tenant_requests
FOR UPDATE
USING (
  telegram_user_id = current_setting('app.telegram_user_id', true)::BIGINT
  AND status NOT IN ('published', 'matched', 'closed')
);

-- Политика: админы могут видеть все
CREATE POLICY tenant_requests_admin_all
ON tenant_requests
FOR ALL
USING (
  current_setting('app.user_role', true) = 'admin'
);

-- ============================================
-- ФУНКЦИИ
-- ============================================

/**
 * Получить активные заявки пользователя
 */
CREATE OR REPLACE FUNCTION get_user_active_requests(user_id BIGINT)
RETURNS SETOF tenant_requests AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM tenant_requests
  WHERE telegram_user_id = user_id
    AND status IN ('pending', 'processing', 'published')
    AND check_in_date >= CURRENT_DATE
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

/**
 * Получить статистику заявок
 */
CREATE OR REPLACE FUNCTION get_tenant_requests_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'processing', COUNT(*) FILTER (WHERE status = 'processing'),
    'published', COUNT(*) FILTER (WHERE status = 'published'),
    'matched', COUNT(*) FILTER (WHERE status = 'matched'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'today', COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE),
    'this_week', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'this_month', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))
  )
  INTO result
  FROM tenant_requests;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

/**
 * Закрыть устаревшие заявки (check_in прошёл)
 */
CREATE OR REPLACE FUNCTION close_expired_requests()
RETURNS INT AS $$
DECLARE
  affected_rows INT;
BEGIN
  UPDATE tenant_requests
  SET 
    status = 'closed',
    closed_at = NOW(),
    updated_at = NOW()
  WHERE status IN ('pending', 'processing', 'published')
    AND check_in_date < CURRENT_DATE;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

/**
 * Проверить, есть ли у пользователя активные заявки
 */
CREATE OR REPLACE FUNCTION user_has_active_request(user_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM tenant_requests
    WHERE telegram_user_id = user_id
      AND status IN ('pending', 'processing', 'published')
      AND check_in_date >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE tenant_requests IS 'Запросы арендаторов на поиск жилья в Шри-Ланке';

COMMENT ON COLUMN tenant_requests.telegram_user_id IS 'ID пользователя в Telegram';
COMMENT ON COLUMN tenant_requests.check_in_date IS 'Дата заезда';
COMMENT ON COLUMN tenant_requests.check_out_date IS 'Дата выезда';
COMMENT ON COLUMN tenant_requests.nights_count IS 'Количество ночей (вычисляемое поле)';
COMMENT ON COLUMN tenant_requests.adults_count IS 'Количество взрослых (1-30)';
COMMENT ON COLUMN tenant_requests.children_count IS 'Количество детей (0-10)';
COMMENT ON COLUMN tenant_requests.guest_type IS 'Тип группы: family, friends, couple, solo';
COMMENT ON COLUMN tenant_requests.trip_purpose IS 'Цель поездки: vacation, work, event, other';
COMMENT ON COLUMN tenant_requests.has_pets IS 'Будут ли животные';
COMMENT ON COLUMN tenant_requests.extension_possible IS 'Возможна ли пролонгация: yes, no, dont_know';
COMMENT ON COLUMN tenant_requests.additional_requirements IS 'Дополнительные пожелания (текст)';
COMMENT ON COLUMN tenant_requests.status IS 'Статус: pending, processing, published, matched, closed, cancelled';
COMMENT ON COLUMN tenant_requests.validation_status IS 'Статус валидации: valid, invalid, pending';

-- ============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (для тестирования)
-- ============================================

-- Можно раскомментировать для тестов
/*
INSERT INTO tenant_requests (
  telegram_user_id,
  telegram_username,
  telegram_first_name,
  check_in_date,
  check_out_date,
  adults_count,
  children_count,
  guest_type,
  trip_purpose,
  has_pets,
  extension_possible,
  additional_requirements,
  form_language
) VALUES
(
  123456789,
  'testuser',
  'Test',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '14 days',
  2,
  1,
  'family',
  'vacation',
  false,
  'dont_know',
  'Нужна детская кроватка и тихое место',
  'ru'
);
*/

-- ============================================
-- GRANTS (Права доступа)
-- ============================================

-- Для authenticated пользователей (через Supabase Auth)
GRANT SELECT, INSERT, UPDATE ON tenant_requests TO authenticated;

-- Для anon пользователей (через service_role только)
GRANT SELECT ON tenant_requests TO anon;
