# 🔍 POI Validation System - Setup Guide

## Quick Start

### 1. Get Google Maps API Key

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите следующие APIs:
   - **Places API** (для поиска мест)
   - **Geocoding API** (для проверки координат)
   - **Maps JavaScript API** (опционально, для отображения карт)

4. Создайте API ключ:
   - Navigation menu → APIs & Services → Credentials
   - Create Credentials → API Key
   - Скопируйте созданный ключ

### 2. Configure Environment Variables

Создайте файл `.env` в корне проекта (скопируйте из `.env.example`):

```bash
cp .env.example .env
```

Добавьте Google Maps API ключ:

```env
PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test Validation System

Откройте в браузере одну из тестовых страниц:

- **Astro Test Page**: http://localhost:4321/test-validation
- **Standalone Test**: http://localhost:4321/tmp_rovodev_test_validation.html

## API Configuration

### Required Google APIs

| API | Purpose | Cost per 1000 requests |
|-----|---------|----------------------|
| Places API - Nearby Search | Поиск мест по координатам | ~$17 |
| Places API - Place Details | Детальная информация о месте | ~$17 |
| Geocoding API | Проверка координат | ~$5 |

### API Restrictions (Recommended)

Для безопасности, настройте ограничения для API ключа:

1. **Application restrictions**:
   - HTTP referrers (websites)
   - Добавьте домены: `localhost:*`, `yourdomain.com/*`

2. **API restrictions**:
   - Restrict key
   - Select APIs: Places API, Geocoding API

## Usage Examples

### In React Component

```tsx
import POIValidator from '@/components/POIValidator';

function MyComponent() {
  return (
    <POIValidator
      coordinates={{ lat: 6.0099, lng: 80.2148 }}
      name="Unawatuna Beach"
      type="tourist_attraction"
      autoValidate={true}
      onValidationComplete={(result) => {
        console.log('Validation:', result);
      }}
    />
  );
}
```

### Via API Endpoint

```javascript
const response = await fetch('/api/validate-poi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coordinates: { lat: 6.0099, lng: 80.2148 },
    name: "Unawatuna Beach",
    type: "tourist_attraction",
    config: {
      strictMode: false,
      maxDistanceMeters: 100,
      requireGoogleMatch: true,
      minConfidence: 0.7
    }
  })
});

const result = await response.json();
console.log('Validation result:', result);
```

### Direct Service Call

```typescript
import { validatePOI } from '@/services/googleMapsValidation';

const result = await validatePOI({
  coordinates: { lat: 6.0099, lng: 80.2148 },
  name: "Unawatuna Beach",
  type: "tourist_attraction"
});

if (result.isValid) {
  console.log('✅ Valid POI');
  console.log('Confidence:', result.confidence);
} else {
  console.log('❌ Invalid POI');
  console.log('Issues:', result.issues);
}
```

## Integration with PropertyImporter

Система валидации уже интегрирована в `PropertyImporterAI`:

1. **Auto-validation**: Автоматически запускается после AI анализа
2. **Visual feedback**: Показывает результаты валидации с цветовым кодированием
3. **Google coordinates suggestion**: Предлагает использовать более точные координаты от Google
4. **Save protection**: Предупреждает перед сохранением с низкой уверенностью

### Workflow

```
User Input → AI Analysis → Get Coordinates → Auto Validate
                                              ↓
                                    Validation Results
                                    ├─ ✅ Valid (confidence ≥ 70%)
                                    ├─ ⚠️ Warning (confidence 50-70%)
                                    └─ ❌ Invalid (confidence < 50%)
                                              ↓
                                    User Reviews Results
                                    ├─ Use AI coordinates
                                    ├─ Use Google coordinates
                                    └─ Manual correction
                                              ↓
                                        Save to Database
```

## Testing

### Test Scenarios

1. **Perfect Match** (✅)
   - Coordinates: 6.0099, 80.2148
   - Name: "Unawatuna Beach"
   - Expected: Valid, confidence ≥ 80%, match ≥ 90%

2. **Name Mismatch** (⚠️)
   - Coordinates: 6.0099, 80.2148
   - Name: "Wrong Beach Name"
   - Expected: Valid, confidence ≈ 60%, match < 50%, warnings

3. **Invalid Coordinates** (❌)
   - Coordinates: 0, 0
   - Name: "Invalid Location"
   - Expected: Invalid, confidence ≈ 0, errors

4. **Distance Offset** (⚠️)
   - Coordinates slightly off from actual location
   - Expected: Valid, distance warning, suggest Google coords

### Running Tests

```bash
# Start dev server
npm run dev

# Open test page
open http://localhost:4321/test-validation

# Or use standalone HTML test
open http://localhost:4321/tmp_rovodev_test_validation.html
```

### Manual Testing Checklist

- [ ] Valid coordinates with correct name → Should pass with high confidence
- [ ] Valid coordinates with wrong name → Should pass with warnings
- [ ] Invalid coordinates (ocean, out of range) → Should fail
- [ ] Coordinates with 50m+ offset → Should suggest Google coordinates
- [ ] Place without Google Maps entry → Should handle gracefully
- [ ] API key missing/invalid → Should show clear error message

## Troubleshooting

### "API key not configured"

**Problem**: `PUBLIC_GOOGLE_MAPS_API_KEY` not set

**Solution**:
1. Create `.env` file in project root
2. Add: `PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
3. Restart dev server

### "REQUEST_DENIED"

**Problem**: API key doesn't have access to required APIs

**Solution**:
1. Go to Google Cloud Console
2. Enable Places API and Geocoding API
3. Wait a few minutes for propagation
4. Try again

### "ZERO_RESULTS"

**Problem**: No places found near coordinates

**Solution**:
- Check coordinates are correct
- Increase `expectedRadius` parameter
- Verify location has Google Maps data
- Set `requireGoogleMatch: false` to skip

### "OVER_QUERY_LIMIT"

**Problem**: Exceeded API quota

**Solution**:
- Check usage in Google Cloud Console
- Implement rate limiting
- Cache validation results
- Upgrade API quota if needed

### CORS Errors

**Problem**: Browser blocking API requests

**Solution**:
- Use server-side API endpoint (`/api/validate-poi`)
- Configure API key restrictions for your domain
- Don't call Google APIs directly from browser in production

## Cost Optimization

### Strategies

1. **Cache Results**
   ```typescript
   // Cache validation results for 24 hours
   const cache = new Map<string, ValidationResult>();
   const cacheKey = `${lat},${lng},${name}`;
   
   if (cache.has(cacheKey)) {
     return cache.get(cacheKey);
   }
   ```

2. **Batch Processing**
   ```typescript
   // Validate multiple POIs with delay
   const results = await validateMultiplePOIs(requests, config);
   ```

3. **Conditional Validation**
   ```typescript
   // Only validate if confidence is low
   if (aiResult.confidence < 0.7) {
     await validatePOI(request);
   }
   ```

4. **Use Nearby Search Only**
   ```typescript
   // Skip Place Details if not needed
   const searchResult = await searchNearbyPlaces(request);
   // Don't call getPlaceDetails unless necessary
   ```

### Cost Monitoring

Track API usage in Google Cloud Console:
- Navigation menu → APIs & Services → Dashboard
- Set up budget alerts
- Monitor daily usage trends

## Production Deployment

### Checklist

- [ ] API key configured in production environment
- [ ] API restrictions set (domain whitelist)
- [ ] Rate limiting implemented
- [ ] Error handling and fallbacks
- [ ] Caching strategy in place
- [ ] Monitoring and alerts configured
- [ ] Budget limits set in Google Cloud
- [ ] Backup validation method (optional)

### Environment Variables

```env
# Production .env
PUBLIC_GOOGLE_MAPS_API_KEY=prod_api_key_here
```

For serverless deployments (Vercel, Netlify):
1. Add environment variables in dashboard
2. Redeploy after adding

### Security Best Practices

1. **Never commit API keys** to repository
2. **Use environment variables** for all sensitive data
3. **Restrict API key** to specific domains/IPs
4. **Monitor usage** for unexpected spikes
5. **Implement rate limiting** on your API endpoint
6. **Validate input** before calling Google APIs
7. **Handle errors gracefully** without exposing keys

## Support

- 📖 Documentation: `POI_VALIDATION_SYSTEM.md`
- 🧪 Test Page: `/test-validation`
- 🔗 Google Places API Docs: https://developers.google.com/maps/documentation/places/web-service
- 💰 Pricing: https://developers.google.com/maps/billing-and-pricing/pricing

---

**Setup Complete! 🎉**

The POI validation system is now ready to use. Start testing with the test page or integrate into your application.
