/**
 * Fix photo for specific restaurant by fetching alternative photos from Google Places
 */

const fs = require('fs');
const https = require('https');

const GOOGLE_API_KEY = process.env.PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_KEY';
const PLACE_ID = 'ChIJe9BIOtpK4ToRE_5poqekn5c'; // Rukmila restaurant

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

async function getPlacePhotos(placeId) {
  const fields = 'photo,name,rating,user_ratings_total';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
  
  try {
    const data = await makeHttpsRequest(url);
    
    if (data.status === 'OK' && data.result) {
      return data.result;
    } else {
      throw new Error(`API Error: ${data.status}`);
    }
  } catch (error) {
    console.error(`Failed to fetch photos: ${error.message}`);
    return null;
  }
}

function getPhotoUrl(photoReference, maxWidth = 800) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

async function main() {
  console.log('=== FIXING RESTAURANT PHOTO ===\n');
  console.log('Place ID:', PLACE_ID);
  console.log('Fetching alternative photos...\n');
  
  // Get all photos from Google Places
  const placeDetails = await getPlacePhotos(PLACE_ID);
  
  if (!placeDetails || !placeDetails.photos) {
    console.error('❌ No photos found for this place');
    return;
  }
  
  console.log(`✅ Found ${placeDetails.photos.length} photos`);
  console.log(`Place: ${placeDetails.name}`);
  console.log(`Rating: ${placeDetails.rating} (${placeDetails.user_ratings_total} reviews)\n`);
  
  // Display all available photos
  console.log('Available photos:');
  placeDetails.photos.forEach((photo, index) => {
    const url = getPhotoUrl(photo.photo_reference);
    console.log(`\n${index + 1}. Photo ${index + 1}`);
    console.log(`   URL: ${url}`);
    console.log(`   Attributions: ${photo.html_attributions.join(', ')}`);
  });
  
  // Ask user which photo to use (we'll use photo index 1 - second photo)
  const selectedPhotoIndex = 1; // Change this to select different photo (0-based)
  
  if (selectedPhotoIndex >= placeDetails.photos.length) {
    console.error(`\n❌ Invalid photo index. Only ${placeDetails.photos.length} photos available.`);
    return;
  }
  
  const selectedPhoto = placeDetails.photos[selectedPhotoIndex];
  const newPhotoUrl = getPhotoUrl(selectedPhoto.photo_reference);
  
  console.log(`\n📸 Selected photo ${selectedPhotoIndex + 1}:`);
  console.log(`   ${newPhotoUrl}`);
  
  // Load data and update
  console.log('\nLoading data...');
  const data = JSON.parse(fs.readFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', 'utf-8'));
  
  // Find restaurant
  const restaurant = data.find(poi => poi.placeId === PLACE_ID);
  
  if (!restaurant) {
    console.error('❌ Restaurant not found in data');
    return;
  }
  
  console.log(`\nFound: ${restaurant.name}`);
  console.log(`Old photo: ${restaurant.mainPhoto}`);
  console.log(`New photo: ${newPhotoUrl}`);
  
  // Update photo
  restaurant.mainPhoto = newPhotoUrl;
  restaurant.photoUpdated = true;
  restaurant.photoUpdatedAt = new Date().toISOString();
  
  // Create backup
  const timestamp = Date.now();
  fs.copyFileSync(
    'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
    `SRI/parsed_data/negombo_tangalle/pass_1_0-1km_backup_before_photo_fix_${timestamp}.json`
  );
  console.log('\n✅ Backup created');
  
  // Save
  fs.writeFileSync('SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json', JSON.stringify(data, null, 2));
  console.log('✅ Main file updated');
  
  // Copy to public
  fs.copyFileSync(
    'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json',
    'public/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json'
  );
  console.log('✅ Public file updated');
  
  console.log('\n✅ Done! Photo updated for Rukmila restaurant');
  console.log('\n📝 To change to a different photo, edit selectedPhotoIndex in the script');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
