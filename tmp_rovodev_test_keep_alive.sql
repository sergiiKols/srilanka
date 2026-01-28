-- Тестовый скрипт для проверки исправленных конфигураций keep-alive
-- Проверяет каждую таблицу отдельно для диагностики ошибок

-- 1. Проверка таблицы USERS
DO $$
DECLARE
  v_test_data JSONB;
  v_result TEXT;
BEGIN
  v_test_data := '{
    "first_name": "KeepAlive",
    "last_name": "Test User",
    "user_type": "tourist",
    "role": "client"
  }'::jsonb;
  
  BEGIN
    -- Пытаемся вставить тестовые данные
    INSERT INTO users (first_name, last_name, user_type, role)
    SELECT 
      v_test_data->>'first_name',
      v_test_data->>'last_name',
      v_test_data->>'user_type',
      v_test_data->>'role';
    
    v_result := '✅ USERS: OK';
    RAISE NOTICE '%', v_result;
    
  EXCEPTION WHEN OTHERS THEN
    v_result := '❌ USERS ERROR: ' || SQLERRM;
    RAISE NOTICE '%', v_result;
  END;
END $$;

-- 2. Проверка таблицы LANDLORDS
DO $$
DECLARE
  v_test_data JSONB;
  v_result TEXT;
BEGIN
  v_test_data := '{
    "business_name": "KeepAlive Test Ltd",
    "primary_email": "landlord_keepalive_test@test.com",
    "verified": false,
    "subscription_tier": "free"
  }'::jsonb;
  
  BEGIN
    INSERT INTO landlords (business_name, primary_email, verified, subscription_tier)
    SELECT 
      v_test_data->>'business_name',
      v_test_data->>'primary_email',
      (v_test_data->>'verified')::boolean,
      v_test_data->>'subscription_tier';
    
    v_result := '✅ LANDLORDS: OK';
    RAISE NOTICE '%', v_result;
    
  EXCEPTION WHEN OTHERS THEN
    v_result := '❌ LANDLORDS ERROR: ' || SQLERRM;
    RAISE NOTICE '%', v_result;
  END;
END $$;

-- 3. Проверка таблицы PROPERTIES
DO $$
DECLARE
  v_test_data JSONB;
  v_result TEXT;
  v_landlord_id UUID;
BEGIN
  -- Получаем первого landlord для теста
  SELECT id INTO v_landlord_id FROM landlords LIMIT 1;
  
  IF v_landlord_id IS NULL THEN
    RAISE NOTICE '⚠️ PROPERTIES: Skipped (no landlord available)';
    RETURN;
  END IF;
  
  v_test_data := '{
    "property_type": "villa",
    "title": "KeepAlive Test Property",
    "description": "AUTO-GENERATED: Keep-alive test record. Safe to delete.",
    "price_per_month": 100,
    "city": "Test City",
    "country": "Test Country",
    "bedrooms": 1,
    "bathrooms": 1,
    "status": "inactive"
  }'::jsonb;
  
  BEGIN
    INSERT INTO properties (
      landlord_id, property_type, title, description, 
      price_per_month, city, country, bedrooms, bathrooms, status
    )
    SELECT 
      v_landlord_id,
      v_test_data->>'property_type',
      v_test_data->>'title',
      v_test_data->>'description',
      (v_test_data->>'price_per_month')::numeric,
      v_test_data->>'city',
      v_test_data->>'country',
      (v_test_data->>'bedrooms')::integer,
      (v_test_data->>'bathrooms')::integer,
      v_test_data->>'status';
    
    v_result := '✅ PROPERTIES: OK';
    RAISE NOTICE '%', v_result;
    
  EXCEPTION WHEN OTHERS THEN
    v_result := '❌ PROPERTIES ERROR: ' || SQLERRM;
    RAISE NOTICE '%', v_result;
  END;
END $$;

-- 4. Проверка таблицы RENTAL_REQUESTS
DO $$
DECLARE
  v_test_data JSONB;
  v_result TEXT;
  v_user_id UUID;
BEGIN
  -- Получаем первого user для теста
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '⚠️ RENTAL_REQUESTS: Skipped (no user available)';
    RETURN;
  END IF;
  
  v_test_data := '{
    "title": "KeepAlive Test Request",
    "check_in": "2026-02-01",
    "check_out": "2026-02-15",
    "budget_per_night_min": 100,
    "budget_per_night_max": 200,
    "city": "Test City",
    "country": "Test Country",
    "status": "expired"
  }'::jsonb;
  
  BEGIN
    INSERT INTO rental_requests (
      user_id, title, check_in, check_out,
      budget_per_night_min, budget_per_night_max,
      city, country, status
    )
    SELECT 
      v_user_id,
      v_test_data->>'title',
      (v_test_data->>'check_in')::date,
      (v_test_data->>'check_out')::date,
      (v_test_data->>'budget_per_night_min')::numeric,
      (v_test_data->>'budget_per_night_max')::numeric,
      v_test_data->>'city',
      v_test_data->>'country',
      v_test_data->>'status';
    
    v_result := '✅ RENTAL_REQUESTS: OK';
    RAISE NOTICE '%', v_result;
    
  EXCEPTION WHEN OTHERS THEN
    v_result := '❌ RENTAL_REQUESTS ERROR: ' || SQLERRM;
    RAISE NOTICE '%', v_result;
  END;
END $$;

-- Очистка тестовых данных
DO $$
BEGIN
  DELETE FROM rental_requests WHERE title = 'KeepAlive Test Request';
  DELETE FROM properties WHERE title = 'KeepAlive Test Property';
  DELETE FROM landlords WHERE business_name = 'KeepAlive Test Ltd';
  DELETE FROM users WHERE first_name = 'KeepAlive' AND last_name LIKE 'Test%';
  
  RAISE NOTICE '🧹 Test data cleaned up';
END $$;
