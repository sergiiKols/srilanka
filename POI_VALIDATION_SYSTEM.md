# 🔍 POI Validation System - Documentation

## Overview

Система валидации POIs (Points of Interest) использует Google Maps API для проверки правильности координат и информации о местах перед их сохранением в базу данных.

## Features

### ✅ Core Validation Features

1. **Coordinate Validation**
   - Проверка диапазона координат (lat: -90 to 90, lng: -180 to 180)
   - Reverse geocoding для проверки, что координаты соответствуют реальному месту
   - Предупреждение если координаты в океане или недействительной зоне

2. **Name Matching**
   - Поиск ближайших мест в Google Maps по координатам
   - Сравнение названий с использованием алгоритма Левенштейна
   - Match score от 0 до 100%

3. **Distance Calculation**
   - Расчет расстояния от введенных координат до найденного места в Google Maps
   - Предупреждение если расстояние превышает настроенный порог
   - Предложение использовать более точные координаты от Google

4. **Place Details Enrichment**
   - Получение дополнительной информации о месте:
     - Адрес
     - Рейтинг и количество отзывов
     - Типы места (lodging, restaurant, etc.)
     - Фотографии
     - Веб-сайт
     - Телефон
     - Часы работы

5. **Confidence Score**
   - Общий показатель уверенности от 0 до 1
   - Учитывает: match score, расстояние, наличие рейтинга, отзывов, фотографий
   - Рекомендации на основе уровня уверенности

## Architecture

### Components

```
src/
├── types/
│   └── validation.types.ts          # TypeScript типы для валидации
├── services/
│   └── googleMapsValidation.ts      # Сервис для работы с Google Maps API
└── components/
    └── POIValidator.tsx             # React компонент для UI валидации
```

### Integration

Валидация интегрирована в `PropertyImporterAI.tsx`:
- Автоматически запускается после получения результата от AI
- Показывает предупреждения если координаты неточные
- Позволяет использовать координаты Google Maps вместо введенных
- Предупреждает перед сохранением если confidence < 50%

## API

### Validation Service

#### `validatePOI(request, config?)`

Основная функция валидации POI.

**Parameters:**
```typescript
interface POIValidationRequest {
  coordinates: { lat: number; lng: number };
  name?: string;
  address?: string;
  type?: string;
  expectedRadius?: number; // meters
}

interface ValidationConfig {
  types: ValidationType[];
  strictMode: boolean;
  maxDistanceMeters: number;
  requireGoogleMatch: boolean;
  minConfidence: number;
}
```

**Returns:**
```typescript
interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1
  matchScore: number; // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
  placeDetails?: GooglePlaceDetails;
  distanceFromInput: number; // meters
}
```

**Example:**
```typescript
const result = await validatePOI(
  {
    coordinates: { lat: 6.0099, lng: 80.2148 },
    name: "Unawatuna Beach",
    type: "tourist_attraction"
  },
  {
    strictMode: false,
    maxDistanceMeters: 100,
    requireGoogleMatch: true,
    minConfidence: 0.7
  }
);

if (result.isValid) {
  console.log(`✅ Valid with ${result.confidence * 100}% confidence`);
  console.log(`Match score: ${result.matchScore}%`);
} else {
  console.log(`❌ Invalid: ${result.issues.map(i => i.message).join(', ')}`);
}
```

#### `searchNearbyPlaces(request)`

Поиск ближайших мест по координатам.

**Returns:**
```typescript
interface NearbySearchResult {
  places: GooglePlaceDetails[];
  bestMatch?: GooglePlaceDetails;
  alternatives: GooglePlaceDetails[];
}
```

#### `getPlaceDetails(placeId)`

Получить детальную информацию о месте по Place ID.

#### `validateMultiplePOIs(requests, config?)`

Batch валидация нескольких POIs с rate limiting.

### React Components

#### `<POIValidator>`

Компонент для валидации POI с визуальным интерфейсом.

**Props:**
```typescript
interface POIValidatorProps {
  coordinates: { lat: number; lng: number };
  name?: string;
  address?: string;
  type?: string;
  config?: Partial<ValidationConfig>;
  onValidationComplete?: (result: ValidationResult) => void;
  autoValidate?: boolean;
  showDetails?: boolean;
}
```

**Usage:**
```tsx
<POIValidator
  coordinates={{ lat: 6.0099, lng: 80.2148 }}
  name="Unawatuna Beach"
  type="tourist_attraction"
  autoValidate={true}
  showDetails={true}
  onValidationComplete={(result) => {
    console.log('Validation complete:', result);
  }}
/>
```

#### `<POIValidationBadge>`

Компактный badge показывающий только статус валидации.

```tsx
<POIValidationBadge validationResult={validationResult} />
```

## Configuration

### Default Config

```typescript
const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  types: ['coordinates', 'name', 'address'],
  strictMode: false,
  maxDistanceMeters: 100,
  requireGoogleMatch: true,
  minConfidence: 0.7,
};
```

### Environment Variables

Необходимо настроить Google Maps API ключ:

```env
PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Required APIs:**
- Places API
- Geocoding API
- Maps JavaScript API (для отображения карт)

## Validation Logic

### Confidence Score Calculation

```
Base confidence: 0.4

Match Score contribution:
- matchScore > 80%: +0.3
- matchScore > 60%: +0.2
- matchScore > 40%: +0.1

Distance contribution:
- distance < 50m: +0.2
- distance < 100m: +0.1

Quality signals:
- High rating (≥4.0): +0.05
- Enough reviews (≥5): +0.05
- Has photos: +0.05

Max confidence: 1.0
```

### Issue Severity Levels

1. **Error**: Критические проблемы (невалидные координаты, нет совпадений)
2. **Warning**: Предупреждения (несоответствие названия, большое расстояние)
3. **Info**: Информационные сообщения (различия в адресе)

## Testing

### Test Page

Доступна тестовая страница: `/test-validation`

**Test Scenarios:**
- ✅ Valid coordinates with exact name match
- ⚠️ Valid coordinates with wrong name
- ❌ Invalid coordinates (ocean, out of range)
- 📍 Coordinates with distance offset

### Example Test Cases

```typescript
// Test 1: Perfect match
await validatePOI({
  coordinates: { lat: 6.0099, lng: 80.2148 },
  name: "Unawatuna Beach",
  type: "tourist_attraction"
});
// Expected: isValid=true, confidence≥0.8, matchScore≥90

// Test 2: Name mismatch
await validatePOI({
  coordinates: { lat: 6.0099, lng: 80.2148 },
  name: "Wrong Beach Name",
  type: "tourist_attraction"
});
// Expected: isValid=true, confidence≈0.6, matchScore<50, warnings

// Test 3: Invalid coordinates
await validatePOI({
  coordinates: { lat: 0, lng: 0 },
  name: "Invalid Location"
});
// Expected: isValid=false, confidence≈0, errors
```

## Integration Examples

### In PropertyImporter

```tsx
const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

// After AI analysis completes
const handleAIComplete = (aiResult) => {
  // Auto-validate coordinates
  setShowValidation(true);
};

// Handle validation result
const handleValidationComplete = (result: ValidationResult) => {
  setValidationResult(result);
  
  if (result.placeDetails && result.distanceFromInput > 50) {
    // Suggest using Google coordinates
    showGoogleCoordinatesSuggestion();
  }
};

// Before saving
const handleSave = () => {
  if (validationResult && !validationResult.isValid && validationResult.confidence < 0.5) {
    const confirmSave = confirm(
      `Low validation confidence (${Math.round(validationResult.confidence * 100)}%). Save anyway?`
    );
    if (!confirmSave) return;
  }
  
  // Save property
};
```

### Standalone Usage

```tsx
import { validatePOI } from '@/services/googleMapsValidation';

async function checkLocation(lat: number, lng: number, name: string) {
  const result = await validatePOI({
    coordinates: { lat, lng },
    name
  });
  
  if (!result.isValid) {
    console.error('Invalid location:', result.issues);
    return false;
  }
  
  if (result.confidence < 0.7) {
    console.warn('Low confidence:', result.suggestions);
  }
  
  return result.placeDetails;
}
```

## Best Practices

### 1. Always Validate Before Saving

```tsx
// ✅ Good
const result = await validatePOI(request);
if (result.isValid && result.confidence >= 0.7) {
  saveToDatabase(data);
}

// ❌ Bad
saveToDatabase(data); // No validation
```

### 2. Use Auto-Validation in Import Flows

```tsx
<POIValidator
  coordinates={coordinates}
  name={name}
  autoValidate={true}  // ✅ Validate automatically
  onValidationComplete={handleResult}
/>
```

### 3. Show Validation Results to Users

```tsx
{validationResult && (
  <div>
    <div>Confidence: {Math.round(validationResult.confidence * 100)}%</div>
    {validationResult.issues.map(issue => (
      <Alert severity={issue.severity}>{issue.message}</Alert>
    ))}
  </div>
)}
```

### 4. Provide Option to Use Google Coordinates

```tsx
{validationResult?.placeDetails && distanceFromInput > 50 && (
  <button onClick={useGoogleCoordinates}>
    Use Google Maps coordinates ({Math.round(distanceFromInput)}m more accurate)
  </button>
)}
```

### 5. Handle API Errors Gracefully

```tsx
try {
  const result = await validatePOI(request);
} catch (error) {
  console.error('Validation failed:', error);
  // Continue with manual verification or show error to user
  showFallbackUI();
}
```

## Limitations

1. **API Quota**: Google Places API имеет лимиты запросов
   - Используйте batch validation с rate limiting
   - Кэшируйте результаты где возможно

2. **Cost**: Places API запросы платные
   - ~$0.017 per request (Nearby Search)
   - ~$0.017 per request (Place Details)

3. **Accuracy**: Зависит от данных Google Maps
   - Новые места могут отсутствовать
   - Названия могут отличаться на разных языках

4. **Rate Limiting**: Встроенная задержка 200ms между запросами
   - Для batch validation может занять время
   - Рассмотрите асинхронную обработку для больших объемов

## Troubleshooting

### Issue: "API error: REQUEST_DENIED"
**Solution**: Проверьте что API ключ настроен и имеет доступ к Places API

### Issue: "No matching place found"
**Solution**: 
- Проверьте координаты
- Увеличьте `expectedRadius`
- Установите `requireGoogleMatch: false` в config

### Issue: Low confidence scores
**Solution**:
- Проверьте точность координат
- Убедитесь что название соответствует Google Maps
- Добавьте `type` для более точного поиска

### Issue: High API costs
**Solution**:
- Кэшируйте результаты валидации
- Используйте валидацию только для критичных операций
- Рассмотрите batch обработку в off-peak hours

## Future Enhancements

- [ ] Кэширование результатов валидации
- [ ] Поддержка других картографических сервисов (OpenStreetMap, etc.)
- [ ] Offline валидация с локальной базой данных
- [ ] Bulk import с автоматической валидацией
- [ ] Webhook notifications для failed validations
- [ ] Analytics dashboard для validation metrics
- [ ] Multi-language support для названий мест

## Support

Для вопросов и проблем:
- См. тестовую страницу: `/test-validation`
- Проверьте документацию Google Places API
- Изучите примеры в `src/components/PropertyImporterAI.tsx`

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-22  
**Author**: Rovo Dev
