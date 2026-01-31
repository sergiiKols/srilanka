// Скрипт для анализа Plus Code библиотек

const https = require('https');

const libraries = [
  'open-location-code',
  'plus-codes',
  'olc',
  'pluscode',
  '@googlemaps/open-location-code'
];

async function fetchPackageInfo(packageName) {
  return new Promise((resolve) => {
    https.get(`https://registry.npmjs.org/${packageName}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function analyzeLibraries() {
  console.log('🔍 АНАЛИЗ БИБЛИОТЕК ДЛЯ PLUS CODE\n');
  console.log('='.repeat(80));
  
  for (const libName of libraries) {
    console.log(`\n📦 Проверяем: ${libName}`);
    
    const info = await fetchPackageInfo(libName);
    
    if (!info || info.error) {
      console.log(`   ❌ Пакет не найден`);
      continue;
    }
    
    const latest = info['dist-tags']?.latest;
    const version = info.versions?.[latest];
    
    if (!version) {
      console.log(`   ⚠️  Нет информации о версии`);
      continue;
    }
    
    console.log(`   ✅ Найден!`);
    console.log(`   Версия: ${latest}`);
    console.log(`   Описание: ${version.description || 'N/A'}`);
    console.log(`   Автор: ${version.author?.name || info.author?.name || 'N/A'}`);
    console.log(`   Лицензия: ${version.license || 'N/A'}`);
    
    // Статистика скачиваний
    if (info.time) {
      const dates = Object.keys(info.time).filter(k => k !== 'modified' && k !== 'created');
      console.log(`   Версий: ${dates.length}`);
      console.log(`   Создан: ${info.time.created?.substring(0, 10) || 'N/A'}`);
      console.log(`   Обновлен: ${info.time.modified?.substring(0, 10) || 'N/A'}`);
    }
    
    // Зависимости
    const deps = version.dependencies || {};
    const depsCount = Object.keys(deps).length;
    console.log(`   Зависимостей: ${depsCount}`);
    
    // Размер
    if (version.dist?.unpackedSize) {
      const sizeKB = Math.round(version.dist.unpackedSize / 1024);
      console.log(`   Размер: ${sizeKB} KB`);
    }
    
    // Репозиторий
    if (version.repository?.url) {
      console.log(`   Репозиторий: ${version.repository.url}`);
    }
    
    // Ключевые слова
    if (version.keywords && version.keywords.length > 0) {
      console.log(`   Теги: ${version.keywords.slice(0, 5).join(', ')}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 РЕКОМЕНДАЦИЯ:');
  console.log('   Используйте официальную библиотеку от Google:');
  console.log('   npm install open-location-code');
}

analyzeLibraries();
