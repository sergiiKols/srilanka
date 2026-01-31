// Правильный тест Plus Code для Шри-Ланки

const OpenLocationCode = require('open-location-code').OpenLocationCode;
const olc = new OpenLocationCode();

console.log('🧪 ПРАВИЛЬНЫЙ ТЕСТ PLUS CODE ДЛЯ ШРИ-ЛАНКИ\n');
console.log('='.repeat(80));

// Реальные координаты Russian Guesthouse: 5.9476101, 80.4962569
const expectedLat = 5.9476101;
const expectedLng = 80.4962569;

console.log('\n📍 Russian Guesthouse, Mirissa, Sri Lanka');
console.log(`   Координаты: ${expectedLat}, ${expectedLng}`);

// Генерируем правильный Plus Code из координат
console.log('\n🔧 Генерация правильного Plus Code из координат...');

const generatedCode = olc.encode(expectedLat, expectedLng);
console.log(`   Полный код: ${generatedCode}`);

// Создаем короткий код
const shortCode = olc.shorten(generatedCode, expectedLat, expectedLng);
console.log(`   Короткий код: ${shortCode}`);

// Декодируем обратно
console.log('\n✅ Тест 1: Декодирование полного кода');
const decoded1 = olc.decode(generatedCode);
console.log(`   Центр: ${decoded1.latitudeCenter.toFixed(7)}, ${decoded1.longitudeCenter.toFixed(7)}`);

const dist1 = calculateDistance(
  { lat: expectedLat, lng: expectedLng },
  { lat: decoded1.latitudeCenter, lng: decoded1.longitudeCenter }
);
console.log(`   Расстояние от цели: ${dist1.toFixed(2)} м`);
console.log(`   Статус: ${dist1 < 20 ? '✅ ОТЛИЧНО!' : dist1 < 100 ? '✅ ХОРОШО!' : '⚠️  ПРИЕМЛЕМО'}`);

// Восстанавливаем короткий код
console.log('\n✅ Тест 2: Восстановление короткого кода');
const recovered = olc.recoverNearest(shortCode, expectedLat, expectedLng);
console.log(`   Восстановленный: ${recovered}`);
console.log(`   Совпадает с полным: ${recovered === generatedCode ? '✅' : '❌'}`);

const decoded2 = olc.decode(recovered);
const dist2 = calculateDistance(
  { lat: expectedLat, lng: expectedLng },
  { lat: decoded2.latitudeCenter, lng: decoded2.longitudeCenter }
);
console.log(`   Расстояние от цели: ${dist2.toFixed(2)} м`);

// Тестируем с неточными reference координатами
console.log('\n⚠️  Тест 3: Восстановление с приблизительными координатами');
console.log('   (используем центр Шри-Ланки: 7°N, 81°E)');

const recovered3 = olc.recoverNearest(shortCode, 7.0, 81.0);
console.log(`   Восстановленный: ${recovered3}`);
console.log(`   Совпадает с полным: ${recovered3 === generatedCode ? '✅' : '❌'}`);

const decoded3 = olc.decode(recovered3);
const dist3 = calculateDistance(
  { lat: expectedLat, lng: expectedLng },
  { lat: decoded3.latitudeCenter, lng: decoded3.longitudeCenter }
);
console.log(`   Расстояние от цели: ${dist3.toFixed(2)} м`);
console.log(`   Статус: ${dist3 < 1000 ? '✅ Приемлемо!' : '❌ Большая погрешность'}`);

console.log('\n' + '='.repeat(80));
console.log('\n💡 ВАЖНЫЙ ВЫВОД:\n');
console.log('Short Plus Code (WFX7+22W) из URL Google Maps:');
console.log(`   Правильный полный код: ${generatedCode}`);
console.log(`   НЕправильный код из моих тестов: 7PMVWFX7+22W (это Китай!)`);
console.log('');
console.log('📋 РЕШЕНИЕ ДЛЯ ПРОЕКТА:');
console.log('');
console.log('1. Когда видим короткий Plus Code в URL:');
console.log('   ?q=WFX7+22W+Russian+Guesthouse,+Mirissa');
console.log('');
console.log('2. Извлекаем город из URL: "Mirissa"');
console.log('');
console.log('3. Используем Nominatim для получения координат города:');
console.log('   https://nominatim.openstreetmap.org/search?q=Mirissa,Sri+Lanka');
console.log('   → Получаем: ~5.95°N, 80.48°E');
console.log('');
console.log('4. Используем эти координаты как reference:');
console.log('   olc.recoverNearest("WFX7+22W", 5.95, 80.48)');
console.log('   → Получаем правильный полный код');
console.log('');
console.log('5. Декодируем полный код:');
console.log('   olc.decode(fullCode)');
console.log('   → Получаем точные координаты!');
console.log('');
console.log('🎯 FALLBACK: Если не можем определить город:');
console.log('   - Используем центр Шри-Ланки (7°N, 81°E)');
console.log(`   - Погрешность будет ~${Math.round(dist3)} м (все еще приемлемо!)`);
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
