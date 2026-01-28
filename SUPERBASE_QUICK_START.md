# ⚡ SUPERBASE Quick Start Guide

Быстрый старт для развертывания супербазы за 10 минут!

---

## 🚀 Шаг 1: Создание проекта Supabase (2 минуты)

1. Откройте [supabase.com](https://supabase.com)
2. Нажмите **"New Project"**
3. Заполните:
   - **Name**: `unmissable-rentals`
   - **Database Password**: Создайте надежный пароль
   - **Region**: Выберите ближайший (Singapore для Азии)
4. Нажмите **"Create new project"**
5. Подождите ~2 минуты

---

## 🗄️ Шаг 2: Развертывание схемы (3 минуты)

### Вариант А: Через SQL Editor (рекомендуется)

1. В Supabase перейдите в **SQL Editor** (иконка ⚡)
2. Нажмите **"New query"**
3. Откройте файл `supabase_superbase_schema.sql`
4. Скопируйте ВСЁ содержимое и вставьте в редактор
5. Нажмите **"Run"** (или Ctrl+Enter)
6. Дождитесь выполнения (~30 секунд)

### Вариант Б: Через Supabase CLI

```bash
# Установите CLI (если еще не установлен)
npm install -g supabase

# Войдите
supabase login

# Перейдите в папку проекта
cd your-project

# Выполните схему
supabase db push
```

---

## 🔑 Шаг 3: Получение ключей (1 минута)

1. В Supabase перейдите в **Settings** (иконка ⚙️)
2. Выберите **API**
3. Скопируйте:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public key** → `PUBLIC_SUPABASE_ANON_KEY`

---

## ⚙️ Шаг 4: Настройка проекта (2 минуты)

### Создайте/обновите `.env`

```env
# Supabase
PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key

# Опционально (для других фич)
GROQ_API_KEY=ваш-groq-key
PUBLIC_GOOGLE_MAPS_API_KEY=ваш-google-maps-key
```

### Обновите `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/superbase.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

---

## 🧪 Шаг 5: Тестирование (2 минуты)

### Проверка подключения

```typescript
// В любом компоненте или API роуте
import { supabase } from './lib/supabase';

// Проверка подключения
const { data, error } = await supabase
  .from('users')
  .select('count');

if (error) {
  console.error('❌ Ошибка подключения:', error);
} else {
  console.log('✅ База данных работает!');
}
```

### Создание тестового пользователя

```typescript
// Регистрация
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456',
});

if (error) {
  console.error('Ошибка регистрации:', error);
} else {
  console.log('Пользователь создан:', data.user);
  
  // Создаем профиль пользователя
  await supabase
    .from('users')
    .insert({
      id: data.user.id,
      first_name: 'Test',
      last_name: 'User',
      user_type: 'tourist',
      role: 'client'
    });
}
```

---

## 📊 Проверка таблиц

Перейдите в **Table Editor** и убедитесь, что созданы все таблицы:

✅ users  
✅ landlords  
✅ properties  
✅ rental_requests  
✅ offers  
✅ messages  
✅ client_maps  
✅ map_markers  
✅ subscriptions  
✅ payments  
✅ notifications  
✅ analytics_events  
✅ reviews  
✅ saved_properties  

---

## 🔐 Настройка аутентификации (опционально)

### Google OAuth

1. В Supabase → **Authentication** → **Providers**
2. Включите **Google**
3. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
4. Создайте OAuth 2.0 Client ID
5. Добавьте Redirect URI:
   ```
   https://ваш-проект.supabase.co/auth/v1/callback
   ```
6. Скопируйте Client ID и Secret в Supabase

### Email Template (опционально)

Настройте кастомные email шаблоны в **Authentication** → **Email Templates**

---

## 🎯 Базовые операции CRUD

### Создание запроса на аренду

```typescript
const { data: request, error } = await supabase
  .from('rental_requests')
  .insert({
    user_id: userId,
    title: 'Ищу виллу на Бали',
    location: [115.2126, -8.6705], // [lng, lat]
    city: 'Ubud',
    country: 'Indonesia',
    check_in: '2026-03-01',
    check_out: '2026-03-14',
    budget_per_night_min: 70,
    budget_per_night_max: 150,
    bedrooms_min: 2,
    required_amenities: ['wifi', 'pool', 'kitchen'],
    status: 'active'
  })
  .select()
  .single();
```

### Поиск объектов

```typescript
const { data: properties } = await supabase
  .rpc('search_properties', {
    p_lat: -8.6705,
    p_lng: 115.2126,
    p_radius_km: 10,
    p_min_price: 50,
    p_max_price: 200,
    p_property_types: ['villa', 'apartment'],
    p_bedrooms_min: 2,
    p_required_amenities: ['wifi'],
    p_limit: 20
  });
```

### Создание оффера

```typescript
const { data: offer } = await supabase
  .from('offers')
  .insert({
    property_id: propertyId,
    request_id: requestId,
    landlord_id: landlordId,
    custom_message: 'Идеально подходит для вас!',
    custom_price_per_night: 120,
    status: 'pending'
  })
  .select()
  .single();
```

### Отправка сообщения

```typescript
const { data: message } = await supabase
  .from('messages')
  .insert({
    from_user_id: currentUserId,
    to_user_id: recipientId,
    offer_id: offerId,
    content: 'Привет! Интересует ваш объект.',
    message_type: 'text',
    sent_via: 'platform'
  })
  .select()
  .single();
```

---

## 📱 Real-time подписки

```typescript
// Подписка на новые сообщения
const messagesChannel = supabase
  .channel('user-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Новое сообщение:', payload.new);
      // Показать уведомление
      showNotification(payload.new);
    }
  )
  .subscribe();

// Подписка на обновления оффера
const offersChannel = supabase
  .channel('request-offers')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'offers',
      filter: `request_id=eq.${requestId}`
    },
    (payload) => {
      console.log('Оффер обновлен:', payload);
      // Обновить список офферов
      refreshOffers();
    }
  )
  .subscribe();
```

---

## 🐛 Решение проблем

### Ошибка "relation does not exist"

**Причина**: Схема не выполнена полностью

**Решение**:
```sql
-- Проверьте, какие таблицы созданы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Если не все таблицы, запустите схему заново
```

### Ошибка "new row violates row-level security policy"

**Причина**: RLS политика блокирует запрос

**Решение**:
```typescript
// Убедитесь, что пользователь авторизован
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Проверьте политику RLS в Supabase Dashboard
```

### Ошибка "JWT expired"

**Причина**: Токен истёк

**Решение**:
```typescript
// Принудительное обновление сессии
const { data, error } = await supabase.auth.refreshSession();
```

---

## ✅ Чек-лист готовности

- [ ] Проект Supabase создан
- [ ] Схема выполнена без ошибок
- [ ] Все 14 таблиц созданы
- [ ] API ключи скопированы в `.env`
- [ ] `supabase.ts` обновлен
- [ ] Тестовый пользователь создан
- [ ] CRUD операции работают
- [ ] RLS политики активны

---

## 🎉 Готово!

Теперь у вас есть полностью рабочая супербаза! 

### Следующие шаги:

1. Изучите [SUPERBASE_README.md](./SUPERBASE_README.md) для деталей
2. Посмотрите примеры в [src/types/superbase.types.ts](./src/types/superbase.types.ts)
3. Начните разработку фич на основе схемы

---

## 💡 Полезные команды

```bash
# Запуск dev сервера
npm run dev

# Проверка типов
npm run type-check

# Тест подключения к Supabase
npx supabase db ping
```

---

**Нужна помощь?** Проверьте [SUPERBASE_README.md](./SUPERBASE_README.md) или документацию Supabase.
