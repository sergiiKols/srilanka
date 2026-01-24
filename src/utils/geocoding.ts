/**
 * Геокодинг: преобразование адреса в координаты
 * Использует бесплатный API Nominatim (OpenStreetMap)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Геокодинг адреса через Nominatim API (бесплатный, без ключа)
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Добавляем "Sri Lanka" к запросу для лучшей точности
    const searchQuery = address.includes('Sri Lanka') ? address : `${address}, Sri Lanka`;
    
    const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: '1'
    });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'H-Ome Finder App' // Nominatim требует User-Agent
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Обратный геокодинг: координаты в адрес
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?` + new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1'
    });

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'H-Ome Finder App'
      }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      lat,
      lng,
      displayName: result.display_name,
      address: result.address
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Определяет ближайший район из списка на основе координат
 */
export function getNearestArea(lat: number, lng: number): string {
  const areas = [
    { name: 'Unawatuna', lat: 6.0135, lng: 80.2410 },
    { name: 'Hikkaduwa', lat: 6.1282, lng: 80.1044 },
    { name: 'Mirissa', lat: 5.9450, lng: 80.4600 },
    { name: 'Weligama', lat: 5.9735, lng: 80.4385 }
  ];

  let nearest = areas[0];
  let minDistance = Infinity;

  areas.forEach(area => {
    const distance = Math.sqrt(
      Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = area;
    }
  });

  return nearest.name;
}

/**
 * Вычисляет расстояние между двумя точками в метрах (формула Haversine)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в метрах
}

/**
 * Находит ближайший пляж к заданным координатам
 */
export function findNearestBeach(lat: number, lng: number): { name: string; distance: number } {
  const beaches = [
    { name: 'Unawatuna Beach', lat: 6.0097, lng: 80.2474 },
    { name: 'Jungle Beach', lat: 6.0167, lng: 80.2500 },
    { name: 'Dalawella Beach', lat: 5.9990, lng: 80.2670 },
    { name: 'Wijaya Beach', lat: 5.9995, lng: 80.2680 },
    { name: 'Weligama Beach', lat: 5.970861, lng: 80.426226 },
    { name: 'Mirissa Beach', lat: 5.944834, lng: 80.459148 },
    { name: 'Hikkaduwa Beach', lat: 6.139468, lng: 80.106285 }
  ];

  let nearest = beaches[0];
  let minDistance = Infinity;

  beaches.forEach(beach => {
    const distance = calculateDistance(lat, lng, beach.lat, beach.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { name: beach.name, distance };
    }
  });

  return { name: nearest.name, distance: Math.round(minDistance) };
}
