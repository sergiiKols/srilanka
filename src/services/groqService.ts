/**
 * Groq API Integration for fast property analysis
 * 
 * Groq provides 5-10x faster inference than Perplexity for text analysis tasks
 * that don't require internet access.
 * 
 * Use Cases:
 * - Property description analysis
 * - Feature extraction from text
 * - Data structuring and parsing
 * 
 * Model: llama-3.3-70b-versatile (recommended)
 * Speed: 500-800 tokens/sec
 * Cost: $0.59/M input, $0.79/M output
 */

import type { PropertyAnalysisResult } from './perplexityService';

const GROQ_API_KEY = import.meta.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Build prompt for property analysis
 */
function buildGroqPrompt(description: string, coordinates?: { lat: number; lng: number; placeName?: string }): string {
  return `You are a property listing analyzer for vacation rentals in Sri Lanka.

Extract all property details from this description:

${description}

${coordinates ? `Location: ${coordinates.lat}, ${coordinates.lng}${coordinates.placeName ? ` (${coordinates.placeName})` : ''}` : ''}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:

{
  "title": "short descriptive property name",
  "propertyType": "villa|apartment|house|room|hostel|hotel",
  "rooms": number (bedrooms count, 1 if studio),
  "bathrooms": number,
  "price": number (USD per night, null if not mentioned),
  "pricePeriod": "night|week|month" (determine from description, default "night"),
  "beachDistance": number (meters to nearest beach, estimate if not exact),
  "wifiSpeed": number (Mbps, 50 if not mentioned but wifi available, 0 if no wifi),
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
  "area": "Unawatuna|Hikkaduwa|Mirissa|Weligama" (determine from coordinates or description, default "Unawatuna"),
  "cleanDescription": "rewritten professional 2-3 sentence description highlighting key features",
  "confidence": 0.95 (your confidence in the extracted data, 0-1)
}

RULES:
- Be precise with numbers
- If information is missing, use reasonable defaults for Sri Lanka vacation rentals
- For area, use coordinates to determine closest: Unawatuna (6.0°N), Hikkaduwa (6.1°N), Mirissa (5.9°N), Weligama (5.97°N)
- Return ONLY the JSON object`;
}

/**
 * Parse and validate Groq API response
 */
function parseGroqResponse(content: string): PropertyAnalysisResult {
  try {
    // Remove markdown formatting if present
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and cast types
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
      confidence: Number(parsed.confidence) || 0.8
    };
  } catch (error) {
    console.error('Failed to parse Groq response:', error);
    throw new Error('Invalid Groq response format');
  }
}

/**
 * Analyze property description using Groq API
 * 
 * Fast and cost-effective for text analysis tasks
 * Uses llama-3.3-70b-versatile for best quality
 */
export async function analyzePropertyWithGroq(
  description: string,
  coordinates?: { lat: number; lng: number; placeName?: string }
): Promise<PropertyAnalysisResult> {
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  
  console.log('🤖 AI is analyzing property data...');
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a property data extraction expert. Return only valid JSON with no markdown formatting.'
          },
          {
            role: 'user',
            content: buildGroqPrompt(description, coordinates)
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ AI analysis completed');
    
    return parseGroqResponse(content);
    
  } catch (error) {
    console.error('❌ Groq API call failed:', error);
    throw error;
  }
}

/**
 * Quick analysis with fast 8B model for instant preview
 * 
 * Uses llama-3.1-8b-instant for ultra-fast response (1-2 seconds)
 * Good for preliminary results while full analysis is running
 */
export async function quickAnalyzeWithGroq(
  description: string
): Promise<Partial<PropertyAnalysisResult>> {
  
  if (!GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not configured, skipping quick analysis');
    return {};
  }
  
  console.log('⚡ Quick AI preview...');
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: `Extract basic info from this property description (return JSON):
${description.slice(0, 500)}

Return: {"rooms": number, "price": number|null, "amenities": ["..."]}` 
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.warn('Quick analysis failed, skipping');
      return {};
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}');
    
    console.log('⚡ Quick analysis done');
    
    return result;
    
  } catch (error) {
    console.warn('Quick analysis error:', error);
    return {};
  }
}

/**
 * Cache for Groq results (24 hour TTL)
 */
const groqCache = new Map<string, { result: PropertyAnalysisResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getGroqCacheKey(description: string, coordinates?: any): string {
  const coordsStr = coordinates ? `${coordinates.lat},${coordinates.lng}` : '';
  // Добавляем timestamp для обхода кеша при тестировании
  const timestamp = process.env.NODE_ENV === 'development' ? Date.now() : '';
  return `groq:${coordsStr}:${description.slice(0, 100)}:${timestamp}`;
}

/**
 * Analyze with caching to save API calls
 */
export async function analyzePropertyWithGroqCached(
  description: string,
  coordinates?: { lat: number; lng: number; placeName?: string },
  onQuickResult?: (result: Partial<PropertyAnalysisResult>) => void
): Promise<PropertyAnalysisResult> {
  
  const cacheKey = getGroqCacheKey(description, coordinates);
  const cached = groqCache.get(cacheKey);
  
  // Check cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Using cached AI result');
    return cached.result;
  }
  
  // Quick preview if callback provided
  if (onQuickResult) {
    quickAnalyzeWithGroq(description).then(quickResult => {
      if (Object.keys(quickResult).length > 0) {
        onQuickResult(quickResult);
      }
    }).catch(() => {}); // Ignore errors in quick preview
  }
  
  // Full analysis
  const result = await analyzePropertyWithGroq(description, coordinates);
  
  // Save to cache
  groqCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredGroqCache(): void {
  const now = Date.now();
  for (const [key, value] of groqCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      groqCache.delete(key);
    }
  }
}

// Auto-cleanup every hour
setInterval(clearExpiredGroqCache, 60 * 60 * 1000);
