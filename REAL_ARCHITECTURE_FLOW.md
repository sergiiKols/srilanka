# 🎯 РЕАЛЬНАЯ АРХИТЕКТУРА СИСТЕМЫ

**Дата:** 25 января 2026  
**Статус:** ФИНАЛЬНОЕ ПОНИМАНИЕ

---

## 📋 ПРАВИЛЬНЫЙ FLOW СИСТЕМЫ

### Шаг 1: Клиент приходит в бот
```
1. Клиент → находит @UnmissableRentalsBot
2. Нажимает /start
3. Открывается WebApp (форма с сайта)
4. Заполняет форму:
   - Локация (где ищет)
   - Даты (когда нужно)
   - Бюджет
   - Тип жилья
   - Описание пожеланий
5. Нажимает "Отправить"
```

### Шаг 2: Автопостинг в Telegram группы
```
1. Форма сохраняется в БД
2. Генерируется текст объявления
3. Система выбирает аккаунт для постинга
   (из пула подключенных аккаунтов в админке)
4. Публикует объявление в целевые группы:
   - Bali Housing
   - Ubud Rentals
   - Digital Nomads Bali
   - И т.д.
5. Объявление содержит:
   - Запрос клиента
   - Контакт бота (для ответов)
```

### Шаг 3: Арендодатели отвечают
```
1. Собственники видят объявление в группе
2. Отвечают в личку аккаунту, который разместил
3. Присылают:
   - Фото объекта
   - Описание
   - Цену
   - Geo-локацию (короткая ссылка или координаты)
   - Контакт (Telegram username/phone)
```

### Шаг 4: Обработка на сайте
```
1. Сообщения от арендодателей поступают на сайт
2. Система обрабатывает:
   ✅ Разворачивает короткие geo-ссылки
   ✅ Загружает фото
   ✅ Парсит текст сообщения
   ✅ Извлекает цену, описание, контакты
   
3. Если информации не хватает:
   ✅ Система отправляет вопрос арендодателю
   ✅ От имени того же аккаунта
   ✅ "Уточните пожалуйста..."
   
4. Объект создается в БД (properties/offers)
5. Привязывается к запросу клиента (rental_task)
```

### Шаг 5: Объекты появляются на карте
```
1. Каждый обработанный объект → маркер на карте
2. Связаны с конкретным клиентом (его rental_task)
3. На карте показываются ТОЛЬКО объекты для этого клиента
```

### Шаг 6: Персональная карта клиента
```
1. В бот отправляется ссылка:
   "🗺️ Посмотреть объекты на карте"
   
2. Ссылка содержит:
   - ID клиента (user_id или telegram_id)
   - ID запроса (rental_task_id)
   
3. Карта открывается и показывает:
   - Описание запроса клиента (вверху)
   - Все объекты, присланные арендодателями
   - Радиус 20км от указанной локации
```

### Шаг 7: Клиент выбирает объект
```
1. Кликает на маркер
2. Видит:
   - Фото
   - Описание
   - Цену
   - Контакт арендодателя (Telegram или телефон)
   
3. Может:
   - Написать вопросы арендодателю
   - Позвонить
   - Договориться напрямую
```

---

## 🎯 КЛЮЧЕВОЕ ОТЛИЧИЕ ОТ ПРЕДЫДУЩЕГО ПОНИМАНИЯ

### Было неправильно:
```
❌ Карта загружает ВСЕ объекты из БД в радиусе 20км
❌ Клиент сам ищет на общей карте
```

### Правильно:
```
✅ Карта загружает ТОЛЬКО объекты, присланные 
   в ответ на КОНКРЕТНЫЙ запрос клиента
   
✅ Каждый клиент видит СВОЮ персональную карту
   с СВОИМИ ответами от арендодателей

✅ Радиус 20км используется для:
   - Фильтрации объектов (если арендодатель 
     прислал объект слишком далеко)
   - Возможности клиенту кликнуть на другую точку
     и увидеть, есть ли что-то рядом
```

---

## 🗄️ СТРУКТУРА БД (ПРАВИЛЬНАЯ)

### Таблица: rental_tasks
```sql
CREATE TABLE rental_tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_user_id BIGINT,
  
  -- Запрос клиента
  location TEXT,              -- "Ubud, Bali"
  location_lat DECIMAL(10,8), -- Для центра карты
  location_lng DECIMAL(11,8),
  check_in DATE,
  check_out DATE,
  budget_min INTEGER,
  budget_max INTEGER,
  property_type TEXT[],
  guests_count INTEGER,
  description TEXT,
  
  -- Метаданные
  status TEXT DEFAULT 'active', -- active, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Telegram аккаунт, который разместил объявление
  posted_by_account_id UUID REFERENCES telegram_accounts(id),
  posted_at TIMESTAMPTZ,
  
  -- Ссылка на персональную карту
  map_link TEXT
);
```

### Таблица: telegram_accounts
```sql
CREATE TABLE telegram_accounts (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  telegram_id BIGINT,
  username VARCHAR(100),
  
  -- API credentials (для Telegram Client API)
  api_id INTEGER,
  api_hash VARCHAR(100),
  session_string TEXT, -- Для авторизации
  
  -- Статус
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMPTZ,
  
  -- Для ротации аккаунтов
  posts_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Таблица: landlord_responses
```sql
CREATE TABLE landlord_responses (
  id UUID PRIMARY KEY,
  rental_task_id UUID REFERENCES rental_tasks(id),
  
  -- Сообщение от арендодателя
  telegram_message_id BIGINT,
  landlord_telegram_id BIGINT,
  landlord_username VARCHAR(100),
  
  -- Сырые данные
  raw_message TEXT,
  photos TEXT[], -- URLs фото
  geo_link TEXT, -- Короткая ссылка или coordinates
  
  -- Обработанные данные
  property_id UUID REFERENCES properties(id),
  parsed_at TIMESTAMPTZ,
  needs_clarification BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Таблица: properties (ОСТАЁТСЯ)
```sql
-- Та же структура, но объекты создаются 
-- из landlord_responses
```

### Таблица: offers (СВЯЗЬ)
```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  rental_task_id UUID REFERENCES rental_tasks(id),
  landlord_response_id UUID REFERENCES landlord_responses(id),
  
  -- Для быстрого доступа
  price INTEGER,
  available_from DATE,
  available_to DATE,
  
  -- Контакт арендодателя
  landlord_contact TEXT, -- Telegram username или телефон
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API ENDPOINTS (ОБНОВЛЁННЫЕ)

### 1. Клиент создаёт запрос
```
POST /api/rental-tasks
Body: {
  user: { telegram_id, username },
  location: "Ubud, Bali",
  check_in: "2026-02-01",
  check_out: "2026-03-01",
  budget: { min: 500, max: 2000 },
  property_type: ["villa", "apartment"],
  guests: 2,
  description: "..."
}

Returns: {
  task_id: "uuid",
  status: "posted",
  message: "Объявление размещено в 5 группах"
}
```

### 2. Арендодатель отвечает (webhook от Telegram)
```
POST /api/telegram/incoming-message
Body: {
  message_id: 12345,
  from: { id: 987654, username: "landlord123" },
  text: "I have a villa in Ubud...",
  photos: [...],
  location: { latitude: -8.5069, longitude: 115.2625 }
}

Система:
1. Определяет, к какому rental_task относится
2. Создаёт landlord_response
3. Парсит и создаёт property/offer
4. Если нужно - отправляет вопрос арендодателю
```

### 3. Получить персональную карту
```
GET /api/map/:rental_task_id?user_id=XXX

Returns: {
  task: {
    id, location, dates, budget, description
  },
  center: { lat, lng },
  radius_km: 20,
  offers: [
    {
      id, property_id,
      name, description, price,
      lat, lng,
      photos: [...],
      landlord_contact: "@landlord123"
    }
  ]
}
```

### 4. Клиент кликает на другую точку
```
POST /api/map/:rental_task_id/recenter
Body: { new_lat, new_lng }

Returns: {
  offers: [...] // В радиусе 20км от новой точки
}
```

---

## 🔄 WORKFLOW ПОДРОБНО

### A. Telegram Bot (инициация)
```python
# Клиент нажимает /start
@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    
    # Открываем WebApp с формой
    keyboard = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton(
        "🏠 Найти жильё",
        web_app=types.WebAppInfo(url=f"{SITE_URL}/rental-form")
    )
    keyboard.add(btn)
    
    bot.send_message(
        user_id,
        "Привет! Заполни форму и я размещу твой запрос",
        reply_markup=keyboard
    )
```

### B. WebApp форма
```typescript
// src/pages/rental-form.astro
const handleSubmit = async (formData) => {
  // Отправляем на сервер
  const task = await fetch('/api/rental-tasks', {
    method: 'POST',
    body: JSON.stringify(formData)
  }).then(r => r.json());
  
  // Закрываем WebApp
  Telegram.WebApp.close();
  
  // Сервер отправит уведомление в бот
};
```

### C. Автопостинг в группы
```typescript
// src/lib/telegram-poster.ts
export async function postToGroups(task: RentalTask) {
  // 1. Выбираем аккаунт для постинга
  const account = await selectAccountForPosting();
  
  // 2. Формируем текст
  const text = formatRentalRequest(task);
  
  // 3. Получаем список целевых групп
  const groups = await getTargetGroups(task.location);
  
  // 4. Постим в каждую группу
  for (const group of groups) {
    await telegramClient.sendMessage(group.id, text, {
      account: account
    });
  }
  
  // 5. Обновляем rental_task
  await db.update('rental_tasks', {
    posted_by_account_id: account.id,
    posted_at: new Date(),
    status: 'active'
  });
}
```

### D. Обработка ответов арендодателей
```typescript
// Webhook от Telegram Client API
export async function handleIncomingMessage(message: TelegramMessage) {
  // 1. Определяем, к какому rental_task относится
  const task = await findRelatedTask(message);
  
  if (!task) return; // Не наше сообщение
  
  // 2. Сохраняем ответ
  const response = await db.insert('landlord_responses', {
    rental_task_id: task.id,
    telegram_message_id: message.id,
    landlord_telegram_id: message.from.id,
    landlord_username: message.from.username,
    raw_message: message.text,
    photos: message.photos?.map(p => p.url),
    geo_link: extractGeoLink(message.text) || message.location
  });
  
  // 3. Парсим и создаём property
  const property = await parseAndCreateProperty(response);
  
  // 4. Если не хватает информации - запрашиваем
  if (!property.complete) {
    await askForClarification(task, response);
  }
  
  // 5. Создаём offer
  await db.insert('offers', {
    property_id: property.id,
    rental_task_id: task.id,
    landlord_response_id: response.id,
    landlord_contact: message.from.username
  });
  
  // 6. Уведомляем клиента
  await notifyClient(task, property);
}
```

### E. Отправка карты клиенту
```typescript
// Когда появляются новые объекты
export async function sendMapLinkToClient(task: RentalTask) {
  const mapUrl = `${SITE_URL}/map/${task.id}?user=${task.telegram_user_id}`;
  
  await bot.sendMessage(task.telegram_user_id, 
    `🗺️ Посмотри объекты на карте:\n${mapUrl}\n\n` +
    `Найдено объектов: ${task.offers_count}`
  );
}
```

---

Продолжить с оставшимися разделами?
