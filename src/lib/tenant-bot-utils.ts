/**
 * TENANT BOT UTILITIES
 * Утилиты для работы с Telegram Bot для арендаторов
 */

/**
 * Генерирует случайный 6-символьный токен для доступа к карте
 * Использует: a-z, A-Z, 0-9 (исключая похожие: 0/O, 1/I/l)
 * 
 * @returns {string} 6-символьный токен (например: "aB7cDx")
 */
export function generateMapToken(): string {
  // Исключаем похожие символы для удобства ввода вручную
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }

  return token;
}

/**
 * Строит URL личной карты пользователя
 * 
 * @param {number} userId - Telegram user ID
 * @param {string} token - Секретный токен доступа
 * @returns {string} Полный URL карты
 */
export function buildPersonalMapUrl(userId: number, token: string): string {
  // В production всегда используем Dokploy URL
  const baseUrl = 'https://traveler.energo-audit.online';

  return `${baseUrl}/map/personal/${userId}/${token}`;
}

/**
 * Извлекает Google Maps URL из текста
 * Поддерживает форматы:
 * - https://maps.app.goo.gl/...
 * - https://www.google.com/maps/...
 * - https://goo.gl/maps/...
 * 
 * @param {string} text - Текст для поиска
 * @returns {string | null} URL или null
 */
export function extractGoogleMapsUrl(text: string): string | null {
  const patterns = [
    /https?:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+/,
    /https?:\/\/www\.google\.com\/maps\/[^\s]+/,
    /https?:\/\/goo\.gl\/maps\/[a-zA-Z0-9]+/,
    /https?:\/\/maps\.google\.com\/[^\s]+/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Извлекает название локации из текста
 * Ищет известные города Шри-Ланки
 * 
 * @param {string} text - Текст для анализа
 * @returns {string | null} Название города или null
 */
export function extractLocation(text: string): string | null {
  const locations = [
    'Negombo', 'Colombo', 'Galle', 'Kandy', 'Hikkaduwa', 'Bentota',
    'Mirissa', 'Tangalle', 'Ella', 'Nuwara Eliya', 'Arugam Bay',
    'Unawatuna', 'Weligama', 'Matara', 'Trincomalee', 'Jaffna',
    // Русские названия
    'Негомбо', 'Коломбо', 'Галле', 'Канди', 'Хиккадува', 'Бентота',
    'Мирисса', 'Тангалле', 'Элла', 'Нувара Элия', 'Аругам Бей',
    'Унаватуна', 'Велигама', 'Матара', 'Тринкомали', 'Джафна'
  ];

  const lowerText = text.toLowerCase();

  for (const location of locations) {
    if (lowerText.includes(location.toLowerCase())) {
      return location;
    }
  }

  return null;
}

/**
 * Форматирует сообщение об успешном сохранении
 * 
 * @param {object} property - Сохранённый объект
 * @param {number} totalCount - Общее количество объектов
 * @param {string} mapUrl - URL карты
 * @returns {string} Форматированное сообщение
 */
export function formatSuccessMessage(
  property: any,
  totalCount: number,
  mapUrl: string
): string {
  const title = property.title || 'Property';
  const price = property.price ? `$${property.price}` : '';
  const location = property.address || 'Location unknown';

  return `✅ Объект сохранён! (всего: ${totalCount})

🏠 ${title}${price ? ', ' + price + '/месяц' : ''}
📍 ${location}
${property.photos?.length ? `📸 ${property.photos.length} ${property.photos.length === 1 ? 'фотография' : property.photos.length < 5 ? 'фотографии' : 'фотографий'}` : ''}

🗺️ <a href="${mapUrl}">Открыть мою карту</a>

💡 Пересылай сюда объявления - они автоматически добавятся на карту!`;
}

/**
 * Форматирует предупреждение о неполных данных
 * 
 * @param {object} missing - Отсутствующие данные
 * @returns {string} Предупреждение
 */
export function formatWarningMessage(missing: {
  photos?: boolean;
  location?: boolean;
  description?: boolean;
}): string {
  const warnings: string[] = [];

  if (missing.photos) {
    warnings.push('📸 Нет фотографий - добавь для лучшего отображения');
  }

  if (missing.location) {
    warnings.push('📍 Местоположение не указано - использую примерное');
  }

  if (missing.description) {
    warnings.push('💬 Описание отсутствует - добавь детали');
  }

  if (warnings.length === 0) {
    return '';
  }

  return '\n\n⚠️ Обрати внимание:\n' + warnings.join('\n');
}

/**
 * Генерирует случайный UUID v4
 * @returns {string} UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Проверяет валидность координат
 * 
 * @param {number} latitude - Широта
 * @param {number} longitude - Долгота
 * @returns {boolean} true если координаты валидны
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

/**
 * Дефолтные координаты (Коломбо, Шри-Ланка)
 */
export const DEFAULT_COORDINATES = {
  latitude: 6.9271,
  longitude: 79.8612,
  address: 'Colombo, Sri Lanka'
};

/**
 * Вычисляет расстояние между двумя точками (в метрах)
 * Использует формулу Haversine
 * 
 * @param {number} lat1 - Широта точки 1
 * @param {number} lon1 - Долгота точки 1
 * @param {number} lat2 - Широта точки 2
 * @param {number} lon2 - Долгота точки 2
 * @returns {number} Расстояние в метрах
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в метрах
}

/**
 * Форматирует цену
 * 
 * @param {number} price - Цена
 * @param {string} currency - Валюта
 * @returns {string} Форматированная цена
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (!price) return '';

  const formatted = new Intl.NumberFormat('en-US').format(price);

  switch (currency.toUpperCase()) {
    case 'USD':
      return `$${formatted}`;
    case 'LKR':
      return `Rs ${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    default:
      return `${formatted} ${currency}`;
  }
}
