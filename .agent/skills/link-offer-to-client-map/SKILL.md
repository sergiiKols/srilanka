## Name: Link Offer to Client Map

## Description:
Подготовка данных предложения для отображения на персональной карте клиента

## Purpose:
Когда новое предложение создано, нужно убедиться, что оно будет видно клиенту на его персональной карте. Этот скилл готовит данные: «этот offer → этой заявке → этому клиенту».

---

## 📋 ПОЛНОЕ ОПИСАНИЕ ЗАДАЧИ

### НАЗНАЧЕНИЕ
Когда новое предложение создано, нужно убедиться, что оно будет видно клиенту на его персональной карте. Этот скилл готовит данные: этот offer → этой заявке → этому клиенту.

**Основная задача:**
- Связать предложение с клиентом
- Подготовить все данные для отображения на карте
- Убедиться что offer готов к показу

### КОГДА ЗАПУСКАЕТСЯ
- **Сразу после создания rental_offer** (в SKILL #2: parse-landlord-offer)
- Автоматически как следующий шаг в цепочке
- Может быть вызван вручную для повторной обработки

### ЧТО НА ВХОДЕ

**Обязательные параметры:**
- `offer_id` (number) - ID только что созданного предложения
- `property_id` (number) - ID объекта недвижимости
- `request_id` (number) - ID заявки клиента (чья это заявка)

**Пример:**
```json
{
  "offer_id": 123,
  "property_id": 456,
  "request_id": 42
}
```

### ЧТО НА ВЫХОДЕ

**Успешный результат:**
```json
{
  "status": "ready",
  "offer_id": 123,
  "client_id": 987654321,
  "map_data": {
    "id": "offer_123",
    "property_name": "Villa Sunset",
    "price": 100,
    "bedrooms": 4,
    "coords": [6.927, 80.123],
    "photos": ["url1.jpg", "url2.jpg"],
    "amenities": ["wifi", "pool", "kitchen"],
    "landlord_name": "Петр",
    "landlord_telegram": "@petr123"
  },
  "message": "Offer готов к показу на карте"
}
```

**Ошибка (нет координат):**
```json
{
  "status": "incomplete",
  "error": "missing_coordinates",
  "message": "Координаты не указаны, offer не может быть показан на карте",
  "offer_id": 123
}
```

**Ошибка:**
```json
{
  "status": "error",
  "error": "property_not_found",
  "message": "Property не найден в БД",
  "property_id": 456
}
```

---

## 🔄 ЧТО СИСТЕМА ДЕЛАЕТ

### Шаг 1: Получение данных offer
```javascript
const { data: offer, error } = await supabase
  .from('rental_offers')
  .select('*')
  .eq('id', offerId)
  .single();

if (error || !offer) {
  throw new Error('Offer не найден');
}
```

### Шаг 2: Загрузка полных данных property
```javascript
const { data: property, error: propertyError } = await supabase
  .from('properties')
  .select('*')
  .eq('id', propertyId)
  .single();

if (propertyError || !property) {
  throw new Error('Property не найден');
}

// Проверка координат
if (!property.lat || !property.lng) {
  return {
    status: 'incomplete',
    error: 'missing_coordinates',
    message: 'Координаты не указаны'
  };
}
```

### Шаг 3: Загрузка данных арендодателя
```javascript
const { data: landlord, error: landlordError } = await supabase
  .from('users')
  .select('name, telegram_username, phone')
  .eq('telegram_id', property.landlord_telegram_id)
  .single();

// Если landlord не найден, используем telegram_id
const landlordName = landlord?.name || 'Landlord';
const landlordTelegram = landlord?.telegram_username || 
  `tg://user?id=${property.landlord_telegram_id}`;
```

### Шаг 4: Загрузка данных заявки (для client_id)
```javascript
const { data: request, error: requestError } = await supabase
  .from('rental_requests')
  .select('client_telegram_id, client_name')
  .eq('id', requestId)
  .single();

if (requestError || !request) {
  throw new Error('Request не найден');
}

const clientId = request.client_telegram_id;
```

### Шаг 5: Подготовка JSON для карты
```javascript
const mapData = {
  id: `offer_${offerId}`,
  offer_id: offerId,
  property_id: propertyId,
  property_name: property.name,
  price: property.price_per_night,
  bedrooms: property.bedrooms,
  coords: [property.lat, property.lng],
  photos: property.photos || [],
  amenities: property.amenities || [],
  description: property.description || '',
  address: property.address || '',
  landlord_name: landlordName,
  landlord_telegram: landlordTelegram,
  landlord_phone: landlord?.phone || null,
  created_at: offer.created_at
};
```

### Шаг 6: Пометка в БД (готов к показу)
```javascript
const { error: updateError } = await supabase
  .from('rental_offers')
  .update({
    status: 'ready_to_show',
    map_data: mapData,
    updated_at: new Date().toISOString()
  })
  .eq('id', offerId);

if (updateError) {
  throw new Error('Не удалось обновить статус offer');
}
```

### Шаг 7: Возврат результата
```javascript
return {
  status: 'ready',
  offer_id: offerId,
  client_id: clientId,
  map_data: mapData,
  message: 'Offer готов к показу на карте',
  map_url: `https://yoursite.com/map?request=${requestId}&highlight=${offerId}`
};
```

---

## 🔧 ВАЖНЫЕ ВОПРОСЫ (для production)

### 1. Статус готовности
**Как система знает, что offer готов к показу?**
- ✅ Добавить поле `status` в таблицу `rental_offers`:
  - `pending` - создан, но не обработан
  - `ready_to_show` - готов к показу
  - `shown` - показан клиенту
  - `rejected` - отклонён клиентом

### 2. Проверка координат
**Нужно ли проверять координаты перед показом?**
- ✅ **ДА** - без координат offer не может быть показан на карте
- Если координат нет → статус `incomplete`, просим landlord указать
- Можно использовать geocoding для автоопределения по адресу

### 3. Отсутствие координат
**Если координат нет → показываем всё равно или скрываем?**
- ❌ **НЕ показываем** на карте (нет точки для маркера)
- ✅ Можно показать в списке без карты
- ✅ Уведомить landlord: "Пожалуйста, укажите координаты"

### 4. Кеширование данных
**Сохранять ли подготовленные map_data в БД?**
- ✅ **ДА** - сохранять в поле `map_data` (JSONB)
- Преимущество: быстрая загрузка для клиента
- Недостаток: нужно обновлять при изменении property

### 5. Множественные предложения
**Может ли один property быть в нескольких offers?**
- ✅ **ДА** - один property может отвечать на разные заявки
- Каждый offer уникален (разные клиенты)

---

## 📝 Instructions for AI Agent:

### Step 1: Validate Input
```javascript
if (!offerId || !propertyId || !requestId) {
  throw new Error('Missing required parameters: offer_id, property_id, request_id');
}
```

### Step 2: Fetch Offer Data
```javascript
const { data: offer } = await supabase
  .from('rental_offers')
  .select('*')
  .eq('id', offerId)
  .single();
```

### Step 3: Fetch Property Data
```javascript
const { data: property } = await supabase
  .from('properties')
  .select('*')
  .eq('id', propertyId)
  .single();

// Validate coordinates
if (!property.lat || !property.lng) {
  return {
    status: 'incomplete',
    error: 'missing_coordinates'
  };
}
```

### Step 4: Fetch Landlord Data
```javascript
const { data: landlord } = await supabase
  .from('users')
  .select('name, telegram_username, phone')
  .eq('telegram_id', property.landlord_telegram_id)
  .single();
```

### Step 5: Fetch Request (Client) Data
```javascript
const { data: request } = await supabase
  .from('rental_requests')
  .select('client_telegram_id')
  .eq('id', requestId)
  .single();
```

### Step 6: Prepare Map Data
```javascript
const mapData = {
  id: `offer_${offerId}`,
  property_name: property.name,
  price: property.price_per_night,
  bedrooms: property.bedrooms,
  coords: [property.lat, property.lng],
  photos: property.photos,
  amenities: property.amenities,
  landlord_name: landlord?.name || 'Landlord',
  landlord_telegram: landlord?.telegram_username
};
```

### Step 7: Update Offer Status
```javascript
await supabase
  .from('rental_offers')
  .update({
    status: 'ready_to_show',
    map_data: mapData
  })
  .eq('id', offerId);
```

### Step 8: Return Result
```javascript
return {
  status: 'ready',
  offer_id: offerId,
  client_id: request.client_telegram_id,
  map_data: mapData
};
```

---

## 🧪 Expected Output:

**Success:**
```json
{
  "status": "ready",
  "offer_id": 123,
  "client_id": 987654321,
  "map_data": {
    "id": "offer_123",
    "property_name": "Villa Sunset",
    "price": 100,
    "bedrooms": 4,
    "coords": [6.927, 80.123],
    "photos": ["https://example.com/photo1.jpg"],
    "amenities": ["wifi", "pool", "kitchen"],
    "landlord_name": "Петр",
    "landlord_telegram": "@petr123"
  },
  "message": "Offer готов к показу на карте",
  "map_url": "https://yoursite.com/map?request=42&highlight=123"
}
```

---

## 💡 Example Usage:

### Via API (автоматически после SKILL #2):
```javascript
// В конце SKILL #2
const linkResult = await fetch('/api/admin/skills/link-offer-to-client-map/run', {
  method: 'POST',
  body: JSON.stringify({
    offer_id: newOffer.id,
    property_id: newProperty.id,
    request_id: formData.request_id
  })
});
```

### Via Command Line:
```bash
node .agent/skills/link-offer-to-client-map/scripts/link.js \
  --offer-id=123 \
  --property-id=456 \
  --request-id=42
```

---

## 📦 Dependencies:

```json
{
  "@supabase/supabase-js": "^2.39.0"
}
```

---

## 🔐 Environment Variables:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
```

---

## ⚠️ Notes:

- **Тестовая версия:** Использует mock данные
- **Production:** Требует реальную БД с таблицами `rental_offers`, `properties`, `rental_requests`, `users`
- **Координаты обязательны:** Без координат offer не показывается на карте
- **Статусы:** Используется поле `status` для отслеживания готовности
- **Кеширование:** `map_data` сохраняется в БД для быстрой загрузки

---

## 🚀 Future Enhancements:

1. **Автоматический geocoding** - определение координат по адресу
2. **Проверка дубликатов** - не показывать один property дважды одному клиенту
3. **Рейтинг предложений** - сортировка по релевантности
4. **Уведомления real-time** - WebSocket обновление карты
5. **Аналитика** - отслеживание просмотров offer на карте
