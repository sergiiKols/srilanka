## Name: Parse Landlord Offer

## Description:
Парсинг и обработка предложения от арендодателя (landlord) с сохранением объекта недвижимости и привязкой к заявке клиента

## Purpose:
Когда арендодатель отправляет ответ (предложение) через форму в Telegram-боте, система должна распарсить его, извлечь данные и создать в БД объект недвижимости (property) и привязать его к заявке клиента (rental_offer).

---

## 📋 ПОЛНОЕ ОПИСАНИЕ ЗАДАЧИ

### НАЗНАЧЕНИЕ
Когда арендодатель отправляет ответ (предложение) через форму в боте, система должна распарсить его, извлечь данные и создать в БД:
- **Объект недвижимости** (`property`)
- **Привязку этого объекта к заявке** (`rental_offer`)

### КОГДА ЗАПУСКАЕТСЯ
- Когда Telegram-бот получает заполненную форму от арендодателя
- Форма приходит как **webhook** или **callback** от бота
- Может быть вызван вручную из админ-панели для тестирования

### ЧТО НА ВХОДЕ

**Данные из Telegram-формы:**
- **Название объекта** (`property_name`) - например: "Villa Sunset"
- **Количество спален** (`bedrooms`) - число: 1, 2, 3, 4+
- **Удобства** (`amenities`) - checkboxes:
  - WiFi
  - Бассейн (pool)
  - Кухня (kitchen)
  - Кондиционер (AC)
  - Парковка (parking)
  - Стиральная машина (washing machine)
  - И другие...
- **Цена за ночь** (`price_per_night`) - в USD
- **Фотографии** (`photos`) - массив файлов из Telegram
- **Телефон арендодателя** (`phone`) - может быть уже в профиле
- **ID арендодателя** (`landlord_telegram_id`)
- **ID заявки** (`request_id`) - на которую он отвечает

**Опциональные данные:**
- Координаты (`lat`, `lng`)
- Адрес (`address`)
- Описание (`description`)

### ЧТО НА ВЫХОДЕ

**Успешный результат:**
```json
{
  "status": "success",
  "property_id": 456,
  "rental_offer_id": 789,
  "message": "Предложение успешно добавлено",
  "created_at": "2026-01-26T12:00:00Z"
}
```

**Ошибка (неполные данные):**
```json
{
  "status": "incomplete",
  "missing_fields": ["photos", "price_per_night"],
  "message": "Пожалуйста, заполните обязательные поля",
  "draft_saved": true
}
```

**Ошибка:**
```json
{
  "status": "error",
  "error": "Failed to download photos",
  "message": "Не удалось скачать фотографии"
}
```

---

## 🔄 ЧТО СИСТЕМА ДЕЛАЕТ

### Шаг 1: Получение данных формы
```javascript
// Webhook от Telegram бота
app.post('/webhook/telegram/form-response', async (req, res) => {
  const formData = req.body;
  await parseLandlordOffer(formData);
});
```

### Шаг 2: Валидация обязательных полей
```javascript
const requiredFields = ['property_name', 'bedrooms', 'price_per_night', 'photos'];
const missingFields = [];

requiredFields.forEach(field => {
  if (!formData[field] || formData[field].length === 0) {
    missingFields.push(field);
  }
});
```

### Шаг 3: Обработка фотографий
```javascript
// Скачать фото из Telegram
const photos = [];
for (const photoId of formData.photos) {
  const file = await bot.getFile(photoId);
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
  
  // Загрузить в Supabase Storage
  const { data, error } = await supabase.storage
    .from('properties')
    .upload(`${propertyId}/${photoId}.jpg`, fileBuffer);
  
  photos.push(data.publicUrl);
}
```

### Шаг 4: Создание property в БД
```sql
INSERT INTO properties (
  name,
  bedrooms,
  amenities,
  price_per_night,
  photos,
  landlord_id,
  lat,
  lng,
  address,
  description
) VALUES (
  :name,
  :bedrooms,
  :amenities,
  :price_per_night,
  :photos,
  :landlord_id,
  :lat,
  :lng,
  :address,
  :description
)
RETURNING id;
```

### Шаг 5: Создание rental_offer
```sql
INSERT INTO rental_offers (
  request_id,
  property_id,
  landlord_id,
  status,
  created_at
) VALUES (
  :request_id,
  :property_id,
  :landlord_id,
  'pending',
  NOW()
)
RETURNING id;
```

### Шаг 6: Уведомление арендодателя
```javascript
await bot.sendMessage(
  landlordTelegramId,
  '✅ Спасибо! Ваше предложение добавлено.\n\n' +
  `Объект: ${propertyName}\n` +
  `Заявка: #${requestId}\n\n` +
  'Клиент увидит ваше предложение на карте.'
);
```

### Шаг 7: Уведомление клиента
```javascript
await bot.sendMessage(
  clientTelegramId,
  '🏠 Новое предложение по вашей заявке!\n\n' +
  `${propertyName}\n` +
  `💰 $${pricePerNight}/ночь\n` +
  `🛏️ ${bedrooms} спален\n\n` +
  '[Посмотреть на карте]'
);
```

---

## 🔧 ВАЖНЫЕ ВОПРОСЫ (для production)

### 1. Структура Telegram-формы
**Какие именно поля?**
- Название объекта ✅
- Спальни ✅
- Удобства (какие именно чекбоксы?) ❓
- Цена за ночь ✅
- Фото (сколько минимум/максимум?) ❓
- Телефон ❓
- Адрес ❓

### 2. Координаты
- Арендодатель вводит вручную? ❓
- Система определяет по адресу (geocoding)? ❓
- Если нет координат → просить указать или сохранять без них? ❓
- Может ли landlord отправить geo-точку в боте? ✅ (да, Telegram поддерживает)

### 3. Множественные объекты
- Может ли landlord отправить **несколько объектов** в одном сообщении? ❓
- Или каждый объект отдельно? ✅ (рекомендуется)

### 4. Черновики
- Если данные неполные → сохранять как черновик? ✅
- Landlord может вернуться и дополнить? ✅

### 5. Редактирование
- Может ли landlord редактировать своё предложение после публикации? ❓
- Удалять предложение? ❓

---

## 📝 Instructions for AI Agent:

### Step 1: Validate Input
```javascript
const requiredFields = {
  property_name: 'string',
  bedrooms: 'number',
  price_per_night: 'number',
  photos: 'array',
  landlord_telegram_id: 'number',
  request_id: 'number'
};

const validation = validateFormData(formData, requiredFields);
if (!validation.valid) {
  return {
    status: 'incomplete',
    missing_fields: validation.missing,
    message: `Пожалуйста, заполните: ${validation.missing.join(', ')}`
  };
}
```

### Step 2: Download Photos from Telegram
```javascript
const downloadedPhotos = [];
for (const photoFileId of formData.photos) {
  try {
    const file = await bot.getFile(photoFileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    
    // Download file
    const response = await fetch(fileUrl);
    const buffer = await response.arrayBuffer();
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${photoFileId}.jpg`;
    const { data, error } = await supabase.storage
      .from('properties')
      .upload(`${landlordTelegramId}/${fileName}`, buffer);
    
    if (error) throw error;
    
    downloadedPhotos.push(data.publicUrl);
  } catch (err) {
    console.error('Failed to download photo:', err);
  }
}

if (downloadedPhotos.length === 0) {
  return {
    status: 'error',
    error: 'No photos could be downloaded',
    message: 'Не удалось загрузить фотографии'
  };
}
```

### Step 3: Create Property
```javascript
const { data: property, error: propertyError } = await supabase
  .from('properties')
  .insert({
    name: formData.property_name,
    bedrooms: formData.bedrooms,
    amenities: formData.amenities || [],
    price_per_night: formData.price_per_night,
    photos: downloadedPhotos,
    landlord_telegram_id: formData.landlord_telegram_id,
    lat: formData.lat || null,
    lng: formData.lng || null,
    address: formData.address || null,
    description: formData.description || null,
    created_at: new Date().toISOString()
  })
  .select()
  .single();

if (propertyError) throw propertyError;
```

### Step 4: Create Rental Offer
```javascript
const { data: offer, error: offerError } = await supabase
  .from('rental_offers')
  .insert({
    request_id: formData.request_id,
    property_id: property.id,
    landlord_telegram_id: formData.landlord_telegram_id,
    status: 'pending',
    created_at: new Date().toISOString()
  })
  .select()
  .single();

if (offerError) throw offerError;
```

### Step 5: Send Notifications
```javascript
// Notify landlord
await bot.sendMessage(
  formData.landlord_telegram_id,
  `✅ Спасибо! Ваше предложение добавлено.\n\n` +
  `🏠 Объект: ${property.name}\n` +
  `📋 Заявка: #${formData.request_id}\n\n` +
  `Клиент увидит ваше предложение на карте.`
);

// Notify client (get client telegram_id from request)
const { data: request } = await supabase
  .from('rental_requests')
  .select('client_telegram_id, location')
  .eq('id', formData.request_id)
  .single();

await bot.sendMessage(
  request.client_telegram_id,
  `🏠 Новое предложение по вашей заявке!\n\n` +
  `${property.name}\n` +
  `💰 $${property.price_per_night}/ночь\n` +
  `🛏️ ${property.bedrooms} спален\n\n` +
  `[Посмотреть на карте](https://yoursite.com/map?property=${property.id})`
);
```

### Step 6: Return Result
```javascript
return {
  status: 'success',
  property_id: property.id,
  rental_offer_id: offer.id,
  message: 'Предложение успешно добавлено',
  created_at: property.created_at
};
```

---

## 🧪 Expected Output:

**Success Case:**
```json
{
  "status": "success",
  "property_id": 456,
  "rental_offer_id": 789,
  "property_name": "Villa Sunset",
  "photos_uploaded": 5,
  "message": "Предложение успешно добавлено",
  "created_at": "2026-01-26T12:00:00Z"
}
```

**Incomplete Data:**
```json
{
  "status": "incomplete",
  "missing_fields": ["photos", "price_per_night"],
  "message": "Пожалуйста, заполните: photos, price_per_night",
  "draft_saved": true,
  "draft_id": 123
}
```

**Error Case:**
```json
{
  "status": "error",
  "error": "Failed to create property in database",
  "message": "Ошибка при создании объекта",
  "details": "Database constraint violation"
}
```

---

## 💡 Example Usage:

### Via Telegram Bot Webhook:
```javascript
// bot.js
bot.on('callback_query', async (callbackQuery) => {
  if (callbackQuery.data.startsWith('submit_offer_')) {
    const requestId = parseInt(callbackQuery.data.split('_')[2]);
    
    // Get form data from conversation
    const formData = getUserFormData(callbackQuery.from.id);
    formData.request_id = requestId;
    
    // Parse offer
    const result = await parseLandlordOffer(formData);
    
    // Send response
    await bot.sendMessage(callbackQuery.from.id, result.message);
  }
});
```

### Via Admin Panel:
```bash
POST /api/admin/skills/parse-landlord-offer/run
{
  "form_data": {
    "property_name": "Villa Sunset",
    "bedrooms": 3,
    "amenities": ["wifi", "pool", "kitchen"],
    "price_per_night": 150,
    "photos": ["file_id_1", "file_id_2"],
    "landlord_telegram_id": 123456789,
    "request_id": 42
  }
}
```

### Via Command Line:
```bash
node .agent/skills/parse-landlord-offer/scripts/parse.js \
  --property-name="Villa Sunset" \
  --bedrooms=3 \
  --price=150 \
  --photos=photo1.jpg,photo2.jpg \
  --landlord-id=123456789 \
  --request-id=42
```

---

## 📦 Dependencies:

```json
{
  "node-telegram-bot-api": "^0.66.0",
  "@supabase/supabase-js": "^2.39.0",
  "axios": "^1.6.0",
  "sharp": "^0.33.0"
}
```

---

## 🔐 Environment Variables:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_STORAGE_BUCKET=properties
```

---

## ⚠️ Notes:

- **Тестовая версия:** Использует mock данные без реального Telegram API
- **Фотографии:** В тесте используются placeholder ссылки
- **Production:** Требует настройку Telegram webhook и Supabase Storage
- **Безопасность:** Проверять что landlord имеет право создавать предложения
- **Rate limiting:** Ограничение количества предложений от одного landlord
- **Модерация:** Возможность проверки предложений перед публикацией

---

## 🚀 Future Enhancements:

1. **Автоматическое определение координат** по адресу (geocoding)
2. **AI-генерация описания** на основе фото и данных
3. **Проверка дубликатов** - не создавать одинаковые property
4. **Мультиязычность** - поддержка описаний на разных языках
5. **Автоматическая оптимизация фото** - сжатие, ресайз, watermark
6. **Валидация цен** - проверка что цена в разумных пределах
7. **История изменений** - отслеживание редактирований предложений
