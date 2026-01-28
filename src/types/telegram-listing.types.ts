/**
 * 🔥 TELEGRAM LISTING SYSTEM - TypeScript Types
 * Дата создания: 2026-01-27
 * Соответствует схеме: supabase_telegram_listing_schema.sql
 */

// ================================================
// ENUMS
// ================================================

export type PropertyType = 
  | 'villa' 
  | 'apartment' 
  | 'room' 
  | 'house' 
  | 'guesthouse' 
  | 'hostel';

export type ListingStatus = 
  | 'new' 
  | 'validated' 
  | 'published' 
  | 'expired' 
  | 'deleted';

export type ValidationStatus = 
  | 'pending' 
  | 'valid' 
  | 'invalid' 
  | 'incomplete';

export type Temperature = 
  | 'hot'    // 🔴 0-24h
  | 'warm'   // 🟠 24-72h
  | 'cool'   // 🟡 72-120h
  | 'cold';  // 🔵 120+h

export type GroupType = 
  | 'group' 
  | 'channel' 
  | 'supergroup';

export type ResponseStatus = 
  | 'new' 
  | 'processing' 
  | 'sent_to_client' 
  | 'accepted' 
  | 'rejected';

export type ChangeReason = 
  | 'auto_cooldown' 
  | 'manual' 
  | 'new_listing';

// ================================================
// TABLE: telegram_accounts
// ================================================

export interface TelegramAccount {
  id: string;
  
  // Основная информация
  phone_number: string;
  account_name: string | null;
  is_active: boolean;
  
  // Telegram API данные
  api_id: string;
  api_hash: string;
  session_string: string | null;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  
  // Статистика
  total_publications: number;
  daily_publications: number;
  daily_limit: number;
  
  notes: string | null;
}

export interface TelegramAccountInsert {
  phone_number: string;
  account_name?: string | null;
  is_active?: boolean;
  api_id: string;
  api_hash: string;
  session_string?: string | null;
  daily_limit?: number;
  notes?: string | null;
}

export interface TelegramAccountUpdate {
  account_name?: string | null;
  is_active?: boolean;
  api_hash?: string;
  session_string?: string | null;
  last_used_at?: string | null;
  total_publications?: number;
  daily_publications?: number;
  daily_limit?: number;
  notes?: string | null;
}

// ================================================
// TABLE: telegram_groups
// ================================================

export interface TelegramGroup {
  id: string;
  
  // Основная информация
  telegram_id: string;
  group_name: string;
  group_type: GroupType;
  
  // Настройки публикации
  is_active: boolean;
  auto_publish: boolean;
  priority: number;
  
  // Географические фильтры
  target_locations: string[] | null;
  
  // Фильтры по типу недвижимости
  allowed_property_types: string[] | null;
  min_price_monthly: number | null;
  max_price_monthly: number | null;
  
  // Статистика
  total_publications: number;
  last_publication_at: string | null;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  description: string | null;
  notes: string | null;
}

export interface TelegramGroupInsert {
  telegram_id: string;
  group_name: string;
  group_type?: GroupType;
  is_active?: boolean;
  auto_publish?: boolean;
  priority?: number;
  target_locations?: string[] | null;
  allowed_property_types?: string[] | null;
  min_price_monthly?: number | null;
  max_price_monthly?: number | null;
  description?: string | null;
  notes?: string | null;
}

export interface TelegramGroupUpdate {
  group_name?: string;
  group_type?: GroupType;
  is_active?: boolean;
  auto_publish?: boolean;
  priority?: number;
  target_locations?: string[] | null;
  allowed_property_types?: string[] | null;
  min_price_monthly?: number | null;
  max_price_monthly?: number | null;
  description?: string | null;
  notes?: string | null;
}

// ================================================
// TABLE: property_listings
// ================================================

export interface PropertyListing {
  id: string;
  
  // Связи
  client_request_id: string | null;
  user_id: string | null;
  
  // Основные данные
  property_type: PropertyType;
  price_monthly: number;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  
  // Характеристики
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  has_wifi: boolean;
  has_pool: boolean;
  has_parking: boolean;
  has_kitchen: boolean;
  has_air_conditioning: boolean;
  
  // Описание
  original_description: string | null;
  optimized_description: string | null;
  description_lang: string;
  
  // Медиа
  photos: string[] | null;
  video_url: string | null;
  
  // Контакты
  contact_name: string | null;
  contact_phone: string | null;
  contact_telegram: string | null;
  contact_whatsapp: string | null;
  
  // Статус
  status: ListingStatus;
  validation_status: ValidationStatus;
  validation_errors: Record<string, any> | null;
  
  // Температура
  temperature: Temperature;
  temperature_color: string;
  temperature_priority: number;
  temperature_changed_at: string;
  
  // Статистика
  views_count: number;
  responses_count: number;
  
  // Метаданные
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
  deleted_at: string | null;
  
  // Grok AI
  grok_optimization_attempted: boolean;
  grok_optimization_success: boolean;
  grok_optimization_at: string | null;
}

export interface PropertyListingInsert {
  client_request_id?: string | null;
  user_id?: string | null;
  property_type: PropertyType;
  price_monthly: number;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  has_wifi?: boolean;
  has_pool?: boolean;
  has_parking?: boolean;
  has_kitchen?: boolean;
  has_air_conditioning?: boolean;
  original_description?: string | null;
  optimized_description?: string | null;
  description_lang?: string;
  photos?: string[] | null;
  video_url?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_telegram?: string | null;
  contact_whatsapp?: string | null;
}

export interface PropertyListingUpdate {
  property_type?: PropertyType;
  price_monthly?: number;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  has_wifi?: boolean;
  has_pool?: boolean;
  has_parking?: boolean;
  has_kitchen?: boolean;
  has_air_conditioning?: boolean;
  original_description?: string | null;
  optimized_description?: string | null;
  photos?: string[] | null;
  video_url?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_telegram?: string | null;
  contact_whatsapp?: string | null;
  status?: ListingStatus;
  validation_status?: ValidationStatus;
  validation_errors?: Record<string, any> | null;
  temperature?: Temperature;
  temperature_priority?: number;
  temperature_color?: string;
  published_at?: string | null;
  expires_at?: string | null;
  deleted_at?: string | null;
  grok_optimization_attempted?: boolean;
  grok_optimization_success?: boolean;
  grok_optimization_at?: string | null;
}

// ================================================
// TABLE: listing_publications
// ================================================

export interface ListingPublication {
  id: string;
  
  // Связи
  listing_id: string;
  group_id: string;
  account_id: string;
  
  // Данные публикации
  telegram_message_id: number;
  message_text: string;
  message_lang: string;
  
  // Медиа
  has_photos: boolean;
  photos_count: number;
  
  // Статус
  is_active: boolean;
  deleted_at: string | null;
  
  // Статистика
  views_count: number;
  responses_count: number;
  
  // Метаданные
  published_at: string;
}

export interface ListingPublicationInsert {
  listing_id: string;
  group_id: string;
  account_id: string;
  telegram_message_id: number;
  message_text: string;
  message_lang?: string;
  has_photos?: boolean;
  photos_count?: number;
}

export interface ListingPublicationUpdate {
  is_active?: boolean;
  deleted_at?: string | null;
  views_count?: number;
  responses_count?: number;
}

// ================================================
// TABLE: landlord_responses
// ================================================

export interface LandlordResponse {
  id: string;
  
  // Связи
  listing_id: string;
  publication_id: string | null;
  
  // Данные арендодателя
  landlord_telegram_id: number | null;
  landlord_username: string | null;
  landlord_phone: string | null;
  landlord_name: string | null;
  
  // Данные объекта
  property_name: string | null;
  property_address: string | null;
  property_description: string | null;
  property_photos: string[] | null;
  
  // Условия
  price_monthly: number | null;
  available_from: string | null;
  min_rental_months: number;
  
  // Характеристики
  property_features: Record<string, any> | null;
  
  // Геолокация
  latitude: number | null;
  longitude: number | null;
  location_verified: boolean;
  
  // Статус валидации
  validation_status: ValidationStatus;
  validation_errors: Record<string, any> | null;
  required_fields: string[] | null;
  
  // Статус обработки
  status: ResponseStatus;
  sent_to_client: boolean;
  sent_at: string | null;
  
  // Персональная карта
  personal_map_generated: boolean;
  personal_map_url: string | null;
  
  // Оригинальное сообщение
  original_message: string | null;
  message_timestamp: string | null;
  
  // Метаданные
  created_at: string;
  updated_at: string;
}

export interface LandlordResponseInsert {
  listing_id: string;
  publication_id?: string | null;
  landlord_telegram_id?: number | null;
  landlord_username?: string | null;
  landlord_phone?: string | null;
  landlord_name?: string | null;
  property_name?: string | null;
  property_address?: string | null;
  property_description?: string | null;
  property_photos?: string[] | null;
  price_monthly?: number | null;
  available_from?: string | null;
  min_rental_months?: number;
  property_features?: Record<string, any> | null;
  latitude?: number | null;
  longitude?: number | null;
  original_message?: string | null;
  message_timestamp?: string | null;
}

export interface LandlordResponseUpdate {
  landlord_phone?: string | null;
  landlord_name?: string | null;
  property_name?: string | null;
  property_address?: string | null;
  property_description?: string | null;
  property_photos?: string[] | null;
  price_monthly?: number | null;
  available_from?: string | null;
  min_rental_months?: number;
  property_features?: Record<string, any> | null;
  latitude?: number | null;
  longitude?: number | null;
  location_verified?: boolean;
  validation_status?: ValidationStatus;
  validation_errors?: Record<string, any> | null;
  required_fields?: string[] | null;
  status?: ResponseStatus;
  sent_to_client?: boolean;
  sent_at?: string | null;
  personal_map_generated?: boolean;
  personal_map_url?: string | null;
}

// ================================================
// TABLE: temperature_change_log
// ================================================

export interface TemperatureChangeLog {
  id: string;
  listing_id: string;
  old_temperature: Temperature | null;
  new_temperature: Temperature;
  old_priority: number | null;
  new_priority: number;
  change_reason: ChangeReason;
  changed_by: string | null;
  changed_at: string;
}

export interface TemperatureChangeLogInsert {
  listing_id: string;
  old_temperature?: Temperature | null;
  new_temperature: Temperature;
  old_priority?: number | null;
  new_priority: number;
  change_reason?: ChangeReason;
  changed_by?: string | null;
}

// ================================================
// FUNCTION RETURN TYPES
// ================================================

export interface CoolDownResult {
  listing_id: string;
  old_temp: Temperature;
  new_temp: Temperature;
  hours_elapsed: number;
}

export interface ValidationResult {
  is_valid: boolean;
  validation_errors: Record<string, any>;
  missing_fields: string[];
}

// ================================================
// HELPER TYPES
// ================================================

export interface TemperatureConfig {
  temperature: Temperature;
  color: string;
  priority: number;
  minHours: number;
  maxHours: number | null;
  label: string;
  emoji: string;
}

export const TEMPERATURE_CONFIG: Record<Temperature, TemperatureConfig> = {
  hot: {
    temperature: 'hot',
    color: '#FF0000',
    priority: 4,
    minHours: 0,
    maxHours: 24,
    label: 'Горячий',
    emoji: '🔴'
  },
  warm: {
    temperature: 'warm',
    color: '#FFA500',
    priority: 3,
    minHours: 24,
    maxHours: 72,
    label: 'Тёплый',
    emoji: '🟠'
  },
  cool: {
    temperature: 'cool',
    color: '#FFFF00',
    priority: 2,
    minHours: 72,
    maxHours: 120,
    label: 'Прохладный',
    emoji: '🟡'
  },
  cold: {
    temperature: 'cold',
    color: '#0000FF',
    priority: 1,
    minHours: 120,
    maxHours: null,
    label: 'Холодный',
    emoji: '🔵'
  }
};

// ================================================
// API REQUEST/RESPONSE TYPES
// ================================================

export interface CreateListingRequest {
  property_type: PropertyType;
  price_monthly: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  features?: {
    wifi?: boolean;
    pool?: boolean;
    parking?: boolean;
    kitchen?: boolean;
    air_conditioning?: boolean;
  };
  description: string;
  photos?: string[];
  video_url?: string;
  contact?: {
    name?: string;
    phone?: string;
    telegram?: string;
    whatsapp?: string;
  };
}

export interface PublishListingRequest {
  listing_id: string;
  group_ids?: string[]; // Если не указано - во все active+auto_publish группы
  optimize_with_grok?: boolean; // Использовать Grok AI для оптимизации
}

export interface PublishListingResponse {
  success: boolean;
  listing_id: string;
  publications: Array<{
    group_id: string;
    group_name: string;
    telegram_message_id: number;
    published_at: string;
  }>;
  errors?: Array<{
    group_id: string;
    error: string;
  }>;
}

export interface DeleteListingRequest {
  listing_id: string;
  delete_from_telegram?: boolean; // Удалить также из Telegram групп
}

export interface LandlordResponseSubmit {
  listing_id: string;
  landlord_data: {
    telegram_id?: number;
    username?: string;
    phone?: string;
    name?: string;
  };
  property_data: {
    name?: string;
    address?: string;
    description?: string;
    photos?: string[];
    price_monthly?: number;
    available_from?: string;
    features?: Record<string, any>;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  original_message?: string;
}
