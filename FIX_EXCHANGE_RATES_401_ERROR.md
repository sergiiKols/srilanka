# 🔧 Исправление ошибки 401 при обновлении курсов валют

**Проблема:** Edge Function возвращает 401 Unauthorized

---

## 🔍 Причина

В `ExchangeRatesManager.tsx` используются переменные окружения:
```typescript
const response = await fetch(
  `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/update-exchange-rates`,
  {
    headers: {
      'Authorization': `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
    },
  }
);
```

Проблема: переменные `PUBLIC_SUPABASE_URL` и `PUBLIC_SUPABASE_ANON_KEY` не определены.

---

## ✅ Решение

### Вариант 1: Добавить в `.env` файл (локально)

Создайте файл `.env` в корне проекта:

```env
PUBLIC_SUPABASE_URL=https://mcmzdscpuoxwneuzsanu.supabase.co
PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**Где взять ANON_KEY:**
1. Откройте Supabase Dashboard
2. Settings → API
3. Скопируйте **anon** **public** ключ

### Вариант 2: Добавить в Vercel Environment Variables

1. Откройте Vercel Dashboard → ваш проект
2. Settings → Environment Variables
3. Добавьте:
   - `PUBLIC_SUPABASE_URL` = `https://mcmzdscpuoxwneuzsanu.supabase.co`
   - `PUBLIC_SUPABASE_ANON_KEY` = `ваш_anon_key`
4. Redeploy проект

### Вариант 3: Исправить код компонента (временное решение)

Захардкодить значения прямо в компоненте (не рекомендуется для продакшна):

```typescript
// В ExchangeRatesManager.tsx
const SUPABASE_URL = 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SUPABASE_ANON_KEY = 'ваш_anon_key';

const response = await fetch(
  `${SUPABASE_URL}/functions/v1/update-exchange-rates`,
  {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }
);
```

---

## 🔐 Где взять ANON KEY

1. **Supabase Dashboard**
2. Ваш проект → **Settings** (шестеренка внизу слева)
3. **API**
4. Раздел **Project API keys**
5. Скопируйте ключ помеченный как **anon** **public**

Выглядит примерно так:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY3MjY0MDAsImV4cCI6MjAyMjMwMjQwMH0.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🧪 Проверка после исправления

1. Перезапустите dev сервер (если локально):
   ```bash
   npm run dev
   ```

2. Откройте `/admin/cron-jobs`

3. Нажмите "🔄 Обновить сейчас"

4. Должно сработать без ошибки 401

---

## 📝 Рекомендация

Используйте **Вариант 2** (Vercel Environment Variables) для продакшна - это безопаснее и не требует коммита секретных ключей в Git.

---

Какой вариант выберете?
