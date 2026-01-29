-- ============================================
-- ТЕСТОВАЯ ЗАПИСЬ в таблицу tenants
-- ============================================

-- Вставляем тестового арендатора
INSERT INTO tenants (
  telegram_user_id,
  map_secret_token,
  personal_map_url,
  saved_properties_count
) VALUES (
  999999999,                    -- Тестовый Telegram ID
  'aB7cDx',                     -- Тестовый токен (6 символов)
  '/map/999999999/aB7cDx',      -- URL карты
  0                             -- Пока 0 объектов
);

-- Проверяем что запись создалась
SELECT * FROM tenants WHERE telegram_user_id = 999999999;
