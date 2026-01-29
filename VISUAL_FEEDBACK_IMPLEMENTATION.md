# 📊 ВИЗУАЛЬНАЯ ОБРАТНАЯ СВЯЗЬ ДЛЯ АРЕНДАТОРА

**Дата:** 2026-01-29  
**Решение:** Показывать статус 3 обязательных сущностей для каждого объекта

---

## 🎯 ТРЕБОВАНИЕ

Бот должен отслеживать и показывать арендатору статус **3 обязательных сущностей**:

1. **📷 Фото** (минимум 1, можно несколько)
2. **📍 Google Maps ссылка** (координаты объекта)
3. **📝 Описание объекта** (текст с деталями)

---

## 📱 ВИЗУАЛЬНОЕ ПРЕДСТАВЛЕНИЕ

### Вариант 1: Обновляемое сообщение (РЕКОМЕНДУЮ) ⭐⭐⭐

**Как выглядит:**

```
📤 Добавление объекта #1

📊 Статус:
⬜ Фото (0)
⬜ Google Maps ссылка
⬜ Описание объекта

Отправь необходимые данные.

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
```

**После отправки фото:**
```
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)             ← ОБНОВИЛОСЬ
⬜ Google Maps ссылка
⬜ Описание объекта

Отправь ещё: Google Maps ссылку и описание.

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
```

**После отправки Google Maps:**
```
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)
✅ Google Maps ссылка   ← ОБНОВИЛОСЬ
⬜ Описание объекта

Отправь ещё: описание объекта.

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
```

**После отправки описания:**
```
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)
✅ Google Maps ссылка
✅ Описание объекта     ← ВСЁ ГОТОВО!

🎉 Объект готов к сохранению!

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
```

---

### Вариант 2: Новое сообщение после каждого действия

**Как выглядит:**

```
[Арендатор отправляет 2 фото]
    ↓
Бот отвечает:
✅ Фото добавлено (2 шт.)

📊 Осталось добавить:
⬜ Google Maps ссылка
⬜ Описание объекта
```

```
[Арендатор отправляет Google Maps]
    ↓
Бот отвечает:
✅ Google Maps ссылка добавлена!
📍 Координаты: 6.9271, 79.8612

📊 Осталось добавить:
⬜ Описание объекта
```

```
[Арендатор отправляет текст]
    ↓
Бот отвечает:
✅ Описание добавлено!

🎉 Объект #1 готов к сохранению!
Нажми кнопку ниже.

[✅ Сохранить] [➕ Ещё объект]
```

---

## 💻 РЕАЛИЗАЦИЯ

### Структура данных сессии:

```javascript
class ObjectData {
  constructor(id) {
    this.id = id;
    this.photos = [];
    this.googleMapsUrl = null;
    this.description = null;
    this.createdAt = new Date();
  }
  
  // Проверка готовности
  isComplete() {
    return this.photos.length > 0 && 
           this.googleMapsUrl !== null && 
           this.description !== null;
  }
  
  // Статус для отображения
  getStatus() {
    return {
      photos: {
        complete: this.photos.length > 0,
        count: this.photos.length
      },
      googleMaps: {
        complete: this.googleMapsUrl !== null,
        url: this.googleMapsUrl
      },
      description: {
        complete: this.description !== null,
        text: this.description?.substring(0, 50) || null
      }
    };
  }
  
  // Что осталось добавить
  getMissingItems() {
    const missing = [];
    if (this.photos.length === 0) missing.push('📷 Фото');
    if (!this.googleMapsUrl) missing.push('📍 Google Maps ссылка');
    if (!this.description) missing.push('📝 Описание');
    return missing;
  }
}

class AddingSession {
  constructor(userId, chatId) {
    this.userId = userId;
    this.chatId = chatId;
    this.objects = [];
    this.currentObject = new ObjectData(1);
    this.statusMessageId = null; // ID сообщения со статусом
  }
  
  addPhoto(photoUrl) {
    this.currentObject.photos.push(photoUrl);
  }
  
  addGoogleMaps(url) {
    this.currentObject.googleMapsUrl = url;
  }
  
  addDescription(text) {
    this.currentObject.description = text;
  }
  
  startNextObject() {
    this.objects.push(this.currentObject);
    this.currentObject = new ObjectData(this.objects.length + 1);
    this.statusMessageId = null; // Сбросить ID для нового объекта
  }
}
```

---

### Вариант 1: Обновляемое сообщение (editMessageText)

```javascript
const userSessions = {};

// Функция создания/обновления статуса
async function updateStatusMessage(bot, session) {
  const status = session.currentObject.getStatus();
  const missing = session.currentObject.getMissingItems();
  
  // Формируем текст
  let text = `📤 Добавление объекта #${session.currentObject.id}\n\n`;
  text += `📊 Статус:\n`;
  text += `${status.photos.complete ? '✅' : '⬜'} Фото (${status.photos.count})\n`;
  text += `${status.googleMaps.complete ? '✅' : '⬜'} Google Maps ссылка\n`;
  text += `${status.description.complete ? '✅' : '⬜'} Описание объекта\n\n`;
  
  if (session.currentObject.isComplete()) {
    text += `🎉 Объект готов к сохранению!`;
  } else {
    text += `Осталось добавить:\n${missing.join('\n')}`;
  }
  
  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Сохранить', callback_data: 'save_objects' },
      { text: '➕ Ещё объект', callback_data: 'next_object' },
      { text: '❌ Отмена', callback_data: 'cancel_adding' }
    ]]
  };
  
  // Создать или обновить сообщение
  if (!session.statusMessageId) {
    // Первый раз - создаём новое сообщение
    const msg = await bot.sendMessage(session.chatId, text, {
      reply_markup: keyboard
    });
    session.statusMessageId = msg.message_id;
  } else {
    // Обновляем существующее сообщение
    try {
      await bot.editMessageText(text, {
        chat_id: session.chatId,
        message_id: session.statusMessageId,
        reply_markup: keyboard
      });
    } catch (error) {
      // Если не удалось обновить (например сообщение устарело)
      // Создаём новое
      const msg = await bot.sendMessage(session.chatId, text, {
        reply_markup: keyboard
      });
      session.statusMessageId = msg.message_id;
    }
  }
}

// Обработка начала добавления
bot.on('callback_query', async (query) => {
  if (query.data === 'add_property') {
    const userId = query.from.id;
    const chatId = query.message.chat.id;
    
    // Создаём сессию
    const session = new AddingSession(userId, chatId);
    userSessions[userId] = session;
    
    // Показываем начальный статус
    await updateStatusMessage(bot, session);
  }
  
  if (query.data === 'next_object') {
    const userId = query.from.id;
    const session = userSessions[userId];
    
    if (!session) return;
    
    // Проверяем что текущий объект заполнен
    if (!session.currentObject.isComplete()) {
      await bot.answerCallbackQuery(query.id, {
        text: '⚠️ Заполни все поля текущего объекта!',
        show_alert: true
      });
      return;
    }
    
    // Переходим к следующему объекту
    session.startNextObject();
    await updateStatusMessage(bot, session);
  }
  
  if (query.data === 'save_objects') {
    const userId = query.from.id;
    const session = userSessions[userId];
    
    if (!session) return;
    
    // Проверяем что есть хотя бы один завершённый объект
    const allObjects = [...session.objects];
    if (session.currentObject.isComplete()) {
      allObjects.push(session.currentObject);
    }
    
    if (allObjects.length === 0) {
      await bot.answerCallbackQuery(query.id, {
        text: '⚠️ Нет готовых объектов для сохранения!',
        show_alert: true
      });
      return;
    }
    
    // Сохраняем все объекты
    let saved = 0;
    for (const obj of allObjects) {
      const result = await savePropertyToAPI(userId, obj);
      if (result.success) saved++;
    }
    
    // Итоговое сообщение
    await bot.sendMessage(session.chatId,
      `✅ Сохранено объектов: ${saved} из ${allObjects.length}\n\n` +
      allObjects.map((o, i) => 
        `${i+1}. ${o.description?.substring(0, 40) || 'Объект'} (${o.photos.length} фото)`
      ).join('\n'),
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🗺️ Открыть карту', url: getMapUrl(userId) },
            { text: '📤 Добавить ещё', callback_data: 'add_property' }
          ]]
        }
      }
    );
    
    // Очистка сессии
    delete userSessions[userId];
  }
  
  if (query.data === 'cancel_adding') {
    const userId = query.from.id;
    delete userSessions[userId];
    
    await bot.sendMessage(query.message.chat.id, '❌ Добавление отменено.');
  }
});

// Обработка входящих сообщений
bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const session = userSessions[userId];
  
  // Пропускаем если нет активной сессии
  if (!session) return;
  
  // Обработка фото
  if (msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(photoId);
    const photoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    
    session.addPhoto(photoUrl);
    
    // Отправляем подтверждение
    await bot.sendMessage(chatId, `✅ Фото добавлено (${session.currentObject.photos.length})`);
    
    // Обновляем статус
    await updateStatusMessage(bot, session);
  }
  
  // Обработка текста
  if (msg.text) {
    const googleMapsUrl = extractGoogleMapsUrl(msg.text);
    
    if (googleMapsUrl) {
      // Это Google Maps ссылка
      session.addGoogleMaps(googleMapsUrl);
      
      // Парсим координаты
      const coords = parseGoogleMapsUrl(googleMapsUrl);
      
      await bot.sendMessage(chatId,
        `✅ Google Maps добавлен!\n📍 Координаты: ${coords.lat}, ${coords.lng}`
      );
    } else {
      // Это описание объекта
      session.addDescription(msg.text);
      
      await bot.sendMessage(chatId,
        `✅ Описание добавлено!\n📝 "${msg.text.substring(0, 50)}..."`
      );
    }
    
    // Обновляем статус
    await updateStatusMessage(bot, session);
  }
  
  // Обработка медиа-групп (несколько фото сразу)
  if (msg.media_group_id) {
    // Обрабатываем как обычное фото (выше)
    // Telegram отправит каждое фото отдельным сообщением
  }
});

// Вспомогательные функции
function extractGoogleMapsUrl(text) {
  const patterns = [
    /https?:\/\/maps\.google\.com\/\?q=[^&\s]+/,
    /https?:\/\/www\.google\.com\/maps\/[^\s]+/,
    /https?:\/\/goo\.gl\/maps\/[^\s]+/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function parseGoogleMapsUrl(url) {
  // Парсинг координат из Google Maps URL
  // Пример: https://maps.google.com/?q=6.9271,79.8612
  
  let match = url.match(/q=([-\d.]+),([-\d.]+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  
  // Другие форматы...
  match = url.match(/@([-\d.]+),([-\d.]+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  
  return null;
}

async function savePropertyToAPI(userId, objectData) {
  const response = await fetch('https://site.com/api/tenant/save-property', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegram_user_id: userId,
      photos: objectData.photos,
      google_maps_url: objectData.googleMapsUrl,
      description: objectData.description
    })
  });
  
  return await response.json();
}

function getMapUrl(userId) {
  return `https://srilanka-37u2.vercel.app/map/${userId}`;
}
```

---

### Вариант 2: Отдельные сообщения (проще)

```javascript
// Обработка сообщений
bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const session = userSessions[userId];
  
  if (!session) return;
  
  // Фото
  if (msg.photo) {
    const photoUrl = await getPhotoUrl(msg.photo);
    session.addPhoto(photoUrl);
    
    const missing = session.currentObject.getMissingItems();
    
    let response = `✅ Фото добавлено (${session.currentObject.photos.length} шт.)\n\n`;
    
    if (missing.length > 0) {
      response += `📊 Осталось добавить:\n${missing.join('\n')}`;
    } else {
      response += `🎉 Объект #${session.currentObject.id} готов!`;
    }
    
    await bot.sendMessage(chatId, response);
  }
  
  // Google Maps
  if (msg.text && extractGoogleMapsUrl(msg.text)) {
    const url = extractGoogleMapsUrl(msg.text);
    const coords = parseGoogleMapsUrl(url);
    
    session.addGoogleMaps(url);
    
    const missing = session.currentObject.getMissingItems();
    
    let response = `✅ Google Maps добавлен!\n📍 ${coords.lat}, ${coords.lng}\n\n`;
    
    if (missing.length > 0) {
      response += `📊 Осталось добавить:\n${missing.join('\n')}`;
    } else {
      response += `🎉 Объект #${session.currentObject.id} готов!`;
    }
    
    await bot.sendMessage(chatId, response);
  }
  
  // Описание
  if (msg.text && !extractGoogleMapsUrl(msg.text)) {
    session.addDescription(msg.text);
    
    const missing = session.currentObject.getMissingItems();
    
    let response = `✅ Описание добавлено!\n📝 "${msg.text.substring(0, 50)}..."\n\n`;
    
    if (missing.length > 0) {
      response += `📊 Осталось добавить:\n${missing.join('\n')}`;
    } else {
      response += `🎉 Объект #${session.currentObject.id} готов!\nНажми кнопку ниже.`;
    }
    
    await bot.sendMessage(chatId, response);
  }
});
```

---

## 📱 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Сценарий 1: Последовательное добавление

```
[Арендатор] нажимает "📤 Добавить объект"

[Бот]
📤 Добавление объекта #1

📊 Статус:
⬜ Фото (0)
⬜ Google Maps ссылка
⬜ Описание объекта

Отправь необходимые данные.

---

[Арендатор] отправляет 2 фото

[Бот]
✅ Фото добавлено (2)

(Обновляет статус)
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)             ← ОБНОВИЛОСЬ
⬜ Google Maps ссылка
⬜ Описание объекта

Осталось добавить:
📍 Google Maps ссылка
📝 Описание объекта

---

[Арендатор] отправляет https://maps.google.com/?q=6.9271,79.8612

[Бот]
✅ Google Maps добавлен!
📍 Координаты: 6.9271, 79.8612

(Обновляет статус)
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)
✅ Google Maps ссылка   ← ОБНОВИЛОСЬ
⬜ Описание объекта

Осталось добавить:
📝 Описание объекта

---

[Арендатор] отправляет "2BR villa, $800/month, WiFi, Pool"

[Бот]
✅ Описание добавлено!
📝 "2BR villa, $800/month, WiFi, Pool"

(Обновляет статус)
📤 Добавление объекта #1

📊 Статус:
✅ Фото (2)
✅ Google Maps ссылка
✅ Описание объекта     ← ВСЁ ГОТОВО!

🎉 Объект готов к сохранению!

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
```

---

### Сценарий 2: Добавление 3 объектов подряд

```
[Объект #1]
Отправил: фото + Google Maps + описание
Статус: ✅✅✅
Нажал: "➕ Ещё объект"

[Объект #2]
Отправил: фото + Google Maps + описание
Статус: ✅✅✅
Нажал: "➕ Ещё объект"

[Объект #3]
Отправил: фото + Google Maps + описание
Статус: ✅✅✅
Нажал: "✅ Сохранить всё"

[Бот]
✅ Сохранено объектов: 3

1. 2BR villa, Negombo (2 фото)
2. 3BR house, Colombo (3 фото)
3. 1BR apartment, Galle (1 фото)

[🗺️ Открыть карту]
```

---

## ⚠️ ОБРАБОТКА ОШИБОК

### Попытка сохранить незавершённый объект:

```javascript
if (query.data === 'save_objects') {
  const session = userSessions[userId];
  
  // Проверяем текущий объект
  if (!session.currentObject.isComplete()) {
    await bot.answerCallbackQuery(query.id, {
      text: '⚠️ Текущий объект не завершён!\nЗаполни все поля или нажми "Отмена".',
      show_alert: true // Показать в popup
    });
    return;
  }
  
  // Сохранение...
}
```

### Попытка перейти к следующему объекту без заполнения текущего:

```javascript
if (query.data === 'next_object') {
  const session = userSessions[userId];
  
  if (!session.currentObject.isComplete()) {
    const missing = session.currentObject.getMissingItems();
    
    await bot.answerCallbackQuery(query.id, {
      text: `⚠️ Заполни текущий объект!\n\nНедостаёт:\n${missing.join('\n')}`,
      show_alert: true
    });
    return;
  }
  
  // Переход к следующему...
}
```

---

## 🎨 ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ

### 1. Прогресс-бар

```
📤 Добавление объекта #1

▓▓▓▓▓▓▓░░░ 66%

📊 Статус:
✅ Фото (2)
✅ Google Maps ссылка
⬜ Описание объекта
```

### 2. Валидация данных

```javascript
// Проверка Google Maps URL
if (!isValidGoogleMapsUrl(url)) {
  await bot.sendMessage(chatId,
    '❌ Неверная ссылка Google Maps!\n\n' +
    'Отправь ссылку в формате:\n' +
    'https://maps.google.com/?q=6.9271,79.8612'
  );
  return;
}

// Проверка минимальной длины описания
if (text.length < 10) {
  await bot.sendMessage(chatId,
    '⚠️ Описание слишком короткое!\nДобавь больше деталей (минимум 10 символов).'
  );
  return;
}
```

### 3. Предпросмотр объекта

```
🎉 Объект #1 готов!

📸 Фото: 2 шт.
📍 Координаты: 6.9271, 79.8612
📝 Описание: 2BR villa, $800/month, WiFi...

[✅ Сохранить] [✏️ Редактировать] [❌ Удалить]
```

---

## ✅ ИТОГО

### Ключевые особенности:

✅ **3 обязательные сущности:** Фото, Google Maps, Описание  
✅ **Визуальный статус:** ✅/⬜ для каждой сущности  
✅ **Обновляемое сообщение:** Один статус-блок на объект  
✅ **Подсказки:** "Осталось добавить: ..."  
✅ **Валидация:** Нельзя сохранить/перейти без заполнения всех полей  
✅ **Обратная связь:** Подтверждение после каждого действия

---

**Всё понятно? Начинать реализацию?** 🚀
