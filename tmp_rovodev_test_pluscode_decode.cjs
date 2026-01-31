// Тест декодирования Plus Code без установки библиотеки
// Используем алгоритм напрямую

console.log('🧪 ТЕСТИРОВАНИЕ PLUS CODE ДЕКОДИРОВАНИЯ\n');
console.log('='.repeat(80));

// Тестовые данные
const testCases = [
  {
    name: "Russian Guesthouse",
    plusCode: "WFX7+22W",
    fullCode: "7PMVWFX7+22W", // С префиксом региона
    expected: { lat: 5.9476101, lng: 80.4962569 },
    location: "Mirissa, Sri Lanka"
  },
  {
    name: "Test 2 - Colombo area",
    plusCode: "7MXX+8Q",
    fullCode: "6MQRMXXX+8Q",
    expected: { lat: 6.9481, lng: 79.8494 }, // Примерно Colombo
    location: "Colombo, Sri Lanka"
  }
];

// Упрощенный алгоритм декодирования Plus Code
// Основан на спецификации Open Location Code
function decodePlusCode(code) {
  // Удаляем пробелы и переводим в верхний регистр
  code = code.replace(/\s/g, '').toUpperCase();
  
  // Удаляем символ '+'
  const plusIndex = code.indexOf('+');
  if (plusIndex === -1) {
    return null;
  }
  
  // Разделяем на части до и после '+'
  const beforePlus = code.substring(0, plusIndex);
  const afterPlus = code.substring(plusIndex + 1);
  
  // Алфавит для кодирования
  const alphabet = '23456789CFGHJMPQRVWX';
  
  // Параметры
  const pairCodeLength = 10;
  const gridSizeDegrees = 20;
  const gridRows = 5;
  const gridCols = 4;
  
  // Проверяем минимальную длину
  if (beforePlus.length < 2) {
    return null;
  }
  
  // Декодируем первую пару (широта, старшие разряды)
  const latIndex1 = alphabet.indexOf(beforePlus[0]);
  const lngIndex1 = alphabet.indexOf(beforePlus[1]);
  
  if (latIndex1 === -1 || lngIndex1 === -1) {
    return null;
  }
  
  // Начальные координаты
  let lat = latIndex1 * gridSizeDegrees - 90;
  let lng = lngIndex1 * gridSizeDegrees - 180;
  
  // Декодируем остальные пары
  let latPrecision = gridSizeDegrees;
  let lngPrecision = gridSizeDegrees;
  
  for (let i = 2; i < beforePlus.length; i += 2) {
    if (i + 1 >= beforePlus.length) break;
    
    const latIndex = alphabet.indexOf(beforePlus[i]);
    const lngIndex = alphabet.indexOf(beforePlus[i + 1]);
    
    if (latIndex === -1 || lngIndex === -1) break;
    
    latPrecision /= gridSizeDegrees;
    lngPrecision /= gridSizeDegrees;
    
    lat += latIndex * latPrecision;
    lng += lngIndex * lngPrecision;
  }
  
  // Декодируем grid refinement (после +)
  if (afterPlus.length > 0) {
    latPrecision /= gridRows;
    lngPrecision /= gridCols;
    
    for (let i = 0; i < afterPlus.length; i++) {
      const char = afterPlus[i];
      const index = alphabet.indexOf(char);
      
      if (index === -1) continue;
      
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      
      lat += row * latPrecision;
      lng += col * lngPrecision;
      
      if (i < afterPlus.length - 1) {
        latPrecision /= gridRows;
        lngPrecision /= gridCols;
      }
    }
  }
  
  // Возвращаем центр области
  lat += latPrecision / 2;
  lng += lngPrecision / 2;
  
  return { lat, lng };
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

console.log('\n⚠️  ВАЖНО: Plus Code бывает двух типов:');
console.log('   1. Короткий (WFX7+22W) - нужен region code для полного декодирования');
console.log('   2. Полный (7PMVWFX7+22W) - можно декодировать напрямую\n');

testCases.forEach((test, i) => {
  console.log(`\n📍 Тест ${i + 1}: ${test.name}`);
  console.log(`   Местоположение: ${test.location}`);
  console.log(`   Plus Code (короткий): ${test.plusCode}`);
  console.log(`   Plus Code (полный): ${test.fullCode}`);
  console.log(`   Ожидаемые координаты: ${test.expected.lat}, ${test.expected.lng}`);
  
  // Пробуем декодировать короткий код
  console.log('\n   Попытка 1: Декодирование короткого кода...');
  let decoded = decodePlusCode(test.plusCode);
  
  if (decoded) {
    console.log(`   Результат: ${decoded.lat.toFixed(7)}, ${decoded.lng.toFixed(7)}`);
    const distance = calculateDistance(test.expected, decoded);
    console.log(`   Расстояние от цели: ${distance.toFixed(0)} м`);
    
    if (distance < 1000) {
      console.log(`   ✅ БЛИЗКО! Погрешность < 1 км`);
    } else {
      console.log(`   ⚠️  НЕТОЧНО! Нужен region code`);
    }
  } else {
    console.log(`   ❌ Не удалось декодировать`);
  }
  
  // Пробуем декодировать полный код
  console.log('\n   Попытка 2: Декодирование полного кода...');
  decoded = decodePlusCode(test.fullCode);
  
  if (decoded) {
    console.log(`   Результат: ${decoded.lat.toFixed(7)}, ${decoded.lng.toFixed(7)}`);
    const distance = calculateDistance(test.expected, decoded);
    console.log(`   Расстояние от цели: ${distance.toFixed(0)} м`);
    
    if (distance < 100) {
      console.log(`   ✅ ОТЛИЧНО! Погрешность < 100 м`);
    } else if (distance < 1000) {
      console.log(`   ✅ ХОРОШО! Погрешность < 1 км`);
    } else {
      console.log(`   ⚠️  Большая погрешность`);
    }
  } else {
    console.log(`   ❌ Не удалось декодировать`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 ВЫВОДЫ:\n');
console.log('1. ⚠️  Короткие Plus Code требуют region code (первые 4 символа)');
console.log('   Пример: WFX7+22W → 7PMVWFX7+22W (добавлен префикс 7PMV)');
console.log('');
console.log('2. 🔧 Для автоматического определения region code нужно:');
console.log('   - Знать примерное местоположение (страна/город)');
console.log('   - Или использовать Google Maps API');
console.log('   - Или извлечь из URL (если есть в параметрах)');
console.log('');
console.log('3. 📦 Библиотека open-location-code от Google:');
console.log('   ✅ Поддерживает полные коды');
console.log('   ✅ Может восстанавливать короткие коды (recoverNearest)');
console.log('   ✅ Стабильная, без зависимостей, легковесная (< 20 KB)');
console.log('   ✅ Лицензия Apache-2.0 (можно использовать коммерчески)');
console.log('');
console.log('🎯 РЕКОМЕНДАЦИЯ: Установить open-location-code');
console.log('   npm install open-location-code');
console.log('\n' + '='.repeat(80));
