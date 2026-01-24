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
 * Парсит различные форматы Google Maps URL и извлекает координаты
 * 
 * Поддерживаемые форматы:
 * 1. https://www.google.com/maps/place/Name/@6.0135,80.2410,17z
 * 2. https://maps.google.com/?q=6.0135,80.2410
 * 3. https://www.google.com/maps/@6.0135,80.2410,17z
 * 4. https://goo.gl/maps/xxx (короткая ссылка - автоматическое разворачивание)
 * 5. https://maps.app.goo.gl/xxx (новый формат коротких ссылок)
 * 6. 6.0135, 80.2410 (прямой ввод координат)
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

    // Формат 5: Короткие ссылки goo.gl или maps.app.goo.gl
    if (trimmed.includes('goo.gl')) {
      console.log('🔗 Обнаружена короткая ссылка Google Maps');
      console.log('🤖 Пробуем развернуть через AI и другие методы...');
      
      const expandedUrl = await expandShortUrl(trimmed);
      if (expandedUrl) {
        console.log('✅ Развернутый URL:', expandedUrl);
        // Рекурсивно парсим развернутый URL
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
