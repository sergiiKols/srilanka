import json
import psycopg2
from psycopg2.extras import execute_batch

# Конфигурация подключения
conn = psycopg2.connect(
    host='traveler-srilankadb-2ualdz',
    port=5432,
    database='srilanka',
    user='postgres',
    password='YOUR_PASSWORD_HERE'  # ЗАМЕНИТЕ НА ВАШ ПАРОЛЬ
)

cur = conn.cursor()

# Читаем JSON
with open('EXPORTS/POI_6176_Southwest_Coast.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

print(f'📦 Загружено {len(pois)} POI из файла')

# Дедупликация по placeId
unique_pois = {}
for poi in pois:
    place_id = poi.get('placeId')
    if place_id and place_id not in unique_pois:
        unique_pois[place_id] = poi

print(f'🔍 Уникальных POI: {len(unique_pois)}')

# Маппинг категорий на слои
layer_map = {
    'food': 'food', 'restaurant': 'food', 'cafe': 'food', 'bar': 'food',
    'nightlife': 'entertainment', 'attraction': 'culture', 'culture': 'culture',
    'hospital': 'medical', 'pharmacy': 'medical', 'spa': 'entertainment',
    'beach': 'beach', 'atm': 'shopping', 'supermarket': 'shopping',
    'liquor': 'shopping', 'bus': 'transport', 'tuktuk': 'transport'
}

# Подготовка данных
data = []
for place_id, poi in unique_pois.items():
    layer = layer_map.get(poi.get('category', ''), 'other')
    coords = poi.get('coordinates', {})
    
    data.append((
        poi.get('name', 'Unknown'),
        poi.get('description', ''),
        poi.get('category', 'other'),
        layer,
        coords.get('lat', 0),
        coords.get('lng', 0),
        poi.get('address', ''),
        poi.get('phone', ''),
        poi.get('website', ''),
        poi.get('hours', ''),
        poi.get('rating', 0),
        poi.get('totalReviews', 0),
        poi.get('priceLevel', 0),
        poi.get('mainPhoto', ''),
        place_id,
        json.dumps(poi.get('types', [])),
        poi.get('region', 'negombo_tangalle'),
        poi.get('location', ''),
        poi.get('parsingPass', 2),
        poi.get('source', 'google_places_api'),
        True,
        poi.get('createdAt')
    ))

# Вставка данных батчами
query = '''
INSERT INTO pois (name, description, category, layer, latitude, longitude, 
  address, phone, website, opening_hours, rating, reviews_count, price_level,
  photo_url, google_place_id, types, region, location, parsing_pass, source, 
  is_active, created_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (google_place_id) DO UPDATE SET 
  rating = EXCLUDED.rating, 
  reviews_count = EXCLUDED.reviews_count,
  updated_at = NOW()
'''

execute_batch(cur, query, data, page_size=100)
conn.commit()

print(f'✅ Импорт завершён! Вставлено {len(data)} POI')

# Проверка
cur.execute('SELECT COUNT(*) FROM pois')
total = cur.fetchone()[0]
print(f'📊 Всего POI в базе: {total}')

cur.execute('SELECT category, COUNT(*) FROM pois GROUP BY category ORDER BY COUNT(*) DESC')
print('\n📊 Статистика по категориям:')
for row in cur.fetchall():
    print(f'   {row[0]}: {row[1]} POI')

cur.close()
conn.close()
