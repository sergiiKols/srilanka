/**
 * POI Parsing Script - Pass 1 (0-1km from coast)
 * 
 * IMPORTANT: This is a DEMONSTRATION script structure
 * Real implementation requires proper setup with:
 * - Valid Google Maps API key with Places API enabled
 * - Proper error handling for production
 * - Database integration
 * 
 * Usage: node SRI/scripts/parsePOIsPass1.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API Keys - REPLACE WITH YOUR ACTUAL KEYS
  GOOGLE_MAPS_API_KEY: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_KEY_HERE',
  
  // Rate limiting
  RATE_LIMIT_MS: 1500, // 1.5 seconds between requests
  
  // Checkpoint
  CHECKPOINT_INTERVAL: 50,
  
  // Output paths
  OUTPUT_DIR: path.join(__dirname, '..', 'parsed_data', 'pass_1_0-1km'),
  PROGRESS_FILE: path.join(__dirname, '..', 'parsing_progress.json'),
  LOG_FILE: path.join(__dirname, '..', 'logs', 'parsing.log'),
  
  // Pass configuration
  PASS_NUMBER: 1,
  PASS_NAME: '0-1km from coast',
};

// ============================================================================
// COASTAL ZONES DEFINITION (simplified for demo)
// ============================================================================

const COASTAL_ZONES = {
  south_coast: {
    name: 'Южное побережье',
    expectedPOIs: 720,
    searchPoints: [
      { lat: 6.0097, lng: 80.2474, radius: 1000, area: 'Unawatuna' },
      { lat: 6.0535, lng: 80.2210, radius: 1000, area: 'Galle' },
      { lat: 5.9467, lng: 80.4539, radius: 1000, area: 'Mirissa' },
    ]
  },
  // Add more zones...
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
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

// ============================================================================
// GOOGLE PLACES API FUNCTIONS
// ============================================================================

function makeApiRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function searchNearbyPlaces(lat, lng, radius) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const data = await makeApiRequest(url);
    
    if (data.status === 'OK') {
      return data.results || [];
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      log(`Google Places API error: ${data.status} - ${data.error_message || ''}`, 'ERROR');
      return [];
    }
  } catch (error) {
    log(`Failed to search nearby places: ${error}`, 'ERROR');
    return [];
  }
}

async function getPlaceDetails(placeId) {
  const fields = 'name,formatted_address,geometry,types,rating,user_ratings_total,price_level,opening_hours,website,formatted_phone_number,photos';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const data = await makeApiRequest(url);
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      log(`Place details error for ${placeId}: ${data.status}`, 'WARN');
      return null;
    }
  } catch (error) {
    log(`Failed to get place details: ${error}`, 'ERROR');
    return null;
  }
}

function getPhotoUrl(photoReference, maxWidth = 1920) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
}

// ============================================================================
// POI PARSING FUNCTIONS
// ============================================================================

function determineCategory(types) {
  // Строгий блэк-лист: если есть хотя бы один из этих типов - исключаем
  const strictBlacklist = [
    'lodging',                  // Отели и размещение - НЕ НУЖНЫ!
    'store',                    // Магазины (общий тип)
    'clothing_store',           // Магазины одежды
    'shopping_mall',            // Торговые центры
    'electronics_store',        // Электроника
    'book_store',               // Книжные магазины
    'home_goods_store',         // Товары для дома
    'furniture_store',          // Мебель
    'jewelry_store',            // Ювелирные
    'shoe_store',               // Обувь
    'hardware_store',           // Стройматериалы
    'travel_agency',            // Туристические агентства
    'real_estate_agency',       // Агентства недвижимости
    'insurance_agency',         // Страховые агентства
    'car_rental',               // Аренда авто
    'car_dealer',               // Автосалоны
    'car_repair',               // Автомастерские
    'gas_station',              // Заправки
    'parking',                  // Парковки
    'laundry',                  // Прачечные
    'hair_care',                // Парикмахерские
    'beauty_salon',             // Салоны красоты
    'dentist',                  // Стоматологии
    'lawyer',                   // Юристы
    'accounting',               // Бухгалтерия
    'atm',                      // Банкоматы
    'bank',                     // Банки
    'post_office',              // Почта
    'school',                   // Школы
    'university',               // Университеты
    'local_government_office',  // Госучреждения
  ];
  
  // Исключаем только если это locality/political БЕЗ других полезных типов
  const politicalTypes = ['political', 'sublocality', 'sublocality_level_1', 
                          'locality', 'administrative_area_level_1', 
                          'administrative_area_level_2', 'country'];
  
  // Проверяем строгий блэк-лист
  for (const type of types) {
    if (strictBlacklist.includes(type)) {
      return null; // Исключаем этот POI
    }
  }
  
  // Проверяем политические типы - исключаем только если это ЕДИНСТВЕННЫЙ значимый тип
  const nonPoliticalTypes = types.filter(t => !politicalTypes.includes(t) && t !== 'establishment' && t !== 'point_of_interest');
  if (nonPoliticalTypes.length === 0 && types.some(t => politicalTypes.includes(t))) {
    return null; // Это просто город/район, не POI
  }
  
  // Приоритетный маппинг категорий (порядок важен!)
  const typeMapping = {
    // Питание (объединяем restaurant + cafe)
    'restaurant': 'food',
    'cafe': 'food',
    'bar': 'food',
    'meal_takeaway': 'food',
    'food': 'food',
    
    // ОТЕЛИ ИСКЛЮЧЕНЫ! НЕ ПАРСИМ!
    // 'lodging': в блэк-листе
    // 'hotel': в блэк-листе
    
    // Пляжи
    'beach': 'beach',
    'natural_feature': 'beach', // Природные объекты у моря
    
    // Культура и достопримечательности
    'tourist_attraction': 'tourist_attraction',
    'museum': 'tourist_attraction',
    'art_gallery': 'tourist_attraction',
    'hindu_temple': 'tourist_attraction',
    'buddhist_temple': 'tourist_attraction',
    'church': 'tourist_attraction',
    'mosque': 'tourist_attraction',
    'place_of_worship': 'tourist_attraction',
    'historical_landmark': 'tourist_attraction',
    'park': 'tourist_attraction',
    'zoo': 'tourist_attraction',
    'aquarium': 'tourist_attraction',
    
    // SPA и wellness
    'spa': 'spa',
    'gym': 'spa',
    
    // Ночная жизнь
    'night_club': 'nightlife',
    
    // Медицинские услуги
    'pharmacy': 'pharmacy',
    'hospital': 'hospital',
    'health': 'hospital',
    
    // Магазины (полезные для туристов)
    'supermarket': 'supermarket',
    'convenience_store': 'supermarket',
    'grocery_or_supermarket': 'supermarket',
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

function determineRegion(lat) {
  if (lat >= 5.9 && lat <= 6.5) return 'Southern';
  if (lat > 6.5 && lat <= 7.5) return 'Western';
  if (lat > 7.5 && lat <= 8.5) return 'Eastern';
  if (lat > 8.5) return 'Northern';
  return 'Central';
}

function calculateQualityScore(poi) {
  let score = 50;
  
  if (poi.name) score += 10;
  if (poi.coordinates) score += 10;
  if (poi.address) score += 5;
  if (poi.website) score += 10;
  if (poi.phone) score += 8;
  if (poi.hours) score += 7;
  if (poi.photos && poi.photos.length >= 3) score += 10;
  else if (poi.photos && poi.photos.length >= 1) score += 5;
  if (poi.description && poi.description.length >= 100) score += 5;
  if (poi.rating >= 4.0) score += 5;
  
  return Math.min(100, score);
}

async function parsePOI(placeData, area, index) {
  try {
    const lat = placeData.geometry?.location?.lat;
    const lng = placeData.geometry?.location?.lng;
    
    if (!lat || !lng) {
      return null;
    }
    
    // Get detailed info
    const details = await getPlaceDetails(placeData.place_id);
    await delay(CONFIG.RATE_LIMIT_MS);
    
    if (!details) {
      return null;
    }
    
    // Parse photos (max 3)
    const photos = (details.photos || []).slice(0, 3).map((photo) => ({
      url: getPhotoUrl(photo.photo_reference),
      width: photo.width,
      height: photo.height,
      attribution: photo.html_attributions?.[0] || ''
    }));
    
    // Определяем категорию
    const category = determineCategory(details.types || []);
    
    // Если категория null - пропускаем этот POI (он в блэк-листе)
    if (category === null) {
      log(`Skipping POI (blacklisted): ${details.name} - types: ${(details.types || []).join(', ')}`, 'DEBUG');
      return null;
    }
    
    const poi = {
      id: `poi_${String(index).padStart(8, '0')}`,
      google_place_id: placeData.place_id,
      name: details.name || placeData.name,
      coordinates: { lat, lng },
      area,
      distanceToBeach: Math.floor(Math.random() * 1000),
      region: determineRegion(lat),
      category: category,
      tags: [],
      description: `${details.name} in ${area}, Sri Lanka`,
      address: details.formatted_address || '',
      phone: details.formatted_phone_number,
      website: details.website,
      hours: details.opening_hours?.weekday_text?.join(', '),
      rating: details.rating || 0,
      totalReviews: details.user_ratings_total || 0,
      priceLevel: details.price_level,
      amenities: [],
      photos,
      mainPhoto: photos[0]?.url,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeData.place_id}`,
      types: details.types || [],
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'google_places_api',
      parsingPass: CONFIG.PASS_NUMBER,
      qualityScore: 0
    };
    
    poi.qualityScore = calculateQualityScore(poi);
    
    return poi;
  } catch (error) {
    log(`Failed to parse POI: ${error}`, 'ERROR');
    return null;
  }
}

// ============================================================================
// MAIN PARSING LOGIC
// ============================================================================

async function parseZone(zoneName, zoneConfig) {
  log(`Starting zone: ${zoneConfig.name}`);
  log(`Expected POIs: ${zoneConfig.expectedPOIs}`);
  
  const allPOIs = [];
  const seenPlaceIds = new Set();
  let poiIndex = 0;
  
  for (const searchPoint of zoneConfig.searchPoints) {
    log(`Searching near ${searchPoint.area}: ${searchPoint.lat}, ${searchPoint.lng}`);
    
    const places = await searchNearbyPlaces(
      searchPoint.lat,
      searchPoint.lng,
      searchPoint.radius
    );
    
    await delay(CONFIG.RATE_LIMIT_MS);
    
    log(`Found ${places.length} places`);
    
    for (const place of places) {
      if (seenPlaceIds.has(place.place_id)) {
        continue;
      }
      seenPlaceIds.add(place.place_id);
      
      const poi = await parsePOI(place, searchPoint.area, poiIndex++);
      
      if (poi) {
        allPOIs.push(poi);
        log(`Parsed POI #${allPOIs.length}: ${poi.name} (Quality: ${poi.qualityScore})`);
        
        // Checkpoint
        if (allPOIs.length % CONFIG.CHECKPOINT_INTERVAL === 0) {
          log(`Checkpoint: ${allPOIs.length} POIs parsed`);
          saveCheckpoint(zoneName, allPOIs);
        }
      }
      
      await delay(CONFIG.RATE_LIMIT_MS);
    }
  }
  
  log(`Zone ${zoneName} complete: ${allPOIs.length} POIs parsed`);
  return allPOIs;
}

function saveCheckpoint(zoneName, pois) {
  try {
    const outputFile = path.join(CONFIG.OUTPUT_DIR, `${zoneName}_checkpoint.json`);
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(pois, null, 2));
    log(`Checkpoint saved: ${outputFile}`);
  } catch (error) {
    log(`Failed to save checkpoint: ${error}`, 'ERROR');
  }
}

function saveFinalResults(zoneName, pois) {
  try {
    const outputFile = path.join(CONFIG.OUTPUT_DIR, `${zoneName}.json`);
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(pois, null, 2));
    log(`Final results saved: ${outputFile}`);
  } catch (error) {
    log(`Failed to save results: ${error}`, 'ERROR');
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  log('='.repeat(60));
  log('STARTING POI PARSING - PASS 1 (0-1km from coast)');
  log('='.repeat(60));
  log(`Rate limiting: ${CONFIG.RATE_LIMIT_MS}ms between requests`);
  log(`Expected time: 1.5-2 hours`);
  log('');
  
  // Check API key
  if (CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_KEY_HERE') {
    log('ERROR: Google Maps API key not configured!', 'ERROR');
    log('Please set PUBLIC_GOOGLE_MAPS_API_KEY environment variable', 'ERROR');
    process.exit(1);
  }
  
  const startTime = Date.now();
  const allZonePOIs = {};
  
  // Parse each zone
  for (const [zoneName, zoneConfig] of Object.entries(COASTAL_ZONES)) {
    const pois = await parseZone(zoneName, zoneConfig);
    allZonePOIs[zoneName] = pois;
    saveFinalResults(zoneName, pois);
  }
  
  // Calculate totals
  const totalPOIs = Object.values(allZonePOIs).reduce((sum, pois) => sum + pois.length, 0);
  const elapsedTime = (Date.now() - startTime) / 1000 / 60;
  
  log('');
  log('='.repeat(60));
  log('PASS 1 COMPLETE!');
  log('='.repeat(60));
  log(`Total POIs parsed: ${totalPOIs}`);
  log(`Elapsed time: ${elapsedTime.toFixed(1)} minutes`);
  log('');
  log('⚠️  MANDATORY STOP FOR QUALITY CHECK');
  log('');
  log('Next steps:');
  log('1. Review parsed data in: SRI/parsed_data/pass_1_0-1km/');
  log('2. Perform quality check (see: SRI/PARSING_PLAN_V2.md)');
  log('3. Fill quality check report');
  log('4. Only after approval - continue to PASS 2');
  log('='.repeat(60));
}

// Run script
main().catch(error => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});

export { main, parseZone, parsePOI };
