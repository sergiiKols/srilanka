-- ============================================
-- ПРОВЕРКА STORAGE BUCKET: tenant-photos
-- ============================================

-- 1. Проверить настройки bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
WHERE id = 'tenant-photos';

-- 2. Проверить существующие RLS policies для storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%tenant%' 
    OR qual LIKE '%tenant-photos%'
    OR with_check LIKE '%tenant-photos%'
  )
ORDER BY policyname;

-- 3. Проверить все policies для storage.objects (если пусто выше)
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual LIKE '%tenant-photos%' THEN '✅ tenant-photos'
    ELSE '❌ other bucket'
  END AS applies_to
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- 4. Посмотреть примеры загруженных файлов (если есть)
SELECT 
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'tenant-photos'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- ЕСЛИ НУЖНО СОЗДАТЬ POLICIES
-- ============================================

-- Раскомментируйте и выполните ТОЛЬКО если policies не существуют:

/*
-- Policy 1: Публичное чтение
CREATE POLICY "Public read access for tenant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-photos');

-- Policy 2: Загрузка (INSERT)
CREATE POLICY "Allow upload for tenant photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tenant-photos');

-- Policy 3: Обновление (UPDATE)
CREATE POLICY "Allow update for tenant photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tenant-photos')
WITH CHECK (bucket_id = 'tenant-photos');

-- Policy 4: Удаление (DELETE)
CREATE POLICY "Allow delete for tenant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tenant-photos');
*/

-- ============================================
-- ПРОВЕРКА ПОСЛЕ СОЗДАНИЯ POLICIES
-- ============================================

/*
-- Должно вернуть 4 policy:
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (qual LIKE '%tenant-photos%' OR with_check LIKE '%tenant-photos%');
*/
