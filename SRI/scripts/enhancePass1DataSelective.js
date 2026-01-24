/**
 * PASS 1 ENHANCEMENT (SELECTIVE) - Выборочная загрузка детальной информации
 * 
 * Загружает ПОЛНЫЕ данные (включая фото) ТОЛЬКО для:
 * - Food (рестораны, кафе, бары)
 * - Attraction (достопримечательности)
 * - Supermarket (супермаркеты)
 * 
 * Для остальных загружает только телефон, веб-сайт, часы (без фото)
 * 
 * Экономия: ~50% затрат (меньше запросов с фото)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { formatOpeningHours } from './formatOpeningHours.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
  API_KEY: process.env.PUBLIC_GOOGLE_MAPS_API_KEY,
  INPUT_FILE: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle', 'pass_1_0-1km.json'),
  OUTPUT_FILE: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle', 'pass_1_0-1km_enhanced.json'),
  PUBLIC_OUTPUT: path.join(__dirname, '..', '..', 'public', 'SRI', 'parsed_data', 'negombo_tangalle', 'pass_1_0-1km.json'),
  RATE_LIMIT_MS: 100,
  CHECKPOINT_INTERVAL: 100,
  CHECKPOINT_DIR: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle', 'enhancement_checkpoints'),
  
  // Категории для загрузки ФОТО
  CATEGORIES_WITH_PHOTOS: ['food', 'attraction', 'supermarket', 'liquor']
};

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
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

async function getPlaceDetails(placeId, includePhotos = false) {
  // Если нужны фото - добавляем в fields
  const fields = includePhotos 
    ? 'formatted_phone_number,website,opening_hours,photos,business_status'
    : 'formatted_phone_number,website,opening_hours,business_status';
  
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${CONFIG.API_KEY}`;
  
  try {
    const data = await makeHttpsRequest(url);
    
    if (data.status === 'OK') {
      return data.result || {};
    } else if (data.status === 'NOT_FOUND') {
      return null;
    } else {
      log(`  ⚠️  Place Details error: ${data.status}`);
      return {};
    }
  } catch (error) {
    log(`  ❌ Request failed: ${error.message}`);
    return {};
  }
}

function saveCheckpoint(pois, checkpointNumber) {
  if (!fs.existsSync(CONFIG.CHECKPOINT_DIR)) {
    fs.mkdirSync(CONFIG.CHECKPOINT_DIR, { recursive: true });
  }
  
  const checkpointFile = path.join(CONFIG.CHECKPOINT_DIR, `enhancement_checkpoint_${checkpointNumber}.json`);
  fs.writeFileSync(checkpointFile, JSON.stringify(pois, null, 2));
  log(`💾 Checkpoint ${checkpointNumber} saved (${pois.length} POI)`);
}

async function enhanceData() {
  log('');
  log('════════════════════════════════════════════════════════════');
  log('🚀 PASS 1 ENHANCEMENT (SELECTIVE) - Выборочная загрузка');
  log('════════════════════════════════════════════════════════════');
  log('');
  
  // Проверка API ключа
  if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_KEY_HERE') {
    log('❌ ERROR: Google Maps API key not found!');
    log('   Set PUBLIC_GOOGLE_MAPS_API_KEY environment variable');
    process.exit(1);
  }
  
  // Загружаем существующие данные
  if (!fs.existsSync(CONFIG.INPUT_FILE)) {
    log(`❌ ERROR: Input file not found: ${CONFIG.INPUT_FILE}`);
    process.exit(1);
  }
  
  log(`📂 Loading data from: ${CONFIG.INPUT_FILE}`);
  const data = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf-8'));
  const totalPOIs = Array.isArray(data) ? data.length : 1;
  
  // Подсчитываем категории
  const categoryCounts = {};
  data.forEach(poi => {
    categoryCounts[poi.category] = (categoryCounts[poi.category] || 0) + 1;
  });
  
  let withPhotos = 0;
  CONFIG.CATEGORIES_WITH_PHOTOS.forEach(cat => {
    withPhotos += (categoryCounts[cat] || 0);
  });
  
  log(`📊 Total POI: ${totalPOIs}`);
  log(`📸 POI with photos: ${withPhotos} (${CONFIG.CATEGORIES_WITH_PHOTOS.join(', ')})`);
  log(`📄 POI without photos: ${totalPOIs - withPhotos} (other categories)`);
  log(`⏱️  Rate limit: ${CONFIG.RATE_LIMIT_MS}ms`);
  log(`💰 Estimated cost: $${(totalPOIs * 0.017).toFixed(2)}`);
  log('');
  
  const startTime = Date.now();
  let enhanced = 0;
  let failed = 0;
  let checkpointCounter = 0;
  
  const stats = {
    withPhone: 0,
    withWebsite: 0,
    withHours: 0,
    withPhoto: 0
  };
  
  for (let i = 0; i < data.length; i++) {
    const poi = data[i];
    
    if (i % 10 === 0 && i > 0) {
      const progress = Math.round((i / totalPOIs) * 100);
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const remaining = (elapsed / i) * (totalPOIs - i);
      log(`📈 Progress: ${i}/${totalPOIs} (${progress}%) | Elapsed: ${elapsed.toFixed(1)}m | Remaining: ~${remaining.toFixed(1)}m`);
    }
    
    if (!poi.placeId) {
      log(`  ⚠️  POI ${i + 1}: ${poi.name} - no placeId`);
      continue;
    }
    
    await delay(CONFIG.RATE_LIMIT_MS);
    
    // Определяем нужны ли фото для этой категории
    const includePhotos = CONFIG.CATEGORIES_WITH_PHOTOS.includes(poi.category);
    
    const details = await getPlaceDetails(poi.placeId, includePhotos);
    
    if (details === null) {
      log(`  ⚠️  POI ${i + 1}: ${poi.name} - place not found (deleted)`);
      failed++;
      continue;
    }
    
    // Обновляем поля
    let updated = false;
    
    if (details.formatted_phone_number) {
      poi.phone = details.formatted_phone_number;
      stats.withPhone++;
      updated = true;
    }
    
    if (details.website) {
      poi.website = details.website;
      stats.withWebsite++;
      updated = true;
    }
    
    if (details.opening_hours?.weekday_text) {
      poi.hours = formatOpeningHours(details.opening_hours.weekday_text);
      stats.withHours++;
      updated = true;
    }
    
    // Фото загружаем ТОЛЬКО для определенных категорий
    if (includePhotos && details.photos && details.photos.length > 0) {
      const photoRef = details.photos[0].photo_reference;
      poi.mainPhoto = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${CONFIG.API_KEY}`;
      stats.withPhoto++;
      updated = true;
    }
    
    if (updated) {
      enhanced++;
    }
    
    // Checkpoint
    if ((i + 1) % CONFIG.CHECKPOINT_INTERVAL === 0) {
      checkpointCounter++;
      saveCheckpoint(data, checkpointCounter);
    }
  }
  
  // Сохраняем финальные данные
  log('');
  log('💾 Saving enhanced data...');
  
  fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(data, null, 2));
  log(`✅ Saved: ${CONFIG.OUTPUT_FILE}`);
  
  // Копируем в public
  const pubDir = path.dirname(CONFIG.PUBLIC_OUTPUT);
  if (!fs.existsSync(pubDir)) {
    fs.mkdirSync(pubDir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.PUBLIC_OUTPUT, JSON.stringify(data, null, 2));
  log(`✅ Copied to: ${CONFIG.PUBLIC_OUTPUT}`);
  
  const elapsedTime = (Date.now() - startTime) / 1000 / 60;
  
  log('');
  log('════════════════════════════════════════════════════════════');
  log('✅ SELECTIVE ENHANCEMENT COMPLETE!');
  log('════════════════════════════════════════════════════════════');
  log(`📊 Total POI: ${totalPOIs}`);
  log(`✅ Enhanced: ${enhanced} POI`);
  log(`❌ Failed: ${failed} POI`);
  log('');
  log('📋 STATISTICS:');
  log(`   📱 Phone: ${stats.withPhone}/${totalPOIs} (${Math.round((stats.withPhone / totalPOIs) * 100)}%)`);
  log(`   🌐 Website: ${stats.withWebsite}/${totalPOIs} (${Math.round((stats.withWebsite / totalPOIs) * 100)}%)`);
  log(`   ⏰ Hours: ${stats.withHours}/${totalPOIs} (${Math.round((stats.withHours / totalPOIs) * 100)}%)`);
  log(`   📸 Photos: ${stats.withPhoto}/${withPhotos} (${Math.round((stats.withPhoto / withPhotos) * 100)}% of food/attraction/supermarket)`);
  log('');
  log(`⏱️  Time: ${elapsedTime.toFixed(1)} minutes`);
  log(`💰 Cost: ~$${(totalPOIs * 0.017).toFixed(2)}`);
  log('');
  log('🌐 Refresh http://localhost:4321/ to see enhanced data!');
  log('════════════════════════════════════════════════════════════');
}

// Запускаем
enhanceData().catch(error => {
  console.error(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
