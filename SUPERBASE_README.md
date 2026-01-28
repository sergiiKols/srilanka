# 🚀 SUPERBASE - Complete Database Schema

**Version:** 1.0.0  
**Date:** 2026-01-27  
**Status:** Production Ready  

---

## 📋 Overview

Complete PostgreSQL/Supabase database schema for **UNMISSABLE RENTALS** platform - a rental property aggregation and matching system.

### Key Features

✅ **14 Core Tables** - Users, Properties, Requests, Offers, Messages, Maps, Payments, etc.  
✅ **Full RLS Security** - Row Level Security policies for all tables  
✅ **14 Automated Functions** - Property matching, stats, notifications  
✅ **10+ Triggers** - Auto-update counters, notifications, ratings  
✅ **TypeScript Types** - Complete type definitions for frontend  
✅ **PostGIS Enabled** - Geospatial queries for location-based search  
✅ **Real-time Ready** - WebSocket subscriptions for messages & notifications  

---

## 🗄️ Database Architecture

### Core Tables (14)

```
📊 DATABASE STRUCTURE

├── 👤 users                    # User profiles (clients & landlords)
├── 🏠 landlords                # Property owners with subscriptions
├── 🏘️  properties               # Rental properties
├── 📝 rental_requests          # Client rental needs
├── 🤝 offers                   # Property-request connections
├── 💬 messages                 # Direct messaging
├── 🗺️  client_maps              # Personal maps for clients
├── 📍 map_markers              # Property markers on maps
├── 💳 subscriptions            # Landlord subscription plans
├── 💰 payments                 # Transaction history
├── 🔔 notifications            # User notifications
├── 📊 analytics_events         # Tracking & analytics
├── ⭐ reviews                  # Property reviews
└── ❤️  saved_properties         # User favorites
```

### Entity Relationships

```
users (1) ──→ (1) landlords ──→ (N) properties
  │                                      │
  │                                      │
  ↓                                      ↓
rental_requests (1) ←──→ (N) offers ←─ (1) properties
  │                         │
  │                         ↓
  └──────────────→ client_maps (1) ──→ (N) map_markers
  
users (1) ←──→ (N) messages ──→ (1) users
  │
  ↓
notifications (N)
analytics_events (N)
saved_properties (N)
```

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies:

- **Users**: Can only view/edit their own profile
- **Landlords**: Can manage own properties, view active requests
- **Properties**: Public can view active, owners can manage
- **Requests**: Users see own, verified landlords see active ones
- **Offers**: Landlords see own, clients see offers for their requests
- **Messages**: Users see messages they sent/received
- **Maps**: Private by default, can be shared publicly

### Authentication

Uses Supabase Auth with support for:
- Email/Password
- Google OAuth
- Telegram authentication
- JWT tokens

---

## 🛠️ Functions & Automation

### Helper Functions (5)

```sql
-- Search properties by location
SELECT * FROM search_properties(
  6.0535,           -- latitude
  80.2210,          -- longitude
  10,               -- radius in km
  50,               -- min price
  200,              -- max price
  ARRAY['villa']::property_type[],
  2,                -- min bedrooms
  ARRAY['wifi'],    -- required amenities
  20                -- limit
);

-- Match properties to a request
SELECT * FROM match_properties_to_request(
  'request-uuid-here',
  20  -- limit
);

-- Get dashboard stats
SELECT * FROM get_user_dashboard_stats(auth.uid());
SELECT * FROM get_landlord_dashboard_stats('landlord-uuid');

-- Get unread count
SELECT get_unread_messages_count(auth.uid());
```

### Auto-Triggers (10)

1. **updated_at** - Auto-update timestamp on all tables
2. **Landlord stats** - Auto-count properties
3. **Property views** - Increment on analytics events
4. **Request offers** - Count offers per request
5. **Notifications** - Create on new offer
6. **Message alerts** - Notify on new message
7. **Ratings** - Update landlord average rating
8. **Share tokens** - Generate for public maps
9. **Request expiry** - Auto-expire old requests
10. **Review stats** - Update property ratings

---

## 📦 Installation

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your project URL and anon key

### 2. Run Schema

```bash
# Copy schema to Supabase SQL Editor
cat supabase_superbase_schema.sql

# Or use Supabase CLI
supabase db reset
supabase db push
```

### 3. Enable Extensions

The schema automatically enables:
- `uuid-ossp` - UUID generation
- `postgis` - Geospatial queries
- `pg_trgm` - Full-text search
- `citext` - Case-insensitive text

### 4. Configure Environment

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💻 Usage Examples

### TypeScript Integration

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/superbase.types';

const supabase = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.PUBLIC_SUPABASE_ANON_KEY!
);

// Create a rental request
const { data, error } = await supabase
  .from('rental_requests')
  .insert({
    user_id: userId,
    title: 'Cozy apartment in Bali',
    location: [115.2126, -8.6705], // [lng, lat]
    city: 'Ubud',
    country: 'Indonesia',
    check_in: '2026-03-01',
    check_out: '2026-03-14',
    budget_per_night_min: 70,
    budget_per_night_max: 150,
    bedrooms_min: 1,
    required_amenities: ['wifi', 'kitchen'],
    status: 'active'
  })
  .select()
  .single();

// Search properties
const { data: properties } = await supabase
  .rpc('search_properties', {
    p_lat: -8.6705,
    p_lng: 115.2126,
    p_radius_km: 10,
    p_min_price: 50,
    p_max_price: 200,
    p_property_types: ['villa', 'apartment'],
    p_limit: 20
  });

// Create an offer
const { data: offer } = await supabase
  .from('offers')
  .insert({
    property_id: propertyId,
    request_id: requestId,
    landlord_id: landlordId,
    custom_message: 'Perfect for your needs!',
    custom_price_per_night: 120,
    status: 'pending'
  });

// Get dashboard stats
const { data: stats } = await supabase
  .rpc('get_user_dashboard_stats', {
    p_user_id: userId
  });
```

### Real-time Subscriptions

```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Show notification
    }
  )
  .subscribe();

// Subscribe to new offers
supabase
  .channel('offers')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'offers',
      filter: `request_id=eq.${requestId}`
    },
    (payload) => {
      console.log('Offer updated:', payload);
      // Refresh offers list
    }
  )
  .subscribe();
```

---

## 🔧 Advanced Features

### Geospatial Queries

```sql
-- Find properties within 5km of location
SELECT 
  id, title,
  ST_Distance(
    location::geography,
    ST_SetSRID(ST_MakePoint(80.2210, 6.0535), 4326)::geography
  ) / 1000 AS distance_km
FROM properties
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(80.2210, 6.0535), 4326)::geography,
  5000  -- 5km in meters
)
ORDER BY distance_km;
```

### Full-Text Search

```sql
-- Search properties by text
SELECT * FROM properties
WHERE 
  to_tsvector('english', title || ' ' || description) @@ 
  plainto_tsquery('english', 'beachfront villa pool');
```

### Analytics Queries

```sql
-- Top performing properties
SELECT 
  p.id,
  p.title,
  COUNT(DISTINCT ae.id) as views,
  COUNT(DISTINCT o.id) as offers,
  AVG(r.rating) as avg_rating
FROM properties p
LEFT JOIN analytics_events ae ON ae.property_id = p.id AND ae.event_type = 'property_view'
LEFT JOIN offers o ON o.property_id = p.id
LEFT JOIN reviews r ON r.property_id = p.id
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.title
ORDER BY views DESC
LIMIT 10;
```

---

## 📊 Performance Optimization

### Indexes

The schema includes 60+ indexes for optimal performance:

- **GiST indexes** for geospatial queries
- **GIN indexes** for JSONB and array searches
- **B-tree indexes** for common filters (status, dates, etc.)
- **Partial indexes** for specific conditions

### Query Optimization Tips

1. Use `select('*')` sparingly - select only needed columns
2. Use `.limit()` for large result sets
3. Leverage indexes with proper WHERE clauses
4. Use `.explain()` to analyze query plans
5. Consider materialized views for complex aggregations

---

## 🚀 Scaling Considerations

### Database Sizing

**Free Tier** (Supabase):
- 500 MB storage
- 2 GB bandwidth/month
- Good for: 0-1,000 users

**Pro Tier** ($25/month):
- 8 GB storage
- 50 GB bandwidth/month
- Good for: 1,000-10,000 users

**Production** ($599+/month):
- Dedicated resources
- Read replicas
- Good for: 10,000+ users

### Connection Pooling

```typescript
const supabase = createClient(url, key, {
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-connection-pooler': 'true' }
  }
});
```

---

## 🧪 Testing

### Sample Data

```sql
-- Insert test landlord
INSERT INTO landlords (user_id, business_name, verified)
VALUES (auth.uid(), 'Test Properties LLC', true);

-- Insert test property
INSERT INTO properties (
  landlord_id, title, description, location,
  city, country, property_type, bedrooms, bathrooms,
  price_per_night, amenities, status
)
VALUES (
  (SELECT id FROM landlords WHERE user_id = auth.uid()),
  'Test Villa',
  'Beautiful villa with ocean view',
  ST_SetSRID(ST_MakePoint(80.2210, 6.0535), 4326)::geography,
  'Unawatuna',
  'Sri Lanka',
  'villa',
  3,
  2,
  150.00,
  ARRAY['wifi', 'pool', 'kitchen'],
  'active'
);
```

---

## 📝 Maintenance

### Regular Tasks

```sql
-- Clean up expired requests (run daily)
SELECT auto_expire_old_requests();

-- Vacuum tables (run weekly)
VACUUM ANALYZE properties;
VACUUM ANALYZE rental_requests;
VACUUM ANALYZE offers;

-- Check index usage (monthly)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🆘 Troubleshooting

### Common Issues

**RLS blocking queries:**
```sql
-- Check current user
SELECT auth.uid();

-- Temporarily disable RLS (development only!)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
```

**Slow geospatial queries:**
```sql
-- Ensure PostGIS indexes exist
CREATE INDEX IF NOT EXISTS idx_properties_location 
ON properties USING GIST(location);
```

**Connection pool exhausted:**
- Use connection pooler mode
- Implement client-side connection pooling
- Upgrade to higher tier

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Manual](https://postgis.net/documentation/)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [TypeScript Supabase](https://supabase.com/docs/reference/javascript/typescript-support)

---

## 📄 License

MIT License - Use freely for commercial and non-commercial projects

---

## 🎯 Next Steps

1. ✅ Run `supabase_superbase_schema.sql` in your Supabase project
2. ✅ Copy types from `src/types/superbase.types.ts`
3. ✅ Update `.env` with your Supabase credentials
4. ✅ Test basic CRUD operations
5. ✅ Implement authentication flow
6. ✅ Build API endpoints using the functions
7. ✅ Add real-time subscriptions for live updates

**You're all set! 🚀**
