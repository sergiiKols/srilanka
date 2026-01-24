/**
 * TypeScript types for POI validation with Google Maps
 */

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  website?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  price_level?: number;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1
  matchScore: number; // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
  placeDetails?: GooglePlaceDetails;
  distanceFromInput: number; // meters
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestedValue?: any;
}

export interface POIValidationRequest {
  coordinates: {
    lat: number;
    lng: number;
  };
  name?: string;
  address?: string;
  type?: string;
  expectedRadius?: number; // meters to search within
}

export interface NearbySearchResult {
  places: GooglePlaceDetails[];
  bestMatch?: GooglePlaceDetails;
  alternatives: GooglePlaceDetails[];
}

export type ValidationType = 'coordinates' | 'name' | 'address' | 'type' | 'comprehensive';

export interface ValidationConfig {
  types: ValidationType[];
  strictMode: boolean; // Fail on warnings
  maxDistanceMeters: number; // Maximum acceptable distance from expected location
  requireGoogleMatch: boolean; // Require a matching place in Google Maps
  minConfidence: number; // 0-1
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  types: ['coordinates', 'name', 'address'],
  strictMode: false,
  maxDistanceMeters: 100,
  requireGoogleMatch: true,
  minConfidence: 0.7,
};
