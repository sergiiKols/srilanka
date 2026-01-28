# 📚 СТРУКТУРА ДОКУМЕНТАЦИИ: UNMISSABLE RENTALS

**Версия:** 2.0  
**Дата:** 25 января 2026  
**Статус:** OPЦИЯ 2 - ВЫБРАНА (5 модульных файлов)

---

## 🎯 СТРУКТУРА

```
DOCUMENTATION_INDEX.md ← ТЫ ЗДЕСЬ
│
├─ 1️⃣ BUSINESS.md (5.5K слов, 20-25 мин)
│  └─ Бизнес, маркетинг, доход, roadmap
│
├─ 2️⃣ SYSTEM.md (8K слов, 30-35 мин)
│  └─ Архитектура, database, API endpoints
│
├─ 3️⃣ FLOW.md (7K слов, 25-30 мин)
│  └─ User journey, Telegram bot, admin dashboard
│
├─ 4️⃣ FRONTEND.md (5K слов, 20-25 мин)
│  └─ Web приложение, формы, компоненты, React код
│
└─ 5️⃣ OPERATIONS.md (3.5K слов, 15-20 мин)
   └─ Infrastructure, security, DevOps, compliance
```

**ИТОГО:** ~29K слов, ~2 часа чтения (было 40K слов, 3+ часа)

---

## 📖 ОПИСАНИЕ КАЖДОГО ДОКУМЕНТА

### 1️⃣ BUSINESS.md (Бизнес и Маркетинг)

**Для кого?** Product Manager, Инвесторы, Маркетологи, Основатель  
**Размер:** ~5,500 слов  
**Время:** 20-25 минут

**Содержит:**

- **Суть платформы** (lead aggregation, не marketplace)
- **Целевая аудитория:**
  - Туристы (90%, $70-200/ночь)
  - Крипто-кочевники (10%, $500-2500/месяц)
  - Собственники (источник предложений)
- **Бизнес-модель** (3 revenue streams)
- **Unit economics** (расчёты доходов)
- **Marketing channels** (6 способов привлечения):
  - Telegram
  - Nomad List
  - Reddit
  - Google SEO
  - Twitter/X
  - Facebook Groups
- **CAC & LTV расчёты**
- **Monetization strategy:**
  - Комиссия (4% от бронирования)
  - Premium для собственников ($20/месяц)
  - Sponsored listings ($50/месяц)
  - White-label (будущее)
- **12-месячный roadmap с KPIs**
- **Финансовые прогнозы** (Year 1, Year 2, Year 3)

**Вопрос:** "Как мы зарабатываем, растём и захватываем рынок?"

---

### 2️⃣ SYSTEM.md (Архитектура, Database, API)

**Для кого?** Tech Lead, Backend разработчик, Database администратор, DevOps  
**Размер:** ~8,000 слов  
**Время:** 30-35 минут

**Содержит три раздела:**

#### A. АРХИТЕКТУРА СИСТЕМЫ:

- High-level диаграмма (Frontend, Backend, Database, Services)
- **Tech stack:**
  - Frontend: Astro 4, React 18, Tailwind, Leaflet
  - Backend: Node.js, Express, TypeScript, PostgreSQL
  - Services: Supabase, Redis, AWS S3, Telegram Bot
  - Infrastructure: Vercel, Railway, Supabase, Cloudflare
- Component overview
- Deployment strategy (Production, Staging, Development)
- Security & Compliance basics

#### B. DATABASE SCHEMA:

SQL schema для всех таблиц:
- `users` (клиенты)
- `landlords` (собственники)
- `rental_tasks` (потребности)
- `rental_offers` (предложения)
- `messages` (коммуникация)
- `bookings` (бронирования)
- `payments` (платежи)
- `analytics` (метрики)

Для каждой таблицы:
- Полное определение колонок с типами данных
- Constraints (PRIMARY KEY, FOREIGN KEY, CHECK)
- Validations
- Indexes для оптимизации
- Relationships между таблицами

#### C. API ENDPOINTS:

REST API endpoints по категориям:
- `/api/rental-tasks/*` (управление задачами)
- `/api/rental-offers/*` (управление предложениями)
- `/api/messages/*` (коммуникация)
- `/api/bookings/*` (бронирования)

Для каждого endpoint:
- HTTP method (GET, POST, PUT, DELETE)
- Request body (JSON примеры)
- Response format
- Error codes
- Example curl request

**Core business logic:**
- Telegram task generation (как создаётся задача)
- Offer matching algorithm (как подбираются предложения)
- Message routing (как сообщения идут в Telegram)
- Booking workflow (как создаётся бронирование)
- TypeScript примеры кода

**Вопрос:** "Как устроена система, база данных и как взаимодействуют компоненты?"

---

### 3️⃣ FLOW.md (User Journey, Telegram, Admin)

**Для кого?** Все разработчики, Product Manager, QA, Дизайнер  
**Размер:** ~7,000 слов  
**Время:** 25-30 минут

**Содержит три раздела:**

#### A. USER FLOW (10 этапов):

1. **Discovery** - как клиент находит платформу
2. **Form Filling** - клиент заполняет потребность
   - Form A: Tourist Form (туристы)
   - Form B: Crypto Nomad Form (крипто-кочевники)
3. **Task Generation** - платформа создаёт задачу
4. **Landlord Response** - собственники откликаются
5. **Offer Aggregation** - собираются предложения
6. **Personalized Map** - генерируется личная карта
7. **Client Views & Selects** - клиент выбирает
8. **Communication & Deal** - прямая связь

Для каждого этапа:
- Что видит пользователь (скриншот или описание)
- Что делает система (backend логика)
- Какие данные сохраняются (какая таблица)
- Какие уведомления отправляются (где и когда)

#### B. TELEGRAM INTEGRATION:

- Telegram Bot setup
- Bot commands (`/start`, `/search`, `/mysearches`, `/myreplies`, `/settings` и т.д.)
- Inline keyboards (формат `inline_keyboard`)
- Callback handlers (обработка нажатий)
- Telegram Web App integration
- Message templates для:
  - Posting tasks to channels
  - Client notifications
  - Landlord replies
  - Booking confirmations
- Webhook configuration
- Bot code examples (Node.js с telegram-bot-api)

#### C. ADMIN DASHBOARD:

- Admin routes (`/admin/*`)
- **Key pages:**
  - Dashboard (главная с метриками)
  - Users management (список, бан, статистика)
  - Landlords verification (проверка новых)
  - Offers management (редактирование, архив)
  - Messages & support (чат с пользователями)
  - Bookings & payments (отслеживание, платежи)
  - Analytics & reports (графики, метрики)
- React components примеры для каждой страницы
- Charts & metrics visualization
- Admin permissions (кто может что)
- Moderation tools

**Вопрос:** "Как движется пользователь, как работает бот, как управлять платформой?"

---

### 4️⃣ FRONTEND.md (Web приложение и компоненты)

**Для кого?** Frontend разработчик (React/Astro), UI/UX дизайнер  
**Размер:** ~5,000 слов  
**Время:** 20-25 минут

**Содержит:**

#### A. WEB СТРУКТУРА:

**Routes и pages:**
- `/` (Landing page)
- `/search` (Rental search form)
- `/map/[TASK_ID]` (Personalized map)
- `/offers/[OFFER_ID]` (Property detail)
- `/landlords/[LANDLORD_ID]` (Landlord profile)
- `/blog` (Blog & content)
- `/about`, `/privacy`, `/terms`, `/contact`

- Components tree
- State management (TanStack Query)

#### B. LANDING PAGE:

- Hero section
- How it works (3-4 шага)
- Social proof
- Testimonials
- FAQ
- CTA sections

#### C. SEARCH FORMS (с полным кодом):

**Tourist Form (3-step):**
- Screen 1: Dates & Location
- Screen 2: Property Type & Amenities
- Screen 3: Contact Info

**Crypto Nomad Form (3-step):**
- Screen 1: Duration & Location
- Screen 2: Your Needs (WiFi, Workspace, Payment)
- Screen 3: Contact Info & Payment method

Для каждой формы:
- HTML структура с примерами
- Form validation
- Error handling
- Submission workflow

#### D. KEY COMPONENTS:

- Map component (Leaflet + React)
- Property detail card
- Contact form (modal)
- Filter sidebar
- Property carousel
- Reviews section

#### E. STYLING & DESIGN:

- Tailwind CSS примеры
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Accessibility requirements (WCAG 2.1)

#### F. CODE EXAMPLES:

- TypeScript примеры (React)
- Astro components
- React hooks usage
- API integration examples

**Вопрос:** "Как построить красивый и функциональный frontend?"

---

### 5️⃣ OPERATIONS.md (DevOps, Security, Compliance)

**Для кого?** DevOps, Security engineer, Backend architect, System administrator  
**Размер:** ~3,500 слов  
**Время:** 15-20 минут

**Содержит:**

#### A. INFRASTRUCTURE:

- Frontend hosting (Vercel)
- Backend hosting (Railway.app или Render.com)
- Database (Supabase с PostgreSQL)
- Storage (AWS S3 или Cloudinary)
- CDN (Cloudflare)
- Email (SendGrid)
- Monitoring (Sentry)
- Analytics (Mixpanel)

#### B. CI/CD PIPELINE:

- GitHub Actions workflow
- On push to main (tests, build, deploy)
- On pull request (tests, lint, build)
- Deployment strategy (blue-green, rolling)

#### C. DATABASE:

- Backup strategy (automatic daily)
- Point-in-time recovery
- Automated exports to S3
- Test restore procedures

#### D. SECURITY:

- GDPR Compliance checklist
- Data Protection (encryption, HTTPS, JWT)
- Fraud Prevention (verification, limits)
- Content Moderation (filters, reporting)
- Password security (bcrypt, 2FA)

#### E. MONITORING & LOGGING:

- Uptime monitoring (Uptime Robot)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Log aggregation (ELK stack или equivalent)
- Alerts & on-call

#### F. DISASTER RECOVERY:

- RTO & RPO targets
- Failover procedures
- Data recovery steps
- Communication plan

**Вопрос:** "Как запустить, защитить и масштабировать систему в production?"

---

## 🗺️ КАК ЧИТАТЬ ЭТИ ДОКУМЕНТЫ

### Если ты новичок в проекте:

```
1. BUSINESS.md (20 мин) → что это и как зарабатываем
2. SYSTEM.md Архитектура (10 мин) → как устроено
3. FLOW.md User Journey (20 мин) → как работает
────────────────────────────────
ИТОГО: 50 минут и ты готов к разработке!
```

### Если ты Backend разработчик:

```
1. SYSTEM.md DATABASE (15 мин) → schema
2. SYSTEM.md API (15 мин) → endpoints
3. FLOW.md User Journey (20 мин) → контекст
4. FLOW.md Telegram (10 мин) → интеграция
5. OPERATIONS.md (15 мин) → deploy & security
────────────────────────────────
ИТОГО: 75 минут → начинаешь кодить
```

### Если ты Frontend разработчик:

```
1. SYSTEM.md Архитектура (10 мин) → tech stack
2. FLOW.md User Journey (20 мин) → что видит user
3. FRONTEND.md (25 мин) → компоненты и код
4. SYSTEM.md API (15 мин) → какие endpoints вызывать
────────────────────────────────
ИТОГО: 70 минут → начинаешь кодить
```

### Если ты Product Manager:

```
1. BUSINESS.md (25 мин) → полный бизнес план
2. FLOW.md User Journey (20 мин) → что видит user
3. FLOW.md Admin Dashboard (15 мин) → какие данные есть
────────────────────────────────
ИТОГО: 60 минут → знаешь всё о проекте
```

### Если ты DevOps/SysAdmin:

```
1. SYSTEM.md Архитектура (10 мин) → infrastructure
2. OPERATIONS.md (20 мин) → deploy, monitoring, security
3. SYSTEM.md DATABASE (10 мин) → backup strategy
────────────────────────────────
ИТОГО: 40 минут → готов к setup
```

---

## 📊 СРАВНЕНИЕ РАЗМЕРОВ

| Документ | Слов | Время |
|----------|------|-------|
| BUSINESS.md | 5,500 | 20-25 мин |
| SYSTEM.md | 8,000 | 30-35 мин |
| FLOW.md | 7,000 | 25-30 мин |
| FRONTEND.md | 5,000 | 20-25 мин |
| OPERATIONS.md | 3,500 | 15-20 мин |
| **ИТОГО** | **29,000** | **~2 часа** |

**Было:** 40K+ слов, 3+ часа ❌  
**Стало:** 29K слов, модульно, легко читаемо ✅  
**Сэкономлено:** 25% объема, 33% времени

---

## 🔗 СВЯЗИ МЕЖДУ ДОКУМЕНТАМИ

```
BUSINESS.md
    ↓
    "Что мы делаем и как зарабатываем?"
    ↓
SYSTEM.md (Архитектура)
    ↓
    "Как технически это устроено?"
    ├─→ FLOW.md
    │  └─ "Как пользователь движется?"
    │  └─ "Как бот работает?"
    │  └─ "Как управлять платформой?"
    │
    ├─→ FRONTEND.md
    │  └─ "Что видит пользователь?"
    │
    └─→ OPERATIONS.md
       └─ "Как запустить и защитить?"
```

---

## 📌 КАК ОБНОВЛЯТЬ

### ✅ Обновляй когда:

- После спринта (новые features)
- Когда меняется архитектура
- Когда добавляется новый revenue stream
- Когда меняется deployment

### ❌ НЕ обновляй за:

- Баг-фиксы (мелкие исправления)
- Небольшие рефакторы
- Оптимизацию performance
- Изменения в CSS

---

## 🚀 СТАТУС СОЗДАНИЯ

- ✅ **DOCUMENTATION_INDEX.md** — навигация (готово)
- ⏳ **BUSINESS.md** — бизнес-модель (ожидание)
- ⏳ **SYSTEM.md** — архитектура, БД, API (ожидание)
- ⏳ **FLOW.md** — journey, telegram, admin (ожидание)
- ⏳ **FRONTEND.md** — компоненты и формы (ожидание)
- ⏳ **OPERATIONS.md** — DevOps и security (ожидание)

---

**Дата последнего обновления:** 25 января 2026, 14:15 UTC
