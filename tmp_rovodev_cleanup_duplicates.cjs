/**
 * Clean up duplicates and data quality issues
 * 1. Remove duplicate POIs (same place_id)
 * 2. Fix duplicate categories ("food food food" -> "food")
 * 3. Fix duplicate types
 * 4. Remove invalid/corrupted entries
 */

const fs = require('fs');

function cleanupPOI(poi) {
  const cleaned = { ...poi };
  
  // Fix duplicate categories
  if (typeof cleaned.category === 'string') {
    const parts = cleaned.category.split(' ');
    const unique = [...new Set(parts)];
    cleaned.category = unique.join(' ').trim();
    
    // If still multiple words, take first
    if (cleaned.category.split(' ').length > 1) {
      cleaned.category = cleaned.category.split(' ')[0];
    }
  }
  
  // Fix duplicate types
  if (Array.isArray(cleaned.types)) {
    cleaned.types = [...new Set(cleaned.types)];
  }
  
  // Fix duplicate amenities
  if (Array.isArray(cleaned.amenities)) {
    cleaned.amenities = [...new Set(cleaned.amenities)];
  }
  
  return cleaned;
}

function main() {
  console.log('=== DATA CLEANUP & QUALITY CHECK ===\n');
  
  // Load data
  const data = JSON.parse(fs.readFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', 'utf-8'));
  console.log(`Total POIs: ${data.length}\n`);
  
  // 1. Find duplicates by place_id
  console.log('--- 1. CHECKING FOR DUPLICATES ---');
  const placeIdMap = {};
  const duplicates = [];
  
  data.forEach((poi, index) => {
    if (poi.placeId) {
      if (placeIdMap[poi.placeId]) {
        duplicates.push({
          placeId: poi.placeId,
          name: poi.name,
          indices: [placeIdMap[poi.placeId].index, index]
        });
      } else {
        placeIdMap[poi.placeId] = { index, poi };
      }
    }
  });
  
  console.log(`Duplicate POIs found: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('\nDuplicates:');
    duplicates.slice(0, 10).forEach(dup => {
      console.log(`  - ${dup.name} (${dup.placeId})`);
      console.log(`    Indices: ${dup.indices.join(', ')}`);
    });
  }
  
  // 2. Check for data quality issues
  console.log('\n--- 2. DATA QUALITY ISSUES ---');
  
  const issues = {
    duplicateCategories: [],
    duplicateTypes: [],
    missingCoordinates: [],
    missingNames: [],
    corruptedData: []
  };
  
  data.forEach((poi, index) => {
    // Check duplicate categories
    if (typeof poi.category === 'string' && poi.category.includes('  ')) {
      issues.duplicateCategories.push({ index, name: poi.name, category: poi.category });
    }
    
    // Check duplicate types
    if (Array.isArray(poi.types) && poi.types.length !== new Set(poi.types).size) {
      issues.duplicateTypes.push({ index, name: poi.name, types: poi.types });
    }
    
    // Check missing coordinates
    if (!poi.coordinates || !poi.coordinates.lat || !poi.coordinates.lng) {
      issues.missingCoordinates.push({ index, name: poi.name });
    }
    
    // Check missing names
    if (!poi.name || poi.name.trim() === '') {
      issues.missingNames.push({ index, id: poi.id });
    }
    
    // Check for corrupted data (weird characters)
    if (poi.name && /[^\x00-\x7F]{10,}/.test(poi.name)) {
      issues.corruptedData.push({ index, name: poi.name });
    }
  });
  
  console.log(`Duplicate categories: ${issues.duplicateCategories.length}`);
  if (issues.duplicateCategories.length > 0) {
    issues.duplicateCategories.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name}: "${item.category}"`);
    });
  }
  
  console.log(`\nDuplicate types: ${issues.duplicateTypes.length}`);
  if (issues.duplicateTypes.length > 0) {
    issues.duplicateTypes.slice(0, 5).forEach(item => {
      console.log(`  - ${item.name}: ${item.types.length} types (${new Set(item.types).size} unique)`);
    });
  }
  
  console.log(`\nMissing coordinates: ${issues.missingCoordinates.length}`);
  console.log(`Missing names: ${issues.missingNames.length}`);
  console.log(`Corrupted data: ${issues.corruptedData.length}`);
  
  // 3. Clean up data
  console.log('\n--- 3. CLEANING DATA ---');
  
  let cleaned = data.map(poi => cleanupPOI(poi));
  
  // Remove duplicates (keep first occurrence)
  const seenPlaceIds = new Set();
  cleaned = cleaned.filter(poi => {
    if (!poi.placeId) return true;
    if (seenPlaceIds.has(poi.placeId)) {
      return false;
    }
    seenPlaceIds.add(poi.placeId);
    return true;
  });
  
  // Remove POIs with missing critical data
  const beforeRemoval = cleaned.length;
  cleaned = cleaned.filter(poi => {
    return poi.name && 
           poi.coordinates && 
           poi.coordinates.lat && 
           poi.coordinates.lng;
  });
  
  const removed = beforeRemoval - cleaned.length;
  
  console.log(`Fixed duplicate categories: ${issues.duplicateCategories.length}`);
  console.log(`Fixed duplicate types: ${issues.duplicateTypes.length}`);
  console.log(`Removed duplicate POIs: ${duplicates.length}`);
  console.log(`Removed invalid POIs: ${removed}`);
  console.log(`\nFinal count: ${cleaned.length} POIs (was ${data.length})`);
  
  // 4. Generate quality report
  console.log('\n--- 4. QUALITY REPORT ---');
  
  const report = {
    total: cleaned.length,
    byCategory: {},
    withPhotos: 0,
    withPhone: 0,
    withWebsite: 0,
    withHours: 0,
    enriched: 0
  };
  
  cleaned.forEach(poi => {
    // Count by category
    if (!report.byCategory[poi.category]) {
      report.byCategory[poi.category] = 0;
    }
    report.byCategory[poi.category]++;
    
    // Count enriched data
    if (poi.mainPhoto && poi.mainPhoto !== '') report.withPhotos++;
    if (poi.phone && poi.phone !== '') report.withPhone++;
    if (poi.website && poi.website !== '') report.withWebsite++;
    if (poi.hours && poi.hours !== '') report.withHours++;
    if (poi.enriched) report.enriched++;
  });
  
  console.log('\nPOIs by category:');
  Object.keys(report.byCategory).sort((a, b) => report.byCategory[b] - report.byCategory[a]).forEach(cat => {
    console.log(`  ${cat}: ${report.byCategory[cat]}`);
  });
  
  console.log(`\nData completeness:`);
  console.log(`  Photos: ${report.withPhotos} (${(report.withPhotos/report.total*100).toFixed(1)}%)`);
  console.log(`  Phone: ${report.withPhone} (${(report.withPhone/report.total*100).toFixed(1)}%)`);
  console.log(`  Website: ${report.withWebsite} (${(report.withWebsite/report.total*100).toFixed(1)}%)`);
  console.log(`  Hours: ${report.withHours} (${(report.withHours/report.total*100).toFixed(1)}%)`);
  console.log(`  Enriched: ${report.enriched} (${(report.enriched/report.total*100).toFixed(1)}%)`);
  
  // 5. Save cleaned data
  console.log('\n--- 5. SAVING ---');
  
  // Create backup
  const timestamp = Date.now();
  fs.copyFileSync(
    'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
    `SRI/parsed_data/negombo_tangalle/pass_1_0-1km_backup_before_cleanup_${timestamp}.json`
  );
  console.log('✅ Backup created');
  
  // Save cleaned data
  fs.writeFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', JSON.stringify(cleaned, null, 2));
  console.log('✅ Main file updated');
  
  // Copy to public
  fs.copyFileSync(
    'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
    'public/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json'
  );
  console.log('✅ Public file updated');
  
  // Save quality report
  fs.writeFileSync(
    'SRI/reports/data_quality_report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('✅ Quality report saved');
  
  console.log('\n✅ CLEANUP COMPLETE!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
