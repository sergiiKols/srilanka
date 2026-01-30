# 🎨 ADMIN MAP DESIGN & FUNCTIONALITY
## Финальный дизайн и функционал админской карты

**Дата сохранения:** 2026-01-30  
**Версия:** Final v1.0  
**Файл:** `src/components/admin/AdminMasterMap.tsx`

---

## 📐 СТРУКТУРА КНОПОК

### **Слева вверху (Left Buttons):**

#### 1. **Filters** 🎛️ - Фильтры недвижимости
- **Цвет:** Белая (`bg-white`)
- **Иконка:** Регуляторы (sliders icon)
- **Tooltip:** "Property Filters"
- **Функция:** Открывает drawer с фильтрами недвижимости
- **Размер:** `minWidth: 120px`

#### 2. **Objects** 🗺️ - Фильтры POI
- **Цвет:** Изумрудный градиент (`from-emerald-500 to-teal-600`)
- **Иконка:** 🗺️
- **Tooltip:** "POI & Objects Filters"
- **Функция:** Открывает drawer с категориями POI
- **Размер:** `px-4 md:px-6 py-2 md:py-3`

---

### **Справа вверху (Right Buttons) - вертикально:**

#### 1. **Import** 🤖 - AI импорт объектов
- **Цвет:** Фиолетовый градиент (`from-indigo-600 to-purple-600`)
- **Иконка:** 🤖
- **Tooltip:** "AI импорт объектов"
- **Функция:** Открывает PropertyImporterAI modal
- **Размер:** `minWidth: 120px`

#### 2. **Admin** ⚙️ - Админ панель
- **Цвет:** Серая (`bg-slate-700`)
- **Иконка:** ⚙️
- **Tooltip:** "Admin Panel"
- **Функция:** Открывает Admin Panel справа
- **Размер:** `minWidth: 120px`

#### 3. **GeoPickerButton** 📍 - Выбор геолокации
- **Рендерится через:** React Portal
- **Контейнер:** `#floating-buttons-container`
- **Функция:** Инструмент выбора точки на карте

#### 4. **Settings** ⚙️ - Ссылка на главную админку
- **Часть:** GeoPickerButton компонента
- **Функция:** Навигация

---

## 🎯 FILTERS DRAWER (Недвижимость)

### **Заголовок:**
- Название: "Filters"
- Подзаголовок: "Customize your map view"
- Кнопка: "Show N properties"

### **Секции фильтров:**

#### 1. **💰 Price Range** (Collapsible)
- All price
- $0 - $500
- $500 - $1000
- $1000 - $2000
- $2000+

#### 2. **🏠 Property Type** (Collapsible)
- All, House, Apartment, Villa, Room, Studio

#### 3. **🛏️ Bedrooms & Bathrooms**
- Bedrooms: Slider 1-10
- Bathrooms: Slider 1-5

#### 4. **🏖️ Beach Distance**
- Any distance
- 0-100m (Beachfront)
- 100-300m (Very close)
- 300-500m (Close)
- 500m-1km (Walking)
- 1km+ (Not important)

#### 5. **📶 WiFi Speed**
- Any speed
- Basic (up to 10 Mbps)
- Good (10-50 Mbps)
- Fast (50-100 Mbps)
- Ultra Fast (100+ Mbps)

#### 6. **✨ Must-Haves (Basic)** (Collapsible)
- Pool, Parking, Breakfast, Pets, Security

#### 7. **🎨 Additional Amenities** (Collapsible)
- ❄️ Air Conditioning
- 🍽️ Kitchen
- 🧺 Washing Machine
- 💼 Work-Friendly
- 🏋️ Gym
- 🧘 Yoga Space
- 🔥 BBQ
- 🌳 Garden

#### 8. **🔴 Show Deleted Objects**
- Checkbox для админов

---

## 🗺️ OBJECTS DRAWER (POI)

### **Заголовок:**
- Название: "🗺️ Objects & POI"
- Подзаголовок: "Places, shops, restaurants..."
- Цвет хедера: Изумрудный градиент (`from-emerald-500 to-teal-600`)
- Search bar: "Search places..."

### **Категории POI:**

1. **🍽️ Food & Dining**
2. **🏪 Shopping**
3. **🏥 Health**
4. **🚌 Transport**
5. **🎭 Entertainment**
6. **🏖️ Tourism**
7. **💆 Wellness**

### **Дополнительные опции:**
- 🕒 **Open now only** - показать только открытые

### **Кнопка Apply:**
- Текст: "Show N categories" или "Show All POI"
- Цвет: Изумрудный градиент

---

## ⚙️ ADMIN PANEL (Статистика и слои)

### **Заголовок:**
- Название: "🎛️ Admin Panel"
- Выезжает справа

### **Содержимое:**

#### **Статистика:**
- 📍 POI: N
- 🔴 Properties: N
- 👤 Users: N

#### **Layers:**
- Toggle: POI (Places of Interest)
- Toggle: Client Properties

#### **Heatmap:**
- Dropdown: None, Time-based, User-based, Price-based

#### **Filters:**
- Date filter: All time, Today, Last 7 days, Last 30 days

---

## 🎨 ДИЗАЙН-СИСТЕМА

### **Цвета:**

#### Кнопки:
- **Filters:** `bg-white text-slate-800 hover:bg-slate-50`
- **Objects:** `from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700`
- **Import:** `from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700`
- **Admin:** `bg-slate-700 hover:bg-slate-800`

#### Drawers:
- **Filters:** Белый фон, синий акцент (`text-indigo-600`)
- **Objects:** Изумрудный хедер, белый контент
- **Admin:** Белый фон, серый акцент

### **Shadows:**
- Кнопки: `shadow-lg`
- Drawers: `shadow-[8px_0_32px_-8px_rgba(0,0,0,0.3)]`

### **Transitions:**
- Drawers: `transition-transform duration-300 ease-in-out`
- Buttons: `transition-all active:scale-95`

### **Border Radius:**
- Кнопки: `rounded-xl`
- Inputs: `rounded-lg`

---

## 🔧 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### **State Management:**

```typescript
// Drawers
const [isFilterOpen, setIsFilterOpen] = useState(false);
const [isObjectsOpen, setIsObjectsOpen] = useState(false);
const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
const [isImporterOpen, setIsImporterOpen] = useState(false);

// Property Filters
const [priceRange, setPriceRange] = useState<string>('all');
const [minBedrooms, setMinBedrooms] = useState<number>(1);
const [minBathrooms, setMinBathrooms] = useState<number>(1);
const [beachDistance, setBeachDistance] = useState<string>('all');
const [wifiSpeed, setWifiSpeed] = useState<string>('all');
const [selectedPropType, setSelectedPropType] = useState<string>('all');
const [mustHaves, setMustHaves] = useState({...});
const [amenities, setAmenities] = useState({...});

// POI Filters
const [selectedPOICategories, setSelectedPOICategories] = useState<string[]>([]);
const [poiSearchQuery, setPoiSearchQuery] = useState('');
const [showOpenOnly, setShowOpenOnly] = useState(false);

// Collapsible sections
const [openSections, setOpenSections] = useState<Record<string, boolean>>({...});
```

### **Z-Index Hierarchy:**
- Floating buttons: `z-[1000]`
- Drawers: `z-[2000]`
- Modals: Higher

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints:**
- `px-4 md:px-8` - Padding адаптивный
- `text-sm md:text-lg` - Размер шрифта адаптивный
- `w-full md:w-96` - Drawer ширина: мобильный (full), десктоп (384px)

### **Mobile:**
- Кнопки stack вертикально
- Drawers full-width
- Текст меньше

### **Desktop:**
- Кнопки горизонтально
- Drawers 384px (md:w-96)
- Текст больше

---

## 🎯 UX PATTERNS

### **Collapsible Sections:**
- Иконка стрелки поворачивается при открытии
- `transform transition-transform ${open ? 'rotate-180' : ''}`
- Smooth animation

### **Button States:**
- Default: Shadow + градиент
- Hover: Darker градиент + shadow увеличивается
- Active: `active:scale-95` (pressed effect)
- Disabled: `opacity-50 cursor-not-allowed`

### **Drawer Behavior:**
- Slide in/out: `translate-x-0` / `-translate-x-full` / `translate-x-full`
- Backdrop: `pointerEvents: 'auto'`
- Close: X button в header

---

## 📊 СТАТИСТИКА ФИЛЬТРОВ

### **Property Filters (Filters button):**
- Базовые: 5 (Price, Type, Bedrooms, Bathrooms, Beach Distance, WiFi)
- Must-Haves: 5 (Pool, Parking, Breakfast, Pets, Security)
- Additional: 8 (AC, Kitchen, Washing Machine, Work-Friendly, Gym, Yoga, BBQ, Garden)
- **Всего: 18 фильтров**

### **POI Filters (Objects button):**
- Категорий: 7 (Food, Shopping, Health, Transport, Entertainment, Tourism, Wellness)
- Дополнительно: Search + Open now
- **Всего: 9 опций**

### **Admin Filters (Admin button):**
- Layers: 2 (POI, Client Properties)
- Heatmap: 4 режима
- Date: 4 опции
- **Всего: 10 опций**

---

## 🔄 WORKFLOW

### **Пользовательский flow:**

1. **Пользователь открывает админ карту**
2. **Видит карту с маркерами**
3. **Хочет отфильтровать недвижимость:**
   - Кликает **Filters**
   - Выбирает нужные параметры
   - Кликает "Show N properties"
   - Drawer закрывается, карта обновляется

4. **Хочет посмотреть POI:**
   - Кликает **Objects**
   - Выбирает категории (Food, Shopping, etc.)
   - Кликает "Show N categories"
   - Drawer закрывается, POI появляются

5. **Хочет импортировать объект:**
   - Кликает **Import**
   - Открывается PropertyImporterAI
   - Вводит данные
   - Объект добавляется на карту

6. **Хочет посмотреть статистику:**
   - Кликает **Admin**
   - Видит stats, layers, heatmap
   - Переключает режимы

---

## 🎨 ДИЗАЙН-ПРИНЦИПЫ

### **Lumina Design System:**
- Soft shadows: `shadow-[8px_0_32px_-8px_rgba(0,0,0,0.3)]`
- Gradient buttons: Smooth transitions
- Rounded corners: `rounded-xl` everywhere
- Spacious: `p-5`, `space-y-6`
- Icons + Text: Always paired

### **Color Palette:**
- **Primary:** Indigo/Purple (Import)
- **Secondary:** Emerald/Teal (Objects)
- **Neutral:** Slate (Admin, text)
- **Accent:** White (Filters)
- **Alert:** Red (Show deleted)

### **Typography:**
- Headings: `font-bold` or `font-semibold`
- Body: `text-sm` or `text-base`
- Labels: `text-xs text-slate-500`
- Uppercase: Only for section headers (`uppercase tracking-wide`)

---

## 🚀 FUTURE ENHANCEMENTS

### **Возможные улучшения:**

1. **Location Picker** - выбор района на карте с радиусом
2. **Saved Filters** - сохранённые наборы фильтров
3. **Filter Presets** - "Beachfront Villas", "Budget Apartments"
4. **Real-time Updates** - live обновление при добавлении объектов
5. **Export Filtered Data** - экспорт результатов в CSV/JSON
6. **Collapsible POI Sub-categories** - развернуть Food → Restaurants, Cafes, etc.
7. **Range Sliders** - для Guest Capacity, Floor Level
8. **View Type Filter** - Ocean view, Mountain view, etc.
9. **Availability Calendar** - выбор дат
10. **Multi-language** - переключение RU/EN

---

## 📝 NOTES

- Все фильтры работают в реальном времени (при закрытии drawer)
- POI данные сейчас отключены (таблица `pois` не существует)
- Фильтры пока не применяются к маркерам (TODO: добавить логику фильтрации)
- Show deleted objects работает через `showDeleted` state
- Admin Panel содержит функционал из старой боковой панели

---

## 🎯 КЛЮЧЕВЫЕ ФАЙЛЫ

- **Компонент:** `src/components/admin/AdminMasterMap.tsx`
- **Дизайн-документ:** `ADMIN_MAP_DESIGN_AND_FUNCTIONALITY.md` (этот файл)
- **Фильтры POI:** `tmp_rovodev_POI_FILTERS.md`
- **Фильтры недвижимости:** `tmp_rovodev_ALL_FILTERS_DESCRIPTION.md`

---

**Сохранено для будущих ссылок и восстановления дизайна** ✨
