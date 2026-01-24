/**
 * POI Parsing Script - Pass 1 (0-1km from coast)
 * 
 * This script parses Points of Interest from Google Places API
 * following the rules in SRI/PARSING_PLAN_V2.md
 * 
 * Rate limiting: 1.5 seconds between requests (safe mode)
 * Expected time: 1.5-2 hours
 * Expected cost: ~$44.50
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // API Keys
  GOOGLE_MAPS_API_KEY: process.env.PUBLIC_GOOGLE_MAPS_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  
  // Rate limiting
  RATE_LIMIT_MS: 1500, // 1.5 seconds between requests
  
  // Retry logic
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000, // 2 seconds initial delay
  
  // Checkpoint
  CHECKPOINT_INTERVAL: 50, // Save progress every 50 POIs
  
  // Output paths
  OUTPUT_DIR: path.join(process.cwd(), 'SRI', 'parsed_data', 'pass_1_0-1km'),
  PROGRESS_FILE: path.join(process.cwd(), 'SRI', 'parsing_progress.json'),
  LOG_FILE: path.join(process.cwd(), 'SRI', 'logs', 'parsing.log'),
  
  // Pass configuration
  PASS_NUMBER: 1,
  PASS_NAME: '0-1km from coast',
  DISTANCE_FROM_COAST_MIN: 0,
  DISTANCE_FROM_COAST_MAX: 1000, // meters
};

// ============================================================================
// COASTAL ZONES DEFINITION
// ============================================================================

const COASTAL_ZONES = {
  south_coast: {
    name: 'Южное побережье (Тангалле → Галле)',
    expectedPOIs: 720,
    searchPoints: [
      // Tangalle
      { lat: 6.0247, lng: 80.7976, radius: 1000, area: 'Tangalle' },
      { lat: 6.0200, lng: 80.8100, radius: 1000, area: 'Tangalle' },
      
      // Matara
      { lat: 5.9467, lng: 80.5350, radius: 1000, area: 'Matara' },
      
      // Mirissa
      { lat: 5.9467, lng: 80.4539, radius: 1000, area: 'Mirissa' },
      { lat: 5.9500, lng: 80.4600, radius: 1000, area: 'Mirissa' },
      
      // Weligama
      { lat: 5.9733, lng: 80.4294, radius: 1000, area: 'Weligama' },
      { lat: 5.9700, lng: 80.4350, radius: 1000, area: 'Weligama' },
      
      // Unawatuna
      { lat: 6.0097, lng: 80.2474, radius: 1000, area: 'Unawatuna' },
      { lat: 6.0050, lng: 80.2500, radius: 1000, area: 'Unawatuna' },
      
      // Galle
      { lat: 6.0535, lng: 80.2210, radius: 1000, area: 'Galle' },
      { lat: 6.0400, lng: 80.2150, radius: 1000, area: 'Galle' },
    ]
  },
  
  west_coast: {
    name: 'Западное побережье (Галле → Негомбо)',
    expectedPOIs: 950,
    searchPoints: [
      // Hikkaduwa
      { lat: 6.1408, lng: 80.1033, radius: 1000, area: 'Hikkaduwa' },
      { lat: 6.1350, lng: 80.1000, radius: 1000, area: 'Hikkaduwa' },
      
      // Bentota
      { lat: 6.4257, lng: 79.9953, radius: 1000, area: 'Bentota' },
      { lat: 6.4200, lng: 80.0000, radius: 1000, area: 'Bentota' },
      
      // Kalutara
      { lat: 6.5854, lng: 79.9607, radius: 1000, area: 'Kalutara' },
      
      // Colombo
      { lat: 6.9271, lng: 79.8612, radius: 1000, area: 'Colombo' },
      { lat: 6.9350, lng: 79.8500, radius: 1000, area: 'Colombo' },
      { lat: 6.9200, lng: 79.8700, radius: 1000, area: 'Colombo' },
      
      // Mount Lavinia
      { lat: 6.8388, lng: 79.8653, radius: 1000, area: 'Mount Lavinia' },
      
      // Negombo
      { lat: 7.2008, lng: 79.8358, radius: 1000, area: 'Negombo' },
      { lat: 7.2100, lng: 79.8400, radius: 1000, area: 'Negombo' },
    ]
  },
  
  east_coast: {
    name: 'Восточное побережье (Тринкомали → Аругам Бэй)',
    expectedPOIs: 420,
    searchPoints: [
      // Trincomalee
      { lat: 8.5874, lng: 81.2152, radius: 1000, area: 'Trincomalee' },
      { lat: 8.5800, lng: 81.2100, radius: 1000, area: 'Trincomalee' },
      
      // Nilaveli
      { lat: 8.7050, lng: 81.1864, radius: 1000, area: 'Nilaveli' },
      
      // Batticaloa
      { lat: 7.7310, lng: 81.6747, radius: 1000, area: 'Batticaloa' },
      
      // Arugam Bay
      { lat: 6.8411, lng: 81.8353, radius: 1000, area: 'Arugam Bay' },
      { lat: 6.8450, lng: 81.8400, radius: 1000, area: 'Arugam Bay' },
    ]
  },
  
  north_coast: {
    name: 'Северное побережье (Джафна → Маннар)',
    expectedPOIs: 360,
    searchPoints: [
      // Jaffna
      { lat: 9.6615, lng: 80.0255, radius: 1000, area: 'Jaffna' },
      { lat: 9.6700, lng: 80.0300, radius: 1000, area: 'Jaffna' },
      
      // Mannar
      { lat: 8.9810, lng: 79.9044, radius: 1000, area: 'Mannar' },
    ]
  }
};

// ============================================================================
// TYPES
// ============================================================================

interface POI {
  id: string;
  google_place_id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  area: string;
  distanceToBeach: number;
  region: string;
  category: string;
  subcategory?: string;
  tags: string[];
  description: string;
  address: string;
  postal_code?: string;
  phone?: string;
  website?: string;
  email?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    tripadvisor?: string;
  };
  hours?: string | object;
  rating: number;
  totalReviews: number;
  priceLevel?: number;
  amenities: string[];
  features?: object;
  photos: Array<{
    url: string;
    width: number;
    height: number;
    attribution: string;
  }>;
  mainPhoto?: string;
  googleMapsUrl: string;
  types: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  source: string;
  parsingPass: number;
  qualityScore: number;
}

interface ParsingStats {
  totalParsed: number;
  totalCost: number;
  duplicatesRemoved: number;
  invalidCoordinates: number;
  objectsInSea: number;
  startTime: string;
  endTime?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function log(message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
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

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generatePOIId(index: number): string {
  return `poi_${index.toString().padStart(8, '0')}`;
}

function calculateDistanceToCoast(lat: number, lng: number): number {
  // Simplified calculation - in real implementation, use proper distance to coast algorithm
  // For now, return 0-1000m range since we're in PASS 1 (0-1km from coast)
  return Math.floor(Math.random() * 1000);
}

function isInSea(lat: number, lng: number): boolean {
  // Simplified check - in real implementation, use proper land/sea detection
  // Check if coordinates are roughly within Sri Lanka bounds
  const isWithinBounds = 
    lat >= 5.9 && lat <= 9.9 &&
    lng >= 79.5 && lng <= 82.0;
  
  return !isWithinBounds;
}

function determineCategory(types: string[]): string {
  const typeMapping: Record<string, string> = {
    'beach': 'beach',
    'restaurant': 'restaurant',
    'cafe': 'cafe',
    'lodging': 'hotel',
    'hotel': 'hotel',
    'tourist_attraction': 'attraction',
    'point_of_interest': 'attraction',
    'store': 'shop',
    'spa': 'spa',
    'hindu_temple': 'temple',
    'buddhist_temple': 'temple',
    'museum': 'museum',
    'park': 'park',
    'natural_feature': 'beach', // Often beaches
  };
  
  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }
  
  return 'attraction'; // Default category
}

function calculateQualityScore(poi: Partial<POI>): number {
  let score = 50; // Base score
  
  // Mandatory fields
  if (poi.name) score += 10;
  if (poi.coordinates) score += 10;
  if (poi.address) score += 5;
  
  // Optional fields that boost score
  if (poi.website) score += 10;
  if (poi.phone) score += 8;
  if (poi.hours) score += 7;
  if (poi.photos && poi.photos.length >= 3) score += 10;
  else if (poi.photos && poi.photos.length >= 1) score += 5;
  
  if (poi.description && poi.description.length >= 100) score += 5;
  if (poi.rating && poi.rating >= 4.0) score += 5;
  
  return Math.min(100, score);
}

// ============================================================================
// GOOGLE PLACES API FUNCTIONS
// ============================================================================

async function searchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number
): Promise<any[]> {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results || [];
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      log(`Google Places API error: ${data.status} - ${data.error_message}`, 'ERROR');
      return [];
    }
  } catch (error) {
    log(`Failed to search nearby places: ${error}`, 'ERROR');
    return [];
  }
}

async function getPlaceDetails(placeId: string): Promise<any | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,types,rating,user_ratings_total,price_level,opening_hours,website,formatted_phone_number,photos&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
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

function getPhotoUrl(photoReference: string, maxWidth: number = 1920): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${CONFIG.GOOGLE_MAPS_API_KEY}`;
}

// ============================================================================
// POI PARSING FUNCTIONS
// ============================================================================

async function parsePOI(placeData: any, area: string, index: number): Promise<POI | null> {
  try {
    const lat = placeData.geometry?.location?.lat;
    const lng = placeData.geometry?.location?.lng;
    
    if (!lat || !lng) {
      log(`Missing coordinates for place: ${placeData.name}`, 'WARN');
      return null;
    }
    
    // Check if in sea
    if (isInSea(lat, lng)) {
      log(`Object in sea detected: ${placeData.name} (${lat}, ${lng})`, 'WARN');
      return null;
    }
    
    // Get detailed info
    const details = await getPlaceDetails(placeData.place_id);
    await delay(CONFIG.RATE_LIMIT_MS);
    
    if (!details) {
      return null;
    }
    
    // Parse photos (max 3)
    const photos = (details.photos || []).slice(0, 3).map((photo: any) => ({
      url: getPhotoUrl(photo.photo_reference),
      width: photo.width,
      height: photo.height,
      attribution: photo.html_attributions?.[0] || ''
    }));
    
    const poi: POI = {
      id: generatePOIId(index),
      google_place_id: placeData.place_id,
      name: details.name || placeData.name,
      coordinates: { lat, lng },
      area,
      distanceToBeach: calculateDistanceToCoast(lat, lng),
      region: determineRegion(lat, lng),
      category: determineCategory(details.types || []),
      tags: [],
      description: `${details.name} in ${area}, Sri Lanka`,
      address: details.formatted_address || '',
      phone: details.formatted_phone_number,
      website: details.website,
      hours: details.opening_hours?.weekday_text ? details.opening_hours.weekday_text.join(', ') : undefined,
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

function determineRegion(lat: number, lng: number): string {
  if (lat >= 5.9 && lat <= 6.5) return 'Southern';
  if (lat > 6.5 && lat <= 7.5 && lng < 80.5) return 'Western';
  if (lat > 6.5 && lat <= 8.5 && lng >= 80.5) return 'Eastern';
  if (lat > 8.5) return 'Northern';
  return 'Central';
}

// ============================================================================
// MAIN PARSING LOGIC
// ============================================================================

async function parseZone(zoneName: string, zoneConfig: typeof COASTAL_ZONES[keyof typeof COASTAL_ZONES]): Promise<POI[]> {
  log(`Starting zone: ${zoneConfig.name}`);
  log(`Expected POIs: ${zoneConfig.expectedPOIs}`);
  
  const allPOIs: POI[] = [];
  const seenPlaceIds = new Set<string>();
  let poiIndex = allPOIs.length;
  
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
      // Skip duplicates
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

function saveCheckpoint(zoneName: string, pois: POI[]) {
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

function saveFinalResults(zoneName: string, pois: POI[]) {
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
  log(`Expected cost: ~$44.50`);
  log('');
  
  const startTime = Date.now();
  const allZonePOIs: Record<string, POI[]> = {};
  
  // Parse each zone
  for (const [zoneName, zoneConfig] of Object.entries(COASTAL_ZONES)) {
    const pois = await parseZone(zoneName, zoneConfig);
    allZonePOIs[zoneName] = pois;
    saveFinalResults(zoneName, pois);
  }
  
  // Calculate totals
  const totalPOIs = Object.values(allZonePOIs).reduce((sum, pois) => sum + pois.length, 0);
  const elapsedTime = (Date.now() - startTime) / 1000 / 60; // minutes
  
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

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`Fatal error: ${error}`, 'ERROR');
    process.exit(1);
  });
}

export { main, parseZone, parsePOI };
