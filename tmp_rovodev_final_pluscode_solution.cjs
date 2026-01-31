// Финальное решение для Plus Code с извлечением из URL

const OpenLocationCode = require('open-location-code').OpenLocationCode;
const olc = new OpenLocationCode();

console.log('🎯 ФИНАЛЬНОЕ РЕШЕНИЕ ДЛЯ PLUS CODE\n');
console.log('='.repeat(80));

// Реальный URL из тестов
const testUrl = "https://maps.google.com/maps?q=WFX7+22W+Russian+Guesthouse,+Mirissa&ftid=0x3ae13fb323a297bb:0xec3af956c6734232";
const expectedLat = 5.9476101;
const expectedLng = 80.4962569;

console.log('\n📍 Исходные данные:');
console.log(`   URL: ${testUrl}`);
console.log(`   Ожидаемые координаты: ${expectedLat}, ${expectedLng}`);

// Извлекаем Plus Code из URL
const qMatch = testUrl.match(/[?&]q=([^&]+)/);
if (qMatch) {
  const qValue = decodeURIComponent(qMatch[1]);
  console.log(`\n🔍 Параметр ?q: ${qValue}`);
  
  // Извлекаем Plus Code (формат: XXXX+XXX)
  const plusCodeMatch = qValue.match(/([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})/);
  
  if (plusCodeMatch) {
    const shortCode = plusCodeMatch[1];
    console.log(`   Plus Code: ${shortCode}`);
    console.log(`   Тип: ${olc.isShort(shortCode) ? 'Короткий' : 'Полный'}`);
    
    // Извлекаем название города из URL
    const locationMatch = qValue.match(/[,\s]+([A-Za-z\s]+)(?:,|&|$)/);
    const cityName = locationMatch ? locationMatch[1].trim() : null;
    console.log(`   Город из URL: ${cityName || 'не найден'}`);
    
    // РЕШЕНИЕ 1: Использовать ftid для получения координат
    console.log('\n💡 РЕШЕНИЕ 1: Извлечь координаты из HTML страницы');
    console.log('   ftid = 0x3ae13fb323a297bb:0xec3af956c6734232');
    console.log('   Hex → координаты через reverse engineering');
    console.log('   Статус: ⚠️  Сложно, ненадежно');
    
    // РЕШЕНИЕ 2: Geocoding города
    console.log('\n💡 РЕШЕНИЕ 2: Geocoding города через Nominatim');
    console.log(`   Запрос: https://nominatim.openstreetmap.org/search?q=${cityName},Sri+Lanka`);
    console.log('   → Получаем координаты города');
    console.log('   → Используем как reference для recoverNearest()');
    console.log('   Статус: ✅ Надежно, бесплатно');
    
    // РЕШЕНИЕ 3: Использовать базу городов Шри-Ланки
    console.log('\n💡 РЕШЕНИЕ 3: Предопределенная база городов');
    
    const sriLankaCities = {
      'Mirissa': { lat: 5.9453, lng: 80.4713 },
      'Colombo': { lat: 6.9271, lng: 79.8612 },
      'Galle': { lat: 6.0535, lng: 80.2210 },
      'Kandy': { lat: 7.2906, lng: 80.6337 },
      'Negombo': { lat: 7.2094, lng: 79.8358 },
      'Tangalle': { lat: 6.0248, lng: 80.7972 }
    };
    
    console.log('   База городов:');
    Object.entries(sriLankaCities).forEach(([city, coords]) => {
      console.log(`      ${city}: ${coords.lat}, ${coords.lng}`);
    });
    console.log('   Статус: ✅ Быстро, офлайн, точно');
    
    // Тестируем все решения
    console.log('\n' + '='.repeat(80));
    console.log('🧪 ТЕСТИРОВАНИЕ РЕШЕНИЙ\n');
    
    // Решение 2: Координаты Mirissa из OpenStreetMap
    const mirisaCoords = { lat: 5.9453, lng: 80.4713 };
    console.log(`Тест 1: Reference = Mirissa OSM (${mirisaCoords.lat}, ${mirisaCoords.lng})`);
    
    const recovered1 = olc.recoverNearest(shortCode, mirisaCoords.lat, mirisaCoords.lng);
    console.log(`   Восстановленный код: ${recovered1}`);
    
    const decoded1 = olc.decode(recovered1);
    const dist1 = calculateDistance(
      { lat: expectedLat, lng: expectedLng },
      { lat: decoded1.latitudeCenter, lng: decoded1.longitudeCenter }
    );
    console.log(`   Декодированные: ${decoded1.latitudeCenter.toFixed(7)}, ${decoded1.longitudeCenter.toFixed(7)}`);
    console.log(`   Расстояние: ${dist1.toFixed(2)} м`);
    console.log(`   Статус: ${dist1 < 100 ? '✅ ОТЛИЧНО!' : dist1 < 1000 ? '⚠️  Приемлемо' : '❌ Плохо'}`);
    
    // Тест с более широкой областью (юг Шри-Ланки)
    const southSriLanka = { lat: 6.0, lng: 80.5 };
    console.log(`\nТест 2: Reference = Юг Шри-Ланки (${southSriLanka.lat}, ${southSriLanka.lng})`);
    
    const recovered2 = olc.recoverNearest(shortCode, southSriLanka.lat, southSriLanka.lng);
    const decoded2 = olc.decode(recovered2);
    const dist2 = calculateDistance(
      { lat: expectedLat, lng: expectedLng },
      { lat: decoded2.latitudeCenter, lng: decoded2.longitudeCenter }
    );
    console.log(`   Восстановленный код: ${recovered2}`);
    console.log(`   Расстояние: ${dist2.toFixed(2)} м`);
    console.log(`   Статус: ${dist2 < 100 ? '✅ ОТЛИЧНО!' : dist2 < 1000 ? '⚠️  Приемлемо' : '❌ Плохо'}`);
    
    // Тест с центром Шри-Ланки
    const centerSriLanka = { lat: 7.0, lng: 81.0 };
    console.log(`\nТест 3: Reference = Центр Шри-Ланки (${centerSriLanka.lat}, ${centerSriLanka.lng})`);
    
    const recovered3 = olc.recoverNearest(shortCode, centerSriLanka.lat, centerSriLanka.lng);
    const decoded3 = olc.decode(recovered3);
    const dist3 = calculateDistance(
      { lat: expectedLat, lng: expectedLng },
      { lat: decoded3.latitudeCenter, lng: decoded3.longitudeCenter }
    );
    console.log(`   Восстановленный код: ${recovered3}`);
    console.log(`   Расстояние: ${dist3.toFixed(2)} м`);
    console.log(`   Статус: ${dist3 < 100 ? '✅ ОТЛИЧНО!' : dist3 < 1000 ? '⚠️  Приемлемо' : '❌ Плохо'}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n📋 ИТОГОВАЯ РЕКОМЕНДАЦИЯ:\n');
console.log('1. ✅ Создать базу основных городов Шри-Ланки в проекте');
console.log('   → Быстро, офлайн, точно');
console.log('');
console.log('2. ✅ Извлекать город из URL (?q=...+City+Name)');
console.log('   → Парсинг через regex');
console.log('');
console.log('3. ✅ Использовать координаты города как reference');
console.log('   → olc.recoverNearest(plusCode, cityLat, cityLng)');
console.log('');
console.log('4. ✅ FALLBACK: Если город не найден');
console.log('   → Использовать регион (Юг/Центр/Север Шри-Ланки)');
console.log('   → Или использовать Nominatim geocoding');
console.log('');
console.log('🎯 ТОЧНОСТЬ:');
console.log('   - С координатами города: < 100 м ✅');
console.log('   - С координатами региона: < 1 км ✅');
console.log('   - С центром страны: 50-150 км ❌ (не подходит!)');
console.log('');
console.log('='.repeat(80));

function calculateDistance(coord1, coord2) {
  const R = 6371e3;
  const φ1 = coord1.lat * Math.PI / 180;
  const φ2 = coord2.lat * Math.PI / 180;
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
