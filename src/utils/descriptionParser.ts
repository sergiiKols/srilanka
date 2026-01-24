/**
 * Парсер описания недвижимости для автоматического извлечения характеристик
 */

export interface ParsedDescription {
  title?: string;
  rooms?: number;
  bathrooms?: number;
  amenities: string[];
  features: {
    pool: boolean;
    parking: boolean;
    breakfast: boolean;
    petFriendly: boolean;
    airConditioning: boolean;
    wifi: boolean;
    kitchen: boolean;
    garden: boolean;
    security: boolean;
    beachfront: boolean;
  };
  wifiSpeed?: number;
  propertyType?: string;
}

/**
 * Ключевые слова для определения характеристик
 */
const AMENITY_KEYWORDS = {
  pool: ['pool', 'бассейн', 'swimming pool', 'infinity pool'],
  parking: ['parking', 'парковка', 'garage', 'гараж', 'car park'],
  breakfast: ['breakfast', 'завтрак', 'morning meal', 'включен завтрак'],
  petFriendly: ['pet friendly', 'pets allowed', 'можно с животными', 'разрешены животные', 'pet'],
  airConditioning: ['air conditioning', 'ac', 'кондиционер', 'климат контроль', 'air-con'],
  wifi: ['wifi', 'wi-fi', 'internet', 'интернет', 'wireless'],
  kitchen: ['kitchen', 'кухня', 'kitchenette', 'мини-кухня', 'cooking'],
  garden: ['garden', 'сад', 'outdoor space', 'terrace', 'терраса', 'balcony', 'балкон'],
  security: ['security', 'охрана', '24/7 security', 'gated', 'безопасность', 'guard'],
  beachfront: ['beachfront', 'beach front', 'на берегу', 'у пляжа', 'oceanfront']
};

const ROOM_PATTERNS = [
  /(\d+)\s*(?:bed|bedroom|спальн)/i,
  /(\d+)br\b/i,
  /(\d+)\s*комнат/i
];

const BATHROOM_PATTERNS = [
  /(\d+)\s*(?:bath|bathroom|ванн)/i,
  /(\d+)ba\b/i
];

const WIFI_SPEED_PATTERNS = [
  /(\d+)\s*mbps/i,
  /(\d+)\s*мбит/i,
  /wifi\s*(\d+)/i
];

const PROPERTY_TYPES = {
  villa: ['villa', 'вилла'],
  apartment: ['apartment', 'квартира', 'flat', 'condo'],
  house: ['house', 'дом', 'home'],
  room: ['room', 'комната', 'studio', 'студия'],
  hostel: ['hostel', 'хостел', 'dorm', 'общежитие'],
  hotel: ['hotel', 'отель', 'гостиница']
};

/**
 * Парсит описание и извлекает характеристики
 */
export function parseDescription(description: string): ParsedDescription {
  const lowerDesc = description.toLowerCase();
  
  const result: ParsedDescription = {
    amenities: [],
    features: {
      pool: false,
      parking: false,
      breakfast: false,
      petFriendly: false,
      airConditioning: false,
      wifi: false,
      kitchen: false,
      garden: false,
      security: false,
      beachfront: false
    }
  };

  // Извлекаем заголовок из первых 100 символов описания
  const firstLine = description.split('\n')[0].trim();
  if (firstLine.length > 0 && firstLine.length < 100) {
    result.title = firstLine;
  } else {
    // Берем первые 50 символов как заголовок
    result.title = description.slice(0, 50).trim() + (description.length > 50 ? '...' : '');
  }

  // Определяем количество комнат
  for (const pattern of ROOM_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      result.rooms = parseInt(match[1]);
      break;
    }
  }

  // Определяем количество ванных
  for (const pattern of BATHROOM_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      result.bathrooms = parseInt(match[1]);
      break;
    }
  }

  // Определяем скорость WiFi
  for (const pattern of WIFI_SPEED_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      result.wifiSpeed = parseInt(match[1]);
      break;
    }
  }

  // Определяем тип недвижимости
  for (const [type, keywords] of Object.entries(PROPERTY_TYPES)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      result.propertyType = type;
      break;
    }
  }

  // Определяем удобства и характеристики
  for (const [feature, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    const found = keywords.some(keyword => lowerDesc.includes(keyword));
    if (found) {
      result.features[feature as keyof typeof result.features] = true;
      
      // Добавляем в список amenities с красивым названием
      const amenityName = getAmenityName(feature);
      if (amenityName && !result.amenities.includes(amenityName)) {
        result.amenities.push(amenityName);
      }
    }
  }

  return result;
}

/**
 * Преобразует ключ в читаемое название
 */
function getAmenityName(key: string): string {
  const names: Record<string, string> = {
    pool: 'Pool',
    parking: 'Parking',
    breakfast: 'Breakfast',
    petFriendly: 'Pet Friendly',
    airConditioning: 'Air Conditioning',
    wifi: 'Wifi',
    kitchen: 'Kitchen',
    garden: 'Garden',
    security: 'Security',
    beachfront: 'Beachfront'
  };
  return names[key] || key;
}

/**
 * Извлекает цену из текста
 */
export function extractPrice(text: string): number | null {
  const pricePatterns = [
    /\$(\d+)/,
    /(\d+)\s*(?:usd|долларов|dollars)/i,
    /price[:\s]*(\d+)/i,
    /цена[:\s]*(\d+)/i
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Подсвечивает найденные характеристики в тексте
 */
export function highlightFeatures(text: string): Array<{text: string, highlighted: boolean}> {
  const result: Array<{text: string, highlighted: boolean}> = [];
  let lastIndex = 0;

  // Собираем все ключевые слова
  const allKeywords: string[] = [];
  Object.values(AMENITY_KEYWORDS).forEach(keywords => {
    allKeywords.push(...keywords);
  });

  // Добавляем паттерны для комнат и ванных
  const numberKeywords = ['bedroom', 'bed', 'bath', 'bathroom', 'mbps', 'br', 'ba', 
                          'спальн', 'комнат', 'ванн', 'мбит'];
  allKeywords.push(...numberKeywords);

  // Сортируем по длине (длинные сначала, чтобы избежать частичных совпадений)
  allKeywords.sort((a, b) => b.length - a.length);

  const lowerText = text.toLowerCase();
  const matches: Array<{start: number, end: number}> = [];

  // Находим все вхождения ключевых слов
  allKeywords.forEach(keyword => {
    let index = 0;
    while ((index = lowerText.indexOf(keyword, index)) !== -1) {
      matches.push({start: index, end: index + keyword.length});
      index += keyword.length;
    }
  });

  // Сортируем по позиции
  matches.sort((a, b) => a.start - b.start);

  // Удаляем перекрывающиеся совпадения
  const uniqueMatches: Array<{start: number, end: number}> = [];
  matches.forEach(match => {
    const overlaps = uniqueMatches.some(existing => 
      (match.start >= existing.start && match.start < existing.end) ||
      (match.end > existing.start && match.end <= existing.end)
    );
    if (!overlaps) {
      uniqueMatches.push(match);
    }
  });

  // Строим результат с подсветкой
  uniqueMatches.forEach(match => {
    if (match.start > lastIndex) {
      result.push({text: text.slice(lastIndex, match.start), highlighted: false});
    }
    result.push({text: text.slice(match.start, match.end), highlighted: true});
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    result.push({text: text.slice(lastIndex), highlighted: false});
  }

  return result.length > 0 ? result : [{text, highlighted: false}];
}
