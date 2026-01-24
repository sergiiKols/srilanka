# 🎛️ Админ-панель H-Ome Finder - Структура и План

## 📊 Обзор

Админ-панель для управления системой, мониторинга состояния, настройки API и работы с данными.

---

## 🗂️ Структура страниц

### 1. **Dashboard (Главная страница админки)** 
**URL:** `/admin` или `/admin/dashboard`

#### Виджеты:
- 📈 **Статистика в реальном времени**
  - Общее количество POI в базе
  - Количество валидированных POI
  - Количество properties (жилье)
  - Количество зарегистрированных пользователей
  - Активные пользователи (последние 24 часа)

- 🔄 **Последние активности**
  - Последние 10 созданных POI
  - Последние валидации
  - Последние импорты через AI
  - Недавние ошибки API

- 🚦 **Статус системы**
  - ✅ Supabase: Connected/Disconnected
  - ✅ Google Maps API: Active (quota: 1234/5000)
  - ✅ Groq API: Active (tokens used today: 45K/100K)
  - ✅ Perplexity API: Active (requests: 12/50)
  - ✅ Parsing система: Idle/Running

- 📍 **География**
  - Карта с тепловой картой POI
  - Топ-5 регионов по количеству POI
  - Покрытие регионов (%)

---

### 2. **API Management** 
**URL:** `/admin/api-settings`

#### Разделы:

##### 2.1 API Keys Configuration
```typescript
interface APIConfig {
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'error';
  lastChecked: Date;
  quota?: {
    used: number;
    limit: number;
  };
}
```

**Поля для каждого API:**
- 🔑 Google Maps API
  - API Key (masked: `AIza...Xy9z`)
  - ✏️ Edit / 👁️ Show / 🔄 Test Connection
  - Quota: 1234/5000 requests today
  - Last check: 2 минуты назад
  
- 🔑 Groq API (AI парсинг)
  - API Key
  - Model: `llama-3.3-70b-versatile`
  - Tokens used: 45K/100K daily
  - Test parsing ▶️
  
- 🔑 Perplexity API (разворот ссылок)
  - API Key
  - Requests: 12/50 today
  - Test URL expansion ▶️

- 🔑 Supabase
  - URL
  - Anon Key
  - Service Role Key (для админских операций)
  - Connection status

##### 2.2 API Usage Analytics
- График использования по дням
- Топ-5 самых используемых эндпоинтов
- Ошибки API (grouped by type)

##### 2.3 Rate Limiting
- Настройка лимитов запросов
- Whitelist IP для разработчиков

---

### 3. **POI Management** 
**URL:** `/admin/pois`

#### Функции:

##### 3.1 POI Browser
- 📋 Таблица всех POI с фильтрами:
  - По категориям (Beach, Restaurant, Accommodation, etc.)
  - По статусу валидации (validated/unvalidated)
  - По региону
  - По дате создания
  - По рейтингу

- 🔍 Поиск по названию, адресу, координатам

- ⚡ Bulk Actions:
  - Массовая валидация
  - Массовое удаление
  - Экспорт в JSON/CSV
  - Bulk re-categorization

##### 3.2 POI Editor
- Редактирование отдельного POI
- Preview на карте
- Загрузка/замена фотографий
- Редактирование opening_hours
- Изменение категории
- История изменений (audit log)

##### 3.3 Duplicate Detection
- Автопоиск дубликатов (по координатам + названию)
- Merge дубликатов (выбор какие данные оставить)

##### 3.4 Quality Control
- POI без фотографий
- POI без описания
- POI с неполными данными
- POI с некорректными координатами

---

### 4. **Parsing System** 
**URL:** `/admin/parsing`

#### Разделы:

##### 4.1 Parsing Status
```
Current Status: ⏸️ Idle
Last Run: 2026-01-24 15:30:00
Duration: 45 minutes
POIs Processed: 127/150
Success Rate: 98.3%
```

##### 4.2 Parsing Controls
- ▶️ Start New Parsing Session
  - Выбор pass (1, 2, 3)
  - Выбор региона (Negombo-Tangalle, Colombo, etc.)
  - Выбор категорий для парсинга
  - Batch size configuration
  
- ⏸️ Pause Current Parsing
- ⏹️ Stop Parsing
- 🔄 Resume from Checkpoint

##### 4.3 Parsing Configuration
```javascript
{
  "batchSize": 5,
  "delayBetweenBatches": 2000,
  "maxRetries": 3,
  "checkpointFrequency": 5,
  "enableEnhancement": true,
  "autoValidate": false
}
```

##### 4.4 Parsing Logs (Live)
```
[15:30:15] Starting batch 1/30...
[15:30:18] ✅ Parsed: Wijaya Beach Restaurant (Beach/Restaurant)
[15:30:21] ✅ Parsed: Unawatuna Beach Hotel (Accommodation)
[15:30:23] ⚠️  Warning: No opening hours for "Sunset Bar"
[15:30:25] Checkpoint 1 saved (5/150 POIs)
```

##### 4.5 Parsing Reports
- Success/Failure rate по категориям
- Среднее время обработки POI
- Token usage per batch
- Error analysis (что чаще всего падает)

---

### 5. **Text Tools** 
**URL:** `/admin/tools`

#### Инструменты:

##### 5.1 URL Expander
```
[Input Box]
Короткая ссылка: https://goo.gl/abc123

[Button: 🔗 Развернуть ссылку]

[Output Box]
Развернутая ссылка: https://www.booking.com/hotel/sri-lanka/...
Provider: Perplexity API
Time: 1.2s
```

##### 5.2 Bulk URL Processor
- Загрузка CSV/TXT с короткими ссылками
- Массовая обработка
- Экспорт результатов
- Progress bar

##### 5.3 Text Analyzer
- Анализ описаний POI (readability, length, keywords)
- Проверка на плохие слова
- Автоматическое улучшение описаний через AI

##### 5.4 Geocoding Tool
- Адрес → Координаты
- Координаты → Адрес
- Batch geocoding

##### 5.5 Photo URL Validator
- Проверка доступности фото по URL
- Массовая проверка всех фото в базе
- Автозамена битых ссылок

---

### 6. **User Management** 
**URL:** `/admin/users`

#### Функции:

##### 6.1 User List
- Таблица всех пользователей
- Роли: admin, editor, user
- Последняя активность
- Количество созданных POI

##### 6.2 User Actions
- Изменение роли
- Блокировка/разблокировка
- Просмотр activity log пользователя

##### 6.3 Roles & Permissions
```typescript
interface Role {
  name: 'admin' | 'editor' | 'user';
  permissions: {
    canCreatePOI: boolean;
    canEditPOI: boolean;
    canDeletePOI: boolean;
    canValidatePOI: boolean;
    canAccessAdmin: boolean;
    canManageAPI: boolean;
    canManageUsers: boolean;
  }
}
```

---

### 7. **Database Tools** 
**URL:** `/admin/database`

#### Инструменты:

##### 7.1 Database Stats
- Размер базы данных
- Количество записей в каждой таблице
- Top 10 самых больших таблиц
- Index usage statistics

##### 7.2 Backup & Restore
- 📥 Download Database Backup (JSON/SQL)
- 📤 Restore from Backup
- Scheduled backups (cron)

##### 7.3 SQL Runner (Danger Zone!)
- Execute custom SQL queries
- ⚠️ Only for admins with sudo permissions

##### 7.4 Data Migration
- Import POIs from JSON
- Import from Google Maps JSON
- Import from CSV
- Data validation before import

---

### 8. **Analytics & Reports** 
**URL:** `/admin/analytics`

#### Отчеты:

##### 8.1 POI Analytics
- Рост количества POI по времени (график)
- Распределение по категориям (pie chart)
- Топ-10 самых популярных POI (по рейтингу)
- Coverage map (где больше всего POI)

##### 8.2 User Analytics
- Daily/Weekly/Monthly active users
- User engagement (создание POI, валидация)
- Географическое распределение пользователей

##### 8.3 API Analytics
- API calls per day (график)
- Cost tracking (если API платные)
- Error rate by endpoint

##### 8.4 Parsing Analytics
- Parsing sessions history
- Average success rate
- Token consumption over time
- Cost per POI

---

### 9. **System Settings** 
**URL:** `/admin/settings`

#### Настройки:

##### 9.1 General Settings
- Site Title
- Default Language
- Timezone
- Contact Email

##### 9.2 Map Settings
- Default map center (lat, lng)
- Default zoom level
- Map provider (OpenStreetMap, Mapbox, etc.)
- Clustering settings

##### 9.3 Parsing Settings
- Default parsing rules
- Category mappings
- Opening hours formats
- Photo selection rules

##### 9.4 Validation Settings
- Auto-validation rules
- Validation thresholds
- Required fields for validation

##### 9.5 Email/Notifications
- SMTP settings
- Email templates
- Notification preferences

---

## 🎨 UI/UX Дизайн

### Технологии:
- **Framework:** React (уже используется в проекте)
- **Styling:** TailwindCSS (уже настроен)
- **Charts:** Chart.js или Recharts
- **Tables:** TanStack Table (React Table v8)
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand или Jotai (легковесные)

### Компоненты:
```
src/components/admin/
├── Dashboard/
│   ├── StatsCard.tsx
│   ├── ActivityFeed.tsx
│   ├── StatusIndicator.tsx
│   └── RegionMap.tsx
├── API/
│   ├── APIKeyForm.tsx
│   ├── APITester.tsx
│   └── UsageChart.tsx
├── POI/
│   ├── POITable.tsx
│   ├── POIEditor.tsx
│   ├── POIFilters.tsx
│   └── DuplicateDetector.tsx
├── Parsing/
│   ├── ParsingControls.tsx
│   ├── ParsingLogs.tsx
│   ├── ParsingConfig.tsx
│   └── CheckpointManager.tsx
├── Tools/
│   ├── URLExpander.tsx
│   ├── BulkProcessor.tsx
│   ├── GeocodingTool.tsx
│   └── PhotoValidator.tsx
├── Users/
│   ├── UserTable.tsx
│   ├── RoleManager.tsx
│   └── PermissionsEditor.tsx
├── Layout/
│   ├── AdminLayout.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   └── AdminBreadcrumbs.tsx
└── Shared/
    ├── DataTable.tsx
    ├── Chart.tsx
    ├── LoadingSpinner.tsx
    └── ConfirmDialog.tsx
```

---

## 🚀 Фазы реализации

### **Фаза 1: MVP (1-2 недели)** ✅ Приоритет
1. ✅ Admin Layout (sidebar + header)
2. ✅ Dashboard с базовой статистикой
3. ✅ API Settings (просмотр/редактирование ключей)
4. ✅ POI Browser (таблица с фильтрами)
5. ✅ URL Expander Tool
6. ✅ Authentication (проверка admin роли)

### **Фаза 2: Расширенный функционал (2-3 недели)**
1. ⏳ Parsing System UI
2. ⏳ POI Editor
3. ⏳ User Management
4. ⏳ Analytics Dashboard
5. ⏳ Backup/Restore

### **Фаза 3: Полировка (1 неделя)**
1. ⏳ Advanced filtering
2. ⏳ Bulk operations
3. ⏳ Live logs
4. ⏳ Email notifications
5. ⏳ Performance optimization

---

## 🔐 Безопасность

### Middleware для админки:
```typescript
// src/middleware/adminAuth.ts
export async function requireAdmin(request: Request) {
  const session = await getSession(request);
  
  if (!session) {
    return Response.redirect('/login');
  }
  
  const { data: user } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  
  if (user?.role !== 'admin') {
    return Response.redirect('/?error=unauthorized');
  }
  
  return null; // Allow access
}
```

### RLS (Row Level Security) в Supabase:
```sql
-- Только админы могут видеть админ-панель данные
CREATE POLICY "Admins only"
ON admin_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## 📁 Структура файлов

```
src/
├── pages/
│   └── admin/
│       ├── index.astro                    # Dashboard
│       ├── api-settings.astro             # API Management
│       ├── pois.astro                     # POI Management
│       ├── parsing.astro                  # Parsing System
│       ├── tools.astro                    # Text Tools
│       ├── users.astro                    # User Management
│       ├── database.astro                 # Database Tools
│       ├── analytics.astro                # Analytics
│       └── settings.astro                 # System Settings
│
├── components/
│   └── admin/
│       └── [компоненты из структуры выше]
│
├── services/
│   └── admin/
│       ├── adminService.ts                # CRUD для админки
│       ├── statsService.ts                # Статистика
│       ├── parsingControlService.ts       # Управление парсингом
│       └── bulkOperationsService.ts       # Массовые операции
│
├── middleware/
│   └── adminAuth.ts                       # Проверка прав доступа
│
└── types/
    └── admin.types.ts                     # TypeScript типы для админки
```

---

## 💡 Что легко реализовать ПРЯМО СЕЙЧАС?

### **Топ-3 самых простых и полезных страницы:**

#### 1. **Dashboard (Статистика)** - ~2-3 часа
- Подсчет количества записей из Supabase
- Простые виджеты с цифрами
- Статус API (проверка наличия ключей)
- Использует уже существующие сервисы

#### 2. **API Settings** - ~3-4 часа
- Форма для редактирования `.env` переменных
- Тестирование API ключей
- Простой UI с инпутами
- Использует существующие `groqService` и `perplexityService`

#### 3. **URL Expander Tool** - ~1-2 часа
- Уже есть `perplexityService.expandShortUrl()`
- Просто сделать форму с input + button
- Показ результата
- Самая быстрая для реализации!

---

## 🎯 Рекомендация: С ЧЕГО НАЧАТЬ?

Я рекомендую начать с **MVP набора**:

### **День 1-2:** Admin Layout + Authentication
1. Создать `src/components/admin/Layout/AdminLayout.tsx`
2. Добавить sidebar с навигацией
3. Middleware для проверки admin роли

### **День 3:** URL Expander Tool ⚡
- Самая простая и сразу полезная страница
- Демонстрирует работу с API

### **День 4-5:** Dashboard со статистикой
- Виджеты с количеством POI, users
- Статус API
- Последние активности

### **День 6-7:** API Settings
- Форма для управления ключами
- Тестирование соединений

---

## ❓ Вопросы для уточнения:

1. **Хранение API ключей:**
   - Оставить в `.env` файле? 
   - Или хранить в базе Supabase (зашифрованные)?

2. **Права доступа:**
   - Только один admin?
   - Или несколько ролей (admin, editor, moderator)?

3. **Уведомления:**
   - Нужны email/telegram уведомления об ошибках?
   - Или только в UI?

4. **Дизайн:**
   - Минималистичный (как сейчас)?
   - Или более насыщенный (как Supabase/Vercel dashboard)?

---

## 🎁 Бонус: Готовый код для URL Expander

Хотите, я сразу создам рабочую страницу `/admin/tools/url-expander`?

Это займет ~15 минут и покажет как работать с админкой! 🚀

---

**Что делаем дальше?**
- ✅ Начать с URL Expander Tool (быстрый результат)?
- ✅ Создать Admin Layout и Dashboard?
- ✅ Настроить authentication для админки?
- ✅ Или что-то другое?
