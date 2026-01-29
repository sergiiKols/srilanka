# 🛠️ ОБРАБОТКА ОШИБОК И МНОЖЕСТВЕННЫЕ ФОТО

**Дата:** 2026-01-29  
**Улучшения:** Множественные фото-сообщения + исправление ошибок

---

## 🎯 ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ

### 1. Множественные фото-сообщения
Пользователь может отправить фото несколькими способами:
- 3 фото одним сообщением (media group)
- 3 отдельных сообщения с 1 фото в каждом
- 2 фото + 1 фото + 3 фото = 6 фото всего

**Бот должен накапливать ВСЕ фото!**

### 2. Люди ошибаются
- Отправил не то фото → нужно удалить
- Отправил не ту ссылку → нужно заменить
- Опечатка в описании → нужно исправить
- Случайно отправил что-то не туда → нужно отменить

**Нужны функции редактирования!**

---

## 📷 МНОЖЕСТВЕННЫЕ ФОТО - РЕШЕНИЕ

### Концепция: Накопление всех фото

```javascript
class ObjectData {
  constructor(id) {
    this.id = id;
    this.photos = []; // МАССИВ - накапливаем все фото!
    this.googleMapsUrl = null;
    this.description = null;
  }
  
  addPhoto(photoUrl) {
    this.photos.push(photoUrl);
    // Лимит фото (опционально)
    if (this.photos.length > 10) {
      return { error: 'Максимум 10 фото на объект!' };
    }
    return { success: true, count: this.photos.length };
  }
  
  removePhoto(index) {
    if (index >= 0 && index < this.photos.length) {
      this.photos.splice(index, 1);
      return { success: true, count: this.photos.length };
    }
    return { error: 'Фото не найдено!' };
  }
  
  clearPhotos() {
    this.photos = [];
    return { success: true };
  }
}
```

---

### Обработка множественных сообщений с фото:

```javascript
bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const session = userSessions[userId];
  
  if (!session) return;
  
  // ФОТО - накапливаем
  if (msg.photo) {
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(photoId);
    const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    
    const result = session.currentObject.addPhoto(photoUrl);
    
    if (result.error) {
      await bot.sendMessage(msg.chat.id, `❌ ${result.error}`);
      return;
    }
    
    // Подтверждение
    await bot.sendMessage(msg.chat.id,
      `✅ Фото добавлено!\n📷 Всего фото: ${result.count}`
    );
    
    // Обновляем статус
    await updateStatusMessage(bot, session);
  }
});
```

### Сценарии использования:

**Сценарий 1: Несколько отдельных сообщений**
```
[Арендатор] отправляет фото #1
[Бот] ✅ Фото добавлено! Всего: 1

[Арендатор] отправляет фото #2
[Бот] ✅ Фото добавлено! Всего: 2

[Арендатор] отправляет фото #3
[Бот] ✅ Фото добавлено! Всего: 3

Статус: ✅ Фото (3)
```

**Сценарий 2: Media group (все сразу)**
```
[Арендатор] выбирает 5 фото → Отправить
[Бот] получает 5 сообщений с media_group_id

[Бот] ✅ Фото добавлено! Всего: 1
[Бот] ✅ Фото добавлено! Всего: 2
[Бот] ✅ Фото добавлено! Всего: 3
[Бот] ✅ Фото добавлено! Всего: 4
[Бот] ✅ Фото добавлено! Всего: 5

Статус: ✅ Фото (5)
```

**Сценарий 3: Комбинированный**
```
[Арендатор] отправляет 2 фото media group
[Бот] Всего: 2

[Арендатор] отправляет 1 фото отдельно
[Бот] Всего: 3

[Арендатор] отправляет 3 фото media group
[Бот] Всего: 6

Статус: ✅ Фото (6)
```

---

## 🛠️ ИСПРАВЛЕНИЕ ОШИБОК - РЕШЕНИЕ

### Добавляем кнопки редактирования:

```
📤 Добавление объекта #1

📊 Статус:
✅ Фото (3)
✅ Google Maps ссылка
✅ Описание объекта

🎉 Объект готов к сохранению!

[✅ Сохранить] [➕ Ещё объект] [❌ Отмена]
[✏️ Редактировать]  ← НОВАЯ КНОПКА!
```

### При нажатии "Редактировать":

```
✏️ Что хочешь изменить?

📷 Фото: 3 шт.
📍 Google Maps: 6.9271, 79.8612
📝 Описание: 2BR villa, $800/month...

[📷 Изменить фото] [📍 Изменить карту] [📝 Изменить описание]
[🔙 Назад]
```

---

### Редактирование фото:

```javascript
// Callback: edit_photos
bot.on('callback_query', async (query) => {
  if (query.data === 'edit_photos') {
    const userId = query.from.id;
    const session = userSessions[userId];
    
    if (!session || session.currentObject.photos.length === 0) {
      await bot.answerCallbackQuery(query.id, {
        text: '⚠️ Нет фото для редактирования',
        show_alert: true
      });
      return;
    }
    
    // Показываем все фото с кнопками удаления
    const photos = session.currentObject.photos;
    
    for (let i = 0; i < photos.length; i++) {
      await bot.sendPhoto(query.message.chat.id, photos[i], {
        caption: `📷 Фото ${i + 1} из ${photos.length}`,
        reply_markup: {
          inline_keyboard: [[
            { 
              text: '🗑️ Удалить это фото', 
              callback_data: `delete_photo_${i}` 
            }
          ]]
        }
      });
    }
    
    await bot.sendMessage(query.message.chat.id,
      'Выбери фото для удаления или добавь новые.\n\n' +
      '[➕ Добавить фото] [✅ Готово]',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Готово', callback_data: 'edit_done' },
            { text: '🗑️ Удалить все', callback_data: 'delete_all_photos' }
          ]]
        }
      }
    );
  }
  
  // Удаление конкретного фото
  if (query.data.startsWith('delete_photo_')) {
    const userId = query.from.id;
    const session = userSessions[userId];
    const index = parseInt(query.data.split('_')[2]);
    
    const result = session.currentObject.removePhoto(index);
    
    if (result.success) {
      await bot.answerCallbackQuery(query.id, {
        text: `✅ Фото удалено! Осталось: ${result.count}`
      });
      
      // Удаляем сообщение с фото
      await bot.deleteMessage(query.message.chat.id, query.message.message_id);
      
      // Обновляем статус
      await updateStatusMessage(bot, session);
    }
  }
  
  // Удаление всех фото
  if (query.data === 'delete_all_photos') {
    const userId = query.from.id;
    const session = userSessions[userId];
    
    session.currentObject.clearPhotos();
    
    await bot.answerCallbackQuery(query.id, {
      text: '🗑️ Все фото удалены'
    });
    
    await updateStatusMessage(bot, session);
  }
});
```

---

### Редактирование Google Maps:

```javascript
if (query.data === 'edit_google_maps') {
  const userId = query.from.id;
  const session = userSessions[userId];
  
  // Режим замены
  session.editMode = 'google_maps';
  
  await bot.sendMessage(query.message.chat.id,
    '📍 Отправь новую ссылку Google Maps.\n\n' +
    `Текущая: ${session.currentObject.googleMapsUrl}\n\n` +
    '[❌ Отменить]',
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '❌ Отменить', callback_data: 'cancel_edit' }
        ]]
      }
    }
  );
}

// Обработка нового Google Maps в режиме редактирования
bot.on('message', async (msg) => {
  const session = userSessions[msg.from.id];
  
  if (session?.editMode === 'google_maps' && msg.text) {
    const url = extractGoogleMapsUrl(msg.text);
    
    if (url) {
      const oldUrl = session.currentObject.googleMapsUrl;
      session.currentObject.googleMapsUrl = url;
      session.editMode = null;
      
      await bot.sendMessage(msg.chat.id,
        `✅ Google Maps обновлён!\n\n` +
        `Старый: ${oldUrl}\n` +
        `Новый: ${url}`
      );
      
      await updateStatusMessage(bot, session);
    } else {
      await bot.sendMessage(msg.chat.id,
        '❌ Это не ссылка Google Maps! Попробуй ещё раз.'
      );
    }
  }
});
```

---

### Редактирование описания:

```javascript
if (query.data === 'edit_description') {
  const userId = query.from.id;
  const session = userSessions[userId];
  
  session.editMode = 'description';
  
  await bot.sendMessage(query.message.chat.id,
    '📝 Отправь новое описание объекта.\n\n' +
    `Текущее:\n"${session.currentObject.description}"\n\n` +
    '[❌ Отменить]',
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '❌ Отменить', callback_data: 'cancel_edit' },
          { text: '➕ Дополнить', callback_data: 'append_description' }
        ]]
      }
    }
  );
}

bot.on('message', async (msg) => {
  const session = userSessions[msg.from.id];
  
  if (session?.editMode === 'description' && msg.text) {
    const oldDescription = session.currentObject.description;
    session.currentObject.description = msg.text;
    session.editMode = null;
    
    await bot.sendMessage(msg.chat.id,
      `✅ Описание обновлено!\n\n` +
      `Старое: "${oldDescription.substring(0, 50)}..."\n` +
      `Новое: "${msg.text.substring(0, 50)}..."`
    );
    
    await updateStatusMessage(bot, session);
  }
  
  // Режим дополнения (не замены)
  if (session?.editMode === 'append_description' && msg.text) {
    session.currentObject.description += '\n' + msg.text;
    session.editMode = null;
    
    await bot.sendMessage(msg.chat.id,
      `✅ Описание дополнено!`
    );
    
    await updateStatusMessage(bot, session);
  }
});
```

---

## 🎨 ПОЛНЫЙ UI С РЕДАКТИРОВАНИЕМ

### Главное меню статуса:

```
📤 Добавление объекта #1

📊 Статус:
✅ Фото (5)
✅ Google Maps ссылка
✅ Описание объекта

🎉 Объект готов к сохранению!

Действия:
[✅ Сохранить]  [➕ Ещё объект]  [❌ Отмена]
[✏️ Редактировать]  [👁️ Предпросмотр]
```

### Меню редактирования:

```
✏️ Редактирование объекта #1

Что изменить?

[📷 Фото (5)]  [📍 Google Maps]  [📝 Описание]
[🗑️ Удалить объект]  [🔙 Назад]
```

### Редактирование фото:

```
📷 Управление фото

Текущие фото: 5 шт.

[Фото 1] 🗑️
[Фото 2] 🗑️
[Фото 3] 🗑️
[Фото 4] 🗑️
[Фото 5] 🗑️

Действия:
[➕ Добавить ещё]  [🗑️ Удалить все]  [✅ Готово]
```

---

## 🚨 ОБРАБОТКА ЧАСТЫХ ОШИБОК

### Ошибка 1: Случайно отправил не в ту сессию

```javascript
// Подтверждение перед добавлением
bot.on('message', async (msg) => {
  const session = userSessions[msg.from.id];
  
  if (!session) {
    // Нет активной сессии
    if (msg.photo || msg.text) {
      await bot.sendMessage(msg.chat.id,
        '⚠️ У тебя нет активной сессии добавления.\n\n' +
        'Хочешь начать добавление объекта?',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Да, добавить', callback_data: 'add_property' },
              { text: '❌ Нет', callback_data: 'ignore' }
            ]]
          }
        }
      );
    }
    return;
  }
  
  // Есть сессия - добавляем как обычно
});
```

### Ошибка 2: Отправил фото не того объекта

```javascript
// Показываем превью после каждого фото
if (msg.photo) {
  const result = session.currentObject.addPhoto(photoUrl);
  
  await bot.sendPhoto(msg.chat.id, photoUrl, {
    caption: 
      `✅ Фото добавлено к объекту #${session.currentObject.id}\n` +
      `📷 Всего: ${result.count}\n\n` +
      'Это правильное фото?',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Да', callback_data: 'confirm_photo' },
        { text: '🗑️ Удалить', callback_data: `delete_photo_${result.count - 1}` }
      ]]
    }
  });
}
```

### Ошибка 3: Неправильный формат Google Maps

```javascript
if (msg.text) {
  const url = extractGoogleMapsUrl(msg.text);
  
  if (url) {
    // Валидация
    const coords = parseGoogleMapsUrl(url);
    
    if (!coords) {
      await bot.sendMessage(msg.chat.id,
        '❌ Не могу извлечь координаты из этой ссылки!\n\n' +
        'Отправь ссылку в формате:\n' +
        'https://maps.google.com/?q=6.9271,79.8612\n\n' +
        'или\n' +
        'https://www.google.com/maps/@6.9271,79.8612,15z'
      );
      return;
    }
    
    // Подтверждение координат
    await bot.sendMessage(msg.chat.id,
      `✅ Google Maps добавлен!\n\n` +
      `📍 Координаты: ${coords.lat}, ${coords.lng}\n\n` +
      'Это правильное место?',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Да', callback_data: 'confirm_maps' },
            { text: '✏️ Изменить', callback_data: 'edit_google_maps' }
          ]]
        }
      }
    );
  }
}
```

### Ошибка 4: Длинное описание с опечатками

```javascript
if (msg.text && !extractGoogleMapsUrl(msg.text)) {
  // Проверка длины
  if (msg.text.length < 10) {
    await bot.sendMessage(msg.chat.id,
      '⚠️ Описание слишком короткое!\n' +
      'Добавь больше деталей (минимум 10 символов).'
    );
    return;
  }
  
  if (msg.text.length > 1000) {
    await bot.sendMessage(msg.chat.id,
      '⚠️ Описание слишком длинное!\n' +
      'Максимум 1000 символов. Сократи текст.'
    );
    return;
  }
  
  // Добавляем описание с подтверждением
  session.currentObject.description = msg.text;
  
  await bot.sendMessage(msg.chat.id,
    `✅ Описание добавлено!\n\n` +
    `📝 "${msg.text}"\n\n` +
    'Всё верно?',
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Да', callback_data: 'confirm_description' },
          { text: '✏️ Исправить', callback_data: 'edit_description' },
          { text: '➕ Дополнить', callback_data: 'append_description' }
        ]]
      }
    }
  );
}
```

---

## 🔄 ОТМЕНА И ВОЗВРАТ

### Кнопка "Отмена" на каждом этапе:

```javascript
if (query.data === 'cancel_adding') {
  const userId = query.from.id;
  const session = userSessions[userId];
  
  if (!session) return;
  
  // Подтверждение отмены
  const hasData = 
    session.currentObject.photos.length > 0 ||
    session.currentObject.googleMapsUrl ||
    session.currentObject.description;
  
  if (hasData) {
    await bot.sendMessage(query.message.chat.id,
      '⚠️ У тебя есть несохранённые данные!\n\n' +
      'Точно хочешь отменить?',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Да, отменить', callback_data: 'confirm_cancel' },
            { text: '❌ Нет, вернуться', callback_data: 'back_to_adding' }
          ]]
        }
      }
    );
  } else {
    delete userSessions[userId];
    await bot.sendMessage(query.message.chat.id, '❌ Добавление отменено.');
  }
}

if (query.data === 'confirm_cancel') {
  delete userSessions[query.from.id];
  await bot.sendMessage(query.message.chat.id,
    '❌ Добавление отменено.\n' +
    'Все несохранённые данные удалены.'
  );
}
```

---

## 📊 ПРЕДПРОСМОТР ОБЪЕКТА

### Кнопка "Предпросмотр":

```javascript
if (query.data === 'preview_object') {
  const session = userSessions[query.from.id];
  const obj = session.currentObject;
  
  // Отправляем все фото
  if (obj.photos.length > 0) {
    if (obj.photos.length === 1) {
      await bot.sendPhoto(query.message.chat.id, obj.photos[0]);
    } else {
      // Media group для нескольких фото
      const media = obj.photos.map((url, i) => ({
        type: 'photo',
        media: url,
        caption: i === 0 ? `Фото объекта #${obj.id}` : undefined
      }));
      await bot.sendMediaGroup(query.message.chat.id, media);
    }
  }
  
  // Отправляем описание и координаты
  const coords = parseGoogleMapsUrl(obj.googleMapsUrl);
  
  await bot.sendMessage(query.message.chat.id,
    `👁️ Предпросмотр объекта #${obj.id}\n\n` +
    `📷 Фото: ${obj.photos.length} шт.\n` +
    `📍 Координаты: ${coords?.lat}, ${coords?.lng}\n` +
    `🔗 ${obj.googleMapsUrl}\n\n` +
    `📝 Описание:\n${obj.description}\n\n` +
    'Всё правильно?',
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Да, сохранить', callback_data: 'save_objects' },
          { text: '✏️ Редактировать', callback_data: 'show_edit_menu' }
        ]]
      }
    }
  );
}
```

---

## ✅ ИТОГОВЫЕ ВОЗМОЖНОСТИ

### Множественные фото:
✅ Отправка по одному фото несколькими сообщениями  
✅ Отправка группами (media group)  
✅ Комбинированная отправка  
✅ Накопление всех фото в массиве  
✅ Лимит фото (например 10 макс)

### Исправление ошибок:
✅ Удаление отдельных фото  
✅ Удаление всех фото  
✅ Замена Google Maps ссылки  
✅ Замена описания  
✅ Дополнение описания  
✅ Предпросмотр перед сохранением  
✅ Подтверждение важных действий  
✅ Отмена добавления с предупреждением

### Защита от ошибок:
✅ Валидация Google Maps URL  
✅ Проверка длины описания  
✅ Подтверждение после каждого шага  
✅ Возможность отмены в любой момент  
✅ Сохранение несохранённых данных при ошибке

---

**Всё учтено? Готов к реализации?** 🚀
