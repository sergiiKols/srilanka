/**
 * Enrich Food POIs with detailed information
 * Uses Google Places Details API to add: photos, hours, phone, website
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
  GOOGLE_MAPS_API_KEY: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_KEY_HERE',
  RATE_LIMIT_MS: 100, // 100ms = 10 requests per second (safe rate)
  CHECKPOINT_INTERVAL: 50, // Save checkpoint every 50 POIs
  INPUT_FILE: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle', 'pass_1_0-1km.json'),
  OUTPUT_DIR: path.join(__dirname, '..', 'parsed_data', 'negombo_tangalle'),
  LOG_FILE: path.join(__dirname, '..', 'logs', 'food_enrichment.log'),
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
// PLACE DETAILS API
// ============================================================================

async function getPlaceDetails(placeId) {
  const fields = [
    'formatted_phone_number',
    'website',
    'opening_hours',
    'photo'
  ].join(',');
  
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const data = await makeHttpsRequest(url);
    
    if (data.status === 'OK' && data.result) {
      return data.result;
    } else if (data.status === 'ZERO_RESULTS') {
      return null;
    } else {
      throw new Error(`API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    log(`Details fetch failed: ${error.message}`, 'ERROR');
    return null;
  }
}

function formatOpeningHours(openingHours) {
  if (!openingHours || !openingHours.weekday_text) {
    return '';
  }
  
  // Join weekday texts with " | "
  return openingHours.weekday_text.join(' | ');
}

function getPhotoUrl(photos) {
  if (!photos || photos.length === 0) {
    return '';
  }
  
  const photoReference = photos[0].photo_reference;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
}

// ============================================================================
// ENRICHMENT LOGIC
// ============================================================================

async function enrichPOI(poi, index, total) {
  log(`[${index + 1}/${total}] Enriching: ${poi.name} (${poi.location})`);
  
  try {
    const details = await getPlaceDetails(poi.placeId);
    
    if (!details) {
      log(`  No details found for ${poi.name}`, 'WARN');
      return poi; // Return unchanged
    }
    
    // Update POI with details
    const enriched = {
      ...poi,
      phone: details.formatted_phone_number || poi.phone || '',
      website: details.website || poi.website || '',
      hours: formatOpeningHours(details.opening_hours) || poi.hours || '',
      mainPhoto: getPhotoUrl(details.photos) || poi.mainPhoto || '',
      enriched: true,
      enrichedAt: new Date().toISOString()
    };
    
    log(`  ✅ Enriched: phone=${!!enriched.phone}, website=${!!enriched.website}, hours=${!!enriched.hours}, photo=${!!enriched.mainPhoto}`);
    
    return enriched;
  } catch (error) {
    log(`  ❌ Error enriching ${poi.name}: ${error.message}`, 'ERROR');
    return poi; // Return unchanged on error
  }
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

function saveCheckpoint(allPOIs, enrichedCount, checkpointNumber) {
  const checkpointDir = path.join(CONFIG.OUTPUT_DIR, 'food_enrichment_checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    fs.mkdirSync(checkpointDir, { recursive: true });
  }
  
  const checkpointFile = path.join(checkpointDir, `checkpoint_${checkpointNumber}.json`);
  fs.writeFileSync(checkpointFile, JSON.stringify(allPOIs, null, 2));
  log(`✅ Checkpoint ${checkpointNumber} saved: ${enrichedCount} food POIs enriched`);
}

function loadLastCheckpoint() {
  const checkpointDir = path.join(CONFIG.OUTPUT_DIR, 'food_enrichment_checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    return null;
  }
  
  const checkpointFiles = fs.readdirSync(checkpointDir)
    .filter(file => file.startsWith('checkpoint_') && file.endsWith('.json'))
    .map(file => {
      const match = file.match(/checkpoint_(\d+)\.json$/);
      return match ? { file, number: parseInt(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.number - a.number);
  
  if (checkpointFiles.length === 0) {
    return null;
  }
  
  const latestCheckpoint = checkpointFiles[0];
  const checkpointPath = path.join(checkpointDir, latestCheckpoint.file);
  
  try {
    const data = JSON.parse(fs.readFileSync(checkpointPath, 'utf-8'));
    log(`📂 Loaded checkpoint ${latestCheckpoint.number}`);
    return { data, checkpointNumber: latestCheckpoint.number };
  } catch (error) {
    log(`Failed to load checkpoint: ${error.message}`, 'ERROR');
    return null;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();
  
  log('');
  log('='.repeat(70));
  log('FOOD POI ENRICHMENT - GOOGLE PLACES DETAILS API');
  log('='.repeat(70));
  log('');
  
  // Check if resuming from checkpoint
  const checkpoint = loadLastCheckpoint();
  let allPOIs;
  let checkpointNumber = 0;
  
  if (checkpoint && process.argv.includes('--resume')) {
    log('🔄 RESUME MODE: Using checkpoint data');
    allPOIs = checkpoint.data;
    checkpointNumber = checkpoint.checkpointNumber;
  } else {
    // Load original data
    log('📂 Loading data from: ' + CONFIG.INPUT_FILE);
    allPOIs = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf-8'));
    log(`✅ Loaded ${allPOIs.length} total POIs`);
  }
  
  // Filter food POIs
  const foodPOIs = allPOIs.filter(poi => poi.category === 'food');
  const alreadyEnriched = foodPOIs.filter(poi => poi.enriched).length;
  const toEnrich = foodPOIs.filter(poi => !poi.enriched);
  
  log(`🍽️  Food POIs: ${foodPOIs.length}`);
  log(`✅ Already enriched: ${alreadyEnriched}`);
  log(`⏳ To enrich: ${toEnrich.length}`);
  log('');
  
  if (toEnrich.length === 0) {
    log('✅ All food POIs already enriched!');
    return;
  }
  
  // Enrich food POIs
  let enrichedCount = alreadyEnriched;
  
  for (let i = 0; i < toEnrich.length; i++) {
    const poi = toEnrich[i];
    
    // Find index in original array
    const originalIndex = allPOIs.findIndex(p => p.id === poi.id);
    
    // Enrich
    const enriched = await enrichPOI(poi, i, toEnrich.length);
    allPOIs[originalIndex] = enriched;
    
    if (enriched.enriched) {
      enrichedCount++;
    }
    
    // Rate limiting
    await delay(CONFIG.RATE_LIMIT_MS);
    
    // Checkpoint
    if ((i + 1) % CONFIG.CHECKPOINT_INTERVAL === 0) {
      checkpointNumber++;
      saveCheckpoint(allPOIs, enrichedCount, checkpointNumber);
    }
  }
  
  // Create backup of original file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = CONFIG.INPUT_FILE.replace('.json', `_backup_before_food_enrichment_${timestamp}.json`);
  fs.copyFileSync(CONFIG.INPUT_FILE, backupFile);
  log(`✅ Backup created: ${backupFile}`);
  
  // Save enriched data
  fs.writeFileSync(CONFIG.INPUT_FILE, JSON.stringify(allPOIs, null, 2));
  log(`✅ Saved enriched data: ${CONFIG.INPUT_FILE}`);
  
  // Copy to public folder
  const publicFile = CONFIG.INPUT_FILE.replace('SRI/parsed_data', 'public/SRI/parsed_data');
  fs.copyFileSync(CONFIG.INPUT_FILE, publicFile);
  log(`✅ Updated public file: ${publicFile}`);
  
  const elapsedTime = (Date.now() - startTime) / 1000 / 60;
  
  log('');
  log('='.repeat(70));
  log('ENRICHMENT COMPLETE!');
  log('='.repeat(70));
  log(`Total food POIs enriched: ${enrichedCount}`);
  log(`Elapsed time: ${elapsedTime.toFixed(1)} minutes`);
  log(`Estimated cost: $${((toEnrich.length / 1000) * 17).toFixed(2)}`);
  log('='.repeat(70));
}

// Run
main().catch(error => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});
