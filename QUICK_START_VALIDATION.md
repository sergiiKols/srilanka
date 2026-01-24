# 🚀 Quick Start - POI Validation System

## 5-Minute Setup

### Step 1: Get Google Maps API Key (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create/select project
3. Enable APIs:
   - **Places API** ✓
   - **Geocoding API** ✓
4. Create credentials → API Key
5. Copy the key

### Step 2: Configure Environment (1 min)

```bash
# Create .env file
cp .env.example .env

# Add your API key
echo "PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE" >> .env
```

### Step 3: Start Server (1 min)

```bash
npm install
npm run dev
```

### Step 4: Test Validation (1 min)

Open in browser:
```
http://localhost:4321/test-validation
```

Click any test scenario button and see results!

## ✅ Done!

The validation system is now working. It's automatically integrated into PropertyImporterAI.

## Quick Usage

### In Your Component

```tsx
import POIValidator from '@/components/POIValidator';

<POIValidator
  coordinates={{ lat: 6.0099, lng: 80.2148 }}
  name="Unawatuna Beach"
  autoValidate={true}
  onValidationComplete={(result) => {
    console.log('Valid:', result.isValid);
    console.log('Confidence:', result.confidence);
  }}
/>
```

### Via API

```javascript
const response = await fetch('/api/validate-poi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    coordinates: { lat: 6.0099, lng: 80.2148 },
    name: "Unawatuna Beach"
  })
});

const result = await response.json();
```

### Direct Service Call

```typescript
import { validatePOI } from '@/services/googleMapsValidation';

const result = await validatePOI({
  coordinates: { lat: 6.0099, lng: 80.2148 },
  name: "Unawatuna Beach"
});
```

## 📖 Full Documentation

- **Complete Guide**: `POI_VALIDATION_SYSTEM.md`
- **Setup Details**: `VALIDATION_SETUP_GUIDE.md`
- **Implementation**: `VALIDATION_SUMMARY.md`

## 🎯 What It Does

✅ Validates coordinates with Google Maps  
✅ Matches place names  
✅ Calculates accuracy confidence  
✅ Provides detailed feedback  
✅ Suggests corrections  
✅ Auto-integrated in PropertyImporter  

## 🔍 Where It's Used

- **PropertyImporterAI**: Auto-validates after AI analysis
- **Test Page**: `/test-validation` for testing
- **API Endpoint**: `/api/validate-poi` for external calls

---

**Need help?** Check `VALIDATION_SETUP_GUIDE.md` for troubleshooting.
