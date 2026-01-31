# 🔐 Настройка Environment Variables в Vercel

**Важно:** Секретные ключи НЕ должны попадать в Git!

---

## 📋 Переменные для Vercel

Добавьте следующие переменные в Vercel Dashboard:

### 1. Supabase Configuration

**PUBLIC_SUPABASE_URL**
```
https://mcmzdscpuoxwneuzsanu.supabase.co
```

**PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbXpkc2NwdW94d25ldXpzYW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNDAxMjEsImV4cCI6MjA4NDkxNjEyMX0.FINUETJbgsos3tJdrJp_cyAPVOPxqpT_XjWIeFywPzw
```

---

## 🚀 Как добавить в Vercel

### Способ 1: Через Dashboard

1. Откройте https://vercel.com/sergiikols/srilanka/settings/environment-variables
2. Нажмите "Add New"
3. Добавьте каждую переменную:
   - **Key:** `PUBLIC_SUPABASE_URL`
   - **Value:** `https://mcmzdscpuoxwneuzsanu.supabase.co`
   - **Environments:** Production, Preview, Development (все галочки)
4. Нажмите "Save"
5. Повторите для `PUBLIC_SUPABASE_ANON_KEY`

### Способ 2: Через Vercel CLI

```bash
vercel env add PUBLIC_SUPABASE_URL
# Вставьте: https://mcmzdscpuoxwneuzsanu.supabase.co
# Выберите: Production, Preview, Development

vercel env add PUBLIC_SUPABASE_ANON_KEY
# Вставьте: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Выберите: Production, Preview, Development
```

---

## 🔄 После добавления переменных

**Обязательно сделайте Redeploy:**

1. В Vercel Dashboard → Deployments
2. Найдите последний deployment
3. Нажмите три точки → "Redeploy"
4. Или просто сделайте новый push в Git

---

## ✅ Проверка

После redeploy:
1. Откройте https://srilanka-37u2.vercel.app/admin/cron-jobs
2. Прокрутите до "Курсы валют"
3. Нажмите "🔄 Обновить сейчас"
4. Должно работать без ошибки 401

---

## 🔐 Безопасность

✅ **Правильно:**
- `.env` файл в `.gitignore`
- Переменные добавлены в Vercel
- Переменные добавлены локально в `.env`

❌ **Неправильно:**
- Коммитить `.env` в Git
- Хардкодить ключи в коде
- Делиться ключами публично

---

**Дата:** 2026-01-31
