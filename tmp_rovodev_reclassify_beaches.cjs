/**
 * Reclassify existing POIs to add beach category
 */

const fs = require('fs');

// Beach detection logic (same as in parseNegomboTangalle.js)
function shouldBeBeach(poi) {
  const name = poi.name.toLowerCase();
  const beachKeywords = ['beach', 'bay', 'shore', 'coast', 'seaside'];
  const isBeachByName = beachKeywords.some(keyword => name.includes(keyword));
  
  if (!isBeachByName) return false;
  
  // Exclude restaurants, bars, hotels with "beach" in name
  const isBeachBusiness = poi.types.some(t => 
    ['restaurant', 'cafe', 'bar', 'food', 'lodging', 'hotel', 'spa', 'night_club'].includes(t)
  );
  
  if (isBeachBusiness) return false;
  
  // Check if it's tourist_attraction or simple point_of_interest
  return poi.types.includes('tourist_attraction') || 
         poi.types.includes('natural_feature') ||
         (poi.types.includes('point_of_interest') && poi.types.includes('establishment') && poi.types.length <= 3);
}

// Load data
const data = JSON.parse(fs.readFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', 'utf-8'));

console.log('=== RECLASSIFYING BEACHES ===\n');
console.log(`Total POIs: ${data.length}`);

let reclassified = 0;
const reclassifiedList = [];

data.forEach(poi => {
  if (shouldBeBeach(poi)) {
    const oldCategory = poi.category;
    poi.category = 'beach';
    reclassified++;
    reclassifiedList.push({
      name: poi.name,
      location: poi.location,
      oldCategory,
      newCategory: 'beach'
    });
  }
});

console.log(`\nReclassified ${reclassified} POIs to beach category\n`);
console.log('Examples:');
reclassifiedList.slice(0, 10).forEach(item => {
  console.log(`  ✅ ${item.name} (${item.location})`);
  console.log(`     ${item.oldCategory} → ${item.newCategory}`);
});

// Create backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = `SRI/parsed_data/negombo_tangalle/pass_1_0-1km_backup_before_beach_fix_${timestamp}.json`;
fs.copyFileSync(
  'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
  backupFile
);
console.log(`\n✅ Backup created: ${backupFile}`);

// Save updated data
fs.writeFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', JSON.stringify(data, null, 2));
console.log('✅ Updated file saved');

// Also update public file
fs.copyFileSync(
  'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
  'public/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json'
);
console.log('✅ Public file updated');

// Show final stats
const categoryStats = {};
data.forEach(poi => {
  categoryStats[poi.category] = (categoryStats[poi.category] || 0) + 1;
});

console.log('\n=== FINAL CATEGORY STATS ===');
Object.keys(categoryStats).sort((a, b) => categoryStats[b] - categoryStats[a]).forEach(cat => {
  console.log(`  ${cat}: ${categoryStats[cat]}`);
});
