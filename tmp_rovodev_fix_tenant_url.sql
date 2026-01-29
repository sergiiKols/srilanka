-- Fix tenant URLs from localhost to production
UPDATE tenants 
SET personal_map_url = REPLACE(personal_map_url, 'http://localhost:4321', 'https://srilanka-37u2.vercel.app')
WHERE personal_map_url LIKE 'http://localhost:4321%';

-- Verify the update
SELECT id, telegram_user_id, personal_map_url 
FROM tenants 
WHERE telegram_user_id = 8311531873;
