/**
 * POI Parsing Script - Negombo to Tangalle Region
 * 
 * REGION: Southwest Coast (220km - Main Tourist Corridor)
 * CITIES: Negombo → Colombo → Mt.Lavinia → Kalutara → Beruwala → Bentota →
 *         Hikkaduwa → Galle → Unawatuna → Mirissa → Matara → Tangalle
 * 
 * IMPORTANT: This script implements the new parsing strategy
 * focusing on the main tourist corridor instead of the entire Sri Lanka.
 * 
 * Usage: node SRI/scripts/parseNegomboTangalle.js [--pass=1|2|3]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

try {
  process.loadEnvFile();
} catch (e) { }

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API Keys
  GOOGLE_MAPS_API_KEY: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_KEY_HERE',

  // Region info
  REGION: 'negombo_tangalle',
  REGION_NAME: 'Негомбо - Тангале',
  COASTLINE_LENGTH: 220, // km

  // Current pass (1, 2, or 3)
  PASS_NUMBER: parseInt(process.argv.find(arg => arg.startsWith('--pass='))?.split('=')[1] || '1'),

  // Resume from checkpoint
  RESUME: process.argv.includes('--resume'),

  // Pass configurations
  PASSES: {
    1: { depth: '0-1km', radius: 1000, description: 'Beachfront zone' },
    2: { depth: '1-3km', radius: 2000, description: 'Infrastructure zone' },
    3: { depth: '3-10km', radius: 7000, description: 'Attractions zone' }
  },

  // Rate limiting
  RATE_LIMIT_MS: 1500, // 1.5 seconds between requests

  // Checkpoint
  CHECKPOINT_INTERVAL: 50,

  // Output paths
  OUTPUT_DIR: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle'),
  PROGRESS_FILE: path.join(__dirname, '..', 'parsing_progress.json'),
  LOG_FILE: path.join(__dirname, '..', 'logs', 'negombo_tangalle_parsing.log'),

  // Categories to search
  CATEGORIES: [
    // 1. Beach & Water Sports (beach, diving, surf)
    'beach',             // Пляжи
    'water_sports',      // Водные виды спорта
    'diving_center',     // ДОБАВЛЕНО: Дайвинг центры
    'surf_school',       // ДОБАВЛЕНО: Серф школы

    // 2. Attraction & Nightlife (attraction, nightlife)
    'tourist_attraction', // Достопримечательности
    'night_club',        // Ночные клубы
    'bar',               // Бары (для nightlife)
    'park',              // ДОБАВЛЕНО: Парки

    // 3. Pharmacy
    'pharmacy',          // Аптеки
    'drugstore',         // ДОБАВЛЕНО: Аптеки (альтернатива)

    // 4. Hospital
    'hospital',          // Больницы
    'clinic',            // Клиники
    'doctor',            // ДОБАВЛЕНО: Доктора/клиники

    // 5. Supermarket & Liquor
    'supermarket',       // Супермаркеты
    'convenience_store', // ДОБАВЛЕНО: Магазины у дома
    'liquor_store',      // Алкомаркеты

    // 6. Spa & Yoga
    'spa',               // СПА
    'yoga_studio',       // Йога студии
    'beauty_salon',      // ДОБАВЛЕНО: Салоны красоты (маппятся в spa)

    // 7. ATM
    'atm',               // Банкоматы
    'bank',              // Банки

    // 8. Tuk-tuk
    'taxi_stand',        // Тук-тук стоянки

    // 9. Bus
    'bus_station',       // Автобусы
    'transit_station',   // Транспорт
    'bus_stop',          // ДОБАВЛЕНО: Автобусные остановки

    // 10. Culture & Temples
    'hindu_temple',      // Храмы
    'church',            // Церкви
    'mosque',            // Мечети
    'museum',            // Музеи
    'aquarium',          // Аквариумы
    'zoo',               // ДОБАВЛЕНО: Зоопарки

    // Food (уже есть)
    'restaurant',        // Рестораны
    'cafe',              // Кафе
  ]
};

// ============================================================================
// SEARCH POINTS: 30 locations along Negombo - Tangalle
// ============================================================================

const SEARCH_POINTS = [
  // SEGMENT 1: Negombo - Colombo (35 km)
  { lat: 7.2089, lng: 79.8357, name: 'Negombo', priority: 10, segment: 1 },
  { lat: 7.1500, lng: 79.8500, name: 'Negombo South', priority: 8, segment: 1 },
  { lat: 7.0800, lng: 79.8600, name: 'Ja-Ela', priority: 6, segment: 1 },
  { lat: 6.9271, lng: 79.8612, name: 'Colombo', priority: 10, segment: 1 },

  // SEGMENT 2: Colombo - Kalutara (40 km)
  { lat: 6.8800, lng: 79.8620, name: 'Colombo South', priority: 8, segment: 2 },
  { lat: 6.8407, lng: 79.8636, name: 'Mount Lavinia', priority: 9, segment: 2 },
  { lat: 6.7500, lng: 79.8900, name: 'Moratuwa', priority: 7, segment: 2 },
  { lat: 6.6500, lng: 79.9300, name: 'Panadura', priority: 7, segment: 2 },
  { lat: 6.5854, lng: 79.9607, name: 'Kalutara', priority: 8, segment: 2 },

  // SEGMENT 3: Kalutara - Bentota (25 km)
  { lat: 6.5300, lng: 79.9700, name: 'Kalutara South', priority: 7, segment: 3 },
  { lat: 6.4789, lng: 79.9829, name: 'Beruwala', priority: 8, segment: 3 },
  { lat: 6.4500, lng: 79.9900, name: 'Aluthgama', priority: 7, segment: 3 },
  { lat: 6.4256, lng: 79.9951, name: 'Bentota', priority: 10, segment: 3 },

  // SEGMENT 4: Bentota - Galle (50 km)
  { lat: 6.3800, lng: 80.0200, name: 'Induruwa', priority: 7, segment: 4 },
  { lat: 6.3200, lng: 80.0500, name: 'Kosgoda', priority: 6, segment: 4 },
  { lat: 6.2400, lng: 80.0800, name: 'Balapitiya', priority: 6, segment: 4 },
  { lat: 6.1408, lng: 80.0993, name: 'Hikkaduwa', priority: 10, segment: 4 },
  { lat: 6.0900, lng: 80.1500, name: 'Dodanduwa', priority: 5, segment: 4 },
  { lat: 6.0535, lng: 80.2210, name: 'Galle', priority: 10, segment: 4 },

  // SEGMENT 5: Galle - Mirissa (35 km)
  { lat: 6.0108, lng: 80.2497, name: 'Unawatuna', priority: 10, segment: 5 },
  { lat: 5.9900, lng: 80.3200, name: 'Koggala', priority: 7, segment: 5 },
  { lat: 5.9700, lng: 80.3800, name: 'Ahangama', priority: 7, segment: 5 },
  { lat: 5.9560, lng: 80.4200, name: 'Weligama', priority: 9, segment: 5 },
  { lat: 5.9467, lng: 80.4703, name: 'Mirissa', priority: 10, segment: 5 },

  // SEGMENT 6: Matara - Tangalle (35 km)
  { lat: 5.9485, lng: 80.5353, name: 'Matara', priority: 8, segment: 6 },
  { lat: 5.9600, lng: 80.6000, name: 'Dondra', priority: 7, segment: 6 },
  { lat: 5.9800, lng: 80.6500, name: 'Dikwella', priority: 7, segment: 6 },
  { lat: 6.0100, lng: 80.7200, name: 'Hiriketiya', priority: 8, segment: 6 },
  { lat: 6.0244, lng: 80.7969, name: 'Tangalle', priority: 9, segment: 6 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);

  // Append to log file
  try {
    const logDir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// ============================================================================
// CORE PARSING FUNCTIONS
// ============================================================================

function determineCategory(types, placeName = '') {
  // ⚠️ ВАЖНО: Сначала проверяем наличие приоритетных типов
  // Если есть хотя бы один приоритетный тип - НЕ блокировать, даже если есть другие типы
  const priorityTypes = [
    'restaurant', 'cafe', 'bar', 'food',
    'beach', 'water_sports', 'surf_school', 'diving_center',
    'tourist_attraction', 'amusement_park', 'night_club',
    'pharmacy', 'drugstore',
    'hospital', 'doctor', 'clinic', 'health',
    'supermarket', 'convenience_store', 'grocery_or_supermarket', 'liquor_store',
    'spa', 'beauty_salon', 'massage', 'yoga_studio', 'yoga',
    'atm', 'bank', 'money_exchange',
    'taxi_stand', 'tuk_tuk',
    'bus_station', 'transit_station', 'bus_stop',
    'hindu_temple', 'buddhist_temple', 'church', 'mosque', 'place_of_worship',
    'temple', 'museum', 'art_gallery', 'zoo', 'aquarium', 'historical_landmark'
  ];

  // ⚠️ НОВОЕ: Проверяем ключевые слова для пляжей в названии
  const name = placeName.toLowerCase();
  const beachKeywords = ['beach', 'bay', 'shore', 'coast', 'seaside'];
  const isBeachByName = beachKeywords.some(keyword => name.includes(keyword));

  // Исключаем рестораны, бары и отели с "beach" в названии
  const isBeachBusiness = types.some(t =>
    ['restaurant', 'cafe', 'bar', 'food', 'lodging', 'hotel', 'spa', 'night_club'].includes(t)
  );

  // Если это пляж по названию и НЕ бизнес - это пляж!
  if (isBeachByName && !isBeachBusiness) {
    // Проверяем, что это tourist_attraction или просто point_of_interest
    if (types.includes('tourist_attraction') ||
      types.includes('natural_feature') ||
      (types.includes('point_of_interest') && types.includes('establishment') && types.length <= 3)) {
      return 'beach';
    }
  }

  // Если есть хотя бы один приоритетный тип - пропускаем проверку blacklist
  const hasPriorityType = types.some(t => priorityTypes.includes(t));

  // Строгий блэк-лист: применяется ТОЛЬКО если нет приоритетных типов
  const strictBlacklist = [
    'lodging',                  // Отели
    'hotel',                    // Отели
    // ❌ 'store' УДАЛЕН - блокировал pharmacy и supermarket!
    'clothing_store',           // Магазины одежды
    'shopping_mall',            // ТЦ (не supermarket!)
    'electronics_store',        // Электроника
    'book_store',               // Книжные
    'home_goods_store',         // Товары для дома
    'furniture_store',          // Мебель
    'jewelry_store',            // Ювелирные
    'shoe_store',               // Обувь
    'hardware_store',           // Стройматериалы
    'gym',                      // Спортзалы
    'fitness_center',           // Фитнес
    'barber',                   // Парикмахерские
    'hair_care',                // Уход за волосами
    'laundry',                  // Прачечные
    'laundromat',               // Прачечные
    'coworking_space',          // Коворкинги
    'typography',               // Типографии
    'printing',                 // Печать
    'travel_agency',            // Туристические агентства
    'real_estate_agency',       // Агентства недвижимости
    'insurance_agency',         // Страховые агентства
    'car_rental',               // Аренда авто
    'car_dealer',               // Автосалоны
    'car_repair',               // Автомастерские
    'gas_station',              // Заправки
    'parking',                  // Парковки
    // 'beauty_salon' УДАЛЕНО из блэк-листа - теперь маппится в spa
    'dentist',                  // Стоматологии
    'lawyer',                   // Юристы
    'accounting',               // Бухгалтерия
    'post_office',              // Почта
    'school',                   // Школы
    'university',               // Университеты
    'local_government_office',  // Госучреждения
    // Новые исключения - не туристические
    'general_contractor',       // Подрядчики
    'storage',                  // Склады
    'moving_company',           // Переезды
    'electrician',              // Электрики
    'plumber',                  // Сантехники
    'roofing_contractor',       // Кровельщики
    'painter',                  // Маляры
    'locksmith',                // Замочники
    'police',                   // Полиция
    'fire_station',             // Пожарная
    'embassy',                  // Посольства
    // ❌ 'finance' УДАЛЕНО - блокировал bank и atm! Finance допустим если есть atm/bank
    'accounting',               // Бухгалтерия
    'training',                 // Учебные центры ❌
    'computer_training',        // Компьютерные курсы ❌
    'driving_school',           // Автошколы
  ];

  // Исключаем только если это locality/political БЕЗ других полезных типов
  const politicalTypes = ['political', 'sublocality', 'sublocality_level_1',
    'locality', 'administrative_area_level_1',
    'administrative_area_level_2', 'country'];

  // Проверяем строгий блэк-лист ТОЛЬКО если нет приоритетных типов
  if (!hasPriorityType) {
    for (const type of types) {
      if (strictBlacklist.includes(type)) {
        return null; // Исключаем этот POI
      }
    }
  }

  // Проверяем политические типы - исключаем только если это ЕДИНСТВЕННЫЙ значимый тип
  const nonPoliticalTypes = types.filter(t => !politicalTypes.includes(t) && t !== 'establishment' && t !== 'point_of_interest');
  if (nonPoliticalTypes.length === 0 && types.some(t => politicalTypes.includes(t))) {
    return null; // Это просто город/район, не POI
  }

  // Приоритетный маппинг категорий (порядок важен!)
  // ⚠️ ВАЖНО: 10 групп категорий согласно FILTERS в Explorer.tsx
  // См. документацию: SRI/PARSING_CATEGORIES.md
  const typeMapping = {
    // Food (приоритет 1 - первый!)
    'restaurant': 'food',
    'cafe': 'food',
    'meal_takeaway': 'food',
    'meal_delivery': 'food',
    'food': 'food',

    // ОТЕЛИ ИСКЛЮЧЕНЫ! НЕ ПАРСИМ!
    // 'lodging': в блэк-листе
    // 'hotel': в блэк-листе

    // 1. Beach & Water Sports (beach, diving, surf)
    'beach': 'beach',
    'natural_feature': 'beach',
    'water_sports': 'surf',
    'surf_school': 'surf',
    'diving_center': 'diving',
    'scuba_diving': 'diving',

    // 2. Attraction (достопримечательности)
    'tourist_attraction': 'attraction',
    'amusement_park': 'attraction',
    'park': 'attraction',

    // 2b. Nightlife (отдельно от food)
    'night_club': 'nightlife',
    'nightclub': 'nightlife',
    'bar': 'nightlife',  // ИСПРАВЛЕНО: bar -> nightlife (было food)

    // 3. Pharmacy
    'pharmacy': 'pharmacy',
    'drugstore': 'pharmacy',

    // 4. Hospital
    'hospital': 'hospital',
    'doctor': 'hospital',
    'clinic': 'hospital',
    'health': 'hospital',

    // 5. Supermarket & Liquor
    'supermarket': 'supermarket',
    'convenience_store': 'supermarket',
    'grocery_or_supermarket': 'supermarket',
    'liquor_store': 'liquor',
    'wine_shop': 'liquor',

    // 6. Spa & Yoga
    'spa': 'spa',
    'beauty_salon': 'spa',  // ВОССТАНОВЛЕНО: салоны красоты маппятся в spa
    'massage': 'spa',
    'yoga_studio': 'yoga',
    'yoga': 'yoga',

    // 7. ATM
    'atm': 'atm',
    'bank': 'atm',
    'money_exchange': 'atm',

    // 8. Tuk-tuk
    'taxi_stand': 'tuktuk',
    'tuk_tuk': 'tuktuk',

    // 9. Bus
    'bus_station': 'bus',
    'transit_station': 'bus',
    'bus_stop': 'bus',

    // 10. Culture & Temples (ИСПРАВЛЕНО: отдельная категория culture)
    'hindu_temple': 'culture',
    'buddhist_temple': 'culture',
    'church': 'culture',
    'mosque': 'culture',
    'place_of_worship': 'culture',
    'temple': 'culture',
    'historical_landmark': 'culture',
    'museum': 'culture',
    'art_gallery': 'culture',
    'zoo': 'culture',
    'aquarium': 'culture',

    // FALLBACK - только если ничего другого не подошло
    'point_of_interest': 'attraction',

    // ❌ УДАЛЕНО - не парсим:
    // gym, fitness_center, barber, hair_care, laundry, coworking_space
  };

  // Проходим по типам и находим первое совпадение
  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }

  // Специальная обработка point_of_interest
  // Принимаем ТОЛЬКО если это единственный тип или есть другие валидные типы
  if (types.includes('point_of_interest') && types.length === 1) {
    return null; // Исключаем слишком общие POI
  }

  // Если не нашли категорию - исключаем POI
  return null;
}

async function searchNearby(lat, lng, radius, type) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;

  try {
    const data = await makeHttpsRequest(url);

    if (data.status === 'OK') {
      return data.results || [];
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    log(`Search failed: ${error.message}`, 'ERROR');
    return [];
  }
}

async function parsePOI(placeData, locationName, index) {
  try {
    // Проверяем на отели по названию и описанию
    const name = (placeData.name || '').toLowerCase();

    // Расширенный список ключевых слов для исключения отелей/вилл
    const lodgingKeywords = [
      'villa', 'cottage', 'resort', 'hotel', 'airbnb', 'homestay',
      'guesthouse', 'guest house', 'accommodation', 'bungalow', 'cabin',
      'lodge', 'inn', 'bed & breakfast', 'b&b', 'boutique hotel',
      'guest accommodation', 'holiday home', 'vacation rental',
      'holiday villa', 'beach villa', 'luxury villa', 'private villa'
    ];
    const isLodging = lodgingKeywords.some(keyword => name.includes(keyword));

    if (isLodging) {
      log(`Skipping POI (lodging by name): ${placeData.name}`, 'DEBUG');
      return null;
    }

    // Исключаем магазины мотоциклов и туристические аттракты под видом такси
    const excludeKeywords = [
      'motorcycle shop', 'bike shop', 'scooter shop', 'motor shop',
      'ryder', 'ride shop', 'bike rental shop',
      'rent a motorcycle', 'rent a bike', 'rent a scooter'
    ];
    const shouldExclude = excludeKeywords.some(keyword => name.includes(keyword));

    if (shouldExclude && (name.includes('taxi') || name.includes('tuk'))) {
      log(`Skipping POI (fake taxi/tuktuk - actually shop): ${placeData.name}`, 'DEBUG');
      return null;
    }

    // Исключаем НЕ туристические объекты из attraction
    const nonTouristKeywords = [
      'computer training', 'computer center', 'training center', 'training centre',
      'courier', 'express service', 'delivery service',
      'engineering', 'construction', 'contractor',
      'driving license', 'license center', 'licence center',
      'railway rest', 'rest house', 'government office',
      'police', 'station', 'workshop', 'garage'
    ];
    const isNonTourist = nonTouristKeywords.some(keyword => name.includes(keyword));

    if (isNonTourist) {
      log(`Skipping POI (non-tourist): ${placeData.name}`, 'DEBUG');
      return null;
    }

    // Определяем категорию на основе типов Google и названия
    const category = determineCategory(placeData.types || [], placeData.name || '');

    // Если категория null - пропускаем этот POI (он в блэк-листе)
    if (category === null) {
      log(`Skipping POI (blacklisted): ${placeData.name} - types: ${(placeData.types || []).join(', ')}`, 'DEBUG');
      return null;
    }

    // ЛОГИКА ФОТО: Загружаем фото только для туристических объектов
    // Исключаем: аптеки, госпитали, банкоматы, банки, транспорт, спа
    const EXCLUDE_PHOTOS = ['pharmacy', 'hospital', 'atm', 'bank', 'bus', 'tuktuk', 'spa'];
    let mainPhoto = '';

    if (!EXCLUDE_PHOTOS.includes(category) && placeData.photos && placeData.photos.length > 0) {
      const photoRef = placeData.photos[0].photo_reference;
      mainPhoto = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
    }

    const poi = {
      id: placeData.place_id,
      name: placeData.name,
      coordinates: {
        lat: placeData.geometry.location.lat,
        lng: placeData.geometry.location.lng
      },
      address: placeData.vicinity || placeData.formatted_address || '',
      phone: '',
      website: '',
      hours: '',
      mainPhoto: mainPhoto,
      description: '',
      category: category,
      types: placeData.types || [],
      rating: placeData.rating || 0,
      totalReviews: placeData.user_ratings_total || 0,
      placeId: placeData.place_id,
      location: locationName,
      region: CONFIG.REGION,
      parsingPass: CONFIG.PASS_NUMBER,
      source: 'google_places_api',
      createdAt: new Date().toISOString()
    };

    return poi;
  } catch (error) {
    log(`Failed to parse POI: ${error}`, 'ERROR');
    return null;
  }
}

async function parseLocation(searchPoint, customRadius = null) {
  const passConfig = CONFIG.PASSES[CONFIG.PASS_NUMBER];
  const radius = customRadius || passConfig.radius;

  log(`Parsing ${searchPoint.name} (Pass ${CONFIG.PASS_NUMBER}: ${passConfig.depth})`);
  log(`  Coordinates: ${searchPoint.lat}, ${searchPoint.lng}`);
  log(`  Radius: ${radius}m`);
  log(`  Priority: ${searchPoint.priority}/10`);

  let allPOIs = [];
  let poiIndex = 0;

  for (const category of CONFIG.CATEGORIES) {
    log(`  Searching: ${category}...`);

    await delay(CONFIG.RATE_LIMIT_MS);

    const places = await searchNearby(
      searchPoint.lat,
      searchPoint.lng,
      radius,
      category
    );

    log(`    Found: ${places.length} places`);

    for (const place of places) {
      const poi = await parsePOI(place, searchPoint.name, poiIndex++);
      if (poi) {
        allPOIs.push(poi);
      }
    }
  }

  log(`  Total POIs for ${searchPoint.name}: ${allPOIs.length}`);
  return allPOIs;
}

function loadLastCheckpoint() {
  const checkpointDir = path.join(CONFIG.OUTPUT_DIR, 'checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    return { pois: [], lastLocation: null, checkpointNumber: 0 };
  }

  // Find latest checkpoint for current pass
  const checkpointFiles = fs.readdirSync(checkpointDir)
    .filter(file => file.startsWith(`pass_${CONFIG.PASS_NUMBER}_checkpoint_`) && file.endsWith('.json'))
    .map(file => {
      const match = file.match(/checkpoint_(\d+)\.json$/);
      return match ? { file, number: parseInt(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.number - a.number);

  if (checkpointFiles.length === 0) {
    return { pois: [], lastLocation: null, checkpointNumber: 0 };
  }

  const latestCheckpoint = checkpointFiles[0];
  const checkpointPath = path.join(checkpointDir, latestCheckpoint.file);

  try {
    const pois = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));

    // Find last processed location
    const locations = [...new Set(pois.map(poi => poi.location))];
    const lastLocation = locations[locations.length - 1];

    log(`Loaded checkpoint ${latestCheckpoint.number}: ${pois.length} POIs`);
    log(`Last processed location: ${lastLocation}`);
    log(`Processed locations: ${locations.join(', ')}`);

    return {
      pois,
      lastLocation,
      checkpointNumber: latestCheckpoint.number,
      processedLocations: locations
    };
  } catch (error) {
    log(`Failed to load checkpoint: ${error.message}`, 'ERROR');
    return { pois: [], lastLocation: null, checkpointNumber: 0 };
  }
}

function saveCheckpoint(pois, checkpointNumber) {
  const checkpointDir = path.join(CONFIG.OUTPUT_DIR, 'checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    fs.mkdirSync(checkpointDir, { recursive: true });
  }

  const checkpointFile = path.join(checkpointDir, `pass_${CONFIG.PASS_NUMBER}_checkpoint_${checkpointNumber}.json`);
  fs.writeFileSync(checkpointFile, JSON.stringify(pois, null, 2));
  log(`Checkpoint ${checkpointNumber} saved: ${pois.length} POIs`);
}

function saveFinalResults(pois) {
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  const passConfig = CONFIG.PASSES[CONFIG.PASS_NUMBER];
  const outputFile = path.join(CONFIG.OUTPUT_DIR, `pass_${CONFIG.PASS_NUMBER}_${passConfig.depth.replace('/', '-')}.json`);

  fs.writeFileSync(outputFile, JSON.stringify(pois, null, 2));
  log(`Final results saved: ${outputFile}`);
  log(`Total POIs: ${pois.length}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();
  const passConfig = CONFIG.PASSES[CONFIG.PASS_NUMBER];

  log('');
  log('='.repeat(70));
  log(`POI PARSING: ${CONFIG.REGION_NAME.toUpperCase()}`);
  log(`PASS ${CONFIG.PASS_NUMBER}: ${passConfig.depth} (${passConfig.description})`);
  log('='.repeat(70));
  log(`Region: Southwest Coast`);
  log(`Distance: ${CONFIG.COASTLINE_LENGTH} km`);
  log(`Search Points: ${SEARCH_POINTS.length}`);
  log(`Categories: ${CONFIG.CATEGORIES.join(', ')}`);
  log(`Rate Limit: ${CONFIG.RATE_LIMIT_MS}ms between requests`);
  log(`Resume mode: ${CONFIG.RESUME ? 'YES' : 'NO'}`);
  log('='.repeat(70));
  log('');

  let allPOIs = [];
  let checkpointCounter = 0;
  let startIndex = 0;
  let processedLocations = [];

  // Load checkpoint if resume mode
  if (CONFIG.RESUME) {
    log('🔄 RESUME MODE: Loading last checkpoint...');
    log('');

    const checkpoint = loadLastCheckpoint();
    allPOIs = checkpoint.pois;
    checkpointCounter = checkpoint.checkpointNumber;
    processedLocations = checkpoint.processedLocations || [];

    if (allPOIs.length > 0) {
      log(`✅ Resuming from checkpoint ${checkpointCounter}`);
      log(`   Already collected: ${allPOIs.length} POIs`);
      log(`   Processed locations (${processedLocations.length}): ${processedLocations.join(', ')}`);
      log('');

      // Find where to continue
      const lastLocationIndex = SEARCH_POINTS.findIndex(sp => sp.name === checkpoint.lastLocation);
      if (lastLocationIndex >= 0) {
        startIndex = lastLocationIndex + 1;
        log(`   Continuing from location ${startIndex + 1}/${SEARCH_POINTS.length}: ${SEARCH_POINTS[startIndex]?.name || 'END'}`);
      }
    } else {
      log('⚠️  No checkpoint found, starting from beginning');
    }

    log('');
    log('='.repeat(70));
    log('');
  }

  for (let i = startIndex; i < SEARCH_POINTS.length; i++) {
    const searchPoint = SEARCH_POINTS[i];

    // Skip if already processed (in resume mode)
    if (processedLocations.includes(searchPoint.name)) {
      log(`[${i + 1}/${SEARCH_POINTS.length}] ⏭️  Skipping ${searchPoint.name} (already processed)`);
      continue;
    }

    log(`[${i + 1}/${SEARCH_POINTS.length}] Processing ${searchPoint.name}...`);

    const pois = await parseLocation(searchPoint);
    allPOIs.push(...pois);

    // Checkpoint every N POIs
    if (allPOIs.length >= (checkpointCounter + 1) * CONFIG.CHECKPOINT_INTERVAL) {
      checkpointCounter++;
      saveCheckpoint(allPOIs, checkpointCounter);
    }

    log(`Progress: ${allPOIs.length} POIs collected`);
    log('');
  }

  // Save final results
  saveFinalResults(allPOIs);

  const elapsedTime = (Date.now() - startTime) / 1000 / 60;

  log('');
  log('='.repeat(70));
  log(`PASS ${CONFIG.PASS_NUMBER} COMPLETE!`);
  log('='.repeat(70));
  log(`Total POIs collected: ${allPOIs.length}`);
  log(`Elapsed time: ${elapsedTime.toFixed(1)} minutes`);
  log(`Output: ${CONFIG.OUTPUT_DIR}`);
  log('');

  if (CONFIG.PASS_NUMBER === 1) {
    log('⚠️  MANDATORY STOP FOR QUALITY CHECK');
    log('');
    log('Next steps:');
    log('1. Review parsed data in: SRI/parsed_data/negombo_tangalle/');
    log('2. Check for objects in the sea (CRITICAL!)');
    log('3. Verify all 12 key cities are covered');
    log('4. Perform quality check (see: SRI/PARSING_PLAN_NEGOMBO_TANGALLE.md)');
    log('5. Fill quality check report');
    log('6. Only after approval - continue to PASS 2');
    log('');
    log('Run quality check: npm run parse:quality-check');
  } else {
    log('✅ Ready for next pass or final validation');
  }

  log('='.repeat(70));
}

// Run script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`Fatal error: ${error}`);
    process.exit(1);
  });
}

export { main, parseLocation, parsePOI };
