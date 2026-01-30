-- ============================================
-- FIX STORAGE POLICIES FOR PHOTO UPLOAD
-- Проблема: anon role не может загружать фото
-- Решение: Разрешить anon загрузку в bucket tenant-photos
-- ============================================

-- 1. Удаляем старую политику INSERT
DROP POLICY IF EXISTS "Service role can upload tenant photos" ON storage.objects;

-- 2. Создаём новую политику - разрешаем anon и authenticated
CREATE POLICY "Allow anon and authenticated to upload tenant photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-photos'
  AND (
    auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- 3. Проверяем что политика создана
SELECT 
  policyname,
  cmd AS command,
  roles,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%tenant%'
ORDER BY policyname;

-- ============================================
-- ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
-- ============================================
/*
policyname                                    | command | roles  | using_clause | with_check
----------------------------------------------+---------+--------+--------------+------------
Allow anon and authenticated to upload...    | INSERT  | public | NULL         | (bucket_id = 'tenant-photos'::text) AND ...
Public read access for tenant photos         | SELECT  | public | (bucket_id = 'tenant-photos'::text) | NULL
Service role can delete tenant photos        | DELETE  | public | ... | NULL
Service role can update tenant photos        | UPDATE  | public | ... | ...
*/
