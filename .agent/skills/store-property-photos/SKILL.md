## Name: Store Property Photos

## Description:
Сохранение фотографий объекта недвижимости из Telegram в Supabase Storage с генерацией постоянных URL

## Purpose:
Фотографии из Telegram нужно сохранить в надежном месте (Supabase Storage), чтобы они не зависели от Telegram, можно было быстро загружать их на карту, и ссылки были постоянные и безопасные.

---

## 📋 ПОЛНОЕ ОПИСАНИЕ ЗАДАЧИ

### НАЗНАЧЕНИЕ
Фотографии из Telegram нужно сохранить в надежном месте (Supabase Storage), чтобы:
- **Не зависели от Telegram** - Telegram может удалить файлы через время
- **Быстрая загрузка** - оптимизированные фото загружаются быстрее
- **Постоянные ссылки** - URL не меняются
- **Безопасность** - контроль доступа через Supabase

### КОГДА ЗАПУСКАЕТСЯ
- **Во время SKILL #2** (`parse-landlord-offer`), когда обрабатываются фото из формы
- Сразу после получения `telegram_file_ids` от landlord
- Перед созданием property в БД

### ЧТО НА ВХОДЕ

**Обязательные параметры:**
- `telegram_file_ids` (array) - список ID файлов из Telegram
- `property_id` (number) - ID property к которому привязать фото
- `landlord_telegram_id` (number) - ID landlord (для организации папок)

**Опциональные параметры:**
- `compress` (boolean) - сжимать ли фото (default: true)
- `max_size_mb` (number) - максимальный размер файла в MB (default: 5)
- `max_photos` (number) - максимум фото на property (default: 10)

**Пример:**
```json
{
  "telegram_file_ids": ["AgACAgIAAxkBAAIC...", "AgACAgIAAxkBAAID..."],
  "property_id": 456,
  "landlord_telegram_id": 123456789,
  "compress": true,
  "max_size_mb": 5,
  "max_photos": 10
}
```

### ЧТО НА ВЫХОДЕ

**Успешный результат:**
```json
{
  "status": "success",
  "property_id": 456,
  "photos_uploaded": 3,
  "storage_urls": [
    "https://mcmzdscpuoxwneuzsanu.supabase.co/storage/v1/object/public/properties/456/photo1.jpg",
    "https://mcmzdscpuoxwneuzsanu.supabase.co/storage/v1/object/public/properties/456/photo2.jpg",
    "https://mcmzdscpuoxwneuzsanu.supabase.co/storage/v1/object/public/properties/456/photo3.jpg"
  ],
  "message": "3 фотографии успешно загружены",
  "storage_size_mb": 2.5
}
```

**Частичный успех (некоторые фото не загрузились):**
```json
{
  "status": "partial",
  "photos_uploaded": 2,
  "photos_failed": 1,
  "storage_urls": ["url1.jpg", "url2.jpg"],
  "errors": ["Photo 3: File too large (8.5MB > 5MB)"],
  "message": "2 из 3 фотографий загружены"
}
```

**Ошибка:**
```json
{
  "status": "error",
  "error": "telegram_api_error",
  "message": "Не удалось получить файлы из Telegram",
  "details": "Invalid file_id"
}
```

---

## 🔄 ЧТО СИСТЕМА ДЕЛАЕТ

### Шаг 1: Валидация входных данных
```javascript
// Проверка параметров
if (!telegram_file_ids || telegram_file_ids.length === 0) {
  throw new Error('No photo IDs provided');
}

if (telegram_file_ids.length > max_photos) {
  throw new Error(`Too many photos: ${telegram_file_ids.length} > ${max_photos}`);
}

if (!property_id) {
  throw new Error('Property ID required');
}
```

### Шаг 2: Загрузка файлов из Telegram
```javascript
const downloadedPhotos = [];

for (let i = 0; i < telegram_file_ids.length; i++) {
  const fileId = telegram_file_ids[i];
  
  try {
    // Получить info о файле
    const file = await bot.getFile(fileId);
    
    // Проверка размера
    const fileSizeMB = file.file_size / 1024 / 1024;
    if (fileSizeMB > max_size_mb) {
      errors.push(`Photo ${i+1}: File too large (${fileSizeMB.toFixed(1)}MB > ${max_size_mb}MB)`);
      continue;
    }
    
    // Скачать файл
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    
    downloadedPhotos.push({
      index: i,
      buffer: Buffer.from(buffer),
      size: file.file_size,
      extension: file.file_path.split('.').pop()
    });
    
  } catch (err) {
    errors.push(`Photo ${i+1}: ${err.message}`);
  }
}
```

### Шаг 3: Оптимизация/сжатие фото (опционально)
```javascript
if (compress) {
  for (const photo of downloadedPhotos) {
    try {
      // Использовать sharp для сжатия
      const compressed = await sharp(photo.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      photo.buffer = compressed;
      photo.size = compressed.length;
      photo.extension = 'jpg';
      
    } catch (err) {
      console.warn('Compression failed, using original:', err.message);
    }
  }
}
```

### Шаг 4: Загрузка в Supabase Storage
```javascript
const storageUrls = [];

for (const photo of downloadedPhotos) {
  const fileName = `photo_${Date.now()}_${photo.index}.${photo.extension}`;
  const filePath = `${property_id}/${fileName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('properties')
      .upload(filePath, photo.buffer, {
        contentType: `image/${photo.extension}`,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Получить публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    storageUrls.push(publicUrl);
    
  } catch (err) {
    errors.push(`Photo ${photo.index + 1}: Upload failed - ${err.message}`);
  }
}
```

### Шаг 5: Сохранение URLs в БД
```javascript
const { error: updateError } = await supabase
  .from('properties')
  .update({
    photos: storageUrls,
    photos_count: storageUrls.length,
    updated_at: new Date().toISOString()
  })
  .eq('id', property_id);

if (updateError) {
  throw new Error('Failed to update property photos in database');
}
```

### Шаг 6: Возврат результата
```javascript
return {
  status: errors.length === 0 ? 'success' : 'partial',
  property_id: property_id,
  photos_uploaded: storageUrls.length,
  photos_failed: errors.length,
  storage_urls: storageUrls,
  errors: errors,
  message: `${storageUrls.length} из ${telegram_file_ids.length} фотографий загружены`,
  storage_size_mb: totalSizeMB
};
```

---

## 🔧 ВАЖНЫЕ ВОПРОСЫ (для production)

### 1. Лимиты фотографий
**Максимум сколько фото на один property?**
- ✅ Рекомендация: **10 фото**
- Причина: баланс между качеством презентации и скоростью загрузки
- Можно настроить через параметр `max_photos`

### 2. Размер файлов
**Максимум какой размер за фото?**
- ✅ Рекомендация: **5 MB** оригинал
- После сжатия: обычно 500KB - 1.5MB
- Telegram limit: 10MB (но лучше ограничить меньше)

### 3. Сжатие фото
**Нужно ли автоматически сжимать/уменьшать размер фото?**
- ✅ **ДА** - обязательно сжимать:
  - Resize до max 1920x1080 (Full HD)
  - JPEG quality 85%
  - Конвертация HEIC/PNG → JPEG
- Экономия: до 70-80% размера без потери качества

### 4. Обработка ошибок
**Если фото не загрузилась → что делаем?**
- **Вариант А:** Сохранить property с теми фото что загрузились ✅
- **Вариант Б:** Отменить создание property ❌
- **Вариант В:** Сохранить как черновик и запросить фото снова
- **Рекомендация:** Вариант А + уведомление landlord

### 5. Организация хранилища
**Структура папок в Storage:**
```
properties/
  ├── 123/               # property_id
  │   ├── photo_1.jpg
  │   ├── photo_2.jpg
  │   └── photo_3.jpg
  ├── 456/
  │   └── photo_1.jpg
  └── ...
```

### 6. Резервное копирование
- Supabase Storage автоматически делает backups
- CDN для быстрой загрузки по всему миру
- Версионирование: если landlord заменит фото

---

## 📝 Instructions for AI Agent:

### Step 1: Validate Input
```javascript
if (!telegram_file_ids?.length) throw new Error('No photos provided');
if (telegram_file_ids.length > max_photos) throw new Error('Too many photos');
if (!property_id) throw new Error('Property ID required');
```

### Step 2: Download from Telegram
```javascript
const photos = [];
for (const fileId of telegram_file_ids) {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  photos.push({ buffer, fileId });
}
```

### Step 3: Compress Images
```javascript
const compressed = await sharp(buffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer();
```

### Step 4: Upload to Supabase
```javascript
const { data } = await supabase.storage
  .from('properties')
  .upload(`${property_id}/photo_${i}.jpg`, buffer);
```

### Step 5: Get Public URLs
```javascript
const { data: { publicUrl } } = supabase.storage
  .from('properties')
  .getPublicUrl(filePath);
```

### Step 6: Update Database
```javascript
await supabase
  .from('properties')
  .update({ photos: urls })
  .eq('id', property_id);
```

---

## 🧪 Expected Output:

**Success:**
```json
{
  "status": "success",
  "property_id": 456,
  "photos_uploaded": 3,
  "storage_urls": [
    "https://supabase.co/.../properties/456/photo1.jpg",
    "https://supabase.co/.../properties/456/photo2.jpg",
    "https://supabase.co/.../properties/456/photo3.jpg"
  ],
  "message": "3 фотографии успешно загружены",
  "storage_size_mb": 2.1,
  "compression_ratio": "65%"
}
```

---

## 💡 Example Usage:

### Via API (из SKILL #2):
```javascript
// В skill #2, после валидации формы
const photoResult = await fetch('/api/admin/skills/store-property-photos/run', {
  method: 'POST',
  body: JSON.stringify({
    telegram_file_ids: formData.photos,
    property_id: newProperty.id,
    landlord_telegram_id: formData.landlord_telegram_id
  })
});

const { storage_urls } = await photoResult.json();

// Обновить property с URLs
await updateProperty(newProperty.id, { photos: storage_urls });
```

### Via Command Line:
```bash
node .agent/skills/store-property-photos/scripts/store.js \
  --file-ids="id1,id2,id3" \
  --property-id=456 \
  --compress=true
```

---

## 📦 Dependencies:

```json
{
  "node-telegram-bot-api": "^0.66.0",
  "@supabase/supabase-js": "^2.39.0",
  "sharp": "^0.33.0",
  "node-fetch": "^3.3.2"
}
```

---

## 🔐 Environment Variables:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_STORAGE_BUCKET=properties
MAX_PHOTO_SIZE_MB=5
MAX_PHOTOS_PER_PROPERTY=10
COMPRESS_PHOTOS=true
```

---

## ⚠️ Notes:

- **Тестовая версия:** Mock загрузка без реального Telegram
- **Сжатие:** Sharp library для оптимизации
- **Формат:** Все фото конвертируются в JPEG
- **Размер:** Resize до 1920x1080, quality 85%
- **Async:** Загрузка фото параллельно для скорости
- **Retry:** 3 попытки при ошибке загрузки

---

## 🚀 Future Enhancements:

1. **WebP формат** - ещё меньше размер (-30% vs JPEG)
2. **Lazy loading thumbnails** - создавать preview 400x300
3. **Водяные знаки** - добавлять watermark автоматически
4. **EXIF очистка** - удалять метаданные (геолокация, камера)
5. **AI оптимизация** - умное кадрирование, улучшение качества
6. **CDN интеграция** - CloudFlare для ещё более быстрой загрузки
