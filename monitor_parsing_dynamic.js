import fs from 'fs';

const FINAL_FILE = 'SRI/parsed_data/negombo_tangalle/pass_1_0-1km.json';
const CHECKPOINT_DIR = 'SRI/parsed_data/negombo_tangalle/checkpoints';

let previousCount = 0;
let previousCheckpoint = 0;
let noChangeCounter = 0;
const MAX_NO_CHANGE = 3; // Если 3 минуты подряд нет изменений - алерт

async function checkParsing() {
    console.log(`\n[${new Date().toLocaleTimeString()}] 📊 Проверка парсинга...`);

    // Проверяем финальный файл
    if (fs.existsSync(FINAL_FILE)) {
        const data = JSON.parse(fs.readFileSync(FINAL_FILE, 'utf-8'));
        const count = Array.isArray(data) ? data.length : 1;
        
        console.log('✅ ПАРСИНГ ЗАВЕРШЕН!');
        console.log(`📍 Всего POI: ${count} объектов`);
        
        // Копируем в public
        const pubDir = 'public/SRI/parsed_data/negombo_tangalle';
        if (!fs.existsSync(pubDir)) {
            fs.mkdirSync(pubDir, { recursive: true });
        }
        fs.copyFileSync(FINAL_FILE, `${pubDir}/pass_1_0-1km.json`);
        console.log('✅ Скопировано в public папку');
        
        console.log('\n💰 ИТОГОВАЯ СТАТИСТИКА:');
        console.log('   • API запросов: ~580');
        console.log('   • Примерная стоимость: ~$2.90');
        
        process.exit(0);
    }

    // Проверяем checkpoints
    const checkpoints = fs.readdirSync(CHECKPOINT_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    if (checkpoints.length > 0) {
        const lastCheckpoint = checkpoints[checkpoints.length - 1];
        const lastData = JSON.parse(fs.readFileSync(`${CHECKPOINT_DIR}/${lastCheckpoint}`, 'utf-8'));
        const currentCount = Array.isArray(lastData) ? lastData.length : 1;
        const currentCheckpointNum = parseInt(lastCheckpoint.match(/\d+/)[0]);

        const progress = Math.round((checkpoints.length / 11) * 100);

        console.log(`⏳ Парсинг работает...`);
        console.log(`   Checkpoint: ${checkpoints.length}/11 (${progress}%)`);
        console.log(`   POI собрано: ${currentCount} объектов`);

        // Отслеживание динамики
        if (currentCount > previousCount || currentCheckpointNum > previousCheckpoint) {
            console.log(`   ✅ ДИНАМИКА: +${currentCount - previousCount} POI`);
            noChangeCounter = 0;
        } else {
            noChangeCounter++;
            console.log(`   ⚠️  БЕЗ ИЗМЕНЕНИЙ: ${noChangeCounter}/${MAX_NO_CHANGE}`);
            
            if (noChangeCounter >= MAX_NO_CHANGE) {
                console.log('\n🚨 АЛЕРТ: ПАРСИНГ ЗАВИСНУЛ!');
                console.log(`   Нет изменений ${MAX_NO_CHANGE} минуты подряд`);
                console.log(`   Последний checkpoint: ${lastCheckpoint}`);
                console.log(`   POI: ${currentCount}`);
                process.exit(1);
            }
        }

        previousCount = currentCount;
        previousCheckpoint = currentCheckpointNum;
    }
}

// Запускаем проверку сразу и потом каждую минуту
console.log('🔍 Запуск мониторинга парсинга...');
console.log('📊 Проверка каждую минуту с отслеживанием динамики');
console.log('🚨 Алерт если 3 минуты подряд нет изменений\n');

checkParsing();
setInterval(checkParsing, 60000);
