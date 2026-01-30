-- Проверка и создание Storage bucket для фото

-- 1. Проверяем существующие buckets
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY created_at DESC;

-- 2. Создаём bucket если не существует (выполните вручную в Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'tenant-photos',
--   'tenant-photos',
--   true,  -- публичный доступ
--   5242880,  -- 5MB лимит
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 3. Настройка RLS policies для bucket
-- Разрешаем всем читать (публичный доступ)
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'tenant-photos');

-- Разрешаем загрузку только аутентифицированным (или всем через anon key)
-- CREATE POLICY "Allow Upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'tenant-photos');

-- Разрешаем удаление владельцу
-- CREATE POLICY "Allow Delete Own"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'tenant-photos');
