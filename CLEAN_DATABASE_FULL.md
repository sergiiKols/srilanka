# 🧹 ПОЛНАЯ ОЧИСТКА БАЗЫ ДАННЫХ

## ⚠️ ВНИМАНИЕ
Это удалит **ВСЕ объекты** и **ВСЕ фотографии**.
Пользователи (tenants) **НЕ будут затронуты**.

---

## 📋 ШАГ 1: Удаление фотографий из Storage

Выполните команду в терминале:

```bash
node delete_all_photos.js
```

**Код скрипта `delete_all_photos.js`:**

```javascript
// ============================================
// УДАЛЕНИЕ ВСЕХ ФОТОГРАФИЙ ИЗ STORAGE
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://mcmzdscpuoxwneuzsanu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw'
);

async function deleteAllPhotos() {
    console.log('🗑️ Удаление всех фотографий из Storage...\n');
    
    try {
        // 1. Получаем список всех папок (user IDs)
        const { data: userFolders, error: listError } = await supabase.storage
            .from('tenant-photos')
            .list('', { limit: 1000 });
        
        if (listError) {
            console.error('❌ Ошибка получения списка папок:', listError);
            return;
        }
        
        if (!userFolders || userFolders.length === 0) {
            console.log('📁 Нет фотографий для удаления');
            return;
        }
        
        console.log(`📁 Найдено папок пользователей: ${userFolders.length}\n`);
        
        let totalDeleted = 0;
        
        // 2. Для каждой папки пользователя удаляем все файлы
        for (const userFolder of userFolders) {
            if (!userFolder.name) continue;
            
            console.log(`👤 Обработка папки: ${userFolder.name}`);
            
            // Получаем список папок объектов (property IDs)
            const { data: propertyFolders, error: propError } = await supabase.storage
                .from('tenant-photos')
                .list(userFolder.name, { limit: 1000 });
            
            if (propError) {
                console.error(`  ❌ Ошибка: ${propError.message}`);
                continue;
            }
            
            if (!propertyFolders || propertyFolders.length === 0) {
                console.log(`  📁 Пусто`);
                continue;
            }
            
            // Для каждой папки объекта удаляем файлы
            for (const propFolder of propertyFolders) {
                if (!propFolder.name) continue;
                
                const folderPath = `${userFolder.name}/${propFolder.name}`;
                
                // Получаем список файлов
                const { data: files, error: filesError } = await supabase.storage
                    .from('tenant-photos')
                    .list(folderPath, { limit: 100 });
                
                if (filesError) {
                    console.error(`    ❌ Ошибка чтения ${folderPath}: ${filesError.message}`);
                    continue;
                }
                
                if (!files || files.length === 0) continue;
                
                // Удаляем все файлы
                const filePaths = files.map(file => `${folderPath}/${file.name}`);
                
                const { error: deleteError } = await supabase.storage
                    .from('tenant-photos')
                    .remove(filePaths);
                
                if (deleteError) {
                    console.error(`    ❌ Ошибка удаления: ${deleteError.message}`);
                } else {
                    totalDeleted += files.length;
                    console.log(`    ✅ Удалено ${files.length} фото из ${folderPath}`);
                }
            }
        }
        
        console.log(`\n✅ ГОТОВО! Удалено фотографий: ${totalDeleted}`);
        console.log('\n💡 Теперь выполните ШАГ 2: SQL скрипт');
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
    }
}

deleteAllPhotos();
```

---

## 📋 ШАГ 2: Удаление объектов из базы данных

1. Зайдите в **Supabase SQL Editor**: https://supabase.com/dashboard/project/mcmzdscpuoxwneuzsanu/sql
2. Создайте **New query**
3. Скопируйте и вставьте код ниже
4. Нажмите **Run** (Ctrl+Enter)

**SQL код:**

```sql
-- ============================================
-- УДАЛЕНИЕ ВСЕХ ОБЪЕКТОВ ИЗ БАЗЫ ДАННЫХ
-- ============================================

-- 1. Показываем что будет удалено (для проверки)
SELECT 
    COUNT(*) as total_properties,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted
FROM saved_properties;

-- 2. УДАЛЕНИЕ ВСЕХ ОБЪЕКТОВ
DELETE FROM saved_properties;

-- 3. Проверка после удаления
SELECT COUNT(*) as remaining_properties FROM saved_properties;

-- 4. Обнуляем счётчики у пользователей (опционально)
UPDATE tenants SET saved_properties_count = 0;

-- ============================================
-- ГОТОВО!
-- ============================================
```

---

## ✅ Результат

После выполнения обоих шагов:

- ✅ Все фотографии удалены из Storage
- ✅ Все объекты удалены из базы данных
- ✅ Счётчики пользователей обнулены
- ✅ Пользователи (tenants) **сохранены**
- ✅ Личные карты **продолжают работать**

**База готова к новым тестам!** 🚀
