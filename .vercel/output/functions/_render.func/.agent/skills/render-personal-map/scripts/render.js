#!/usr/bin/env node
/**
 * SKILL #5: Render Personal Map (Mock version)
 */

const MOCK_OFFERS = [
  {
    id: 1,
    property: {
      name: 'Villa Sunset',
      lat: 7.2083,
      lng: 79.8358,
      price: 100,
      bedrooms: 4,
      photos: ['photo1.jpg'],
      amenities: ['wifi', 'pool']
    },
    landlord: { name: 'Петр', telegram: '@petr123' }
  }
];

async function renderPersonalMap(clientId, requestId) {
  console.log('🗺️  SKILL #5: Render Personal Map');
  console.log('Client:', clientId, 'Request:', requestId);
  console.log(`Загружено ${MOCK_OFFERS.length} предложений`);
  console.log('Карта готова к отображению');
  
  return { status: 'rendered', offers_count: MOCK_OFFERS.length };
}

if (require.main === module) {
  renderPersonalMap('client_123', 'req_456');
}

module.exports = { renderPersonalMap };
