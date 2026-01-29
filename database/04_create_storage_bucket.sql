-- ============================================
-- СОЗДАНИЕ STORAGE BUCKET ДЛЯ ФОТОГРАФИЙ
-- Bucket: tenant-photos
-- Описание: Хранилище фотографий объектов недвижимости от арендаторов
-- ============================================

-- 1. Создать bucket
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-photos',                    -- ID bucket
  'tenant-photos',                    -- Имя bucket
  true,                               -- Публичный доступ на чтение
  5242880,                            -- Лимит 5MB на файл
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']  -- Только изображения
)
ON CONFLICT (id) DO NOTHING;  -- Не падать если уже создан

-- Комментарий
COMMENT ON TABLE storage.buckets IS 'Bucket для хранения фотографий объектов от арендаторов. Структура: {user_id}/{property_id}/{filename}';

-- 2. RLS Policies
-- ============================================

-- Policy 1: Публичный доступ на чтение (для отображения на картах)
CREATE POLICY "Public read access for tenant photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-photos');

-- Policy 2: Сервис может загружать файлы (через service_role key)
CREATE POLICY "Service role can upload tenant photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-photos' 
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- Policy 3: Сервис может обновлять файлы
CREATE POLICY "Service role can update tenant photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tenant-photos' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'tenant-photos' AND auth.role() = 'service_role');

-- Policy 4: Сервис может удалять файлы
CREATE POLICY "Service role can delete tenant photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tenant-photos' AND auth.role() = 'service_role');

-- 3. Проверка
-- ============================================

-- Проверить что bucket создан
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'tenant-photos';

-- Проверить policies
SELECT 
  policyname,
  cmd AS command,
  qual AS using_clause
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%tenant%';

-- ============================================
-- СТРУКТУРА ФАЙЛОВ В BUCKET
-- ============================================

/*
tenant-photos/
  ├── {telegram_user_id}/           (например: 1000089271/)
  │   ├── {property_uuid}/          (например: 550e8400-e29b-41d4-a716-446655440000/)
  │   │   ├── photo_1.jpg           (первая фотография)
  │   │   ├── photo_2.jpg           (вторая фотография)
  │   │   └── photo_3.jpg           (третья фотография)
  │   └── {another_property_uuid}/
  │       └── photo_1.jpg
  └── {another_user_id}/
      └── {property_uuid}/
          └── photo_1.jpg

Пример полного пути:
tenant-photos/1000089271/550e8400-e29b-41d4-a716-446655440000/photo_1.jpg

Публичный URL будет:
https://{project_id}.supabase.co/storage/v1/object/public/tenant-photos/1000089271/550e8400-e29b-41d4-a716-446655440000/photo_1.jpg
*/

-- ============================================
-- ПРИМЕР ИСПОЛЬЗОВАНИЯ
-- ============================================

/*
-- В коде TypeScript:

import { supabase } from './supabase';

// 1. Загрузить фото
const userId = 1000089271;
const propertyId = '550e8400-e29b-41d4-a716-446655440000';
const fileName = 'photo_1.jpg';
const filePath = `${userId}/${propertyId}/${fileName}`;

const { data, error } = await supabase.storage
  .from('tenant-photos')
  .upload(filePath, photoBlob, {
    contentType: 'image/jpeg',
    upsert: false
  });

// 2. Получить публичный URL
const { data: urlData } = supabase.storage
  .from('tenant-photos')
  .getPublicUrl(filePath);

console.log(urlData.publicUrl);
// https://xxx.supabase.co/storage/v1/object/public/tenant-photos/1000089271/550e8400.../photo_1.jpg

// 3. Удалить фото
const { error } = await supabase.storage
  .from('tenant-photos')
  .remove([filePath]);
*/
