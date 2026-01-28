-- ================================================
-- UNMISSABLE RENTALS - SUPERBASE SCHEMA
-- Complete database architecture for rental platform
-- Version: 1.0
-- Date: 2026-01-27
-- ================================================

-- ================================================
-- EXTENSIONS
-- ================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable case-insensitive text (for emails, usernames)
CREATE EXTENSION IF NOT EXISTS citext;

-- ================================================
-- ENUMS (Type Safety)
-- ================================================

-- User roles
CREATE TYPE user_role AS ENUM ('client', 'landlord', 'admin');

-- User types
CREATE TYPE user_type AS ENUM ('tourist', 'crypto_nomad', 'long_term');

-- Property types
CREATE TYPE property_type AS ENUM ('villa', 'apartment', 'house', 'room', 'hostel', 'hotel', 'studio');

-- Task status
CREATE TYPE task_status AS ENUM ('draft', 'active', 'paused', 'closed', 'expired', 'archived');

-- Offer status
CREATE TYPE offer_status AS ENUM ('active', 'inactive', 'pending_verification', 'archived', 'deleted');

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- Message status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');

-- Verification methods
CREATE TYPE verification_method AS ENUM ('email', 'phone', 'id_scan', 'video_call', 'admin_manual');

-- ================================================
-- CORE TABLES
-- ================================================

-- ================================================
-- 1. USERS (Extended from auth.users)
-- ================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  
  -- Preferences
  preferred_locations TEXT[], -- ['Bali', 'Thailand', 'Sri Lanka']
  preferred_budget_min INTEGER,
  preferred_budget_max INTEGER,
  preferred_length_days INTEGER,
  preferred_property_types property_type[],
  
  -- OAuth & Social
  google_id VARCHAR(255) UNIQUE,
  telegram_id BIGINT UNIQUE,
  telegram_username VARCHAR(100),
  
  -- User Classification
  user_type user_type DEFAULT 'tourist',
  role user_role DEFAULT 'client',
  
  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Settings
  notification_email BOOLEAN DEFAULT TRUE,
  notification_telegram BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  language VARCHAR(5) DEFAULT 'en', -- 'en', 'ru', 'es'
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_telegram_id ON public.users(telegram_id) WHERE telegram_id IS NOT NULL;
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- ================================================
-- 2. LANDLORDS (Property Owners)
-- ================================================

CREATE TABLE public.landlords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Business Info
  business_name VARCHAR(255),
  company_registration VARCHAR(100),
  tax_id VARCHAR(100),
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_method verification_method,
  verification_notes TEXT,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Stats
  properties_count INTEGER DEFAULT 0,
  total_offers INTEGER DEFAULT 0,
  successful_deals INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0, -- Percentage
  average_response_time_minutes INTEGER DEFAULT 0,
  
  -- Subscription
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  subscription_auto_renew BOOLEAN DEFAULT FALSE,
  
  -- Premium Features
  featured_listings_remaining INTEGER DEFAULT 0,
  priority_support BOOLEAN DEFAULT FALSE,
  analytics_access BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  
  -- Contact
  primary_phone VARCHAR(20),
  primary_email CITEXT,
  whatsapp VARCHAR(20),
  website_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_landlords_user_id ON public.landlords(user_id);
CREATE INDEX idx_landlords_verified ON public.landlords(verified);
CREATE INDEX idx_landlords_subscription ON public.landlords(subscription_tier, subscription_ends_at);
CREATE INDEX idx_landlords_rating ON public.landlords(average_rating DESC);

-- ================================================
-- 3. PROPERTIES (User-submitted properties for rent)
-- ================================================

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS geography
  address TEXT,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  
  -- Property Details
  property_type property_type NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  total_area_sqm INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,
  
  -- Amenities & Features (JSONB for flexibility)
  amenities TEXT[] NOT NULL DEFAULT '{}', -- ['wifi', 'kitchen', 'workspace', 'pool', 'ac', 'parking']
  features JSONB NOT NULL DEFAULT '{
    "wifi": false,
    "wifi_speed_mbps": 0,
    "pool": false,
    "parking": false,
    "breakfast": false,
    "air_conditioning": false,
    "kitchen": false,
    "workspace": false,
    "pet_friendly": false,
    "security": false,
    "gym": false,
    "beach_access": false,
    "garden": false,
    "balcony": false,
    "elevator": false
  }'::jsonb,
  
  -- Pricing
  price_per_night NUMERIC(10,2),
  price_per_week NUMERIC(10,2),
  price_per_month NUMERIC(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  deposit_required NUMERIC(10,2),
  cleaning_fee NUMERIC(10,2),
  
  -- Availability
  available_from DATE,
  available_until DATE,
  minimum_stay_nights INTEGER DEFAULT 1,
  maximum_stay_nights INTEGER,
  
  -- Payment Options
  accepts_crypto BOOLEAN DEFAULT FALSE,
  crypto_currencies TEXT[], -- ['USDT', 'BTC', 'ETH']
  payment_methods TEXT[] DEFAULT '{"cash", "bank_transfer"}',
  
  -- Media
  images TEXT[] DEFAULT '{}', -- URLs to images
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- SEO & Links
  google_maps_url TEXT,
  booking_url TEXT,
  airbnb_url TEXT,
  
  -- Status & Verification
  status offer_status DEFAULT 'pending_verification',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Featured/Promoted
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  promoted_in_search BOOLEAN DEFAULT FALSE,
  
  -- Performance Metrics
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  last_booked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_properties_landlord_id ON public.properties(landlord_id);
CREATE INDEX idx_properties_location ON public.properties USING GIST(location);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_country ON public.properties(country);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price_per_night);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_featured ON public.properties(featured, featured_until) WHERE featured = TRUE;
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);

-- GiST index for amenities search
CREATE INDEX idx_properties_amenities ON public.properties USING GIN(amenities);

-- GIN index for JSONB features
CREATE INDEX idx_properties_features ON public.properties USING GIN(features);

-- ================================================
-- 4. RENTAL_REQUESTS (Client needs/tasks)
-- ================================================

CREATE TABLE public.rental_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100),
  search_radius_km INTEGER DEFAULT 5, -- Search radius in kilometers
  
  -- Dates
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  flexible_dates BOOLEAN DEFAULT FALSE,
  flexibility_days INTEGER DEFAULT 0, -- ±N days
  
  -- Computed field
  length_days INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  -- Preferences
  budget_per_night_min INTEGER,
  budget_per_night_max INTEGER,
  budget_per_month INTEGER,
  property_types property_type[],
  bedrooms_min INTEGER DEFAULT 1,
  bathrooms_min INTEGER DEFAULT 1,
  
  -- Required Amenities
  required_amenities TEXT[] DEFAULT '{}',
  preferred_amenities TEXT[] DEFAULT '{}',
  
  -- Special Requirements
  pets INTEGER DEFAULT 0,
  guests INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  special_requirements TEXT,
  
  -- Status & Distribution
  status task_status DEFAULT 'draft',
  posted_to_telegram BOOLEAN DEFAULT FALSE,
  posted_to_telegram_at TIMESTAMPTZ,
  telegram_message_id BIGINT,
  telegram_channel VARCHAR(100),
  
  -- Performance
  offers_received INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Payment (if freemium model)
  payment_required BOOLEAN DEFAULT FALSE,
  payment_status payment_status DEFAULT 'pending',
  payment_amount NUMERIC(10,2),
  paid_at TIMESTAMPTZ,
  
  -- Expiry
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (check_out + INTERVAL '7 days') STORED,
  auto_close_after_checkout BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_rental_requests_user_id ON public.rental_requests(user_id);
CREATE INDEX idx_rental_requests_location ON public.rental_requests USING GIST(location);
CREATE INDEX idx_rental_requests_status ON public.rental_requests(status);
CREATE INDEX idx_rental_requests_dates ON public.rental_requests(check_in, check_out);
CREATE INDEX idx_rental_requests_created_at ON public.rental_requests(created_at DESC);
CREATE INDEX idx_rental_requests_expires_at ON public.rental_requests(expires_at);
CREATE INDEX idx_rental_requests_budget ON public.rental_requests(budget_per_night_min, budget_per_night_max);

-- GIN index for amenities
CREATE INDEX idx_rental_requests_required_amenities ON public.rental_requests USING GIN(required_amenities);
CREATE INDEX idx_rental_requests_property_types ON public.rental_requests USING GIN(property_types);

-- ================================================
-- 5. OFFERS (Connections between properties and requests)
-- ================================================

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  
  -- Offer Details
  custom_message TEXT,
  custom_price_per_night NUMERIC(10,2),
  custom_price_per_month NUMERIC(10,2),
  discount_percentage NUMERIC(5,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  
  -- Landlord Contact (for direct connection)
  landlord_contact TEXT, -- Telegram username or phone
  contact_revealed_at TIMESTAMPTZ,
  
  -- Performance
  viewed_by_client BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX idx_offers_property_id ON public.offers(property_id);
CREATE INDEX idx_offers_request_id ON public.offers(request_id);
CREATE INDEX idx_offers_landlord_id ON public.offers(landlord_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_created_at ON public.offers(created_at DESC);

-- Unique constraint: one offer per property per request
CREATE UNIQUE INDEX idx_offers_unique_property_request ON public.offers(property_id, request_id);

-- ================================================
-- 6. MESSAGES (Communication between users)
-- ================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Participants
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Context
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'location', 'system'
  attachments TEXT[], -- URLs to attachments
  
  -- Status
  status message_status DEFAULT 'sent',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Telegram Integration
  telegram_message_id BIGINT,
  telegram_chat_id BIGINT,
  sent_via VARCHAR(20) DEFAULT 'platform', -- 'platform', 'telegram', 'email'
  
  -- System Messages
  is_system_message BOOLEAN DEFAULT FALSE,
  system_event_type VARCHAR(50), -- 'offer_created', 'offer_accepted', 'payment_received'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_from_user ON public.messages(from_user_id, created_at DESC);
CREATE INDEX idx_messages_to_user ON public.messages(to_user_id, created_at DESC);
CREATE INDEX idx_messages_offer_id ON public.messages(offer_id);
CREATE INDEX idx_messages_request_id ON public.messages(request_id);
CREATE INDEX idx_messages_unread ON public.messages(to_user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- ================================================
-- 7. CLIENT_MAPS (Personal maps for clients)
-- ================================================

CREATE TABLE public.client_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  
  -- Map Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Map Settings
  center_location GEOGRAPHY(POINT, 4326) NOT NULL,
  zoom_level INTEGER DEFAULT 12,
  map_style VARCHAR(50) DEFAULT 'streets', -- 'streets', 'satellite', 'terrain'
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  share_url TEXT,
  
  -- Performance
  views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_client_maps_user_id ON public.client_maps(user_id);
CREATE INDEX idx_client_maps_request_id ON public.client_maps(request_id);
CREATE INDEX idx_client_maps_share_token ON public.client_maps(share_token) WHERE share_token IS NOT NULL;

-- ================================================
-- 8. MAP_MARKERS (Offers on client maps)
-- ================================================

CREATE TABLE public.map_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID NOT NULL REFERENCES public.client_maps(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Marker Styling
  color VARCHAR(20) DEFAULT 'blue', -- 'blue', 'red', 'green', 'yellow'
  icon VARCHAR(50) DEFAULT 'home',
  size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
  
  -- Custom Info
  custom_label VARCHAR(100),
  custom_note TEXT,
  
  -- User Actions
  is_favorite BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_map_markers_map_id ON public.map_markers(map_id);
CREATE INDEX idx_map_markers_offer_id ON public.map_markers(offer_id);
CREATE INDEX idx_map_markers_property_id ON public.map_markers(property_id);
CREATE INDEX idx_map_markers_favorites ON public.map_markers(map_id, is_favorite) WHERE is_favorite = TRUE;

-- ================================================
-- 9. SUBSCRIPTIONS (Landlord subscriptions)
-- ================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  
  -- Subscription Details
  tier subscription_tier NOT NULL,
  price_amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_period VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'paused'
  
  -- Dates
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT TRUE,
  
  -- Payment
  payment_method VARCHAR(50), -- 'stripe', 'paypal', 'crypto', 'manual'
  payment_reference VARCHAR(255),
  next_billing_date DATE,
  
  -- Features Included
  features JSONB DEFAULT '{
    "max_properties": 10,
    "featured_listings": 3,
    "priority_support": false,
    "analytics": false,
    "api_access": false,
    "remove_branding": false
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_landlord_id ON public.subscriptions(landlord_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_ends_at ON public.subscriptions(ends_at);

-- ================================================
-- 10. PAYMENTS (Transaction history)
-- ================================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Payer
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  landlord_id UUID REFERENCES public.landlords(id) ON DELETE SET NULL,
  
  -- Payment Context
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
  
  -- Payment Details
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_type VARCHAR(50) NOT NULL, -- 'subscription', 'featured_listing', 'request_posting'
  
  -- Status
  status payment_status DEFAULT 'pending',
  
  -- Payment Method
  payment_method VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'crypto', 'manual'
  payment_provider_id VARCHAR(255), -- External payment ID
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_landlord_id ON public.payments(landlord_id);
CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- ================================================
-- 11. NOTIFICATIONS (User notifications)
-- ================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification Content
  type VARCHAR(50) NOT NULL, -- 'new_offer', 'message', 'subscription_expiring', 'request_expired'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Context
  related_offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  related_request_id UUID REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  related_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  related_property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Delivery
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_telegram BOOLEAN DEFAULT FALSE,
  sent_via_push BOOLEAN DEFAULT FALSE,
  
  -- Action
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- ================================================
-- 12. ANALYTICS_EVENTS (User actions & metrics)
-- ================================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Details
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'property_view', 'offer_created', 'message_sent'
  event_category VARCHAR(50), -- 'engagement', 'conversion', 'user_action'
  
  -- User Context
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id UUID,
  
  -- Related Entities
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  
  -- Event Metadata
  metadata JSONB,
  
  -- Source
  source VARCHAR(50), -- 'web', 'telegram', 'mobile_app', 'api'
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Technical
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100),
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Partitioning by month for better performance (optional, for high volume)
-- ALTER TABLE public.analytics_events PARTITION BY RANGE (created_at);

-- ================================================
-- 13. REVIEWS (Property reviews)
-- ================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  
  -- Detailed Ratings
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  
  -- Photos
  photos TEXT[],
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Response from Landlord
  landlord_response TEXT,
  landlord_responded_at TIMESTAMPTZ,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_landlord_id ON public.reviews(landlord_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Unique constraint: one review per user per property
CREATE UNIQUE INDEX idx_reviews_unique_user_property ON public.reviews(user_id, property_id);

-- ================================================
-- 14. SAVED_PROPERTIES (User favorites)
-- ================================================

CREATE TABLE public.saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saved_properties_user_id ON public.saved_properties(user_id, created_at DESC);
CREATE INDEX idx_saved_properties_property_id ON public.saved_properties(property_id);

-- Unique constraint
CREATE UNIQUE INDEX idx_saved_properties_unique ON public.saved_properties(user_id, property_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES: USERS
-- ================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ================================================
-- RLS POLICIES: LANDLORDS
-- ================================================

-- Landlords can view their own profile
CREATE POLICY "Landlords can view own profile"
  ON public.landlords FOR SELECT
  USING (auth.uid() = user_id);

-- Landlords can update their own profile
CREATE POLICY "Landlords can update own profile"
  ON public.landlords FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can create landlord profile
CREATE POLICY "Users can create landlord profile"
  ON public.landlords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view verified landlords (for ratings, etc.)
CREATE POLICY "Public can view verified landlords"
  ON public.landlords FOR SELECT
  USING (verified = TRUE);

-- ================================================
-- RLS POLICIES: PROPERTIES
-- ================================================

-- Landlords can view their own properties
CREATE POLICY "Landlords can view own properties"
  ON public.properties FOR SELECT
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Landlords can create properties
CREATE POLICY "Landlords can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Landlords can update own properties
CREATE POLICY "Landlords can update own properties"
  ON public.properties FOR UPDATE
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Landlords can delete own properties
CREATE POLICY "Landlords can delete own properties"
  ON public.properties FOR DELETE
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Public can view active properties
CREATE POLICY "Public can view active properties"
  ON public.properties FOR SELECT
  USING (status = 'active' AND verified_at IS NOT NULL);

-- ================================================
-- RLS POLICIES: RENTAL_REQUESTS
-- ================================================

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.rental_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
  ON public.rental_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own requests
CREATE POLICY "Users can update own requests"
  ON public.rental_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own requests
CREATE POLICY "Users can delete own requests"
  ON public.rental_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Landlords can view active requests (for matching)
CREATE POLICY "Landlords can view active requests"
  ON public.rental_requests FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM public.landlords 
      WHERE user_id = auth.uid() AND verified = TRUE
    )
  );

-- ================================================
-- RLS POLICIES: OFFERS
-- ================================================

-- Landlords can view their own offers
CREATE POLICY "Landlords can view own offers"
  ON public.offers FOR SELECT
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Clients can view offers for their requests
CREATE POLICY "Clients can view offers for own requests"
  ON public.offers FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.rental_requests WHERE user_id = auth.uid()
    )
  );

-- Landlords can create offers
CREATE POLICY "Landlords can create offers"
  ON public.offers FOR INSERT
  WITH CHECK (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Landlords can update own offers
CREATE POLICY "Landlords can update own offers"
  ON public.offers FOR UPDATE
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- Clients can update offer status (accept/reject)
CREATE POLICY "Clients can update offer status"
  ON public.offers FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM public.rental_requests WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES: MESSAGES
-- ================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = to_user_id);

-- ================================================
-- RLS POLICIES: CLIENT_MAPS
-- ================================================

-- Users can view their own maps
CREATE POLICY "Users can view own maps"
  ON public.client_maps FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view shared maps
CREATE POLICY "Public can view shared maps"
  ON public.client_maps FOR SELECT
  USING (is_public = TRUE);

-- Users can create maps
CREATE POLICY "Users can create maps"
  ON public.client_maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own maps
CREATE POLICY "Users can update own maps"
  ON public.client_maps FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own maps
CREATE POLICY "Users can delete own maps"
  ON public.client_maps FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES: MAP_MARKERS
-- ================================================

-- Users can view markers on their maps
CREATE POLICY "Users can view own map markers"
  ON public.map_markers FOR SELECT
  USING (
    map_id IN (
      SELECT id FROM public.client_maps WHERE user_id = auth.uid()
    )
  );

-- Users can add markers to their maps
CREATE POLICY "Users can add map markers"
  ON public.map_markers FOR INSERT
  WITH CHECK (
    map_id IN (
      SELECT id FROM public.client_maps WHERE user_id = auth.uid()
    )
  );

-- Users can update markers on their maps
CREATE POLICY "Users can update map markers"
  ON public.map_markers FOR UPDATE
  USING (
    map_id IN (
      SELECT id FROM public.client_maps WHERE user_id = auth.uid()
    )
  );

-- Users can delete markers from their maps
CREATE POLICY "Users can delete map markers"
  ON public.map_markers FOR DELETE
  USING (
    map_id IN (
      SELECT id FROM public.client_maps WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES: SUBSCRIPTIONS
-- ================================================

-- Landlords can view their own subscriptions
CREATE POLICY "Landlords can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES: PAYMENTS
-- ================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = user_id OR
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES: NOTIFICATIONS
-- ================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ================================================
-- RLS POLICIES: ANALYTICS_EVENTS
-- ================================================

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- ================================================
-- RLS POLICIES: REVIEWS
-- ================================================

-- Users can view all reviews
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Landlords can respond to reviews
CREATE POLICY "Landlords can respond to reviews"
  ON public.reviews FOR UPDATE
  USING (
    landlord_id IN (
      SELECT id FROM public.landlords WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- RLS POLICIES: SAVED_PROPERTIES
-- ================================================

-- Users can view their saved properties
CREATE POLICY "Users can view own saved properties"
  ON public.saved_properties FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save properties
CREATE POLICY "Users can save properties"
  ON public.saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete saved properties
CREATE POLICY "Users can delete saved properties"
  ON public.saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- ================================================
-- 1. Auto-update updated_at timestamp
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.landlords FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rental_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.client_maps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.map_markers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- 2. Auto-update landlord stats
-- ================================================

CREATE OR REPLACE FUNCTION public.update_landlord_properties_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.landlords
  SET properties_count = (
    SELECT COUNT(*) FROM public.properties WHERE landlord_id = NEW.landlord_id
  )
  WHERE id = NEW.landlord_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_landlord_stats_on_property_insert
  AFTER INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_landlord_properties_count();

CREATE TRIGGER update_landlord_stats_on_property_delete
  AFTER DELETE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_landlord_properties_count();

-- ================================================
-- 3. Auto-update property views counter
-- ================================================

CREATE OR REPLACE FUNCTION public.increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'property_view' AND NEW.property_id IS NOT NULL THEN
    UPDATE public.properties
    SET views_count = views_count + 1
    WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_views_on_analytics_event
  AFTER INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_property_views();

-- ================================================
-- 4. Auto-update rental request offers counter
-- ================================================

CREATE OR REPLACE FUNCTION public.update_request_offers_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rental_requests
  SET offers_received = (
    SELECT COUNT(*) FROM public.offers WHERE request_id = NEW.request_id
  )
  WHERE id = NEW.request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_request_offers_on_offer_insert
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_request_offers_count();

-- ================================================
-- 5. Create notification on new offer
-- ================================================

CREATE OR REPLACE FUNCTION public.create_notification_on_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_property_title TEXT;
BEGIN
  -- Get user_id from request
  SELECT user_id INTO v_user_id
  FROM public.rental_requests
  WHERE id = NEW.request_id;
  
  -- Get property title
  SELECT title INTO v_property_title
  FROM public.properties
  WHERE id = NEW.property_id;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_offer_id,
    related_request_id,
    related_property_id,
    action_url
  ) VALUES (
    v_user_id,
    'new_offer',
    'New Property Offer',
    'You have received a new offer for "' || v_property_title || '"',
    NEW.id,
    NEW.request_id,
    NEW.property_id,
    '/offers/' || NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_on_offer
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_new_offer();

-- ================================================
-- 6. Create notification on new message
-- ================================================

CREATE OR REPLACE FUNCTION public.create_notification_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_from_name TEXT;
BEGIN
  -- Skip system messages
  IF NEW.is_system_message THEN
    RETURN NEW;
  END IF;
  
  -- Get sender name
  SELECT COALESCE(first_name || ' ' || last_name, 'User') INTO v_from_name
  FROM public.users
  WHERE id = NEW.from_user_id;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_message_id,
    action_url
  ) VALUES (
    NEW.to_user_id,
    'message',
    'New Message from ' || v_from_name,
    LEFT(NEW.content, 100),
    NEW.id,
    '/messages/' || NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_new_message();

-- ================================================
-- 7. Update landlord average rating
-- ================================================

CREATE OR REPLACE FUNCTION public.update_landlord_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.landlords
  SET average_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.reviews
    WHERE landlord_id = NEW.landlord_id
  )
  WHERE id = NEW.landlord_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_landlord_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_landlord_rating();

-- ================================================
-- 8. Auto-expire requests after checkout date
-- ================================================

CREATE OR REPLACE FUNCTION public.auto_expire_old_requests()
RETURNS void AS $$
BEGIN
  UPDATE public.rental_requests
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW()
    AND auto_close_after_checkout = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily (via pg_cron or external scheduler)
-- SELECT cron.schedule('expire-old-requests', '0 0 * * *', 'SELECT public.auto_expire_old_requests()');

-- ================================================
-- 9. Generate share token for maps
-- ================================================

CREATE OR REPLACE FUNCTION public.generate_map_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = TRUE AND NEW.share_token IS NULL THEN
    NEW.share_token = encode(gen_random_bytes(32), 'hex');
    NEW.share_url = '/maps/shared/' || NEW.share_token;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_share_token_on_map_public
  BEFORE INSERT OR UPDATE ON public.client_maps
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_map_share_token();

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- ================================================
-- 10. Search properties by location and filters
-- ================================================

CREATE OR REPLACE FUNCTION public.search_properties(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 10,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_property_types property_type[] DEFAULT NULL,
  p_bedrooms_min INTEGER DEFAULT NULL,
  p_required_amenities TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  property_type property_type,
  price_per_night NUMERIC,
  bedrooms INTEGER,
  distance_km NUMERIC,
  images TEXT[],
  landlord_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.property_type,
    p.price_per_night,
    p.bedrooms,
    ROUND(
      ST_Distance(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 1000,
      2
    ) AS distance_km,
    p.images,
    l.verified AS landlord_verified
  FROM public.properties p
  JOIN public.landlords l ON p.landlord_id = l.id
  WHERE 
    p.status = 'active'
    AND p.verified_at IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
    AND (p_min_price IS NULL OR p.price_per_night >= p_min_price)
    AND (p_max_price IS NULL OR p.price_per_night <= p_max_price)
    AND (p_property_types IS NULL OR p.property_type = ANY(p_property_types))
    AND (p_bedrooms_min IS NULL OR p.bedrooms >= p_bedrooms_min)
    AND (p_required_amenities IS NULL OR p.amenities @> p_required_amenities)
  ORDER BY distance_km ASC, p.price_per_night ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- 11. Match properties to rental request
-- ================================================

CREATE OR REPLACE FUNCTION public.match_properties_to_request(
  p_request_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  property_id UUID,
  title TEXT,
  price_per_night NUMERIC,
  distance_km NUMERIC,
  match_score INTEGER
) AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Get request details
  SELECT * INTO v_request
  FROM public.rental_requests
  WHERE id = p_request_id;
  
  RETURN QUERY
  SELECT 
    p.id AS property_id,
    p.title,
    p.price_per_night,
    ROUND(
      ST_Distance(
        p.location::geography,
        v_request.location::geography
      ) / 1000,
      2
    ) AS distance_km,
    (
      -- Calculate match score (0-100)
      CASE 
        WHEN p.price_per_night BETWEEN COALESCE(v_request.budget_per_night_min, 0) 
          AND COALESCE(v_request.budget_per_night_max, 999999) THEN 30
        ELSE 0
      END +
      CASE 
        WHEN p.bedrooms >= v_request.bedrooms_min THEN 20
        ELSE 0
      END +
      CASE 
        WHEN p.amenities @> v_request.required_amenities THEN 30
        ELSE 0
      END +
      CASE 
        WHEN ST_Distance(p.location::geography, v_request.location::geography) / 1000 
          <= v_request.search_radius_km THEN 20
        ELSE 0
      END
    ) AS match_score
  FROM public.properties p
  JOIN public.landlords l ON p.landlord_id = l.id
  WHERE 
    p.status = 'active'
    AND p.verified_at IS NOT NULL
    AND l.verified = TRUE
    AND ST_DWithin(
      p.location::geography,
      v_request.location::geography,
      (v_request.search_radius_km * 1.5) * 1000 -- Search slightly wider
    )
  ORDER BY match_score DESC, distance_km ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- 12. Get unread messages count
-- ================================================

CREATE OR REPLACE FUNCTION public.get_unread_messages_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.messages
  WHERE to_user_id = p_user_id
    AND is_read = FALSE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- 13. Get user dashboard stats
-- ================================================

CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'active_requests', (
      SELECT COUNT(*) FROM public.rental_requests 
      WHERE user_id = p_user_id AND status = 'active'
    ),
    'total_offers_received', (
      SELECT COUNT(*) FROM public.offers o
      JOIN public.rental_requests r ON o.request_id = r.id
      WHERE r.user_id = p_user_id
    ),
    'unread_messages', (
      SELECT COUNT(*) FROM public.messages
      WHERE to_user_id = p_user_id AND is_read = FALSE
    ),
    'saved_properties', (
      SELECT COUNT(*) FROM public.saved_properties
      WHERE user_id = p_user_id
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================
-- 14. Get landlord dashboard stats
-- ================================================

CREATE OR REPLACE FUNCTION public.get_landlord_dashboard_stats(p_landlord_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_properties', (
      SELECT COUNT(*) FROM public.properties 
      WHERE landlord_id = p_landlord_id
    ),
    'active_properties', (
      SELECT COUNT(*) FROM public.properties 
      WHERE landlord_id = p_landlord_id AND status = 'active'
    ),
    'total_offers_sent', (
      SELECT COUNT(*) FROM public.offers
      WHERE landlord_id = p_landlord_id
    ),
    'pending_offers', (
      SELECT COUNT(*) FROM public.offers
      WHERE landlord_id = p_landlord_id AND status = 'pending'
    ),
    'accepted_offers', (
      SELECT COUNT(*) FROM public.offers
      WHERE landlord_id = p_landlord_id AND status = 'accepted'
    ),
    'average_rating', (
      SELECT COALESCE(average_rating, 0) FROM public.landlords
      WHERE id = p_landlord_id
    ),
    'total_reviews', (
      SELECT COUNT(*) FROM public.reviews
      WHERE landlord_id = p_landlord_id
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE;
-- ================================================
-- GRANTS (Permissions)
-- ================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_properties TO anon;

-- ================================================
-- REALTIME (Enable real-time subscriptions)
-- ================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_requests;

-- ================================================
-- COMMENTS (Documentation)
-- ================================================

COMMENT ON TABLE public.users IS 'Extended user profiles with preferences and OAuth data';
COMMENT ON TABLE public.landlords IS 'Property owners with verification and subscription info';
COMMENT ON TABLE public.properties IS 'Rental properties with location, pricing, and amenities';
COMMENT ON TABLE public.rental_requests IS 'Client rental requests/needs';
COMMENT ON TABLE public.offers IS 'Connections between properties and rental requests';
COMMENT ON TABLE public.messages IS 'Direct messages between users';
COMMENT ON TABLE public.client_maps IS 'Personal maps for clients to view offers';
COMMENT ON TABLE public.map_markers IS 'Property markers on client maps';
COMMENT ON TABLE public.subscriptions IS 'Landlord subscription plans';
COMMENT ON TABLE public.payments IS 'Payment transaction history';
COMMENT ON TABLE public.notifications IS 'User notifications';
COMMENT ON TABLE public.analytics_events IS 'Analytics and tracking events';
COMMENT ON TABLE public.reviews IS 'Property and landlord reviews';
COMMENT ON TABLE public.saved_properties IS 'User favorite properties';

-- ================================================
-- SCHEMA VERSION & METADATA
-- ================================================

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

INSERT INTO public.schema_migrations (version, description) 
VALUES ('1.0.0', 'Initial superbase schema - complete rental platform')
ON CONFLICT (version) DO NOTHING;

-- ================================================
-- END OF SCHEMA
-- ================================================
