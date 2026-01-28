#!/usr/bin/env node
/**
 * SKILL #10: Validate Property Data (Mock version)
 */

const MOCK_PROPERTY = {
  id: 456,
  name: 'Villa Sunset',
  bedrooms: 4,
  price: 100,
  photos: ['photo1.jpg', 'photo2.jpg'],
  amenities: ['wifi', 'pool'],
  lat: 7.2083,
  lng: 79.8358
};

function validateProperty(property) {
  console.log('✅ SKILL #10: Validate Property Data');
  console.log(`Property: ${property.name} (ID: ${property.id})`);
  console.log('');
  
  const errors = [];
  const warnings = [];
  
  console.log('Проверка данных...');
  
  if (!property.name || property.name.length < 3) {
    errors.push('Название слишком короткое');
  } else {
    console.log('  ✓ Название: OK');
  }
  
  if (property.bedrooms < 1 || property.bedrooms > 20) {
    errors.push('Количество спален некорректно');
  } else {
    console.log('  ✓ Спальни: OK');
  }
  
  if (property.price <= 0 || property.price > 10000) {
    errors.push('Цена вне допустимого диапазона');
  } else {
    console.log('  ✓ Цена: OK');
  }
  
  if (!property.photos || property.photos.length === 0) {
    errors.push('Нет фотографий');
  } else {
    console.log(`  ✓ Фото: ${property.photos.length} шт`);
  }
  
  if (!property.description) {
    warnings.push('Нет описания');
  }
  
  console.log('');
  
  const isValid = errors.length === 0;
  const status = isValid ? 'valid' : 'invalid';
  
  console.log(`Результат: ${status.toUpperCase()}`);
  if (errors.length > 0) {
    console.log('Ошибки:', errors);
  }
  if (warnings.length > 0) {
    console.log('Предупреждения:', warnings);
  }
  
  return { is_valid: isValid, errors, warnings, validation_status: status };
}

if (require.main === module) {
  validateProperty(MOCK_PROPERTY);
}

module.exports = { validateProperty };
