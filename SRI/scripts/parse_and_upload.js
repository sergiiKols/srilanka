import { parseLocation } from './parseNegomboTangalle.js';
import { uploadPOIs } from './sync_to_supabase.js';
import path from 'path';
import { fileURLToPath } from 'url';

try {
    process.loadEnvFile();
} catch (e) { }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run(lat, lng, radiusInput) {
    if (!lat || !lng) {
        console.error('❌ Error: Latitude and Longitude are required.');
        console.log('Usage: node SRI/scripts/parse_and_upload.js <lat> <lng> [radius_meters]');
        process.exit(1);
    }

    const radius = radiusInput ? parseInt(radiusInput) : 3000;

    const point = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: `User Point (${lat}, ${lng})`,
        priority: 10
    };

    console.log(`\n🎯 Starting parse for point: ${point.lat}, ${point.lng}`);
    console.log(`📏 Radius: ${radius}m (${radius / 1000}km)`);
    console.log('='.repeat(50));

    try {
        // Use custom radius override
        const pois = await parseLocation(point, radius);

        if (pois && pois.length > 0) {
            console.log(`\n✅ Found ${pois.length} POIs`);
            await uploadPOIs(pois);
            console.log('\n✨ All done!');
        } else {
            console.log('\n⚠️ No POIs found for this location.');
        }
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Get args
const args = process.argv.slice(2);
const lat = args[0];
const lng = args[1];
const radius = args[2];

run(lat, lng, radius);
