/**
 * TELEGRAM BOT AI INTEGRATION
 * Интеграция Telegram Bot с существующими AI сервисами (Groq + Perplexity)
 */

import { analyzePropertyWithGroqCached } from '@/services/groqService';
import { expandShortUrlWithAI } from '@/services/perplexityService';
import { parseGoogleMapsURL } from '@/utils/googleMapsParser';
import { parsePropertyDescription } from './property-parser';
import { extractGoogleMapsUrl, DEFAULT_COORDINATES } from './tenant-bot-utils';
import { convertToUSD } from '@/utils/currencyConverter';
import type { Coordinates } from '@/types/ai.types';

/**
 * Определяет город по координатам (простой метод на основе известных городов Шри-Ланки)
 */
function getCityFromCoordinates(lat: number, lng: number): string {
  const cities = [
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, radius: 0.2 },
    { name: 'Negombo', lat: 7.2008, lng: 79.8358, radius: 0.15 },
    { name: 'Galle', lat: 6.0535, lng: 80.2210, radius: 0.15 },
    { name: 'Unawatuna', lat: 6.0097, lng: 80.2474, radius: 0.1 }, // Увеличен радиус
    { name: 'Hikkaduwa', lat: 6.1408, lng: 80.1033, radius: 0.12 }, // Увеличен радиус
    { name: 'Mirissa', lat: 5.9467, lng: 80.4539, radius: 0.08 }, // Увеличен радиус
    { name: 'Weligama', lat: 5.9733, lng: 80.4294, radius: 0.08 }, // Увеличен радиус
    { name: 'Tangalle', lat: 6.0247, lng: 80.7976, radius: 0.12 },
    { name: 'Bentota', lat: 6.4257, lng: 79.9953, radius: 0.1 },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, radius: 0.15 },
    { name: 'Trincomalee', lat: 8.5874, lng: 81.2152, radius: 0.15 },
    { name: 'Arugam Bay', lat: 6.8411, lng: 81.8353, radius: 0.08 },
  ];

  // Сначала ищем город в пределах радиуса
  let closestCityInRadius = null;
  let minDistanceInRadius = Infinity;

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    );
    
    if (distance < city.radius && distance < minDistanceInRadius) {
      minDistanceInRadius = distance;
      closestCityInRadius = city.name;
    }
  }

  // Если нашли город в радиусе - возвращаем его
  if (closestCityInRadius) {
    console.log(`📍 City determined from coordinates (${lat}, ${lng}): ${closestCityInRadius} (within radius)`);
    return closestCityInRadius;
  }

  // Если не нашли в радиусе - находим просто ближайший город
  let closestCity = 'Colombo'; // Fallback
  let minDistance = Infinity;

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city.name;
    }
  }

  console.log(`📍 City determined from coordinates (${lat}, ${lng}): ${closestCity} (nearest, outside all radii)`);
  return closestCity;
}

/**
 * Результат AI анализа
 */
export interface AIAnalysisResult {
  // Основные данные
  title?: string;
  description?: string;
  cleanDescription?: string;
  type?: string;
  
  // Координаты
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  
  // Характеристики
  price?: number;
  currency?: string;
  pricePeriod?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  
  // Фильтры и удобства
  features?: {
    pool?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    airConditioning?: boolean;
    kitchen?: boolean;
    petFriendly?: boolean;
    security?: string;
    beachfront?: boolean;
    garden?: boolean;
  };
  
  // Метрики
  wifiSpeed?: number;
  beachDistance?: number;
  
  // Контакты
  contact?: {
    phone?: string;
    name?: string;
  };
  
  // Метаданные
  source: 'ai' | 'manual' | 'hybrid';
  confidence: 'high' | 'medium' | 'low';
  aiProvider?: 'groq' | 'perplexity';
}

/**
 * Полный AI анализ сообщения от Telegram
 * Использует существующие Groq + Perplexity сервисы
 * 
 * @param {string} text - Текст описания объекта
 * @param {string} googleMapsUrl - Google Maps URL (опционально)
 * @returns {Promise<AIAnalysisResult>} Результат анализа
 */
export async function analyzeTelegramMessage(
  text: string,
  googleMapsUrl?: string
): Promise<AIAnalysisResult> {
  
  console.log('🤖 AI Analysis started...');
  console.log('📝 Text length:', text.length);
  console.log('🔗 Google Maps URL:', googleMapsUrl || 'not provided');
  
  // 1. Получаем координаты
  let coordinates: Coordinates = { 
    lat: DEFAULT_COORDINATES.latitude, 
    lng: DEFAULT_COORDINATES.longitude 
  };
  let address = DEFAULT_COORDINATES.address;
  
  if (googleMapsUrl) {
    try {
      console.log('🗺️ Parsing Google Maps URL...');
      
      // parseGoogleMapsURL автоматически использует Perplexity AI
      // для разворачивания коротких ссылок (goo.gl, maps.app.goo.gl)
      const parsed = await parseGoogleMapsURL(googleMapsUrl);
      
      if (parsed && parsed.lat && parsed.lng) {
        // ✅ ВАЛИДАЦИЯ: Проверяем что координаты в Шри-Ланке
        const isInSriLanka = parsed.lat >= 5.9 && parsed.lat <= 9.9 && 
                            parsed.lng >= 79.5 && parsed.lng <= 81.9;
        
        if (isInSriLanka) {
          coordinates = { lat: parsed.lat, lng: parsed.lng };
          address = parsed.address || address;
          console.log('✅ Coordinates extracted and validated (Sri Lanka):', coordinates);
          console.log('📍 Address:', address);
        } else {
          console.error('❌ INVALID COORDINATES - Outside Sri Lanka!', {
            lat: parsed.lat,
            lng: parsed.lng,
            url: googleMapsUrl
          });
          console.error('⚠️ Using default coordinates. Please provide FULL Google Maps URL.');
          console.error('💡 Example: https://www.google.com/maps/place/@6.0094617,80.2671223,17z');
        }
      } else {
        console.warn('⚠️ Failed to parse Google Maps URL, using default');
      }
    } catch (error) {
      console.error('❌ Error parsing Google Maps URL:', error);
    }
  }
  
  // 2. AI анализ описания через Groq
  try {
    console.log('🤖 Sending to Groq AI for analysis...');
    
    // analyzePropertyWithGroqCached использует кэширование
    // и возвращает структурированные данные
    const aiResult = await analyzePropertyWithGroqCached(
      text,
      coordinates,
      (quickResult) => {
        // Быстрый предварительный результат (опционально)
        console.log('📦 Quick AI result:', quickResult);
      }
    );
    
    console.log('✅ Groq AI analysis complete');
    console.log('🔍 DEBUG - aiResult.features from Groq:', JSON.stringify(aiResult.features, null, 2));
    console.log('🔍 DEBUG - Full aiResult from Groq:', JSON.stringify(aiResult, null, 2));
    
    // Преобразуем результат AI в наш формат
    return {
      title: aiResult.title || aiResult.name || aiResult.type || 'Property',
      description: aiResult.description || text,
      cleanDescription: aiResult.cleanDescription,
      type: aiResult.propertyType || aiResult.type,
      coordinates,
      address,
      price: aiResult.price,
      currency: aiResult.currency || 'USD',
      pricePeriod: aiResult.pricePeriod || 'night',
      bedrooms: aiResult.rooms || aiResult.bedrooms,
      bathrooms: aiResult.bathrooms,
      area: aiResult.area,
      amenities: aiResult.amenities,
      features: aiResult.features,
      wifiSpeed: aiResult.wifiSpeed,
      beachDistance: aiResult.beachDistance,
      contact: aiResult.contact,
      source: 'ai',
      confidence: aiResult.confidence >= 0.8 ? 'high' : aiResult.confidence >= 0.5 ? 'medium' : 'low',
      aiProvider: 'groq'
    };
    
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    throw error;
  }
}

/**
 * Гибридный подход: AI + Manual Parser
 * Сначала пытается AI, при неудаче использует manual parser
 * 
 * @param {string} text - Текст описания
 * @param {string} googleMapsUrl - Google Maps URL (опционально)
 * @returns {Promise<AIAnalysisResult>} Результат анализа
 */
export async function analyzeWithFallback(
  text: string,
  googleMapsUrl?: string
): Promise<AIAnalysisResult> {
  
  console.log('🔄 Hybrid analysis started (AI + Manual fallback)...');
  
  // Попытка 1: AI анализ
  try {
    const aiResult = await analyzeTelegramMessage(text, googleMapsUrl);
    
    // Проверяем качество результата
    if (aiResult.coordinates && (aiResult.type || aiResult.price)) {
      console.log('✅ AI analysis successful (high confidence)');
      return {
        ...aiResult,
        source: 'ai',
        confidence: 'high'
      };
    }
    
    console.warn('⚠️ AI result incomplete, trying manual parser...');
    
  } catch (error) {
    console.error('❌ AI failed, falling back to manual parser:', error);
  }
  
  // Попытка 2: Manual Parser (fallback)
  console.log('🔧 Using manual parser as fallback...');
  
  const manualResult = parsePropertyDescription(text);
  
  // Координаты из Google Maps
  let coordinates: Coordinates = {
    lat: DEFAULT_COORDINATES.latitude,
    lng: DEFAULT_COORDINATES.longitude
  };
  let address = DEFAULT_COORDINATES.address;
  
  if (googleMapsUrl) {
    try {
      const parsed = await parseGoogleMapsURL(googleMapsUrl);
      if (parsed) {
        // ✅ ВАЛИДАЦИЯ: Проверяем что координаты в Шри-Ланке
        const isInSriLanka = parsed.lat >= 5.9 && parsed.lat <= 9.9 && 
                            parsed.lng >= 79.5 && parsed.lng <= 81.9;
        
        if (isInSriLanka) {
          coordinates = { lat: parsed.lat, lng: parsed.lng };
          address = parsed.address || address;
          console.log('✅ Fallback: Coordinates validated (Sri Lanka)');
        } else {
          console.error('❌ Fallback: Invalid coordinates - outside Sri Lanka!');
        }
      }
    } catch (error) {
      console.error('Error parsing URL in fallback:', error);
    }
  }
  
  console.log('✅ Manual parser completed');
  
  return {
    title: manualResult.property_type || 'Property',
    description: text,
    type: manualResult.property_type,
    coordinates,
    address,
    price: manualResult.price,
    currency: manualResult.currency,
    bedrooms: manualResult.bedrooms,
    bathrooms: manualResult.bathrooms,
    area_sqm: manualResult.area_sqm,
    amenities: manualResult.amenities,
    contact: {
      phone: manualResult.contact_phone,
      name: manualResult.contact_name
    },
    source: 'manual',
    confidence: 'medium'
  };
}

/**
 * Только разворачивание короткой Google Maps ссылки
 * Использует Perplexity AI
 * 
 * @param {string} shortUrl - Короткая ссылка (goo.gl, maps.app.goo.gl)
 * @returns {Promise<string | null>} Полная ссылка или null
 */
export async function expandGoogleMapsShortUrl(shortUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Expanding short URL with Perplexity AI:', shortUrl);
    
    // Используем Perplexity AI для разворачивания
    const expandedUrl = await expandShortUrlWithAI(shortUrl);
    
    if (expandedUrl) {
      console.log('✅ URL expanded:', expandedUrl);
      return expandedUrl;
    }
    
    console.warn('⚠️ Failed to expand URL');
    return null;
    
  } catch (error) {
    console.error('❌ Error expanding URL:', error);
    return null;
  }
}

/**
 * Быстрый анализ (только ключевые данные)
 * Используется для предварительного показа пока идёт полный анализ
 * 
 * @param {string} text - Текст описания
 * @returns {Promise<Partial<AIAnalysisResult>>} Частичный результат
 */
export async function quickAnalyze(text: string): Promise<Partial<AIAnalysisResult>> {
  // Используем manual parser для быстрого извлечения
  const result = parsePropertyDescription(text);
  
  return {
    type: result.property_type,
    price: result.price,
    currency: result.currency,
    bedrooms: result.bedrooms,
    bathrooms: result.bathrooms,
    contact: {
      phone: result.contact_phone
    },
    source: 'manual',
    confidence: 'low'
  };
}

/**
 * Валидация результата AI
 * Проверяет что AI вернул достаточно данных
 * 
 * @param {AIAnalysisResult} result - Результат анализа
 * @returns {boolean} true если результат валиден
 */
export function validateAIResult(result: AIAnalysisResult): boolean {
  // Минимальные требования
  const hasCoordinates = result.coordinates && 
                        result.coordinates.lat && 
                        result.coordinates.lng;
  
  const hasBasicInfo = result.type || result.price || result.description;
  
  return hasCoordinates && hasBasicInfo;
}

/**
 * Форматирует результат AI для сохранения в БД
 * 
 * @param {AIAnalysisResult} result - Результат AI
 * @returns {object} Данные для сохранения
 */
// Безопасное преобразование в число
function safeNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
}

export function formatForDatabase(result: AIAnalysisResult) {
  console.log('🔍 DEBUG - formatForDatabase input:', JSON.stringify(result, null, 2));
  
  // 💱 Конвертируем цену в USD для унификации
  const priceOriginal = safeNumber(result.price);
  const currency = result.currency || 'USD';
  const priceUSD = priceOriginal && currency !== 'USD' 
    ? convertToUSD(priceOriginal, currency)
    : priceOriginal;
  
  console.log(`💱 Price conversion: ${priceOriginal} ${currency} → $${priceUSD} USD`);
  
  const formatted = {
    title: result.title || result.type || 'Property',
    description: result.cleanDescription || result.description || null,
    latitude: result.coordinates.lat,
    longitude: result.coordinates.lng,
    address: result.address || null,
    property_type: result.type || null,
    price: priceOriginal, // Оригинальная цена
    currency: currency, // Оригинальная валюта
    price_usd: priceUSD, // ✅ Цена в USD для фильтров
    price_period: result.pricePeriod || 'night',
    bedrooms: safeNumber(result.bedrooms),
    bathrooms: safeNumber(result.bathrooms),
    area_sqm: safeNumber(result.area),
    
    // Фильтры из features
    pool: result.features?.pool || false,
    parking: result.features?.parking || false,
    breakfast: result.features?.breakfast || false,
    air_conditioning: result.features?.airConditioning || false,
    kitchen: result.features?.kitchen || false,
    pet_friendly: result.features?.petFriendly || false,
    security: result.features?.security || 'none',
    beachfront: result.features?.beachfront || false,
    garden: result.features?.garden || false,
    
    // Метрики
    wifi_speed: safeNumber(result.wifiSpeed) || null,
    beach_distance: safeNumber(result.beachDistance) || null,
    area_name: getCityFromCoordinates(result.coordinates.lat, result.coordinates.lng),
    
    // Amenities как массив (не строка)
    amenities: result.amenities && Array.isArray(result.amenities) 
      ? result.amenities 
      : null,
    
    contact_phone: result.contact?.phone || null,
    contact_name: result.contact?.name || null,
    
    // Метаданные AI
    confidence: result.confidence || 'medium',
    ai_provider: result.aiProvider || 'groq'
  };
  
  console.log('🔍 DEBUG - formatForDatabase output:', JSON.stringify(formatted, null, 2));
  return formatted;
}

/**
 * Логирование результата AI (для отладки)
 */
export function logAIResult(result: AIAnalysisResult): void {
  console.log('📊 AI Analysis Result:');
  console.log('  Source:', result.source);
  console.log('  Confidence:', result.confidence);
  console.log('  Provider:', result.aiProvider || 'N/A');
  console.log('  Type:', result.type);
  console.log('  Price:', result.price, result.currency, `per ${result.pricePeriod || 'night'}`); // ✅ Добавлен период
  console.log('  Location:', result.address);
  console.log('  Coordinates:', result.coordinates);
  console.log('  Bedrooms:', result.bedrooms);
  console.log('  Bathrooms:', result.bathrooms);
  console.log('  Amenities:', result.amenities?.length || 0);
  console.log('  Contact:', result.contact?.phone);
}
