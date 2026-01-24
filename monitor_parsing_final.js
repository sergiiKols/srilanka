import fs from 'fs';
import path from 'path';

const FINAL_FILE = 'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json';
const PUBLIC_FILE = 'public/SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json';
const CHECKPOINT_DIR = 'SRI/parsed_data/negombo_tangalle/checkpoints';

// Примерные затраты (Google Places API)
const COSTS = {
  nearbySearchCost: 0.005,  // $0.005 за запрос
  placeDetailsCost: 0.005,   // $0.005 за запрос
  tokenPerRequest: 50,       // примерно 50 токенов за запрос
};

function formatCost(requests) {
  const cost = requests * COSTS.nearbySearchCost;
  return cost.toFixed(4);
}

function formatTokens(requests) {
  const tokens = requests * COSTS.tokenPerRequest;
  return tokens.toLocaleString();
}

function checkParsing() {
  const checkpoints = fs.readdirSync(CHECKPOINT_DIR).filter(f => f.endsWith('.json')).length;
  
  console.log(`\n[${new Date().toLocaleTimeString()}] 📊 Проверка парсинга...`);
  console.log(`   Checkpoint файлов: ${checkpoints}`);
  
  if (fs.existsSync(FINAL_FILE)) {
    console.log('\n✅ ════════════════════════════════════════════════════════');
    console.log('✅ ПАРСИНГ ЗАВЕРШЕН!');
    console.log('✅ ════════════════════════════════════════════════════════\n');
    
    const data = JSON.parse(fs.readFileSync(FINAL_FILE, 'utf-8'));
    const count = Array.isArray(data) ? data.length : 1;
    
    // Копируем в public
    const dir = path.dirname(PUBLIC_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(FINAL_FILE, PUBLIC_FILE);
    console.log(`📁 Файл скопирован в public`);
    console.log(`\n📊 СТАТИСТИКА:`)
    console.log(`   ✅ Всего объектов: ${count.toLocaleString()}`);
    
    // Показываем распределение
    const categories = {};
    data.forEach(poi => {
      categories[poi.category] = (categories[poi.category] || 0) + 1;
    });
    
    console.log(`\n📋 Распределение по категориям:`);
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, cnt]) => {
        console.log(`   • ${cat}: ${cnt} объектов`);
      });
    
    // Примерные затраты (29 локаций × примерно 20 запросов на локацию)
    const estimatedRequests = 29 * 20;
    const estimatedCost = formatCost(estimatedRequests);
    const estimatedTokens = formatTokens(estimatedRequests);
    
    console.log(`\n💰 ПРИМЕРНЫЕ ЗАТРАТЫ:`);
    console.log(`   • API запросов: ${estimatedRequests.toLocaleString()}`);
    console.log(`   • Токенов истрачено: ${estimatedTokens}`);
    console.log(`   • Стоимость: $${estimatedCost}`);
    
    console.log(`\n🌐 ОТКРОЙТЕ: http://localhost:4321/`);
    console.log(`📝 Нажмите F5 для обновления`);
    console.log(`\n✅ ════════════════════════════════════════════════════════\n`);
    
    clearInterval(checkInterval);
    process.exit(0);
  }
}

console.log('📊 Мониторинг парсинга...');
console.log('⏱️  Проверка каждые 5 минут');
console.log('═══════════════════════════════════════════════════════\n');

// Первая проверка сразу
checkParsing();

// Затем каждые 5 минут
const checkInterval = setInterval(checkParsing, 5 * 60 * 1000);
