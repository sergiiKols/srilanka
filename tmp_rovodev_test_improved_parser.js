// Тест улучшенного парсера с поддержкой закодированных данных

const testUrls = [
  {
    name: "Billy Breeze Apartment (закодированные данные)",
    url: "https://www.google.com/maps/place/Billy+Breeze+Apartment,+Ankokkawala+Rd,+Galle/data=!4m2!3m1!1s0x3ae16db301085117:0xf38001c45ade651d!8m2!3d6.0490797!4d80.2882965",
    expected: { lat: 6.0490797, lng: 80.2882965 }
  },
  {
    name: "Russian Guesthouse (Plus Code с ftid)",
    url: "https://maps.google.com/maps?q=WFX7+22W+Russian+Guesthouse,+Mirissa&ftid=0x3ae13fb323a297bb:0xec3af956c6734232",
    expected: { lat: 5.9476101, lng: 80.4962569 }
  },
  {
    name: "La Casa Mirissa (стандартный формат @)",
    url: "https://www.google.com/maps/place/La+Casa+Mirissa/@5.9495294,80.4545732,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae1150a48618e9b:0xc92391dd0e2564d9!8m2!3d5.9495294!4d80.4545732!16s%2Fg%2F11st84s9r6",
    expected: { lat: 5.9495294, lng: 80.4545732 }
  },
  {
    name: "Dougies Hidden Place (адрес без координат)",
    url: "https://maps.google.com/maps?q=Dougies+Hidden+Place+-+Galle,+30+Dewasurendra+Pedesa,+Galle+80000&ftid=0x3ae1737b16894e3f:0x8e5a8dbdadf6d45",
    expected: { lat: 6.0456203, lng: 80.2089115 }
  }
];

// Функция парсинга закодированных данных
function extractCoordsFromEncodedData(url) {
  try {
    // Ищем паттерн !3d{lat}!4d{lng}
    const coordMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, method: '!3d/!4d' };
      }
    }
    
    // Альтернативный формат: !8m2!3d{lat}!4d{lng}
    const altMatch = url.match(/!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (altMatch) {
      const lat = parseFloat(altMatch[1]);
      const lng = parseFloat(altMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, method: '!8m2' };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Функция парсинга стандартного формата @
function extractCoordsFromAt(url) {
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { 
      lat: parseFloat(atMatch[1]), 
      lng: parseFloat(atMatch[2]),
      method: '@lat,lng'
    };
  }
  return null;
}

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

console.log('🧪 ТЕСТИРОВАНИЕ УЛУЧШЕННОГО ПАРСЕРА\n');
console.log('='.repeat(80));

const results = [];

testUrls.forEach((test, i) => {
  console.log(`\n📍 Тест ${i + 1}/${testUrls.length}: ${test.name}`);
  console.log(`   URL: ${test.url.substring(0, 80)}...`);
  console.log(`   Ожидаемые: ${test.expected.lat}, ${test.expected.lng}`);
  
  // Пробуем оба метода
  let coords = extractCoordsFromAt(test.url);
  if (!coords) {
    coords = extractCoordsFromEncodedData(test.url);
  }
  
  if (!coords) {
    console.log(`   ❌ FAIL: Координаты не найдены`);
    results.push({ name: test.name, status: 'fail' });
    return;
  }
  
  console.log(`   Полученные: ${coords.lat}, ${coords.lng}`);
  console.log(`   Метод: ${coords.method}`);
  
  const distance = calculateDistance(test.expected, coords);
  const latDiff = Math.abs(coords.lat - test.expected.lat);
  const lngDiff = Math.abs(coords.lng - test.expected.lng);
  
  console.log(`   Δlat: ${latDiff.toFixed(8)}`);
  console.log(`   Δlng: ${lngDiff.toFixed(8)}`);
  console.log(`   Расстояние: ${distance.toFixed(2)} м`);
  
  if (latDiff < 0.0001 && lngDiff < 0.0001) {
    console.log(`   ✅ SUCCESS: Координаты совпадают идеально!`);
    results.push({ name: test.name, status: 'success', distance });
  } else if (latDiff < 0.001 && lngDiff < 0.001) {
    console.log(`   ⚠️  PARTIAL: Координаты близки`);
    results.push({ name: test.name, status: 'partial', distance });
  } else {
    console.log(`   ❌ FAIL: Координаты сильно отличаются`);
    results.push({ name: test.name, status: 'fail', distance });
  }
});

console.log('\n' + '='.repeat(80));
console.log('📊 ИТОГОВАЯ СТАТИСТИКА\n');

const total = results.length;
const successful = results.filter(r => r.status === 'success').length;
const partial = results.filter(r => r.status === 'partial').length;
const failed = results.filter(r => r.status === 'fail').length;

console.log(`Всего тестов: ${total}`);
console.log(`✅ Успешных: ${successful} (${Math.round(successful/total*100)}%)`);
console.log(`⚠️  Частично: ${partial} (${Math.round(partial/total*100)}%)`);
console.log(`❌ Ошибок: ${failed} (${Math.round(failed/total*100)}%)`);

if (successful > 0) {
  const successfulResults = results.filter(r => r.status === 'success' && r.distance !== undefined);
  if (successfulResults.length > 0) {
    const avgDistance = successfulResults.reduce((sum, r) => sum + r.distance, 0) / successfulResults.length;
    console.log(`\nСредняя точность: ${avgDistance.toFixed(2)} м`);
  }
}

console.log('\n' + '='.repeat(80));

if (successful === total) {
  console.log('\n🎉 ОТЛИЧНО! Улучшенный парсер работает идеально!');
  console.log('   ✅ Все форматы URL поддерживаются');
  console.log('   ✅ Закодированные данные извлекаются корректно');
} else if (failed > 0) {
  console.log('\n⚠️  ВНИМАНИЕ: Некоторые форматы не поддерживаются');
  console.log('\n💡 Проблемные случаи:');
  results.filter(r => r.status === 'fail').forEach(r => {
    console.log(`   - ${r.name}`);
  });
  console.log('\n🔧 Рекомендации:');
  console.log('   1. Plus Code требует Google Geocoding API');
  console.log('   2. Адреса требуют geocoding запроса');
  console.log('   3. Некоторые форматы могут иметь координаты в других местах URL');
}

console.log('\n' + '='.repeat(80));
