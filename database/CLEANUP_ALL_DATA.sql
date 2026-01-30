-- ============================================
-- ПОЛНАЯ ОЧИСТКА БАЗЫ ДАННЫХ
-- ⚠️ ВНИМАНИЕ: Удаляет ВСЕ данные!
-- ============================================

-- 1. Удалить все фото из Storage
-- (Выполните в Supabase Dashboard → Storage → tenant-photos → Delete all files)
-- ИЛИ используйте эту функцию:

CREATE OR REPLACE FUNCTION delete_all_storage_files()
RETURNS TEXT AS $$
DECLARE
  file_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  FOR file_record IN 
    SELECT name, bucket_id 
    FROM storage.objects 
    WHERE bucket_id = 'tenant-photos'
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = file_record.bucket_id 
      AND name = file_record.name;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN 'Deleted ' || deleted_count || ' files from Storage';
END;
$$ LANGUAGE plpgsql;

-- Выполнить удаление файлов
SELECT delete_all_storage_files();

-- 2. Удалить все объекты из saved_properties
DELETE FROM saved_properties;

-- 3. Удалить все из архива (если таблица существует)
DELETE FROM archived_properties;

-- 4. Сбросить счётчики у tenants
UPDATE tenants SET saved_properties_count = 0;

-- 5. Проверка что всё удалено
SELECT 
  (SELECT COUNT(*) FROM saved_properties) as active_properties,
  (SELECT COUNT(*) FROM archived_properties) as archived_properties,
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'tenant-photos') as storage_files;

-- ============================================
-- РЕЗУЛЬТАТ ДОЛЖЕН БЫТЬ:
-- active_properties: 0
-- archived_properties: 0
-- storage_files: 0
-- ============================================
