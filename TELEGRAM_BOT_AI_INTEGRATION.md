# 🤖 ИНТЕГРАЦИЯ TELEGRAM BOT С СУЩЕСТВУЮЩЕЙ AI СИСТЕМОЙ

**Дата:** 2026-01-29  
**Статус:** Анализ завершён ✅

---

## 🎯 ЧТО УЖЕ ЕСТЬ В ПРОЕКТЕ

### **1. AI Сервисы (готовые к использованию!)**

#### ✅ **Groq AI Service** (`src/services/groqService.ts`)

**Функции:**
```typescript
// Полный анализ описания объекта
analyzePropertyWithGroq(description: string, coordinates: Coordinates)
  → Возвращает: PropertyAnalysisResult

// Быстрый предварительный анализ
quickAnalyzeWithGroq(description: string)
  → Возвращает: Partial<PropertyAnalysisResult>

// С кэшированием (рекомендуется!)
analyzePropertyWithGroqCached(
  description: string,
  coordinates: Coordinates,
  onQuickResult?: (result) => void
)
  → Возвращает: PropertyAnalysisResult
```

**Что извлекает AI:**
- 🏠 Тип объекта (studio, apartment, house, villa)
- 🛏️ Количество спален
- 🚿 Количество ванных
- 💰 Цена
- 📐 Площадь
- ✨ Удобства (WiFi, AC, Pool, etc)
- 📏 Расстояние до пляжа
- 📞 Контакты
- 🎨 Описание (структурированное)

**Скорость:** 500-800 токенов/сек ⚡

---

#### ✅ **Perplexity AI Service** (`src/services/perplexityService.ts`)

**Функции:**
```typescript
// Разворачивание коротких URL
expandShortUrlWithAI(shortUrl: string)
  → Возвращает: полный Google Maps URL

// Анализ с доступом в интернет
analyzePropertyWithAI(description: string, coordinates: Coordinates)
  → Возвращает: PropertyAnalysisResult

// Гибридный анализ (Groq + Perplexity)
analyzePropertyHybrid(description: string, coordinates: Coordinates)
  → Возвращает: PropertyAnalysisResult
```

**Возможности:**
- 🔗 Разворачивает короткие ссылки (goo.gl, maps.app.goo.gl)
- 🌐 Доступ в интернет для поиска данных
- 📊 Более глубокий анализ (медленнее, но точнее)

---

#### ✅ **Google Maps Parser** (`src/utils/googleMapsParser.ts`)

**Функции:**
```typescript
// Парсинг Google Maps URL
parseGoogleMapsURL(url: string)
  → Возвращает: { lat, lng, address }

// Автоматически использует Perplexity для коротких ссылок!
// Если ссылка короткая → вызывает expandShortUrlWithAI()
```

---

### **2. Property Importer AI** (существующий компонент)

**Файл:** `src/components/PropertyImporterAI.tsx`

**Логика (2 шага):**
1. Загрузка фото
2. Google Maps URL + Описание → AI анализ

**Используемые функции:**
- `parseGoogleMapsURL()` - парсинг URL (с Perplexity для коротких)
- `analyzePropertyWithGroqCached()` - AI анализ описания
- `POIValidator` - валидация через Google Maps API

---

## 🚀 КАК ИНТЕГРИРОВАТЬ В TELEGRAM BOT

### **ВАРИАНТ A: Полная интеграция AI** ⭐ РЕКОМЕНДУЕТСЯ

```typescript
// src/lib/telegram-bot-ai.ts

import { analyzePropertyWithGroqCached } from '@/services/groqService';
import { parseGoogleMapsURL } from '@/utils/googleMapsParser';
import { parsePropertyDescription } from './property-parser';
import type { PropertyAnalysisResult } from '@/services/perplexityService';

/**
 * Анализирует сообщение от Telegram с использованием AI
 */
export async function analyzeTelegramMessage(
  text: string,
  googleMapsUrl?: string
): Promise<PropertyAnalysisResult> {
  
  // 1. Если есть Google Maps URL - извлекаем координаты
  let coordinates = null;
  if (googleMapsUrl) {
    const parsed = await parseGoogleMapsURL(googleMapsUrl);
    // parseGoogleMapsURL автоматически использует Perplexity для коротких ссылок!
    if (parsed) {
      coordinates = { lat: parsed.lat, lng: parsed.lng };
    }
  }
  
  // 2. Отправляем в AI для анализа
  // Groq AI извлечёт все данные: тип, цену, удобства, контакты
  const aiResult = await analyzePropertyWithGroqCached(
    text,
    coordinates || { lat: 6.9271, lng: 79.8612 }, // Дефолт Коломбо
    (quickResult) => {
      // Опционально: быстрый предварительный результат
      console.log('📦 Quick result:', quickResult);
    }
  );
  
  return aiResult;
}

/**
 * Комбинированный подход: AI + наш парсер
 * Берём лучшее из обоих миров
 */
export async function analyzeWithFallback(
  text: string,
  googleMapsUrl?: string
): Promise<any> {
  
  // Попытка 1: AI анализ
  try {
    const aiResult = await analyzeTelegramMessage(text, googleMapsUrl);
    
    // AI вернул хороший результат?
    if (aiResult.coordinates && aiResult.type) {
      return {
        ...aiResult,
        source: 'ai',
        confidence: 'high'
      };
    }
  } catch (error) {
    console.error('AI анализ не удался, используем fallback парсер');
  }
  
  // Попытка 2: Наш парсер (fallback)
  const manualParsed = parsePropertyDescription(text);
  
  // Координаты из Google Maps
  let coordinates = { lat: 6.9271, lng: 79.8612 };
  if (googleMapsUrl) {
    const parsed = await parseGoogleMapsURL(googleMapsUrl);
    if (parsed) {
      coordinates = { lat: parsed.lat, lng: parsed.lng };
    }
  }
  
  return {
    ...manualParsed,
    coordinates,
    source: 'manual',
    confidence: 'medium'
  };
}
```

---

### **ВАРИАНТ B: Только AI** (самый простой)

```typescript
// В webhook endpoint

import { analyzeTelegramMessage } from '@/lib/telegram-bot-ai';
import { extractGoogleMapsUrl } from '@/lib/tenant-bot-utils';

async function handleTelegramMessage(message: TelegramMessage) {
  const text = message.caption || message.text || '';
  const googleMapsUrl = extractGoogleMapsUrl(text);
  
  // AI делает ВСЮ работу!
  const result = await analyzeTelegramMessage(text, googleMapsUrl);
  
  // Сохраняем в БД
  await saveProperty({
    telegram_user_id: message.from.id,
    title: result.name || result.type,
    description: result.description,
    latitude: result.coordinates.lat,
    longitude: result.coordinates.lng,
    price: result.price,
    property_type: result.type,
    bedrooms: result.bedrooms,
    bathrooms: result.bathrooms,
    area_sqm: result.area,
    amenities: result.amenities,
    contact_phone: result.contact?.phone,
    // ... остальное
  });
}
```

---

### **ВАРИАНТ C: AI + Manual (гибрид)** ⚡ МАКСИМАЛЬНАЯ НАДЁЖНОСТЬ

```typescript
import { analyzeWithFallback } from '@/lib/telegram-bot-ai';

async function handleTelegramMessage(message: TelegramMessage) {
  const text = message.caption || message.text || '';
  const googleMapsUrl = extractGoogleMapsUrl(text);
  
  // Комбинированный подход
  const result = await analyzeWithFallback(text, googleMapsUrl);
  
  // result.source = 'ai' | 'manual'
  // result.confidence = 'high' | 'medium' | 'low'
  
  console.log(`Данные получены из: ${result.source} (confidence: ${result.confidence})`);
  
  // Сохраняем
  await saveProperty({
    ...result,
    telegram_user_id: message.from.id
  });
}
```

---

## 📊 СРАВНЕНИЕ ПОДХОДОВ

| Подход | AI | Manual Parser | Комбо |
|--------|-----|---------------|-------|
| **Точность** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Скорость** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Надёжность** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Стоимость** | $0.001/запрос | Бесплатно | $0.001/запрос |
| **Гибкость** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## ✅ РЕКОМЕНДАЦИЯ

**Использовать ВАРИАНТ C (Комбо):**

1. **Сначала AI анализ** - извлекает максимум данных
2. **Fallback на Manual Parser** - если AI не справился
3. **Лучшее из обоих миров** - надёжность + точность

---

## 🔧 СОЗДАТЬ ИНТЕГРАЦИОННЫЙ ФАЙЛ

**Файл:** `src/lib/telegram-bot-ai.ts`

```typescript
/**
 * TELEGRAM BOT AI INTEGRATION
 * Интеграция Telegram Bot с существующими AI сервисами
 */

import { analyzePropertyWithGroqCached } from '@/services/groqService';
import { expandShortUrlWithAI } from '@/services/perplexityService';
import { parseGoogleMapsURL } from '@/utils/googleMapsParser';
import { parsePropertyDescription } from './property-parser';
import { extractGoogleMapsUrl, DEFAULT_COORDINATES } from './tenant-bot-utils';

/**
 * Полный анализ сообщения с AI
 */
export async function analyzeTelegramMessage(
  text: string,
  googleMapsUrl?: string
) {
  // 1. Координаты
  let coordinates = DEFAULT_COORDINATES;
  
  if (googleMapsUrl) {
    // parseGoogleMapsURL автоматически использует Perplexity для коротких ссылок!
    const parsed = await parseGoogleMapsURL(googleMapsUrl);
    if (parsed && parsed.lat && parsed.lng) {
      coordinates = { lat: parsed.lat, lng: parsed.lng };
    }
  }
  
  // 2. AI анализ (Groq)
  const aiResult = await analyzePropertyWithGroqCached(text, coordinates);
  
  return {
    ...aiResult,
    coordinates,
    source: 'ai'
  };
}

/**
 * Гибридный подход: AI + Manual fallback
 */
export async function analyzeWithFallback(
  text: string,
  googleMapsUrl?: string
) {
  try {
    // Попытка 1: AI
    const aiResult = await analyzeTelegramMessage(text, googleMapsUrl);
    
    if (aiResult.coordinates && (aiResult.type || aiResult.price)) {
      return { ...aiResult, source: 'ai', confidence: 'high' };
    }
  } catch (error) {
    console.warn('AI fallback to manual parser:', error);
  }
  
  // Попытка 2: Manual
  const manualResult = parsePropertyDescription(text);
  
  let coordinates = DEFAULT_COORDINATES;
  if (googleMapsUrl) {
    const parsed = await parseGoogleMapsURL(googleMapsUrl);
    if (parsed) {
      coordinates = { lat: parsed.lat, lng: parsed.lng };
    }
  }
  
  return {
    ...manualResult,
    coordinates,
    source: 'manual',
    confidence: 'medium'
  };
}

/**
 * Обработка фотографий (используем существующую логику)
 */
export async function processPhotosForBot(
  photos: any[],
  userId: number,
  propertyId: string
): Promise<string[]> {
  // TODO: Интегрировать с telegram-photo-uploader.ts
  return [];
}
```

---

## 📋 ИТОГОВЫЙ ПЛАН

### ✅ Что УЖЕ готово:
1. ✅ AI сервисы (Groq + Perplexity)
2. ✅ Google Maps парсер (с AI для коротких ссылок)
3. ✅ Валидация через Google Maps API
4. ✅ Кэширование результатов

### 🆕 Что нужно создать:
1. **`src/lib/telegram-bot-ai.ts`** - интеграция с AI
2. **`src/lib/telegram-photo-uploader.ts`** - загрузка фото
3. **`src/pages/api/telegram-webhook.ts`** - webhook
4. **Личная карта** - страница отображения

---

## 🚀 СЛЕДУЮЩИЙ ШАГ

Создать файл `src/lib/telegram-bot-ai.ts` с интеграцией?

**Преимущества:**
- ✅ Используем существующий AI
- ✅ Не дублируем код
- ✅ Автоматическое разворачивание коротких ссылок
- ✅ Умное извлечение данных
- ✅ Fallback на manual parser

**Создаём?** 🔥
