import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try {
    process.loadEnvFile();
} catch (e) {
    // Ignore if .env doesn't exist
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://mcmzdscpuoxwneuzsanu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || 'sb_secret_3M8nfMu6ZdYVvg_8Jh0JGw_ONxcbcc9';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/**
 * Uploads an array of POIs to Supabase
 * @param {Array} pois 
 */
export async function uploadPOIs(pois) {
    if (!pois || pois.length === 0) {
        console.log('⚠️ No POIs to upload');
        return;
    }

    console.log(`🚀 Uploading ${pois.length} POIs to Supabase...`);

    // Deduplicate POIs by ID to prevent Supabase error
    const uniquePois = Array.from(new Map(pois.map(poi => [poi.id, poi])).values());
    if (uniquePois.length !== pois.length) {
        console.log(`🧹 Filtered out ${pois.length - uniquePois.length} duplicates within the batch`);
    }

    const formattedPois = uniquePois.map(poi => ({
        id: poi.id,
        name: poi.name,
        category: poi.category,
        location: poi.location,
        rating: poi.rating || 0,
        total_reviews: poi.totalReviews || 0,
        lat: poi.coordinates.lat,
        lng: poi.coordinates.lng,
        main_photo: poi.mainPhoto || '',
        address: poi.address || '',
        phone: poi.phone || '',
        website: poi.website || '',
        place_id: poi.placeId,
        types: poi.types || [],
        hours: poi.hours || '',
        description: poi.description || '',
        region: poi.region || 'negombo_tangalle',
        parsing_pass: poi.parsingPass || 1,
        source: poi.source || 'manual_parse'
    }));

    try {
        const { data, error } = await supabase
            .from('poi_locations')
            .upsert(formattedPois, { onConflict: 'id' });

        if (error) throw error;
        console.log('✅ Successfully uploaded POIs to Supabase');
        return data;
    } catch (error) {
        console.error('❌ Error uploading to Supabase:', error.message);
        throw error;
    }
}

// GUI command line support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const filePath = process.argv[2];
    if (filePath && fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        uploadPOIs(Array.isArray(data) ? data : [data])
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    } else if (process.argv.includes('--check')) {
        console.log('🔗 Checking Supabase connection...');
        supabase.from('poi_locations').select('count').limit(1)
            .then(({ error }) => {
                if (error) console.error('❌ Connection failed:', error.message);
                else console.log('✅ Connection successful');
                process.exit(error ? 1 : 0);
            });
    }
}
