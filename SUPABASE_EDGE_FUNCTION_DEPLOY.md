# 🚀 Развертывание Edge Function для обновления курсов валют

**Статус:** База данных готова ✅  
**Следующий шаг:** Развернуть Edge Function

---

## 📋 Проверка базы данных

Выполните в Supabase SQL Editor для проверки:

```sql
-- 1. Проверяем что таблицы созданы
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('cron_jobs', 'cron_job_logs', 'exchange_rates_log');

-- Ожидается: 3 строки

-- 2. Проверяем задачу обновления курсов
SELECT 
  name,
  description,
  schedule,
  enabled,
  next_run_at
FROM cron_jobs
WHERE name = 'update_exchange_rates';

-- Ожидается: 1 строка, enabled = true

-- 3. Проверяем RLS политики
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('cron_jobs', 'exchange_rates_log');

-- Ожидается: минимум 4 политики
```

---

## 🔧 Вариант 1: Через Supabase CLI (рекомендуется)

### Шаг 1: Установка Supabase CLI

Если еще не установлен:

**Windows (через npm):**
```bash
npm install -g supabase
```

**Или через Chocolatey:**
```bash
choco install supabase
```

### Шаг 2: Логин в Supabase

```bash
supabase login
```

Откроется браузер для авторизации.

### Шаг 3: Связывание проекта

```bash
# Получите Project Reference ID из Dashboard
# https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/general

supabase link --project-ref YOUR_PROJECT_REF
```

### Шаг 4: Развертывание функции

```bash
# Разворачиваем функцию
supabase functions deploy update-exchange-rates

# Проверяем что развернулась
supabase functions list
```

### Шаг 5: Тестирование

```bash
# Тестовый вызов
supabase functions invoke update-exchange-rates
```

---

## 🔧 Вариант 2: Через Supabase Dashboard (вручную)

Если не хотите устанавливать CLI:

### Шаг 1: Открыть Edge Functions

1. Откройте https://supabase.com/dashboard/project/YOUR_PROJECT/functions
2. Нажмите "Create a new function"

### Шаг 2: Создать функцию

**Name:** `update-exchange-rates`

**Code:** Скопируйте содержимое файла `supabase/functions/update-exchange-rates/index.ts`

### Шаг 3: Deploy

Нажмите "Deploy function"

---

## 🧪 Тестирование Edge Function

### Через curl:

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/update-exchange-rates \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Где взять `YOUR_ANON_KEY`:
- Dashboard → Settings → API → `anon` `public`

### Через админ-панель:

1. Откройте `https://your-site.vercel.app/admin/cron-jobs`
2. Прокрутите до "Курсы валют"
3. Нажмите "🔄 Обновить сейчас"

---

## ✅ Что должно произойти

После успешного запуска:

1. **В консоли/логах:**
   ```
   🚀 Starting exchange rates update...
   📥 Fetching rates from API...
   ✅ Successfully fetched rates from API
      LKR: 1 = $0.003100 USD
      EUR: 1 = $1.090000 USD
   📝 Updating SQL function...
   ✅ SQL function updated
   🔄 Recalculating existing records...
   ✅ Records recalculated
   ✅ Update completed successfully
   ```

2. **В базе данных:**
   ```sql
   -- Проверяем что курсы сохранились
   SELECT * FROM exchange_rates_log 
   ORDER BY created_at DESC LIMIT 1;
   
   -- Ожидается: свежая запись с rates в JSON
   ```

3. **В админ-панели:**
   - Отображаются текущие курсы 8 валют
   - В истории появилась запись "✅ Successfully updated exchange rates"
   - Статус "Автообновление включено"

---

## ⚠️ Troubleshooting

### Ошибка: "Function not found"

**Решение:** Убедитесь что функция развернута:
```bash
supabase functions list
```

### Ошибка: "Permission denied"

**Решение:** Проверьте что используете правильный API key (anon или service_role)

### Ошибка: "API returned 500"

**Решение:** Проверьте логи функции:
```bash
supabase functions logs update-exchange-rates
```

### Ошибка: "exec_sql does not exist"

**Проблема:** Функция пытается выполнить SQL через RPC, но такой функции нет.

**Решение:** Нужно изменить Edge Function чтобы не использовать `exec_sql`. Обновим код.

---

## 🔄 Альтернатива: Упрощенная версия без exec_sql

Если возникают проблемы с `exec_sql`, можно использовать упрощенную версию которая:
1. Загружает курсы с API
2. Сохраняет их в `exchange_rates_log`
3. НЕ обновляет SQL функцию (обновляется вручную раз в месяц)

Нужно изменить? Могу создать упрощенную версию.

---

## 📝 Следующие шаги

После успешного развертывания:

1. ✅ Проверить работу ручного обновления
2. ✅ Настроить Supabase Cron (опционально)
3. ✅ Добавить мониторинг ошибок

---

Готово? Дайте знать если возникнут ошибки! 🚀
