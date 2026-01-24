/**
 * API endpoint for POI validation
 * Used by test pages and external validation requests
 */

import type { APIRoute } from 'astro';
import { validatePOI } from '../../services/googleMapsValidation';
import type { POIValidationRequest, ValidationConfig } from '../../types/validation.types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const validationRequest: POIValidationRequest = {
      coordinates: body.coordinates,
      name: body.name,
      address: body.address,
      type: body.type,
      expectedRadius: body.expectedRadius,
    };

    const config: Partial<ValidationConfig> = {
      strictMode: body.config?.strictMode ?? false,
      maxDistanceMeters: body.config?.maxDistanceMeters ?? 100,
      requireGoogleMatch: body.config?.requireGoogleMatch ?? true,
      minConfidence: body.config?.minConfidence ?? 0.7,
    };

    const result = await validatePOI(validationRequest, config);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Validation API error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
