/**
 * TELEGRAM BOT AI INTEGRATION
 * Интеграция Telegram Bot с существующими AI сервисами (Groq + Perplexity)
 */

import { analyzePropertyWithGroqCached } from '@/services/groqService';
import { expandShortUrlWithAI } from '@/services/perplexityService';
import { parseGoogleMapsURL } from '@/utils/googleMapsParser';
import { parsePropertyDescription } from './property-parser';
import { extractGoogleMapsUrl, DEFAULT_COORDINATES } from './tenant-bot-utils';
import type { Coordinates } from '@/types/ai.types';

/**
 * Результат AI анализа
 */
export interface AIAnalysisResult {
  // Основные данные
  title?: string;
  description?: string;
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
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  
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
        coordinates = { lat: parsed.lat, lng: parsed.lng };
        address = parsed.address || address;
        console.log('✅ Coordinates extracted:', coordinates);
        console.log('📍 Address:', address);
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
    
    // Преобразуем результат AI в наш формат
    return {
      title: aiResult.name || aiResult.type || 'Property',
      description: aiResult.description || text,
      type: aiResult.type,
      coordinates,
      address,
      price: aiResult.price,
      currency: aiResult.currency,
      bedrooms: aiResult.bedrooms,
      bathrooms: aiResult.bathrooms,
      area: aiResult.area,
      amenities: aiResult.amenities,
      contact: aiResult.contact,
      source: 'ai',
      confidence: 'high',
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
        coordinates = { lat: parsed.lat, lng: parsed.lng };
        address = parsed.address || address;
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
  return {
    title: result.title || result.type || 'Property',
    description: result.description || null,
    latitude: result.coordinates.lat,
    longitude: result.coordinates.lng,
    address: result.address || null,
    property_type: result.type || null,
    price: safeNumber(result.price),  // ✅ Безопасное преобразование
    currency: result.currency || 'USD',
    price_period: 'month',
    bedrooms: safeNumber(result.bedrooms),  // ✅ Проверка на число
    bathrooms: safeNumber(result.bathrooms),  // ✅ Проверка на число
    area_sqm: safeNumber(result.area),  // ✅ Проверка на число
    amenities: result.amenities && Array.isArray(result.amenities) ? JSON.stringify(result.amenities) : null,
    contact_phone: result.contact?.phone || null,
    contact_name: result.contact?.name || null
  };
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
  console.log('  Price:', result.price, result.currency);
  console.log('  Location:', result.address);
  console.log('  Coordinates:', result.coordinates);
  console.log('  Bedrooms:', result.bedrooms);
  console.log('  Bathrooms:', result.bathrooms);
  console.log('  Amenities:', result.amenities?.length || 0);
  console.log('  Contact:', result.contact?.phone);
}
