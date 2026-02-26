/**
 * Утилиты для работы с Google Maps координатами
 * Поддерживает различные форматы Google Maps URL и координат
 */

import { OpenLocationCode } from 'open-location-code';
import { findCity, getRegionFallback, sriLankaRegions } from '../config/sriLankaCities';

export interface ParsedCoordinates {
  lat: number;
  lng: number;
  placeId?: string;
  placeName?: string;
}

// Инициализируем Plus Code декодер
const olc = new OpenLocationCode();

/**
 * Разворачивает короткие ссылки через серверный API
 */
async function expandShortUrlViaAPI(shortUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Используем серверный API для разворачивания:', shortUrl);
    
    // Определяем базовый URL (работает и на клиенте и на сервере)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.PUBLIC_URL || 'https://traveler.energo-audit.online';
    
    const apiUrl = `${baseUrl}/api/expand-url`;
    console.log('📡 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: shortUrl })
    });

    console.log('📥 Ответ от API:', { 
      status: response.status, 
      ok: response.ok,
      statusText: response.statusText 
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Данные от API:', data);
      
      if (data.success && data.expandedUrl) {
        console.log('✅ Сервер успешно развернул ссылку через:', data.method);
        return data.expandedUrl;
      } else {
        console.warn('⚠️ API вернул success=false:', data.error || 'неизвестная ошибка');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API вернул ошибку:', response.status, errorText);
    }
    
    console.warn('⚠️ Серверный API не смог развернуть ссылку');
    return null;
  } catch (error: any) {
    console.error('❌ Ошибка серверного API:', error.message, error);
    return null;
  }
}

/**
 * Разворачивает короткие ссылки Google Maps
 * Использует цепочку методов для максимальной надежности
 */
async function expandShortUrl(shortUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Начинаем разворачивание короткой ссылки:', shortUrl);
    
    // Метод 1: Серверный API (ПРИОРИТЕТ - надежный и не галлюцинирует!)
    console.log('Метод 1: Пробуем серверный API...');
    const serverResult = await expandShortUrlViaAPI(shortUrl);
    if (serverResult) {
      console.log('✅ Server API успешно развернул ссылку');
      return serverResult;
    }
    
    // Метод 2: Прямой fetch с клиента (быстрый, но может не работать из-за CORS)
    console.log('Метод 2: Пробуем прямой fetch...');
    try {
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow',
        mode: 'no-cors'
      });
      
      if (response.url && response.url !== shortUrl) {
        console.log('✅ Метод 2: Ссылка развернута через fetch');
        return response.url;
      }
    } catch (e) {
      console.warn('⚠️ Метод 2 (fetch) не сработал:', e);
    }
    
    // Метод 3: Hidden iframe (работает в браузере)
    console.log('Метод 3: Пробуем hidden iframe...');
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const iframeResult = await new Promise<string | null>((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        
        const timeout = setTimeout(() => {
          try {
            const finalUrl = iframe.contentWindow?.location.href;
            document.body.removeChild(iframe);
            
            if (finalUrl && finalUrl !== shortUrl && finalUrl !== 'about:blank') {
              console.log('✅ Метод 3: Ссылка развернута через iframe');
              resolve(finalUrl);
            } else {
              console.warn('⚠️ Метод 3 (iframe) не дал результата');
              resolve(null);
            }
          } catch (err) {
            console.warn('⚠️ Метод 3 (iframe) заблокирован CORS');
            document.body.removeChild(iframe);
            resolve(null);
          }
        }, 2000);
        
        iframe.onload = () => {
          clearTimeout(timeout);
          try {
            const finalUrl = iframe.contentWindow?.location.href;
            document.body.removeChild(iframe);
            
            if (finalUrl && finalUrl !== shortUrl && finalUrl !== 'about:blank') {
              console.log('✅ Метод 3: Ссылка развернута через iframe (onload)');
              resolve(finalUrl);
            } else {
              resolve(null);
            }
          } catch (err) {
            document.body.removeChild(iframe);
            resolve(null);
          }
        };
        
        document.body.appendChild(iframe);
        iframe.src = shortUrl;
      });
      
      if (iframeResult) {
        return iframeResult;
      }
    }
    
    // Метод 4: Perplexity AI (FALLBACK - может галлюцинировать координаты!)
    console.log('Метод 4: Пробуем Perplexity AI (последний шанс)...');
    console.warn('⚠️ ВНИМАНИЕ: AI может вернуть URL с неправильными координатами!');
    try {
      const { expandShortUrlWithAI } = await import('../services/perplexityService');
      const aiResult = await expandShortUrlWithAI(shortUrl);
      if (aiResult) {
        console.warn('⚠️ Perplexity AI вернул URL - проверьте координаты вручную!');
        return aiResult;
      }
    } catch (aiError) {
      console.warn('⚠️ Метод 4 (Perplexity AI) не сработал:', aiError);
    }
    
    console.error('❌ Все методы разворачивания не сработали');
    return null;
    
  } catch (error) {
    console.error('❌ Критическая ошибка при разворачивании:', error);
    return null;
  }
}

/**
 * Извлекает координаты из закодированных данных Google Maps (формат /data=)
 * Формат: /data=!3d{lat}!4d{lng} или !3m1!4b1!4m6!3m5!1s{place_id}!8m2!3d{lat}!4d{lng}
 */
function extractCoordsFromEncodedData(url: string): ParsedCoordinates | null {
  try {
    // Ищем паттерн !3d{lat}!4d{lng} (стандартный формат Google)
    const coordMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`✅ Координаты из закодированных данных (!3d/!4d): ${lat}, ${lng}`);
        return { lat, lng };
      }
    }
    
    // Альтернативный формат: !8m2!3d{lat}!4d{lng}
    const altMatch = url.match(/!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (altMatch) {
      const lat = parseFloat(altMatch[1]);
      const lng = parseFloat(altMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`✅ Координаты из закодированных данных (!8m2): ${lat}, ${lng}`);
        return { lat, lng };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка парсинга закодированных данных:', error);
    return null;
  }
}

/**
 * Извлекает название города из URL
 * Формат: ?q=WFX7+22W+Russian+Guesthouse,+Mirissa
 */
function extractCityFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get('q');
    
    if (!q) return null;
    
    // Декодируем URL
    const decoded = decodeURIComponent(q);
    console.log(`🔍 Параметр ?q: ${decoded}`);
    
    // Разделяем по запятым и плюсам
    const parts = decoded.split(/[,+]/);
    
    for (const part of parts) {
      const trimmed = part.trim();
      
      // Пропускаем Plus Code и короткие слова
      if (trimmed.length <= 3) continue;
      if (trimmed.match(/^[23456789CFGHJMPQRVWX]{4,8}$/i)) continue; // Plus Code часть
      if (trimmed.match(/^\d+$/)) continue; // Только цифры
      
      // Проверяем в базе городов
      const city = findCity(trimmed);
      if (city) {
        console.log(`✅ Найден город в базе: ${trimmed}`);
        return trimmed;
      }
    }
    
    // Если не нашли точное совпадение, возвращаем последнюю часть (обычно это город)
    const lastPart = parts[parts.length - 1]?.trim();
    if (lastPart && lastPart.length > 3 && !lastPart.match(/^\d+$/)) {
      console.log(`⚠️ Город не найден в базе, используем: ${lastPart}`);
      return lastPart;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка извлечения города из URL:', error);
    return null;
  }
}

/**
 * Geocoding города через Nominatim (OpenStreetMap)
 * Бесплатный API, не требует ключа
 */
async function geocodeCity(cityName: string): Promise<{lat: number, lng: number} | null> {
  try {
    console.log(`🌍 Geocoding города через Nominatim: ${cityName}`);
    
    const url = `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(cityName)},Sri+Lanka&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sri-Lanka-Rentals/1.0'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Nominatim вернул ошибку: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      console.log(`✅ Nominatim нашел координаты: ${result.lat}, ${result.lng}`);
      return result;
    }
    
    console.warn(`⚠️ Nominatim не нашел город: ${cityName}`);
    return null;
  } catch (error) {
    console.error('Ошибка Nominatim geocoding:', error);
    return null;
  }
}

/**
 * Декодирует Plus Code через Perplexity AI (для коротких кодов)
 */
async function decodePlusCodeWithAI(
  plusCode: string,
  cityName: string | null
): Promise<ParsedCoordinates | null> {
  try {
    console.log(`🤖 Используем Perplexity AI для декодирования короткого Plus Code: ${plusCode}`);
    
    const { expandShortUrlWithAI } = await import('../services/perplexityService');
    
    // Создаем запрос для AI
    const location = cityName ? `${cityName}, Sri Lanka` : 'Sri Lanka';
    const prompt = `What are the exact GPS coordinates (latitude, longitude) for Google Maps Plus Code "${plusCode}" in ${location}?

Return ONLY the coordinates in this format: lat,lng
Example: 5.9476,80.4963

Do not add any explanation, just the numbers.`;
    
    // Используем существующий метод (но модифицируем для Plus Code)
    const API_KEY = import.meta.env.PERPLEXITY_API_KEY || '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';
    const API_URL = 'https://api.perplexity.ai/chat/completions';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.2,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Perplexity API вернул ошибку: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const answer = data.choices[0].message.content.trim();
    
    console.log(`🤖 AI ответ: "${answer}"`);
    
    // Извлекаем координаты
    const coordMatch = answer.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      console.log(`✅ Perplexity AI декодировал Plus Code: ${lat}, ${lng}`);
      return { lat, lng };
    }
    
    console.warn(`⚠️ Не удалось извлечь координаты из ответа AI`);
    return null;
    
  } catch (error) {
    console.error('❌ Ошибка Perplexity AI:', error);
    return null;
  }
}

/**
 * Декодирует Plus Code в координаты
 * Использует базу городов Шри-Ланки для reference координат
 */
async function decodePlusCode(
  plusCode: string,
  cityName: string | null
): Promise<ParsedCoordinates | null> {
  try {
    console.log(`🔍 Декодирование Plus Code: ${plusCode}`);
    console.log(`📍 Город из URL: ${cityName || 'не найден'}`);
    
    // Проверка валидности
    if (!olc.isValid(plusCode)) {
      console.error(`❌ Невалидный Plus Code: ${plusCode}`);
      return null;
    }
    
    // Если это полный код - декодируем напрямую
    if (olc.isFull(plusCode)) {
      console.log(`✅ Полный Plus Code, декодируем напрямую`);
      const decoded = olc.decode(plusCode);
      return {
        lat: decoded.latitudeCenter,
        lng: decoded.longitudeCenter
      };
    }
    
    // Короткий код - проверяем длину
    const codeLength = plusCode.replace('+', '').length;
    console.log(`⚠️ Короткий Plus Code (${codeLength} символов без +)`);
    
    // КРИТИЧЕСКАЯ ПРОВЕРКА: Слишком короткие коды дают ошибку ~20+ км!
    if (codeLength < 6) {
      console.error(`❌ КРИТИЧНО: Plus Code "${plusCode}" слишком короткий (< 6 символов)!`);
      console.error(`   Точность таких кодов: ~20+ км ошибка`);
      console.error(`   Минимальная длина: XXXX+XX (6 символов без +)`);
      console.error(`   Рекомендуется: XXXX+XXXX (8 символов) или больше`);
      
      // Возвращаем null - пользователь должен предоставить полную ссылку
      return null;
    }
    
    // Если код короткий (6-8 символов), используем Perplexity AI для повышения точности
    if (codeLength <= 8) {
      console.log(`🤖 Код короткий (≤8 символов), используем Perplexity AI для точности...`);
      const aiResult = await decodePlusCodeWithAI(plusCode, cityName);
      
      if (aiResult) {
        console.log(`✅ Perplexity AI успешно декодировал короткий Plus Code`);
        return aiResult;
      }
      
      console.warn(`⚠️ Perplexity AI не сработал, используем fallback с базой городов`);
      console.warn(`   Ожидаемая точность: ~100м - 5км в зависимости от длины кода`);
    }
    
    // Fallback: используем базу городов для reference координат
    console.log(`🗺️ Используем базу городов для reference координат`);
    
    let refLat: number;
    let refLng: number;
    let method: string;
    
    // Стратегия 1: Из базы городов
    if (cityName) {
      const city = findCity(cityName);
      
      if (city) {
        refLat = city.lat;
        refLng = city.lng;
        method = `база городов (${cityName})`;
        console.log(`✅ Используем координаты из базы: ${refLat}, ${refLng}`);
      } 
      // Стратегия 2: Geocoding через Nominatim
      else {
        console.log(`⚠️ Город ${cityName} не найден в базе, пробуем Nominatim...`);
        const geocoded = await geocodeCity(cityName);
        
        if (geocoded) {
          refLat = geocoded.lat;
          refLng = geocoded.lng;
          method = `Nominatim (${cityName})`;
          console.log(`✅ Nominatim вернул координаты: ${refLat}, ${refLng}`);
        } else {
          // Стратегия 3: Региональный fallback (Юг Шри-Ланки)
          console.warn(`⚠️ Nominatim не нашел город, используем региональный fallback`);
          const region = sriLankaRegions['South'];
          refLat = region.lat;
          refLng = region.lng;
          method = 'региональный fallback (South)';
          console.log(`⚠️ Используем центр южного региона: ${refLat}, ${refLng}`);
        }
      }
    }
    // Стратегия 3: Если город вообще не найден - используем South region
    else {
      console.warn(`⚠️ Город не указан, используем региональный fallback`);
      const region = sriLankaRegions['South'];
      refLat = region.lat;
      refLng = region.lng;
      method = 'региональный fallback (South)';
      console.log(`⚠️ Используем центр южного региона: ${refLat}, ${refLng}`);
    }
    
    // Восстанавливаем полный код
    const fullCode = olc.recoverNearest(plusCode, refLat, refLng);
    console.log(`🔧 Восстановленный полный код: ${fullCode}`);
    console.log(`📍 Метод: ${method}`);
    
    // Декодируем
    const decoded = olc.decode(fullCode);
    const result = {
      lat: decoded.latitudeCenter,
      lng: decoded.longitudeCenter
    };
    
    console.log(`✅ Plus Code декодирован: ${result.lat}, ${result.lng}`);
    
    return result;
  } catch (error) {
    console.error('Ошибка декодирования Plus Code:', error);
    return null;
  }
}

/**
 * Получает координаты из Plus Code
 * Использует декодирование с базой городов
 */
async function extractCoordsFromPlusCode(url: string, plusCode: string): Promise<ParsedCoordinates | null> {
  try {
    console.log(`🔍 Обнаружен Plus Code: ${plusCode}`);
    
    // Извлекаем название города из URL
    const cityName = extractCityFromUrl(url);
    
    // Декодируем Plus Code
    const coords = await decodePlusCode(plusCode, cityName);
    
    if (coords) {
      return coords;
    }
    
    // Fallback: пробуем извлечь из закодированных данных
    console.log(`⚠️ Не удалось декодировать Plus Code, пробуем извлечь из закодированных данных...`);
    const encodedCoords = extractCoordsFromEncodedData(url);
    if (encodedCoords) {
      return encodedCoords;
    }
    
    console.error(`❌ Не удалось получить координаты из Plus Code`);
    return null;
  } catch (error) {
    console.error('Ошибка обработки Plus Code:', error);
    return null;
  }
}

/**
 * Извлекает координаты из развернутого Google Maps URL
 * Поддерживает форматы:
 * 1. ?q=lat,lng
 * 2. @lat,lng,zoom
 * 3. Plus Code (?q=WFX7+22W)
 * 4. Закодированные данные (/data=!3d!4d)
 * 5. Адреса (требует geocoding)
 */
async function extractCoordsFromExpandedUrl(url: string): Promise<ParsedCoordinates | null> {
  try {
    console.log(`🔍 Парсим развернутый URL для координат...`);
    
    // 1) Формат: /place/lat,lng/data=... (НОВЫЙ!)
    const placePathMatch = url.match(/\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (placePathMatch) {
      const lat = parseFloat(placePathMatch[1]);
      const lng = parseFloat(placePathMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`✅ Координаты из /place/lat,lng: ${lat}, ${lng}`);
        return { lat, lng };
      }
    }
    
    // 2) Формат: /search/lat,lng?... (НОВЫЙ!)
    const searchPathMatch = url.match(/\/search\/(-?\d+\.?\d*)[,+\s]+(-?\d+\.?\d*)/);
    if (searchPathMatch) {
      const lat = parseFloat(searchPathMatch[1]);
      const lng = parseFloat(searchPathMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`✅ Координаты из /search/lat,lng: ${lat}, ${lng}`);
        return { lat, lng };
      }
    }
    
    // 3) Формат: ?q=lat,lng
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get('q');
    if (q) {
      // Проверяем что это не Plus Code (содержит +)
      if (!q.includes('+')) {
        const parts = q.split(',');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0].trim());
          const lng = parseFloat(parts[1].trim());
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log(`✅ Координаты из ?q=lat,lng: ${lat}, ${lng}`);
            return { lat, lng };
          }
        }
      } else {
        // Это Plus Code
        console.log(`⚠️ Обнаружен Plus Code в ?q: ${q}`);
        const plusCodeResult = await extractCoordsFromPlusCode(url, q);
        if (plusCodeResult) {
          return plusCodeResult;
        }
      }
    }

    // 4) Формат: @lat,lng,zoom
    const atIndex = url.indexOf('@');
    if (atIndex !== -1) {
      // Берем подстроку после @ до первого /
      const sub = url.substring(atIndex + 1);
      const endIndex = sub.indexOf('/');
      const coordStr = endIndex === -1 ? sub : sub.substring(0, endIndex);
      const parts = coordStr.split(',');
      
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          console.log(`✅ Координаты из @lat,lng: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
    }
    
    // 5) Формат: Закодированные данные (/data=!3d!4d)
    if (url.includes('/data=') || url.includes('!3d') || url.includes('!4d')) {
      console.log(`🔍 Обнаружены закодированные данные, пробуем извлечь координаты...`);
      const encodedCoords = extractCoordsFromEncodedData(url);
      if (encodedCoords) {
        return encodedCoords;
      }
    }
    
    // 6) Формат: Адрес в ?q (требует geocoding)
    if (q && !q.includes('+')) {
      console.log(`⚠️ URL содержит адрес вместо координат: "${q}"`);
      console.log(`💡 Для конвертации адреса в координаты нужен Google Geocoding API`);
      
      // Пробуем извлечь из закодированных данных
      const encodedCoords = extractCoordsFromEncodedData(url);
      if (encodedCoords) {
        return encodedCoords;
      }
    }

    console.log(`⚠️ Координаты не найдены в URL`);
    console.log(`💡 URL: ${url.substring(0, 150)}...`);
    return null;
  } catch (error) {
    console.error('Ошибка парсинга координат из URL:', error);
    return null;
  }
}

/**
 * Парсит различные форматы Google Maps URL и извлекает координаты
 * 
 * Поддерживаемые форматы:
 * 1. https://www.google.com/maps/place/Name/@6.0135,80.2410,17z
 * 2. https://maps.google.com/?q=6.0135,80.2410
 * 3. https://www.google.com/maps/@6.0135,80.2410,17z
 * 4. https://goo.gl/maps/xxx (короткая ссылка - автоматическое разворачивание)
 * 5. https://maps.app.goo.gl/xxx (новый формат коротких ссылок)
 * 6. 6.0135, 80.2410 (прямой ввод координат)
 * 7. WFX7+22W (Plus Code / Open Location Code)
 */
export async function parseGoogleMapsURL(input: string): Promise<ParsedCoordinates | null> {
  try {
    // Очистка строки от пробелов
    const trimmed = input.trim();

    // Формат 1: Прямой ввод координат "6.0135, 80.2410" или "6.0135,80.2410"
    const directCoords = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const directMatch = trimmed.match(directCoords);
    if (directMatch) {
      return {
        lat: parseFloat(directMatch[1]),
        lng: parseFloat(directMatch[2])
      };
    }

    // Формат 2: URL с параметром ?q=
    const qParamMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qParamMatch) {
      return {
        lat: parseFloat(qParamMatch[1]),
        lng: parseFloat(qParamMatch[2])
      };
    }

    // Формат 3: URL с @координаты (стандартный формат Google Maps)
    const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      };
    }

    // Формат 4: URL с /place/ (может содержать координаты в URL)
    const placeMatch = trimmed.match(/\/place\/([^/]+).*@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (placeMatch) {
      return {
        lat: parseFloat(placeMatch[2]),
        lng: parseFloat(placeMatch[3]),
        placeName: decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
      };
    }

    // Пробуем извлечь координаты напрямую из URL (если это уже развернутая ссылка)
    const urlCoords = await extractCoordsFromExpandedUrl(trimmed);
    if (urlCoords) {
      return urlCoords;
    }
    
    // Формат 6: Короткие ссылки goo.gl или maps.app.goo.gl
    if (trimmed.includes('goo.gl')) {
      console.log('🔗 Обнаружена короткая ссылка Google Maps');
      console.log('🤖 Пробуем развернуть через AI и другие методы...');
      
      const expandedUrl = await expandShortUrl(trimmed);
      if (expandedUrl) {
        console.log('✅ Развернутый URL:', expandedUrl);
        
        // Пробуем извлечь координаты из развернутого URL
        console.log('🔍 Извлекаем координаты из развернутого URL...');
        const coords = await extractCoordsFromExpandedUrl(expandedUrl);
        
        if (coords) {
          console.log(`✅ ФИНАЛЬНЫЕ КООРДИНАТЫ: ${coords.lat}, ${coords.lng}`);
          console.log(`📍 Источник: extractCoordsFromExpandedUrl`);
          return coords;
        }
        
        // Если координаты не найдены через extractCoordsFromExpandedUrl,
        // пробуем парсить рекурсивно (для старых форматов)
        console.log('⚠️ extractCoordsFromExpandedUrl не нашел координаты, пробуем рекурсивный парсинг...');
        const recursiveResult = await parseGoogleMapsURL(expandedUrl);
        
        if (recursiveResult) {
          console.log(`✅ ФИНАЛЬНЫЕ КООРДИНАТЫ (рекурсия): ${recursiveResult.lat}, ${recursiveResult.lng}`);
        } else {
          console.log('❌ Рекурсивный парсинг тоже не нашел координаты');
        }
        
        return recursiveResult;
      } else {
        console.error('❌ Не удалось автоматически развернуть короткую ссылку (все методы не сработали)');
        console.log('💡 Будет показан помощник для ручного разворачивания');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Ошибка парсинга Google Maps URL:', error);
    return null;
  }
}

/**
 * Проверяет валидность координат для Шри-Ланки
 * Шри-Ланка: lat 5.9° - 9.9°, lng 79.5° - 81.9°
 */
export function isValidSriLankaCoordinates(lat: number, lng: number): boolean {
  return lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9;
}

/**
 * Форматирует координаты в массив [lat, lng] для Leaflet
 */
export function formatForLeaflet(coords: ParsedCoordinates): [number, number] {
  return [coords.lat, coords.lng];
}

/**
 * Конвертирует координаты из формата Google Maps API в формат приложения
 */
export function convertGoogleMapsAPIResponse(place: any): ParsedCoordinates {
  return {
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    placeId: place.place_id,
    placeName: place.name
  };
}

/**
 * Генерирует Google Maps URL из координат
 */
export function generateGoogleMapsURL(lat: number, lng: number, zoom: number = 17): string {
  return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}

/**
 * Примеры использования и тестирования
 */
export const EXAMPLE_FORMATS = [
  '6.0135, 80.2410',
  'https://www.google.com/maps/@6.0135,80.2410,17z',
  'https://maps.google.com/?q=6.0135,80.2410',
  'https://www.google.com/maps/place/Unawatuna+Beach/@6.0097,80.2474,17z',
];

/**
 * Тестовая функция для проверки парсера
 */
export function testParser(): void {
  console.log('🧪 Тестирование парсера Google Maps URL:');
  EXAMPLE_FORMATS.forEach(format => {
    const result = parseGoogleMapsURL(format);
    console.log(`Input: ${format}`);
    console.log(`Result:`, result);
    console.log('---');
  });
}
