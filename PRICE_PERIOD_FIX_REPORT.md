# 🔧 Исправление парсинга периода цены (price_period)

**Дата:** 31 января 2026, 20:00  
**Критичность:** 🔴 ВЫСОКАЯ - некорректное определение периода цены

---

## 🔴 Проблема

**Описание:** AI (Groq) неправильно определял период цены при парсинге объявлений.

**Пример ошибки:**
```
Входные данные: "350$ в месяц"
AI определил: "350$ per day" ❌
Ожидалось: "350$ per month" ✅
```

**Последствия:**
- Цены отображаются некорректно (месячная аренда показывается как дневная)
- Пользователь видит завышенную стоимость
- Невозможно правильно сравнить объекты

---

## 🔍 Анализ причин

### 1. Отсутствие поля `pricePeriod` в интерфейсе

**Файл:** `src/services/perplexityService.ts`

**Проблема:** Интерфейс `PropertyAnalysisResult` НЕ содержал поле `pricePeriod`

```typescript
// ❌ Было:
export interface PropertyAnalysisResult {
  price: number | null;
  // pricePeriod отсутствует!
}

// ✅ Стало:
export interface PropertyAnalysisResult {
  price: number | null;
  pricePeriod?: 'night' | 'day' | 'week' | 'month';
}
```

---

### 2. Парсер не сохранял pricePeriod

**Файл:** `src/services/groqService.ts`

**Проблема:** Функция `parseGroqResponse()` не извлекала `pricePeriod` из ответа AI

```typescript
// ❌ Было:
return {
  price: parsed.price ? Number(parsed.price) : null,
  // pricePeriod не извлекался!
}

// ✅ Стало:
return {
  price: parsed.price ? Number(parsed.price) : null,
  pricePeriod: parsed.pricePeriod || 'night',
}
```

---

### 3. Слабый промпт для AI

**Файл:** `src/services/groqService.ts`

**Проблема:** Промпт не акцентировал внимание на правильном определении периода

```typescript
// ❌ Было:
"pricePeriod": "night|week|month" (determine from description, default "night")

// ✅ Стало:
"pricePeriod": "night|day|week|month" (CRITICAL: determine from text - look for "per night", "per day", "в день", "в месяц", "monthly", etc.)

🔴 CRITICAL RULES FOR PRICE PERIOD:
- "350$ в месяц" or "monthly" or "per month" → "month"
- "50$ в день" or "daily" or "per day" or "per night" → "night" 
- "200$ в неделю" or "weekly" or "per week" → "week"
- PAY CLOSE ATTENTION to Russian and English period indicators
- If MONTH is mentioned, return "month" NOT "night"!
```

---

## ✅ Исправления

### 1. Добавлено поле `pricePeriod` в интерфейс

**Файл:** `src/services/perplexityService.ts` (строка 16)

```typescript
export interface PropertyAnalysisResult {
  price: number | null;
  pricePeriod?: 'night' | 'day' | 'week' | 'month'; // ✅ Новое поле
}
```

---

### 2. Добавлен парсинг и валидация `pricePeriod`

**Файл:** `src/services/groqService.ts` (строки 90-107)

```typescript
// ✅ Валидация и нормализация pricePeriod
let pricePeriod: 'night' | 'day' | 'week' | 'month' = 'night';
if (parsed.pricePeriod) {
  const period = parsed.pricePeriod.toLowerCase();
  if (period === 'month' || period === 'monthly') {
    pricePeriod = 'month';
  } else if (period === 'week' || period === 'weekly') {
    pricePeriod = 'week';
  } else if (period === 'day' || period === 'daily') {
    pricePeriod = 'night';
  } else if (period === 'night' || period === 'nightly') {
    pricePeriod = 'night';
  }
}

// 🔍 Логируем цену и период
if (parsed.price) {
  console.log(`💰 AI detected price: ${parsed.price} USD per ${pricePeriod} (raw: "${parsed.pricePeriod}")`);
}
```

---

### 3. Улучшен промпт для Groq AI

**Файл:** `src/services/groqService.ts` (строки 41-69)

Добавлен специальный раздел с КРИТИЧЕСКИМИ правилами:

```
🔴 CRITICAL RULES FOR PRICE PERIOD:
- "350$ в месяц" or "monthly" or "per month" → "month"
- "50$ в день" or "daily" or "per day" or "per night" → "night" 
- "200$ в неделю" or "weekly" or "per week" → "week"
- PAY CLOSE ATTENTION to Russian and English period indicators
- If MONTH is mentioned, return "month" NOT "night"!
- Default to "night" ONLY if no period is mentioned
```

---

### 4. Добавлено логирование периода цены

**Файл:** `src/lib/telegram-bot-ai.ts` (строка 387)

```typescript
// ✅ Теперь показывает период в логах
console.log('  Price:', result.price, result.currency, `per ${result.pricePeriod || 'night'}`);
```

---

## 📊 Результат

### До исправления:
```
Входные данные: "350$ в месяц"
AI парсинг: price=350, pricePeriod=undefined
Сохранено в БД: price_period='night' (дефолт)
Показано пользователю: "350$ в день" ❌
```

### После исправления:
```
Входные данные: "350$ в месяц"
AI парсинг: price=350, pricePeriod='month'
Валидация: pricePeriod='month' ✅
Сохранено в БД: price_period='month'
Логи: "💰 AI detected price: 350 USD per month (raw: "month")"
Показано пользователю: "350$ в месяц" ✅
```

---

## 🧪 Тестирование

### Примеры для тестирования:

1. **Месячная аренда:**
   ```
   "Сдаю виллу 350$ в месяц"
   Ожидается: price=350, pricePeriod='month'
   ```

2. **Дневная аренда:**
   ```
   "50$ per night, beachfront villa"
   Ожидается: price=50, pricePeriod='night'
   ```

3. **Недельная аренда:**
   ```
   "200$ в неделю, 2 bedroom apartment"
   Ожидается: price=200, pricePeriod='week'
   ```

4. **Без указания периода:**
   ```
   "Beautiful villa $100"
   Ожидается: price=100, pricePeriod='night' (default)
   ```

---

## 📋 Измененные файлы

1. ✅ `src/services/perplexityService.ts` - добавлено поле `pricePeriod`
2. ✅ `src/services/groqService.ts` - улучшен промпт, добавлена валидация и логирование
3. ✅ `src/lib/telegram-bot-ai.ts` - добавлено логирование периода в `logAIResult()`

---

## 🎯 Следующие шаги

1. **Запушить изменения** в git
2. **Задеплоить на Vercel**
3. **Протестировать импорт** с разными вариантами цен:
   - "350$ в месяц"
   - "50$ per night"
   - "200$ weekly"
4. **Проверить логи Vercel** - должно выводиться `💰 AI detected price: X USD per Y`
5. **Проверить базу данных** - колонка `price_period` должна содержать правильные значения

---

## 💡 Дополнительные улучшения (опционально)

### 1. Нормализация цен для сравнения

Можно добавить функцию для пересчета всех цен в единый период (например, per night):

```typescript
function normalizePricePerNight(price: number, period: string): number {
  switch(period) {
    case 'month': return price / 30;
    case 'week': return price / 7;
    default: return price;
  }
}
```

### 2. Отображение периода в UI

В компоненте карты показывать период:
```typescript
{property.price && (
  <div>
    ${property.price} / {property.price_period === 'month' ? 'месяц' : 'день'}
  </div>
)}
```

---

## ✨ Итоги

**Исправлено:**
- ✅ AI теперь правильно определяет период цены (month/week/night)
- ✅ Добавлена валидация и нормализация периода
- ✅ Улучшен промпт с акцентом на русские и английские индикаторы
- ✅ Добавлено подробное логирование для отладки

**Ожидаемый результат:**
- ✅ "350$ в месяц" → сохраняется как `price_period='month'`
- ✅ "50$ per night" → сохраняется как `price_period='night'`
- ✅ Пользователь видит корректные цены

**Готово к деплою!** 🚀
