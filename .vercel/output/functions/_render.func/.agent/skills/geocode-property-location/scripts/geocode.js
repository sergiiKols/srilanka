#!/usr/bin/env node
/**
 * SKILL #11: Geocode Property Location (Mock)
 */

function calculateDistance(lat1, lng1, lat2, lng2) {
  // Simplified distance calculation
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function geocodePropertyLocation(locationText, coords, propertyId) {
  console.log('🌍 SKILL #11: Geocode Property Location');
  console.log(`Location: ${locationText}`);
  console.log(`Coords: ${coords.lat}, ${coords.lng}`);
  
  // Mock: Get coords from Google
  const googleCoords = { lat: 7.21, lng: 79.84 }; // Mock Negombo
  
  const distance = calculateDistance(
    coords.lat, coords.lng,
    googleCoords.lat, googleCoords.lng
  );
  
  console.log(`Расстояние: ${distance.toFixed(2)} км`);
  
  const isMatch = distance < 5;
  const status = distance < 5 ? 'OK' : distance < 50 ? 'WARNING' : 'ERROR';
  
  console.log(`Статус: ${status}`);
  
  return {
    is_match: isMatch,
    distance_km: parseFloat(distance.toFixed(2)),
    verified: true
  };
}

if (require.main === module) {
  geocodePropertyLocation('Negombo, Sri Lanka', { lat: 7.2083, lng: 79.8358 }, 456);
}

module.exports = { geocodePropertyLocation };
