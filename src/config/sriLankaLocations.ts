/**
 * SRI LANKA POPULAR TOURIST LOCATIONS
 * 
 * 7 самых популярных туристических локаций на южном побережье Шри-Ланки
 */

export interface Location {
  id: string;
  name: {
    en: string;
    ru: string;
  };
  description: {
    en: string;
    ru: string;
  };
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const SRI_LANKA_LOCATIONS: Location[] = [
  {
    id: 'unawatuna',
    name: {
      en: 'Unawatuna',
      ru: 'Унаватуна'
    },
    description: {
      en: 'Beach & diving',
      ru: 'Пляж и дайвинг'
    },
    region: 'Galle District',
    coordinates: {
      lat: 6.0108,
      lng: 80.2497
    }
  },
  {
    id: 'mirissa',
    name: {
      en: 'Mirissa',
      ru: 'Мирисса'
    },
    description: {
      en: 'Whales & surfing',
      ru: 'Киты и сёрфинг'
    },
    region: 'Matara District',
    coordinates: {
      lat: 5.9467,
      lng: 80.4706
    }
  },
  {
    id: 'hikkaduwa',
    name: {
      en: 'Hikkaduwa',
      ru: 'Хиккадува'
    },
    description: {
      en: 'Surf & nightlife',
      ru: 'Сёрф и ночная жизнь'
    },
    region: 'Galle District',
    coordinates: {
      lat: 6.1408,
      lng: 80.1033
    }
  },
  {
    id: 'tangalle',
    name: {
      en: 'Tangalle',
      ru: 'Тангалле'
    },
    description: {
      en: 'Quiet beaches',
      ru: 'Тихие пляжи'
    },
    region: 'Hambantota District',
    coordinates: {
      lat: 6.0240,
      lng: 80.7953
    }
  },
  {
    id: 'weligama',
    name: {
      en: 'Weligama',
      ru: 'Велигама'
    },
    description: {
      en: 'Surf lessons',
      ru: 'Школа сёрфинга'
    },
    region: 'Matara District',
    coordinates: {
      lat: 5.9745,
      lng: 80.4289
    }
  },
  {
    id: 'galle',
    name: {
      en: 'Galle',
      ru: 'Галле'
    },
    description: {
      en: 'Historic fort',
      ru: 'Исторический форт'
    },
    region: 'Galle District',
    coordinates: {
      lat: 6.0535,
      lng: 80.2210
    }
  },
  {
    id: 'ahangama',
    name: {
      en: 'Ahangama',
      ru: 'Аханагама'
    },
    description: {
      en: 'Surf & yoga',
      ru: 'Сёрф и йога'
    },
    region: 'Galle District',
    coordinates: {
      lat: 5.9697,
      lng: 80.3711
    }
  }
];

/**
 * Получить локацию по ID
 */
export function getLocationById(id: string): Location | undefined {
  return SRI_LANKA_LOCATIONS.find(loc => loc.id === id);
}

/**
 * Получить название локации на нужном языке
 */
export function getLocationName(id: string, language: 'ru' | 'en'): string {
  const location = getLocationById(id);
  return location ? location.name[language] : '';
}

/**
 * Получить все локации с названиями на нужном языке
 */
export function getLocationsForLanguage(language: 'ru' | 'en') {
  return SRI_LANKA_LOCATIONS.map(loc => ({
    id: loc.id,
    name: loc.name[language],
    description: loc.description[language]
  }));
}
