// Тестирование разворота коротких ссылок через /api/expand-url

const testCases = [
  {
    name: "Billy Breeze Apartment",
    short: "https://maps.app.goo.gl/3k4khwBzm2tPtZKN6",
    expected: "https://www.google.com/maps/place/Billy+Breeze+Apartment,+Breeze+Travel+and+Rental+Service/@6.0490797,80.2882965,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae16db301085117:0xf38001c45ade651d!8m2!3d6.0490797!4d80.2882965!16s%2Fg%2F11try575rk?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
  },
  {
    name: "Russian Guesthouse",
    short: "https://maps.app.goo.gl/KSZKYnL8PmKigKPe7?g_st=it",
    expected: "https://www.google.com/maps/place/Russian+Guesthouse/@5.9476101,80.4962569,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae13fb323a297bb:0xec3af956c6734232!8m2!3d5.9476101!4d80.4962569!16s%2Fg%2F11vj6qfk36!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
  },
  {
    name: "La Casa Mirissa",
    short: "https://maps.app.goo.gl/pHPKpBLW2rRAMGHWA",
    expected: "https://www.google.com/maps/place/La+Casa+Mirissa/@5.9495294,80.4545732,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae1150a48618e9b:0xc92391dd0e2564d9!8m2!3d5.9495294!4d80.4545732!16s%2Fg%2F11st84s9r6?hl=en&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
  },
  {
    name: "Dougies Hidden Place - Galle",
    short: "https://maps.app.goo.gl/NmjKGGQ7w8wfh2sC8?g_st=ic",
    expected: "https://www.google.com/maps/place/Dougies+Hidden+Place+-+Galle/@6.0456203,80.2089115,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae1737b16894e3f:0x8e5a8dbdadf6d45!8m2!3d6.0456203!4d80.2089115!16s%2Fg%2F11l2zyy04_!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
  }
];

function extractCoordinates(url) {
  if (!url) return null;
  
  // Формат: @lat,lng
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    return { 
      lat: parseFloat(atMatch[1]), 
      lng: parseFloat(atMatch[2]) 
    };
  }
  
  // Формат: ?q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    return { 
      lat: parseFloat(qMatch[1]), 
      lng: parseFloat(qMatch[2]) 
    };
  }
  
  return null;
}

function calculateDistance(coord1, coord2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = coord1.lat * Math.PI / 180;
  const φ2 = coord2.lat * Math.PI / 180;
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

async function runTests() {
  console.log('🧪 ТЕСТИРОВАНИЕ РАЗВОРОТА КОРОТКИХ ССЫЛОК\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📍 Тест ${i + 1}/${testCases.length}: ${test.name}`);
    console.log(`   Короткая: ${test.short}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:4321/api/expand-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: test.short })
      });
      
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      const actualUrl = data.expandedUrl || data.url;
      const method = data.method;
      
      // Извлекаем координаты
      const expectedCoords = extractCoordinates(test.expected);
      const actualCoords = extractCoordinates(actualUrl);
      
      let status = 'FAIL';
      let message = '';
      let distance = null;
      
      if (!actualUrl) {
        status = '❌ FAIL';
        message = 'Не получен развернутый URL';
      } else if (actualUrl === test.expected) {
        status = '✅ SUCCESS';
        message = 'Идеальное совпадение!';
      } else if (actualCoords && expectedCoords) {
        const latDiff = Math.abs(actualCoords.lat - expectedCoords.lat);
        const lngDiff = Math.abs(actualCoords.lng - expectedCoords.lng);
        distance = calculateDistance(expectedCoords, actualCoords);
        
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
          status = '✅ SUCCESS';
          message = `Координаты совпадают (расстояние: ${distance.toFixed(2)}m)`;
        } else if (latDiff < 0.001 && lngDiff < 0.001) {
          status = '⚠️  PARTIAL';
          message = `Координаты близки (расстояние: ${distance.toFixed(2)}m)`;
        } else {
          status = '❌ FAIL';
          message = `Координаты сильно отличаются (расстояние: ${distance.toFixed(2)}m)`;
        }
      } else {
        status = '❌ FAIL';
        message = 'Не удалось извлечь координаты';
      }
      
      console.log(`   Статус: ${status}`);
      console.log(`   Метод: ${method || 'unknown'}`);
      console.log(`   Время: ${duration}ms`);
      console.log(`   Сообщение: ${message}`);
      
      if (expectedCoords && actualCoords) {
        console.log(`   Ожидаемые координаты: ${expectedCoords.lat}, ${expectedCoords.lng}`);
        console.log(`   Полученные координаты: ${actualCoords.lat}, ${actualCoords.lng}`);
        console.log(`   Δlat: ${Math.abs(actualCoords.lat - expectedCoords.lat).toFixed(8)}`);
        console.log(`   Δlng: ${Math.abs(actualCoords.lng - expectedCoords.lng).toFixed(8)}`);
        if (distance !== null) {
          console.log(`   Расстояние: ${distance.toFixed(2)} метров`);
        }
      }
      
      if (actualUrl && actualUrl !== test.expected) {
        console.log(`   Полученный URL: ${actualUrl.substring(0, 100)}...`);
      }
      
      results.push({
        name: test.name,
        status: status.includes('SUCCESS') ? 'success' : status.includes('PARTIAL') ? 'partial' : 'fail',
        method,
        duration,
        distance,
        expectedCoords,
        actualCoords
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   Статус: ❌ ERROR`);
      console.log(`   Ошибка: ${error.message}`);
      console.log(`   Время: ${duration}ms`);
      
      results.push({
        name: test.name,
        status: 'error',
        error: error.message,
        duration
      });
    }
  }
  
  // Итоговая статистика
  console.log('\n' + '='.repeat(80));
  console.log('📊 ИТОГОВАЯ СТАТИСТИКА\n');
  
  const total = results.length;
  const successful = results.filter(r => r.status === 'success').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  console.log(`Всего тестов: ${total}`);
  console.log(`✅ Успешных: ${successful} (${Math.round(successful/total*100)}%)`);
  console.log(`⚠️  Частично: ${partial} (${Math.round(partial/total*100)}%)`);
  console.log(`❌ Ошибок: ${failed} (${Math.round(failed/total*100)}%)`);
  console.log(`🔴 Крашей: ${errors} (${Math.round(errors/total*100)}%)`);
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
  console.log(`\nСреднее время: ${Math.round(avgDuration)}ms`);
  
  const methodCounts = {};
  results.forEach(r => {
    if (r.method) {
      methodCounts[r.method] = (methodCounts[r.method] || 0) + 1;
    }
  });
  
  console.log('\nИспользованные методы:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`  - ${method}: ${count} раз (${Math.round(count/total*100)}%)`);
  });
  
  const avgDistance = results
    .filter(r => r.distance !== null && r.distance !== undefined)
    .reduce((sum, r, _, arr) => sum + r.distance / arr.length, 0);
  
  if (!isNaN(avgDistance)) {
    console.log(`\nСреднее расстояние от цели: ${avgDistance.toFixed(2)} метров`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Рекомендации
  console.log('\n💡 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ:\n');
  
  if (failed > 0 || errors > 0) {
    console.log('❌ Есть неуспешные тесты:');
    console.log('   1. Проверьте логи API для каждого метода');
    console.log('   2. Возможно нужно добавить больше fallback методов');
    console.log('   3. Проверьте работу парсинга координат из URL');
  }
  
  if (partial > 0) {
    console.log('⚠️  Есть частичные совпадения:');
    console.log('   1. Координаты близки, но не идентичны');
    console.log('   2. Возможно URL содержит дополнительные параметры');
    console.log('   3. Проверьте точность парсинга координат');
  }
  
  if (successful === total) {
    console.log('🎉 Отлично! Все тесты прошли успешно!');
    console.log('   Система работает стабильно и точно.');
  }
}

// Запуск тестов
console.log('⏳ Убедитесь что dev-сервер запущен (npm run dev)...\n');
setTimeout(() => {
  runTests().catch(console.error);
}, 1000);
