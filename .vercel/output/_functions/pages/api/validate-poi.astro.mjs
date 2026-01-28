export { r as renderers } from '../../chunks/_@astro-renderers_1ISMqT13.mjs';

const DEFAULT_VALIDATION_CONFIG = {
  types: ["coordinates", "name", "address"],
  strictMode: false,
  maxDistanceMeters: 100,
  requireGoogleMatch: true,
  minConfidence: 0.7
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBpBqHcyk_X-ocdmmJzWZO-Ma0KJA3WeYw";
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function calculateStringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}
async function searchNearbyPlaces(request) {
  const { coordinates, name, type, expectedRadius = 100 } = request;
  const radius = Math.min(expectedRadius, 500);
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${coordinates.lat},${coordinates.lng}`);
  url.searchParams.set("radius", radius.toString());
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  if (type) {
    url.searchParams.set("type", type);
  }
  if (name) {
    url.searchParams.set("keyword", name);
  }
  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    const places = data.results || [];
    let bestMatch;
    let bestScore = 0;
    if (name && places.length > 0) {
      for (const place of places) {
        const nameSimilarity = calculateStringSimilarity(name, place.name);
        const distance = calculateDistance(
          coordinates.lat,
          coordinates.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        const proximityScore = Math.max(0, 1 - distance / radius);
        const score = nameSimilarity * 0.7 + proximityScore * 0.3;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = place;
        }
      }
    } else if (places.length > 0) {
      bestMatch = places[0];
    }
    const alternatives = places.filter((p) => p.place_id !== bestMatch?.place_id);
    return {
      places,
      bestMatch,
      alternatives
    };
  } catch (error) {
    console.error("Error searching nearby places:", error);
    throw error;
  }
}
async function getPlaceDetails(placeId) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "place_id,name,formatted_address,geometry,rating,user_ratings_total,types,photos,website,international_phone_number,opening_hours,reviews,price_level");
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    return data.result;
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
}
async function validateCoordinates(lat, lng) {
  const issues = [];
  if (lat < -90 || lat > 90) {
    issues.push({
      severity: "error",
      field: "latitude",
      message: `Invalid latitude: ${lat}. Must be between -90 and 90.`
    });
  }
  if (lng < -180 || lng > 180) {
    issues.push({
      severity: "error",
      field: "longitude",
      message: `Invalid longitude: ${lng}. Must be between -180 and 180.`
    });
  }
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.status === "ZERO_RESULTS") {
      issues.push({
        severity: "warning",
        field: "coordinates",
        message: "Coordinates do not correspond to a known location."
      });
    } else if (data.status !== "OK") {
      issues.push({
        severity: "warning",
        field: "coordinates",
        message: `Could not verify coordinates: ${data.status}`
      });
    }
  } catch (error) {
    issues.push({
      severity: "info",
      field: "coordinates",
      message: "Could not verify coordinates with Google Maps."
    });
  }
  return {
    isValid: !issues.some((i) => i.severity === "error"),
    issues
  };
}
async function validatePOI(request, config = {}) {
  const finalConfig = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  const issues = [];
  const suggestions = [];
  let matchScore = 0;
  let confidence = 0;
  let placeDetails;
  let distanceFromInput = 0;
  if (finalConfig.types.includes("coordinates")) {
    const coordValidation = await validateCoordinates(
      request.coordinates.lat,
      request.coordinates.lng
    );
    issues.push(...coordValidation.issues);
  }
  try {
    const searchResult = await searchNearbyPlaces(request);
    if (searchResult.bestMatch) {
      placeDetails = await getPlaceDetails(searchResult.bestMatch.place_id);
      distanceFromInput = calculateDistance(
        request.coordinates.lat,
        request.coordinates.lng,
        placeDetails.geometry.location.lat,
        placeDetails.geometry.location.lng
      );
      if (distanceFromInput > finalConfig.maxDistanceMeters) {
        issues.push({
          severity: "warning",
          field: "coordinates",
          message: `Location is ${Math.round(distanceFromInput)}m away from nearest matching place.`,
          suggestedValue: {
            lat: placeDetails.geometry.location.lat,
            lng: placeDetails.geometry.location.lng
          }
        });
        suggestions.push(`Consider using coordinates: ${placeDetails.geometry.location.lat}, ${placeDetails.geometry.location.lng}`);
      }
      if (request.name && finalConfig.types.includes("name")) {
        const nameSimilarity = calculateStringSimilarity(request.name, placeDetails.name);
        matchScore = nameSimilarity * 100;
        if (nameSimilarity < 0.5) {
          issues.push({
            severity: "warning",
            field: "name",
            message: `Name "${request.name}" doesn't match found place "${placeDetails.name}"`,
            suggestedValue: placeDetails.name
          });
          suggestions.push(`Consider using name: "${placeDetails.name}"`);
        } else if (nameSimilarity < 0.8) {
          suggestions.push(`Similar place found: "${placeDetails.name}"`);
        }
      } else {
        matchScore = 70;
      }
      if (request.address && finalConfig.types.includes("address")) {
        const addressSimilarity = calculateStringSimilarity(
          request.address,
          placeDetails.formatted_address
        );
        if (addressSimilarity < 0.5) {
          issues.push({
            severity: "info",
            field: "address",
            message: "Address differs from Google Maps data",
            suggestedValue: placeDetails.formatted_address
          });
        }
      }
      const hasHighRating = (placeDetails.rating || 0) >= 4;
      const hasEnoughReviews = (placeDetails.user_ratings_total || 0) >= 5;
      const hasPhotos = (placeDetails.photos?.length || 0) > 0;
      confidence = 0.4;
      if (matchScore > 80) confidence += 0.3;
      else if (matchScore > 60) confidence += 0.2;
      else if (matchScore > 40) confidence += 0.1;
      if (distanceFromInput < 50) confidence += 0.2;
      else if (distanceFromInput < 100) confidence += 0.1;
      if (hasHighRating) confidence += 0.05;
      if (hasEnoughReviews) confidence += 0.05;
      if (hasPhotos) confidence += 0.05;
    } else if (finalConfig.requireGoogleMatch) {
      issues.push({
        severity: "error",
        field: "general",
        message: "No matching place found in Google Maps"
      });
      suggestions.push("Check coordinates and place name");
      confidence = 0;
    } else {
      confidence = 0.3;
      suggestions.push("No matching place found in Google Maps - manual verification recommended");
    }
    if (searchResult.alternatives.length > 0) {
      const altNames = searchResult.alternatives.slice(0, 3).map((p) => p.name).join(", ");
      suggestions.push(`Nearby alternatives: ${altNames}`);
    }
  } catch (error) {
    issues.push({
      severity: "error",
      field: "general",
      message: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    });
    confidence = 0;
  }
  const hasErrors = issues.some((i) => i.severity === "error");
  const hasWarnings = issues.some((i) => i.severity === "warning");
  const meetsConfidence = confidence >= finalConfig.minConfidence;
  const isValid = !hasErrors && meetsConfidence && (!finalConfig.strictMode || !hasWarnings);
  return {
    isValid,
    confidence,
    matchScore,
    issues,
    suggestions,
    placeDetails,
    distanceFromInput
  };
}

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const validationRequest = {
      coordinates: body.coordinates,
      name: body.name,
      address: body.address,
      type: body.type,
      expectedRadius: body.expectedRadius
    };
    const config = {
      strictMode: body.config?.strictMode ?? false,
      maxDistanceMeters: body.config?.maxDistanceMeters ?? 100,
      requireGoogleMatch: body.config?.requireGoogleMatch ?? true,
      minConfidence: body.config?.minConfidence ?? 0.7
    };
    const result = await validatePOI(validationRequest, config);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Validation API error:", error);
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
