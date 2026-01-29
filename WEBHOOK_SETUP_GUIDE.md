# 🔧 НАСТРОЙКА И ТЕСТИРОВАНИЕ TELEGRAM WEBHOOK

**Дата:** 2026-01-29  
**Статус:** Готов к тестированию

---

## 📋 ЧТО НУЖНО

1. ✅ Telegram Bot Token: `7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8`
2. ⏳ URL сайта (Vercel deployment)
3. ⏳ Webhook URL: `https://your-site.vercel.app/api/telegram-webhook`

---

## 🚀 ШАГ 1: Деплой на Vercel

### Проверить что есть в `.env`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8

# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
GROQ_API_KEY=your_groq_key
PERPLEXITY_API_KEY=your_perplexity_key

# Site URL
PUBLIC_SITE_URL=https://your-site.vercel.app
```

### Деплой:
```bash
# Если используете Vercel
vercel --prod

# Или через git push (если настроен auto-deploy)
git add .
git commit -m "Add Telegram Bot webhook"
git push
```

---

## 🔗 ШАГ 2: Настроить Webhook в Telegram

### Вариант A: Через curl (в терминале)

```bash
curl -X POST "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-site.vercel.app/api/telegram-webhook"}'
```

### Вариант B: Через PowerShell

```powershell
$botToken = "7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8"
$webhookUrl = "https://your-site.vercel.app/api/telegram-webhook"

Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{url = $webhookUrl} | ConvertTo-Json)
```

### Вариант C: Через браузер

Откройте в браузере:
```
https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook?url=https://your-site.vercel.app/api/telegram-webhook
```

### ✅ Ожидаемый ответ:

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

## 🔍 ШАГ 3: Проверить Webhook

### Получить информацию о webhook:

```bash
curl "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/getWebhookInfo"
```

### ✅ Должен вернуть:

```json
{
  "ok": true,
  "result": {
    "url": "https://your-site.vercel.app/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

---

## 🧪 ШАГ 4: ТЕСТИРОВАНИЕ

### **ТЕСТ 1: Команда /start**

1. Открой Telegram
2. Найди своего бота (по username или токену)
3. Отправь: `/start`

**✅ Ожидаемый результат:**
```
👋 Привет! Я твоя личная записная книжка для объектов недвижимости!

📝 Как работает:
1. Нашёл объявление? Переслай мне!
2. Я автоматически сохраню на карте
3. Все объекты в одном месте

🗺️ Твоя карта:
https://your-site.vercel.app/map/personal/YOUR_ID/TOKEN

[🗺️ Моя карта] [❓ Помощь]
```

---

### **ТЕСТ 2: Forward сообщения с фото**

1. Найди любое объявление в группе (с фото)
2. Нажми Forward → выбери своего бота
3. Жди ответа

**✅ Ожидаемый результат:**
```
✅ Объект сохранён! (всего: 1)

🏠 [Тип], $[Цена]/месяц
📍 [Локация]
📸 [Количество] фотографий

🗺️ Твоя карта:
https://your-site.vercel.app/map/personal/YOUR_ID/TOKEN

💡 Пересылай сюда объявления - они автоматически добавятся на карту!

[🗺️ Открыть карту] [⭐ В избранное]
[✏️ Заметка] [🗑️ Удалить]
```

---

### **ТЕСТ 3: Отправить фото напрямую**

1. Отправь боту фото объекта
2. Жди ответа

**✅ Ожидаемый результат:**
```
📸 Фото получены! (1 шт.)

📍 Теперь отправь:
• Геолокацию объекта
• Или Google Maps ссылку
• Или текст с адресом

[💾 Сохранить без адреса] [❌ Отмена]
```

3. Отправь Google Maps ссылку или геолокацию
4. Бот должен ответить что получил и предложить добавить описание

---

### **ТЕСТ 4: Google Maps короткая ссылка**

1. Отправь короткую Google Maps ссылку:
   ```
   https://maps.app.goo.gl/Abc123
   ```

2. Бот должен:
   - Развернуть через Perplexity AI
   - Извлечь координаты
   - Попросить фото

**✅ Проверка:** В логах должно быть:
```
🔗 Expanding short URL with Perplexity AI: https://maps.app.goo.gl/...
✅ URL expanded: https://www.google.com/maps/...
```

---

### **ТЕСТ 5: AI анализ описания**

1. Отправь текст с описанием:
   ```
   Studio $500/month
   Near beach Negombo
   WiFi, AC, kitchen included
   Contact: +94 77 123 4567
   ```

2. Бот должен:
   - Отправить в Groq AI
   - Извлечь: тип, цену, удобства, контакт
   - Сохранить всё в БД

**✅ Проверка в БД:**
```sql
SELECT * FROM saved_properties 
ORDER BY created_at DESC 
LIMIT 1;
```

Должны быть заполнены:
- `property_type`: 'studio'
- `price`: 500
- `currency`: 'USD'
- `amenities`: ['WiFi', 'AC', 'Kitchen']
- `contact_phone`: '+94 77 123 4567'

---

### **ТЕСТ 6: Проверка фото в Storage**

1. Отправь forward с фото
2. Проверь Supabase Storage

**Путь:** `tenant-photos/{telegram_user_id}/{property_uuid}/photo_*.jpg`

**✅ Проверка:**
- Открой Supabase Dashboard
- Storage → tenant-photos
- Должна быть папка с твоим `telegram_user_id`
- Внутри папка с UUID объекта
- Внутри фото

---

### **ТЕСТ 7: Проверка tenant в БД**

```sql
SELECT * FROM tenants 
WHERE telegram_user_id = YOUR_TELEGRAM_ID;
```

**✅ Должно быть:**
- `telegram_user_id`: твой ID
- `map_secret_token`: 6 символов (например: 'aB7cDx')
- `personal_map_url`: полная ссылка
- `saved_properties_count`: количество объектов

---

### **ТЕСТ 8: Автообновление счётчика**

1. Отправь боту 3 разных объекта
2. Проверь счётчик:

```sql
SELECT saved_properties_count 
FROM tenants 
WHERE telegram_user_id = YOUR_ID;
```

**✅ Должно быть:** 3

---

## 🐛 ОТЛАДКА

### Проблема: Бот не отвечает

**Проверить:**

1. **Webhook настроен?**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
   ```

2. **Endpoint доступен?**
   ```bash
   curl -X POST "https://your-site.vercel.app/api/telegram-webhook" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Логи Vercel:**
   - Открой Vercel Dashboard
   - Deployments → Latest → Functions
   - Найди `/api/telegram-webhook`
   - Смотри логи ошибок

4. **Environment Variables:**
   - Проверь что все переменные добавлены в Vercel
   - Settings → Environment Variables

---

### Проблема: AI не работает

**Проверить:**

1. **Groq API Key:**
   ```bash
   curl "https://api.groq.com/openai/v1/models" \
     -H "Authorization: Bearer YOUR_GROQ_KEY"
   ```

2. **Perplexity API Key:**
   ```bash
   curl "https://api.perplexity.ai/chat/completions" \
     -H "Authorization: Bearer YOUR_PERPLEXITY_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.1-sonar-small-128k-online","messages":[{"role":"user","content":"test"}]}'
   ```

3. **Логи в коде:**
   - Смотри console.log в webhook
   - Должно быть: "🤖 AI Analysis started..."

---

### Проблема: Фото не загружаются

**Проверить:**

1. **Storage bucket создан?**
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'tenant-photos';
   ```

2. **RLS policies настроены?**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```

3. **Бот может скачать фото?**
   - Проверь что `TELEGRAM_BOT_TOKEN` правильный
   - Попробуй скачать фото вручную

---

## 📊 МОНИТОРИНГ

### Полезные SQL запросы:

```sql
-- Последние 10 объектов
SELECT 
  id,
  title,
  property_type,
  price,
  created_at,
  telegram_user_id
FROM saved_properties
ORDER BY created_at DESC
LIMIT 10;

-- Статистика по пользователям
SELECT 
  telegram_user_id,
  saved_properties_count,
  created_at
FROM tenants
ORDER BY saved_properties_count DESC;

-- Объекты с AI анализом
SELECT 
  title,
  property_type,
  price,
  amenities,
  contact_phone
FROM saved_properties
WHERE amenities IS NOT NULL;

-- Проверка forward источников
SELECT 
  source_type,
  COUNT(*) as count
FROM saved_properties
GROUP BY source_type;
```

---

## ✅ ЧЕКЛИСТ ТЕСТИРОВАНИЯ

```
□ Деплой на Vercel
□ Настройка webhook
□ Проверка getWebhookInfo
□ Тест /start команды
□ Тест forward с фото
□ Тест прямой отправки фото
□ Тест Google Maps ссылки
□ Тест AI анализа
□ Проверка Storage
□ Проверка tenant в БД
□ Проверка счётчика
□ Проверка forward метаданных
□ Тест кнопок (inline keyboard)
□ Тест пошагового режима
```

---

## 🎯 ПОСЛЕ УСПЕШНОГО ТЕСТИРОВАНИЯ

Если всё работает:
1. ✅ Создать личную карту (30 мин)
2. ✅ Протестировать полный flow: бот → карта
3. ✅ Добавить команды /stats, /help
4. ✅ Production ready! 🚀

---

Готов к тестированию! 🧪
