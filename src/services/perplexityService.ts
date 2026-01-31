/**
 * Интеграция с Perplexity AI для анализа объектов недвижимости
 */

export interface PropertyAnalysisRequest {
  googleMapsUrl: string; // Теперь отправляем URL, а не координаты!
  description: string;
  images?: string[];
  sources?: string[]; // Источники данных (Google Maps, Airbnb, etc.)
}

export interface PropertyAnalysisResult {
  title: string;
  propertyType: 'villa' | 'apartment' | 'house' | 'room' | 'hostel' | 'hotel';
  rooms: number;
  bathrooms: number;
  price: number | null;
  pricePeriod?: 'night' | 'day' | 'week' | 'month'; // ✅ Добавлено поле для периода цены
  beachDistance: number;
  wifiSpeed: number;
  amenities: string[];
  features: {
    pool: boolean;
    parking: boolean;
    breakfast: boolean;
    airConditioning: boolean;
    kitchen: boolean;
    petFriendly: boolean;
    security: 'none' | 'standard' | 'high' | 'gated';
    beachfront: boolean;
    garden: boolean;
  };
  area: 'Unawatuna' | 'Hikkaduwa' | 'Mirissa' | 'Weligama';
  cleanDescription: string;
  confidence: number; // 0-1, насколько AI уверен в результатах
}

/**
 * Строит промпт для Perplexity API
 */
function buildPrompt(request: PropertyAnalysisRequest): string {
  const { googleMapsUrl, description, sources = [] } = request;
  
  return `You are a property listing analyzer for vacation rentals in Sri Lanka. 

🔴 CRITICAL TASK 1: EXPAND SHORT URLS
If the Google Maps URL is a SHORT LINK (contains "goo.gl" or "maps.app.goo.gl"), you MUST:
- Visit the URL and follow ALL redirects to get the FULL expanded URL
- The expanded URL MUST contain coordinates (like @6.0135,80.2410 or ?q=6.0135,80.2410)
- Return the FULL expanded URL in the "expandedUrl" field

🔴 CRITICAL TASK 2: EXTRACT COORDINATES
Extract latitude and longitude from the URL:
- Look for patterns like @6.0135,80.2410 or ?q=6.0135,80.2410
- The coordinates MUST be present - if you cannot find them, the task has FAILED

🔴 CRITICAL TASK 3: ANALYZE PROPERTY
Extract all property details from the description.

GOOGLE MAPS URL (MAY BE SHORT):
${googleMapsUrl}

PROPERTY DESCRIPTION:
${description}

${sources.length > 0 ? `DATA SOURCES: ${sources.join(', ')}` : ''}

🚨 MANDATORY REQUIREMENTS:
1. If URL contains "goo.gl" or "maps.app.goo.gl" → Visit it and return FULL expanded URL with coordinates
2. Extract coordinates (lat, lng) - MUST NOT be null
3. If expandedUrl is provided, it MUST contain coordinates like @6.0135,80.2410

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "expandedUrl": "FULL Google Maps URL with coordinates (e.g., https://www.google.com/maps/place/@6.0135,80.2410,17z) - REQUIRED if input was short link",
  "coordinates": {
    "lat": 6.0135 (REQUIRED: latitude from URL - MUST NOT be null),
    "lng": 80.2410 (REQUIRED: longitude from URL - MUST NOT be null),
    "placeName": "Place name from Google Maps (if available)"
  },
  "title": "short descriptive property name",
  "propertyType": "villa|apartment|house|room|hostel|hotel",
  "rooms": number (bedrooms count, 1 if studio),
  "bathrooms": number,
  "price": number (USD per night, null if not mentioned),
  "beachDistance": number (meters to nearest beach, estimate if not exact),
  "wifiSpeed": number (Mbps, 50 if not mentioned but wifi available),
  "amenities": ["Pool", "Parking", "Wifi", "Air Conditioning", "Kitchen", "Garden", "Breakfast", "Hot Water"],
  "features": {
    "pool": boolean,
    "parking": boolean,
    "breakfast": boolean,
    "airConditioning": boolean,
    "kitchen": boolean,
    "petFriendly": boolean,
    "security": "none|standard|high|gated",
    "beachfront": boolean (within 50m of beach),
    "garden": boolean
  },
  "area": "Unawatuna|Hikkaduwa|Mirissa|Weligama" (determine from coordinates or description),
  "cleanDescription": "rewritten professional 2-3 sentence description highlighting key features",
  "confidence": 0.95 (your confidence in the extracted data, 0-1)
}

EXAMPLE for short URL:
Input: "https://maps.app.goo.gl/xxx"
Output: {
  "expandedUrl": "https://www.google.com/maps/place/@6.0135,80.2410,17z/...",
  "coordinates": { "lat": 6.0135, "lng": 80.2410, "placeName": "Unawatuna" },
  ...
}

RULES:
- Be precise with numbers
- If information is missing, use reasonable defaults for Sri Lanka vacation rentals
- For area, use coordinates to determine closest: Unawatuna (6.0°N), Hikkaduwa (6.1°N), Mirissa (5.9°N), Weligama (5.97°N)
- Return ONLY the JSON object, no additional text`;
}

/**
 * Парсит ответ от Perplexity API
 */
function parseAIResponse(response: any): PropertyAnalysisResult & { coordinates?: { lat: number; lng: number } } {
  try {
    const content = response.choices[0].message.content;
    
    // Убираем markdown форматирование если есть
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Извлекаем координаты если AI вернул их
    const coordinates = parsed.coordinates ? {
      lat: Number(parsed.coordinates.lat),
      lng: Number(parsed.coordinates.lng)
    } : undefined;
    
    // Валидация и приведение типов
    return {
      title: parsed.title || 'Untitled Property',
      propertyType: parsed.propertyType || 'villa',
      rooms: Number(parsed.rooms) || 1,
      bathrooms: Number(parsed.bathrooms) || 1,
      price: parsed.price ? Number(parsed.price) : null,
      beachDistance: Number(parsed.beachDistance) || 100,
      wifiSpeed: Number(parsed.wifiSpeed) || 50,
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
      features: {
        pool: Boolean(parsed.features?.pool),
        parking: Boolean(parsed.features?.parking),
        breakfast: Boolean(parsed.features?.breakfast),
        airConditioning: Boolean(parsed.features?.airConditioning),
        kitchen: Boolean(parsed.features?.kitchen),
        petFriendly: Boolean(parsed.features?.petFriendly),
        security: parsed.features?.security || 'standard',
        beachfront: Boolean(parsed.features?.beachfront),
        garden: Boolean(parsed.features?.garden)
      },
      area: parsed.area || 'Unawatuna',
      cleanDescription: parsed.cleanDescription || parsed.title,
      confidence: Number(parsed.confidence) || 0.8,
      coordinates: coordinates // Добавляем координаты от AI
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
}

/**
 * Основная функция анализа через Perplexity API
 */
export async function analyzePropertyWithAI(
  request: PropertyAnalysisRequest
): Promise<PropertyAnalysisResult> {
  
  const API_KEY = import.meta.env.PERPLEXITY_API_KEY || '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';
  const API_URL = 'https://api.perplexity.ai/chat/completions';
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a property listing analyzer. Extract structured data accurately and return only valid JSON.'
          },
          {
            role: 'user',
            content: buildPrompt(request)
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return parseAIResponse(data);
    
  } catch (error) {
    console.error('Perplexity API call failed:', error);
    throw error;
  }
}

/**
 * Гибридная функция: локальный парсинг + AI проверка
 */
export async function analyzePropertyHybrid(
  request: PropertyAnalysisRequest,
  onQuickResult?: (result: Partial<PropertyAnalysisResult>) => void
): Promise<PropertyAnalysisResult> {
  
  // Шаг 1: Быстрый локальный парсинг (мгновенный результат)
  if (onQuickResult) {
    const { parseDescription } = await import('../utils/descriptionParser');
    const quickResult = parseDescription(request.description);
    
    onQuickResult({
      title: quickResult.title || 'Property',
      rooms: quickResult.rooms || 1,
      bathrooms: quickResult.bathrooms || 1,
      wifiSpeed: quickResult.wifiSpeed || 50,
      amenities: quickResult.amenities,
      features: {
        pool: quickResult.features.pool,
        parking: quickResult.features.parking,
        breakfast: quickResult.features.breakfast,
        airConditioning: quickResult.features.airConditioning,
        kitchen: quickResult.features.kitchen,
        petFriendly: quickResult.features.petFriendly,
        security: 'standard',
        beachfront: quickResult.features.beachfront,
        garden: quickResult.features.garden
      }
    } as any);
  }
  
  // Шаг 2: AI анализ (более точный, но медленнее)
  try {
    const aiResult = await analyzePropertyWithAI(request);
    return aiResult;
  } catch (error) {
    // Fallback: если AI упал, возвращаем локальный результат
    console.warn('AI analysis failed, using local parsing');
    const { parseDescription } = await import('../utils/descriptionParser');
    const fallbackResult = parseDescription(request.description);
    
    return {
      title: fallbackResult.title || 'Property',
      propertyType: (fallbackResult.propertyType as any) || 'villa',
      rooms: fallbackResult.rooms || 1,
      bathrooms: fallbackResult.bathrooms || 1,
      price: null,
      beachDistance: 100,
      wifiSpeed: fallbackResult.wifiSpeed || 50,
      amenities: fallbackResult.amenities,
      features: {
        pool: fallbackResult.features.pool,
        parking: fallbackResult.features.parking,
        breakfast: fallbackResult.features.breakfast,
        airConditioning: fallbackResult.features.airConditioning,
        kitchen: fallbackResult.features.kitchen,
        petFriendly: fallbackResult.features.petFriendly,
        security: 'standard',
        beachfront: fallbackResult.features.beachfront,
        garden: fallbackResult.features.garden
      },
      area: 'Unawatuna',
      cleanDescription: request.description.slice(0, 200),
      confidence: 0.5 // Низкая уверенность для локального парсинга
    };
  }
}

/**
 * Кэш для результатов AI анализа
 */
const aiCache = new Map<string, { result: PropertyAnalysisResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

function getCacheKey(request: PropertyAnalysisRequest): string {
  const hash = `${request.googleMapsUrl}:${request.description.slice(0, 100)}`;
  return hash;
}

/**
 * Анализ с кэшированием (экономия API вызовов)
 */
export async function analyzePropertyCached(
  request: PropertyAnalysisRequest,
  onQuickResult?: (result: Partial<PropertyAnalysisResult>) => void
): Promise<PropertyAnalysisResult> {
  
  const cacheKey = getCacheKey(request);
  const cached = aiCache.get(cacheKey);
  
  // Проверяем кэш
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached AI result');
    return cached.result;
  }
  
  // Выполняем гибридный анализ
  const result = await analyzePropertyHybrid(request, onQuickResult);
  
  // Сохраняем в кэш
  aiCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Разворачивает короткую ссылку Google Maps через Perplexity AI
 * AI имеет доступ к интернету и может реально открыть ссылку!
 */
export async function expandShortUrlWithAI(shortUrl: string): Promise<string | null> {
  const API_KEY = import.meta.env.PERPLEXITY_API_KEY || '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';
  const API_URL = 'https://api.perplexity.ai/chat/completions';
  
  try {
    console.log('🤖 Используем Perplexity AI для разворачивания короткой ссылки:', shortUrl);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a URL expander. When given a short URL, you need to access it and return the FULL expanded URL. Only return the URL, nothing else.'
          },
          {
            role: 'user',
            content: `Please expand this short Google Maps URL and return ONLY the full URL (nothing else, no explanation):

${shortUrl}

Important: 
- Visit the URL and get the final destination
- Return ONLY the full URL starting with https://
- The URL should contain coordinates like @6.0135,80.2410 or similar
- Do not add any explanation, just the URL`
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log('🤖 AI ответ:', aiResponse);
    
    // Извлекаем URL из ответа (на случай если AI добавил текст)
    const urlMatch = aiResponse.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const expandedUrl = urlMatch[0];
      console.log('✅ Perplexity AI развернул ссылку:', expandedUrl);
      return expandedUrl;
    }
    
    console.warn('⚠️ AI не вернул валидный URL');
    return null;
    
  } catch (error) {
    console.error('❌ Ошибка Perplexity AI при разворачивании URL:', error);
    return null;
  }
}

/**
 * Очистка устаревшего кэша
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of aiCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      aiCache.delete(key);
    }
  }
}

// Автоматическая очистка каждый час
setInterval(clearExpiredCache, 60 * 60 * 1000);
