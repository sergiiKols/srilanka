/**
 * POI Validator Component
 * Validates POI coordinates and information against Google Maps
 */

import { useState, useEffect } from 'react';
import type {
  POIValidationRequest,
  ValidationResult,
  ValidationConfig,
} from '../types/validation.types';
import { validatePOI } from '../services/googleMapsValidation';

interface POIValidatorProps {
  coordinates: { lat: number; lng: number };
  name?: string;
  address?: string;
  type?: string;
  config?: Partial<ValidationConfig>;
  onValidationComplete?: (result: ValidationResult) => void;
  autoValidate?: boolean;
  showDetails?: boolean;
}

export default function POIValidator({
  coordinates,
  name,
  address,
  type,
  config,
  onValidationComplete,
  autoValidate = false,
  showDetails = true,
}: POIValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performValidation = async () => {
    setIsValidating(true);
    setError(null);

    const request: POIValidationRequest = {
      coordinates,
      name,
      address,
      type,
    };

    try {
      const result = await validatePOI(request, config);
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (autoValidate && coordinates.lat && coordinates.lng) {
      performValidation();
    }
  }, [coordinates.lat, coordinates.lng, name, address, type, autoValidate]);

  const getStatusColor = (isValid: boolean, confidence: number) => {
    if (!isValid) return 'text-red-600 bg-red-50 border-red-200';
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-700 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  return (
    <div className="poi-validator w-full">
      {/* Validation Button */}
      {!autoValidate && (
        <button
          onClick={performValidation}
          disabled={isValidating || !coordinates.lat || !coordinates.lng}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Validating with Google Maps...
            </span>
          ) : (
            '🔍 Validate POI with Google Maps'
          )}
        </button>
      )}

      {/* Auto-validate indicator */}
      {autoValidate && isValidating && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span className="animate-spin">⏳</span>
          <span>Auto-validating...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>❌ Validation Error:</strong> {error}
        </div>
      )}

      {/* Validation Results */}
      {validationResult && showDetails && (
        <div className="mt-4 space-y-3">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              validationResult.isValid,
              validationResult.confidence
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">
                {validationResult.isValid ? '✅ Valid' : '❌ Invalid'}
              </span>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Confidence: {Math.round(validationResult.confidence * 100)}%
                </div>
                {validationResult.matchScore > 0 && (
                  <div className="text-sm">
                    Match: {Math.round(validationResult.matchScore)}%
                  </div>
                )}
              </div>
            </div>

            {validationResult.distanceFromInput > 0 && (
              <div className="text-sm mt-1">
                📍 Distance from nearest match: {Math.round(validationResult.distanceFromInput)}m
              </div>
            )}
          </div>

          {/* Place Details */}
          {validationResult.placeDetails && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                📍 Google Maps Match
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {validationResult.placeDetails.name}
                </div>
                <div>
                  <strong>Address:</strong> {validationResult.placeDetails.formatted_address}
                </div>
                <div>
                  <strong>Coordinates:</strong>{' '}
                  {validationResult.placeDetails.geometry.location.lat.toFixed(6)},{' '}
                  {validationResult.placeDetails.geometry.location.lng.toFixed(6)}
                </div>
                {validationResult.placeDetails.rating && (
                  <div>
                    <strong>Rating:</strong> ⭐ {validationResult.placeDetails.rating}/5
                    {validationResult.placeDetails.user_ratings_total && (
                      <span className="text-gray-600">
                        {' '}
                        ({validationResult.placeDetails.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                )}
                {validationResult.placeDetails.types && (
                  <div>
                    <strong>Types:</strong>{' '}
                    {validationResult.placeDetails.types.slice(0, 3).join(', ')}
                  </div>
                )}
                {validationResult.placeDetails.website && (
                  <div>
                    <strong>Website:</strong>{' '}
                    <a
                      href={validationResult.placeDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {validationResult.placeDetails.website}
                    </a>
                  </div>
                )}
                {validationResult.placeDetails.international_phone_number && (
                  <div>
                    <strong>Phone:</strong>{' '}
                    {validationResult.placeDetails.international_phone_number}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues */}
          {validationResult.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Issues Found:</h4>
              {validationResult.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    <span>{getSeverityIcon(issue.severity)}</span>
                    <div className="flex-1">
                      <div className="font-medium">
                        {issue.field.charAt(0).toUpperCase() + issue.field.slice(1)}
                      </div>
                      <div className="text-sm">{issue.message}</div>
                      {issue.suggestedValue && (
                        <div className="text-sm mt-1">
                          <strong>Suggested:</strong>{' '}
                          {typeof issue.suggestedValue === 'object'
                            ? JSON.stringify(issue.suggestedValue)
                            : issue.suggestedValue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Suggestions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Compact View */}
      {validationResult && !showDetails && (
        <div className="mt-2 text-sm">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getStatusColor(
              validationResult.isValid,
              validationResult.confidence
            )}`}
          >
            {validationResult.isValid ? '✅' : '❌'}
            {validationResult.isValid ? 'Valid' : 'Invalid'} (
            {Math.round(validationResult.confidence * 100)}% confidence)
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact POI Validation Badge
 * Shows just the validation status without details
 */
export function POIValidationBadge({
  validationResult,
}: {
  validationResult: ValidationResult | null;
}) {
  if (!validationResult) return null;

  const getStatusColor = (isValid: boolean, confidence: number) => {
    if (!isValid) return 'bg-red-100 text-red-700 border-red-300';
    if (confidence >= 0.8) return 'bg-green-100 text-green-700 border-green-300';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getStatusColor(
        validationResult.isValid,
        validationResult.confidence
      )}`}
      title={`Confidence: ${Math.round(validationResult.confidence * 100)}%`}
    >
      {validationResult.isValid ? '✅' : '❌'}
      <span className="font-medium">
        {Math.round(validationResult.confidence * 100)}%
      </span>
    </div>
  );
}
