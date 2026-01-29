# 📒 TELEGRAM БОТ ДЛЯ АРЕНДАТОРОВ - "ЗАПИСНАЯ КНИЖКА"

**Дата:** 2026-01-29  
**Версия:** 2.0 (исправленное понимание)  
**Клиент:** АРЕНДАТОРЫ (tenants) - ищут недвижимость для себя

---

## ✅ ПРАВИЛЬНОЕ ПОНИМАНИЕ

### Целевая аудитория:

**АРЕНДАТОРЫ (tenants)** - люди которые:
- 🔍 Ищут недвижимость для аренды
- 📝 Находят объекты САМОСТОЯТЕЛЬНО (Google Maps, сайты, улица)
- 💾 Хотят СОХРАНИТЬ найденные объекты для себя
- 🗺️ Хотят видеть все свои находки на ЛИЧНОЙ карте

### Концепция "Записная книжка":

```
Арендатор нашёл виллу → Сфотографировал → Скинул в бот → Сохранено
Арендатор увидел объявление → Скопировал ссылку → Скинул в бот → Сохранено
Арендатор нашёл на карте → Отметил место → Скинул в бот → Сохранено

Все объекты доступны на ЛИЧНОЙ карте арендатора
Никто другой их не видит!
```

---

## 🔄 ПОЛНЫЙ FLOW

### 1️⃣ Первый запуск: `/start`

**Бот отправляет:**
```
👋 Привет! Я помогу тебе сохранять и организовывать 
   найденную недвижимость на карте.

Выбери действие:

[📤 Добавить объект]    [🗺️ Моя карта]
```

**Внутренняя логика:**
```javascript
// Проверяем существует ли арендатор
let tenant = await getTenantByTelegramId(telegram_user_id);

if (!tenant) {
  // Создаём нового арендатора
  tenant = await createTenant({
    telegram_user_id: telegram_user_id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    personal_map_url: `https://site.com/map/${telegram_user_id}`
  });
  
  console.log(`✅ Создан арендатор ${telegram_user_id}`);
  console.log(`📍 Личная карта: ${tenant.personal_map_url}`);
}
```

---

### 2️⃣ КНОПКА #1: "📤 Добавить объект"

**Когда арендатор нажимает:**

1. **Бот отвечает:**
   ```
   📤 Сохрани объект недвижимости
   
   Отправь мне:
   • 📷 Фото (можно несколько)
   • 📍 Ссылку Google Maps или адрес
   • 💬 Описание (цена, комнаты, контакты)
   
   Можно отправить всё сразу или по очереди.
   ```

2. **Арендатор отправляет данные:**

   **Пример сообщения:**
   ```
   [Фото 1] [Фото 2]
   
   https://maps.google.com/?q=6.9271,79.8612
   
   2BR villa near beach, Negombo
   $800/month
   WiFi, Pool, Kitchen
   Contact: +94 77 123 4567
   Saw on the street, looks nice!
   ```

3. **Бот обрабатывает:**

   ```javascript
   // Извлекаем данные
   const photos = extractPhotos(message);
   const googleMapsUrl = extractGoogleMapsUrl(message.text);
   const description = message.text || message.caption;
   
   // Парсим координаты из Google Maps URL
   const { lat, lng } = parseGoogleMapsUrl(googleMapsUrl);
   
   // AI обработка описания (опционально)
   const parsed = await parseDescriptionWithAI(description);
   // Извлекает: price, bedrooms, amenities, contact
   
   // Сохраняем в БД
   const savedProperty = await createSavedProperty({
     tenant_id: tenant.id,
     telegram_user_id: telegram_user_id,
     photos: photos,
     latitude: lat,
     longitude: lng,
     description: description,
     price: parsed.price,
     bedrooms: parsed.bedrooms,
     amenities: parsed.amenities,
     contact_info: parsed.contact,
     notes: "Saved from Telegram" // личные заметки
   });
   ```

4. **Бот подтверждает:**
   ```
   ✅ Объект сохранён в твою коллекцию!
   
   🏠 2BR Villa, Negombo
   💰 $800/month
   📍 Координаты: 6.9271, 79.8612
   
   [🗺️ Открыть карту]    [📤 Добавить ещё]
   ```

---

### 3️⃣ КНОПКА #2: "🗺️ Моя карта"

**Когда арендатор нажимает:**

1. **Бот получает личную карту:**
   ```javascript
   const tenant = await getTenantByTelegramId(telegram_user_id);
   const mapUrl = tenant.personal_map_url;
   // https://site.com/map/1000089271
   ```

2. **Бот отправляет:**
   ```
   🗺️ Твоя личная карта с объектами
   
   📊 Статистика:
   • Сохранено объектов: 5
   • Последнее добавление: 2 часа назад
   
   [Открыть карту 🗺️]  ← кнопка с URL
   ```

3. **Арендатор нажимает → открывается страница**

---

## 🗺️ ЛИЧНАЯ КАРТА АРЕНДАТОРА

### URL структура:
```
https://srilanka-37u2.vercel.app/map/{telegram_user_id}

Пример:
https://srilanka-37u2.vercel.app/map/1000089271
                                    ^^^^^^^^^^
                                    telegram_user_id арендатора
```

### Что показывается на карте:

**ТОЛЬКО объекты этого конкретного арендатора!**

```javascript
// src/pages/map/[telegram_user_id].astro

const { telegram_user_id } = Astro.params;

// Загружаем ТОЛЬКО объекты этого пользователя
const { data: savedProperties } = await supabase
  .from('saved_properties')
  .select('*')
  .eq('telegram_user_id', telegram_user_id);

// Никакие другие пользователи не могут видеть эти объекты!
```

### Функционал карты:

1. **Интерактивная карта** (Leaflet)
2. **Маркеры с кластеризацией** (если много объектов)
3. **Клик на маркер → Popup:**
   - 🖼️ Слайдер фото
   - 🏠 Описание
   - 💰 Цена
   - 📞 Контакты
   - 📝 Личные заметки (можно добавить)
   - ✏️ Кнопка "Редактировать"
   - 🗑️ Кнопка "Удалить"

4. **Фильтры:**
   - По цене
   - По количеству комнат
   - По дате добавления

5. **Список объектов** (боковая панель):
   - Все сохранённые объекты списком
   - Сортировка
   - Поиск

---

## 🗄️ СТРУКТУРА БАЗЫ ДАННЫХ

### Таблица: `tenants` (арендаторы)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  personal_map_url TEXT UNIQUE NOT NULL,
  saved_properties_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenants_telegram_id ON tenants(telegram_user_id);
```

### Таблица: `saved_properties` (личные объекты арендаторов)

```sql
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Привязка к арендатору
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  
  -- Основная информация
  title TEXT,
  description TEXT,
  notes TEXT, -- личные заметки арендатора
  
  -- Местоположение
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  google_maps_url TEXT,
  
  -- Детали объекта
  property_type TEXT, -- villa, apartment, house, room
  bedrooms INT,
  bathrooms INT,
  area_sqm INT,
  
  -- Финансы
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  price_period TEXT, -- month, night, year
  
  -- Медиа
  photos TEXT[], -- массив URL фото из Telegram
  
  -- Удобства
  amenities JSONB, -- {wifi: true, pool: true, kitchen: true, ...}
  
  -- Контакты
  contact_info TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  
  -- Метаданные
  source TEXT DEFAULT 'telegram_bot', -- откуда добавлено
  is_favorite BOOLEAN DEFAULT false, -- избранное
  viewed_at TIMESTAMPTZ, -- когда просматривали
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_saved_props_tenant ON saved_properties(tenant_id);
CREATE INDEX idx_saved_props_telegram_id ON saved_properties(telegram_user_id);
CREATE INDEX idx_saved_props_location ON saved_properties(latitude, longitude);
CREATE INDEX idx_saved_props_created ON saved_properties(created_at DESC);
```

---

## 📡 API ENDPOINTS

### 1. POST `/api/tenant/save-property`

**Назначение:** Сохранить объект от арендатора через Telegram

**Вход:**
```json
{
  "telegram_user_id": 1000089271,
  "photos": [
    "https://api.telegram.org/file/bot.../photo1.jpg",
    "https://api.telegram.org/file/bot.../photo2.jpg"
  ],
  "google_maps_url": "https://maps.google.com/?q=6.9271,79.8612",
  "description": "2BR villa near beach, $800/month, WiFi, Pool",
  "notes": "Saw on the street, looks nice"
}
```

**Обработка:**
```javascript
// 1. Проверить/создать арендатора
const tenant = await ensureTenantExists(telegram_user_id);

// 2. Парсинг Google Maps URL
const { lat, lng } = parseGoogleMapsUrl(google_maps_url);

// 3. AI обработка описания (опционально)
const parsed = await parseWithAI(description);

// 4. Скачать и сохранить фото в Supabase Storage
const photoUrls = await downloadAndSavePhotos(photos, tenant.id);

// 5. Создать запись
const property = await supabase.from('saved_properties').insert({
  tenant_id: tenant.id,
  telegram_user_id: telegram_user_id,
  photos: photoUrls,
  latitude: lat,
  longitude: lng,
  description: description,
  notes: notes,
  ...parsed
});

// 6. Обновить счётчик
await supabase
  .from('tenants')
  .update({ saved_properties_count: tenant.saved_properties_count + 1 })
  .eq('id', tenant.id);
```

**Выход:**
```json
{
  "success": true,
  "property_id": "uuid-here",
  "map_url": "https://site.com/map/1000089271",
  "saved_count": 6
}
```

---

### 2. GET `/api/tenant/properties/{telegram_user_id}`

**Назначение:** Получить все сохранённые объекты арендатора

**Выход:**
```json
{
  "tenant": {
    "telegram_user_id": 1000089271,
    "username": "john_doe",
    "saved_properties_count": 5
  },
  "properties": [
    {
      "id": "uuid-1",
      "title": "2BR Villa Negombo",
      "latitude": 6.9271,
      "longitude": 79.8612,
      "price": 800,
      "photos": ["url1", "url2"],
      "description": "...",
      "notes": "Saw on the street",
      "created_at": "2026-01-29T10:00:00Z"
    }
  ]
}
```

---

## 🤖 TELEGRAM BOT - Псевдокод

```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Хранилище состояний пользователей
const userStates = {};

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Создать/получить арендатора
  let tenant = await getTenantByTelegramId(userId);
  
  if (!tenant) {
    tenant = await createTenant({
      telegram_user_id: userId,
      username: msg.from.username,
      first_name: msg.from.first_name,
      personal_map_url: `https://site.com/map/${userId}`
    });
    
    await bot.sendMessage(chatId, 
      `✅ Привет, ${tenant.first_name}! Твоя личная карта создана.`
    );
  }
  
  // Главное меню
  bot.sendMessage(chatId, 
    '📒 Твоя записная книжка недвижимости\n\nВыбери действие:', 
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '📤 Добавить объект', callback_data: 'add' },
          { text: '🗺️ Моя карта', url: tenant.personal_map_url }
        ]]
      }
    }
  );
});

// Обработка кнопки "Добавить"
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  
  if (query.data === 'add') {
    userStates[userId] = {
      action: 'adding_property',
      photos: [],
      text: ''
    };
    
    await bot.sendMessage(chatId,
      '📤 Отправь мне:\n' +
      '• 📷 Фото объекта\n' +
      '• 📍 Google Maps ссылку\n' +
      '• 💬 Описание (цена, комнаты, контакты)\n\n' +
      'Можно отправить всё сразу или по очереди.\n' +
      'Когда закончишь, нажми /done'
    );
  }
});

// Обработка сообщений (фото + текст)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Пропускаем команды
  if (msg.text && msg.text.startsWith('/')) {
    if (msg.text === '/done' && userStates[userId]?.action === 'adding_property') {
      await processAddProperty(userId, chatId);
    }
    return;
  }
  
  // Собираем данные
  if (userStates[userId]?.action === 'adding_property') {
    const state = userStates[userId];
    
    // Фото
    if (msg.photo) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const file = await bot.getFile(photoId);
      const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      state.photos.push(photoUrl);
      
      await bot.sendMessage(chatId, `✅ Фото добавлено (${state.photos.length})`);
    }
    
    // Текст
    if (msg.text || msg.caption) {
      state.text += (msg.text || msg.caption) + '\n';
    }
    
    // Автоматическая отправка если есть всё
    if (state.photos.length > 0 && state.text.includes('maps.google')) {
      await bot.sendMessage(chatId, 
        '✅ Данные получены!\n\n' +
        `📷 Фото: ${state.photos.length}\n` +
        `📝 Описание: есть\n` +
        `📍 Координаты: найдены\n\n` +
        'Сохраняю...'
      );
      
      await processAddProperty(userId, chatId);
    }
  }
});

// Функция обработки добавления объекта
async function processAddProperty(userId, chatId) {
  const state = userStates[userId];
  
  if (!state || state.action !== 'adding_property') return;
  
  try {
    // Отправка на API
    const response = await fetch('https://site.com/api/tenant/save-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegram_user_id: userId,
        photos: state.photos,
        google_maps_url: extractGoogleMapsUrl(state.text),
        description: state.text,
        notes: ''
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      await bot.sendMessage(chatId,
        '✅ Объект сохранён в твою коллекцию!\n\n' +
        `📊 Всего сохранено: ${result.saved_count}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🗺️ Открыть карту', url: result.map_url },
              { text: '📤 Добавить ещё', callback_data: 'add' }
            ]]
          }
        }
      );
    }
  } catch (error) {
    await bot.sendMessage(chatId, '❌ Ошибка сохранения. Попробуй ещё раз.');
  } finally {
    delete userStates[userId];
  }
}

// Вспомогательная функция
function extractGoogleMapsUrl(text) {
  const match = text.match(/https:\/\/maps\.google\.com\/[^\s]+/);
  return match ? match[0] : null;
}
```

---

## ✅ КЛЮЧЕВЫЕ МОМЕНТЫ

### 1. Это ЛИЧНЫЙ инструмент:
- ❌ НЕ публичная платформа
- ✅ Каждый арендатор видит ТОЛЬКО свои объекты
- ✅ "Записная книжка" для найденных объектов

### 2. Источник данных:
- Арендатор находит объекты САМ (улица, интернет, друзья)
- Фотографирует или копирует информацию
- Сохраняет через бота

### 3. Карта:
- Личная для каждого арендатора
- URL: `/map/{telegram_user_id}`
- Никто другой не имеет доступа

### 4. Интеграция с Import:
- Можно использовать существующий код парсинга
- Но данные идут в отдельную таблицу `saved_properties`
- А не в публичные объекты

---

## 🎯 ИТОГОВОЕ ПОНИМАНИЕ

```
АРЕНДАТОР ищет жильё
    ↓
Нашёл интересный объект
    ↓
Отправил в бота (фото + ссылка + описание)
    ↓
Бот сохранил в ЛИЧНУЮ коллекцию
    ↓
Объект появился на ЛИЧНОЙ карте арендатора
    ↓
Арендатор может:
  - Просматривать все сохранённые объекты
  - Редактировать заметки
  - Удалять ненужные
  - Фильтровать и сортировать
```

**Всё правильно?** ✅
