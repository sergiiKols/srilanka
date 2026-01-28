#!/usr/bin/env node

/**
 * SKILL #3: Link Offer to Client Map
 * 
 * Подготовка данных предложения для отображения на персональной карте клиента
 * 
 * Usage: node link.js --offer-id=123 --property-id=456 --request-id=42
 */

// Mock данные
const MOCK_OFFER = {
  id: 123,
  request_id: 42,
  property_id: 456,
  landlord_telegram_id: 123456789,
  status: 'pending',
  created_at: '2026-01-26T12:00:00Z'
};

const MOCK_PROPERTY = {
  id: 456,
  name: 'Villa Sunset',
  bedrooms: 4,
  price_per_night: 100,
  amenities: ['wifi', 'pool', 'kitchen', 'ac'],
  photos: [
    'https://example.com/villa-sunset-1.jpg',
    'https://example.com/villa-sunset-2.jpg',
    'https://example.com/villa-sunset-3.jpg'
  ],
  lat: 6.927,
  lng: 80.123,
  address: 'Beach Road, Negombo, Sri Lanka',
  description: 'Красивая вилла с видом на океан',
  landlord_telegram_id: 123456789,
  created_at: '2026-01-26T11:00:00Z'
};

const MOCK_LANDLORD = {
  name: 'Петр',
  telegram_username: '@petr123',
  phone: '+94771234567',
  telegram_id: 123456789
};

const MOCK_REQUEST = {
  id: 42,
  client_telegram_id: 987654321,
  client_name: 'Иван',
  location: 'Negombo',
  check_in: '2026-02-15',
  check_out: '2026-03-20',
  budget_min: 80,
  budget_max: 150
};

/**
 * Mock: Получение данных offer из БД
 */
async function fetchOffer(offerId) {
  console.log(`📋 Загрузка данных offer ID: ${offerId}...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const offer = { ...MOCK_OFFER, id: offerId };
  console.log('   ✓ Offer загружен');
  console.log(`   Status: ${offer.status}`);
  console.log('');
  return offer;
}

/**
 * Mock: Получение данных property из БД
 */
async function fetchProperty(propertyId) {
  console.log(`🏠 Загрузка данных property ID: ${propertyId}...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const property = { ...MOCK_PROPERTY, id: propertyId };
  console.log('   ✓ Property загружен');
  console.log(`   Name: ${property.name}`);
  console.log(`   Coordinates: ${property.lat}, ${property.lng}`);
  console.log('');
  return property;
}

/**
 * Mock: Получение данных landlord из БД
 */
async function fetchLandlord(landlordTelegramId) {
  console.log(`👤 Загрузка данных landlord...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const landlord = { ...MOCK_LANDLORD };
  console.log('   ✓ Landlord загружен');
  console.log(`   Name: ${landlord.name}`);
  console.log(`   Telegram: ${landlord.telegram_username}`);
  console.log('');
  return landlord;
}

/**
 * Mock: Получение данных request (заявки клиента)
 */
async function fetchRequest(requestId) {
  console.log(`📝 Загрузка данных request ID: ${requestId}...`);
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const request = { ...MOCK_REQUEST, id: requestId };
  console.log('   ✓ Request загружен');
  console.log(`   Client: ${request.client_name} (ID: ${request.client_telegram_id})`);
  console.log(`   Location: ${request.location}`);
  console.log('');
  return request;
}

/**
 * Проверка координат
 */
function validateCoordinates(property) {
  if (!property.lat || !property.lng) {
    return {
      valid: false,
      error: 'missing_coordinates',
      message: 'Координаты не указаны, offer не может быть показан на карте'
    };
  }
  
  // Проверка что координаты в разумных пределах (Sri Lanka)
  if (property.lat < 5.9 || property.lat > 9.9 || property.lng < 79.5 || property.lng > 82.0) {
    return {
      valid: false,
      error: 'invalid_coordinates',
      message: 'Координаты вне Sri Lanka'
    };
  }
  
  return { valid: true };
}

/**
 * Подготовка map_data для фронтенда
 */
function prepareMapData(offer, property, landlord) {
  return {
    id: `offer_${offer.id}`,
    offer_id: offer.id,
    property_id: property.id,
    property_name: property.name,
    price: property.price_per_night,
    bedrooms: property.bedrooms,
    coords: [property.lat, property.lng],
    photos: property.photos || [],
    amenities: property.amenities || [],
    description: property.description || '',
    address: property.address || '',
    landlord_name: landlord.name || 'Landlord',
    landlord_telegram: landlord.telegram_username || `tg://user?id=${property.landlord_telegram_id}`,
    landlord_phone: landlord.phone || null,
    created_at: offer.created_at
  };
}

/**
 * Mock: Обновление статуса offer в БД
 */
async function updateOfferStatus(offerId, mapData) {
  console.log('💾 Обновление статуса offer в БД...');
  
  console.log('   SQL:');
  console.log(`   UPDATE rental_offers`);
  console.log(`   SET status = 'ready_to_show',`);
  console.log(`       map_data = '${JSON.stringify(mapData).substring(0, 50)}...',`);
  console.log(`       updated_at = NOW()`);
  console.log(`   WHERE id = ${offerId}`);
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('   ✓ Статус обновлён: ready_to_show');
  console.log('');
}

/**
 * Основная функция
 */
async function linkOfferToClientMap(offerId, propertyId, requestId) {
  try {
    console.log('🚀 SKILL #3: Link Offer to Client Map');
    console.log('=' .repeat(50));
    console.log('');
    
    // Step 1: Validate input
    console.log('✅ Step 1: Валидация входных данных');
    if (!offerId || !propertyId || !requestId) {
      throw new Error('Missing required parameters');
    }
    console.log(`   Offer ID: ${offerId}`);
    console.log(`   Property ID: ${propertyId}`);
    console.log(`   Request ID: ${requestId}`);
    console.log('   ✓ Параметры валидны');
    console.log('');
    
    // Step 2: Fetch offer
    console.log('✅ Step 2: Получение данных offer');
    const offer = await fetchOffer(offerId);
    
    // Step 3: Fetch property
    console.log('✅ Step 3: Получение данных property');
    const property = await fetchProperty(propertyId);
    
    // Step 4: Validate coordinates
    console.log('✅ Step 4: Проверка координат');
    const coordsValidation = validateCoordinates(property);
    
    if (!coordsValidation.valid) {
      console.log(`   ❌ ${coordsValidation.message}`);
      console.log('');
      return {
        status: 'incomplete',
        error: coordsValidation.error,
        message: coordsValidation.message,
        offer_id: offerId
      };
    }
    
    console.log(`   ✓ Координаты валидны: [${property.lat}, ${property.lng}]`);
    console.log('');
    
    // Step 5: Fetch landlord
    console.log('✅ Step 5: Получение данных landlord');
    const landlord = await fetchLandlord(property.landlord_telegram_id);
    
    // Step 6: Fetch request (client)
    console.log('✅ Step 6: Получение данных request (client)');
    const request = await fetchRequest(requestId);
    const clientId = request.client_telegram_id;
    
    // Step 7: Prepare map data
    console.log('✅ Step 7: Подготовка данных для карты');
    const mapData = prepareMapData(offer, property, landlord);
    
    console.log('   Map Data:');
    console.log(`   {`);
    console.log(`     "id": "${mapData.id}",`);
    console.log(`     "property_name": "${mapData.property_name}",`);
    console.log(`     "price": ${mapData.price},`);
    console.log(`     "coords": [${mapData.coords.join(', ')}],`);
    console.log(`     "photos": [${mapData.photos.length} photos],`);
    console.log(`     "amenities": [${mapData.amenities.join(', ')}]`);
    console.log(`   }`);
    console.log('   ✓ Данные подготовлены');
    console.log('');
    
    // Step 8: Update offer status
    console.log('✅ Step 8: Обновление статуса offer');
    await updateOfferStatus(offerId, mapData);
    
    // Step 9: Return result
    const result = {
      status: 'ready',
      offer_id: offerId,
      client_id: clientId,
      map_data: mapData,
      message: 'Offer готов к показу на карте',
      map_url: `https://yoursite.com/map?request=${requestId}&highlight=${offerId}`
    };
    
    console.log('🎉 УСПЕШНО!');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log(`📍 Offer готов к показу клиенту ${request.client_name}`);
    console.log(`🗺️  Map URL: ${result.map_url}`);
    console.log('');
    
    return result;
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.log('');
    
    return {
      status: 'error',
      error: error.message,
      message: 'Ошибка при подготовке данных для карты'
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const offerIdArg = args.find(arg => arg.startsWith('--offer-id='));
  const propertyIdArg = args.find(arg => arg.startsWith('--property-id='));
  const requestIdArg = args.find(arg => arg.startsWith('--request-id='));
  
  if (!offerIdArg || !propertyIdArg || !requestIdArg) {
    console.log('Usage: node link.js --offer-id=123 --property-id=456 --request-id=42');
    console.log('');
    console.log('Будут использованы mock данные для тестирования');
    console.log('');
  }
  
  const offerId = offerIdArg ? parseInt(offerIdArg.split('=')[1]) : 123;
  const propertyId = propertyIdArg ? parseInt(propertyIdArg.split('=')[1]) : 456;
  const requestId = requestIdArg ? parseInt(requestIdArg.split('=')[1]) : 42;
  
  linkOfferToClientMap(offerId, propertyId, requestId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { linkOfferToClientMap };
