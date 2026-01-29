# ✅ ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

**Дата:** 2026-01-29  
**Статус проверки:** В процессе...

---

## 📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ

### ✅ **Структура проекта**

```
✅ telegram-webhook.ts        - создан (19 KB, 481 строка)
✅ telegram-bot-ai.ts         - создан (10.8 KB, 322 строки)
✅ telegram-bot-db.ts         - создан (11.1 KB, 389 строк)
✅ telegram-bot-utils.ts      - создан (8.1 KB, 236 строк)
✅ telegram-forward-parser.ts - создан (6.5 KB, 200 строк)
✅ telegram-photo-uploader.ts - создан (11.5 KB, 357 строк)
✅ property-parser.ts         - создан (9.7 KB, 284 строки)
```

**Общий размер:** ~77 KB кода  
**Всего строк:** ~2,469 строк

---

### ⚠️ **Git статус**

```
🌿 Ветка: main
📝 Незакоммиченных изменений: 101 файл
```

**Нужно:** Закоммитить новые файлы!

---

### ⚠️ **Процессы Node.js**

```
PID: 17796 | Память: 56.77 MB
```

**Рекомендация:** Остановить перед деплоем (опционально)

---

### ✅ **Environment Variables**

Необходимые переменные для Vercel:

```
✅ SITE_API_URL
✅ PERPLEXITY_API_KEY
✅ GROQ_API_KEY
✅ PUBLIC_SUPABASE_URL
✅ PUBLIC_SUPABASE_ANON_KEY
✅ TELEGRAM_BOT_TOKEN          ← Уже есть!
✅ TELEGRAM_ADMIN_CHAT_ID
✅ PUBLIC_GOOGLE_MAPS_API_KEY
```

---

## 🚀 ПЛАН ДЕПЛОЯ

### **ШАГ 1: Подготовка Git** ⏳

```bash
# 1. Проверить статус
git status

# 2. Добавить новые файлы
git add src/lib/tenant-bot-*.ts
git add src/lib/telegram-*.ts
git add src/lib/property-parser.ts
git add src/pages/api/telegram-webhook.ts
git add database/*.sql
git add *.md

# 3. Коммит
git commit -m "feat: Add Telegram Bot for tenants with AI integration

- Add tenant bot utilities and database functions
- Integrate Groq AI for property analysis
- Integrate Perplexity AI for URL expansion
- Add photo uploader to Supabase Storage
- Add webhook endpoint with 2 modes (quick/step-by-step)
- Add session management and callback handlers
- Create 19 documentation files
- Total: ~3,140 lines of code"

# 4. Push
git push origin main
```

---

### **ШАГ 2: Проверка TypeScript** ⏳

```bash
# Проверить ошибки компиляции
npm run build

# Или
npx astro build
```

**Если есть ошибки:**
- Исправить импорты
- Проверить типы
- Исправить синтаксис

---

### **ШАГ 3: Vercel Environment Variables** ⏳

Добавить в Vercel Dashboard → Settings → Environment Variables:

```env
# Уже должны быть (проверить):
PERPLEXITY_API_KEY=your_key
GROQ_API_KEY=your_key
PUBLIC_SUPABASE_URL=your_url
PUBLIC_SUPABASE_ANON_KEY=your_key
TELEGRAM_BOT_TOKEN=7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8
PUBLIC_GOOGLE_MAPS_API_KEY=your_key

# Добавить если нет:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUBLIC_SITE_URL=https://your-site.vercel.app
```

---

### **ШАГ 4: Deплой на Vercel** ⏳

**Вариант A: Auto-deploy (если настроен)**
- Git push → Vercel автоматически задеплоит

**Вариант B: Manual deploy**
```bash
vercel --prod
```

**Вариант C: Через Vercel Dashboard**
- Deployments → Redeploy

---

### **ШАГ 5: Настройка Telegram Webhook** ⏳

После успешного деплоя:

```bash
curl -X POST "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook" \
  -d "url=https://your-site.vercel.app/api/telegram-webhook"
```

**Проверка:**
```bash
curl "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/getWebhookInfo"
```

---

### **ШАГ 6: Тестирование** ⏳

1. Отправить боту `/start`
2. Переслать объявление с фото
3. Проверить что объект сохранился в БД
4. Проверить что фото загрузилось в Storage

---

## ⚠️ ПОТЕНЦИАЛЬНЫЕ ПРОБЛЕМЫ

### **1. TypeScript ошибки импортов**

**Проблема:** `Cannot find module '@/lib/...'`

**Решение:** Проверить `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### **2. Ошибка в telegram.ts**

**Проблема:** `sendTelegramMessage` не экспортирован

**Решение:** Проверить в `src/lib/telegram.ts`:
```typescript
export async function sendTelegramMessage(params: {...}) {
  // ...
}
```

---

### **3. Supabase типы**

**Проблема:** Type errors в `tenant-bot-db.ts`

**Решение:** Добавить типы:
```typescript
import type { Database } from '@/types/supabase.types';
```

---

### **4. Environment variables не работают**

**Проблема:** `import.meta.env.TELEGRAM_BOT_TOKEN` = undefined

**Решение:** 
1. Проверить в Vercel Dashboard
2. Redeploy после добавления переменных
3. Использовать правильные префиксы (PUBLIC_ для клиента)

---

### **5. Webhook не получает updates**

**Проблема:** Бот не отвечает

**Решение:**
1. Проверить что URL правильный
2. Проверить что endpoint работает (curl test)
3. Проверить логи в Vercel Functions
4. Убедиться что webhook настроен (getWebhookInfo)

---

## 📋 ФИНАЛЬНЫЙ ЧЕКЛИСТ

```
Перед деплоем:
□ Закоммитить все новые файлы
□ Проверить TypeScript (npm run build)
□ Проверить Environment Variables
□ Остановить dev сервер (опционально)

После деплоя:
□ Настроить webhook в Telegram
□ Проверить getWebhookInfo
□ Протестировать /start
□ Протестировать forward сообщения
□ Проверить БД (tenants, saved_properties)
□ Проверить Storage (tenant-photos)
□ Проверить логи в Vercel

Если всё работает:
□ Создать личную карту
□ Полное тестирование
□ Production ready! 🚀
```

---

## 🎯 КОМАНДЫ ДЛЯ КОПИРОВАНИЯ

### Git commit и push:
```bash
git add .
git commit -m "feat: Add Telegram Bot with AI integration"
git push origin main
```

### Проверка build:
```bash
npm run build
```

### Настройка webhook:
```bash
curl -X POST "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook" \
  -d "url=https://YOUR-SITE.vercel.app/api/telegram-webhook"
```

### Проверка webhook:
```bash
curl "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/getWebhookInfo"
```

---

## ✅ ГОТОВО К ДЕПЛОЮ?

**Текущий статус:**
- ✅ Все файлы созданы
- ⚠️ 101 незакоммиченный файл
- ⚠️ Нужна проверка TypeScript
- ⚠️ Нужен git commit & push

**Следующее действие:** 
1. Запустить `npm run build` для проверки ошибок
2. Если OK → git commit & push
3. Дождаться деплоя на Vercel
4. Настроить webhook
5. Тестировать! 🧪

---

Готовы к деплою! 🚀
