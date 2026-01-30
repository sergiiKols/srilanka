/**
 * Google Geocoding API для декодирования Plus Codes и адресов
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId?: string;
}

/**
 * Декодирует Plus Code или адрес через Google Geocoding API
 * @param query - Plus Code (WFX7+22W) или адрес
 * @returns Координаты и адрес
 */
export async function geocode(query: string): Promise<GeocodingResult | null> {
  // Google Geocoding API key (можно создать бесплатно)
  const API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
  
  // Если API key не настроен - используем бесплатный endpoint Nominatim
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️ Google Maps API key не настроен, используем fallback');
    return geocodeWithNominatim(query);
  }
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;
    
    console.log(`🌍 Geocoding запрос: ${query}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      console.log(`✅ Geocoding успешен: ${result.formatted_address}`);
      
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } else {
      console.error(`❌ Geocoding ошибка: ${data.status}`, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка Google Geocoding API:', error);
    return null;
  }
}

/**
 * Fallback: Использует бесплатный Nominatim (OpenStreetMap) для геокодинга
 * НЕ поддерживает Plus Codes, но работает для адресов
 */
async function geocodeWithNominatim(query: string): Promise<GeocodingResult | null> {
  try {
    // Проверяем что это не Plus Code (Nominatim их не поддерживает)
    if (query.match(/[A-Z0-9]{4}\+[A-Z0-9]{2,3}/)) {
      console.log('⚠️ Plus Code обнаружен, но нужен Google API для декодирования');
      return null;
    }
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SriLanka Property App'
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      
      console.log(`✅ Nominatim geocoding успешен: ${result.display_name}`);
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Ошибка Nominatim geocoding:', error);
    return null;
  }
}

/**
 * Извлекает Plus Code из Google Maps URL
 */
export function extractPlusCode(url: string): string | null {
  const match = url.match(/\?q=([A-Z0-9]{4}\+[A-Z0-9]{2,3})/);
  return match ? match[1] : null;
}

/**
 * Проверяет является ли строка Plus Code
 */
export function isPlusCode(query: string): boolean {
  return /^[A-Z0-9]{4}\+[A-Z0-9]{2,3}/.test(query.trim());
}
