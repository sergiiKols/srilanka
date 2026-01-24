# 📋 Категории для парсинга POI

## 🚨 КРИТИЧЕСКИЕ ПРАВИЛА МАППИНГА (2026-01-24)

### ⚠️ ОБЯЗАТЕЛЬНО СОБЛЮДАТЬ:

#### 1. Culture ≠ Attraction (храмы отдельно!)
```javascript
// ✅ ПРАВИЛЬНО:
'hindu_temple': 'culture',
'buddhist_temple': 'culture',
'church': 'culture',
'mosque': 'culture',
'temple': 'culture',
'museum': 'culture',
'art_gallery': 'culture',
'zoo': 'culture',
'aquarium': 'culture',

// ❌ НЕПРАВИЛЬНО:
'hindu_temple': 'attraction',  // НЕТ! Это culture
'temple': 'attraction',         // НЕТ! Это culture
```

#### 2. Nightlife ≠ Food (бары отдельно!)
```javascript
// ✅ ПРАВИЛЬНО:
'bar': 'nightlife',
'night_club': 'nightlife',

// ❌ НЕПРАВИЛЬНО:
'bar': 'food',  // НЕТ! Это nightlife
```

#### 3. Beauty_salon → Spa (НЕ блокировать!)
```javascript
// ✅ ПРАВИЛЬНО:
'beauty_salon': 'spa',  // Да, маппить в spa

// ❌ НЕПРАВИЛЬНО в черном списке:
// 'beauty_salon',  // НЕТ! Не блокировать!
```

---

## ❌ ИСКЛЮЧЕНИЯ
- **hotel** - НЕ ПАРСИТЬ! Отели не нужны (используем только Supporting Points для жилья)
- **typography** / **printing** - НЕ ПАРСИТЬ! Типографии не нужны
- **gym** - НЕ ПАРСИТЬ! Спортзалы не нужны
- **barber** - НЕ ПАРСИТЬ! Парикмахерские не нужны
- **laundry** - НЕ ПАРСИТЬ! Прачечные не нужны
- **coworking** - НЕ ПАРСИТЬ! Коворкинги не нужны

## ✅ ОБЯЗАТЕЛЬНЫЕ КАТЕГОРИИ (10 ГРУПП)

### Группы для парсинга и отображения:

1. **beach** (Beach & Water Sports 🏖️)
   - `beach` - пляжи
   - `diving` - дайвинг
   - `surf` - серфинг и водные виды спорта

2. **attraction** (Attractions & Nightlife ⭐)
   - `attraction` - достопримечательности
   - `nightlife` - ночные клубы и бары

3. **pharmacy** (Pharmacy 💊)
   - `pharmacy` - аптеки

4. **hospital** (Hospital 🏥)
   - `hospital` - больницы и клиники

5. **supermarket** (Supermarket & Liquor 🛒)
   - `supermarket` - супермаркеты
   - `liquor` - алкогольные магазины

6. **spa** (Spa & Salon 💆)
   - `spa` - спа и велнес
   - `salon` - салоны красоты (beauty_salon, hair_care)
   - `yoga` - йога студии
   
   **ПРИМЕЧАНИЕ:** Категория включает как настоящие SPA (21%), так и салоны красоты (53%)

7. **atm** (ATM & Exchange 🏧)
   - `atm` - банкоматы и обмен валют

8. **tuktuk** (Tuk-tuk 🛺)
   - `tuktuk` - тук-тук стоянки

9. **bus** (Bus Stops 🚌)
   - `bus` - автобусные остановки

10. **culture** (Culture & Temples 🕍)
    - `culture` - культурные объекты (музеи, галереи, зоопарки, аквариумы)
    - `temple` - храмы

### Дополнительно:
- **food** (Food & Restaurants 🍽️) - рестораны и кафе (уже есть в данных)

## 📍 Маппинг Google Places типов

Для корректной работы нужно маппить типы из Google Places API в наши категории:

### food
- restaurant
- cafe
- ❌ ~~bar~~ - УДАЛЕНО! Бары теперь в nightlife
- meal_takeaway
- meal_delivery
- food

### beach
- beach
- beach_access

### attraction
- tourist_attraction
- point_of_interest
- amusement_park

### pharmacy
- pharmacy
- drugstore

### hospital
- hospital
- doctor
- clinic
- health

### supermarket
- supermarket
- grocery_or_supermarket
- convenience_store

### spa
- spa
- beauty_salon
- hair_care (если есть spa услуги)

### nightlife
- night_club
- bar  ← ✅ ВАЖНО: bar теперь ВСЕГДА nightlife (не food!)

### atm
- atm
- bank
- money_exchange

### tuktuk
- tuktuk_stand
- taxi_stand (если tuk-tuk)

### bus
- bus_station
- transit_station
- bus_stop

### surf
- surf_school
- water_sports
- diving_center
- snorkeling

### culture  ← ✅ ВАЖНО: отдельная категория (НЕ attraction!)
- temple
- church
- mosque
- hindu_temple
- buddhist_temple
- place_of_worship
- museum
- art_gallery
- zoo
- aquarium
- historical_landmark

**КРИТИЧНО:** Эти типы НЕ должны маппиться в `attraction`!

### liquor
- liquor_store
- wine_shop

### gym
- gym
- fitness_center

### barber
- barber
- hair_care

### laundry
- laundry
- laundromat

### coworking
- coworking_space

### yoga
- yoga_studio

### ⚠️ beauty_salon (ОСОБЫЙ СЛУЧАЙ)
- beauty_salon → маппится в `spa` (НЕ блокировать в черном списке!)

**ВАЖНО:** `beauty_salon` НЕ должен быть в черном списке исключений.
Он должен маппиться в категорию `spa`.

## 🎯 Приоритеты парсинга

### Pass 1 (0-1km): Все категории кроме исключений
### Pass 2 (1-3km): Важные категории (food, pharmacy, hospital, supermarket, atm)
### Pass 3 (3-5km): Основные достопримечательности (attraction, beach, culture)

## 📝 Формат выходных данных

Каждый POI должен иметь поле `category` с одним из значений выше.

```json
{
  "id": "poi_00000001",
  "name": "Beach Bar",
  "category": "food",
  "coordinates": { "lat": 6.0, "lng": 80.2 },
  ...
}
```
