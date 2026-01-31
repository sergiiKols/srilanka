// Прямое тестирование методов разворачивания без запуска сервера

const testCases = [
  {
    name: "Billy Breeze Apartment",
    short: "https://maps.app.goo.gl/3k4khwBzm2tPtZKN6",
    expected: "https://www.google.com/maps/place/Billy+Breeze+Apartment,+Breeze+Travel+and+Rental+Service/@6.0490797,80.2882965,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae16db301085117:0xf38001c45ade651d!8m2!3d6.0490797!4d80.2882965!16s%2Fg%2F11try575rk?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D",
    expectedCoords: { lat: 6.0490797, lng: 80.2882965 }
  },
  {
    name: "Russian Guesthouse",
    short: "https://maps.app.goo.gl/KSZKYnL8PmKigKPe7?g_st=it",
    expected: "https://www.google.com/maps/place/Russian+Guesthouse/@5.9476101,80.4962569,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae13fb323a297bb:0xec3af956c6734232!8m2!3d5.9476101!4d80.4962569!16s%2Fg%2F11vj6qfk36!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D",
    expectedCoords: { lat: 5.9476101, lng: 80.4962569 }
  },
  {
    name: "La Casa Mirissa",
    short: "https://maps.app.goo.gl/pHPKpBLW2rRAMGHWA",
    expected: "https://www.google.com/maps/place/La+Casa+Mirissa/@5.9495294,80.4545732,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae1150a48618e9b:0xc92391dd0e2564d9!8m2!3d5.9495294!4d80.4545732!16s%2Fg%2F11st84s9r6?hl=en&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D",
    expectedCoords: { lat: 5.9495294, lng: 80.4545732 }
  },
  {
    name: "Dougies Hidden Place - Galle",
    short: "https://maps.app.goo.gl/NmjKGGQ7w8wfh2sC8?g_st=ic",
    expected: "https://www.google.com/maps/place/Dougies+Hidden+Place+-+Galle/@6.0456203,80.2089115,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae1737b16894e3f:0x8e5a8dbdadf6d45!8m2!3d6.0456203!4d80.2089115!16s%2Fg%2F11l2zyy04_!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D",
    expectedCoords: { lat: 6.0456203, lng: 80.2089115 }
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

// Метод 1: Прямой fetch с User-Agent
async function method1_DirectFetch(url) {
  try {
    console.log('   🔄 Метод 1: Прямой fetch с redirect...');
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.url && response.url !== url) {
      console.log(`   ✅ Метод 1 успешен: ${response.url.substring(0, 80)}...`);
      return { url: response.url, method: 'direct-fetch' };
    }
    console.log('   ❌ Метод 1 не сработал (URL не изменился)');
    return null;
  } catch (error) {
    console.log(`   ❌ Метод 1 ошибка: ${error.message}`);
    return null;
  }
}

// Метод 2: getlinkinfo.com API
async function method2_GetLinkInfo(url) {
  try {
    console.log('   🔄 Метод 2: getlinkinfo.com API...');
    const response = await fetch(`https://getlinkinfo.com/api/v1/link-info?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.url && data.url !== url) {
      console.log(`   ✅ Метод 2 успешен: ${data.url.substring(0, 80)}...`);
      return { url: data.url, method: 'getlinkinfo' };
    }
    console.log('   ❌ Метод 2 не сработал');
    return null;
  } catch (error) {
    console.log(`   ❌ Метод 2 ошибка: ${error.message}`);
    return null;
  }
}

// Метод 3: Парсинг HTML
async function method3_ParseHTML(url) {
  try {
    console.log('   🔄 Метод 3: Парсинг HTML...');
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Ищем canonical
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonicalMatch && canonicalMatch[1]) {
      console.log(`   ✅ Метод 3 успешен (canonical): ${canonicalMatch[1].substring(0, 80)}...`);
      return { url: canonicalMatch[1], method: 'html-canonical' };
    }
    
    // Ищем og:url
    const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
    if (ogUrlMatch && ogUrlMatch[1]) {
      console.log(`   ✅ Метод 3 успешен (og:url): ${ogUrlMatch[1].substring(0, 80)}...`);
      return { url: ogUrlMatch[1], method: 'html-og-url' };
    }
    
    console.log('   ❌ Метод 3 не нашел canonical или og:url');
    return null;
  } catch (error) {
    console.log(`   ❌ Метод 3 ошибка: ${error.message}`);
    return null;
  }
}

async function expandUrl(shortUrl) {
  const methods = [
    method1_DirectFetch,
    method2_GetLinkInfo,
    method3_ParseHTML
  ];
  
  for (const method of methods) {
    const result = await method(shortUrl);
    if (result) return result;
  }
  
  return null;
}

async function runTests() {
  console.log('🧪 ТЕСТИРОВАНИЕ РАЗВОРОТА КОРОТКИХ ССЫЛОК (Прямые методы)\n');
  console.log('='.repeat(80));
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n📍 Тест ${i + 1}/${testCases.length}: ${test.name}`);
    console.log(`   Короткая: ${test.short}`);
    console.log(`   Ожидаемые координаты: ${test.expectedCoords.lat}, ${test.expectedCoords.lng}`);
    
    const startTime = Date.now();
    
    try {
      const result = await expandUrl(test.short);
      const duration = Date.now() - startTime;
      
      if (!result) {
        console.log(`\n   ❌ РЕЗУЛЬТАТ: Все методы не сработали`);
        console.log(`   Время: ${duration}ms\n`);
        
        results.push({
          name: test.name,
          status: 'fail',
          message: 'Все методы не сработали',
          duration
        });
        continue;
      }
      
      const actualUrl = result.url;
      const method = result.method;
      const actualCoords = extractCoordinates(actualUrl);
      
      let status = 'fail';
      let message = '';
      let distance = null;
      
      if (!actualCoords) {
        status = 'fail';
        message = 'Не удалось извлечь координаты из URL';
      } else {
        const latDiff = Math.abs(actualCoords.lat - test.expectedCoords.lat);
        const lngDiff = Math.abs(actualCoords.lng - test.expectedCoords.lng);
        distance = calculateDistance(test.expectedCoords, actualCoords);
        
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
          status = 'success';
          message = `✅ Координаты совпадают идеально!`;
        } else if (latDiff < 0.001 && lngDiff < 0.001) {
          status = 'partial';
          message = `⚠️  Координаты близки`;
        } else {
          status = 'fail';
          message = `❌ Координаты сильно отличаются`;
        }
      }
      
      console.log(`\n   ${message}`);
      console.log(`   Метод: ${method}`);
      console.log(`   Время: ${duration}ms`);
      
      if (actualCoords) {
        console.log(`   Полученные координаты: ${actualCoords.lat}, ${actualCoords.lng}`);
        console.log(`   Δlat: ${Math.abs(actualCoords.lat - test.expectedCoords.lat).toFixed(8)}`);
        console.log(`   Δlng: ${Math.abs(actualCoords.lng - test.expectedCoords.lng).toFixed(8)}`);
        console.log(`   Расстояние: ${distance.toFixed(2)} метров`);
      }
      
      console.log(`   URL: ${actualUrl.substring(0, 100)}...`);
      console.log();
      
      results.push({
        name: test.name,
        status,
        method,
        duration,
        distance,
        expectedCoords: test.expectedCoords,
        actualCoords
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`\n   ❌ ОШИБКА: ${error.message}`);
      console.log(`   Время: ${duration}ms\n`);
      
      results.push({
        name: test.name,
        status: 'error',
        error: error.message,
        duration
      });
    }
  }
  
  // Итоговая статистика
  console.log('='.repeat(80));
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
  
  if (Object.keys(methodCounts).length > 0) {
    console.log('\nИспользованные методы:');
    Object.entries(methodCounts).forEach(([method, count]) => {
      console.log(`  - ${method}: ${count} раз (${Math.round(count/total*100)}%)`);
    });
  }
  
  const successfulResults = results.filter(r => r.distance !== null && r.distance !== undefined);
  if (successfulResults.length > 0) {
    const avgDistance = successfulResults.reduce((sum, r) => sum + r.distance, 0) / successfulResults.length;
    const maxDistance = Math.max(...successfulResults.map(r => r.distance));
    const minDistance = Math.min(...successfulResults.map(r => r.distance));
    
    console.log(`\nТочность координат:`);
    console.log(`  Среднее расстояние: ${avgDistance.toFixed(2)} м`);
    console.log(`  Минимальное: ${minDistance.toFixed(2)} м`);
    console.log(`  Максимальное: ${maxDistance.toFixed(2)} м`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Анализ и рекомендации
  console.log('\n📋 АНАЛИЗ РЕЗУЛЬТАТОВ:\n');
  
  if (successful === total) {
    console.log('🎉 ОТЛИЧНО! Все тесты прошли успешно!');
    console.log('   ✅ Система работает идеально');
    console.log('   ✅ Координаты извлекаются точно');
    console.log('   ✅ Все методы fallback не требуются\n');
  } else if (successful + partial === total) {
    console.log('👍 ХОРОШО! Все ссылки развернуты.');
    console.log('   ✅ Система работает стабильно');
    console.log('   ⚠️  Есть небольшие расхождения в координатах');
    console.log('   💡 Рекомендуется улучшить парсинг координат\n');
  } else if (successful + partial >= total * 0.5) {
    console.log('⚠️  СРЕДНЕ. Половина тестов успешна.');
    console.log('   ⚠️  Некоторые методы не работают');
    console.log('   💡 Нужно добавить больше fallback методов');
    console.log('   💡 Проверьте логи для понимания проблем\n');
  } else {
    console.log('❌ КРИТИЧНО! Большинство тестов провалено.');
    console.log('   ❌ Система требует доработки');
    console.log('   🔧 Нужно исправить методы разворачивания');
    console.log('   🔧 Возможно Google блокирует запросы\n');
  }
  
  console.log('💡 РЕКОМЕНДАЦИИ:\n');
  
  if (failed > 0 || errors > 0) {
    console.log('1. 🔧 Добавить больше методов разворачивания:');
    console.log('   - Использовать прокси сервисы');
    console.log('   - Попробовать другие unshorten API');
    console.log('   - Добавить Perplexity AI как последний fallback\n');
  }
  
  if (partial > 0) {
    console.log('2. 📍 Улучшить парсинг координат:');
    console.log('   - Проверить все возможные форматы URL');
    console.log('   - Добавить парсинг из HTML метатегов');
    console.log('   - Извлекать координаты из place_id\n');
  }
  
  if (Object.keys(methodCounts).length > 0) {
    const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];
    console.log(`3. 🎯 Оптимизировать порядок методов:`);
    console.log(`   - Самый успешный: ${topMethod[0]} (${topMethod[1]}/${total})`);
    console.log(`   - Рекомендуется поставить его первым\n`);
  }
  
  console.log('='.repeat(80));
}

// Запуск
runTests().catch(console.error);
