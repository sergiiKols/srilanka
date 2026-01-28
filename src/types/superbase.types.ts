/**
 * UNMISSABLE RENTALS - Complete Database Types
 * Generated from supabase_superbase_schema.sql
 * Version: 1.0.0
 */

// ================================================
// ENUMS
// ================================================

export type UserRole = 'client' | 'landlord' | 'admin';

export type UserType = 'tourist' | 'crypto_nomad' | 'long_term';

export type PropertyType = 
  | 'villa' 
  | 'apartment' 
  | 'house' 
  | 'room' 
  | 'hostel' 
  | 'hotel' 
  | 'studio';

export type TaskStatus = 
  | 'draft' 
  | 'active' 
  | 'paused' 
  | 'closed' 
  | 'expired' 
  | 'archived';

export type OfferStatus = 
  | 'active' 
  | 'inactive' 
  | 'pending_verification' 
  | 'archived' 
  | 'deleted';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type VerificationMethod = 
  | 'email' 
  | 'phone' 
  | 'id_scan' 
  | 'video_call' 
  | 'admin_manual';

// ================================================
// TABLE TYPES
// ================================================

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  preferred_locations?: string[];
  preferred_budget_min?: number;
  preferred_budget_max?: number;
  preferred_length_days?: number;
  preferred_property_types?: PropertyType[];
  google_id?: string;
  telegram_id?: number;
  telegram_username?: string;
  user_type: UserType;
  role: UserRole;
  email_verified: boolean;
  phone_verified: boolean;
  verified_at?: string;
  notification_email: boolean;
  notification_telegram: boolean;
  notification_push: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_seen_at?: string;
}

export interface Landlord {
  id: string;
  user_id: string;
  business_name?: string;
  company_registration?: string;
  tax_id?: string;
  verified: boolean;
  verified_at?: string;
  verification_method?: VerificationMethod;
  verification_notes?: string;
  verified_by?: string;
  properties_count: number;
  total_offers: number;
  successful_deals: number;
  average_rating: number;
  response_rate: number;
  average_response_time_minutes: number;
  subscription_tier: SubscriptionTier;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  subscription_auto_renew: boolean;
  featured_listings_remaining: number;
  priority_support: boolean;
  analytics_access: boolean;
  api_access: boolean;
  primary_phone?: string;
  primary_email?: string;
  whatsapp?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFeatures {
  wifi: boolean;
  wifi_speed_mbps: number;
  pool: boolean;
  parking: boolean;
  breakfast: boolean;
  air_conditioning: boolean;
  kitchen: boolean;
  workspace: boolean;
  pet_friendly: boolean;
  security: boolean;
  gym: boolean;
  beach_access: boolean;
  garden: boolean;
  balcony: boolean;
  elevator: boolean;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  location: [number, number]; // [lng, lat] for PostGIS
  address?: string;
  city: string;
  region?: string;
  country: string;
  postal_code?: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  total_area_sqm?: number;
  floor_number?: number;
  total_floors?: number;
  amenities: string[];
  features: PropertyFeatures;
  price_per_night?: number;
  price_per_week?: number;
  price_per_month?: number;
  currency: string;
  deposit_required?: number;
  cleaning_fee?: number;
  available_from?: string;
  available_until?: string;
  minimum_stay_nights: number;
  maximum_stay_nights?: number;
  accepts_crypto: boolean;
  crypto_currencies?: string[];
  payment_methods: string[];
  images: string[];
  video_url?: string;
  virtual_tour_url?: string;
  google_maps_url?: string;
  booking_url?: string;
  airbnb_url?: string;
  status: OfferStatus;
  verified_at?: string;
  verified_by?: string;
  featured: boolean;
  featured_until?: string;
  promoted_in_search: boolean;
  views_count: number;
  inquiries_count: number;
  bookings_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  last_booked_at?: string;
}

export interface RentalRequest {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location: [number, number]; // [lng, lat]
  city?: string;
  region?: string;
  country?: string;
  search_radius_km: number;
  check_in: string;
  check_out: string;
  flexible_dates: boolean;
  flexibility_days: number;
  length_days: number; // Computed field
  budget_per_night_min?: number;
  budget_per_night_max?: number;
  budget_per_month?: number;
  property_types?: PropertyType[];
  bedrooms_min: number;
  bathrooms_min: number;
  required_amenities: string[];
  preferred_amenities: string[];
  pets: number;
  guests: number;
  children: number;
  special_requirements?: string;
  status: TaskStatus;
  posted_to_telegram: boolean;
  posted_to_telegram_at?: string;
  telegram_message_id?: number;
  telegram_channel?: string;
  offers_received: number;
  views_count: number;
  payment_required: boolean;
  payment_status: PaymentStatus;
  payment_amount?: number;
  paid_at?: string;
  expires_at: string; // Computed field
  auto_close_after_checkout: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
}

export interface Offer {
  id: string;
  property_id: string;
  request_id: string;
  landlord_id: string;
  custom_message?: string;
  custom_price_per_night?: number;
  custom_price_per_month?: number;
  discount_percentage?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  landlord_contact?: string;
  contact_revealed_at?: string;
  viewed_by_client: boolean;
  viewed_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  offer_id?: string;
  request_id?: string;
  property_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'location' | 'system';
  attachments?: string[];
  status: MessageStatus;
  is_read: boolean;
  read_at?: string;
  telegram_message_id?: number;
  telegram_chat_id?: number;
  sent_via: 'platform' | 'telegram' | 'email';
  is_system_message: boolean;
  system_event_type?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMap {
  id: string;
  user_id: string;
  request_id?: string;
  title: string;
  description?: string;
  center_location: [number, number]; // [lng, lat]
  zoom_level: number;
  map_style: 'streets' | 'satellite' | 'terrain';
  is_public: boolean;
  share_token?: string;
  share_url?: string;
  views_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MapMarker {
  id: string;
  map_id: string;
  offer_id: string;
  property_id: string;
  color: string;
  icon: string;
  size: 'small' | 'medium' | 'large';
  custom_label?: string;
  custom_note?: string;
  is_favorite: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeatures {
  max_properties: number;
  featured_listings: number;
  priority_support: boolean;
  analytics: boolean;
  api_access: boolean;
  remove_branding: boolean;
}

export interface Subscription {
  id: string;
  landlord_id: string;
  tier: SubscriptionTier;
  price_amount: number;
  currency: string;
  billing_period: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  starts_at: string;
  ends_at: string;
  cancelled_at?: string;
  auto_renew: boolean;
  payment_method?: string;
  payment_reference?: string;
  next_billing_date?: string;
  features: SubscriptionFeatures;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id?: string;
  landlord_id?: string;
  subscription_id?: string;
  request_id?: string;
  amount: number;
  currency: string;
  payment_type: 'subscription' | 'featured_listing' | 'request_posting';
  status: PaymentStatus;
  payment_method: string;
  payment_provider_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
  refunded_at?: string;
  cancelled_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_offer_id?: string;
  related_request_id?: string;
  related_message_id?: string;
  related_property_id?: string;
  is_read: boolean;
  read_at?: string;
  sent_via_email: boolean;
  sent_via_telegram: boolean;
  sent_via_push: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_category?: string;
  user_id?: string;
  session_id?: string;
  property_id?: string;
  request_id?: string;
  offer_id?: string;
  metadata?: Record<string, any>;
  source?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  landlord_id: string;
  rating: number;
  title?: string;
  comment?: string;
  cleanliness_rating?: number;
  location_rating?: number;
  value_rating?: number;
  communication_rating?: number;
  photos?: string[];
  is_verified: boolean;
  is_featured: boolean;
  landlord_response?: string;
  landlord_responded_at?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  notes?: string;
  created_at: string;
}

// ================================================
// FUNCTION RETURN TYPES
// ================================================

export interface PropertySearchResult {
  id: string;
  title: string;
  property_type: PropertyType;
  price_per_night: number;
  bedrooms: number;
  distance_km: number;
  images: string[];
  landlord_verified: boolean;
}

export interface PropertyMatchResult {
  property_id: string;
  title: string;
  price_per_night: number;
  distance_km: number;
  match_score: number;
}

export interface UserDashboardStats {
  active_requests: number;
  total_offers_received: number;
  unread_messages: number;
  saved_properties: number;
}

export interface LandlordDashboardStats {
  total_properties: number;
  active_properties: number;
  total_offers_sent: number;
  pending_offers: number;
  accepted_offers: number;
  average_rating: number;
  total_reviews: number;
}

// ================================================
// INSERT/UPDATE TYPES (without computed fields)
// ================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<UserInsert>;

export type LandlordInsert = Omit<Landlord, 'id' | 'created_at' | 'updated_at' | 'properties_count' | 'total_offers' | 'successful_deals' | 'average_rating' | 'response_rate' | 'average_response_time_minutes'>;
export type LandlordUpdate = Partial<LandlordInsert>;

export type PropertyInsert = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'inquiries_count' | 'bookings_count'>;
export type PropertyUpdate = Partial<PropertyInsert>;

export type RentalRequestInsert = Omit<RentalRequest, 'id' | 'created_at' | 'updated_at' | 'length_days' | 'expires_at' | 'offers_received' | 'views_count'>;
export type RentalRequestUpdate = Partial<RentalRequestInsert>;

export type OfferInsert = Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'viewed_by_client'>;
export type OfferUpdate = Partial<OfferInsert>;

export type MessageInsert = Omit<Message, 'id' | 'created_at' | 'updated_at'>;
export type MessageUpdate = Partial<Pick<Message, 'is_read' | 'read_at' | 'status'>>;

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_count' | 'not_helpful_count'>;
export type ReviewUpdate = Partial<ReviewInsert>;

// ================================================
// DATABASE TYPE (for Supabase client)
// ================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      landlords: {
        Row: Landlord;
        Insert: LandlordInsert;
        Update: LandlordUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      rental_requests: {
        Row: RentalRequest;
        Insert: RentalRequestInsert;
        Update: RentalRequestUpdate;
      };
      offers: {
        Row: Offer;
        Insert: OfferInsert;
        Update: OfferUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      client_maps: {
        Row: ClientMap;
        Insert: Omit<ClientMap, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<ClientMap>;
      };
      map_markers: {
        Row: MapMarker;
        Insert: Omit<MapMarker, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<MapMarker>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Subscription>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at'>;
        Update: Partial<Payment>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Notification>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<AnalyticsEvent>;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      saved_properties: {
        Row: SavedProperty;
        Insert: Omit<SavedProperty, 'id' | 'created_at'>;
        Update: Partial<SavedProperty>;
      };
    };
    Functions: {
      search_properties: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_km?: number;
          p_min_price?: number;
          p_max_price?: number;
          p_property_types?: PropertyType[];
          p_bedrooms_min?: number;
          p_required_amenities?: string[];
          p_limit?: number;
        };
        Returns: PropertySearchResult[];
      };
      match_properties_to_request: {
        Args: {
          p_request_id: string;
          p_limit?: number;
        };
        Returns: PropertyMatchResult[];
      };
      get_unread_messages_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_dashboard_stats: {
        Args: { p_user_id: string };
        Returns: UserDashboardStats;
      };
      get_landlord_dashboard_stats: {
        Args: { p_landlord_id: string };
        Returns: LandlordDashboardStats;
      };
    };
  };
}
