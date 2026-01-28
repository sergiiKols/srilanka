#!/usr/bin/env node

/**
 * SKILL #2: Parse Landlord Offer
 * 
 * Парсинг и обработка предложения от арендодателя
 * 
 * Usage: node parse.js --request-id=42
 */

// Mock данные для тестирования
const MOCK_FORM_DATA = {
  property_name: 'Villa Sunset',
  bedrooms: 3,
  amenities: ['wifi', 'pool', 'kitchen', 'ac', 'parking'],
  price_per_night: 150,
  photos: ['MOCK_PHOTO_ID_1', 'MOCK_PHOTO_ID_2', 'MOCK_PHOTO_ID_3'],
  landlord_telegram_id: 123456789,
  request_id: 42,
  phone: '+94771234567',
  address: 'Negombo Beach Road, Sri Lanka',
  description: 'Красивая вилла с видом на океан',
  lat: 7.2083,
  lng: 79.8358
};

const MOCK_CONFIG = {
  TELEGRAM_BOT_TOKEN: 'MOCK_TOKEN',
  SUPABASE_URL: 'https://mcmzdscpuoxwneuzsanu.supabase.co',
  SUPABASE_KEY: 'MOCK_KEY'
};

/**
 * Валидация обязательных полей
 */
function validateFormData(formData) {
  const requiredFields = {
    property_name: 'string',
    bedrooms: 'number',
    price_per_night: 'number',
    photos: 'array',
    landlord_telegram_id: 'number',
    request_id: 'number'
  };

  const missing = [];
  const errors = [];

  for (const [field, type] of Object.entries(requiredFields)) {
    if (!formData[field]) {
      missing.push(field);
      continue;
    }

    // Проверка типа
    if (type === 'array' && !Array.isArray(formData[field])) {
      errors.push(`${field} должен быть массивом`);
    } else if (type === 'number' && typeof formData[field] !== 'number') {
      errors.push(`${field} должен быть числом`);
    } else if (type === 'string' && typeof formData[field] !== 'string') {
      errors.push(`${field} должен быть строкой`);
    }

    // Дополнительные проверки
    if (field === 'photos' && formData[field].length === 0) {
      missing.push(field);
    }
    if (field === 'bedrooms' && (formData[field] < 1 || formData[field] > 10)) {
      errors.push('Количество спален должно быть от 1 до 10');
    }
    if (field === 'price_per_night' && formData[field] <= 0) {
      errors.push('Цена должна быть больше 0');
    }
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors
  };
}

/**
 * Mock: Скачивание фото из Telegram
 */
async function downloadPhotosFromTelegram(photoIds) {
  console.log('📸 Скачивание фотографий из Telegram...');
  const photos = [];

  for (let i = 0; i < photoIds.length; i++) {
    const photoId = photoIds[i];
    console.log(`   Скачивание фото ${i + 1}/${photoIds.length}: ${photoId}`);
    
    // Симуляция задержки
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock URL
    const mockUrl = `https://storage.supabase.co/properties/landlord_123/${photoId}.jpg`;
    photos.push(mockUrl);
    console.log(`   ✓ Сохранено: ${mockUrl}`);
  }

  console.log(`   ✅ Загружено ${photos.length} фото`);
  console.log('');
  return photos;
}

/**
 * Mock: Создание property в БД
 */
async function createProperty(formData, photoUrls) {
  console.log('🏠 Создание объекта недвижимости в БД...');
  
  const property = {
    id: Math.floor(Math.random() * 10000),
    name: formData.property_name,
    bedrooms: formData.bedrooms,
    amenities: formData.amenities,
    price_per_night: formData.price_per_night,
    photos: photoUrls,
    landlord_telegram_id: formData.landlord_telegram_id,
    lat: formData.lat || null,
    lng: formData.lng || null,
    address: formData.address || null,
    description: formData.description || null,
    phone: formData.phone || null,
    created_at: new Date().toISOString()
  };

  console.log('   SQL:');
  console.log(`   INSERT INTO properties (name, bedrooms, price_per_night, photos, ...)`);
  console.log(`   VALUES ('${property.name}', ${property.bedrooms}, ${property.price_per_night}, ...)`);
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  console.log(`   ✓ Property создан: ID ${property.id}`);
  console.log('');
  
  return property;
}

/**
 * Mock: Создание rental_offer
 */
async function createRentalOffer(requestId, propertyId, landlordId) {
  console.log('🔗 Создание привязки к заявке...');
  
  const offer = {
    id: Math.floor(Math.random() * 10000),
    request_id: requestId,
    property_id: propertyId,
    landlord_telegram_id: landlordId,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  console.log('   SQL:');
  console.log(`   INSERT INTO rental_offers (request_id, property_id, landlord_telegram_id, status)`);
  console.log(`   VALUES (${offer.request_id}, ${offer.property_id}, ${offer.landlord_telegram_id}, '${offer.status}')`);
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`   ✓ Rental Offer создан: ID ${offer.id}`);
  console.log('');
  
  return offer;
}

/**
 * Mock: Отправка уведомлений
 */
async function sendNotifications(property, requestId, landlordId) {
  console.log('📬 Отправка уведомлений...');
  
  // Уведомление landlord
  console.log('');
  console.log('   → Landlord (ID: ' + landlordId + '):');
  console.log('   ---MESSAGE START---');
  console.log('   ✅ Спасибо! Ваше предложение добавлено.');
  console.log('');
  console.log(`   🏠 Объект: ${property.name}`);
  console.log(`   📋 Заявка: #${requestId}`);
  console.log('');
  console.log('   Клиент увидит ваше предложение на карте.');
  console.log('   ---MESSAGE END---');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Уведомление клиента
  const mockClientId = 987654321;
  console.log('   → Клиент (ID: ' + mockClientId + '):');
  console.log('   ---MESSAGE START---');
  console.log('   🏠 Новое предложение по вашей заявке!');
  console.log('');
  console.log(`   ${property.name}`);
  console.log(`   💰 $${property.price_per_night}/ночь`);
  console.log(`   🛏️ ${property.bedrooms} спален`);
  console.log(`   ✨ Удобства: ${property.amenities.join(', ')}`);
  console.log('');
  console.log('   [Посмотреть на карте]');
  console.log('   ---MESSAGE END---');
  console.log('');
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('   ✅ Уведомления отправлены');
  console.log('');
}

/**
 * Основная функция
 */
async function parseLandlordOffer(formData) {
  try {
    console.log('🚀 SKILL #2: Parse Landlord Offer');
    console.log('=' .repeat(50));
    console.log('');
    
    // Step 1: Validate
    console.log('✅ Step 1: Валидация входных данных');
    const validation = validateFormData(formData);
    
    if (!validation.valid) {
      console.log('   ❌ Валидация не пройдена:');
      if (validation.missing.length > 0) {
        console.log(`   Отсутствуют поля: ${validation.missing.join(', ')}`);
      }
      if (validation.errors.length > 0) {
        console.log(`   Ошибки: ${validation.errors.join('; ')}`);
      }
      console.log('');
      
      return {
        status: 'incomplete',
        missing_fields: validation.missing,
        errors: validation.errors,
        message: `Пожалуйста, заполните: ${validation.missing.join(', ')}`,
        draft_saved: true
      };
    }
    
    console.log('   ✓ Все обязательные поля заполнены');
    console.log('   ✓ Данные валидны');
    console.log('');
    
    // Step 2: Download photos
    console.log('✅ Step 2: Скачивание фотографий');
    const photoUrls = await downloadPhotosFromTelegram(formData.photos);
    
    if (photoUrls.length === 0) {
      throw new Error('Не удалось загрузить ни одной фотографии');
    }
    
    // Step 3: Create property
    console.log('✅ Step 3: Создание объекта недвижимости');
    const property = await createProperty(formData, photoUrls);
    
    // Step 4: Create rental offer
    console.log('✅ Step 4: Создание привязки к заявке');
    const offer = await createRentalOffer(
      formData.request_id,
      property.id,
      formData.landlord_telegram_id
    );
    
    // Step 5: Send notifications
    console.log('✅ Step 5: Отправка уведомлений');
    await sendNotifications(property, formData.request_id, formData.landlord_telegram_id);
    
    // Step 6: Return result
    const result = {
      status: 'success',
      property_id: property.id,
      rental_offer_id: offer.id,
      property_name: property.name,
      photos_uploaded: photoUrls.length,
      message: 'Предложение успешно добавлено',
      created_at: property.created_at
    };
    
    console.log('🎉 УСПЕШНО!');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    return result;
    
  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.log('');
    
    return {
      status: 'error',
      error: error.message,
      message: 'Ошибка при обработке предложения'
    };
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const requestIdArg = args.find(arg => arg.startsWith('--request-id='));
  
  if (!requestIdArg) {
    console.log('Usage: node parse.js --request-id=42');
    console.log('');
    console.log('Будут использованы mock данные для тестирования');
    console.log('');
  }
  
  const requestId = requestIdArg ? parseInt(requestIdArg.split('=')[1]) : 42;
  
  const formData = {
    ...MOCK_FORM_DATA,
    request_id: requestId
  };
  
  parseLandlordOffer(formData)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { parseLandlordOffer };
