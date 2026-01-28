# 🏗️ SYSTEM.md — Архитектура, Database, API

**Версия:** 1.0  
**Дата:** 25 января 2026  
**Для кого?** Tech Lead, Backend разработчик, DevOps  
**Размер:** ~8,000 слов  
**Время чтения:** 30-35 минут

---

## 📋 ОГЛАВЛЕНИЕ

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Business Logic](#business-logic)

---

## ARCHITECTURE OVERVIEW

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Vercel)                      │
├─────────────────┬──────────────────────┬──────────────────────┤
│  Landing Page   │   Web App (Astro)    │    Map Viewer        │
│  (Astro)        │   Search Form        │   (Leaflet)          │
│                 │   Results Page       │                      │
└────────┬────────┴─────────────┬────────┴──────────────┬────────┘
         │                      │                       │
         │                      │                       │
         └──────────────────────┼───────────────────────┘
                                │ (HTTPS API Calls)
                                ▼
        ┌────────────────────────────────────────────┐
        │     BACKEND (Node.js + Express)            │
        │     Railway.app or Render.com              │
        ├────────────┬────────────┬──────────┬───────┤
        │ API Routes │  Business  │  Auth    │ Rate  │
        │            │  Logic     │  (JWT)   │ Limit │
        │            │            │          │       │
        │ /tasks     │ - Matching │ OAuth    │ Redis │
        │ /offers    │ - Posting  │ Google   │ Cache │
        │ /messages  │ - Filters  │ JWT      │       │
        │ /offers    │ - Routing  │ tokens   │       │
        └────────────┴────────────┴──────────┴───────┘
                 │              │              │
        ┌────────┴──────────────┴──────────────┴──────┐
        │                                             │
        ▼                                             ▼
    ┌───────────────────┐                  ┌─────────────────┐
    │ DATABASE          │                  │ EXTERNAL        │
    │ (Supabase)        │                  │ SERVICES        │
    │                   │                  │                 │
    │ PostgreSQL        │                  │ Telegram Bot    │
    │ ├─ users          │                  │ Google Maps API │
    │ ├─ landlords      │                  │ Stripe Webhooks │
    │ ├─ rental_tasks   │                  │ SendGrid Email  │
    │ ├─ rental_offers  │                  │ AWS S3 (image   │
    │ ├─ messages       │                  │        links)   │
    │ ├─ landlord_      │                  │ Sentry (errors) │
    │ │  responses      │                  │                 │
    │ └─ analytics      │                  └─────────────────┘
    └───────────────────┘
```

---

### Key Components

| Component | Provider | Purpose |
|-----------|----------|---------|
| Frontend | Vercel | Host Web app, landing, static files |
| Backend | Railway/Render | Node.js API server, business logic |
| Database | Supabase | PostgreSQL, auth, real-time |
| Cache | Redis | Session management, rate limiting |
| Telegram | Telegram Bot API | Bot commands, message routing |
| Storage | AWS S3 or Cloudinary | Image hosting (links only) |
| Email | SendGrid | Transactional emails |
| Monitoring | Sentry | Error tracking |
| Analytics | Mixpanel | Product analytics |

---

## TECH STACK

### Frontend

```
Framework:       Astro 4.0
Runtime:         Node 18+
Language:        TypeScript

Dependencies:
├─ React 18              # Interactive components
├─ Tailwind CSS 3        # Styling
├─ Leaflet + React       # Maps
├─ TanStack Query 5      # Data fetching
├─ React Hook Form       # Form management
├─ Zod                   # Schema validation
├─ @supabase/supabase-js # DB client
├─ axios                 # HTTP client
├─ date-fns              # Date utilities
└─ zustand              # State management (optional)

Deployment:      Vercel
Build command:   npm run build
Start command:   npm run preview
Environment:     .env.local
```

---

### Backend

```
Framework:       Express.js 4.18
Runtime:         Node 18+
Language:        TypeScript
Port:            3000

Dependencies:
├─ @supabase/supabase-js # Database client
├─ telegraf              # Telegram Bot Framework
├─ dotenv                # Environment variables
├─ cors                  # CORS middleware
├─ helmet                # Security headers
├─ express-rate-limit    # Rate limiting
├─ jsonwebtoken          # JWT auth
├─ bcryptjs              # Password hashing
├─ joi                   # Input validation
├─ winston               # Logging
├─ axios                 # HTTP requests
├─ stripe                # Payment processing (future)
└─ redis                 # Caching

Deployment:      Railway or Render
Build command:   npm run build
Start command:   npm start
Port:            3000 (internal), 8080 (container)
Environment:     .env
```

---

### Database

```
Provider:        Supabase (PostgreSQL 14+)
Version:         Latest stable
Extensions:
├─ uuid-ossp             # UUID generation
├─ pg_trgm               # Text search
└─ pgvector (optional)   # Vector embeddings for ML

Backup:          Daily automatic (Supabase managed)
Replication:     Read replicas enabled (future)
Connection Pool: 20-100 connections
```

---

### Infrastructure

```
Frontend CDN:    Cloudflare
Frontend Host:   Vercel
Backend Host:    Railway.app (recommended) or Render
Database:        Supabase Cloud
Email:           SendGrid API
Image Storage:   AWS S3 or Cloudinary (links only)
Monitoring:      Sentry + DataDog (optional)
Secrets:         GitHub Secrets (deployment), .env (local)
```

---

## DATABASE SCHEMA

### Overview (8 Core Tables)

```
users (клиенты)
├─ user_id (PK)
├─ email
├─ password_hash
├─ created_at
└─ preferences

landlords (собственники)
├─ landlord_id (PK)
├─ user_id (FK → users)
├─ name
├─ verified_at
└─ premium_until

rental_tasks (потребности клиентов)
├─ task_id (PK)
├─ user_id (FK → users)
├─ title
├─ location
├─ dates
├─ status
└─ created_at

rental_offers (предложения собственников)
├─ offer_id (PK)
├─ landlord_id (FK → landlords)
├─ title
├─ location
├─ price_per_night
├─ verified_at
└─ status

messages (переписка)
├─ message_id (PK)
├─ from_user_id (FK)
├─ to_user_id (FK)
├─ offer_id (FK → rental_offers)
├─ content
└─ created_at

landlord_responses (ответы арендодателей)
├─ response_id (PK)
├─ task_id (FK → rental_tasks)
├─ landlord_telegram_id
├─ raw_message TEXT
├─ photos TEXT[]
├─ geo_link TEXT
└─ created_at

offers (связь объекты ↔ запросы)
├─ offer_id (PK)
├─ property_id (FK → properties)
├─ task_id (FK → rental_tasks)
├─ response_id (FK → landlord_responses)
└─ landlord_contact TEXT

analytics (метрики)
├─ event_id (PK)
├─ event_type
├─ user_id (FK)
├─ metadata
└─ created_at
```

---

### Detailed Schema (SQL)

#### 1. users (Клиенты)

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  
  -- Preferences
  preferred_locations TEXT[], -- ['Bali', 'Thailand']
  preferred_budget_min INTEGER,
  preferred_budget_max INTEGER,
  preferred_length_days INTEGER,
  
  -- OAuth
  google_id VARCHAR(255) UNIQUE,
  telegram_id VARCHAR(255) UNIQUE,
  
  -- Metadata
  user_type VARCHAR(20) DEFAULT 'tourist', -- 'tourist' | 'crypto_nomad'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

#### 2. landlords (Собственники)

```sql
CREATE TABLE landlords (
  landlord_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verification_method VARCHAR(50), -- 'id_scan' | 'video' | 'admin'
  
  -- Profile
  business_name VARCHAR(255),
  bio TEXT,
  properties_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),
  
  -- Premium
  premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMP,
  premium_tier VARCHAR(20), -- 'basic' | 'premium' | 'enterprise'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landlords_verified ON landlords(verified);
CREATE INDEX idx_landlords_premium ON landlords(premium, premium_until);
```

---

#### 3. rental_tasks (Потребности)

```sql
CREATE TABLE rental_tasks (
  task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  location_lat NUMERIC(9,6) NOT NULL,
  location_lng NUMERIC(9,6) NOT NULL,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  location_radius_km INTEGER DEFAULT 5, -- Search radius
  
  -- Dates
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  length_days INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  -- Preferences
  budget_per_night_min INTEGER,
  budget_per_night_max INTEGER,
  property_type TEXT[], -- ['apartment', 'villa', 'house']
  bedrooms INTEGER,
  amenities TEXT[], -- ['wifi', 'kitchen', 'workspace']
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'closed' | 'archived' | 'expired'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP GENERATED ALWAYS AS (check_out + INTERVAL '7 days') STORED
);

CREATE INDEX idx_rental_tasks_user_id ON rental_tasks(user_id);
CREATE INDEX idx_rental_tasks_status ON rental_tasks(status);
CREATE INDEX idx_rental_tasks_location ON rental_tasks(location_lat, location_lng);
CREATE INDEX idx_rental_tasks_dates ON rental_tasks(check_in, check_out);
```

---

#### 4. rental_offers (Предложения)

```sql
CREATE TABLE rental_offers (
  offer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES landlords(landlord_id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  location_lat NUMERIC(9,6) NOT NULL,
  location_lng NUMERIC(9,6) NOT NULL,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  address VARCHAR(500),
  
  -- Property Details
  property_type VARCHAR(50) NOT NULL, -- 'apartment' | 'villa' | 'house' | 'room'
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  total_sqm INTEGER,
  
  -- Amenities
  amenities TEXT[] NOT NULL, -- ['wifi', 'kitchen', 'workspace', 'ac', 'pool']
  wifi_speed_mbps INTEGER, -- For crypto nomads
  
  -- Pricing
  price_per_night NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Availability
  available_from DATE,
  available_until DATE,
  
  -- Payment
  accepts_crypto BOOLEAN DEFAULT FALSE, -- USDT, BTC
  payment_methods TEXT[],
  
  -- Photos
  photo_urls TEXT[], -- External links only (Cloudinary, Google Drive)
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'inactive' | 'archived'
  verified_at TIMESTAMP,
  
  -- Featured
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP,
  featured_cost_paid NUMERIC(10,2),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rental_offers_landlord_id ON rental_offers(landlord_id);
CREATE INDEX idx_rental_offers_status ON rental_offers(status);
CREATE INDEX idx_rental_offers_location ON rental_offers(location_lat, location_lng);
CREATE INDEX idx_rental_offers_price ON rental_offers(price_per_night);
CREATE INDEX idx_rental_offers_featured ON rental_offers(featured, featured_until);
```

---

#### 5. messages (Переписка)

```sql
CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Participants
  from_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Context
  offer_id UUID REFERENCES rental_offers(offer_id) ON DELETE SET NULL,
  task_id UUID REFERENCES rental_tasks(task_id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Telegram routing
  telegram_message_id VARCHAR(255),
  telegram_chat_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_users ON messages(from_user_id, to_user_id);
CREATE INDEX idx_messages_offer_id ON messages(offer_id);
CREATE INDEX idx_messages_task_id ON messages(task_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

#### 6. landlord_responses (Ответы арендодателей)

```sql
CREATE TABLE landlord_responses (
  response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES rental_tasks(task_id) ON DELETE CASCADE,
  
  -- Landlord info
  landlord_telegram_id BIGINT NOT NULL,
  landlord_username VARCHAR(100),
  
  -- Message data
  telegram_message_id BIGINT,
  raw_message TEXT,
  photos TEXT[], -- Array of photo URLs
  geo_link TEXT, -- Short link or coordinates
  
  -- Parsed data
  property_id UUID REFERENCES properties(property_id) ON DELETE SET NULL,
  parsed_at TIMESTAMP,
  needs_clarification BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landlord_responses_task_id ON landlord_responses(task_id);
CREATE INDEX idx_landlord_responses_landlord_id ON landlord_responses(landlord_telegram_id);
CREATE INDEX idx_landlord_responses_created_at ON landlord_responses(created_at DESC);
```

---

#### 7. offers (Связь объектов и запросов)

```sql
CREATE TABLE offers (
  offer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES rental_tasks(task_id) ON DELETE CASCADE,
  response_id UUID REFERENCES landlord_responses(response_id) ON DELETE SET NULL,
  
  -- Contact info
  landlord_contact TEXT, -- Telegram username or phone
  
  -- Pricing (optional, может быть null)
  price_per_month INTEGER,
  available_from DATE,
  available_to DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'closed' | 'archived'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_property_id ON offers(property_id);
CREATE INDEX idx_offers_task_id ON offers(task_id);
CREATE INDEX idx_offers_response_id ON offers(response_id);
```

---

#### 8. analytics (Метрики)

```sql
CREATE TABLE analytics (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event
  event_type VARCHAR(100) NOT NULL, -- 'form_submitted' | 'offer_viewed' | 'connection_made'
  event_category VARCHAR(50), -- 'user' | 'offer' | 'connection'
  
  -- User Context
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB, -- {'offer_id': '...', 'price': 100, 'location': 'Bali'}
  
  -- Source
  source VARCHAR(50), -- 'web' | 'telegram' | 'api'
  ip_address INET,
  user_agent VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
```

---

## API ENDPOINTS

### Overview

```
Base URL: https://api.unmissable.com (production) or http://localhost:3000 (development)
Authentication: JWT Bearer Token
Content-Type: application/json
```

---

### 1. Rental Tasks (User Needs)

#### POST /api/rental-tasks

Create a new rental task (потребность)

```bash
curl -X POST http://localhost:3000/api/rental-tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cozy apartment in Bali for March",
    "location_lat": -8.6705,
    "location_lng": 115.2126,
    "location_city": "Ubud",
    "location_country": "Indonesia",
    "check_in": "2026-03-01",
    "check_out": "2026-03-14",
    "budget_per_night_min": 70,
    "budget_per_night_max": 150,
    "property_type": ["apartment", "villa"],
    "bedrooms": 1,
    "amenities": ["wifi", "kitchen", "workspace"],
    "description": "Looking for a quiet place with good WiFi"
  }'
```

**Response:**

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "active",
  "created_at": "2026-01-25T10:00:00Z",
  "posted_to_telegram": true,
  "telegram_channel": "@unmissable_longterm_rentals"
}
```

---

#### GET /api/rental-tasks/:task_id

Get a specific task

```bash
curl http://localhost:3000/api/rental-tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### PUT /api/rental-tasks/:task_id

Update a task

---

#### DELETE /api/rental-tasks/:task_id

Delete a task

---

#### POST /api/rental-tasks/:task_id/post-to-telegram

Manually post task to Telegram channels

---

### 2. Rental Offers (Landlord Properties)

#### POST /api/rental-offers

Create new rental offer (property listing)

```bash
curl -X POST http://localhost:3000/api/rental-offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Luxurious Villa with Ocean View",
    "description": "3BR villa with pool and wifi 100Mbps",
    "location_lat": -8.5793,
    "location_lng": 115.3001,
    "location_city": "Seminyak",
    "address": "Jl. Campuhan, Ubud",
    "property_type": "villa",
    "bedrooms": 3,
    "bathrooms": 2,
    "amenities": ["wifi", "pool", "kitchen", "ac"],
    "wifi_speed_mbps": 100,
    "price_per_night": 120,
    "accepts_crypto": true,
    "payment_methods": ["USDT", "BTC"],
    "available_from": "2026-02-01",
    "available_until": "2026-12-31",
    "photo_urls": ["https://cloudinary.com/image1.jpg"]
  }'
```

**Response:**

```json
{
  "offer_id": "550e8400-e29b-41d4-a716-446655440010",
  "status": "active",
  "created_at": "2026-01-25T10:00:00Z",
  "verified": false
}
```

---

#### GET /api/rental-offers

List all offers with filters

```bash
curl 'http://localhost:3000/api/rental-offers?city=Bali&min_price=50&max_price=200&amenities=wifi,workspace'
```

---

#### GET /api/rental-offers/:offer_id

Get specific offer

---

#### PUT /api/rental-offers/:offer_id

Update offer

---

#### DELETE /api/rental-offers/:offer_id

Delete offer

---

### 3. Messages (Communication)

#### POST /api/messages

Send a message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to_user_id": "550e8400-e29b-41d4-a716-446655440002",
    "offer_id": "550e8400-e29b-41d4-a716-446655440010",
    "content": "Hi! Is the villa still available for March 1-14?"
  }'
```

---

#### GET /api/messages

Get messages for current user

---

#### GET /api/messages/:message_id

Get specific message

---

### 4. Offers (Connections)

#### POST /api/offers

Create connection between property and request

```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "property_id": "550e8400-e29b-41d4-a716-446655440010",
    "response_id": "550e8400-e29b-41d4-a716-446655440020",
    "landlord_contact": "@landlord_username"
  }'
```

---

#### GET /api/offers/:task_id

Get all offers for a specific rental request

---

#### PUT /api/offers/:offer_id

Update offer status

---

## BUSINESS LOGIC

### Task Posting to Telegram

```
1. User fills form → task created in DB
2. Task status set to "posted_to_telegram"
3. Backend triggers Telegram posting:
   a) Format message:
      "🏠 1BR Apartment in Bali
       📅 March 1-14
       💰 $100/night
       ✨ WiFi, Workspace, Kitchen
       👤 [User name]
       📞 [Contact button]"
   
   b) Post to relevant channels:
      - @unmissable_rentals (tourists)
      - @unmissable_longterm_rentals (crypto nomads)
      - @unmissable_bali (location-specific)
   
   c) Generate inline keyboard:
      [View Map] [Contact]

4. Task becomes visible to landlords in bot
```

---

### Offer Matching Algorithm

```
When: Task created
Process:
1. Get task location + budget + dates + amenities
2. Query offers database:
   SELECT * FROM rental_offers
   WHERE
     status = 'active'
     AND price_per_night BETWEEN task.budget_min AND task.budget_max
     AND ST_Distance(location, task.location) < task.radius_km
     AND available_from <= task.check_in
     AND available_until >= task.check_out
     AND offers.amenities @> task.amenities
   ORDER BY distance ASC, price ASC, rating DESC
   LIMIT 10

3. Generate personalized map with matches
4. Send offers to user via bot
```

---

### Message Routing (Telegram)

```
Flow:
1. Landlord sends Telegram message to bot:
   "/reply <task_id> Hi, we have a perfect place..."

2. Backend:
   a) Validates landlord ID
   b) Validates task exists and is active
   c) Stores message in DB
   d) Sends to user's Telegram: "New reply from [Landlord]"
   e) User can reply directly

3. User sends Telegram message back
   → Stored in messages table
   → Landlord gets notification
```

---

### Connection Workflow

```
State Machine:

TASK CREATED
  ↓
LANDLORD REPLIES
  ↓
NEGOTIATING (messages back & forth)
  ↓
USER SELECTS OFFER
  ↓
OFFER CREATED (active)
  ↓
CONFIRMED (agreement reached)
  ↓
COMPLETED (stay finished)
  ↓
REVENUE = Premium subscriptions + Pay-per-Request
```

---

**Статус:** ✅ ГОТОВО  
**Следующий документ:** [FLOW.md](FLOW.md) (user journey, telegram, admin)

**Дата последнего обновления:** 25 января 2026, 14:25 UTC
