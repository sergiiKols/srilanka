const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  host: 'traveler-srilankadb-2ualdz',
  port: 5432,
  database: 'srilanka',
  user: 'postgres',
  password: 'YOUR_PASSWORD_HERE' // ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
});

async function importPOIs() {
  try {
    await client.connect();
    console.log('🔗 Подключено к базе данных');
    
    const jsonData = JSON.parse(fs.readFileSync('EXPORTS/POI_6176_Southwest_Coast.json', 'utf8'));
    console.log('📦 Загружено '+jsonData.length+' POI из файла');
    
    await client.query('BEGIN');
    
    const uniquePOIs = new Map();
    jsonData.forEach(poi => {
      if (poi.placeId && !uniquePOIs.has(poi.placeId)) {
        uniquePOIs.set(poi.placeId, poi);
      }
    });
    
    console.log('🔍 Уникальных POI: '+uniquePOIs.size);
    
    let count = 0;
    for (const [placeId, poi] of uniquePOIs) {
      const layer = {
        'food': 'food', 'restaurant': 'food', 'cafe': 'food', 'bar': 'food',
        'nightlife': 'entertainment', 'attraction': 'culture', 'culture': 'culture',
        'hospital': 'medical', 'pharmacy': 'medical', 'spa': 'entertainment',
        'beach': 'beach', 'atm': 'shopping', 'supermarket': 'shopping',
        'liquor': 'shopping', 'bus': 'transport', 'tuktuk': 'transport'
      }[poi.category] || 'other';
      
      await client.query(\
        INSERT INTO pois (name, description, category, layer, latitude, longitude, 
          address, phone, website, opening_hours, rating, reviews_count, price_level,
          photo_url, google_place_id, types, region, location, parsing_pass, source, 
          is_active, created_at)
        VALUES (\, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \, \)
        ON CONFLICT (google_place_id) DO UPDATE SET rating = EXCLUDED.rating, reviews_count = EXCLUDED.reviews_count
      \, [
        poi.name, poi.description || '', poi.category, layer,
        poi.coordinates.lat, poi.coordinates.lng, poi.address || '',
        poi.phone || '', poi.website || '', poi.hours || '',
        poi.rating || 0, poi.totalReviews || 0, poi.priceLevel || 0,
        poi.mainPhoto || '', poi.placeId, JSON.stringify(poi.types || []),
        poi.region, poi.location, poi.parsingPass || 2, poi.source, true, poi.createdAt
      ]);
      
      count++;
      if (count % 100 === 0) console.log('✅ Вставлено '+count+' POI...');
    }
    
    await client.query('COMMIT');
    console.log('✅ Импорт завершён! Всего: '+count+' POI');
    
    const result = await client.query('SELECT COUNT(*) as total FROM pois');
    console.log('📊 В базе: '+result.rows[0].total+' POI');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка:', err);
  } finally {
    await client.end();
  }
}

importPOIs();
