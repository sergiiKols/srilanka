// Тест Perplexity AI для декодирования короткого Plus Code

const https = require('https');

const API_KEY = 'pplx-n0SWzD02rb1OwjfLZoVjA6uoUNOFfAg5FEsU64qO8w7fQFI';

async function askPerplexityForCoordinates(plusCode, cityName) {
  return new Promise((resolve, reject) => {
    const prompt = `Convert this Google Maps Plus Code to exact coordinates (latitude, longitude):
Plus Code: ${plusCode}
Location: ${cityName}, Sri Lanka

Return ONLY the coordinates in this exact format: lat,lng
Example: 6.0123,80.4567`;

    const data = JSON.stringify({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const options = {
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          const answer = json.choices[0].message.content;
          
          // Извлекаем координаты из ответа
          const coordMatch = answer.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
          
          if (coordMatch) {
            resolve({
              lat: parseFloat(coordMatch[1]),
              lng: parseFloat(coordMatch[2]),
              rawAnswer: answer
            });
          } else {
            resolve({ error: 'Could not parse coordinates', rawAnswer: answer });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function test() {
  console.log('🧪 ТЕСТ: Perplexity AI для декодирования короткого Plus Code\n');
  console.log('='.repeat(80));
  
  const testCase = {
    name: 'Russian Guesthouse',
    plusCode: 'WFX7+22W',
    city: 'Mirissa',
    expected: { lat: 5.9476101, lng: 80.4962569 }
  };
  
  console.log(`\n📍 Тест: ${testCase.name}`);
  console.log(`   Plus Code: ${testCase.plusCode}`);
  console.log(`   Город: ${testCase.city}`);
  console.log(`   Ожидаемые координаты: ${testCase.expected.lat}, ${testCase.expected.lng}`);
  
  console.log('\n🤖 Отправляем запрос в Perplexity AI...\n');
  
  const startTime = Date.now();
  
  try {
    const result = await askPerplexityForCoordinates(testCase.plusCode, testCase.city);
    const duration = Date.now() - startTime;
    
    console.log('📥 Ответ от Perplexity:');
    console.log(`   Raw: ${result.rawAnswer}`);
    
    if (result.error) {
      console.log(`\n❌ Ошибка: ${result.error}`);
      return;
    }
    
    console.log(`\n✅ Извлеченные координаты: ${result.lat}, ${result.lng}`);
    console.log(`   Время выполнения: ${duration} мс`);
    
    const distance = calculateDistance(
      result.lat,
      result.lng,
      testCase.expected.lat,
      testCase.expected.lng
    );
    
    console.log(`\n📏 Анализ точности:`);
    console.log(`   Ожидаемые: ${testCase.expected.lat}, ${testCase.expected.lng}`);
    console.log(`   Полученные: ${result.lat}, ${result.lng}`);
    console.log(`   Погрешность: ${distance.toFixed(2)} м`);
    
    let status;
    if (distance < 20) {
      status = '🎯 ОТЛИЧНО!';
    } else if (distance < 100) {
      status = '✅ ХОРОШО!';
    } else if (distance < 1000) {
      status = '⚠️ ПРИЕМЛЕМО';
    } else {
      status = '❌ ПЛОХО';
    }
    
    console.log(`   Статус: ${status}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 ВЫВОДЫ:\n');
    
    if (distance < 100) {
      console.log('✅ Perplexity AI отлично справляется с короткими Plus Code!');
      console.log('   Точность намного лучше чем восстановление через reference координаты.');
      console.log(`   Погрешность: ${distance.toFixed(2)} м vs 3724 м (наш метод)`);
      console.log('\n🎯 РЕКОМЕНДАЦИЯ: Использовать Perplexity для коротких Plus Code (< 10 символов)');
    } else if (distance < 1000) {
      console.log('⚠️ Perplexity AI дает приемлемую точность.');
      console.log(`   Погрешность: ${distance.toFixed(2)} м vs 3724 м (наш метод)`);
      console.log('   Все равно лучше чем наш текущий метод!');
      console.log('\n🎯 РЕКОМЕНДАЦИЯ: Можно использовать как fallback');
    } else {
      console.log('❌ Perplexity AI не дал точного результата.');
      console.log(`   Погрешность: ${distance.toFixed(2)} м`);
      console.log('   Нужно искать другие решения.');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Ошибка при запросе к Perplexity AI:');
    console.error(error);
  }
}

test();
