/**
 * PROPERTY DESCRIPTION PARSER
 * Парсинг описания объекта недвижимости
 */

/**
 * Интерфейс распознанной информации об объекте
 */
export interface PropertyInfo {
  price?: number;
  currency?: string;
  price_period?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  contact_phone?: string;
  contact_name?: string;
  amenities?: string[];
}

/**
 * Парсит описание объекта и извлекает структурированные данные
 * 
 * @param {string} text - Текст описания
 * @returns {PropertyInfo} Извлечённая информация
 */
export function parsePropertyDescription(text: string): PropertyInfo {
  if (!text) {
    return {};
  }

  const info: PropertyInfo = {};

  // Парсинг цены
  const priceData = parsePrice(text);
  if (priceData) {
    info.price = priceData.price;
    info.currency = priceData.currency;
    info.price_period = priceData.period;
  }

  // Парсинг типа объекта
  info.property_type = parsePropertyType(text);

  // Парсинг количества спален
  info.bedrooms = parseBedrooms(text);

  // Парсинг количества ванных
  info.bathrooms = parseBathrooms(text);

  // Парсинг площади
  info.area_sqm = parseArea(text);

  // Парсинг телефона
  info.contact_phone = parsePhone(text);

  // Парсинг удобств
  info.amenities = parseAmenities(text);

  return info;
}

/**
 * Парсит цену из текста
 * Поддерживает форматы: $500, 500$, 500 USD, Rs 50000
 */
function parsePrice(text: string): { price: number; currency: string; period?: string } | null {
  // Паттерны для разных валют
  const patterns = [
    // $500, $500/month, $500 per month
    /\$\s*(\d+[,.]?\d*)\s*(?:\/\s*month|per\s*month|monthly)?/i,
    // 500$, 500 dollars
    /(\d+[,.]?\d*)\s*(?:\$|dollars?|usd)\s*(?:\/\s*month|per\s*month|monthly)?/i,
    // Rs 50000, 50000 LKR
    /(?:Rs\.?|LKR)\s*(\d+[,.]?\d*)/i,
    // €500, 500€, 500 EUR
    /(?:€|EUR)\s*(\d+[,.]?\d*)|(\d+[,.]?\d*)\s*(?:€|EUR)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1] || match[2];
      const price = parseFloat(priceStr.replace(/,/g, ''));

      if (isNaN(price)) continue;

      // Определяем валюту
      let currency = 'USD';
      if (/Rs|LKR/i.test(match[0])) {
        currency = 'LKR';
      } else if (/€|EUR/i.test(match[0])) {
        currency = 'EUR';
      }

      // Определяем период
      let period = 'month';
      if (/day|daily/i.test(text)) {
        period = 'day';
      } else if (/week|weekly/i.test(text)) {
        period = 'week';
      } else if (/year|yearly|annual/i.test(text)) {
        period = 'year';
      }

      return { price, currency, period };
    }
  }

  return null;
}

/**
 * Парсит тип объекта
 */
function parsePropertyType(text: string): string | undefined {
  const types = [
    { keywords: ['studio', 'студия'], type: 'studio' },
    { keywords: ['apartment', 'apt', 'flat', 'апартамент', 'квартира'], type: 'apartment' },
    { keywords: ['house', 'home', 'дом'], type: 'house' },
    { keywords: ['room', 'комната'], type: 'room' },
    { keywords: ['villa', 'вилла'], type: 'villa' },
    { keywords: ['condo', 'condominium', 'кондо'], type: 'condo' },
    { keywords: ['bungalow', 'бунгало'], type: 'bungalow' },
  ];

  const lowerText = text.toLowerCase();

  for (const { keywords, type } of types) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type;
      }
    }
  }

  return undefined;
}

/**
 * Парсит количество спален
 */
function parseBedrooms(text: string): number | undefined {
  const patterns = [
    /(\d+)\s*(?:bed(?:room)?s?|br|спальн)/i,
    /(\d+)BR/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (!isNaN(count) && count >= 0 && count <= 20) {
        return count;
      }
    }
  }

  return undefined;
}

/**
 * Парсит количество ванных
 */
function parseBathrooms(text: string): number | undefined {
  const patterns = [
    /(\d+)\s*(?:bath(?:room)?s?|ванн)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (!isNaN(count) && count >= 0 && count <= 10) {
        return count;
      }
    }
  }

  return undefined;
}

/**
 * Парсит площадь
 */
function parseArea(text: string): number | undefined {
  const patterns = [
    /(\d+)\s*(?:sqm|m2|m²|кв\.?м\.?|square\s*meter)/i,
    /(\d+)\s*(?:sq\.?\s*ft\.?|sqft|square\s*feet)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let area = parseInt(match[1]);
      
      // Конвертируем sq ft в sqm если нужно
      if (/sq\.?\s*ft|sqft|square\s*feet/i.test(match[0])) {
        area = Math.round(area * 0.092903); // 1 sq ft = 0.092903 sqm
      }
      
      if (!isNaN(area) && area > 0 && area < 10000) {
        return area;
      }
    }
  }

  return undefined;
}

/**
 * Парсит номер телефона
 */
function parsePhone(text: string): string | undefined {
  const patterns = [
    // +94 77 123 4567, +94771234567
    /\+94\s*\d{2}\s*\d{3}\s*\d{4}/,
    // 077 123 4567, 0771234567
    /0\d{2}\s*\d{3}\s*\d{4}/,
    // Любой телефон с + в начале
    /\+\d{1,3}[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{4}/,
    // Общий паттерн телефона
    /\d{3}[\s-]?\d{3}[\s-]?\d{4}/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Парсит удобства (amenities)
 */
function parseAmenities(text: string): string[] | undefined {
  const amenitiesList = [
    { keywords: ['wifi', 'wi-fi', 'интернет'], name: 'WiFi' },
    { keywords: ['ac', 'air con', 'conditioning', 'кондиционер'], name: 'AC' },
    { keywords: ['pool', 'бассейн'], name: 'Pool' },
    { keywords: ['parking', 'парковка'], name: 'Parking' },
    { keywords: ['kitchen', 'кухня'], name: 'Kitchen' },
    { keywords: ['furnished', 'мебель'], name: 'Furnished' },
    { keywords: ['balcony', 'балкон'], name: 'Balcony' },
    { keywords: ['gym', 'fitness', 'спортзал'], name: 'Gym' },
    { keywords: ['security', 'охрана'], name: 'Security' },
    { keywords: ['elevator', 'lift', 'лифт'], name: 'Elevator' },
    { keywords: ['pet', 'animal', 'животн'], name: 'Pet friendly' },
    { keywords: ['garden', 'сад'], name: 'Garden' },
    { keywords: ['sea view', 'ocean view', 'вид на море'], name: 'Sea view' },
    { keywords: ['beach', 'пляж'], name: 'Near beach' },
  ];

  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const { keywords, name } of amenitiesList) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        found.push(name);
        break; // Не дублируем одно удобство
      }
    }
  }

  return found.length > 0 ? found : undefined;
}

/**
 * Извлекает title из описания (первые 50 символов)
 */
export function extractTitle(text: string, propertyType?: string): string {
  if (!text) {
    return propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : 'Property';
  }

  // Берём первую строку или первые 50 символов
  const firstLine = text.split('\n')[0];
  const title = firstLine.substring(0, 50).trim();

  return title || 'Property';
}

/**
 * Очищает текст от лишних символов
 */
export function cleanText(text: string): string {
  return text
    .replace(/[\r\n]+/g, '\n') // Множественные переносы → один
    .replace(/\s+/g, ' ') // Множественные пробелы → один
    .trim();
}

/**
 * Форматирует информацию об объекте для отображения
 */
export function formatPropertyInfo(info: PropertyInfo): string {
  const lines: string[] = [];

  if (info.property_type) {
    lines.push(`🏠 Тип: ${info.property_type}`);
  }

  if (info.price) {
    const currency = info.currency === 'LKR' ? 'Rs' : info.currency === 'EUR' ? '€' : '$';
    const period = info.price_period === 'day' ? '/день' : info.price_period === 'week' ? '/неделя' : '/месяц';
    lines.push(`💰 Цена: ${currency}${info.price}${period}`);
  }

  if (info.bedrooms) {
    lines.push(`🛏️ Спален: ${info.bedrooms}`);
  }

  if (info.bathrooms) {
    lines.push(`🚿 Ванных: ${info.bathrooms}`);
  }

  if (info.area_sqm) {
    lines.push(`📐 Площадь: ${info.area_sqm} м²`);
  }

  if (info.contact_phone) {
    lines.push(`📞 Контакт: ${info.contact_phone}`);
  }

  if (info.amenities && info.amenities.length > 0) {
    lines.push(`✨ Удобства: ${info.amenities.join(', ')}`);
  }

  return lines.join('\n');
}
