# 🤖 ПЛАН РЕАЛИЗАЦИИ TELEGRAM БОТА - ПЕРЕСМОТРЕННЫЙ

**Дата:** 2026-01-29  
**Статус:** ✅ Telegram Bot уже подключён! Нужно добавить обработку forward

---

## ✅ ЧТО УЖЕ ЕСТЬ

### 🤖 Telegram Bot интеграция
```env
TELEGRAM_BOT_TOKEN=7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8 ✅
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id_here
```

### 📦 Существующие модули
- ✅ `src/lib/telegram.ts` - утилиты для работы с Telegram
  - `sendTelegramMessage()` - отправка сообщений
  - `verifyTelegramWebAppData()` - проверка подписи
  - `parseTelegramInitData()` - парсинг данных
  - `encryptBotToken()` / `decryptBotToken()` - шифрование
  
- ✅ `src/pages/api/tenant-request.ts` - API для tenant form (Web App)
  - Принимает заявки через Telegram Web App
  - Валидация данных
  - Сохранение в `tenant_requests`
  - Отправка уведомлений админу

### 💾 База данных
- ✅ `tenants` - готова
- ✅ `saved_properties` - готова
- ✅ `access_attempts` - готова
- ✅ Триггеры и функции

---

## 🆕 ЧТО НУЖНО ДОБАВИТЬ

### Сейчас работает:
```
Tenant Web App → /api/tenant-request → tenant_requests (заявки)
```

### Нужно добавить:
```
Telegram Bot (forward) → /api/telegram-webhook → saved_properties (записная книжка)
```

**Две РАЗНЫЕ системы:**
1. **Tenant Form (существующая)** - арендаторы отправляют заявки
2. **Telegram Bot Forward (новая)** - арендаторы сохраняют объекты

---

## 🎯 НОВЫЙ ПЛАН (8 ШАГОВ вместо 10)

### ШАГ 1: Webhook endpoint для бота
**Файл:** `src/pages/api/telegram-webhook.ts`

```typescript
POST /api/telegram-webhook

Body: {
  update_id: number,
  message: {
    message_id: number,
    from: { id, username, first_name },
    chat: { id, type },
    date: number,
    photo?: [],  // фото объекта
    caption?: string,  // описание
    location?: { latitude, longitude },
    forward_from?: {},  // метаданные forward
    forward_from_chat?: {}
  }
}

Логика:
1. Проверить что это forward или direct сообщение с фото/локацией
2. Извлечь telegram_user_id
3. Вызвать getOrCreateTenant()
4. Парсить forward метаданные
5. Парсить описание (цена, тип)
6. Загрузить фото
7. Сохранить в saved_properties
8. Отправить ссылку на карту
```

**Переиспользуем:** `sendTelegramMessage()` из `src/lib/telegram.ts`  
**Время:** ~30 минут

---

### ШАГ 2: Утилиты для tenant bot
**Файл:** `src/lib/tenant-bot-utils.ts`

```typescript
// Генерация токена
export function generateMapToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Построение URL карты
export function buildPersonalMapUrl(userId: number, token: string): string {
  const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  return `${baseUrl}/map/personal/${userId}/${token}`;
}
```

**Время:** ~10 минут

---

### ШАГ 3: Работа с БД
**Файл:** `src/lib/tenant-bot-db.ts`

```typescript
import { supabase } from './supabase';
import { generateMapToken, buildPersonalMapUrl } from './tenant-bot-utils';

// Получить или создать пользователя
export async function getOrCreateTenant(telegramUserId: number) {
  // Проверить существование
  const { data: existing } = await supabase
    .from('tenants')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();
  
  if (existing) {
    // Обновить last_active_at
    await supabase
      .from('tenants')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', existing.id);
    
    return existing;
  }
  
  // Создать нового
  const token = generateMapToken();
  const mapUrl = buildPersonalMapUrl(telegramUserId, token);
  
  const { data: newTenant } = await supabase
    .from('tenants')
    .insert({
      telegram_user_id: telegramUserId,
      map_secret_token: token,
      personal_map_url: mapUrl,
      saved_properties_count: 0
    })
    .select()
    .single();
  
  return newTenant;
}

// Сохранить объект
export async function saveProperty(data: SavePropertyData) {
  const { data: property } = await supabase
    .from('saved_properties')
    .insert(data)
    .select()
    .single();
  
  return property;
}
```

**Время:** ~20 минут

---

### ШАГ 4: Парсинг forward метаданных
**Файл:** `src/lib/telegram-forward-parser.ts`

```typescript
export interface ForwardMetadata {
  source_type: 'direct' | 'forward_user' | 'forward_channel';
  forward_from_user_id?: number;
  forward_from_username?: string;
  forward_from_first_name?: string;
  forward_from_chat_id?: number;
  forward_from_chat_title?: string;
  forward_from_chat_username?: string;
  forward_from_message_id?: number;
  forward_date?: string;
  original_message_link?: string;
}

export function parseForwardMetadata(message: any): ForwardMetadata {
  // Direct сообщение
  if (!message.forward_from && !message.forward_from_chat) {
    return { source_type: 'direct' };
  }
  
  // Forward от пользователя
  if (message.forward_from) {
    return {
      source_type: 'forward_user',
      forward_from_user_id: message.forward_from.id,
      forward_from_username: message.forward_from.username,
      forward_from_first_name: message.forward_from.first_name,
      forward_date: new Date(message.forward_date * 1000).toISOString()
    };
  }
  
  // Forward из канала/группы
  if (message.forward_from_chat) {
    const chat = message.forward_from_chat;
    let messageLink;
    
    if (chat.username && message.forward_from_message_id) {
      messageLink = `https://t.me/${chat.username}/${message.forward_from_message_id}`;
    }
    
    return {
      source_type: 'forward_channel',
      forward_from_chat_id: chat.id,
      forward_from_chat_title: chat.title,
      forward_from_chat_username: chat.username,
      forward_from_message_id: message.forward_from_message_id,
      forward_date: new Date(message.forward_date * 1000).toISOString(),
      original_message_link: messageLink
    };
  }
  
  return { source_type: 'direct' };
}
```

**Время:** ~15 минут

---

### ШАГ 5: Парсинг описания объекта
**Файл:** `src/lib/property-parser.ts`

```typescript
export interface PropertyInfo {
  price?: number;
  currency?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  contact_phone?: string;
  contact_name?: string;
}

export function parsePropertyDescription(text: string): PropertyInfo {
  const info: PropertyInfo = {};
  
  // Цена: $500, 500$, 500 USD, 500 usd
  const priceRegex = /\$?\s*(\d+[,.]?\d*)\s*(\$|USD|usd|dollars?)?/i;
  const priceMatch = text.match(priceRegex);
  if (priceMatch) {
    info.price = parseFloat(priceMatch[1].replace(',', '.'));
    info.currency = 'USD';
  }
  
  // Тип: studio, apartment, house, room, villa
  const typeRegex = /(studio|apartment|house|room|villa|apt|flat)/i;
  const typeMatch = text.match(typeRegex);
  if (typeMatch) {
    info.property_type = typeMatch[1].toLowerCase();
  }
  
  // Спальни: 2 bed, 2BR, 2 bedroom
  const bedRegex = /(\d+)\s*(bed|br|bedroom)/i;
  const bedMatch = text.match(bedRegex);
  if (bedMatch) {
    info.bedrooms = parseInt(bedMatch[1]);
  }
  
  // Ванные: 1 bath, 1 bathroom
  const bathRegex = /(\d+)\s*(bath|bathroom)/i;
  const bathMatch = text.match(bathRegex);
  if (bathMatch) {
    info.bathrooms = parseInt(bathMatch[1]);
  }
  
  // Телефон: +94 77 123 4567, 077 123 4567
  const phoneRegex = /(\+?\d{1,3}[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    info.contact_phone = phoneMatch[1];
  }
  
  return info;
}
```

**Время:** ~20 минут

---

### ШАГ 6: Загрузка фотографий
**Файл:** `src/lib/telegram-photo-uploader.ts`

```typescript
export async function uploadTelegramPhotos(
  botToken: string,
  photos: any[],
  userId: number,
  propertyId: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const photo of photos) {
    try {
      // 1. Получить file_path от Telegram
      const fileId = photo.file_id;
      const fileResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
      );
      const fileData = await fileResponse.json();
      
      if (!fileData.ok) continue;
      
      const filePath = fileData.result.file_path;
      
      // 2. Скачать файл
      const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      const photoResponse = await fetch(photoUrl);
      const photoBlob = await photoResponse.blob();
      
      // 3. Загрузить в Supabase Storage
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const storagePath = `${userId}/${propertyId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('tenant-photos')
        .upload(storagePath, photoBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        continue;
      }
      
      // 4. Получить публичный URL
      const { data: urlData } = supabase.storage
        .from('tenant-photos')
        .getPublicUrl(storagePath);
      
      uploadedUrls.push(urlData.publicUrl);
      
    } catch (error) {
      console.error('Photo upload error:', error);
    }
  }
  
  return uploadedUrls;
}
```

**Время:** ~25 минут

---

### ШАГ 7: Главный webhook handler
**Файл:** `src/pages/api/telegram-webhook.ts`

```typescript
import type { APIRoute } from 'astro';
import { sendTelegramMessage } from '@/lib/telegram';
import { getOrCreateTenant, saveProperty } from '@/lib/tenant-bot-db';
import { parseForwardMetadata } from '@/lib/telegram-forward-parser';
import { parsePropertyDescription } from '@/lib/property-parser';
import { uploadTelegramPhotos } from '@/lib/telegram-photo-uploader';

export const POST: APIRoute = async ({ request }) => {
  try {
    const update = await request.json();
    const message = update.message;
    
    if (!message) {
      return new Response('OK', { status: 200 });
    }
    
    // Проверяем что есть фото или локация
    if (!message.photo && !message.location) {
      // Отправляем инструкцию
      await sendTelegramMessage({
        botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
        chatId: message.chat.id.toString(),
        text: '📸 Пересылайте сюда объявления с фото или отправьте локацию объекта!'
      });
      
      return new Response('OK', { status: 200 });
    }
    
    // 1. Получить/создать tenant
    const tenant = await getOrCreateTenant(message.from.id);
    
    // 2. Парсить forward метаданные
    const forwardMeta = parseForwardMetadata(message);
    
    // 3. Парсить описание
    const caption = message.caption || '';
    const propertyInfo = parsePropertyDescription(caption);
    
    // 4. Загрузить фото
    let photos: string[] = [];
    if (message.photo) {
      const tempPropertyId = crypto.randomUUID();
      photos = await uploadTelegramPhotos(
        import.meta.env.TELEGRAM_BOT_TOKEN,
        message.photo,
        message.from.id,
        tempPropertyId
      );
    }
    
    // 5. Извлечь координаты
    let latitude, longitude;
    if (message.location) {
      latitude = message.location.latitude;
      longitude = message.location.longitude;
    } else {
      // TODO: Попытаться извлечь из текста или использовать дефолт
      latitude = 6.9271; // Colombo default
      longitude = 79.8612;
    }
    
    // 6. Сохранить в БД
    const property = await saveProperty({
      telegram_user_id: message.from.id,
      title: propertyInfo.property_type || 'Property',
      description: caption,
      latitude,
      longitude,
      price: propertyInfo.price,
      currency: propertyInfo.currency || 'USD',
      property_type: propertyInfo.property_type,
      bedrooms: propertyInfo.bedrooms,
      bathrooms: propertyInfo.bathrooms,
      photos,
      contact_phone: propertyInfo.contact_phone,
      ...forwardMeta
    });
    
    // 7. Отправить ответ с ссылкой
    const count = tenant.saved_properties_count + 1;
    await sendTelegramMessage({
      botToken: import.meta.env.TELEGRAM_BOT_TOKEN,
      chatId: message.chat.id.toString(),
      text: `✅ Объект сохранён! (всего: ${count})
      
🗺️ Ваша карта: ${tenant.personal_map_url}

💡 Пересылайте сюда объявления - они автоматически добавятся на карту!`
    });
    
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500 });
  }
};
```

**Время:** ~30 минут

---

### ШАГ 8: Настроить webhook в Telegram
**Команда:**

```bash
curl -X POST "https://api.telegram.org/bot7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8/setWebhook" \
  -d "url=https://ваш-сайт.vercel.app/api/telegram-webhook"
```

**Или через код:**
```typescript
// src/scripts/setup-webhook.ts
const BOT_TOKEN = '7958965950:AAFg63FTJ46hcRT6M2wSBzn9RHCrzvfV3q8';
const WEBHOOK_URL = 'https://ваш-сайт.vercel.app/api/telegram-webhook';

await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: WEBHOOK_URL })
});
```

**Время:** ~5 минут

---

## 📊 ОБНОВЛЁННАЯ ОЦЕНКА ВРЕМЕНИ

| Шаг | Описание | Время |
|-----|----------|-------|
| 1 | Webhook endpoint | 30 мин |
| 2 | Утилиты | 10 мин |
| 3 | БД функции | 20 мин |
| 4 | Forward парсинг | 15 мин |
| 5 | Property парсинг | 20 мин |
| 6 | Загрузка фото | 25 мин |
| 7 | Главный handler | 30 мин |
| 8 | Настройка webhook | 5 мин |
| **ИТОГО** | | **~2.5 часа** |

**Личную карту добавим после** (~30 минут)  
**Всего:** ~3 часа

---

## ✅ ЧТО ПЕРЕИСПОЛЬЗУЕМ

Из существующего кода:
- ✅ `sendTelegramMessage()` - отправка ответов
- ✅ `supabase` клиент - работа с БД
- ✅ Структура API endpoints
- ✅ Telegram Bot Token (уже есть)

Создаём новое:
- 🆕 `/api/telegram-webhook` - приём updates
- 🆕 Forward парсинг
- 🆕 Property парсинг
- 🆕 Фото загрузка
- 🆕 Tenant регистрация

---

## 🚀 ГОТОВЫ НАЧАТЬ?

**Вариант A: Начать кодить прямо сейчас** 🔥
   → Создам первые 4 файла (утилиты, БД, парсеры)
   
**Вариант B: Сначала настроить Supabase Storage**
   → Создать bucket `tenant-photos`
   → Настроить RLS policies
   
**Вариант C: Сначала протестировать существующего бота**
   → Проверить что токен работает
   → Посмотреть текущие команды

Что выбираете? 🎯
