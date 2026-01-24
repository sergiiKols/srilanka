/**
 * Test script to verify beach detection logic
 */

const fs = require('fs');

// Copy the determineCategory function with our fix
function determineCategory(types, placeName = '') {
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
  
  const hasPriorityType = types.some(t => priorityTypes.includes(t));
  
  const typeMapping = {
    'restaurant': 'food',
    'cafe': 'food',
    'meal_takeaway': 'food',
    'meal_delivery': 'food',
    'food': 'food',
    'beach': 'beach',
    'natural_feature': 'beach',
    'water_sports': 'surf',
    'surf_school': 'surf',
    'diving_center': 'diving',
    'scuba_diving': 'diving',
    'tourist_attraction': 'attraction',
    'amusement_park': 'attraction',
    'park': 'attraction',
    'night_club': 'nightlife',
    'nightclub': 'nightlife',
    'bar': 'nightlife',
    'pharmacy': 'pharmacy',
    'drugstore': 'pharmacy',
    'hospital': 'hospital',
    'doctor': 'hospital',
    'clinic': 'hospital',
    'health': 'hospital',
    'supermarket': 'supermarket',
    'convenience_store': 'supermarket',
    'grocery_or_supermarket': 'supermarket',
    'liquor_store': 'liquor',
    'wine_shop': 'liquor',
    'spa': 'spa',
    'beauty_salon': 'spa',
    'massage': 'spa',
    'yoga_studio': 'yoga',
    'yoga': 'yoga',
    'atm': 'atm',
    'bank': 'atm',
    'money_exchange': 'atm',
    'taxi_stand': 'tuktuk',
    'tuk_tuk': 'tuktuk',
    'bus_station': 'bus',
    'transit_station': 'bus',
    'bus_stop': 'bus',
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
    'point_of_interest': 'attraction',
  };
  
  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }
  
  if (types.includes('point_of_interest') && types.length === 1) {
    return null;
  }
  
  return null;
}

// Test with actual data
const data = JSON.parse(fs.readFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', 'utf-8'));

console.log('=== BEACH DETECTION TEST ===\n');

// Find POIs with "beach" in name
const beachNamePOIs = data.filter(poi => poi.name.toLowerCase().includes('beach'));

console.log(`Found ${beachNamePOIs.length} POIs with "beach" in name\n`);

// Test recategorization
let beachCount = 0;
const examples = [];

for (const poi of beachNamePOIs) {  // Check ALL, not just first 20
  const oldCategory = poi.category;
  const newCategory = determineCategory(poi.types, poi.name);
  
  if (newCategory === 'beach') {
    beachCount++;
    examples.push({
      name: poi.name,
      location: poi.location,
      oldCategory,
      newCategory,
      types: poi.types
    });
  }
}

console.log(`Would recategorize ${beachCount} POIs to "beach" category\n`);
console.log('Examples:\n');
examples.slice(0, 10).forEach(ex => {
  console.log(`  ✅ "${ex.name}" (${ex.location})`);
  console.log(`     ${ex.oldCategory} → ${ex.newCategory}`);
  console.log(`     Types: ${ex.types.join(', ')}\n`);
});

console.log('\n=== SUMMARY ===');
console.log(`Total POIs: ${data.length}`);
console.log(`POIs with "beach" in name: ${beachNamePOIs.length}`);
console.log(`Would be recategorized to beach: ${beachCount}`);

// Analyze what categories other "beach" POIs have
console.log('\n=== OTHER BEACH POIs (not tourist_attraction) ===');
const otherBeaches = beachNamePOIs.filter(poi => !poi.types.includes('tourist_attraction'));
console.log(`Total: ${otherBeaches.length}\n`);

const categoryBreakdown = {};
otherBeaches.forEach(poi => {
  if (!categoryBreakdown[poi.category]) {
    categoryBreakdown[poi.category] = [];
  }
  categoryBreakdown[poi.category].push({
    name: poi.name,
    types: poi.types
  });
});

Object.keys(categoryBreakdown).forEach(cat => {
  console.log(`\n${cat.toUpperCase()}: ${categoryBreakdown[cat].length} POIs`);
  categoryBreakdown[cat].slice(0, 3).forEach(poi => {
    console.log(`  - "${poi.name}"`);
    console.log(`    Types: ${poi.types.join(', ')}`);
  });
});
