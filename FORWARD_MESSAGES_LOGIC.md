# 📨 ЛОГИКА ПЕРЕСЫЛКИ СООБЩЕНИЙ В БОТА

**Дата:** 2026-01-29  
**Обновление:** Добавлена поддержка forward сообщений

---

## 🎯 СЦЕНАРИЙ ИСПОЛЬЗОВАНИЯ

### Типичный flow арендатора:

```
Арендатор подписан на Telegram группы/каналы с недвижимостью
    ↓
Видит интересное объявление в группе
    ↓
ПЕРЕСЫЛАЕТ сообщение в бота (Forward)
    ↓
Бот сохраняет объект + информацию об источнике
    ↓
Объект появляется на личной карте арендатора
```

---

## 📱 КАК ЭТО РАБОТАЕТ

### Вариант 1: Пересылка из группы/канала

**Пример:**
```
Группа: @srilanka_housing
Сообщение:
  🏠 2BR Villa, Negombo
  💰 $800/month
  📍 https://maps.google.com/?q=6.9271,79.8612
  📷 [Фото]
  📞 +94 77 123 4567

Арендатор → Нажимает "Forward" → Выбирает бота
```

**Что получает бот:**
```javascript
{
  message_id: 12345,
  from: { 
    id: 1000089271, // ID арендатора
    username: "john_doe" 
  },
  forward_from: {
    id: 555666777, // ID автора оригинала
    username: "property_owner",
    first_name: "Peter"
  },
  forward_from_chat: {
    id: -1001234567890, // ID группы/канала
    title: "Sri Lanka Housing",
    username: "srilanka_housing",
    type: "supergroup"
  },
  forward_date: 1738150000,
  text: "🏠 2BR Villa...",
  photo: [...]
}
```

### Вариант 2: Пересылка из личной переписки

**Пример:**
```
Друг отправил арендатору:
  Смотри, нашёл хорошую виллу!
  https://maps.google.com/?q=6.9271,79.8612
  [Фото]

Арендатор → Forward в бота
```

**Что получает бот:**
```javascript
{
  forward_from: {
    id: 999888777, // ID друга
    username: "friend_username",
    first_name: "Alex"
  },
  // НЕТ forward_from_chat (личная переписка)
}
```

### Вариант 3: Пересылка из канала (анонимного)

**Особенность:** Если канал скрывает авторов, `forward_from` будет `null`

```javascript
{
  forward_from_chat: {
    id: -1001234567890,
    title: "Property Listings",
    username: "property_channel",
    type: "channel"
  },
  forward_from_message_id: 7890,
  // forward_from: null (анонимный канал)
}
```

---

## 💾 ЧТО СОХРАНЯТЬ

### Расширенная таблица `saved_properties`:

```sql
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Привязка к арендатору
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  
  -- Основная информация объекта
  title TEXT,
  description TEXT,
  notes TEXT,
  
  -- Местоположение
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  google_maps_url TEXT,
  
  -- Детали
  price DECIMAL(10, 2),
  bedrooms INT,
  photos TEXT[],
  amenities JSONB,
  contact_info TEXT,
  
  -- НОВОЕ: Метаданные пересылки (forward metadata)
  source_type TEXT, -- 'forward', 'direct', 'manual'
  
  -- Информация об оригинальном авторе
  forward_from_user_id BIGINT, -- ID автора оригинального сообщения
  forward_from_username TEXT,
  forward_from_first_name TEXT,
  forward_from_last_name TEXT,
  
  -- Информация о группе/канале (если было из группы)
  forward_from_chat_id BIGINT, -- ID группы/канала
  forward_from_chat_title TEXT, -- Название группы/канала
  forward_from_chat_username TEXT, -- @username группы/канала
  forward_from_chat_type TEXT, -- 'group', 'supergroup', 'channel'
  
  -- ID оригинального сообщения
  forward_from_message_id BIGINT,
  forward_date TIMESTAMPTZ,
  
  -- Ссылка на оригинальное сообщение (если возможно)
  original_message_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_saved_props_forward_from_user ON saved_properties(forward_from_user_id);
CREATE INDEX idx_saved_props_forward_from_chat ON saved_properties(forward_from_chat_id);
```

---

## 🤖 ОБРАБОТКА FORWARD В БОТЕ

### Код обработки:

```javascript
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Проверяем что это пересланное сообщение
  if (msg.forward_date) {
    await handleForwardedMessage(msg, userId, chatId);
    return;
  }
  
  // Обычная обработка...
});

async function handleForwardedMessage(msg, userId, chatId) {
  // Извлекаем метаданные пересылки
  const forwardMetadata = {
    source_type: 'forward',
    forward_date: new Date(msg.forward_date * 1000),
    
    // Автор оригинального сообщения
    forward_from_user_id: msg.forward_from?.id || null,
    forward_from_username: msg.forward_from?.username || null,
    forward_from_first_name: msg.forward_from?.first_name || null,
    forward_from_last_name: msg.forward_from?.last_name || null,
    
    // Группа/канал источника
    forward_from_chat_id: msg.forward_from_chat?.id || null,
    forward_from_chat_title: msg.forward_from_chat?.title || null,
    forward_from_chat_username: msg.forward_from_chat?.username || null,
    forward_from_chat_type: msg.forward_from_chat?.type || null,
    
    forward_from_message_id: msg.forward_from_message_id || null
  };
  
  // Создаём ссылку на оригинальное сообщение (если возможно)
  let originalMessageLink = null;
  if (msg.forward_from_chat?.username && msg.forward_from_message_id) {
    originalMessageLink = `https://t.me/${msg.forward_from_chat.username}/${msg.forward_from_message_id}`;
  }
  
  // Извлекаем данные объекта
  const photos = msg.photo ? [msg.photo[msg.photo.length - 1].file_id] : [];
  const text = msg.text || msg.caption || '';
  const googleMapsUrl = extractGoogleMapsUrl(text);
  
  // Отправляем на сохранение
  const response = await fetch('https://site.com/api/tenant/save-property', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: userId,
      photos: photos,
      google_maps_url: googleMapsUrl,
      description: text,
      original_message_link: originalMessageLink,
      ...forwardMetadata // Добавляем метаданные пересылки
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Формируем сообщение с информацией об источнике
    let sourceInfo = '📨 Сохранено из пересылки';
    
    if (forwardMetadata.forward_from_chat_title) {
      sourceInfo += `\n📢 Источник: ${forwardMetadata.forward_from_chat_title}`;
      if (forwardMetadata.forward_from_chat_username) {
        sourceInfo += ` (@${forwardMetadata.forward_from_chat_username})`;
      }
    }
    
    if (forwardMetadata.forward_from_first_name) {
      sourceInfo += `\n👤 Автор: ${forwardMetadata.forward_from_first_name}`;
      if (forwardMetadata.forward_from_username) {
        sourceInfo += ` (@${forwardMetadata.forward_from_username})`;
      }
    }
    
    if (originalMessageLink) {
      sourceInfo += `\n🔗 Оригинал: ${originalMessageLink}`;
    }
    
    await bot.sendMessage(chatId,
      `✅ Объект сохранён!\n\n${sourceInfo}\n\n📊 Всего сохранено: ${result.saved_count}`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🗺️ Открыть карту', url: result.map_url }
          ]]
        }
      }
    );
  }
}
```

---

## 🎨 ОТОБРАЖЕНИЕ НА КАРТЕ

### Popup с информацией об источнике:

```html
<!-- Popup на маркере -->
<div class="property-popup">
  <div class="photos-slider">
    <img src="photo1.jpg" />
  </div>
  
  <h3>2BR Villa, Negombo</h3>
  <p class="price">$800/month</p>
  <p class="description">...</p>
  
  <!-- НОВОЕ: Информация об источнике -->
  <div class="source-info">
    <div class="source-badge">
      <span class="icon">📨</span>
      <span>Из пересылки</span>
    </div>
    
    <div class="source-details">
      <p><strong>Источник:</strong> Sri Lanka Housing (@srilanka_housing)</p>
      <p><strong>Автор:</strong> Peter (@property_owner)</p>
      <p><strong>Дата:</strong> 29 янв 2026, 14:30</p>
      <a href="https://t.me/srilanka_housing/7890" target="_blank">
        🔗 Открыть оригинал
      </a>
    </div>
  </div>
  
  <div class="actions">
    <button>✏️ Редактировать</button>
    <button>🗑️ Удалить</button>
  </div>
</div>
```

---

## 📊 ПРЕИМУЩЕСТВА СОХРАНЕНИЯ МЕТАДАННЫХ

### 1. Отслеживание источников:
```sql
-- Самые популярные источники объектов
SELECT 
  forward_from_chat_title,
  forward_from_chat_username,
  COUNT(*) as properties_count
FROM saved_properties
WHERE forward_from_chat_id IS NOT NULL
GROUP BY forward_from_chat_id, forward_from_chat_title, forward_from_chat_username
ORDER BY properties_count DESC
LIMIT 10;

-- Результат:
-- Sri Lanka Housing (@srilanka_housing) - 45 объектов
-- Negombo Properties (@negombo_props) - 32 объекта
-- ...
```

### 2. Связь с авторами:
```sql
-- Объекты от конкретного автора
SELECT *
FROM saved_properties
WHERE forward_from_user_id = 555666777;
```

### 3. Возврат к оригиналу:
- Пользователь может кликнуть на ссылку и вернуться к оригинальному сообщению
- Написать автору напрямую
- Увидеть комментарии в группе

### 4. Аналитика:
- Какие группы/каналы самые полезные
- От каких авторов больше всего объектов
- Динамика сохранений по источникам

---

## 🔒 ПРИВАТНОСТЬ И ОГРАНИЧЕНИЯ

### Когда метаданные НЕ доступны:

1. **Анонимные каналы:**
   ```javascript
   // forward_from будет null
   // Доступно только forward_from_chat
   ```

2. **Настройки приватности:**
   ```javascript
   // Если пользователь запретил пересылку
   // forward_from будет null
   // Но forward_from_chat может быть доступен
   ```

3. **Старые сообщения:**
   ```javascript
   // Некоторые данные могут быть недоступны
   // для старых forwards
   ```

### Что делать если данных нет:

```javascript
const sourceInfo = {
  source_type: 'forward',
  forward_from_user_id: msg.forward_from?.id || null,
  forward_from_username: msg.forward_from?.username || 'Скрыт настройками приватности',
  forward_from_chat_title: msg.forward_from_chat?.title || 'Неизвестный источник'
};
```

---

## ✅ ИТОГОВЫЙ FLOW

### Сценарий 1: Пересылка из группы

```
Арендатор видит объявление в группе @srilanka_housing
    ↓
Forward → Бот
    ↓
Бот сохраняет:
  - Объект (фото, описание, координаты)
  - Источник: "Sri Lanka Housing"
  - Автор: "Peter (@property_owner)"
  - Ссылка на оригинал: https://t.me/srilanka_housing/7890
    ↓
Показывает на карте с информацией об источнике
    ↓
Арендатор может вернуться к оригиналу одним кликом
```

### Сценарий 2: Пересылка от друга

```
Друг отправил арендатору ссылку на виллу
    ↓
Forward → Бот
    ↓
Бот сохраняет:
  - Объект
  - Автор: "Alex (@friend_username)"
  - Источник: "Личная переписка"
    ↓
Показывает на карте с пометкой "От Alex"
```

### Сценарий 3: Прямая отправка (без forward)

```
Арендатор сам нашёл объект
    ↓
Отправляет напрямую в бота (фото + текст)
    ↓
Бот сохраняет:
  - Объект
  - Источник: "Добавлено вручную"
    ↓
Показывает на карте без метаданных источника
```

---

## 🎯 РЕЗЮМЕ

### Ключевые изменения:

✅ **Поддержка forward сообщений**  
✅ **Сохранение ID автора оригинала**  
✅ **Сохранение информации о группе/канале**  
✅ **Ссылка на оригинальное сообщение**  
✅ **Отображение источника на карте**  
✅ **Аналитика по источникам**

### Типы источников:

1. **Forward из группы/канала** - самый частый случай
2. **Forward из личной переписки** - от друзей/знакомых
3. **Прямая отправка** - арендатор нашёл сам

---

**Всё правильно понял?** ✅
