# 🏗️ Архитектура базы данных - Анализ и рекомендации

## 📊 Анализ текущих данных в приложении

### **1. PROPERTIES (Объекты недвижимости)** 
**Количество:** ~6 объектов (демо данные)  
**Тип:** Пользовательские данные  
**Характер:** Динамические (создаются пользователями)

**Структура:**
```typescript
{
  id: string,
  position: [lat, lng],
  title: string,
  price: string,
  rawPrice: number,
  rooms: number,
  bathrooms: number,
  beachDistance: number,
  area: string,
  propertyType: string,
  pool: boolean,
  parking: boolean,
  breakfast: boolean,
  wifiSpeed: number,
  amenities: string[],
  images: string[]
}
```

**Вывод:** ✅ **ОБЯЗАТЕЛЬНО в Supabase**
- Данные уникальны для каждого пользователя
- Требуют авторизации и RLS
- Нужна синхронизация между устройствами

---

### **2. POIS (Points of Interest - точки интереса)**
**Количество:** ~75 объектов
**Категории:** 
- 🕍 Culture & Temples (10)
- 🏖️ Beaches (9)
- 🍽️ Restaurants (7)
- 🏄 Water Sports (2)
- 💆 Spa & Wellness (2)
- 💊 Pharmacies (2)
- 🛒 Supermarkets (2)
- 🏥 Hospitals (3)
- 🏧 ATM & Exchange (3)
- 🚌 Transport (5)

**Тип:** Справочные данные  
**Характер:** Статические (редко меняются)

**Структура:**
```typescript
{
  id: string,
  position: [lat, lng],
  title: string,
  type: 'culture' | 'beach' | 'food' | 'surf' | ...,
  hours?: string,
  phone?: string,
  description: string,
  image?: string,
  waves?: 'green' | 'yellow' | 'red',
  info?: string
}
```

**Вывод:** ⚖️ **ГИБРИДНЫЙ ПОДХОД** (объясню ниже)

---

### **3. MAIN_LAYERS & EXTRA_LAYERS (Слои карты)**
**Количество:** 18 категорий
**Тип:** Конфигурация UI  
**Характер:** Статические

**Структура:**
```typescript
{
  id: string,
  label: string,
  icon: string,
  status?: string
}
```

**Вывод:** 🌐 **СТАТИЧЕСКИЕ (в коде)**
- Меняются только при обновлении приложения
- Не требуют хранения в БД

---

## 🎯 **РЕКОМЕНДУЕМАЯ АРХИТЕКТУРА**

### **Вариант 1: Оптимальный (Рекомендуется)** ⭐

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 Table: user_properties                              │
│     ├─ id (UUID, PK)                                    │
│     ├─ user_id (UUID, FK → auth.users)                 │
│     ├─ title, type, area, rooms, etc.                   │
│     ├─ position (POINT)                                 │
│     ├─ created_at, updated_at                           │
│     └─ RLS: user_id = auth.uid()                        │
│                                                         │
│  📦 Table: shared_pois (ОПЦИОНАЛЬНО)                    │
│     ├─ id (UUID, PK)                                    │
│     ├─ admin_only = true (только админы редактируют)   │
│     ├─ title, type, position, hours, phone              │
│     ├─ category (culture, beach, food, etc.)            │
│     └─ RLS: SELECT для всех, INSERT/UPDATE для админов │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              STATIC FILES (в коде/CDN)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📄 src/data/pois.ts                                    │
│     └─ POIS массив с 75 объектами                      │
│                                                         │
│  📄 src/data/layers.ts                                  │
│     ├─ MAIN_LAYERS (12 категорий)                      │
│     └─ EXTRA_LAYERS (6 категорий)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 **Детальное сравнение подходов**

### **Для PROPERTIES (объекты недвижимости)**

| Критерий | localStorage | Supabase |
|----------|-------------|----------|
| **Авторизация** | ❌ Нет | ✅ Да |
| **Синхронизация** | ❌ Только локально | ✅ Между устройствами |
| **Безопасность** | ⚠️ Низкая | ✅ RLS + JWT |
| **Лимит** | ~5-10 MB | 500 MB (free) |
| **Backup** | ❌ Нет | ✅ Автоматически |
| **Расширяемость** | ⚠️ Ограничена | ✅ Неограничена |

**Решение:** ✅ **100% Supabase** - пользовательские данные ОБЯЗАТЕЛЬНО в БД

---

### **Для POIS (точки интереса)**

#### **Вариант A: Статические данные в коде** 📄

**Преимущества:**
- ✅ Мгновенная загрузка (нет запросов к БД)
- ✅ Работает оффлайн
- ✅ Нет расхода квоты Supabase
- ✅ Легко версионировать (Git)
- ✅ CDN кеширование

**Недостатки:**
- ❌ Обновление требует деплоя
- ❌ Нельзя редактировать админу через UI

**Когда использовать:**
- POIs редко меняются (раз в месяц/квартал)
- Нет админ-панели для редактирования
- Важна скорость загрузки

---

#### **Вариант B: Динамические данные в Supabase** 🗄️

**Преимущества:**
- ✅ Админы могут редактировать через UI
- ✅ Обновления в реальном времени
- ✅ Можно добавлять пользовательские POIs
- ✅ История изменений

**Недостатки:**
- ⚠️ Дополнительный запрос при загрузке
- ⚠️ Расход квоты Supabase
- ⚠️ Зависит от интернета

**Когда использовать:**
- POIs часто обновляются
- Есть админ-панель
- Пользователи могут добавлять свои POIs

---

#### **Вариант C: Гибридный подход** ⚡ **РЕКОМЕНДУЕТСЯ**

**Стратегия:**
1. **Базовые POIs** - статические в коде (75 объектов)
2. **Пользовательские POIs** - в Supabase
3. **Админские обновления** - в Supabase (опционально)

**Архитектура:**
```typescript
// Статические POIs (всегда доступны)
import { BASE_POIS } from '@/data/pois';

// Пользовательские POIs из Supabase
const { data: userPOIs } = await supabase
  .from('user_pois')
  .select('*')
  .eq('user_id', userId);

// Объединяем
const allPOIs = [...BASE_POIS, ...userPOIs];
```

**Преимущества:**
- ✅ Мгновенная загрузка базовых данных
- ✅ Пользователи могут добавлять свои места
- ✅ Работает оффлайн (базовые POIs)
- ✅ Расширяемость

---

## 💾 **Оптимальная структура таблиц Supabase**

### **Таблица 1: `user_properties`** (Обязательно)
```sql
CREATE TABLE user_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Основные данные
    title TEXT NOT NULL,
    property_type TEXT NOT NULL,
    area TEXT NOT NULL,
    position POINT NOT NULL,
    google_maps_url TEXT,
    
    -- Характеристики
    rooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    beach_distance INTEGER,
    wifi_speed INTEGER DEFAULT 50,
    
    -- Удобства
    amenities TEXT[],
    features JSONB DEFAULT '{}',
    
    -- Медиа
    images TEXT[],
    clean_description TEXT,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS политики
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own properties"
    ON user_properties FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users create own properties"
    ON user_properties FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

### **Таблица 2: `user_pois`** (Опционально)
```sql
CREATE TABLE user_pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Основные данные
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'culture', 'beach', 'food', etc.
    position POINT NOT NULL,
    
    -- Детали
    description TEXT,
    hours TEXT,
    phone TEXT,
    website TEXT,
    image_url TEXT,
    
    -- Метаданные
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS политики
ALTER TABLE user_pois ENABLE ROW LEVEL SECURITY;

-- Пользователи видят свои + верифицированные
CREATE POLICY "Users see own and verified POIs"
    ON user_pois FOR SELECT
    USING (user_id = auth.uid() OR is_verified = true);
```

---

### **Таблица 3: `admin_pois`** (Опционально - для админов)
```sql
CREATE TABLE admin_pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Основные данные
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    position POINT NOT NULL,
    
    -- Детали
    description TEXT,
    hours TEXT,
    phone TEXT,
    website TEXT,
    image_url TEXT,
    
    -- Приоритет (для сортировки)
    priority INTEGER DEFAULT 0,
    
    -- Метаданные
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Все читают, админы редактируют
ALTER TABLE admin_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read admin POIs"
    ON admin_pois FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage POIs"
    ON admin_pois FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
```

---

## 📦 **Размер данных и квоты**

### **Текущие данные:**
- **PROPERTIES:** 6 объектов × 2 KB = ~12 KB
- **POIS:** 75 объектов × 0.5 KB = ~37 KB
- **Итого статики:** ~50 KB

### **При росте (1000 пользователей):**
- **User Properties:** 1000 user × 20 properties × 2 KB = ~40 MB
- **User POIs:** 1000 users × 5 POIs × 0.5 KB = ~2.5 MB
- **Итого:** ~42.5 MB

### **Квота Supabase Free:**
- **Database:** 500 MB ✅ (достаточно)
- **Storage:** 1 GB ✅ (для изображений)
- **Bandwidth:** 2 GB/month ✅

---

## 🎯 **ИТОГОВАЯ РЕКОМЕНДАЦИЯ**

### **Что хранить в Supabase:**
1. ✅ **`user_properties`** - ОБЯЗАТЕЛЬНО
   - Объекты недвижимости пользователей
   - С RLS и авторизацией

2. ⚖️ **`user_pois`** - ОПЦИОНАЛЬНО
   - Если хотите дать пользователям добавлять свои места
   - Личные заметки о местах

3. ⚖️ **`admin_pois`** - ОПЦИОНАЛЬНО
   - Если нужна админ-панель для редактирования
   - Для часто обновляемых данных

### **Что оставить статическим:**
1. ✅ **POIS (базовые 75 объектов)**
   - Создать файл `src/data/pois.ts`
   - Быстрая загрузка, работает оффлайн

2. ✅ **MAIN_LAYERS & EXTRA_LAYERS**
   - Оставить в `Explorer.tsx`
   - Конфигурация UI

3. ✅ **Изображения локаций**
   - Использовать Unsplash CDN (как сейчас)
   - Или Supabase Storage для пользовательских фото

---

## 🚀 **План миграции**

### **Фаза 1: Минимум (уже готово)**
- ✅ Supabase клиент настроен
- ✅ Таблица `user_properties` готова
- ✅ RLS настроен
- ⏳ Нужно: Интегрировать с UI

### **Фаза 2: Оптимизация** 
- 📄 Вынести POIS в отдельный файл `src/data/pois.ts`
- 🗄️ Создать таблицу `user_pois` (опционально)
- 🔄 Добавить синхронизацию

### **Фаза 3: Расширение** (будущее)
- 👨‍💼 Админ-панель для управления POIs
- 🌐 Публичные POIs от пользователей
- 📊 Аналитика и статистика

---

**Хотите, чтобы я создал оптимизированную SQL схему с этими таблицами?** 🚀
