/**
 * Утилиты для работы с Google Maps координатами
 * Поддерживает различные форматы Google Maps URL и координат
 */

export interface ParsedCoordinates {
  lat: number;
  lng: number;
  placeId?: string;
  placeName?: string;
}

/**
 * Разворачивает короткие ссылки через серверный API
 */
async function expandShortUrlViaAPI(shortUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Используем серверный API для разворачивания:', shortUrl);
    
    const response = await fetch('/api/expand-url', {
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
    
    // Метод 1: Perplexity AI (САМЫЙ УМНЫЙ - реально открывает ссылку!)
    console.log('Метод 1: Пробуем Perplexity AI...');
    try {
      const { expandShortUrlWithAI } = await import('../services/perplexityService');
      const aiResult = await expandShortUrlWithAI(shortUrl);
      if (aiResult) {
        return aiResult;
      }
    } catch (aiError) {
      console.warn('⚠️ Метод 1 (Perplexity AI) не сработал:', aiError);
    }
    
    // Метод 2: Серверный API (нет CORS!)
    console.log('Метод 2: Пробуем серверный API...');
    const serverResult = await expandShortUrlViaAPI(shortUrl);
    if (serverResult) {
      return serverResult;
    }
    
    // Метод 3: Прямой fetch с клиента (может не работать из-за CORS)
    console.log('Метод 3: Пробуем прямой fetch...');
    try {
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow',
        mode: 'no-cors'
      });
      
      if (response.url && response.url !== shortUrl) {
        console.log('✅ Метод 3: Ссылка развернута через fetch');
        return response.url;
      }
    } catch (e) {
      console.warn('⚠️ Метод 3 (fetch) не сработал:', e);
    }
    
    // Метод 4: Hidden iframe (последняя попытка)
    console.log('Метод 4: Пробуем hidden iframe...');
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      
      const timeout = setTimeout(() => {
        try {
          const finalUrl = iframe.contentWindow?.location.href;
          document.body.removeChild(iframe);
          
          if (finalUrl && finalUrl !== shortUrl && finalUrl !== 'about:blank') {
            console.log('✅ Метод 4: Ссылка развернута через iframe');
            resolve(finalUrl);
          } else {
            console.warn('⚠️ Метод 4 (iframe) не дал результата');
            resolve(null);
          }
        } catch (err) {
          console.warn('⚠️ Метод 4 (iframe) заблокирован CORS');
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
            console.log('✅ Метод 4: Ссылка развернута через iframe (onload)');
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
    
  } catch (error) {
    console.error('❌ Все методы разворачивания не сработали:', error);
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
 * Получает координаты из Plus Code через Google Geocoding API
 * Fallback: извлекаем из ftid параметра
 */
async function extractCoordsFromPlusCode(url: string, plusCode: string): Promise<ParsedCoordinates | null> {
  try {
    console.log(`🔍 Обнаружен Plus Code: ${plusCode}`);
    
    // Пытаемся извлечь координаты из ftid (формат: 0x{hex}:{hex})
    const urlObj = new URL(url);
    const ftid = urlObj.searchParams.get('ftid');
    
    if (ftid) {
      console.log(`🔍 Найден ftid: ${ftid}`);
      
      // ftid содержит hex-encoded place_id, но не координаты напрямую
      // Нужно сделать запрос к Google Places или Geocoding API
      // НО это требует API ключ, поэтому пока пропускаем
    }
    
    // Извлекаем координаты из закодированных данных если есть
    const encodedCoords = extractCoordsFromEncodedData(url);
    if (encodedCoords) {
      return encodedCoords;
    }
    
    console.warn(`⚠️ Plus Code "${plusCode}" не может быть декодирован без Google API`);
    console.log(`💡 Возможные решения:`);
    console.log(`   1. Добавить Google Geocoding API ключ`);
    console.log(`   2. Использовать другой формат ссылки (с координатами)`);
    console.log(`   3. Открыть ссылку вручную и скопировать URL с @lat,lng`);
    
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
    
    // 1) Формат: ?q=lat,lng
    const urlObj = new URL(url);
    const q = urlObj.searchParams.get('q');
    if (q) {
      // Проверяем что это не Plus Code (содержит +)
      if (!q.includes('+')) {
        const parts = q.split(',');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            console.log(`✅ Координаты из ?q: ${lat}, ${lng}`);
            return { lat, lng, placeName: null };
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

    // 2) Формат: @lat,lng,zoom
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
          console.log(`✅ Координаты из @: ${lat}, ${lng}`);
          return { lat, lng, placeName: null };
        }
      }
    }
    
    // 3) Формат: Закодированные данные (/data=!3d!4d)
    if (url.includes('/data=') || url.includes('!3d') || url.includes('!4d')) {
      console.log(`🔍 Обнаружены закодированные данные, пробуем извлечь координаты...`);
      const encodedCoords = extractCoordsFromEncodedData(url);
      if (encodedCoords) {
        return encodedCoords;
      }
    }
    
    // 4) Формат: Адрес в ?q (требует geocoding)
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
        const coords = await extractCoordsFromExpandedUrl(expandedUrl);
        if (coords) {
          return coords;
        }
        
        // Если координаты не найдены, пробуем парсить рекурсивно
        return parseGoogleMapsURL(expandedUrl);
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
