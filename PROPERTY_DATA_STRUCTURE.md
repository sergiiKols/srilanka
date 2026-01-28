# 🏠 СТРУКТУРА ДАННЫХ PROPERTY

**Дата:** 2026-01-25  
**Таблица БД:** `user_properties`  
**Проект:** H-Ome Finder (Sri Lanka)

---

## 📊 ПОЛНАЯ СТРУКТУРА

### 1. **DATABASE SCHEMA (PostgreSQL)**

```sql
CREATE TABLE public.user_properties (
    -- Идентификаторы
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Основная информация
    title TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('villa', 'apartment', 'house', 'room', 'hostel', 'hotel')),
    area TEXT NOT NULL,
    
    -- Характеристики
    rooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2),
    beach_distance INTEGER NOT NULL,
    wifi_speed INTEGER NOT NULL DEFAULT 50,
    
    -- Удобства (массив текста)
    amenities TEXT[] DEFAULT '{}',
    
    -- Особенности (JSONB для гибкости)
    features JSONB NOT NULL DEFAULT '{
        "pool": false,
        "parking": false,
        "breakfast": false,
        "airConditioning": false,
        "kitchen": false,
        "petFriendly": false,
        "security": "none",
        "beachfront": false,
        "garden": false
    }'::jsonb,
    
    -- Описание и медиа
    clean_description TEXT,
    images TEXT[] DEFAULT '{}',
    
    -- Геолокация
    position POINT NOT NULL,  -- PostGIS point (lng, lat)
    google_maps_url TEXT NOT NULL,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. **TYPESCRIPT TYPES**

#### **src/lib/supabase.ts** (Database Type)

```typescript
export interface PropertyData {
  id: string;
  user_id: string;
  
  // Основная информация
  title: string;
  property_type: 'villa' | 'apartment' | 'house' | 'room' | 'hostel' | 'hotel';
  area: string;
  
  // Характеристики
  rooms: number;
  bathrooms: number;
  price: number | null;
  beach_distance: number;
  wifi_speed: number;
  
  // Удобства
  amenities: string[];
  
  // Особенности (JSONB)
  features: {
    pool: boolean;
    parking: boolean;
    breakfast: boolean;
    airConditioning: boolean;
    kitchen: boolean;
    petFriendly: boolean;
    security: 'none' | 'standard' | 'high' | 'gated';
    beachfront: boolean;
    garden: boolean;
  };
  
  // Описание и медиа
  clean_description: string;
  images: string[];
  
  // Геолокация
  position: [number, number]; // [lat, lng]
  google_maps_url: string;
  
  // Метаданные
  created_at: string;
  updated_at: string;
}
```

#### **src/types/ai.types.ts** (Frontend Type)

```typescript
export type PropertyType = 'villa' | 'apartment' | 'house' | 'room' | 'hostel' | 'hotel';
export type SecurityLevel = 'none' | 'standard' | 'high' | 'gated';
export type AreaName = 'Unawatuna' | 'Hikkaduwa' | 'Mirissa' | 'Weligama';

export interface PropertyFeatures {
  pool: boolean;
  parking: boolean;
  breakfast: boolean;
  airConditioning: boolean;
  kitchen: boolean;
  petFriendly: boolean;
  security: SecurityLevel;
  beachfront: boolean;
  garden: boolean;
}

export interface PropertyData {
  id: string;
  position: [number, number];
  title: string;
  price: string;
  rawPrice: number;
  rooms: number;
  bathrooms: number;
  beachDistance: number;
  area: AreaName;
  propertyType: PropertyType;
  wifiSpeed: number;
  pool: boolean;
  parking: boolean;
  breakfast: boolean;
  petFriendly: boolean;
  security: SecurityLevel;
  type: 'stay';
  description: string;
  amenities: string[];
  images: string[];
}
```

---

## 📋 ПОЛЯ ПОДРОБНО

### **Идентификаторы**

| Поле | Тип | Описание | Обязательное | Значение по умолчанию |
|------|-----|----------|--------------|----------------------|
| `id` | UUID | Уникальный идентификатор | ✅ | `gen_random_uuid()` |
| `user_id` | UUID | ID владельца (из auth.users) | ✅ | - |

### **Основная информация**

| Поле | Тип | Описание | Обязательное | Ограничения |
|------|-----|----------|--------------|-------------|
| `title` | TEXT | Название объекта | ✅ | - |
| `property_type` | TEXT | Тип недвижимости | ✅ | villa, apartment, house, room, hostel, hotel |
| `area` | TEXT | Район/локация | ✅ | Unawatuna, Hikkaduwa, Mirissa, Weligama |

### **Характеристики**

| Поле | Тип | Описание | Обязательное | Значение по умолчанию |
|------|-----|----------|--------------|----------------------|
| `rooms` | INTEGER | Количество комнат | ✅ | 1 |
| `bathrooms` | INTEGER | Количество ванных | ✅ | 1 |
| `price` | DECIMAL(10,2) | Цена за месяц (USD) | ❌ | NULL |
| `beach_distance` | INTEGER | Расстояние до пляжа (м) | ✅ | - |
| `wifi_speed` | INTEGER | Скорость Wi-Fi (Mbps) | ✅ | 50 |

### **Удобства (Amenities)**

| Поле | Тип | Описание | Формат | Пример |
|------|-----|----------|--------|--------|
| `amenities` | TEXT[] | Массив удобств | Массив строк | `['WiFi', 'Кондиционер', 'Кухня']` |

**Типичные значения:**
- WiFi
- Air Conditioning
- Kitchen
- Washing Machine
- TV
- Iron
- Hair Dryer
- Beach Access
- Ocean View
- Mountain View
- Balcony
- Terrace

### **Особенности (Features) - JSONB**

| Поле | Тип | Описание | Значение по умолчанию |
|------|-----|----------|-----------------------|
| `features.pool` | BOOLEAN | Бассейн | false |
| `features.parking` | BOOLEAN | Парковка | false |
| `features.breakfast` | BOOLEAN | Завтрак включен | false |
| `features.airConditioning` | BOOLEAN | Кондиционер | false |
| `features.kitchen` | BOOLEAN | Кухня | false |
| `features.petFriendly` | BOOLEAN | Можно с питомцами | false |
| `features.security` | TEXT | Уровень безопасности | 'none' |
| `features.beachfront` | BOOLEAN | На первой линии | false |
| `features.garden` | BOOLEAN | Сад | false |

**Security Levels:**
- `none` - Без охраны
- `standard` - Стандартная безопасность (замки)
- `high` - Высокая безопасность (камеры, сигнализация)
- `gated` - Закрытая территория (охраняемый комплекс)

### **Описание и медиа**

| Поле | Тип | Описание | Формат |
|------|-----|----------|--------|
| `clean_description` | TEXT | Описание объекта | Чистый текст без HTML |
| `images` | TEXT[] | Массив URL фотографий | `['https://...jpg', ...]` |

### **Геолокация**

| Поле | Тип | Описание | Формат | Пример |
|------|-----|----------|--------|--------|
| `position` | POINT | Координаты (PostGIS) | POINT(lng lat) | POINT(80.2505 6.0171) |
| `google_maps_url` | TEXT | Ссылка на Google Maps | URL | `https://maps.google.com/?q=6.0171,80.2505` |

**TypeScript представление:**
```typescript
position: [6.0171, 80.2505] // [lat, lng]
```

### **Метаданные**

| Поле | Тип | Описание | Автоматически |
|------|-----|----------|---------------|
| `created_at` | TIMESTAMPTZ | Дата создания | ✅ NOW() |
| `updated_at` | TIMESTAMPTZ | Дата обновления | ✅ Trigger |

---

## 🔍 ИНДЕКСЫ

```sql
CREATE INDEX idx_properties_user_id ON user_properties(user_id);
CREATE INDEX idx_properties_area ON user_properties(area);
CREATE INDEX idx_properties_property_type ON user_properties(property_type);
CREATE INDEX idx_properties_price ON user_properties(price);
CREATE INDEX idx_properties_created_at ON user_properties(created_at DESC);
CREATE INDEX idx_properties_position ON user_properties USING GIST(position);
```

**Для чего:**
- `user_id` - быстрый поиск объектов пользователя
- `area` - фильтрация по району
- `property_type` - фильтрация по типу
- `price` - сортировка по цене
- `created_at` - сортировка по дате (новые первыми)
- `position` (GIST) - геопространственный поиск (в радиусе)

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Политики:

```sql
-- 1. Пользователь видит только свои объекты
CREATE POLICY "Users can view own properties"
    ON user_properties FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Пользователь может создавать объекты
CREATE POLICY "Users can create own properties"
    ON user_properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Пользователь может обновлять только свои объекты
CREATE POLICY "Users can update own properties"
    ON user_properties FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Пользователь может удалять только свои объекты
CREATE POLICY "Users can delete own properties"
    ON user_properties FOR DELETE
    USING (auth.uid() = user_id);
```

**Безопасность:**
- ✅ Каждый пользователь видит только свои объекты
- ✅ Нельзя изменить чужой объект
- ✅ Нельзя удалить чужой объект
- ✅ При удалении пользователя → каскадное удаление его объектов

---

## 🔄 TRIGGERS

### Auto-update `updated_at`:

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON user_properties
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
```

**Работает автоматически при любом UPDATE.**

---

## 📦 STORAGE (Property Images)

### Bucket: `property-images`

**Структура папок:**
```
property-images/
└── {user_id}/
    └── {property_id}/
        ├── photo1.jpg
        ├── photo2.jpg
        └── photo3.jpg
```

**Политики:**
- ✅ Public read access (любой может просматривать)
- ✅ Authenticated users can upload (только авторизованные загружают)
- ✅ Users can update/delete own images (только свои фото)

**URL формат:**
```
https://{project}.supabase.co/storage/v1/object/public/property-images/{user_id}/{property_id}/photo1.jpg
```

---

## 🛠️ ФУНКЦИИ

### 1. **Поиск в радиусе**

```sql
user_properties_within_radius(
    center_lat FLOAT,
    center_lng FLOAT,
    radius_km FLOAT
)
```

**Использование:**
```sql
SELECT * FROM user_properties_within_radius(6.0171, 80.2505, 5.0);
-- Найдет все объекты в радиусе 5 км от точки
```

### 2. **Подсчёт объектов**

```sql
count_user_properties() RETURNS INTEGER
```

**Использование:**
```sql
SELECT count_user_properties();
-- Вернёт количество объектов текущего пользователя
```

---

## 📱 REAL-TIME SUBSCRIPTIONS

### Подписка на изменения:

```typescript
import { subscribeToProperties } from './lib/supabase';

const subscription = subscribeToProperties((payload) => {
  console.log('Change received!', payload);
  
  if (payload.eventType === 'INSERT') {
    console.log('New property:', payload.new);
  }
  
  if (payload.eventType === 'UPDATE') {
    console.log('Updated property:', payload.new);
  }
  
  if (payload.eventType === 'DELETE') {
    console.log('Deleted property:', payload.old);
  }
});

// Отписаться
subscription.unsubscribe();
```

---

## 💾 CRUD ОПЕРАЦИИ

### **CREATE**

```typescript
import { properties } from './lib/supabase';

const newProperty = await properties.createProperty({
  title: 'Cozy Beach Villa',
  property_type: 'villa',
  area: 'Unawatuna',
  rooms: 3,
  bathrooms: 2,
  price: 1200,
  beach_distance: 50,
  wifi_speed: 100,
  amenities: ['WiFi', 'Air Conditioning', 'Kitchen'],
  features: {
    pool: true,
    parking: true,
    breakfast: false,
    airConditioning: true,
    kitchen: true,
    petFriendly: false,
    security: 'standard',
    beachfront: true,
    garden: true
  },
  clean_description: 'Beautiful villa with ocean view',
  images: ['https://...jpg', 'https://...jpg'],
  position: [6.0171, 80.2505],
  google_maps_url: 'https://maps.google.com/?q=6.0171,80.2505'
});
```

### **READ**

```typescript
// Все объекты пользователя
const { data, error } = await properties.getUserProperties();

// Один объект по ID
const { data, error } = await properties.getPropertyById('uuid');
```

### **UPDATE**

```typescript
const { data, error } = await properties.updateProperty('uuid', {
  price: 1500,
  wifi_speed: 150
});
```

### **DELETE**

```typescript
const { error } = await properties.deleteProperty('uuid');
```

---

## 🎨 ПРИМЕРЫ ДАННЫХ

### Пример 1: Вилла на пляже

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Luxury Beach Villa Unawatuna",
  "property_type": "villa",
  "area": "Unawatuna",
  "rooms": 4,
  "bathrooms": 3,
  "price": 2500,
  "beach_distance": 20,
  "wifi_speed": 150,
  "amenities": [
    "WiFi",
    "Air Conditioning",
    "Kitchen",
    "Ocean View",
    "Beach Access",
    "Balcony"
  ],
  "features": {
    "pool": true,
    "parking": true,
    "breakfast": true,
    "airConditioning": true,
    "kitchen": true,
    "petFriendly": false,
    "security": "gated",
    "beachfront": true,
    "garden": true
  },
  "clean_description": "Stunning 4-bedroom villa directly on Unawatuna beach. Private pool, modern kitchen, and breathtaking ocean views from every room.",
  "images": [
    "https://example.com/villa1.jpg",
    "https://example.com/villa2.jpg",
    "https://example.com/villa3.jpg"
  ],
  "position": [6.0171, 80.2505],
  "google_maps_url": "https://maps.google.com/?q=6.0171,80.2505",
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-20T14:45:00Z"
}
```

### Пример 2: Комната в гестхаусе

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Cozy Room in Hikkaduwa Guesthouse",
  "property_type": "room",
  "area": "Hikkaduwa",
  "rooms": 1,
  "bathrooms": 1,
  "price": 350,
  "beach_distance": 150,
  "wifi_speed": 50,
  "amenities": [
    "WiFi",
    "Fan",
    "Shared Kitchen"
  ],
  "features": {
    "pool": false,
    "parking": false,
    "breakfast": true,
    "airConditioning": false,
    "kitchen": false,
    "petFriendly": true,
    "security": "standard",
    "beachfront": false,
    "garden": true
  },
  "clean_description": "Budget-friendly room in a friendly guesthouse. Walking distance to the beach. Breakfast included.",
  "images": [
    "https://example.com/room1.jpg",
    "https://example.com/room2.jpg"
  ],
  "position": [6.1391, 80.0997],
  "google_maps_url": "https://maps.google.com/?q=6.1391,80.0997",
  "created_at": "2026-01-18T09:15:00Z",
  "updated_at": "2026-01-18T09:15:00Z"
}
```

---

## 🔑 КЛЮЧЕВЫЕ ОСОБЕННОСТИ

### ✅ Преимущества текущей структуры:

1. **JSONB для features** - гибкость, можно добавлять новые поля без миграций
2. **TEXT[] для amenities** - простой массив, легко искать (`ANY(amenities)`)
3. **PostGIS POINT** - эффективный геопространственный поиск
4. **RLS включен** - безопасность из коробки
5. **Индексы оптимизированы** - быстрые запросы
6. **Real-time** - подписки на изменения
7. **Триггеры** - автоматическое обновление `updated_at`
8. **Storage интеграция** - удобное хранение фото

### ⚠️ Потенциальные улучшения:

1. **Добавить full-text search** для `title` и `clean_description`
2. **Добавить рейтинг** (rating, reviews_count)
3. **Добавить статус** (active, draft, archived)
4. **Добавить contact_info** (phone, email, whatsapp)
5. **Добавить availability** (available_from, available_to)
6. **Нормализовать amenities** в отдельную таблицу (many-to-many)

---

## 📚 СВЯЗАННЫЕ ФАЙЛЫ

- **Schema:** `supabase_schema.sql`
- **Types:** `src/types/ai.types.ts`, `src/lib/supabase.ts`
- **Components:** `src/components/property/PropertyDrawer.tsx`
- **Importer:** `src/components/PropertyImporter.tsx`
- **AI Importer:** `src/components/PropertyImporterAI.tsx`

---

## 🎯 USE CASES

### 1. Создание объекта через AI

```typescript
// Пользователь вставляет описание
const description = "Beautiful 3BR villa in Unawatuna...";

// AI анализирует
const aiResult = await analyzeProperty(description);

// Создается объект
await properties.createProperty({
  title: aiResult.title,
  property_type: aiResult.propertyType,
  rooms: aiResult.rooms,
  // ... остальные поля
});
```

### 2. Поиск объектов рядом с пляжем

```sql
SELECT * FROM user_properties
WHERE beach_distance < 100
ORDER BY beach_distance ASC;
```

### 3. Фильтр по features

```sql
SELECT * FROM user_properties
WHERE features->>'pool' = 'true'
  AND features->>'beachfront' = 'true'
  AND price BETWEEN 1000 AND 2000;
```

### 4. Поиск в радиусе

```sql
SELECT * FROM user_properties_within_radius(6.0171, 80.2505, 5.0)
ORDER BY beach_distance;
```

---

**Автор:** Rovo Dev  
**Дата:** 2026-01-25  
**Версия:** 1.0.0  
**Статус:** ✅ АКТУАЛЬНО
