# 🔄 FLOW.md — User Journey, Telegram Bot, Admin Dashboard

**Версия:** 1.0  
**Дата:** 25 января 2026  
**Для кого?** Все разработчики, Product Manager, QA  
**Размер:** ~7,000 слов  
**Время чтения:** 25-30 минут

---

## 📋 ОГЛАВЛЕНИЕ

1. [User Journey (10 этапов)](#user-journey-10-этапов)
2. [Telegram Bot Integration](#telegram-bot-integration)
3. [Admin Dashboard](#admin-dashboard)

---

## USER JOURNEY (10 ЭТАПОВ)

### 1️⃣ DISCOVERY (Как клиент находит нас?)

#### Touchpoints:

- **Google Search:** "cheap rentals Bali"
- **Telegram:** @unmissable_rentals channel
- **Reddit:** r/digitalnomad, r/bali posts
- **Nomad List:** directory listing
- **Word of mouth**

#### What Happens:

- Клиент видит landing page
- Читает "How it works"
- Видит примеры (testimonials, photos)

#### Data Saved:

- `analytics` table: `event_type = "landing_viewed"`

---

### 2️⃣ FORM SELECTION (Какой тип клиента?)

#### What User Sees:

```
┌────────────────────────────────┐
│   What are you looking for?    │
├────────────────────────────────┤
│                                │
│  [🏖️  I'm a Tourist]          │
│  Looking for short vacation   │
│  (3-14 days, flexible)        │
│                                │
│  [🧑‍💻  I'm a Digital Nomad]   │
│  Looking to stay longer        │
│  (1-6 months, work needs)      │
│                                │
└────────────────────────────────┘
```

#### Backend:

Determines which form to show

---

### 3️⃣ FORM A: TOURIST FORM (3 screens)

#### Screen 1: Dates & Location

```
┌──────────────────────────────────────┐
│  When & Where are you going?         │
├──────────────────────────────────────┤
│                                      │
│  From: [2026-03-01]                 │
│  To:   [2026-03-14]                 │
│                                      │
│  Where: [Bali, Indonesia]           │
│          (or search map)             │
│                                      │
│         [📍 Use Map]                │
│                                      │
│  [Next →]                            │
└──────────────────────────────────────┘
```

**Backend Processing:**

- Validate dates (`check_out > check_in`)
- Geocode location → lat/lng
- Calculate length of stay
- Save to `rental_tasks` (partial)

---

#### Screen 2: Property Type & Amenities

```
┌──────────────────────────────────────┐
│  What's your ideal place?            │
├──────────────────────────────────────┤
│                                      │
│  Property Type:                      │
│  ☑ Apartment  ☐ Villa  ☐ House      │
│                                      │
│  Budget (per night):                 │
│  $ --- ●───────────── $             │
│                                      │
│  Must-have Amenities:                │
│  ☑ WiFi  ☑ Kitchen  ☐ AC            │
│  ☐ Pool  ☐ Workspace  ☐ Washer      │
│                                      │
│  [← Back]  [Next →]                 │
└──────────────────────────────────────┘
```

**Backend Processing:**

- Store `property_type`, `budget_range`, `amenities`
- Start matching algorithm

---

#### Screen 3: Contact Info

```
┌──────────────────────────────────────┐
│  How can we reach you?               │
├──────────────────────────────────────┤
│                                      │
│  Name: [John Doe]                   │
│                                      │
│  Email: [john@example.com]          │
│                                      │
│  Phone/Telegram: [@johndoe]         │
│  (preferred contact method)          │
│                                      │
│  ☐ I accept terms of service        │
│                                      │
│  [← Back]  [Submit]                 │
└──────────────────────────────────────┘
```

**Backend Processing:**

- Create user if not exists
- Create `rental_task` record
- Set `status = "active"`
- Post to Telegram channels

---

### 4️⃣ FORM B: CRYPTO NOMAD FORM (3 screens)

#### Screen 1: Duration & Location

```
┌──────────────────────────────────────┐
│  When & where will you be?           │
├──────────────────────────────────────┤
│                                      │
│  Duration:                           │
│  ○ 1 month  ○ 2-3 months            │
│  ○ 3-6 months  ● Flexible            │
│                                      │
│  From: [2026-03-01]                 │
│                                      │
│  City/Country: [Bali, Indonesia]    │
│                                      │
│  Flexible to nearby areas?           │
│  ☑ Yes, within 50km  ☐ No           │
│                                      │
│  [Next →]                            │
└──────────────────────────────────────┘
```

---

#### Screen 2: Your Work Needs

```
┌──────────────────────────────────────┐
│  What do you need to work?           │
├──────────────────────────────────────┤
│                                      │
│  WiFi Speed:  Mbps minimum     │
│                                      │
│  Workspace:                          │
│  ☑ Dedicated desk  ☑ Quiet room     │
│  ☐ High chair  ☐ Standing desk      │
│                                      │
│  Budget (per month):                 │
│  $ --- ●───────────── $[3000]  │
│                                      │
│  Payment method:                     │
│  ☑ USD/Bank  ☑ USDT (Crypto)        │
│  ☑ BTC  ☐ Other                     │
│                                      │
│  [← Back]  [Next →]                 │
└──────────────────────────────────────┘
```

---

#### Screen 3: Contact & Preferences

```
┌──────────────────────────────────────┐
│  Your contact info                   │
├──────────────────────────────────────┤
│                                      │
│  Name: [Jane Developer]              │
│                                      │
│  Email: [jane@crypto.com]            │
│                                      │
│  Telegram: [@janedev]                │
│                                      │
│  Crypto Wallet (optional):           │
│  [USDT address...]                   │
│                                      │
│  ☐ I accept terms                    │
│  ☑ I want to be featured             │
│                                      │
│  [← Back]  [Submit]                 │
└──────────────────────────────────────┘
```

---

### 5️⃣ TASK GENERATION & POSTING TO TELEGRAM

#### What Backend Does:

```
Task Created
  ↓
1. Validate all data
2. Create rental_task record in DB
3. Generate Telegram message:
   ─────────────────────────────
   🏠 1BR Apartment in Bali
   📅 March 1-14 (14 nights)
   💰 $70-150/night
   ✨ WiFi, Kitchen, AC
   👤 John Doe
   📞 @johndoe
   ─────────────────────────────
   
4. Post to Telegram channels:
   - @unmissable_rentals
   - @unmissable_bali
   - @unmissable_places (if popular destination)
   
5. Return personalized map URL to user
   "Check offers on your map →"
```

#### Data Saved:

- `rental_tasks` record created
- `task_id` returned
- `posted_to_telegram = true`
- `telegram_message_id` stored

---

### 6️⃣ LANDLORD RESPONSE (Via Telegram Bot)

#### What Landlord Sees:

```
Telegram Channel @unmissable_landlords

🏠 NEW OPPORTUNITY!
📝 Tourist looking: 1BR apartment, Bali, March 1-14
💰 Budget: $70-150/night
📍 Address: You'll see on map once you reply

[Reply with your offer]
```

#### How Landlord Replies:

```
Landlord sends to bot:
"I have a 2BR villa in Seminyak, $120/night,
perfect WiFi, pool, available for this period.
Contact me: +62-812-3456-7890"

Bot processes:
1. Validates landlord_id
2. Creates offer record
3. Sends to user: "New offer from [landlord]"
```

---

### 7️⃣ OFFER AGGREGATION

#### Backend Automatically Collects:

```
rental_tasks_id: "task-123"
  ├─ Offer 1: "Villa in Ubud" ($120/night, WiFi 100Mbps)
  ├─ Offer 2: "Apartment in Canggu" ($95/night, pool)
  ├─ Offer 3: "House with workspace" ($150/night, ac)
  └─ Offer 4: "Villa with crypto accepted" ($110/night, USDT)

Each stored in rental_offers table with:
- landlord_id
- location (lat/lng)
- price
- amenities
- photos (external links)
- accepted_payment_methods
```

---

### 8️⃣ PERSONALIZED MAP GENERATION

#### What User Sees:

```
┌────────────────────────────────┐
│  Your Offers on Map            │
├────────────────────────────────┤
│                                │
│  🗺️  [Interactive Leaflet Map] │
│      ●(red) Offer 1: $120     │
│      ●(blue) Offer 2: $95     │
│      ●(green) Offer 3: $150   │
│      ●(yellow) Offer 4: $110  │
│                                │
│  Filters:                      │
│  Price: $70 ---- $200         │
│  Rating: ⭐⭐⭐⭐ and above     │
│                                │
│  [List View]  [Map View]      │
└────────────────────────────────┘
```

#### Backend:

- Query matching offers
- Calculate distance
- Sort by relevance
- Generate map markers
- Send via Telegram

---

### 9️⃣ USER VIEWS & SELECTS

#### What User Does:

```
User clicks on offer marker
  ↓
Sees offer details:
┌─────────────────────────────┐
│ 🏡 Villa in Ubud            │
│ ⭐ 4.8/5 (12 reviews)       │
│                             │
│ 💰 $120 per night           │
│ 📍 Ubud, Bali               │
│ 🛏️ 2BR, 1BA, 80 sqm        │
│                             │
│ ✨ WiFi 100Mbps             │
│    Pool, Kitchen, AC        │
│    Workspace, Washer        │
│                             │
│ Photos: [Google Drive link] │
│                             │
│ [Contact Owner]             │
│ [Check Availability]        │
│ [Book Now]                  │
└─────────────────────────────┘

User clicks "Contact Owner"
```

---

### 🔟 COMMUNICATION & DEAL

#### Telegram Conversation:

```
User sends to Landlord:
"Hi! Is the villa still available March 1-14?
Any discounts for long-term?"

Landlord replies (via bot):
"Yes available! For 14 nights, special price $110/night.
That's $1,540 total. When can you visit?"

User:
"Perfect! How do I book? Do you accept crypto?"

Landlord:
"Yes, USDT accepted. Send direct payment:
USDT address: TXXXX...
Or bank transfer: [details]"

User sends payment
Connection established!
Platform gets 4% = $61.60
```

#### Backend Records:

- `messages` table: all conversation
- `offers` table: created, `status = "active"`
- Сделка происходит вне платформы (прямая связь в Telegram)

---

### FULL FLOW DIAGRAM

```
┌─────────────────┐
│  User Discovery │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Select Form Type       │
│  (Tourist or Nomad)     │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Fill 3-Screen Form      │
│  ✓ Location & dates      │
│  ✓ Property preferences  │
│  ✓ Contact info          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  POST to Telegram        │
│  (Post to channels)      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Generate Offers         │
│  (Matching algorithm)    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Show on Map             │
│  (Leaflet markers)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  User Contacts Landlords │
│  (Via Telegram)          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Connection Made         │
│  4% Commission Earned    │
└──────────────────────────┘
```

---

## TELEGRAM BOT INTEGRATION

### Bot Commands

```
/start - Main menu
/search - Quick search form
/mysearches - List your requests
/myreplies - Messages from landlords
/featured - Premium listings
/settings - Preferences
/help - Help & FAQ
/contact - Support
```

---

### Inline Keyboards (Examples)

#### Main Menu After /start:

```javascript
{
  inline_keyboard: [
    [
      { text: '🏖️ I\'m a Tourist', callback_data: 'form_tourist' },
      { text: '🧑‍💻 I\'m a Nomad', callback_data: 'form_nomad' }
    ],
    [
      { text: '📋 My Searches', callback_data: 'my_searches' },
      { text: '💬 My Messages', callback_data: 'my_messages' }
    ],
    [
      { text: '❓ Help', callback_data: 'help' },
      { text: '⚙️ Settings', callback_data: 'settings' }
    ]
  ]
}
```

---

#### Offer Card:

```javascript
{
  inline_keyboard: [
    [
      { text: '🗺️ View Map', url: 'https://unmissable.com/map/offer-123' },
      { text: '📞 Contact', callback_data: 'contact_landlord_123' }
    ],
    [
      { text: '❤️ Favorite', callback_data: 'favorite_offer_123' },
      { text: '📤 Share', callback_data: 'share_offer_123' }
    ]
  ]
}
```

---

### Message Templates

#### Task Posted to Channel:

```
🏠 Looking for Accommodation

📍 Location: Bali, Indonesia (Ubud area)
📅 Dates: March 1-14, 2026 (14 nights)
💰 Budget: $70-150 per night
🛏️ Property: 1-2 bedroom apartment or villa

✨ Requirements:
   • Good WiFi
   • Kitchen
   • AC or fan

👤 Posted by: John Doe
📧 Contact: john@example.com / @johndoe

[📍 View Map] [💬 Reply with Offer]
```

---

#### Offer Notification to User:

```
✅ New Offer for Your Search!

🏡 Villa in Ubud
⭐ 4.8/5 (12 reviews)

📍 Location: Ubud, Bali
💰 Price: $120/night
🛏️ 2BR, 1BA, 80 sqm
✨ WiFi 100Mbps, Pool, Kitchen

🧑 Owner: Made Suryanto
📞 Telegram: @made.suryanto

[🗺️ View on Map] [💬 Message Owner] [❤️ Save]
```

---

## ADMIN DASHBOARD

### Overview

- **Access:** `/admin/` (restricted to admins)
- **Authentication:** Email + Password + 2FA
- **Permission Levels:** Admin, Moderator, Analyst

---

### 1. HOME / ANALYTICS

```
┌──────────────────────────────────────┐
│  📊 Dashboard                        │
├──────────────────────────────────────┤
│                                      │
│  Today's Metrics:                    │
│  ├─ New Users: 42 ↑ 12%             │
│  ├─ New Tasks: 18 ↑ 5%              │
│  ├─ New Offers: 34 ↓ 2%             │
│  ├─ Messages: 156 ↑ 8%              │
│  ├─ Connections: 5 new              │
│                                      │
│  Revenue (MTD):                      │
│  ├─ Commission: $8,432               │
│  ├─ Premium: $1,200                  │
│  ├─ Sponsored: $2,800                │
│  └─ Total: $12,432                   │
│                                      │
│  Graphs:                             │
│  [Daily Users Chart] [Revenue Chart] │
│  [Request Funnel]    [Top Cities]    │
│                                      │
└──────────────────────────────────────┘
```

---

### 2. USERS MANAGEMENT

```
┌──────────────────────────────────────┐
│  👥 Users Management                 │
├──────────────────────────────────────┤
│                                      │
│  Filter:                             │
│  [User Type ▼] [Status ▼] [Search] │
│                                      │
│  Table:                              │
│  Email          | Type     | Status  │
│  john@ex.com   | Tourist  | Active  │
│  jane@cryp.com | Nomad    | Active  │
│  made@bali.com | Landlord | Banned  │
│                                      │
│  Actions:                            │
│  [View] [Edit] [Ban] [Delete]       │
│                                      │
└──────────────────────────────────────┘
```

---

### 3. LANDLORD VERIFICATION

```
┌──────────────────────────────────────┐
│  ✅ Landlord Verification            │
├──────────────────────────────────────┤
│                                      │
│  Pending Verification: 12            │
│                                      │
│  Name: Made Suryanto                │
│  Email: made@gmail.com               │
│  Phone: +62-812-3456                │
│  Properties: 3                       │
│  Rating: 4.8/5 (45 reviews)          │
│                                      │
│  Verification Method:                │
│  ○ ID Scan  ○ Video Call  ○ Admin   │
│                                      │
│  [Approve] [Reject] [Request More]  │
│                                      │
└──────────────────────────────────────┘
```

---

### 4. OFFERS MANAGEMENT

```
┌──────────────────────────────────────┐
│  🏠 Offers Management                │
├──────────────────────────────────────┤
│                                      │
│  Filter:                             │
│  [City ▼] [Status ▼] [Price Range]  │
│                                      │
│  List:                               │
│  Villa in Ubud  | Bali | Active    │
│  - Owner: Made Suryanto              │
│  - Price: $120/night                 │
│  - Status: Active                    │
│  - Featured: Until 2026-02-01        │
│  [Edit] [Feature] [Delete] [Block]  │
│                                      │
└──────────────────────────────────────┘
```

---

### 5. MESSAGES & SUPPORT

```
┌──────────────────────────────────────┐
│  💬 Messages & Support               │
├──────────────────────────────────────┤
│                                      │
│  Open Tickets: 8                     │
│                                      │
│  User: John Doe                      │
│  Subject: Connection issue           │
│  Status: ⏳ In Review                 │
│  Created: 3 days ago                 │
│  Message: "Landlord didn't reply..." │
│                                      │
│  [View Full] [Reply] [Resolve] [Ban] │
│                                      │
└──────────────────────────────────────┘
```

---

### 6. OFFERS & CONNECTIONS

```
┌──────────────────────────────────────┐
│  💼 Offers & Connections             │
├──────────────────────────────────────┤
│                                      │
│  Filter: [Status ▼] [Date Range]    │
│                                      │
│  Offer ID         | Type    | Status │
│  offer-001        | Villa   | ✅ Active │
│  offer-002        | Apt     | ✅ Active │
│  offer-003        | House   | ⏳ Pending │
│                                      │
│  [View Details] [Process] [Refund]  │
│                                      │
│  Total Collected (MTD): $95,432      │
│  Platform Fee (4%): $3,817           │
│                                      │
└──────────────────────────────────────┘
```

---

### 7. ANALYTICS & REPORTS

```
┌──────────────────────────────────────┐
│  📈 Analytics & Reports              │
├──────────────────────────────────────┤
│                                      │
│  Date Range: [2026-01-01 to 2026-01]│
│                                      │
│  Key Metrics:                        │
│  - Total Users: 4,230 (+15% MoM)    │
│  - Active Users: 1,840 (+22% MoM)   │
│  - Avg Session: 8.5 min (+3% MoM)   │
│  - Conversion Rate: 4.2% (+0.5% MoM)│
│                                      │
│  Download Reports:                   │
│  [Monthly Report] [User Report]      │
│  [Revenue Report] [Connection Report]│
│                                      │
│  [📊 View Dashboards]               │
│                                      │
└──────────────────────────────────────┘
```

---

**Статус:** ✅ ГОТОВО  
**Следующие документы:** [FRONTEND.md](FRONTEND.md) и [OPERATIONS.md](OPERATIONS.md)

**Дата последнего обновления:** 25 января 2026, 14:30 UTC
