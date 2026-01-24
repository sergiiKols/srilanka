/**
 * TypeScript типы для AI интеграции
 */

export type PropertyType = 'villa' | 'apartment' | 'house' | 'room' | 'hostel' | 'hotel';
export type SecurityLevel = 'none' | 'standard' | 'high' | 'gated';
export type AreaName = 'Unawatuna' | 'Hikkaduwa' | 'Mirissa' | 'Weligama';
export type ImportStep = 1 | 2 | 3 | 'complete';

export interface Coordinates {
  lat: number;
  lng: number;
  placeName?: string;
}

export interface PropertyFeatures {
  pool: boolean;
  parking: boolean;
  breakfast: boolean;
  airConditioning: boolean;
  kitchen: boolean;
  petFriendly: boolean;
  security: SecurityLevel;
  beachfront: boolean;
  garden: boolean;
}

export interface AIAnalysisResult {
  title: string;
  propertyType: PropertyType;
  rooms: number;
  bathrooms: number;
  price: number | null;
  beachDistance: number;
  wifiSpeed: number;
  amenities: string[];
  features: PropertyFeatures;
  area: AreaName;
  cleanDescription: string;
  confidence: number;
}

export interface ImportState {
  step: ImportStep;
  coordinates: Coordinates | null;
  images: string[];
  imageUrls: string[];
  description: string;
  aiProcessing: boolean;
  aiResult: AIAnalysisResult | null;
  quickResult: Partial<AIAnalysisResult> | null;
  error: string | null;
  sources: string[];
}

export interface PropertyData {
  id: string;
  position: [number, number];
  title: string;
  price: string;
  rawPrice: number;
  rooms: number;
  bathrooms: number;
  beachDistance: number;
  area: AreaName;
  propertyType: PropertyType;
  wifiSpeed: number;
  pool: boolean;
  parking: boolean;
  breakfast: boolean;
  petFriendly: boolean;
  security: SecurityLevel;
  type: 'stay';
  description: string;
  amenities: string[];
  images: string[];
}
