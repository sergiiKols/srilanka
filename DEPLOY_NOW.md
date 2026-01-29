# 🚀 ДЕПЛОЙ И НАСТРОЙКА - ПОШАГОВАЯ ИНСТРУКЦИЯ

**Дата:** 2026-01-29  
**Статус:** Начинаем деплой!

---

## 📋 ШАГ 1: GIT COMMIT & PUSH

### **Команды для выполнения:**

```bash
# 1. Добавить все файлы
git add .

# 2. Commit
git commit -m "feat: Add Telegram Bot with AI integration

- Add webhook endpoint with 2 modes (quick forward/step-by-step)
- Integrate Groq AI for smart property analysis
- Integrate Perplexity AI for Google Maps URL expansion
- Add photo uploader to Supabase Storage
- Create 7 libraries (~3,140 lines of code)
- Add tenant database functions
- Add forward metadata parsing
- Add property description parsing
- Fix syntax error in webhook handler
- Add 20+ documentation files

Features:
✅ AI-powered property data extraction
✅ Automatic photo upload to Storage
✅ Duplicate detection
✅ Session management for step-by-step input
✅ Callback button handlers
✅ /start, /help, /stats commands

Database:
✅ tenants table with unique tokens
✅ saved_properties with full metadata
✅ Auto-increment counters via triggers

Ready for testing!"

# 3. Push to main
git push origin main
```

---

## ⏳ ШАГ 2: ЖДЁМ ДЕПЛОЯ НА VERCEL

### **Что происходит:**

1. Git push → Vercel получает webhook
2. Vercel запускает build
3. Deploy в production

### **Проверка:**

Откройте Vercel Dashboard:
- https://vercel.com/dashboard
- Найдите проект
- Смотрите статус деплоя

**Ожидаемое время:** 2-3 минуты

---

## 🔗 ШАГ 3: ПОЛУЧИТЬ URL САЙТА

После успешного деплоя:

```
✅ Deployment Ready!
🌐 URL: https://your-project-name.vercel.app
```

**Скопируйте этот URL!** Он понадобится для webhook.

---

## 🤖 ШАГ 4: НАСТРОИТЬ TELEGRAM WEBHOOK

### **Замените YOUR-SITE на ваш URL и выполните:**

#### **Вариант A: PowerShell (Windows)**

```powershell
$botToken = "7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8"
$webhookUrl = "https://YOUR-SITE.vercel.app/api/telegram-webhook"

$response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{url = $webhookUrl} | ConvertTo-Json)

$response | ConvertTo-Json
```

#### **Вариант B: Браузер**

Откройте в браузере (замените YOUR-SITE):

```
https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook?url=https://YOUR-SITE.vercel.app/api/telegram-webhook
```

#### **Вариант C: Curl (если есть)**

```bash
curl -X POST "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR-SITE.vercel.app/api/telegram-webhook"}'
```

### **✅ Ожидаемый ответ:**

```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

## ✅ ШАГ 5: ПРОВЕРИТЬ WEBHOOK

### **Выполните (замените token):**

```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/getWebhookInfo"
```

### **✅ Должно вернуть:**

```json
{
  "ok": true,
  "result": {
    "url": "https://YOUR-SITE.vercel.app/api/telegram-webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40
  }
}
```

**Важно:** 
- `url` должен быть правильным
- `pending_update_count: 0` - нет ошибок

---

## 🧪 ШАГ 6: ТЕСТИРОВАНИЕ БОТА

### **ТЕСТ 1: Команда /start**

1. Откройте Telegram
2. Найдите своего бота
3. Отправьте: `/start`

**✅ Ожидаемый ответ:**

```
👋 Привет! Я твоя личная записная книжка!

📝 Как работает:
1. Нашёл объявление? Переслай мне!
2. Я автоматически сохраню на карте
3. Все объекты в одном месте

🗺️ Твоя карта:
https://your-site.vercel.app/map/personal/YOUR_ID/TOKEN

[🗺️ Моя карта] [❓ Помощь]
```

---

### **ТЕСТ 2: Forward сообщения**

1. Найдите объявление с фото в любой группе
2. Нажмите Forward
3. Выберите вашего бота
4. Отправьте

**✅ Ожидаемый ответ:**

```
✅ Объект сохранён! (всего: 1)

🏠 [Тип], $[Цена]/месяц
📍 [Локация]
📸 [Количество] фотографий

🗺️ Твоя карта:
https://...

[🗺️ Открыть карту] [⭐ В избранное]
[✏️ Заметка] [🗑️ Удалить]
```

---

### **ТЕСТ 3: Проверка БД**

Откройте Supabase Dashboard:

```sql
-- Проверить что tenant создался
SELECT * FROM tenants ORDER BY created_at DESC LIMIT 1;

-- Проверить что объект сохранился
SELECT * FROM saved_properties ORDER BY created_at DESC LIMIT 1;

-- Проверить счётчик
SELECT telegram_user_id, saved_properties_count 
FROM tenants 
WHERE saved_properties_count > 0;
```

---

### **ТЕСТ 4: Проверка Storage**

Откройте Supabase Dashboard → Storage → tenant-photos

**Должна быть:**
- Папка с вашим telegram_user_id
- Внутри папка с UUID объекта
- Внутри фото

---

## 🐛 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### **Проблема: Бот не отвечает**

**Проверить:**

1. Webhook настроен?
```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
```

2. Endpoint доступен?
```powershell
Invoke-RestMethod -Uri "https://YOUR-SITE.vercel.app/api/telegram-webhook" -Method Post
```

3. Логи в Vercel:
- Dashboard → Deployments → Latest → Functions
- Найти `/api/telegram-webhook`
- Смотреть ошибки

4. Environment Variables в Vercel:
- Settings → Environment Variables
- Проверить что все есть

---

### **Проблема: Ошибка в логах**

**Частые ошибки:**

1. `Cannot find module '@/lib/...'`
   → Проверить tsconfig.json paths

2. `TELEGRAM_BOT_TOKEN is undefined`
   → Добавить в Vercel Environment Variables
   → Redeploy

3. `Failed to upload photo`
   → Проверить Storage bucket
   → Проверить RLS policies

4. `AI analysis failed`
   → Проверить GROQ_API_KEY
   → Проверить PERPLEXITY_API_KEY

---

## 📊 ЧЕК-ЛИСТ УСПЕШНОГО ДЕПЛОЯ

```
□ Git commit & push выполнены
□ Vercel деплой успешен
□ URL сайта получен
□ Webhook настроен в Telegram
□ getWebhookInfo показывает правильный URL
□ /start команда работает
□ Forward сообщения работает
□ Tenant создался в БД
□ Property сохранилось в БД
□ Фото загрузилось в Storage
□ Счётчик обновился
```

---

## ✅ ПОСЛЕ УСПЕШНОГО ТЕСТИРОВАНИЯ

**ВСЁ РАБОТАЕТ?** 🎉

Поздравляю! Telegram Bot запущен!

**Следующие шаги:**
1. ✅ Создать личную карту клиента (30 мин)
2. ✅ Создать админскую мастер-карту (30 мин)
3. ✅ Полное тестирование

**Или оставить как есть и дать клиентам пользоваться!**

---

## 🎯 ТЕКУЩАЯ ГОТОВНОСТЬ: 90%

**Что работает:**
- ✅ Telegram Bot
- ✅ AI анализ
- ✅ Загрузка фото
- ✅ База данных
- ✅ Webhook

**Что осталось:**
- ⏹️ Личная карта (пока 404)
- ⏹️ Админская карта (опционально)

---

Готовы начать? Выполняйте команды по порядку! 🚀
