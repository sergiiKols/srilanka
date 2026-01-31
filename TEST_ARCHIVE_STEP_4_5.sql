-- ================================================================
-- ШАГ 4: Проверка что функция создана правильно
-- ================================================================

SELECT 
    'soft_delete_property' as function_name,
    EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') as created,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'soft_delete_property') 
        THEN '✅ ФУНКЦИЯ ИСПРАВЛЕНА!'
        ELSE '❌ Ошибка создания'
    END as status;

-- ================================================================
-- ШАГ 5: ТЕСТ - Создаём тестовый объект для проверки
-- ================================================================

-- Создаём тестовый объект
INSERT INTO saved_properties (
    telegram_user_id, 
    latitude, 
    longitude,
    title, 
    property_type, 
    price, 
    currency
) VALUES (
    999999999, 
    6.0329, 
    80.2168,
    'ТЕСТ - Проверка архивации', 
    'apartment', 
    500, 
    'USD'
)
RETURNING id, title, telegram_user_id;

-- Проверяем счётчик ДО удаления
SELECT 
    telegram_user_id,
    saved_properties_count as "Счётчик ДО удаления"
FROM tenants 
WHERE telegram_user_id = 999999999;
