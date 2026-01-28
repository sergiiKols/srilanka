# 🔥 TELEGRAM LISTING SYSTEM - Инструкция по установке

**Дата:** 2026-01-27  
**Статус:** ✅ Schema Ready - Готово к установке  
**Phase 1:** Подготовка инфраструктуры - ЗАВЕРШЕНА

---

## ✅ ЧТО УЖЕ ГОТОВО

- ✅ **SQL схема:** `supabase_telegram_listing_schema.sql`
- ✅ **TypeScript типы:** `src/types/telegram-listing.types.ts`
- ✅ **6 таблиц:** telegram_accounts, telegram_groups, property_listings, listing_publications, landlord_responses, temperature_change_log
- ✅ **2 SQL функции:** cool_down_objects(), validate_listing_data()
- ✅ **RLS политики:** Безопасность на уровне строк
- ✅ **Индексы:** Оптимизация производительности
- ✅ **Триггеры:** Автоматическое обновление updated_at

---

## 📋 ШАГИ ПО УСТАНОВКЕ

### Шаг 1: Применить SQL схему в Supabase

1. Откройте ваш проект в Supabase: https://app.supabase.com
2. Перейдите в **SQL Editor** (левое меню)
3. Создайте новый запрос (New Query)
4. Скопируйте всё содержимое файла `supabase_telegram_listing_schema.sql`
5. Вставьте в редактор
6. Нажмите **RUN** или `Ctrl+Enter`

**Ожидаемый результат:**
```
Success. No rows returned
```

### Шаг 2: Проверить созданные таблицы

В Supabase перейдите в **Table Editor** и убедитесь, что появились таблицы:
- ✅ telegram_accounts
- ✅ telegram_groups  
- ✅ property_listings
- ✅ listing_publications
- ✅ landlord_responses
- ✅ temperature_change_log

### Шаг 3: Настроить Cron Job для охлаждения объектов

Функция `cool_down_objects()` должна запускаться каждый час.

**Вариант A: Через Supabase Edge Functions (рекомендуется)**

Создайте Edge Function:

```typescript
// supabase/functions/cool-down-objects/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Вызываем функцию охлаждения
    const { data, error } = await supabase.rpc('cool_down_objects')

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        cooled_down: data?.length || 0,
        results: data 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

Затем настройте Cron в Supabase Dashboard:
1. Перейдите в **Database** → **Cron Jobs**
2. Создайте новый job:
   - Name: `Cool Down Listings`
   - Schedule: `0 * * * *` (каждый час)
   - Command: Вызов Edge Function

**Вариант B: Внешний cron (например, через GitHub Actions)**

```yaml
# .github/workflows/cool-down-cron.yml
name: Cool Down Objects Cron
on:
  schedule:
    - cron: '0 * * * *' # Каждый час
  workflow_dispatch: # Ручной запуск

jobs:
  cool-down:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/cool_down_objects" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json"
```

### Шаг 4: Установить зависимости

```bash
npm install telegram@2.22.2      # GramJS для Telegram Client API
npm install @grammyjs/types      # TypeScript типы
npm install date-fns             # Работа с датами
```

### Шаг 5: Настроить переменные окружения

Создайте или обновите `.env`:

```env
# Supabase (уже должны быть)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Telegram Client API (новое)
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# Telegram Bot (для чат-бота с клиентами)
TELEGRAM_BOT_TOKEN=your_bot_token

# Grok AI (для оптимизации текстов)
GROK_API_KEY=your_grok_api_key

# Базовый URL карты
BASE_MAP_URL=https://yourdomain.com/map
```

**Где взять Telegram API credentials:**
1. Перейдите на https://my.telegram.org
2. Войдите с вашим номером телефона
3. Перейдите в **API development tools**
4. Создайте приложение и получите `api_id` и `api_hash`

---

## 🧪 ТЕСТИРОВАНИЕ СХЕМЫ

### Тест 1: Создание тестового Telegram аккаунта

```sql
-- В Supabase SQL Editor
INSERT INTO telegram_accounts (phone_number, account_name, api_id, api_hash, daily_limit)
VALUES ('+94771234567', 'Test Account', 'your_api_id', 'your_api_hash', 50)
RETURNING *;
```

### Тест 2: Создание тестовой группы

```sql
INSERT INTO telegram_groups (
  telegram_id, 
  group_name, 
  group_type, 
  target_locations, 
  allowed_property_types,
  priority
)
VALUES (
  '@test_sri_lanka_rentals', 
  'Test Sri Lanka Rentals', 
  'group',
  ARRAY['Negombo', 'Hikkaduwa'],
  ARRAY['villa', 'apartment'],
  8
)
RETURNING *;
```

### Тест 3: Создание тестового объявления

```sql
INSERT INTO property_listings (
  property_type,
  price_monthly,
  location_name,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  has_wifi,
  has_pool,
  original_description,
  photos,
  contact_name,
  contact_phone,
  status
)
VALUES (
  'villa',
  800,
  'Negombo',
  7.2091,
  79.8358,
  3,
  2,
  true,
  true,
  'Beautiful beachfront villa with pool, 3 bedrooms, fully furnished. Perfect for digital nomads!',
  ARRAY['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg', 'https://example.com/photo3.jpg'],
  'John Doe',
  '+94771234567',
  'new'
)
RETURNING *;
```

### Тест 4: Валидация объявления

```sql
-- Замените 'listing-uuid' на ID из предыдущего запроса
SELECT * FROM validate_listing_data('listing-uuid');
```

**Ожидаемый результат:**
```json
{
  "is_valid": true,
  "validation_errors": [],
  "missing_fields": []
}
```

### Тест 5: Тест функции охлаждения

```sql
-- Сначала обновим дату, чтобы симулировать старое объявление
UPDATE property_listings 
SET 
  temperature_changed_at = NOW() - INTERVAL '25 hours',
  status = 'published'
WHERE id = 'listing-uuid';

-- Теперь запускаем охлаждение
SELECT * FROM cool_down_objects();
```

**Ожидаемый результат:**
Объявление должно перейти из `hot` в `warm`.

---

## 📊 СТРУКТУРА ТАБЛИЦ

### 1️⃣ telegram_accounts
Telegram аккаунты для публикации через Client API.

**Ключевые поля:**
- `phone_number` - номер телефона аккаунта
- `api_id`, `api_hash` - API credentials
- `session_string` - сохраненная сессия GramJS
- `daily_publications` / `daily_limit` - контроль лимитов

### 2️⃣ telegram_groups
Группы и каналы для публикации объявлений.

**Ключевые поля:**
- `telegram_id` - @username или chat ID
- `auto_publish` - автоматически публиковать
- `target_locations` - фильтр по локациям
- `allowed_property_types` - фильтр по типам
- `priority` - приоритет публикации (1-10)

### 3️⃣ property_listings
Объявления о недвижимости от клиентов.

**Ключевые поля:**
- `temperature` - hot/warm/cool/cold 🔴🟠🟡🔵
- `temperature_priority` - 4/3/2/1
- `validation_status` - valid/invalid/pending
- `status` - new/validated/published/expired/deleted
- `optimized_description` - текст после Grok AI

### 4️⃣ listing_publications
История публикаций в Telegram группах.

**Ключевые поля:**
- `telegram_message_id` - ID сообщения для удаления
- `listing_id` + `group_id` - уникальная комбинация
- `is_active` - активна ли публикация

### 5️⃣ landlord_responses
Отклики арендодателей на объявления.

**Ключевые поля:**
- `validation_status` - статус валидации данных
- `required_fields` - недостающие поля
- `personal_map_generated` - создана ли персональная карта
- `sent_to_client` - отправлено ли клиенту

### 6️⃣ temperature_change_log
Лог изменения температуры объектов.

**Ключевые поля:**
- `old_temperature` → `new_temperature`
- `change_reason` - auto_cooldown/manual/new_listing
- `changed_by` - кто изменил (NULL = авто)

---

## 🌡️ СИСТЕМА ТЕМПЕРАТУРНОЙ ГРАДАЦИИ

| Температура | Время | Цвет | Приоритет | Видимость |
|------------|-------|------|-----------|-----------|
| 🔴 **HOT** | 0-24ч | `#FF0000` | 4 | Всегда |
| 🟠 **WARM** | 24-72ч | `#FFA500` | 3 | Всегда |
| 🟡 **COOL** | 72-120ч | `#FFFF00` | 2 | С фильтрами |
| 🔵 **COLD** | 120+ч | `#0000FF` | 1 | Только с фильтрами |

**Автоматическое охлаждение:**
- Функция `cool_down_objects()` запускается каждый час
- Объекты автоматически переходят на следующий уровень
- Все изменения логируются в `temperature_change_log`

---

## 🔐 RLS ПОЛИТИКИ

**telegram_accounts & telegram_groups:**
- Только администраторы имеют полный доступ
- Обычные пользователи могут читать активные группы

**property_listings:**
- Пользователи видят только свои объявления
- Все могут читать опубликованные объявления
- Администраторы видят всё

**listing_publications:**
- Все могут читать активные публикации
- Изменять могут только администраторы

**landlord_responses:**
- Пользователи видят отклики на свои объявления
- Полный доступ у администраторов

**temperature_change_log:**
- Все могут читать
- Изменять могут только администраторы

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### 1. Telegram Client API vs Bot API

**Client API** используется для:
- Публикации от имени личного аккаунта
- Удаления сообщений в группах
- Обход ограничений Bot API

**Bot API** используется для:
- Чат-бот с клиентами (сбор заявок)
- Webhook для получения откликов

### 2. Лимиты Telegram

- **Максимум публикаций:** ~20-50 сообщений в день на аккаунт
- **Flood wait:** Telegram может временно заблокировать при превышении
- **Solution:** Ротация аккаунтов через `telegram_accounts` (поле `daily_limit`)

### 3. Безопасность

- ✅ Храните `api_hash` и `session_string` в зашифрованном виде
- ✅ Используйте `service_role_key` только на сервере
- ✅ Включайте RLS для всех таблиц
- ✅ Регулярно ротируйте API ключи

### 4. Бэкапы

Рекомендуется настроить автоматические бэкапы:
- Supabase делает ежедневные бэкапы (Pro план)
- Можно настроить экспорт через `pg_dump`

---

## 📝 СЛЕДУЮЩИЕ ШАГИ (Phase 2+)

После установки схемы переходите к:

1. **Phase 2:** Валидация данных клиента
   - Создать сервис `src/services/listingValidation.ts`
   - Интеграция с чат-ботом

2. **Phase 3:** Telegram Client API
   - Настройка GramJS
   - Функция публикации объявлений
   - Функция удаления объявлений

3. **Phase 4:** Grok AI оптимизация
   - Интеграция с Grok API
   - Оптимизация текстов объявлений

4. **Phase 5:** Обработка откликов арендодателей
   - Webhook/Polling для получения сообщений
   - Автоматическая валидация данных

5. **Phase 6:** Генерация персональных карт
   - Создание карты при первом отклике
   - Отправка ссылки клиенту

---

## 🆘 TROUBLESHOOTING

### Проблема: "relation already exists"
**Решение:** Таблица уже создана. Можно пропустить или удалить через:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### Проблема: "permission denied for schema public"
**Решение:** Используйте Supabase Service Role Key, не Anon Key.

### Проблема: "function cool_down_objects() does not exist"
**Решение:** Убедитесь, что весь SQL скрипт выполнен полностью.

### Проблема: RLS блокирует запросы
**Решение:** 
```typescript
// Используйте service client для обхода RLS
const { data } = await supabase
  .from('property_listings')
  .select('*')
  .eq('user_id', userId)
```

---

## 📞 ПОДДЕРЖКА

Если возникли проблемы:
1. Проверьте логи в Supabase Dashboard → Logs
2. Убедитесь, что все переменные окружения установлены
3. Проверьте RLS политики для вашего пользователя

---

**✅ SCHEMA READY FOR DEPLOYMENT! 🚀**

Переходите к Phase 2 когда будете готовы!
